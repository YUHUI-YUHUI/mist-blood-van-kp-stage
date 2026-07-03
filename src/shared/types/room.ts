// 房间运行时状态类型。
// 与当前 server.mjs 返回的数据结构对齐：publicRoom() 返回 { room, state, revision, updatedAt }。

import type { CustomText, RoomMeta } from "./content";
import type { RoomTemplateDefinition, RoomTemplateId } from "./template";

/** 可上传自定义图片的内容分组，对应 server.mjs 的 IMAGE_GROUPS。 */
export type ImageGroup = "locations" | "npcs" | "materials" | "players";

/** 每个分组下 id -> 图片 URL 的映射。 */
export type CustomImages = Record<ImageGroup, Record<string, string>>;

/** 舞台运行时状态：KP 当前展示的内容。 */
export interface StageState {
  locationId: string;
  npcId: string | null;
  materialId: string | null;
  playerIds: string[];
  notesOpen: boolean;
  customImages: CustomImages;
}

/**
 * 房间状态。
 * 除了运行时舞台切换外，还包含房间级元信息与文本覆盖层，
 * 用于承接编辑模式下的公开文案修改。
 */
export interface RoomState extends StageState {
  customText: CustomText;
  templateData: RoomTemplateDefinition | null;
  roomMeta: RoomMeta;
  templateId: RoomTemplateId;
}

/** GET / POST state、SSE 推送返回的房间快照。 */
export interface RoomSnapshot {
  room: string;
  state: RoomState;
  revision: number;
  updatedAt: number;
}

/** POST /api/rooms 创建房间后返回的结果。 */
export interface CreateRoomResult extends RoomSnapshot {
  hostKey: string;
  hostUrl: string;
  playerUrl: string;
}
