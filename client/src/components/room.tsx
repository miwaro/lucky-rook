import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../store";
import LinkShare from "../components/linkShare";
import PlayerTwoJoin from "../components/playerTwoJoin";
import getSocketInstance from "../socket";
import { setGameStarted, setGameId, setBoardOrientation } from "../features/game/gameSlice";
import { setLink } from "../features/link/linkSlice";

import {
  setIsPlayerTwo,
  setPlayerTwoName,
  setReceivedPlayerTwoName,
  setReceivedPlayerOneName,
} from "../features/player/playerSlice";

const Room: React.FC = () => {
  const socket = getSocketInstance();
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { playerTwoName, playerTwoId, isPlayerTwo, isPlayerOne, playerOneName, playerOneId } = useSelector(
    (state: RootState) => state.player
  );
  const { gameStarted } = useSelector((state: RootState) => state.game);

  useEffect(() => {
    if (gameId) {
      socket.on("playerTwoJoined", ({ playerName }: { playerName: string }) => {
        dispatch(setPlayerTwoName(playerName));
        dispatch(setGameStarted(true));
      });
    }

    return () => {
      socket.off("playerTwoJoined");
      socket.off("startGame");
    };
  }, [gameId, dispatch, socket]);

  useEffect(() => {
    if (gameId && !gameStarted) {
      socket.on("startGame", (gameId: string) => {
        dispatch(setGameStarted(true));
        dispatch(setGameId(gameId));
        const link = `${window.location.origin}/${gameId}`;
        dispatch(setLink(link));
        navigate(`/${gameId}/`);
      });
    }
    return () => {
      socket.off("startGame");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, gameStarted, gameId, socket]);

  useEffect(() => {
    socket.on("playerColor", (color: "white" | "black") => {
      dispatch(setBoardOrientation(color));
    });

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
    if (gameId) {
      if (!isPlayerOne) {
        dispatch(setIsPlayerTwo(true));
        socket.emit("joinGame", gameId, playerTwoId, playerTwoName);
      } else if (isPlayerOne) {
        socket.emit("joinGame", gameId, playerOneId, playerOneName);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  return (
    <div className="room-setup">
      {!isPlayerTwo && <LinkShare />}
      {isPlayerTwo && <PlayerTwoJoin />}
    </div>
  );
};

export default Room;
