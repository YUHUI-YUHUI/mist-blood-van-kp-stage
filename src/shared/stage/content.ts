import { createDefaultRoomMeta } from "@shared/room/state";
import { getRoomTemplate } from "@shared/templates";
import type { RoomMeta, RoomState } from "@shared/types";
import type { StageLocation, StageMaterial, StageNpc, StagePlayer } from "./catalog";

function mergeItem<T extends object>(
  base: T,
  override?: Partial<T>,
): T {
  return override ? ({ ...base, ...override } as T) : base;
}

export function resolveRoomMeta(state: RoomState): RoomMeta {
  return mergeItem(createDefaultRoomMeta(state.templateId), state.roomMeta);
}

export function resolveStageLocation(state: RoomState, locationId: string): StageLocation {
  const template = getRoomTemplate(state.templateId);
  const fallback = template.locationById[template.initialLocationId];
  const base = template.locationById[locationId] || fallback;
  return mergeItem(base, state.customText.locations[base.id] as Partial<StageLocation> | undefined);
}

export function resolvePublicStageLocation(state: RoomState, locationId: string): StageLocation {
  const template = getRoomTemplate(state.templateId);
  const fallback = template.locationById[template.initialLocationId];
  const base = template.locationById[locationId] || fallback;
  return mergeItem(base, state.customText.locations[base.id] as Partial<StageLocation> | undefined);
}

export function resolveStageNpc(state: RoomState, npcId: string | null): StageNpc | null {
  if (!npcId) return null;
  const base = getRoomTemplate(state.templateId).npcById[npcId];
  return base ? mergeItem(base, state.customText.npcs[npcId] as Partial<StageNpc> | undefined) : null;
}

export function resolvePublicStageNpc(state: RoomState, npcId: string | null): StageNpc | null {
  if (!npcId) return null;
  const base = getRoomTemplate(state.templateId).npcById[npcId];
  return base ? mergeItem(base, state.customText.npcs[npcId] as Partial<StageNpc> | undefined) : null;
}

export function resolveStageMaterial(state: RoomState, materialId: string | null): StageMaterial | null {
  if (!materialId) return null;
  const base = getRoomTemplate(state.templateId).materialById[materialId];
  return base
    ? mergeItem(base, state.customText.materials[materialId] as Partial<StageMaterial> | undefined)
    : null;
}

export function resolvePublicStageMaterial(
  state: RoomState,
  materialId: string | null,
): StageMaterial | null {
  if (!materialId) return null;
  const base = getRoomTemplate(state.templateId).publicMaterialById[materialId];
  return base
    ? mergeItem(base, state.customText.materials[materialId] as Partial<StageMaterial> | undefined)
    : null;
}

export function resolveStagePlayer(state: RoomState, playerId: string): StagePlayer | null {
  const base = getRoomTemplate(state.templateId).playerById[playerId];
  if (!base) return null;
  const override = state.customText.players[playerId];
  return {
    ...base,
    avatar: override?.avatar,
    description: override?.identity ?? base.description,
    name: override?.name ?? base.name,
  };
}
