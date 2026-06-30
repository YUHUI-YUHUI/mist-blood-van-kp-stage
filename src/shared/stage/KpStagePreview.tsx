import type { RoomState } from "@shared/types";
import {
  stageLocationById,
  stageMaterialById,
  stageNpcById,
  stagePlayerById,
} from "./catalog";

interface KpStagePreviewProps {
  state: RoomState;
}

function imageSource(
  state: RoomState,
  group: "locations" | "npcs" | "materials" | "players",
  id: string,
  fallback: string,
): string {
  return state.customImages[group][id] || fallback;
}

export function KpStagePreview({ state }: KpStagePreviewProps) {
  const location = stageLocationById[state.locationId] || stageLocationById.campus;
  const npc = state.npcId ? stageNpcById[state.npcId] : null;
  const material = state.materialId ? stageMaterialById[state.materialId] : null;
  const players = state.playerIds
    .map((playerId) => stagePlayerById[playerId])
    .filter(Boolean);

  return (
    <main className="stage" aria-live="polite">
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

      <section className="material-layer" aria-label="素材展示区">
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

      <section className="player-side" aria-label="玩家出场区">
        <div className="player-portraits">
          {players.map((player) => {
            const portrait = state.customImages.players[player.id];
            return (
              <article
                key={player.id}
                className={`player-token ${portrait ? "has-image" : ""}`}
                data-initial={player.initial}
              >
                {portrait ? (
                  <img
                    className="player-token-image"
                    src={imageSource(state, "players", player.id, portrait)}
                    alt={player.name}
                  />
                ) : (
                  <div className="player-token-fallback" aria-hidden="true">
                    {player.initial}
                  </div>
                )}
                <div className="player-copy">
                  <span className="role">{player.role}</span>
                  <h3>{player.name}</h3>
                  <p>{player.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={`notes-panel ${state.notesOpen ? "" : "hidden"}`}>
        <div className="notes-head">
          <h3>{location.name}</h3>
          <span>{location.time}</span>
        </div>
        <p>{location.goal}</p>
        <div className="notes-grid">
          <div>
            <h4>读白</h4>
            <p>{location.read}</p>
          </div>
          <div>
            <h4>场景要点</h4>
            <ul>
              {location.beats.map((beat) => (
                <li key={beat}>{beat}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
