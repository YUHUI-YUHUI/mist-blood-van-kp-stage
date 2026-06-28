// 可编辑内容模型（前瞻定义，阶段 E 接入编辑器能力时使用）。
// 当前模组文本仍写死在前端，这里先确立“模板 + 房间覆盖”的共享契约，便于后续逐步迁移。
// 参考：docs/舞台编辑器改造任务文档.md 第 7 节“可编辑内容范围”。

export interface RoomMeta {
  title: string;
  subtitle?: string;
  /** 玩家端顶部提示语。 */
  playerNotice?: string;
}

export interface LocationItem {
  id: string;
  name: string;
  time?: string;
  /** 氛围短句。 */
  mood?: string;
  background?: string;
}

export interface NpcItem {
  id: string;
  name: string;
  /** 身份 / 角色。 */
  role?: string;
  intro?: string;
  portrait?: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  /** 类型标签。 */
  kind?: string;
  description?: string;
  image?: string;
}

export interface PlayerSlot {
  id: string;
  name: string;
  /** 身份描述。 */
  identity?: string;
  avatar?: string;
}

/** 房间对默认模板文本的覆盖层。 */
export interface CustomText {
  roomMeta?: Partial<RoomMeta>;
  locations?: Record<string, Partial<LocationItem>>;
  npcs?: Record<string, Partial<NpcItem>>;
  materials?: Record<string, Partial<MaterialItem>>;
  players?: Record<string, Partial<PlayerSlot>>;
}
