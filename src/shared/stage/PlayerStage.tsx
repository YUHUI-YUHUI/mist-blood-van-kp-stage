import type { RoomState } from "@shared/types";
import {
  resolvePublicStageLocation,
  resolvePublicStageMaterial,
  resolvePublicStageNpc,
  resolveRoomMeta,
} from "./content";
import type { PlayerConnectionStatus } from "../room/usePlayerRoom";

interface PlayerStageProps {
  fatalMessage: string | null;
  roomLabel: string;
  state: RoomState;
  status: PlayerConnectionStatus;
}

function imageSource(
  state: RoomState,
  group: "locations" | "npcs" | "materials",
  id: string,
  fallback: string,
): string {
  return state.customImages[group][id] || fallback;
}

export function PlayerStage({
  fatalMessage,
  roomLabel,
  state,
  status,
}: PlayerStageProps) {
  const roomMeta = resolveRoomMeta(state);
  const location = resolvePublicStageLocation(state, state.locationId);
  const npc = resolvePublicStageNpc(state, state.npcId);
  const material = resolvePublicStageMaterial(state, state.materialId);
  const connectionClassName =
    status === "connected"
      ? "connection-dot connected"
      : status === "disconnected" || status === "fatal"
        ? "connection-dot disconnected"
        : "connection-dot";

  return (
    <main className="stage player-stage" aria-live="polite">
      <img
        className="background-image"
        src={imageSource(state, "locations", location.id, location.background)}
        alt={location.name}
      />
      <div className="stage-vignette"></div>
      <div className="stage-grain"></div>

      <section className="stage-copy" aria-label="公开房间信息">
        <p className="stage-eyebrow">{roomMeta.title}</p>
        <h1>{location.name}</h1>
        {roomMeta.subtitle ? <p className="stage-subtitle">{roomMeta.subtitle}</p> : null}
        {roomMeta.playerNotice ? <p className="stage-notice">{roomMeta.playerNotice}</p> : null}
      </section>

      <section className="npc-side" aria-label="NPC 出场区">
        <div className="npc-portrait">
          {npc ? (
            <div className="npc-figure">
              <img
                className="npc-cutout"
                src={imageSource(state, "npcs", npc.id, npc.portrait)}
                alt={npc.name}
              />
            </div>
          ) : null}
        </div>
        {npc ? (
          <div className="stage-floating-card stage-floating-card-left">
            <span className="role">{npc.role}</span>
            <h3>{npc.name}</h3>
            {npc.intro ? <p>{npc.intro}</p> : null}
          </div>
        ) : null}
      </section>

      <section className="material-layer" aria-label="线索展示区">
        <div className="material-display">
          {material ? (
            <img
              className="material-image"
              src={imageSource(state, "materials", material.id, material.image)}
              alt={material.name}
            />
          ) : null}
        </div>
        {material ? (
          <div className="stage-material-caption">
            <span>{material.role}</span>
            <strong>{material.name}</strong>
            {material.description ? <p>{material.description}</p> : null}
          </div>
        ) : null}
      </section>

      <section className="stage-location-card" aria-label="场景公开信息">
        <div className="stage-location-head">
          <strong>{location.name}</strong>
          <span>{location.time}</span>
        </div>
        <p>{location.mood}</p>
      </section>

      <div className="room-indicator">
        <span className={connectionClassName}></span>
        <span>{roomLabel}</span>
      </div>

      {fatalMessage ? (
        <section className="join-error">
          <p>{fatalMessage}</p>
          <a href="/">返回平台首页</a>
        </section>
      ) : null}
    </main>
  );
}
