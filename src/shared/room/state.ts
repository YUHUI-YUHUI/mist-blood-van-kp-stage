import type {
  CustomImages,
  CustomText,
  LocationItem,
  MaterialItem,
  NpcItem,
  PlayerSlot,
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

export function createDefaultRoomMeta(): RoomMeta {
  return {
    title: "雾中献血车",
    subtitle: "玩家舞台",
    playerNotice: "跟随 KP 的舞台变化查看当前场景、人物与公开线索。",
  };
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

export function createDefaultRoomState(): RoomState {
  return {
    locationId: "campus",
    npcId: null,
    materialId: null,
    playerIds: [],
    notesOpen: false,
    customImages: createEmptyCustomImages(),
    roomMeta: createDefaultRoomMeta(),
    customText: createEmptyCustomText(),
  };
}

export function normalizeRoomState(value: unknown): RoomState {
  const source = value && typeof value === "object" ? (value as Partial<RoomState>) : {};
  return {
    ...createDefaultRoomState(),
    ...source,
    playerIds: Array.isArray(source.playerIds) ? source.playerIds.map(String).slice(0, 12) : [],
    notesOpen: Boolean(source.notesOpen),
    customImages: normalizeCustomImages(source.customImages),
    roomMeta: normalizeRoomMeta(source.roomMeta),
    customText: normalizeCustomText(source.customText),
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

function normalizeRoomMeta(value: unknown): RoomMeta {
  const next = createDefaultRoomMeta();
  if (!value || typeof value !== "object") return next;
  const source = value as Partial<RoomMeta>;
  if (typeof source.title === "string") next.title = source.title;
  if (typeof source.subtitle === "string") next.subtitle = source.subtitle;
  if (typeof source.playerNotice === "string") next.playerNotice = source.playerNotice;
  return next;
}

function normalizeCustomText(value: unknown): CustomText {
  const next = createEmptyCustomText();
  if (!value || typeof value !== "object") return next;
  const source = value as Partial<CustomText>;
  next.roomMeta = normalizePartialRecord(source.roomMeta, ["title", "subtitle", "playerNotice"]);
  next.locations = normalizeContentMap<LocationItem>(source.locations, [
    "name",
    "time",
    "mood",
    "background",
  ]);
  next.npcs = normalizeContentMap<NpcItem>(source.npcs, [
    "name",
    "role",
    "intro",
    "portrait",
  ]);
  next.materials = normalizeContentMap<MaterialItem>(source.materials, [
    "name",
    "role",
    "description",
    "image",
  ]);
  next.players = normalizeContentMap<PlayerSlot>(source.players, ["name", "identity", "avatar"]);
  return next;
}

function normalizeContentMap<T extends object>(
  value: unknown,
  allowedKeys: string[],
): Record<string, Partial<T>> {
  const next: Record<string, Partial<T>> = {};
  if (!value || typeof value !== "object") return next;
  Object.entries(value as Record<string, unknown>).forEach(([id, item]) => {
    if (typeof id !== "string" || !item || typeof item !== "object") return;
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
