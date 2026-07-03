import {
  CUSTOM_ROOM_TEMPLATE_ID,
  DEFAULT_ROOM_TEMPLATE_ID,
  getRoomTemplate,
  isBuiltinRoomTemplateId,
  sanitizeRoomTemplateDefinition,
} from "@shared/templates";
import type {
  CustomImages,
  CustomText,
  LocationItem,
  MaterialItem,
  NpcItem,
  PlayerSlot,
  RoomTemplateDefinition,
  RoomTemplateId,
  RoomMeta,
  RoomState,
} from "../types";

const ROOM_CODE_PATTERN = /^[A-Z2-9]{6}$/;
const ROOM_STATE_STORAGE_KEY = "mistBloodVanStageState";

export function createEmptyCustomImages(): CustomImages {
  return {
    locations: {},
    npcs: {},
    materials: {},
    players: {},
  };
}

export function createDefaultRoomMeta(
  templateId: RoomTemplateId = DEFAULT_ROOM_TEMPLATE_ID,
  templateData: RoomTemplateDefinition | null = null,
): RoomMeta {
  return { ...getRoomTemplate(templateId, templateData).roomMeta };
}

export function createEmptyCustomText(): CustomText {
  return {
    roomMeta: {},
    locations: {},
    npcs: {},
    materials: {},
    players: {},
  };
}

export function createDefaultRoomState(
  templateId: RoomTemplateId = DEFAULT_ROOM_TEMPLATE_ID,
  templateData: RoomTemplateDefinition | null = null,
): RoomState {
  const template = getRoomTemplate(templateId, templateData);
  return {
    templateId: template.id,
    templateData: template.id === CUSTOM_ROOM_TEMPLATE_ID ? templateData : null,
    locationId: template.initialStage.locationId,
    npcId: template.initialStage.npcId,
    materialId: template.initialStage.materialId,
    playerIds: template.initialStage.playerIds,
    notesOpen: false,
    customImages: createEmptyCustomImages(),
    roomMeta: createDefaultRoomMeta(template.id, templateData),
    customText: createEmptyCustomText(),
  };
}

export function normalizeRoomState(value: unknown): RoomState {
  const source = value && typeof value === "object" ? (value as Partial<RoomState>) : {};
  const templateData = sanitizeRoomTemplateDefinition(source.templateData);
  const templateId =
    templateData
      ? CUSTOM_ROOM_TEMPLATE_ID
      : isBuiltinRoomTemplateId(source.templateId)
        ? source.templateId
        : DEFAULT_ROOM_TEMPLATE_ID;
  const template = getRoomTemplate(templateId, templateData);
  const templatePlayerIds = new Set(template.players.map((player) => player.id));
  return {
    ...createDefaultRoomState(template.id, templateData),
    ...source,
    templateId: template.id,
    templateData,
    locationId:
      typeof source.locationId === "string" && source.locationId in template.locationById
        ? source.locationId
        : template.initialStage.locationId,
    npcId:
      typeof source.npcId === "string" && source.npcId in template.npcById
        ? source.npcId
        : template.initialStage.npcId,
    materialId:
      typeof source.materialId === "string" && source.materialId in template.materialById
        ? source.materialId
        : template.initialStage.materialId,
    playerIds: Array.isArray(source.playerIds)
      ? source.playerIds.map(String).filter((id) => templatePlayerIds.has(id)).slice(0, 12)
      : template.initialStage.playerIds,
    notesOpen: Boolean(source.notesOpen),
    customImages: normalizeCustomImages(source.customImages),
    roomMeta: normalizeRoomMeta(source.roomMeta, template.id, templateData),
    customText: normalizeCustomText(source.customText, template),
  };
}

export function loadStoredRoomState(): RoomState {
  try {
    return normalizeRoomState(JSON.parse(localStorage.getItem(ROOM_STATE_STORAGE_KEY) || "{}"));
  } catch {
    return createDefaultRoomState();
  }
}

export function storeRoomState(state: RoomState): void {
  localStorage.setItem(ROOM_STATE_STORAGE_KEY, JSON.stringify(state));
}

export function normalizeRoomCode(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z2-9]/g, "")
    .slice(0, 6);
}

export function isValidRoomCode(value: string): boolean {
  return ROOM_CODE_PATTERN.test(value);
}

export function readRoomCodeFromSearch(search: string): string {
  const value = new URLSearchParams(search).get("room") || "";
  return normalizeRoomCode(value);
}

export function readHostKeyFromSearch(search: string): string {
  return new URLSearchParams(search).get("key") || "";
}

function normalizeCustomImages(value: unknown): CustomImages {
  const next = createEmptyCustomImages();
  if (!value || typeof value !== "object") return next;
  const sourceGroups = value as Record<string, unknown>;
  Object.keys(next).forEach((group) => {
    const source = sourceGroups[group];
    if (!source || typeof source !== "object") return;
    Object.entries(source).forEach(([id, url]) => {
      if (typeof id === "string" && typeof url === "string") {
        next[group as keyof CustomImages][id] = url;
      }
    });
  });
  return next;
}

function normalizeRoomMeta(
  value: unknown,
  templateId: RoomTemplateId = DEFAULT_ROOM_TEMPLATE_ID,
  templateData: RoomTemplateDefinition | null = null,
): RoomMeta {
  const next = createDefaultRoomMeta(templateId, templateData);
  if (!value || typeof value !== "object") return next;
  const source = value as Partial<RoomMeta>;
  if (typeof source.title === "string") next.title = source.title;
  if (typeof source.subtitle === "string") next.subtitle = source.subtitle;
  if (typeof source.playerNotice === "string") next.playerNotice = source.playerNotice;
  return next;
}

function normalizeCustomText(
  value: unknown,
  template: ReturnType<typeof getRoomTemplate>,
): CustomText {
  const next = createEmptyCustomText();
  if (!value || typeof value !== "object") return next;
  const source = value as Partial<CustomText>;
  next.roomMeta = normalizePartialRecord(source.roomMeta, ["title", "subtitle", "playerNotice"]);
  next.locations = normalizeContentMap<LocationItem>(
    source.locations,
    ["name", "time", "mood", "background"],
    Object.keys(template.locationById),
  );
  next.npcs = normalizeContentMap<NpcItem>(
    source.npcs,
    ["name", "role", "intro", "portrait"],
    Object.keys(template.npcById),
  );
  next.materials = normalizeContentMap<MaterialItem>(
    source.materials,
    ["name", "role", "description", "image"],
    Object.keys(template.materialById),
  );
  next.players = normalizeContentMap<PlayerSlot>(
    source.players,
    ["name", "identity", "avatar"],
    Object.keys(template.playerById),
  );
  return next;
}

function normalizeContentMap<T extends object>(
  value: unknown,
  allowedKeys: string[],
  allowedIds: string[],
): Record<string, Partial<T>> {
  const next: Record<string, Partial<T>> = {};
  if (!value || typeof value !== "object") return next;
  const allowedIdSet = new Set(allowedIds);
  Object.entries(value as Record<string, unknown>).forEach(([id, item]) => {
    if (typeof id !== "string" || !allowedIdSet.has(id) || !item || typeof item !== "object") return;
    const normalized = normalizePartialRecord(item, allowedKeys) as Partial<T>;
    if (Object.keys(normalized).length > 0) next[id] = normalized;
  });
  return next;
}

function normalizePartialRecord(value: unknown, allowedKeys: string[]): Record<string, string> {
  const next: Record<string, string> = {};
  if (!value || typeof value !== "object") return next;
  allowedKeys.forEach((key) => {
    const fieldValue = (value as Record<string, unknown>)[key];
    if (typeof fieldValue === "string") next[key] = fieldValue;
  });
  return next;
}
