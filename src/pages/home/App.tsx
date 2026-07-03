import { useRef, useState, type FormEvent } from "react";
import { createRoom, getRoomState } from "@shared/api";
import { normalizeRoomCode } from "@shared/room/state";
import { CUSTOM_ROOM_TEMPLATE_ID, parseTemplateFile, roomTemplateOptions } from "@shared/templates";
import type { RoomTemplateId } from "@shared/types";

export default function App() {
  const [roomCode, setRoomCode] = useState("");
  const [message, setMessage] = useState("");
  const [importLabel, setImportLabel] = useState("从模板文件创建");
  const [creatingTemplate, setCreatingTemplate] = useState<RoomTemplateId | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleCreate(templateId: RoomTemplateId) {
    setCreatingTemplate(templateId);
    setMessage("");
    try {
      const room = await createRoom({ templateId });
      window.location.assign(room.hostUrl);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "房间服务暂时不可用";
      setMessage(`${reason}。请确认已使用 node server.mjs 启动。`);
      setCreatingTemplate(null);
    }
  }

  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = normalizeRoomCode(roomCode);
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

  async function handleTemplateImport(file: File) {
    setCreatingTemplate(CUSTOM_ROOM_TEMPLATE_ID);
    setImportLabel("正在导入模板…");
    setMessage("");
    try {
      const text = await file.text();
      const templateData = parseTemplateFile(text);
      const room = await createRoom({
        templateId: CUSTOM_ROOM_TEMPLATE_ID,
        templateData,
      });
      window.location.assign(room.hostUrl);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "模板文件导入失败";
      setMessage(reason);
      setCreatingTemplate(null);
      setImportLabel("从模板文件创建");
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

        <div className="template-actions" aria-label="选择房间模板">
          {roomTemplateOptions.map((template, index) => {
            const creating = creatingTemplate === template.id;
            return (
              <button
                key={template.id}
                className={index === 0 ? "primary-action" : "secondary-action"}
                type="button"
                onClick={() => void handleCreate(template.id)}
                disabled={creatingTemplate !== null}
              >
                <span className="action-copy">
                  <strong>{creating ? "正在准备房间…" : `我是 KP，创建${template.name}`}</strong>
                  <small>{template.description}</small>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            );
          })}
          <button
            className="secondary-action"
            type="button"
            disabled={creatingTemplate !== null}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="action-copy">
              <strong>{creatingTemplate === CUSTOM_ROOM_TEMPLATE_ID ? importLabel : "从模板文件创建"}</strong>
              <small>导入之前从 KP 导出的 `.template.json` 文件，直接创建新房间。</small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>

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
                setRoomCode(normalizeRoomCode(event.target.value));
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.template.json,application/json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void handleTemplateImport(file);
        }}
      />
    </main>
  );
}
