const locations = [
  {
    id: "campus",
    name: "校园献血点",
    time: "19:10",
    mood: "雨后石板、白色献血帐篷、短暂停电",
    image: "../assets/locations/oxford-campus-bg.png",
    goal: "让调查员确认 Henry Lane 失踪不是误会，并锁定提前撤离的献血车。",
    read:
      "学院中庭的石板还湿着，临时献血帐篷里有热茶和消毒水味。灯光短暂熄灭又亮起时，刚刚说冷藏箱里有声音的 Henry Lane 不见了。R-13 冷藏箱外壳裂开一道白缝，献血车正在收线。",
    beats: [
      "登记桌、采血区、休息长椅、冷藏箱四处可以分头搜。",
      "医院工作人员声称 Henry Lane 低血糖，被送去休息。",
      "彼得·周能提供登记表和 Henry Lane 最后位置。",
      "冷藏箱内侧有白色黏液和海腥味。"
    ]
  },
  {
    id: "tent",
    name: "临时医务帐篷",
    time: "19:35",
    mood: "折叠床、标签打印机、未锁屏电脑",
    image: "../assets/radcliffe-infirmary-exterior.png",
    goal: "让调查员与艾米交涉，并拿到第一个明确关键词 V-RH null。",
    read:
      "医务帐篷里的采血包还没有收完，标签打印机吐出半截纸条。笔记本屏幕停在拉德克里夫医院内网页面，最后三行名单被红色标记。艾米·贝尔的手按在合页文件夹上，指节发白。",
    beats: [
      "艾米先否认，只承认自己负责抽血。",
      "承诺优先救 Henry Lane，她会说出冷藏箱里像有婴儿哭声。",
      "电脑不是唯一通路，标签残片和转运单可在桌面或垃圾袋里找到。"
    ]
  },
  {
    id: "alley",
    name: "医学楼后巷",
    time: "20:05",
    mood: "卸货口、半开车门、河泥拖痕",
    image: "../assets/radcliffe-infirmary-exterior.png",
    goal: "把调查从社交转入惊悚，让玩家第一次看到怪物痕迹。",
    read:
      "医学楼后巷没有学生，只有冷藏车尾灯照着湿墙。车厢后门半开，R-13 倒在里面，箱盖被从内侧顶裂。格林压低声音讲电话：不是样本，是活的。它往旧艇库去了。",
    beats: [
      "可潜行拍下冷藏箱、血迹和拖痕。",
      "可与格林对峙，逼他交出车载记录仪。",
      "车内昏迷司机醒后会说箱子里伸出一条白色胳膊。"
    ]
  },
  {
    id: "boathouse",
    name: "河边旧艇库",
    time: "20:30",
    mood: "旧桨架、翻倒木艇、白色黏丝",
    image: "../assets/locations/thames-river-bay-bg.png",
    goal: "救出 Henry Lane，与温莎幼体战斗，并完成短团收束。",
    read:
      "旧艇库里没有灯，只有河面反光从木板缝间晃进来。翻倒的木艇下传来很轻的敲击声，三下，停顿，又三下。手电光照到白色黏丝时，它像活着的网一样收缩。",
    beats: [
      "旧桨架可推倒，让幼体本轮闪避吃惩罚骰。",
      "救生衣柜可抵消一次幼体扑咬的奖励骰。",
      "便携 UV 灯能让幼体攻击检定受惩罚骰 3 轮。"
    ]
  },
  {
    id: "aftermath",
    name: "余波与接入正篇",
    time: "23:30",
    mood: "删改病历、封口电话、延迟邮件",
    image: "../assets/locations/charlotte-apartment-bg.png",
    goal: "结算证据去向，决定 Henry Lane 和幼体的后续状态，并接到 10 月 21 日正篇。",
    read:
      "午夜前，校方把事情称为学生低血糖引发的设备事故。医院要求接手 Henry Lane，安保要求删除照片。几个小时后，余辉听说你们见过 R-13 冷藏箱，开始主动寻找你们。",
    beats: [
      "干净胜利：Henry Lane 获救，幼体被杀，证据保留。",
      "留下后患：Henry Lane 获救，幼体逃入河湾。",
      "被迫沉默：医院抢走 Henry Lane 或证据，只留下残片。"
    ]
  }
];

const npcs = [
  {
    id: "henry",
    name: "Henry Lane",
    role: "失踪学生",
    note: "被复筛名单标红，知道冷藏箱里有东西。",
    image: "../assets/npc/prequel/henry-lane.png",
    initial: "H"
  },
  {
    id: "amy",
    name: "艾米·贝尔",
    role: "夜班护士",
    note: "害怕医院安保，可被真诚关心打动。",
    image: "../assets/npc/prequel/amy-bell.png",
    initial: "A"
  },
  {
    id: "peter",
    name: "彼得·周",
    role: "校园志愿者",
    note: "能提供登记表、时间线和献血车去向。",
    image: "../assets/npc/prequel/peter-zhou.png",
    initial: "周"
  },
  {
    id: "green",
    name: "安保格林",
    role: "医院外包安保",
    note: "负责带走冷藏箱并封口，遇怪会逃。",
    image: "../assets/npc/prequel/security-green.png",
    initial: "G"
  },
  {
    id: "yuhui",
    name: "余辉",
    role: "学生调查者",
    note: "暗中记录献血异常，可把短团接到正篇。",
    image: "../assets/npc/prequel/yu-hui.png",
    initial: "余"
  }
];

const players = [
  { id: "p1", name: "调查员一", role: "玩家席位", initial: "1" },
  { id: "p2", name: "调查员二", role: "玩家席位", initial: "2" },
  { id: "p3", name: "调查员三", role: "玩家席位", initial: "3" },
  { id: "p4", name: "调查员四", role: "玩家席位", initial: "4" }
];

const materials = [
  {
    id: "blood-drive-flyer",
    name: "献血活动传单",
    role: "玩家手卡 1",
    note: "开场前或初到校园献血点时展示。",
    image: "../assets/handouts/prequel/handout-01-blood-drive-flyer.png"
  },
  {
    id: "henry-donor-card",
    name: "Henry 登记卡",
    role: "玩家手卡 2",
    note: "Henry 失踪后搜登记桌获得。",
    image: "../assets/handouts/prequel/handout-02-henry-donor-card.png"
  },
  {
    id: "rescreen-list",
    name: "复筛名单截屏",
    role: "玩家手卡 3",
    note: "医务帐篷电脑或艾米帮助后读取。",
    image: "../assets/handouts/prequel/handout-03-rescreen-list.png"
  },
  {
    id: "transfer-order",
    name: "R-13 转运单",
    role: "玩家手卡 4",
    note: "医务帐篷垃圾袋或接驳单夹获得。",
    image: "../assets/handouts/prequel/handout-04-transfer-order.png"
  },
  {
    id: "silver-label",
    name: "V-RH null 标签",
    role: "玩家手卡 5",
    note: "标签打印机或血样样本上发现。",
    image: "../assets/handouts/prequel/handout-05-silver-label.png"
  },
  {
    id: "dashcam-summary",
    name: "车载记录摘要",
    role: "玩家手卡 6",
    note: "医学楼后巷车内取出损坏记录仪。",
    image: "../assets/handouts/prequel/handout-06-dashcam-summary.png"
  },
  {
    id: "school-notice",
    name: "校方事故通报",
    role: "玩家手卡 7",
    note: "余波阶段或官方封口时展示。",
    image: "../assets/handouts/prequel/handout-07-school-notice.png"
  },
  {
    id: "yuhui-email",
    name: "余辉邮件",
    role: "玩家手卡 8",
    note: "接入正篇时展示。",
    image: "../assets/handouts/prequel/handout-08-yuhui-email.png"
  },
  {
    id: "kp-tracker",
    name: "KP 追踪板",
    role: "KP 专用",
    note: "记录时间线、警觉等级、Henry 状态和关键线索。",
    image: "../assets/handouts/prequel/kp-tracker.png"
  },
  {
    id: "npc-roster",
    name: "NPC 速查板",
    role: "KP 专用",
    note: "快速确认 NPC 动机、目标和第一句话。",
    image: "../assets/handouts/prequel/npc-roster.png"
  },
  {
    id: "handout-contact-sheet",
    name: "手卡总览",
    role: "KP 专用",
    note: "开团前检查玩家可见证物是否齐全。",
    image: "../assets/handouts/prequel/contact-sheet-handouts.png"
  }
];

const stateKey = "mistBloodVanStageState";
const roomParams = new URLSearchParams(window.location.search);
const roomCode = (roomParams.get("room") || "").toUpperCase();
const hostKey = roomParams.get("key") || "";
const uploadableGroups = {
  location: "locations",
  npc: "npcs",
  material: "materials",
  player: "players"
};

function emptyCustomImages() {
  return {
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
  notesOpen: false,
  customImages: emptyCustomImages()
};

let state = loadState();
let syncTimer = null;
let pendingUpload = null;

function normalizeCustomImages(value) {
  const next = emptyCustomImages();
  if (!value || typeof value !== "object") return next;
  Object.keys(next).forEach((group) => {
    const source = value[group];
    if (!source || typeof source !== "object") return;
    Object.entries(source).forEach(([id, url]) => {
      if (typeof id === "string" && typeof url === "string") {
        next[group][id] = url;
      }
    });
  });
  return next;
}

function normalizeState(value = {}) {
  return {
    ...defaultState,
    ...value,
    playerIds: Array.isArray(value.playerIds) ? value.playerIds.map(String).slice(0, 12) : [],
    notesOpen: Boolean(value.notesOpen),
    customImages: normalizeCustomImages(value.customImages)
  };
}

function loadState() {
  try {
    return normalizeState(JSON.parse(localStorage.getItem(stateKey) || "{}"));
  } catch {
    return normalizeState();
  }
}

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(state));
  if (roomCode && hostKey) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(pushRoomState, 60);
  }
}

async function pushRoomState() {
  setRoomStatus("正在同步给玩家…");
  try {
    const response = await fetch(`/api/rooms/${roomCode}/state`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hostKey, state })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "同步失败");
    }
    const payload = await response.json();
    state = normalizeState({ ...payload.state, notesOpen: state.notesOpen });
    localStorage.setItem(stateKey, JSON.stringify(state));
    setRoomStatus("舞台已同步");
  } catch (error) {
    setRoomStatus(error.message, true);
  }
}

function setRoomStatus(message, isError = false) {
  if (!roomCode) return;
  const status = byId("roomStatus");
  status.textContent = message;
  status.style.color = isError ? "#e6a39a" : "";
}

async function connectRoom() {
  if (!roomCode) return;
  byId("roomTools").classList.remove("hidden");
  byId("roomCodeLabel").textContent = roomCode;
  if (!hostKey) {
    setRoomStatus("缺少房主密钥，此页面只能查看", true);
    return;
  }
  try {
    const response = await fetch(`/api/rooms/${roomCode}/state`, { cache: "no-store" });
    if (!response.ok) throw new Error("房间不存在或服务已重启");
    const payload = await response.json();
    state = normalizeState({ ...payload.state, notesOpen: state.notesOpen });
    localStorage.setItem(stateKey, JSON.stringify(state));
    render();
    setRoomStatus("房间已连接，舞台变更会自动同步");
  } catch (error) {
    setRoomStatus(error.message, true);
  }
}

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function currentLocation() {
  return locations.find((location) => location.id === state.locationId) || locations[0];
}

function currentNpc() {
  return npcs.find((npc) => npc.id === state.npcId) || null;
}

function currentMaterial() {
  return materials.find((material) => material.id === state.materialId) || null;
}

function customImage(group, id) {
  return state.customImages[group]?.[id] || null;
}

function imageSource(group, id, fallback) {
  return customImage(group, id) || fallback;
}

function setStageImage(element, src, alt) {
  if (element.getAttribute("src") !== src) {
    element.style.animation = "none";
    element.offsetHeight;
    element.style.animation = "";
    element.src = src;
  }
  element.alt = alt;
}

function renderSelectorList(targetId, items, activeCheck, clickType) {
  const group = uploadableGroups[clickType];
  byId(targetId).innerHTML = items
    .map((item) => {
      const active = activeCheck(item);
      const meta = item.time || item.role || "玩家";
      const custom = Boolean(customImage(group, item.id));
      return `
        <article class="select-card ${active ? "active" : ""}">
          <button class="select-main" type="button" data-${clickType}="${item.id}" aria-pressed="${active ? "true" : "false"}">
            <div class="topline">
              <strong>${escapeHtml(item.name)}</strong>
              <span class="tag">${escapeHtml(meta)}</span>
            </div>
            <span>${escapeHtml(item.mood || item.note || item.role)}</span>
          </button>
          <div class="card-actions">
            <button class="card-action" type="button" data-upload-group="${group}" data-upload-id="${item.id}" data-upload-name="${escapeHtml(item.name)}">换图</button>
            ${custom
              ? `<button class="card-action subtle" type="button" data-reset-group="${group}" data-reset-id="${item.id}">恢复默认</button><span class="card-status">已换图</span>`
              : `<span class="card-status is-muted">默认图</span>`}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderControls() {
  byId("locationCount").textContent = locations.length;
  byId("materialCount").textContent = materials.length;
  renderSelectorList("locationList", locations, (item) => item.id === state.locationId, "location");
  renderSelectorList("npcList", npcs, (item) => item.id === state.npcId, "npc");
  renderSelectorList("materialList", materials, (item) => item.id === state.materialId, "material");
  renderSelectorList("playerList", players, (item) => state.playerIds.includes(item.id), "player");
  byId("toggleNotes").textContent = state.notesOpen ? "隐藏 KP 备注" : "显示 KP 备注";
}

function renderStage() {
  const location = currentLocation();
  setStageImage(byId("backgroundImage"), imageSource("locations", location.id, location.image), location.name);
  byId("notesTitle").textContent = location.name;
  byId("notesClock").textContent = location.time;
  byId("notesGoal").textContent = location.goal;
  byId("notesRead").textContent = location.read;
  byId("notesBeats").innerHTML = location.beats.map((beat) => `<li>${escapeHtml(beat)}</li>`).join("");
  byId("notesPanel").classList.toggle("hidden", !state.notesOpen);
}

function renderNpc() {
  const npc = currentNpc();
  if (!npc) {
    byId("npcPortrait").innerHTML = "";
    return;
  }

  const image = imageSource("npcs", npc.id, npc.image);
  const visual = image
    ? `<img class="npc-cutout" src="${image}" alt="${escapeHtml(npc.name)}" />`
    : `<div class="npc-card-figure">
        <div class="npc-avatar">${escapeHtml(npc.initial)}</div>
        <span class="role">${escapeHtml(npc.role)}</span>
        <h3>${escapeHtml(npc.name)}</h3>
        <p>${escapeHtml(npc.note)}</p>
      </div>`;

  byId("npcPortrait").innerHTML = `<div class="npc-figure">${visual}</div>`;
}

function renderMaterial() {
  const material = currentMaterial();
  if (!material) {
    byId("materialDisplay").innerHTML = "";
    return;
  }

  byId("materialDisplay").innerHTML = `
    <img class="material-image" src="${imageSource("materials", material.id, material.image)}" alt="${escapeHtml(material.name)}" />
  `;
}

function renderPlayers() {
  const activePlayers = players.filter((player) => state.playerIds.includes(player.id));
  byId("playerPortraits").innerHTML = activePlayers
    .map((player) => {
      const portrait = customImage("players", player.id);
      const media = portrait
        ? `<img class="player-token-image" src="${portrait}" alt="${escapeHtml(player.name)}" />`
        : `<div class="player-token-fallback" aria-hidden="true">${escapeHtml(player.initial)}</div>`;
      return `
        <article class="player-token ${portrait ? "has-image" : ""}" data-initial="${escapeHtml(player.initial)}">
          ${media}
          <div class="player-copy">
            <span class="role">${escapeHtml(player.role)}</span>
            <h3>${escapeHtml(player.name)}</h3>
            <p>右侧玩家席位，可用于标记当前在场调查员。</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function render() {
  renderControls();
  renderStage();
  renderNpc();
  renderMaterial();
  renderPlayers();
}

function openImagePicker(group, id, name) {
  if (!roomCode || !hostKey) {
    setRoomStatus("只有创建房间的 KP 可以上传图片", true);
    return;
  }
  pendingUpload = { group, id, name };
  const input = byId("customImageInput");
  input.value = "";
  input.click();
}

function removeCustomImage(group, id) {
  if (!state.customImages[group]?.[id]) return;
  delete state.customImages[group][id];
  saveState();
  render();
  setRoomStatus("已恢复默认图片");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

async function uploadCustomImage(file, target) {
  if (!file.type.startsWith("image/")) throw new Error("请选择图片文件");
  if (file.size > 5 * 1024 * 1024) throw new Error("图片不能超过 5MB");
  const dataUrl = await fileToDataUrl(file);
  const response = await fetch(`/api/rooms/${roomCode}/assets`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      hostKey,
      targetType: target.group,
      targetId: target.id,
      dataUrl
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "上传图片失败");
  state.customImages[target.group][target.id] = payload.url;
  saveState();
  render();
}

document.addEventListener("click", (event) => {
  const uploadButton = event.target.closest("[data-upload-group]");
  if (uploadButton) {
    openImagePicker(uploadButton.dataset.uploadGroup, uploadButton.dataset.uploadId, uploadButton.dataset.uploadName);
    return;
  }

  const resetButton = event.target.closest("[data-reset-group]");
  if (resetButton) {
    removeCustomImage(resetButton.dataset.resetGroup, resetButton.dataset.resetId);
    return;
  }

  const locationButton = event.target.closest("[data-location]");
  if (locationButton) {
    state.locationId = locationButton.dataset.location;
    saveState();
    render();
    return;
  }

  const npcButton = event.target.closest("[data-npc]");
  if (npcButton) {
    state.npcId = state.npcId === npcButton.dataset.npc ? null : npcButton.dataset.npc;
    saveState();
    render();
    return;
  }

  const materialButton = event.target.closest("[data-material]");
  if (materialButton) {
    state.materialId = state.materialId === materialButton.dataset.material ? null : materialButton.dataset.material;
    saveState();
    render();
    return;
  }

  const playerButton = event.target.closest("[data-player]");
  if (playerButton) {
    const id = playerButton.dataset.player;
    state.playerIds = state.playerIds.includes(id)
      ? state.playerIds.filter((playerId) => playerId !== id)
      : [...state.playerIds, id];
    saveState();
    render();
  }
});

byId("customImageInput").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  const target = pendingUpload;
  pendingUpload = null;
  event.target.value = "";
  if (!file || !target) return;
  setRoomStatus(`正在上传 ${target.name} 图片…`);
  try {
    await uploadCustomImage(file, target);
    setRoomStatus(`${target.name} 图片已上传，正在同步`);
  } catch (error) {
    setRoomStatus(error.message, true);
  }
});

byId("clearNpc").addEventListener("click", () => {
  state.npcId = null;
  saveState();
  render();
});

byId("clearMaterial").addEventListener("click", () => {
  state.materialId = null;
  saveState();
  render();
});

byId("clearPlayers").addEventListener("click", () => {
  state.playerIds = [];
  saveState();
  render();
});

byId("toggleNotes").addEventListener("click", () => {
  state.notesOpen = !state.notesOpen;
  saveState();
  render();
});

byId("resetStage").addEventListener("click", () => {
  state = normalizeState({ ...defaultState, customImages: state.customImages });
  saveState();
  render();
});

byId("copyPlayerLink").addEventListener("click", async () => {
  const playerUrl = `${window.location.origin}/player/?room=${roomCode}`;
  try {
    await navigator.clipboard.writeText(playerUrl);
    byId("copyPlayerLink").textContent = "已复制";
    setTimeout(() => {
      byId("copyPlayerLink").textContent = "复制玩家链接";
    }, 1600);
  } catch {
    window.prompt("复制下面的玩家链接", playerUrl);
  }
});

render();
connectRoom();
