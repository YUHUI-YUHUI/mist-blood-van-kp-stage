import type { RoomState } from "@shared/types";
import { resolveRoomMeta, resolveStageLocation, resolveStageMaterial, resolveStageNpc, resolveStagePlayer } from "./content";

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
  const roomMeta = resolveRoomMeta(state);
  const location = resolveStageLocation(state, state.locationId);
  const npc = resolveStageNpc(state, state.npcId);
  const material = resolveStageMaterial(state, state.materialId);
  const players = state.playerIds
    .map((playerId) => resolveStagePlayer(state, playerId))
    .filter((player): player is NonNullable<typeof player> => Boolean(player));

  return (
    <main className="stage" aria-live="polite">
      <img
        className="background-image"
        src={imageSource(state, "locations", location.id, location.background)}
        alt={location.name}
      />
      <div className="stage-vignette"></div>
      <div className="stage-grain"></div>

      <section className="stage-copy stage-copy-kp" aria-label="公开文案预览">
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
        {material ? (
          <div className="stage-material-caption">
            <span>{material.role}</span>
            <strong>{material.name}</strong>
            {material.description ? <p>{material.description}</p> : null}
          </div>
        ) : null}
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

      <section className="stage-location-card" aria-label="场景信息">
        <div className="stage-location-head">
          <strong>{location.name}</strong>
          <span>{location.time}</span>
        </div>
        <p>{location.mood}</p>
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
