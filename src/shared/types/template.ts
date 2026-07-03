import type { RoomMeta } from "./content";

export interface RoomTemplateInitialStage {
  locationId: string;
  materialId: string | null;
  npcId: string | null;
  playerIds: string[];
}

export interface RoomTemplateLocation {
  background: string;
  beats: string[];
  goal: string;
  id: string;
  mood: string;
  name: string;
  read: string;
  time: string;
}

export interface RoomTemplateNpc {
  id: string;
  initial: string;
  intro?: string;
  name: string;
  note: string;
  portrait: string;
  role: string;
}

export interface RoomTemplateMaterial {
  description?: string;
  id: string;
  image: string;
  name: string;
  note: string;
  role: string;
}

export interface RoomTemplatePlayer {
  avatar?: string;
  description: string;
  id: string;
  initial: string;
  name: string;
  role: string;
}

export interface RoomTemplateDefinition {
  description: string;
  initialStage: RoomTemplateInitialStage;
  locations: RoomTemplateLocation[];
  materials: RoomTemplateMaterial[];
  name: string;
  npcs: RoomTemplateNpc[];
  players: RoomTemplatePlayer[];
  publicMaterialIds: string[];
  roomMeta: RoomMeta;
}

export interface RoomTemplateFile {
  template: RoomTemplateDefinition;
  version: 1;
}

export type BuiltinRoomTemplateId = "mist-blood-van" | "blank-stage";
export type RoomTemplateId = BuiltinRoomTemplateId | "custom-template";

export interface CreateRoomOptions {
  templateData?: RoomTemplateDefinition;
  templateId?: RoomTemplateId;
}
