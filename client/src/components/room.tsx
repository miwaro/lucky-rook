import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState, AppDispatch } from "../store";
import LinkShare from "../components/linkShare";
import PlayerTwoJoin from "../components/playerTwoJoin";
import getSocketInstance from "../socket";
import { setBoardOrientation, setGameStarted } from "../features/game/gameSlice";
import {
  setReceivedPlayerTwoName,
  setReceivedPlayerOneName,
  setIsPlayerTwo,
  setPlayerOneId,
  setPlayerTwoId,
} from "../features/player/playerSlice";

const Room: React.FC = () => {
  const socketRef = useRef(getSocketInstance());
  const socket = socketRef.current;

  const { gameId } = useParams<{ gameId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { loggedInUser, isPlayerTwo, isPlayerOne, playerOneId } = useSelector((state: RootState) => state.player);

  // Setup socket listeners
  useEffect(() => {
    if (!gameId) return;

    socket.on(
      "playerTwoJoined",
      ({ playerTwoName, playerTwoUserId }: { playerTwoName: string; playerTwoUserId: string }) => {
        dispatch(setGameStarted(true));
        dispatch(setReceivedPlayerTwoName(playerTwoName));
        dispatch(setPlayerTwoId(playerTwoUserId));
      }
    );

    // Set board orientation based on player color
    socket.on("playerColor", (color: "white" | "black") => {
      dispatch(setBoardOrientation(color));
    });

    socket.on(
      "receivePlayerOneInfo",
      ({ playerOneName, playerOneUserId }: { playerOneName: string; playerOneUserId: string }) => {
        console.log("id", playerOneUserId);
        dispatch(setReceivedPlayerOneName(playerOneName));
        dispatch(setPlayerOneId(playerOneUserId));
      }
    );

    return () => {
      socket.off("playerTwoJoined");
      socket.off("playerColor");
      socket.off("receivePlayerOneInfo");
    };
  }, [gameId, socket, dispatch]);

  useEffect(() => {
    if (gameId && !isPlayerOne) {
      dispatch(setIsPlayerTwo(true));
    }
  }, [gameId, isPlayerOne, dispatch]);

  useEffect(() => {
    if (gameId && isPlayerOne) {
      const playerName = loggedInUser?.username || "anonymous";
      const userId = loggedInUser?._id || playerOneId;

      socket.emit("joinGame", gameId, userId, playerName);
    }
  }, [gameId, isPlayerOne, loggedInUser, playerOneId, socket]);

  return (
    <div className="room-setup">
      {!isPlayerTwo && <LinkShare />}
      {isPlayerTwo && <PlayerTwoJoin />}
    </div>
  );
};

export default Room;
