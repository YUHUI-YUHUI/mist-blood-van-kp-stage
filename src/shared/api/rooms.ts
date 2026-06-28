// 前后端通信封装。第一阶段直接复用现有 server.mjs 提供的接口：
//   POST   /api/rooms
//   GET    /api/rooms/:room/state
//   POST   /api/rooms/:room/state
//   POST   /api/rooms/:room/assets
//   GET    /api/rooms/:room/events   (SSE)

import type {
  CreateRoomResult,
  ImageGroup,
  RoomSnapshot,
  RoomState,
} from "../types";

const JSON_HEADERS = { "content-type": "application/json" };

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message =
      data && typeof data.error === "string"
        ? data.error
        : `请求失败（${response.status}）`;
    throw new Error(message);
  }
  return data as T;
}

/** 创建一个新房间，返回房主密钥与 KP / 玩家入口链接。 */
export async function createRoom(): Promise<CreateRoomResult> {
  const response = await fetch("/api/rooms", { method: "POST" });
  return parseJson<CreateRoomResult>(response);
}

/** 读取房间当前快照；房间不存在时抛出错误。 */
export async function getRoomState(room: string): Promise<RoomSnapshot> {
  const response = await fetch(`/api/rooms/${room}/state`);
  return parseJson<RoomSnapshot>(response);
}

/** KP 推送房间状态，需要房主密钥。 */
export async function pushRoomState(
  room: string,
  hostKey: string,
  state: RoomState,
): Promise<RoomSnapshot> {
  const response = await fetch(`/api/rooms/${room}/state`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ hostKey, state }),
  });
  return parseJson<RoomSnapshot>(response);
}

export interface UploadAssetResult {
  assetId: string;
  url: string;
}

/** KP 上传自定义图片（data URL），返回可引用的资源地址。 */
export async function uploadRoomAsset(
  room: string,
  hostKey: string,
  targetType: ImageGroup,
  targetId: string,
  dataUrl: string,
): Promise<UploadAssetResult> {
  const response = await fetch(`/api/rooms/${room}/assets`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ hostKey, targetType, targetId, dataUrl }),
  });
  return parseJson<UploadAssetResult>(response);
}

/**
 * 订阅房间实时事件（SSE）。每次收到 stage 事件回调一次最新快照。
 * 返回取消订阅函数。
 */
export function subscribeRoomEvents(
  room: string,
  onSnapshot: (snapshot: RoomSnapshot) => void,
  onError?: (event: Event) => void,
): () => void {
  const source = new EventSource(`/api/rooms/${room}/events`);
  source.addEventListener("stage", (event) => {
    try {
      onSnapshot(JSON.parse((event as MessageEvent).data) as RoomSnapshot);
    } catch {
      // 忽略无法解析的事件载荷。
    }
  });
  if (onError) source.addEventListener("error", onError);
  return () => source.close();
}
