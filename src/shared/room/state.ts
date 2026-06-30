import type { CustomImages, RoomState } from "../types";

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

export function createDefaultRoomState(): RoomState {
  return {
    locationId: "campus",
    npcId: null,
    materialId: null,
    playerIds: [],
    notesOpen: false,
    customImages: createEmptyCustomImages(),
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
