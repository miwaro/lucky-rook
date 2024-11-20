import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../store";
import LinkShare from "../components/linkShare";
import PlayerTwoJoin from "../components/playerTwoJoin";
import getSocketInstance from "../socket";
import { setGameStarted, setGameId, setBoardOrientation } from "../features/game/gameSlice";
import {
  setIsPlayerTwo,
  setPlayerTwoName,
  setReceivedPlayerTwoName,
  setReceivedPlayerOneName,
} from "../features/player/playerSlice";

const Room: React.FC = () => {
  const socket = getSocketInstance();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  const dispatch = useDispatch<AppDispatch>();
  const { playerTwoName, isPlayerTwo, isPlayerOne } = useSelector((state: RootState) => state.player);
  const { gameStarted } = useSelector((state: RootState) => state.game);

  const [loading, setLoading] = useState(true);

  socket.on("playerColor", (color: "white" | "black") => {
    console.log("color", color);
    dispatch(setBoardOrientation(color));
  });

  useEffect(() => {
    if (roomId) {
      socket.emit("joinRoom", roomId);
      socket.on("playerTwoJoined", ({ playerName }: { playerName: string }) => {
        dispatch(setPlayerTwoName(playerName));
        dispatch(setIsPlayerTwo(true));
      });

      socket.on("startGame", ({ gameId }: { gameId: string }) => {
        dispatch(setGameStarted(true));
        dispatch(setGameId(gameId));
        navigate(`/room/${roomId}/game/${gameId}`);
      });

      setLoading(false);
    }

    return () => {
      socket.off("playerTwoJoined");
      socket.off("startGame");
    };
  }, [roomId, dispatch, socket, navigate]);

  useEffect(() => {
    socket.on("receivePlayerOneName", (name: string) => {
      dispatch(setReceivedPlayerOneName(name));
    });

    socket.on("playerTwoJoined", (name: string) => {
      dispatch(setReceivedPlayerTwoName(name));
    });

    return () => {
      socket.off("receivePlayerOneName");
      socket.off("playerTwoJoined");
    };
  }, [socket, dispatch]);

  useEffect(() => {
    if (roomId) {
      socket.emit("joinRoom", roomId);
      if (!isPlayerOne) {
        dispatch(setIsPlayerTwo(true));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="room-setup">
      {!playerTwoName && !isPlayerTwo && <LinkShare />}
      {isPlayerTwo && !gameStarted && <PlayerTwoJoin />}
    </div>
  );
};

export default Room;
