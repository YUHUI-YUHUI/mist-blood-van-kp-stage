import type { CustomImages, RoomState } from "../types";

const ROOM_CODE_PATTERN = /^[A-Z2-9]{6}$/;

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
