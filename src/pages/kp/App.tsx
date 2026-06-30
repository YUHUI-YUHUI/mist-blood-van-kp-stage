import { useRef, useState } from "react";
import { useKpRoom } from "@shared/room/useKpRoom";
import { readHostKeyFromSearch, readRoomCodeFromSearch } from "@shared/room/state";
import { KpStagePreview } from "@shared/stage/KpStagePreview";
import {
  stageLocations,
  stageMaterials,
  stageNpcs,
  stagePlayers,
} from "@shared/stage/catalog";
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

export default function App() {
  const [copyLabel, setCopyLabel] = useState("复制玩家链接");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const copyResetTimerRef = useRef<number | null>(null);
  const {
    beginUpload,
    clearMaterial,
    clearNpc,
    clearPlayers,
    removeCustomImage,
    resetStage,
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
  } = useKpRoom(ROOM_CODE, HOST_KEY);

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
      <div className="stage-app">
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
              <h1>雾中献血车</h1>
              <p>KP 舞台控制台</p>
            </div>
          </header>

          <section className="selector-group">
            <div className="group-title">
              <span>地点</span>
              <strong>{stageLocations.length}</strong>
            </div>
            <div className="selector-list">
              {stageLocations.map((location) => (
                <SelectCard
                  key={location.id}
                  active={location.id === state.locationId}
                  customImage={Boolean(state.customImages.locations[location.id])}
                  description={location.mood}
                  group="locations"
                  id={location.id}
                  meta={location.time}
                  name={location.name}
                  onReset={removeCustomImage}
                  onSelect={setLocation}
                  onUpload={handleUpload}
                />
              ))}
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
              {stageNpcs.map((npc) => (
                <SelectCard
                  key={npc.id}
                  active={npc.id === state.npcId}
                  customImage={Boolean(state.customImages.npcs[npc.id])}
                  description={npc.note}
                  group="npcs"
                  id={npc.id}
                  meta={npc.role}
                  name={npc.name}
                  onReset={removeCustomImage}
                  onSelect={toggleNpc}
                  onUpload={handleUpload}
                />
              ))}
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
              {stageMaterials.map((material) => (
                <SelectCard
                  key={material.id}
                  active={material.id === state.materialId}
                  customImage={Boolean(state.customImages.materials[material.id])}
                  description={material.note}
                  group="materials"
                  id={material.id}
                  meta={material.role}
                  name={material.name}
                  onReset={removeCustomImage}
                  onSelect={toggleMaterial}
                  onUpload={handleUpload}
                />
              ))}
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
              {stagePlayers.map((player) => (
                <SelectCard
                  key={player.id}
                  active={state.playerIds.includes(player.id)}
                  customImage={Boolean(state.customImages.players[player.id])}
                  description={player.role}
                  group="players"
                  id={player.id}
                  meta="玩家"
                  name={player.name}
                  onReset={removeCustomImage}
                  onSelect={togglePlayer}
                  onUpload={handleUpload}
                />
              ))}
            </div>
          </section>

          <footer className="panel-tools">
            <p className="panel-tip">
              每张地点、NPC、素材和玩家卡都可以上传替换图；图片只保存在当前房间内存里。
            </p>
            <button className="panel-btn" type="button" onClick={toggleNotes}>
              {state.notesOpen ? "隐藏 KP 备注" : "显示 KP 备注"}
            </button>
            <button className="panel-btn" type="button" onClick={resetStage}>
              重置舞台
            </button>
          </footer>
        </aside>

        <KpStagePreview state={state} />
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
