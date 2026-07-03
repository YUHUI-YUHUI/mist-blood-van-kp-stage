import {
  publicStageMaterials,
  stageLocations,
  stageMaterials,
  stageNpcs,
  stagePlayers,
} from "@shared/stage/catalog";
import type {
  BuiltinRoomTemplateId,
  RoomState,
  RoomTemplateDefinition,
  RoomTemplateFile,
  RoomTemplateId,
  RoomTemplateInitialStage,
  RoomTemplateLocation,
  RoomTemplateMaterial,
  RoomTemplateNpc,
  RoomTemplatePlayer,
} from "@shared/types";

function mapById<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>;
}

export interface RoomTemplateSummary {
  description: string;
  id: BuiltinRoomTemplateId;
  name: string;
}

export interface RoomTemplate extends RoomTemplateDefinition {
  id: RoomTemplateId;
  locationById: Record<string, RoomTemplateLocation>;
  materialById: Record<string, RoomTemplateMaterial>;
  npcById: Record<string, RoomTemplateNpc>;
  playerById: Record<string, RoomTemplatePlayer>;
  publicMaterials: RoomTemplateMaterial[];
  publicMaterialById: Record<string, RoomTemplateMaterial>;
}

export const DEFAULT_ROOM_TEMPLATE_ID: BuiltinRoomTemplateId = "mist-blood-van";
export const BLANK_ROOM_TEMPLATE_ID: BuiltinRoomTemplateId = "blank-stage";
export const CUSTOM_ROOM_TEMPLATE_ID: RoomTemplateId = "custom-template";

const blankStageLocations: RoomTemplateLocation[] = [
  {
    id: "blank-hall",
    name: "空白舞台",
    time: "待定",
    mood: "等待 KP 配置场景、氛围和公开信息。",
    background: "/assets/locations/oxford-campus-bg.png",
    goal: "在编辑模式下补齐场景标题、时间、氛围与幕后备注。",
    read: "这是一个空白房间。你可以从右侧编辑面板开始填写公开文案，再逐步补入图片与幕后节奏。",
    beats: [
      "先设置房间标题与玩家提示语。",
      "再配置地点、NPC、素材和玩家席位。",
      "确认玩家端只看到公开内容。",
    ],
  },
];

const blankStagePlayers: RoomTemplatePlayer[] = [
  {
    id: "p1",
    name: "席位一",
    role: "玩家席位",
    initial: "1",
    description: "用于标记当前在场玩家或角色。",
  },
  {
    id: "p2",
    name: "席位二",
    role: "玩家席位",
    initial: "2",
    description: "用于标记当前在场玩家或角色。",
  },
  {
    id: "p3",
    name: "席位三",
    role: "玩家席位",
    initial: "3",
    description: "用于标记当前在场玩家或角色。",
  },
  {
    id: "p4",
    name: "席位四",
    role: "玩家席位",
    initial: "4",
    description: "用于标记当前在场玩家或角色。",
  },
];

function createRoomTemplate(
  template: RoomTemplateDefinition & { id: RoomTemplateId },
): RoomTemplate {
  const publicMaterials = template.materials.filter((material) =>
    template.publicMaterialIds.includes(material.id),
  );
  return {
    ...template,
    locationById: mapById(template.locations),
    materialById: mapById(template.materials),
    npcById: mapById(template.npcs),
    playerById: mapById(template.players),
    publicMaterials,
    publicMaterialById: mapById(publicMaterials),
  };
}

const builtinRoomTemplates: RoomTemplate[] = [
  createRoomTemplate({
    id: DEFAULT_ROOM_TEMPLATE_ID,
    name: "雾中献血车",
    description: "使用当前预设模组、素材与 NPC 名录开房。",
    roomMeta: {
      title: "雾中献血车",
      subtitle: "玩家舞台",
      playerNotice: "跟随 KP 的舞台变化查看当前场景、人物与公开线索。",
    },
    initialStage: {
      locationId: "campus",
      npcId: null,
      materialId: null,
      playerIds: [],
    },
    locations: stageLocations,
    npcs: stageNpcs,
    materials: stageMaterials,
    publicMaterialIds: publicStageMaterials.map((material) => material.id),
    players: stagePlayers,
  }),
  createRoomTemplate({
    id: BLANK_ROOM_TEMPLATE_ID,
    name: "空白房间",
    description: "从空白舞台开始，自行填写文本、图片和演出结构。",
    roomMeta: {
      title: "空白房间",
      subtitle: "自定义舞台",
      playerNotice: "等待 KP 配置当前场景与公开信息。",
    },
    initialStage: {
      locationId: "blank-hall",
      npcId: null,
      materialId: null,
      playerIds: [],
    },
    locations: blankStageLocations,
    npcs: [],
    materials: [],
    publicMaterialIds: [],
    players: blankStagePlayers,
  }),
];

const builtinRoomTemplateById = Object.fromEntries(
  builtinRoomTemplates.map((template) => [template.id, template]),
) as Record<BuiltinRoomTemplateId, RoomTemplate>;

export const roomTemplateOptions: RoomTemplateSummary[] = builtinRoomTemplates.map(
  ({ description, id, name }) => ({ description, id: id as BuiltinRoomTemplateId, name }),
);

export function isBuiltinRoomTemplateId(value: unknown): value is BuiltinRoomTemplateId {
  return typeof value === "string" && value in builtinRoomTemplateById;
}

export function isRoomTemplateId(value: unknown): value is RoomTemplateId {
  return value === CUSTOM_ROOM_TEMPLATE_ID || isBuiltinRoomTemplateId(value);
}

export function sanitizeRoomTemplateDefinition(
  value: unknown,
): RoomTemplateDefinition | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Partial<RoomTemplateDefinition>;
  const locations = sanitizeTemplateLocations(source.locations);
  const npcs = sanitizeTemplateNpcs(source.npcs);
  const materials = sanitizeTemplateMaterials(source.materials);
  const players = sanitizeTemplatePlayers(source.players);
  if (locations.length === 0) return null;

  const locationIds = new Set(locations.map((item) => item.id));
  const npcIds = new Set(npcs.map((item) => item.id));
  const materialIds = new Set(materials.map((item) => item.id));
  const playerIds = new Set(players.map((item) => item.id));

  const initialStage = sanitizeInitialStage(source.initialStage, {
    locationIds,
    npcIds,
    materialIds,
    playerIds,
    fallbackLocationId: locations[0].id,
  });

  return {
    name: sanitizeString(source.name, "导入模板"),
    description: sanitizeString(source.description, "从模板文件导入的房间模板。"),
    roomMeta: sanitizeRoomMeta(source.roomMeta, {
      title: sanitizeString(source.name, "导入模板"),
      subtitle: "玩家舞台",
      playerNotice: "跟随 KP 的舞台变化查看当前场景、人物与公开线索。",
    }),
    initialStage,
    locations,
    npcs,
    materials,
    publicMaterialIds: sanitizePublicMaterialIds(source.publicMaterialIds, materialIds),
    players,
  };
}

export function hydrateRoomTemplate(
  templateDefinition: RoomTemplateDefinition,
  id: RoomTemplateId = CUSTOM_ROOM_TEMPLATE_ID,
): RoomTemplate {
  return createRoomTemplate({
    ...templateDefinition,
    id,
  });
}

export function getRoomTemplate(
  templateId?: RoomTemplateId | string,
  templateData?: RoomTemplateDefinition | null,
): RoomTemplate {
  if (templateId === CUSTOM_ROOM_TEMPLATE_ID && templateData) {
    return hydrateRoomTemplate(templateData, CUSTOM_ROOM_TEMPLATE_ID);
  }
  if (templateId && isBuiltinRoomTemplateId(templateId)) return builtinRoomTemplateById[templateId];
  return builtinRoomTemplateById[DEFAULT_ROOM_TEMPLATE_ID];
}

export function getRoomTemplateFromState(state: Pick<RoomState, "templateData" | "templateId">): RoomTemplate {
  return getRoomTemplate(state.templateId, state.templateData);
}

export function createTemplateFile(templateDefinition: RoomTemplateDefinition): RoomTemplateFile {
  return {
    version: 1,
    template: templateDefinition,
  };
}

export function parseTemplateFile(text: string): RoomTemplateDefinition {
  const value = JSON.parse(text) as Partial<RoomTemplateFile> | RoomTemplateDefinition;
  const definition = "template" in value ? value.template : value;
  const sanitized = sanitizeRoomTemplateDefinition(definition);
  if (!sanitized) throw new Error("模板文件内容无效");
  return sanitized;
}

function sanitizeString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function sanitizeRoomMeta(value: unknown, fallback: { playerNotice: string; subtitle: string; title: string }) {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    title: sanitizeString(source.title, fallback.title),
    subtitle: typeof source.subtitle === "string" ? source.subtitle : fallback.subtitle,
    playerNotice:
      typeof source.playerNotice === "string" ? source.playerNotice : fallback.playerNotice,
  };
}

function sanitizeTemplateLocations(value: unknown): RoomTemplateLocation[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => sanitizeTemplateLocation(item, index))
    .filter((item): item is RoomTemplateLocation => Boolean(item));
}

function sanitizeTemplateLocation(value: unknown, index: number): RoomTemplateLocation | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const id = sanitizeIdentifier(source.id, `location-${index + 1}`);
  return {
    id,
    name: sanitizeString(source.name, `场景 ${index + 1}`),
    time: typeof source.time === "string" ? source.time : "",
    mood: typeof source.mood === "string" ? source.mood : "",
    background: typeof source.background === "string" ? source.background : "/assets/locations/oxford-campus-bg.png",
    goal: typeof source.goal === "string" ? source.goal : "",
    read: typeof source.read === "string" ? source.read : "",
    beats: Array.isArray(source.beats)
      ? source.beats.filter((item): item is string => typeof item === "string").slice(0, 12)
      : [],
  };
}

function sanitizeTemplateNpcs(value: unknown): RoomTemplateNpc[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => sanitizeTemplateNpc(item, index))
    .filter((item): item is RoomTemplateNpc => Boolean(item));
}

function sanitizeTemplateNpc(value: unknown, index: number): RoomTemplateNpc | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const id = sanitizeIdentifier(source.id, `npc-${index + 1}`);
  return {
    id,
    initial: typeof source.initial === "string" ? source.initial : String(index + 1),
    intro: typeof source.intro === "string" ? source.intro : "",
    name: sanitizeString(source.name, `NPC ${index + 1}`),
    note: typeof source.note === "string" ? source.note : "",
    portrait: typeof source.portrait === "string" ? source.portrait : "",
    role: typeof source.role === "string" ? source.role : "",
  };
}

function sanitizeTemplateMaterials(value: unknown): RoomTemplateMaterial[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => sanitizeTemplateMaterial(item, index))
    .filter((item): item is RoomTemplateMaterial => Boolean(item));
}

function sanitizeTemplateMaterial(value: unknown, index: number): RoomTemplateMaterial | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const id = sanitizeIdentifier(source.id, `material-${index + 1}`);
  return {
    id,
    description: typeof source.description === "string" ? source.description : "",
    image: typeof source.image === "string" ? source.image : "",
    name: sanitizeString(source.name, `素材 ${index + 1}`),
    note: typeof source.note === "string" ? source.note : "",
    role: typeof source.role === "string" ? source.role : "",
  };
}

function sanitizeTemplatePlayers(value: unknown): RoomTemplatePlayer[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => sanitizeTemplatePlayer(item, index))
    .filter((item): item is RoomTemplatePlayer => Boolean(item));
}

function sanitizeTemplatePlayer(value: unknown, index: number): RoomTemplatePlayer | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const id = sanitizeIdentifier(source.id, `player-${index + 1}`);
  return {
    id,
    avatar: typeof source.avatar === "string" ? source.avatar : "",
    description: typeof source.description === "string" ? source.description : "",
    initial: typeof source.initial === "string" ? source.initial : String(index + 1),
    name: sanitizeString(source.name, `席位 ${index + 1}`),
    role: typeof source.role === "string" ? source.role : "玩家席位",
  };
}

function sanitizeIdentifier(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

function sanitizePublicMaterialIds(value: unknown, materialIds: Set<string>): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && materialIds.has(item))
    .slice(0, 48);
}

function sanitizeInitialStage(
  value: unknown,
  context: {
    fallbackLocationId: string;
    locationIds: Set<string>;
    materialIds: Set<string>;
    npcIds: Set<string>;
    playerIds: Set<string>;
  },
): RoomTemplateInitialStage {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    locationId:
      typeof source.locationId === "string" && context.locationIds.has(source.locationId)
        ? source.locationId
        : context.fallbackLocationId,
    npcId:
      typeof source.npcId === "string" && context.npcIds.has(source.npcId) ? source.npcId : null,
    materialId:
      typeof source.materialId === "string" && context.materialIds.has(source.materialId)
        ? source.materialId
        : null,
    playerIds: Array.isArray(source.playerIds)
      ? source.playerIds
          .filter((item): item is string => typeof item === "string" && context.playerIds.has(item))
          .slice(0, 12)
      : [],
  };
}
