import { createDefaultRoomMeta } from "@shared/room/state";
import { getRoomTemplateFromState } from "@shared/templates";
import type { RoomMeta, RoomState } from "@shared/types";
import type { StageLocation, StageMaterial, StageNpc, StagePlayer } from "./catalog";

function mergeItem<T extends object>(
  base: T,
  override?: Partial<T>,
): T {
  return override ? ({ ...base, ...override } as T) : base;
}

export function resolveRoomMeta(state: RoomState): RoomMeta {
  return mergeItem(createDefaultRoomMeta(state.templateId, state.templateData), state.roomMeta);
}

export function resolveStageLocation(state: RoomState, locationId: string): StageLocation {
  const template = getRoomTemplateFromState(state);
  const fallback = template.locationById[template.initialStage.locationId];
  const base = template.locationById[locationId] || fallback;
  return mergeItem(base, state.customText.locations[base.id] as Partial<StageLocation> | undefined);
}

export function resolvePublicStageLocation(state: RoomState, locationId: string): StageLocation {
  const template = getRoomTemplateFromState(state);
  const fallback = template.locationById[template.initialStage.locationId];
  const base = template.locationById[locationId] || fallback;
  return mergeItem(base, state.customText.locations[base.id] as Partial<StageLocation> | undefined);
}

export function resolveStageNpc(state: RoomState, npcId: string | null): StageNpc | null {
  if (!npcId) return null;
  const base = getRoomTemplateFromState(state).npcById[npcId];
  return base ? mergeItem(base, state.customText.npcs[npcId] as Partial<StageNpc> | undefined) : null;
}

export function resolvePublicStageNpc(state: RoomState, npcId: string | null): StageNpc | null {
  if (!npcId) return null;
  const base = getRoomTemplateFromState(state).npcById[npcId];
  return base ? mergeItem(base, state.customText.npcs[npcId] as Partial<StageNpc> | undefined) : null;
}

export function resolveStageMaterial(state: RoomState, materialId: string | null): StageMaterial | null {
  if (!materialId) return null;
  const base = getRoomTemplateFromState(state).materialById[materialId];
  return base
    ? mergeItem(base, state.customText.materials[materialId] as Partial<StageMaterial> | undefined)
    : null;
}

export function resolvePublicStageMaterial(
  state: RoomState,
  materialId: string | null,
): StageMaterial | null {
  if (!materialId) return null;
  const base = getRoomTemplateFromState(state).publicMaterialById[materialId];
  return base
    ? mergeItem(base, state.customText.materials[materialId] as Partial<StageMaterial> | undefined)
    : null;
}

export function resolveStagePlayer(state: RoomState, playerId: string): StagePlayer | null {
  const base = getRoomTemplateFromState(state).playerById[playerId];
  if (!base) return null;
  const override = state.customText.players[playerId];
  return {
    ...base,
    avatar: override?.avatar,
    description: override?.identity ?? base.description,
    name: override?.name ?? base.name,
  };
}
