import type { RoomMeta } from "@shared/types/content";
import type { RoomTemplateId } from "@shared/types/template";
import {
  publicStageMaterials,
  stageLocations,
  stageMaterials,
  stageNpcs,
  stagePlayers,
  type StageLocation,
  type StageMaterial,
  type StageNpc,
  type StagePlayer,
} from "@shared/stage/catalog";

function mapById<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>;
}

export interface RoomTemplateSummary {
  description: string;
  id: RoomTemplateId;
  name: string;
}

export interface RoomTemplate extends RoomTemplateSummary {
  initialLocationId: string;
  locationById: Record<string, StageLocation>;
  locations: StageLocation[];
  materialById: Record<string, StageMaterial>;
  materials: StageMaterial[];
  npcById: Record<string, StageNpc>;
  npcs: StageNpc[];
  playerById: Record<string, StagePlayer>;
  players: StagePlayer[];
  publicMaterialById: Record<string, StageMaterial>;
  publicMaterials: StageMaterial[];
  roomMeta: RoomMeta;
}

export const DEFAULT_ROOM_TEMPLATE_ID: RoomTemplateId = "mist-blood-van";
export const BLANK_ROOM_TEMPLATE_ID: RoomTemplateId = "blank-stage";

const blankStageLocations: StageLocation[] = [
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

const blankStagePlayers: StagePlayer[] = [
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
  template: Omit<
    RoomTemplate,
    | "locationById"
    | "materialById"
    | "npcById"
    | "playerById"
    | "publicMaterialById"
  >,
): RoomTemplate {
  return {
    ...template,
    locationById: mapById(template.locations),
    materialById: mapById(template.materials),
    npcById: mapById(template.npcs),
    playerById: mapById(template.players),
    publicMaterialById: mapById(template.publicMaterials),
  };
}

export const roomTemplates: RoomTemplate[] = [
  createRoomTemplate({
    id: DEFAULT_ROOM_TEMPLATE_ID,
    name: "雾中献血车",
    description: "使用当前预设模组、素材与 NPC 名录开房。",
    roomMeta: {
      title: "雾中献血车",
      subtitle: "玩家舞台",
      playerNotice: "跟随 KP 的舞台变化查看当前场景、人物与公开线索。",
    },
    initialLocationId: "campus",
    locations: stageLocations,
    npcs: stageNpcs,
    publicMaterials: publicStageMaterials,
    materials: stageMaterials,
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
    initialLocationId: "blank-hall",
    locations: blankStageLocations,
    npcs: [],
    publicMaterials: [],
    materials: [],
    players: blankStagePlayers,
  }),
];

const roomTemplateById = Object.fromEntries(
  roomTemplates.map((template) => [template.id, template]),
) as Record<RoomTemplateId, RoomTemplate>;

export const roomTemplateOptions: RoomTemplateSummary[] = roomTemplates.map(
  ({ description, id, name }) => ({ description, id, name }),
);

export function isRoomTemplateId(value: unknown): value is RoomTemplateId {
  return typeof value === "string" && value in roomTemplateById;
}

export function getRoomTemplate(templateId?: RoomTemplateId | string): RoomTemplate {
  if (templateId && isRoomTemplateId(templateId)) return roomTemplateById[templateId];
  return roomTemplateById[DEFAULT_ROOM_TEMPLATE_ID];
}
