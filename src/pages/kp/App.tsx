import { type ReactNode, useRef, useState } from "react";
import { readHostKeyFromSearch, readRoomCodeFromSearch } from "@shared/room/state";
import { useKpRoom } from "@shared/room/useKpRoom";
import {
  resolveRoomMeta,
  resolveStageLocation,
  resolveStageMaterial,
  resolveStageNpc,
  resolveStagePlayer,
} from "@shared/stage/content";
import {
  stageLocations,
  stageMaterials,
  stageNpcs,
  stagePlayers,
} from "@shared/stage/catalog";
import { KpStagePreview } from "@shared/stage/KpStagePreview";
import type { ImageGroup } from "@shared/types";

const HOST_KEY = readHostKeyFromSearch(window.location.search);
const ROOM_CODE = readRoomCodeFromSearch(window.location.search);

interface SelectCardProps {
  active: boolean;
  customImage: boolean;
  description: string;
  group: ImageGroup;
  id: string;
  meta: string;
  name: string;
  onReset: (group: ImageGroup, id: string) => void;
  onSelect: (id: string) => void;
  onUpload: (group: ImageGroup, id: string, name: string) => void;
}

interface EditorFieldProps {
  label: string;
  multiline?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

interface EditorSectionProps {
  children: ReactNode;
  onReset?: () => void;
  title: string;
}

function SelectCard({
  active,
  customImage,
  description,
  group,
  id,
  meta,
  name,
  onReset,
  onSelect,
  onUpload,
}: SelectCardProps) {
  return (
    <article className={`select-card ${active ? "active" : ""}`}>
      <button
        className="select-main"
        type="button"
        aria-pressed={active}
        onClick={() => onSelect(id)}
      >
        <div className="topline">
          <strong>{name}</strong>
          <span className="tag">{meta}</span>
        </div>
        <span>{description}</span>
      </button>
      <div className="card-actions">
        <button
          className="card-action"
          type="button"
          onClick={() => onUpload(group, id, name)}
        >
          换图
        </button>
        {customImage ? (
          <>
            <button
              className="card-action subtle"
              type="button"
              onClick={() => onReset(group, id)}
            >
              恢复默认
            </button>
            <span className="card-status">已换图</span>
          </>
        ) : (
          <span className="card-status is-muted">默认图</span>
        )}
      </div>
    </article>
  );
}

function EditorField({ label, multiline, onChange, placeholder, value }: EditorFieldProps) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function EditorSection({ children, onReset, title }: EditorSectionProps) {
  return (
    <section className="editor-section">
      <div className="editor-head">
        <h2>{title}</h2>
        {onReset ? (
          <button className="editor-reset" type="button" onClick={onReset}>
            恢复默认
          </button>
        ) : null}
      </div>
      <div className="editor-fields">{children}</div>
    </section>
  );
}

function EmptyEditorHint({ text }: { text: string }) {
  return <p className="editor-empty">{text}</p>;
}

export default function App() {
  const [copyLabel, setCopyLabel] = useState("复制玩家链接");
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const copyResetTimerRef = useRef<number | null>(null);
  const {
    beginUpload,
    clearMaterial,
    clearNpc,
    clearPlayers,
    removeCustomImage,
    resetRoomMeta,
    resetStage,
    resetTextOverride,
    roomCode,
    roomStatus,
    roomStatusTone,
    roomToolsVisible,
    setLocation,
    state,
    submitPendingUpload,
    toggleMaterial,
    toggleNotes,
    toggleNpc,
    togglePlayer,
    updateRoomMeta,
    updateTextOverride,
  } = useKpRoom(ROOM_CODE, HOST_KEY);

  const roomMeta = resolveRoomMeta(state);
  const currentLocation = resolveStageLocation(state, state.locationId);
  const currentNpc = resolveStageNpc(state, state.npcId);
  const currentMaterial = resolveStageMaterial(state, state.materialId);
  const activePlayers = state.playerIds
    .map((playerId) => resolveStagePlayer(state, playerId))
    .filter((player): player is NonNullable<typeof player> => Boolean(player));

  function handleUpload(group: ImageGroup, id: string, name: string) {
    if (!beginUpload({ group, id, name })) return;
    fileInputRef.current?.click();
  }

  async function handleCopyPlayerLink() {
    if (!roomCode) return;
    const playerUrl = `${window.location.origin}/player/?room=${roomCode}`;
    try {
      await navigator.clipboard.writeText(playerUrl);
      if (copyResetTimerRef.current !== null) window.clearTimeout(copyResetTimerRef.current);
      setCopyLabel("已复制");
      copyResetTimerRef.current = window.setTimeout(() => {
        setCopyLabel("复制玩家链接");
        copyResetTimerRef.current = null;
      }, 1600);
    } catch {
      window.prompt("复制下面的玩家链接", playerUrl);
    }
  }

  return (
    <>
      <div className={`stage-app ${editMode ? "is-editing" : ""}`}>
        <aside className="control-panel" aria-label="KP 控制栏">
          <section
            className={`room-tools ${roomToolsVisible ? "" : "hidden"}`}
            aria-label="房间信息"
          >
            <div>
              <span>实时房间</span>
              <strong>{roomCode || "------"}</strong>
            </div>
            <button type="button" onClick={handleCopyPlayerLink}>
              {copyLabel}
            </button>
            <p style={roomStatusTone === "error" ? { color: "#e6a39a" } : undefined}>
              {roomStatus}
            </p>
          </section>

          <header className="brand">
            <div className="brand-mark">R-13</div>
            <div>
              <h1>{roomMeta.title}</h1>
              <p>{roomMeta.subtitle || "KP 舞台控制台"}</p>
            </div>
          </header>

          <section className="selector-group">
            <div className="group-title">
              <span>地点</span>
              <strong>{stageLocations.length}</strong>
            </div>
            <div className="selector-list">
              {stageLocations.map((location) => {
                const resolved = resolveStageLocation(state, location.id);
                return (
                  <SelectCard
                    key={location.id}
                    active={location.id === state.locationId}
                    customImage={Boolean(state.customImages.locations[location.id])}
                    description={resolved.mood}
                    group="locations"
                    id={location.id}
                    meta={resolved.time}
                    name={resolved.name}
                    onReset={removeCustomImage}
                    onSelect={setLocation}
                    onUpload={handleUpload}
                  />
                );
              })}
            </div>
          </section>

          <section className="selector-group">
            <div className="group-title">
              <span>NPC</span>
              <button className="mini-btn" type="button" onClick={clearNpc}>
                清空
              </button>
            </div>
            <div className="selector-list">
              {stageNpcs.map((npc) => {
                const resolved = resolveStageNpc(state, npc.id) || npc;
                return (
                  <SelectCard
                    key={npc.id}
                    active={npc.id === state.npcId}
                    customImage={Boolean(state.customImages.npcs[npc.id])}
                    description={npc.note}
                    group="npcs"
                    id={npc.id}
                    meta={resolved.role}
                    name={resolved.name}
                    onReset={removeCustomImage}
                    onSelect={toggleNpc}
                    onUpload={handleUpload}
                  />
                );
              })}
            </div>
          </section>

          <section className="selector-group">
            <div className="group-title">
              <span>素材</span>
              <div className="title-actions">
                <strong>{stageMaterials.length}</strong>
                <button className="mini-btn" type="button" onClick={clearMaterial}>
                  清空
                </button>
              </div>
            </div>
            <div className="selector-list">
              {stageMaterials.map((material) => {
                const resolved = resolveStageMaterial(state, material.id) || material;
                return (
                  <SelectCard
                    key={material.id}
                    active={material.id === state.materialId}
                    customImage={Boolean(state.customImages.materials[material.id])}
                    description={material.note}
                    group="materials"
                    id={material.id}
                    meta={resolved.role}
                    name={resolved.name}
                    onReset={removeCustomImage}
                    onSelect={toggleMaterial}
                    onUpload={handleUpload}
                  />
                );
              })}
            </div>
          </section>

          <section className="selector-group">
            <div className="group-title">
              <span>玩家</span>
              <button className="mini-btn" type="button" onClick={clearPlayers}>
                清空
              </button>
            </div>
            <div className="selector-list">
              {stagePlayers.map((player) => {
                const resolved = resolveStagePlayer(state, player.id) || player;
                return (
                  <SelectCard
                    key={player.id}
                    active={state.playerIds.includes(player.id)}
                    customImage={Boolean(state.customImages.players[player.id])}
                    description={resolved.description}
                    group="players"
                    id={player.id}
                    meta="玩家"
                    name={resolved.name}
                    onReset={removeCustomImage}
                    onSelect={togglePlayer}
                    onUpload={handleUpload}
                  />
                );
              })}
            </div>
          </section>

          <footer className="panel-tools">
            <p className="panel-tip">
              每张地点、NPC、素材和玩家卡都可以上传替换图；编辑模式下修改的公开文案会实时同步到玩家端。
            </p>
            <button className="panel-btn" type="button" onClick={() => setEditMode((current) => !current)}>
              {editMode ? "回到演出模式" : "切到编辑模式"}
            </button>
            <button className="panel-btn" type="button" onClick={toggleNotes}>
              {state.notesOpen ? "隐藏 KP 备注" : "显示 KP 备注"}
            </button>
            <button className="panel-btn" type="button" onClick={resetStage}>
              重置舞台
            </button>
          </footer>
        </aside>

        <KpStagePreview state={state} />

        {editMode ? (
          <aside className="editor-panel" aria-label="公开文本编辑面板">
            <div className="editor-intro">
              <span>编辑模式</span>
              <h2>公开文本</h2>
              <p>这里只改玩家能看到的文案，KP 备注和幕后节奏不会外泄。</p>
            </div>

            <EditorSection title="房间抬头" onReset={resetRoomMeta}>
              <EditorField
                label="房间标题"
                value={roomMeta.title}
                onChange={(value) => updateRoomMeta("title", value)}
              />
              <EditorField
                label="副标题"
                value={roomMeta.subtitle || ""}
                onChange={(value) => updateRoomMeta("subtitle", value)}
              />
              <EditorField
                label="玩家提示语"
                multiline
                value={roomMeta.playerNotice || ""}
                onChange={(value) => updateRoomMeta("playerNotice", value)}
              />
            </EditorSection>

            <EditorSection
              title={`当前地点 · ${currentLocation.name}`}
              onReset={() => resetTextOverride("locations", currentLocation.id)}
            >
              <EditorField
                label="场景名称"
                value={currentLocation.name}
                onChange={(value) => updateTextOverride("locations", currentLocation.id, "name", value)}
              />
              <EditorField
                label="时间"
                value={currentLocation.time}
                onChange={(value) => updateTextOverride("locations", currentLocation.id, "time", value)}
              />
              <EditorField
                label="公开氛围"
                multiline
                value={currentLocation.mood}
                onChange={(value) => updateTextOverride("locations", currentLocation.id, "mood", value)}
              />
            </EditorSection>

            {currentNpc ? (
              <EditorSection
                title={`当前 NPC · ${currentNpc.name}`}
                onReset={() => resetTextOverride("npcs", currentNpc.id)}
              >
                <EditorField
                  label="公开名称"
                  value={currentNpc.name}
                  onChange={(value) => updateTextOverride("npcs", currentNpc.id, "name", value)}
                />
                <EditorField
                  label="身份"
                  value={currentNpc.role}
                  onChange={(value) => updateTextOverride("npcs", currentNpc.id, "role", value)}
                />
                <EditorField
                  label="公开简介"
                  multiline
                  value={currentNpc.intro || ""}
                  onChange={(value) => updateTextOverride("npcs", currentNpc.id, "intro", value)}
                />
              </EditorSection>
            ) : (
              <EmptyEditorHint text="当前没有出场 NPC。选中一位 NPC 后，这里会出现对应的公开文案表单。" />
            )}

            {currentMaterial ? (
              <EditorSection
                title={`当前素材 · ${currentMaterial.name}`}
                onReset={() => resetTextOverride("materials", currentMaterial.id)}
              >
                <EditorField
                  label="素材标题"
                  value={currentMaterial.name}
                  onChange={(value) => updateTextOverride("materials", currentMaterial.id, "name", value)}
                />
                <EditorField
                  label="素材标签"
                  value={currentMaterial.role}
                  onChange={(value) => updateTextOverride("materials", currentMaterial.id, "role", value)}
                />
                <EditorField
                  label="公开说明"
                  multiline
                  value={currentMaterial.description || ""}
                  onChange={(value) =>
                    updateTextOverride("materials", currentMaterial.id, "description", value)
                  }
                />
              </EditorSection>
            ) : (
              <EmptyEditorHint text="当前没有展示素材。选中一份素材后，这里会出现对应的标题和说明编辑项。" />
            )}

            <EditorSection title="当前在场玩家">
              {activePlayers.length > 0 ? (
                activePlayers.map((player) => (
                  <div className="editor-player-card" key={player.id}>
                    <div className="editor-player-head">
                      <strong>{player.name}</strong>
                      <button
                        className="editor-reset"
                        type="button"
                        onClick={() => resetTextOverride("players", player.id)}
                      >
                        恢复默认
                      </button>
                    </div>
                    <div className="editor-fields">
                      <EditorField
                        label="席位名称"
                        value={player.name}
                        onChange={(value) => updateTextOverride("players", player.id, "name", value)}
                      />
                      <EditorField
                        label="公开描述"
                        multiline
                        value={player.description}
                        onChange={(value) =>
                          updateTextOverride("players", player.id, "identity", value)
                        }
                      />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyEditorHint text="当前没有点亮玩家席位。选中右侧玩家卡后，这里会出现对应描述编辑项。" />
              )}
            </EditorSection>
          </aside>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void submitPendingUpload(file);
        }}
      />
    </>
  );
}
