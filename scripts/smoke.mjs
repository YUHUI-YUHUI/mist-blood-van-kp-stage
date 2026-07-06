import { strict as assert } from "node:assert";
import { spawn } from "node:child_process";
import { once } from "node:events";

const port = 8791 + Math.floor(Math.random() * 200);
const baseUrl = `http://127.0.0.1:${port}`;

const customTemplate = {
  name: "烟港夜谈",
  description: "用于 smoke test 的自定义模板。",
  roomMeta: {
    title: "烟港夜谈",
    subtitle: "模板导入校验",
    playerNotice: "这是导入模板后的公开提示语。",
  },
  initialStage: {
    locationId: "dock",
    npcId: "ferryman",
    materialId: "letter",
    playerIds: ["p1"],
  },
  locations: [
    {
      id: "dock",
      name: "雾港码头",
      time: "22:10",
      mood: "海雾、煤油灯、潮水拍岸。",
      background: "/assets/locations/thames-river-bay-bg.png",
      goal: "验证自定义模板地点能被初始化。",
      read: "码头边的木桩还滴着水，灯火在雾里晃得发黄。",
      beats: ["到达码头", "发现信件", "摆渡人现身"],
    },
  ],
  npcs: [
    {
      id: "ferryman",
      initial: "F",
      intro: "守着潮汐时刻表的摆渡人。",
      name: "摆渡人",
      note: "用于 smoke test 的 NPC。",
      portrait: "/assets/npc/prequel/yu-hui.png",
      role: "线人",
    },
  ],
  materials: [
    {
      id: "letter",
      description: "一封沾了海水的短笺。",
      image: "/assets/handouts/prequel/handout-08-yuhui-email.png",
      name: "潮湿的信件",
      note: "用于 smoke test 的素材。",
      role: "公开线索",
    },
  ],
  publicMaterialIds: ["letter"],
  players: [
    {
      id: "p1",
      avatar: "",
      description: "带着疑问来到码头的人。",
      initial: "1",
      name: "调查员甲",
      role: "玩家席位",
    },
  ],
};

const tinyPngDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn0jY4AAAAASUVORK5CYII=";

async function main() {
  const server = spawn(process.execPath, ["server.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  server.stdout.on("data", (chunk) => {
    output += String(chunk);
  });
  server.stderr.on("data", (chunk) => {
    output += String(chunk);
  });

  try {
    await waitForServer();
    await verifyPages();
    const defaultRoom = await createRoom({ templateId: "mist-blood-van" });
    assert.equal(defaultRoom.state.templateId, "mist-blood-van");
    assert.equal(defaultRoom.state.locationId, "campus");

    const blankRoom = await createRoom({ templateId: "blank-stage" });
    assert.equal(blankRoom.state.templateId, "blank-stage");
    assert.equal(blankRoom.state.locationId, "blank-hall");

    const customRoom = await createRoom({
      templateId: "custom-template",
      templateData: customTemplate,
    });
    assert.equal(customRoom.state.templateId, "custom-template");
    assert.equal(customRoom.state.locationId, "dock");
    assert.equal(customRoom.state.templateData?.name, "烟港夜谈");

    const pushedState = await requestJson(`/api/rooms/${customRoom.room}/state`, {
      method: "POST",
      body: JSON.stringify({
        hostKey: customRoom.hostKey,
        state: {
          ...customRoom.state,
          roomMeta: {
            ...customRoom.state.roomMeta,
            title: "烟港夜谈·已同步",
          },
          customText: {
            ...customRoom.state.customText,
            materials: {
              letter: {
                name: "改名后的信件",
                description: "同步后的公开描述。",
              },
            },
          },
        },
      }),
    });
    assert.equal(pushedState.state.roomMeta.title, "烟港夜谈·已同步");
    assert.equal(pushedState.state.customText.materials.letter.name, "改名后的信件");

    const upload = await requestJson(`/api/rooms/${customRoom.room}/assets`, {
      method: "POST",
      body: JSON.stringify({
        hostKey: customRoom.hostKey,
        targetType: "materials",
        targetId: "letter",
        dataUrl: tinyPngDataUrl,
      }),
    });
    assert.match(upload.url, /^\/api\/rooms\/[A-Z2-9]{6}\/assets\//);

    const assetResponse = await fetch(`${baseUrl}${upload.url}`);
    assert.equal(assetResponse.status, 200);
    assert.match(assetResponse.headers.get("content-type") || "", /^image\/png/);

    console.log("Smoke test passed");
  } finally {
    server.kill("SIGTERM");
    await once(server, "exit").catch(() => undefined);
  }

  async function waitForServer() {
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      try {
        const response = await fetch(`${baseUrl}/`);
        if (response.ok) return;
      } catch {
        // retry
      }
      await delay(150);
    }
    throw new Error(`服务器未在预期时间内启动。\n${output}`);
  }
}

async function verifyPages() {
  const home = await fetch(`${baseUrl}/`);
  const homeHtml = await home.text();
  assert.equal(home.status, 200);
  assert.match(homeHtml, /秘仪室/);

  const kp = await fetch(`${baseUrl}/kp-site/`);
  const kpHtml = await kp.text();
  assert.equal(kp.status, 200);
  assert.match(kpHtml, /root/);

  const player = await fetch(`${baseUrl}/player/`);
  const playerHtml = await player.text();
  assert.equal(player.status, 200);
  assert.match(playerHtml, /root/);
}

async function createRoom(payload) {
  return requestJson("/api/rooms", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function requestJson(pathname, init = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  assert.ok(response.ok, data?.error || `请求失败: ${pathname}`);
  return data;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
