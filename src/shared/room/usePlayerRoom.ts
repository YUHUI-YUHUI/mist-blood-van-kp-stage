import { startTransition, useEffect, useState } from "react";
import { getRoomState, subscribeRoomEvents } from "@shared/api";
import type { RoomSnapshot } from "@shared/types";
import { isValidRoomCode } from "./state";

export type PlayerConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "fatal";

interface PlayerRoomState {
  fatalMessage: string | null;
  roomLabel: string;
  snapshot: RoomSnapshot | null;
  status: PlayerConnectionStatus;
}

function connectingLabel(roomCode: string): string {
  return `房间 ${roomCode} · 连接中`;
}

function connectedLabel(roomCode: string): string {
  return `房间 ${roomCode} · 已同步`;
}

function reconnectingLabel(roomCode: string): string {
  return `房间 ${roomCode} · 正在重连`;
}

const INVALID_ROOM_STATE: PlayerRoomState = {
  fatalMessage: "房间链接无效，请向 KP 获取新的玩家链接。",
  roomLabel: "房间不可用",
  snapshot: null,
  status: "fatal",
};

export function usePlayerRoom(roomCode: string): PlayerRoomState {
  const [state, setState] = useState<PlayerRoomState>(() =>
    isValidRoomCode(roomCode)
      ? {
          fatalMessage: null,
          roomLabel: connectingLabel(roomCode),
          snapshot: null,
          status: "connecting",
        }
      : INVALID_ROOM_STATE,
  );

  useEffect(() => {
    if (!isValidRoomCode(roomCode)) {
      setState(INVALID_ROOM_STATE);
      return;
    }

    let disposed = false;
    let unsubscribe = () => {};

    setState((current) => ({
      ...current,
      fatalMessage: null,
      roomLabel: connectingLabel(roomCode),
      status: "connecting",
    }));

    async function connectRoom() {
      try {
        const initial = await getRoomState(roomCode);
        if (disposed) return;

        startTransition(() => {
          setState({
            fatalMessage: null,
            roomLabel: connectedLabel(roomCode),
            snapshot: initial,
            status: "connected",
          });
        });

        unsubscribe = subscribeRoomEvents(
          roomCode,
          (snapshot) => {
            if (disposed) return;
            startTransition(() => {
              setState({
                fatalMessage: null,
                roomLabel: connectedLabel(roomCode),
                snapshot,
                status: "connected",
              });
            });
          },
          () => {
            if (disposed) return;
            setState((current) => ({
              ...current,
              roomLabel: reconnectingLabel(roomCode),
              status: "disconnected",
            }));
          },
        );
      } catch (error) {
        if (disposed) return;
        const message = error instanceof Error ? error.message : "房间不存在或已经结束";
        setState({
          fatalMessage: message,
          roomLabel: "房间不可用",
          snapshot: null,
          status: "fatal",
        });
      }
    }

    void connectRoom();

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [roomCode]);

  return state;
}
