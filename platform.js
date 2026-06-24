const byId = (id) => document.getElementById(id);

function normalizeRoom(value) {
  return value.toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 6);
}

byId("roomCode").addEventListener("input", (event) => {
  event.target.value = normalizeRoom(event.target.value);
  byId("formMessage").textContent = "";
});

byId("createRoom").addEventListener("click", async () => {
  const button = byId("createRoom");
  button.disabled = true;
  button.firstElementChild.textContent = "正在准备房间…";
  try {
    const response = await fetch("/api/rooms", { method: "POST" });
    if (!response.ok) throw new Error("房间服务暂时不可用");
    const room = await response.json();
    window.location.assign(room.hostUrl);
  } catch (error) {
    byId("formMessage").textContent = `${error.message}。请确认已使用 node server.mjs 启动。`;
    button.disabled = false;
    button.firstElementChild.textContent = "我是 KP，创建新房间";
  }
});

byId("joinForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const code = normalizeRoom(byId("roomCode").value);
  if (code.length !== 6) {
    byId("formMessage").textContent = "请输入 6 位房间号。";
    return;
  }
  try {
    const response = await fetch(`/api/rooms/${code}/state`);
    if (!response.ok) throw new Error("没有找到这个房间，请向 KP 确认房间号");
    window.location.assign(`/player/?room=${code}`);
  } catch (error) {
    byId("formMessage").textContent = error.message;
  }
});
