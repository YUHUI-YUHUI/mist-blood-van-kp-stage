import { startTransition, useEffect, useRef, useState } from "react";
import { getRoomState, pushRoomState, uploadRoomAsset } from "@shared/api";
import type { CustomText, ImageGroup, RoomMeta, RoomState } from "@shared/types";
import {
  createDefaultRoomMeta,
  loadStoredRoomState,
  normalizeRoomState,
  storeRoomState,
} from "./state";

const ROOM_SYNC_DELAY_MS = 60;

export interface PendingUploadTarget {
  group: ImageGroup;
  id: string;
  name: string;
}

type RoomStatusTone = "default" | "error";
type ContentGroup = Exclude<keyof CustomText, "roomMeta">;

interface KpRoomState {
  roomStatus: string;
  roomStatusTone: RoomStatusTone;
  roomToolsVisible: boolean;
  state: RoomState;
}

function createInitialStatus(roomCode: string): Pick<KpRoomState, "roomStatus" | "roomStatusTone"> {
  if (!roomCode) {
    return {
      roomStatus: "本地预演模式，未连接实时房间",
      roomStatusTone: "default",
    };
  }
  return {
    roomStatus: "正在连接房间…",
    roomStatusTone: "default",
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

export function useKpRoom(roomCode: string, hostKey: string) {
  const [roomState, setRoomState] = useState<KpRoomState>(() => ({
    ...createInitialStatus(roomCode),
    roomToolsVisible: Boolean(roomCode),
    state: loadStoredRoomState(),
  }));
  const pendingUploadRef = useRef<PendingUploadTarget | null>(null);
  const stateRef = useRef(roomState.state);
  const syncTimerRef = useRef<number | null>(null);
  const hasHostAccess = Boolean(roomCode && hostKey);

  function setStatus(roomStatus: string, roomStatusTone: RoomStatusTone = "default") {
    setRoomState((current) => ({
      ...current,
      roomStatus,
      roomStatusTone,
    }));
  }

  function syncLocalState(next: RoomState) {
    stateRef.current = next;
    storeRoomState(next);
  }

  async function pushLatestRoomState() {
    if (!roomCode || !hostKey) return;

    setStatus("正在同步给玩家…");
    try {
      const snapshot = await pushRoomState(roomCode, hostKey, stateRef.current);
      const next = normalizeRoomState({
        ...snapshot.state,
        notesOpen: stateRef.current.notesOpen,
      });
      syncLocalState(next);
      startTransition(() => {
        setRoomState((current) => ({
          ...current,
          roomStatus: "舞台已同步",
          roomStatusTone: "default",
          state: next,
        }));
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "同步失败";
      setStatus(message, "error");
    }
  }

  function scheduleSync() {
    if (!hasHostAccess) return;
    if (syncTimerRef.current !== null) window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(() => {
      syncTimerRef.current = null;
      void pushLatestRoomState();
    }, ROOM_SYNC_DELAY_MS);
  }

  function commitState(updater: (current: RoomState) => RoomState, sync = true) {
    setRoomState((current) => {
      const next = normalizeRoomState(updater(current.state));
      syncLocalState(next);
      if (sync) scheduleSync();
      return {
        ...current,
        state: next,
      };
    });
  }

  useEffect(() => {
    if (!roomCode) return;

    let disposed = false;

    async function connectRoom() {
      if (!hostKey) {
        setStatus("缺少房主密钥，此页面只能查看", "error");
        return;
      }

      try {
        const snapshot = await getRoomState(roomCode);
        if (disposed) return;
        const next = normalizeRoomState({
          ...snapshot.state,
          notesOpen: stateRef.current.notesOpen,
        });
        syncLocalState(next);
        startTransition(() => {
          setRoomState((current) => ({
            ...current,
            roomStatus: "房间已连接，舞台变更会自动同步",
            roomStatusTone: "default",
            roomToolsVisible: true,
            state: next,
          }));
        });
      } catch (error) {
        if (disposed) return;
        const message = error instanceof Error ? error.message : "房间不存在或服务已重启";
        setStatus(message, "error");
      }
    }

    void connectRoom();

    return () => {
      disposed = true;
    };
  }, [hostKey, roomCode]);

  useEffect(() => {
    return () => {
      if (syncTimerRef.current !== null) window.clearTimeout(syncTimerRef.current);
    };
  }, []);

  return {
    canUpload: hasHostAccess,
    roomCode,
    roomStatus: roomState.roomStatus,
    roomStatusTone: roomState.roomStatusTone,
    roomToolsVisible: roomState.roomToolsVisible,
    state: roomState.state,
    beginUpload(target: PendingUploadTarget): boolean {
      if (!hasHostAccess) {
        setStatus("只有创建房间的 KP 可以上传图片", "error");
        return false;
      }
      pendingUploadRef.current = target;
      return true;
    },
    clearMaterial() {
      commitState((current) => ({ ...current, materialId: null }));
    },
    clearNpc() {
      commitState((current) => ({ ...current, npcId: null }));
    },
    clearPlayers() {
      commitState((current) => ({ ...current, playerIds: [] }));
    },
    removeCustomImage(group: ImageGroup, id: string) {
      if (!stateRef.current.customImages[group]?.[id]) return;
      commitState((current) => {
        const nextGroup = { ...current.customImages[group] };
        delete nextGroup[id];
        return {
          ...current,
          customImages: {
            ...current.customImages,
            [group]: nextGroup,
          },
        };
      });
      setStatus("已恢复默认图片");
    },
    resetStage() {
      commitState((current) =>
        normalizeRoomState({
          locationId: "campus",
          npcId: null,
          materialId: null,
          playerIds: [],
          notesOpen: false,
          customImages: current.customImages,
          roomMeta: current.roomMeta,
          customText: current.customText,
        }),
      );
    },
    resetRoomMeta() {
      const defaults = createDefaultRoomMeta();
      commitState((current) => ({
        ...current,
        roomMeta: defaults,
        customText: {
          ...current.customText,
          roomMeta: {},
        },
      }));
      setStatus("已恢复房间公开文案默认值");
    },
    resetTextOverride(group: ContentGroup, id: string) {
      if (!stateRef.current.customText[group]?.[id]) return;
      commitState((current) => {
        const nextGroup = { ...(current.customText[group] as Record<string, unknown>) };
        delete nextGroup[id];
        return {
          ...current,
          customText: {
            ...current.customText,
            [group]: nextGroup,
          },
        };
      });
      setStatus("已恢复默认文案");
    },
    setLocation(locationId: string) {
      commitState((current) => ({ ...current, locationId }));
    },
    async submitPendingUpload(file: File) {
      const target = pendingUploadRef.current;
      pendingUploadRef.current = null;
      if (!file || !target) return;

      if (!file.type.startsWith("image/")) {
        setStatus("请选择图片文件", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setStatus("图片不能超过 5MB", "error");
        return;
      }

      setStatus(`正在上传 ${target.name} 图片…`);
      try {
        const dataUrl = await fileToDataUrl(file);
        const upload = await uploadRoomAsset(roomCode, hostKey, target.group, target.id, dataUrl);
        commitState((current) => ({
          ...current,
          customImages: {
            ...current.customImages,
            [target.group]: {
              ...current.customImages[target.group],
              [target.id]: upload.url,
            },
          },
        }));
        setStatus(`${target.name} 图片已上传，正在同步`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "上传图片失败";
        setStatus(message, "error");
      }
    },
    toggleMaterial(materialId: string) {
      commitState((current) => ({
        ...current,
        materialId: current.materialId === materialId ? null : materialId,
      }));
    },
    toggleNotes() {
      commitState((current) => ({ ...current, notesOpen: !current.notesOpen }), false);
    },
    toggleNpc(npcId: string) {
      commitState((current) => ({
        ...current,
        npcId: current.npcId === npcId ? null : npcId,
      }));
    },
    togglePlayer(playerId: string) {
      commitState((current) => ({
        ...current,
        playerIds: current.playerIds.includes(playerId)
          ? current.playerIds.filter((id) => id !== playerId)
          : [...current.playerIds, playerId],
      }));
    },
    updateRoomMeta(field: keyof RoomMeta, value: string) {
      commitState((current) => ({
        ...current,
        roomMeta: {
          ...current.roomMeta,
          [field]: value,
        },
        customText: {
          ...current.customText,
          roomMeta: {
            ...current.customText.roomMeta,
            [field]: value,
          },
        },
      }));
    },
    updateTextOverride<
      TGroup extends ContentGroup,
      TField extends string,
    >(group: TGroup, id: string, field: TField, value: string) {
      commitState((current) => {
        const currentGroup = current.customText[group] as Record<string, Record<string, string>>;
        const currentItem = currentGroup[id] || {};
        return {
          ...current,
          customText: {
            ...current.customText,
            [group]: {
              ...currentGroup,
              [id]: {
                ...currentItem,
                [field]: value,
              },
            },
          },
        };
      });
    },
  };
}
