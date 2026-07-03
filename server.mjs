import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 8791);
const rooms = new Map();
const MAX_STATE_BYTES = 64 * 1024;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const IMAGE_GROUPS = ["locations", "npcs", "materials", "players"];
const ROOM_TEMPLATE_IDS = ["mist-blood-van", "blank-stage"];
const DEFAULT_TEMPLATE_ID = "mist-blood-van";
const TEMPLATE_DEFAULTS = {
  "mist-blood-van": {
    initialLocationId: "campus",
    roomMeta: {
      title: "雾中献血车",
      subtitle: "玩家舞台",
      playerNotice: "跟随 KP 的舞台变化查看当前场景、人物与公开线索。"
    }
  },
  "blank-stage": {
    initialLocationId: "blank-hall",
    roomMeta: {
      title: "空白房间",
      subtitle: "自定义舞台",
      playerNotice: "等待 KP 配置当前场景与公开信息。"
    }
  }
};

function emptyCustomImages() {
  return {
    locations: {},
    npcs: {},
    materials: {},
    players: {}
  };
}

function isTemplateId(value) {
  return typeof value === "string" && ROOM_TEMPLATE_IDS.includes(value);
}

function templateDefaults(templateId = DEFAULT_TEMPLATE_ID) {
  return TEMPLATE_DEFAULTS[isTemplateId(templateId) ? templateId : DEFAULT_TEMPLATE_ID];
}

function defaultRoomMeta(templateId = DEFAULT_TEMPLATE_ID) {
  return { ...templateDefaults(templateId).roomMeta };
}

function emptyCustomText() {
  return {
    roomMeta: {},
    locations: {},
    npcs: {},
    materials: {},
    players: {}
  };
}

const defaultState = {
  locationId: "campus",
  npcId: null,
  materialId: null,
  playerIds: [],
  notesOpen: false
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf"
};

function sendJson(response, status, value) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(value));
}

function roomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function assetId() {
  return randomBytes(12).toString("base64url");
}

function createRoomState(templateId = DEFAULT_TEMPLATE_ID) {
  const template = templateDefaults(templateId);
  return {
    ...defaultState,
    templateId: isTemplateId(templateId) ? templateId : DEFAULT_TEMPLATE_ID,
    locationId: template.initialLocationId,
    customImages: emptyCustomImages(),
    roomMeta: defaultRoomMeta(templateId),
    customText: emptyCustomText()
  };
}

function makeRoom(templateId = DEFAULT_TEMPLATE_ID) {
  let code = roomCode();
  while (rooms.has(code)) code = roomCode();
  const room = {
    code,
    hostKey: randomBytes(18).toString("base64url"),
    state: createRoomState(templateId),
    assets: new Map(),
    revision: 0,
    updatedAt: Date.now(),
    clients: new Set()
  };
  rooms.set(code, room);
  return room;
}

function publicRoom(room) {
  return {
    room: room.code,
    state: room.state,
    revision: room.revision,
    updatedAt: room.updatedAt
  };
}

function broadcast(room) {
  const message = `event: stage\ndata: ${JSON.stringify(publicRoom(room))}\n\n`;
  room.clients.forEach((client) => client.write(message));
}

async function readBody(request, limit = MAX_STATE_BYTES) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new Error("请求内容过大");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function sanitizeCustomImages(value) {
  const next = emptyCustomImages();
  if (!value || typeof value !== "object") return next;
  IMAGE_GROUPS.forEach((group) => {
    const source = value[group];
    if (!source || typeof source !== "object") return;
    Object.entries(source).forEach(([id, url]) => {
      if (
        typeof id === "string" &&
        id.length > 0 &&
        id.length <= 80 &&
        typeof url === "string" &&
        url.startsWith("/api/rooms/") &&
        url.length <= 240
      ) {
        next[group][id] = url;
      }
    });
  });
  return next;
}

function sanitizeRoomMeta(value, templateId = DEFAULT_TEMPLATE_ID) {
  const next = defaultRoomMeta(templateId);
  if (!value || typeof value !== "object") return next;
  if (typeof value.title === "string") next.title = value.title;
  if (typeof value.subtitle === "string") next.subtitle = value.subtitle;
  if (typeof value.playerNotice === "string") next.playerNotice = value.playerNotice;
  return next;
}

function sanitizePartialRecord(value, allowedKeys) {
  const next = {};
  if (!value || typeof value !== "object") return next;
  allowedKeys.forEach((key) => {
    if (typeof value[key] === "string") next[key] = value[key];
  });
  return next;
}

function sanitizeContentMap(value, allowedKeys) {
  const next = {};
  if (!value || typeof value !== "object") return next;
  Object.entries(value).forEach(([id, item]) => {
    if (typeof id !== "string" || !item || typeof item !== "object") return;
    const sanitized = sanitizePartialRecord(item, allowedKeys);
    if (Object.keys(sanitized).length > 0) next[id] = sanitized;
  });
  return next;
}

function sanitizeCustomText(value) {
  const next = emptyCustomText();
  if (!value || typeof value !== "object") return next;
  next.roomMeta = sanitizePartialRecord(value.roomMeta, ["title", "subtitle", "playerNotice"]);
  next.locations = sanitizeContentMap(value.locations, ["name", "time", "mood", "background"]);
  next.npcs = sanitizeContentMap(value.npcs, ["name", "role", "intro", "portrait"]);
  next.materials = sanitizeContentMap(value.materials, ["name", "role", "description", "image"]);
  next.players = sanitizeContentMap(value.players, ["name", "identity", "avatar"]);
  return next;
}

function parseImageDataUrl(value) {
  if (typeof value !== "string") throw new Error("缺少图片数据");
  const match = value.match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i);
  if (!match) throw new Error("图片格式无效");
  const mimeType = match[1].toLowerCase();
  const content = Buffer.from(match[2].replace(/\s+/g, ""), "base64");
  if (!mimeType.startsWith("image/")) throw new Error("只支持图片文件");
  if (!content.length) throw new Error("图片内容为空");
  if (content.length > MAX_UPLOAD_BYTES) throw new Error("图片不能超过 5MB");
  return { mimeType, content };
}

function matchRoom(pathname, suffix = "") {
  const pattern = new RegExp(`^/api/rooms/([A-Z2-9]{6})${suffix}$`);
  return pathname.match(pattern);
}

async function handleApi(request, response, url) {
  if (request.method === "POST" && url.pathname === "/api/rooms") {
    const body = await readBody(request).catch(() => ({}));
    const room = makeRoom(body.templateId);
    sendJson(response, 201, {
      ...publicRoom(room),
      hostKey: room.hostKey,
      hostUrl: `/kp-site/?room=${room.code}&key=${room.hostKey}`,
      playerUrl: `/player/?room=${room.code}`
    });
    return true;
  }

  const assetUploadMatch = matchRoom(url.pathname, "/assets");
  if (request.method === "POST" && assetUploadMatch) {
    const room = rooms.get(assetUploadMatch[1]);
    if (!room) {
      sendJson(response, 404, { error: "房间不存在或服务已重启" });
      return true;
    }
    try {
      const body = await readBody(request, Math.ceil(MAX_UPLOAD_BYTES * 1.5));
      if (body.hostKey !== room.hostKey) {
        sendJson(response, 403, { error: "只有创建房间的 KP 可以上传图片" });
        return true;
      }
      if (!IMAGE_GROUPS.includes(body.targetType)) {
        sendJson(response, 400, { error: "图片目标类型无效" });
        return true;
      }
      if (typeof body.targetId !== "string" || body.targetId.length < 1 || body.targetId.length > 80) {
        sendJson(response, 400, { error: "图片目标标识无效" });
        return true;
      }
      const image = parseImageDataUrl(body.dataUrl);
      const id = assetId();
      room.assets.set(id, image);
      room.updatedAt = Date.now();
      sendJson(response, 201, {
        assetId: id,
        url: `/api/rooms/${room.code}/assets/${id}`
      });
    } catch (error) {
      sendJson(response, 400, { error: error.message || "上传图片失败" });
    }
    return true;
  }

  const assetMatch = url.pathname.match(/^\/api\/rooms\/([A-Z2-9]{6})\/assets\/([A-Za-z0-9_-]+)$/);
  if (request.method === "GET" && assetMatch) {
    const room = rooms.get(assetMatch[1]);
    const asset = room?.assets.get(assetMatch[2]);
    if (!room || !asset) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("图片不存在");
      return true;
    }
    response.writeHead(200, {
      "content-type": asset.mimeType,
      "cache-control": "no-store",
      "content-length": asset.content.length
    });
    response.end(asset.content);
    return true;
  }

  const stateMatch = matchRoom(url.pathname, "/state");
  if (stateMatch) {
    const room = rooms.get(stateMatch[1]);
    if (!room) {
      sendJson(response, 404, { error: "房间不存在或服务已重启" });
      return true;
    }

    if (request.method === "GET") {
      sendJson(response, 200, publicRoom(room));
      return true;
    }

    if (request.method === "POST") {
      try {
        const body = await readBody(request);
        if (body.hostKey !== room.hostKey) {
          sendJson(response, 403, { error: "只有创建房间的 KP 可以控制舞台" });
          return true;
        }
        const nextState = body.state || {};
        const template = templateDefaults(room.state.templateId);
        room.state = {
          templateId: room.state.templateId,
          locationId: String(nextState.locationId || template.initialLocationId),
          npcId: nextState.npcId ? String(nextState.npcId) : null,
          materialId: nextState.materialId ? String(nextState.materialId) : null,
          playerIds: Array.isArray(nextState.playerIds) ? nextState.playerIds.map(String).slice(0, 12) : [],
          notesOpen: false,
          customImages: sanitizeCustomImages(nextState.customImages),
          roomMeta: sanitizeRoomMeta(nextState.roomMeta, room.state.templateId),
          customText: sanitizeCustomText(nextState.customText)
        };
        room.revision += 1;
        room.updatedAt = Date.now();
        broadcast(room);
        sendJson(response, 200, publicRoom(room));
      } catch (error) {
        sendJson(response, 400, { error: error.message || "无法读取舞台状态" });
      }
      return true;
    }
  }

  const eventsMatch = matchRoom(url.pathname, "/events");
  if (request.method === "GET" && eventsMatch) {
    const room = rooms.get(eventsMatch[1]);
    if (!room) {
      sendJson(response, 404, { error: "房间不存在或服务已重启" });
      return true;
    }
    response.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive"
    });
    response.write(`event: stage\ndata: ${JSON.stringify(publicRoom(room))}\n\n`);
    room.clients.add(response);
    const heartbeat = setInterval(() => response.write(": keep-alive\n\n"), 20000);
    request.on("close", () => {
      clearInterval(heartbeat);
      room.clients.delete(response);
    });
    return true;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(response, 404, { error: "接口不存在" });
    return true;
  }
  return false;
}

const distRoot = join(root, "dist");

// 在指定根目录下尝试提供静态文件；命中并写出响应时返回 true。
async function tryServeFrom(response, baseDir, safePath) {
  let filePath = join(baseDir, safePath);
  if (!filePath.startsWith(baseDir)) return false;
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = join(filePath, "index.html");
    const content = await readFile(filePath);
    response.writeHead(200, {
      "content-type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
      "cache-control": extname(filePath) === ".html" ? "no-cache" : "public, max-age=3600"
    });
    response.end(content);
    return true;
  } catch {
    return false;
  }
}

// 优先提供 Vite 构建产物（dist/），未迁移的页面与模组资源回退到项目根目录。
async function serveStatic(response, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(decodeURIComponent(requested)).replace(/^(\.\.(\/|\\|$))+/, "");
  if (await tryServeFrom(response, distRoot, safePath)) return;
  if (await tryServeFrom(response, root, safePath)) return;
  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("页面不存在");
}

const server = createServer((request, response) => {
  (async () => {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    if (await handleApi(request, response, url)) return;
    await serveStatic(response, url.pathname);
  })().catch((error) => {
    console.error("请求处理失败：", error);
    if (!response.headersSent) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    }
    response.end("服务器内部错误");
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`COC 房间平台已启动：http://localhost:${port}`);
});

setInterval(() => {
  const cutoff = Date.now() - 12 * 60 * 60 * 1000;
  rooms.forEach((room, code) => {
    if (room.updatedAt < cutoff && room.clients.size === 0) rooms.delete(code);
  });
}, 30 * 60 * 1000).unref();
