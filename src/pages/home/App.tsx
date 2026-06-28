import { useState, type FormEvent } from "react";
import { createRoom, getRoomState } from "@shared/api";

function normalizeRoom(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z2-9]/g, "")
    .slice(0, 6);
}

export default function App() {
  const [roomCode, setRoomCode] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setCreating(true);
    setMessage("");
    try {
      const room = await createRoom();
      window.location.assign(room.hostUrl);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "房间服务暂时不可用";
      setMessage(`${reason}。请确认已使用 node server.mjs 启动。`);
      setCreating(false);
    }
  }

  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = normalizeRoom(roomCode);
    if (code.length !== 6) {
      setMessage("请输入 6 位房间号。");
      return;
    }
    try {
      await getRoomState(code);
      window.location.assign(`/player/?room=${code}`);
    } catch {
      setMessage("没有找到这个房间，请向 KP 确认房间号");
    }
  }

  return (
    <main className="portal-shell">
      <section className="portal-copy">
        <a className="wordmark" href="/" aria-label="秘仪室首页">
          <span className="wordmark-mark">R·13</span>
          <span>秘仪室</span>
        </a>
        <div className="hero-copy">
          <h1>
            把故事留在
            <br />
            同一个房间里。
          </h1>
          <p>
            KP 控制场景与线索，玩家通过房间链接进入只读舞台。无需安装，打开浏览器即可入席。
          </p>
        </div>
        <div className="feature-line" aria-label="平台能力">
          <span>实时场景</span>
          <span>只读玩家端</span>
          <span>为文字与语音预留</span>
        </div>
      </section>

      <section className="room-panel" aria-labelledby="roomTitle">
        <div className="room-panel-head">
          <p>开始一场游戏</p>
          <h2 id="roomTitle">进入房间</h2>
        </div>

        <button
          className="primary-action"
          type="button"
          onClick={handleCreate}
          disabled={creating}
        >
          <span>{creating ? "正在准备房间…" : "我是 KP，创建新房间"}</span>
          <span aria-hidden="true">↗</span>
        </button>

        <div className="divider">
          <span>或使用房间号加入</span>
        </div>

        <form className="join-form" onSubmit={handleJoin}>
          <label htmlFor="roomCode">玩家房间号</label>
          <div className="code-row">
            <input
              id="roomCode"
              name="room"
              maxLength={6}
              autoComplete="off"
              spellCheck={false}
              placeholder="例如 R13COC"
              required
              value={roomCode}
              onChange={(event) => {
                setRoomCode(normalizeRoom(event.target.value));
                setMessage("");
              }}
            />
            <button type="submit">进入舞台</button>
          </div>
          <p className="form-message" role="status">
            {message}
          </p>
        </form>

        <p className="privacy-note">
          玩家端不会显示 KP 控制栏、备注或房主密钥。
        </p>
      </section>
    </main>
  );
}
