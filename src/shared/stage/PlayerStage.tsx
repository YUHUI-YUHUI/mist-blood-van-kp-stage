import type { RoomState } from "@shared/types";
import {
  publicStageLocationById,
  publicStageMaterialById,
  publicStageNpcById,
} from "./catalog";
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
  const location = publicStageLocationById[state.locationId] || publicStageLocationById.campus;
  const npc = state.npcId ? publicStageNpcById[state.npcId] : null;
  const material = state.materialId ? publicStageMaterialById[state.materialId] : null;
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
