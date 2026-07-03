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
const ROOM_TEMPLATE_IDS = ["mist-blood-van", "blank-stage", "custom-template"];
const DEFAULT_TEMPLATE_ID = "mist-blood-van";
const CUSTOM_TEMPLATE_ID = "custom-template";
const TEMPLATE_DEFAULTS = {
  "mist-blood-van": {
    initialStage: {
      locationId: "campus",
      npcId: null,
      materialId: null,
      playerIds: []
    },
    roomMeta: {
      title: "雾中献血车",
      subtitle: "玩家舞台",
      playerNotice: "跟随 KP 的舞台变化查看当前场景、人物与公开线索。"
    }
  },
  "blank-stage": {
    initialStage: {
      locationId: "blank-hall",
      npcId: null,
      materialId: null,
      playerIds: []
    },
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

function isBuiltinTemplateId(value) {
  return value === "mist-blood-van" || value === "blank-stage";
}

function templateDefaults(templateId = DEFAULT_TEMPLATE_ID) {
  return TEMPLATE_DEFAULTS[isBuiltinTemplateId(templateId) ? templateId : DEFAULT_TEMPLATE_ID];
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

function createRoomState(templateId = DEFAULT_TEMPLATE_ID, templateData = null) {
  const activeTemplateId = templateData ? CUSTOM_TEMPLATE_ID : isBuiltinTemplateId(templateId) ? templateId : DEFAULT_TEMPLATE_ID;
  const template = templateData || templateDefaults(activeTemplateId);
  return {
    ...defaultState,
    templateId: activeTemplateId,
    templateData,
    locationId: template.initialStage.locationId,
    npcId: template.initialStage.npcId,
    materialId: template.initialStage.materialId,
    playerIds: template.initialStage.playerIds,
    customImages: emptyCustomImages(),
    roomMeta: templateData ? { ...templateData.roomMeta } : defaultRoomMeta(activeTemplateId),
    customText: emptyCustomText()
  };
}

function makeRoom(templateId = DEFAULT_TEMPLATE_ID, templateData = null) {
  let code = roomCode();
  while (rooms.has(code)) code = roomCode();
  const room = {
    code,
    hostKey: randomBytes(18).toString("base64url"),
    state: createRoomState(templateId, templateData),
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

function sanitizeString(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function sanitizeIdentifier(value, fallback) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

function sanitizeTemplateLocations(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => sanitizeTemplateLocation(item, index))
    .filter(Boolean);
}

function sanitizeTemplateLocation(value, index) {
  if (!value || typeof value !== "object") return null;
  return {
    id: sanitizeIdentifier(value.id, `location-${index + 1}`),
    name: sanitizeString(value.name, `场景 ${index + 1}`),
    time: typeof value.time === "string" ? value.time : "",
    mood: typeof value.mood === "string" ? value.mood : "",
    background: typeof value.background === "string" ? value.background : "/assets/locations/oxford-campus-bg.png",
    goal: typeof value.goal === "string" ? value.goal : "",
    read: typeof value.read === "string" ? value.read : "",
    beats: Array.isArray(value.beats) ? value.beats.filter((item) => typeof item === "string").slice(0, 12) : []
  };
}

function sanitizeTemplateNpcs(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => sanitizeTemplateNpc(item, index))
    .filter(Boolean);
}

function sanitizeTemplateNpc(value, index) {
  if (!value || typeof value !== "object") return null;
  return {
    id: sanitizeIdentifier(value.id, `npc-${index + 1}`),
    initial: typeof value.initial === "string" ? value.initial : String(index + 1),
    intro: typeof value.intro === "string" ? value.intro : "",
    name: sanitizeString(value.name, `NPC ${index + 1}`),
    note: typeof value.note === "string" ? value.note : "",
    portrait: typeof value.portrait === "string" ? value.portrait : "",
    role: typeof value.role === "string" ? value.role : ""
  };
}

function sanitizeTemplateMaterials(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => sanitizeTemplateMaterial(item, index))
    .filter(Boolean);
}

function sanitizeTemplateMaterial(value, index) {
  if (!value || typeof value !== "object") return null;
  return {
    id: sanitizeIdentifier(value.id, `material-${index + 1}`),
    description: typeof value.description === "string" ? value.description : "",
    image: typeof value.image === "string" ? value.image : "",
    name: sanitizeString(value.name, `素材 ${index + 1}`),
    note: typeof value.note === "string" ? value.note : "",
    role: typeof value.role === "string" ? value.role : ""
  };
}

function sanitizeTemplatePlayers(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => sanitizeTemplatePlayer(item, index))
    .filter(Boolean);
}

function sanitizeTemplatePlayer(value, index) {
  if (!value || typeof value !== "object") return null;
  return {
    id: sanitizeIdentifier(value.id, `player-${index + 1}`),
    avatar: typeof value.avatar === "string" ? value.avatar : "",
    description: typeof value.description === "string" ? value.description : "",
    initial: typeof value.initial === "string" ? value.initial : String(index + 1),
    name: sanitizeString(value.name, `席位 ${index + 1}`),
    role: typeof value.role === "string" ? value.role : "玩家席位"
  };
}

function sanitizeTemplateRoomMeta(value, fallbackName) {
  const source = value && typeof value === "object" ? value : {};
  return {
    title: sanitizeString(source.title, fallbackName),
    subtitle: typeof source.subtitle === "string" ? source.subtitle : "玩家舞台",
    playerNotice: typeof source.playerNotice === "string" ? source.playerNotice : "跟随 KP 的舞台变化查看当前场景、人物与公开线索。"
  };
}

function sanitizePublicMaterialIds(value, materialIds) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string" && materialIds.has(item)).slice(0, 48);
}

function sanitizeInitialStage(value, context) {
  const source = value && typeof value === "object" ? value : {};
  return {
    locationId: typeof source.locationId === "string" && context.locationIds.has(source.locationId)
      ? source.locationId
      : context.fallbackLocationId,
    npcId: typeof source.npcId === "string" && context.npcIds.has(source.npcId) ? source.npcId : null,
    materialId: typeof source.materialId === "string" && context.materialIds.has(source.materialId)
      ? source.materialId
      : null,
    playerIds: Array.isArray(source.playerIds)
      ? source.playerIds.filter((item) => typeof item === "string" && context.playerIds.has(item)).slice(0, 12)
      : []
  };
}

function sanitizeTemplateData(value) {
  if (!value || typeof value !== "object") return null;
  const locations = sanitizeTemplateLocations(value.locations);
  const npcs = sanitizeTemplateNpcs(value.npcs);
  const materials = sanitizeTemplateMaterials(value.materials);
  const players = sanitizeTemplatePlayers(value.players);
  if (locations.length === 0) return null;

  const locationIds = new Set(locations.map((item) => item.id));
  const npcIds = new Set(npcs.map((item) => item.id));
  const materialIds = new Set(materials.map((item) => item.id));
  const playerIds = new Set(players.map((item) => item.id));
  const name = sanitizeString(value.name, "导入模板");

  return {
    name,
    description: sanitizeString(value.description, "从模板文件导入的房间模板。"),
    roomMeta: sanitizeTemplateRoomMeta(value.roomMeta, name),
    initialStage: sanitizeInitialStage(value.initialStage, {
      fallbackLocationId: locations[0].id,
      locationIds,
      npcIds,
      materialIds,
      playerIds
    }),
    locations,
    npcs,
    materials,
    publicMaterialIds: sanitizePublicMaterialIds(value.publicMaterialIds, materialIds),
    players
  };
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
    const templateData = sanitizeTemplateData(body.templateData);
    const room = makeRoom(templateData ? CUSTOM_TEMPLATE_ID : body.templateId, templateData);
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
        const template = room.state.templateData || templateDefaults(room.state.templateId);
        const locationIds = new Set(template.locations.map((item) => item.id));
        const npcIds = new Set(template.npcs.map((item) => item.id));
        const materialIds = new Set(template.materials.map((item) => item.id));
        const playerIds = new Set(template.players.map((item) => item.id));
        room.state = {
          templateId: room.state.templateId,
          templateData: room.state.templateData,
          locationId:
            typeof nextState.locationId === "string" && locationIds.has(nextState.locationId)
              ? nextState.locationId
              : template.initialStage.locationId,
          npcId:
            typeof nextState.npcId === "string" && npcIds.has(nextState.npcId)
              ? nextState.npcId
              : template.initialStage.npcId,
          materialId:
            typeof nextState.materialId === "string" && materialIds.has(nextState.materialId)
              ? nextState.materialId
              : template.initialStage.materialId,
          playerIds: Array.isArray(nextState.playerIds)
            ? nextState.playerIds
                .map(String)
                .filter((id) => playerIds.has(id))
                .slice(0, 12)
            : template.initialStage.playerIds,
          notesOpen: false,
          customImages: sanitizeCustomImages(nextState.customImages),
          roomMeta: room.state.templateData
            ? sanitizeTemplateRoomMeta(nextState.roomMeta, room.state.templateData.roomMeta.title)
            : sanitizeRoomMeta(nextState.roomMeta, room.state.templateId),
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
