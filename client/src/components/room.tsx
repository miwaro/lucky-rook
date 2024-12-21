import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState, AppDispatch } from "../store";
import LinkShare from "../components/linkShare";
import PlayerTwoJoin from "../components/playerTwoJoin";
import getSocketInstance from "../socket";
import { setBoardOrientation, setCurrentTurn, setFen, setGameStarted, setMoves } from "../features/game/gameSlice";
import {
  setReceivedPlayerTwoName,
  setReceivedPlayerOneName,
  setIsPlayerTwo,
  setPlayerOneId,
  setPlayerTwoId,
  setPlayerTwoName,
  setPlayerOneName,
  setIsPlayerOne,
  setIsPlayerOneConnected,
  setIsPlayerTwoConnected,
} from "../features/player/playerSlice";
import { Chessboard } from "react-chessboard";
import PlayerNames from "./playerModule/playerNames";

const Room: React.FC = () => {
  const socketRef = useRef(getSocketInstance());
  const socket = socketRef.current;

  const { gameId } = useParams<{ gameId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { loggedInUser, isPlayerTwo, isPlayerOne, playerOneId } = useSelector((state: RootState) => state.player);
  const { gameStarted } = useSelector((state: RootState) => state.game);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameStarted) setLoading(false);
    if (gameId) {
      const playerId = localStorage.getItem("playerId");
      socket.emit("joinGame", gameId, playerId);
      socket.on("loadGameState", (gameState) => {
        if (playerId === gameState.playerOne.userId) {
          dispatch(setPlayerOneId(gameState.playerOne.userId));
          dispatch(setIsPlayerOne(true));
          dispatch(setIsPlayerTwo(false));
          dispatch(setBoardOrientation("white"));
        } else if (gameState.playerTwo && playerId === gameState.playerTwo.userId) {
          dispatch(setIsPlayerOne(false));
          dispatch(setIsPlayerTwo(true));
          dispatch(setPlayerTwoId(gameState.playerTwo.userId));
          dispatch(setBoardOrientation("black"));
        }

        dispatch(setPlayerOneName(gameState.playerOne.name));
        dispatch(setPlayerTwoName(gameState.playerTwo?.name));
        dispatch(setCurrentTurn(gameState.currentTurn));
        dispatch(setFen(gameState.fen));
        dispatch(setMoves(gameState.moves));

        if (gameState.gameStarted) {
          dispatch(setGameStarted(true));
        }
        setLoading(false);
      });

      return () => {
        socket.off("loadGameState");
      };
    }
  }, [gameId, socket, dispatch, gameStarted]);

  useEffect(() => {
    socket.on("playerConnection", (data) => {
      dispatch(setIsPlayerOneConnected(data.playerOneConnected));
      dispatch(setIsPlayerTwoConnected(data.playerTwoConnected));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    if (!gameId) return;

    socket.on("playerTwoJoined", ({ playerTwoName, playerTwoId }: { playerTwoName: string; playerTwoId: string }) => {
      dispatch(setGameStarted(true));
      dispatch(setReceivedPlayerTwoName(playerTwoName));
      dispatch(setPlayerTwoName(playerTwoName));
      if (isPlayerTwo) {
        localStorage.setItem("playerId", playerTwoId);
      }
      dispatch(setPlayerTwoId(playerTwoId));
    });

    socket.on("playerColor", (color: "white" | "black") => {
      dispatch(setBoardOrientation(color));
    });

    socket.on(
      "receivePlayerOneInfo",
      ({ playerOneName, playerOneUserId }: { playerOneName: string; playerOneUserId: string }) => {
        dispatch(setReceivedPlayerOneName(playerOneName));
        dispatch(setPlayerOneName(playerOneName));
        dispatch(setPlayerOneId(playerOneUserId));
      }
    );

    return () => {
      socket.off("playerTwoJoined");
      socket.off("playerColor");
      socket.off("receivePlayerOneInfo");
    };
  }, [gameId, socket, dispatch, isPlayerTwo]);

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

  if (loading) {
    return (
      <div className="flex">
        <div className="border-2 border-stone-950 p-4 bg-stone-800 rounded-lg">
          <Chessboard
            boardWidth={500}
            customNotationStyle={{
              color: "#000",
              fontWeight: "bold",
              fontSize: "15px",
            }}
            customBoardStyle={{
              borderRadius: "6px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
          />
        </div>
        <PlayerNames />
      </div>
    );
  }

  return (
    <div className="room-setup">
      {!isPlayerTwo && <LinkShare />}
      {isPlayerTwo && <PlayerTwoJoin />}
    </div>
  );
};

export default Room;
