const locations = {
  campus: { name: "校园献血点", image: "../assets/locations/oxford-campus-bg.png" },
  tent: { name: "临时医务帐篷", image: "../assets/radcliffe-infirmary-exterior.png" },
  alley: { name: "医学楼后巷", image: "../assets/radcliffe-infirmary-exterior.png" },
  boathouse: { name: "河边旧艇库", image: "../assets/locations/thames-river-bay-bg.png" },
  aftermath: { name: "余波与接入正篇", image: "../assets/locations/charlotte-apartment-bg.png" }
};

const npcs = {
  henry: { name: "Henry Lane", image: "../assets/npc/prequel/henry-lane.png" },
  amy: { name: "艾米·贝尔", image: "../assets/npc/prequel/amy-bell.png" },
  peter: { name: "彼得·周", image: "../assets/npc/prequel/peter-zhou.png" },
  green: { name: "安保格林", image: "../assets/npc/prequel/security-green.png" },
  yuhui: { name: "余辉", image: "../assets/npc/prequel/yu-hui.png" }
};

const materialItems = [
  ["blood-drive-flyer", "献血活动传单", "handout-01-blood-drive-flyer.png"],
  ["henry-donor-card", "Henry 登记卡", "handout-02-henry-donor-card.png"],
  ["rescreen-list", "复筛名单截屏", "handout-03-rescreen-list.png"],
  ["transfer-order", "R-13 转运单", "handout-04-transfer-order.png"],
  ["silver-label", "V-RH null 标签", "handout-05-silver-label.png"],
  ["dashcam-summary", "车载记录摘要", "handout-06-dashcam-summary.png"],
  ["school-notice", "校方事故通报", "handout-07-school-notice.png"],
  ["yuhui-email", "余辉邮件", "handout-08-yuhui-email.png"]
];

const materials = Object.fromEntries(materialItems.map(([id, name, file]) => [id, {
  name,
  image: `../assets/handouts/prequel/${file}`
}]));

const byId = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
const roomCode = (params.get("room") || "").toUpperCase();

function imageSource(state, group, id, fallback) {
  return state.customImages?.[group]?.[id] || fallback;
}

function setConnection(status, label) {
  byId("connectionDot").className = `connection-dot ${status}`;
  byId("roomLabel").textContent = label;
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

function renderStage(state) {
  const location = locations[state.locationId] || locations.campus;
  setStageImage(byId("backgroundImage"), imageSource(state, "locations", state.locationId, location.image), location.name);

  const npc = npcs[state.npcId];
  byId("npcPortrait").innerHTML = npc
    ? `<div class="npc-figure"><img class="npc-cutout" src="${imageSource(state, "npcs", state.npcId, npc.image)}" alt="${npc.name}" /></div>`
    : "";

  const material = materials[state.materialId];
  byId("materialDisplay").innerHTML = material
    ? `<img class="material-image" src="${imageSource(state, "materials", state.materialId, material.image)}" alt="${material.name}" />`
    : "";
}

function showFatal(message) {
  setConnection("disconnected", "房间不可用");
  byId("joinErrorText").textContent = message;
  byId("joinError").classList.remove("hidden");
}

async function connect() {
  if (!/^[A-Z2-9]{6}$/.test(roomCode)) {
    showFatal("房间链接无效，请向 KP 获取新的玩家链接。");
    return;
  }

  byId("roomLabel").textContent = `房间 ${roomCode} · 连接中`;
  try {
    const response = await fetch(`/api/rooms/${roomCode}/state`, { cache: "no-store" });
    if (!response.ok) throw new Error("房间不存在或已经结束");
    const initial = await response.json();
    renderStage(initial.state);
    setConnection("connected", `房间 ${roomCode} · 已同步`);
  } catch (error) {
    showFatal(error.message);
    return;
  }

  const events = new EventSource(`/api/rooms/${roomCode}/events`);
  events.addEventListener("stage", (event) => {
    const payload = JSON.parse(event.data);
    renderStage(payload.state);
    setConnection("connected", `房间 ${roomCode} · 已同步`);
  });
  events.onerror = () => setConnection("disconnected", `房间 ${roomCode} · 正在重连`);
}

connect();
