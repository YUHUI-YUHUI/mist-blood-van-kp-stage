import { PlayerStage } from "@shared/stage/PlayerStage";
import { createDefaultRoomState, readRoomCodeFromSearch } from "@shared/room/state";
import { usePlayerRoom } from "@shared/room/usePlayerRoom";

const EMPTY_STAGE_STATE = createDefaultRoomState();
const ROOM_CODE = readRoomCodeFromSearch(window.location.search);

export default function App() {
  const { fatalMessage, roomLabel, snapshot, status } = usePlayerRoom(ROOM_CODE);

  return (
    <PlayerStage
      fatalMessage={fatalMessage}
      roomLabel={roomLabel}
      state={snapshot?.state || EMPTY_STAGE_STATE}
      status={status}
    />
  );
}
