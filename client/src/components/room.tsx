import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState, AppDispatch } from "../store";
import LinkShare from "../components/linkShare";
import PlayerTwoJoin from "../components/playerTwoJoin";
import getSocketInstance from "../socket";
import { setBoardOrientation, setCurrentTurn, setFen, setGameStarted } from "../features/game/gameSlice";
import {
  setReceivedPlayerTwoName,
  setReceivedPlayerOneName,
  setIsPlayerTwo,
  setPlayerOneId,
  setPlayerTwoId,
  setPlayerTwoName,
  setPlayerOneName,
  setIsPlayerOne,
} from "../features/player/playerSlice";
import { getCurrentGameState } from "../network/games_api";
import { Chessboard } from "react-chessboard";
import PlayerNames from "./playerNames";

const Room: React.FC = () => {
  const socketRef = useRef(getSocketInstance());
  const socket = socketRef.current;

  const { gameId } = useParams<{ gameId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { loggedInUser, isPlayerTwo, isPlayerOne, playerOneId } = useSelector((state: RootState) => state.player);
  const { gameStarted } = useSelector((state: RootState) => state.game);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (gameId) {
      const fetchGameState = async () => {
        try {
          const gameState = await getCurrentGameState(gameId);
          const playerId = localStorage.getItem("playerId");

          if (playerId === gameState.playerOne.userId) {
            dispatch(setPlayerOneName(gameState.playerOne.name));
            dispatch(setPlayerOneId(gameState.playerOne.userId));
            dispatch(setIsPlayerOne(true));
            dispatch(setIsPlayerTwo(false));
            dispatch(setBoardOrientation("white"));
            socket.emit("joinGame", gameId, playerId, gameState.playerOne.name);
          } else if (playerId === gameState.playerTwo.userId) {
            dispatch(setIsPlayerOne(false));
            dispatch(setIsPlayerTwo(true));
            dispatch(setPlayerTwoName(gameState.playerTwo.name));
            dispatch(setPlayerTwoId(gameState.playerTwo.userId));
            dispatch(setBoardOrientation("black"));

            socket.emit("joinGame", gameId, playerId, gameState.playerTwo.name);
          }

          dispatch(setCurrentTurn(gameState.currentTurn));
          dispatch(setGameStarted(gameState.gameStarted));
          dispatch(setFen(gameState.fen));
        } catch (error) {
          console.error("Error fetching game state:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchGameState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, socket]);

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

  if (loading && gameStarted) {
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

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <div className="room-setup">
      {!isPlayerTwo && <LinkShare />}
      {isPlayerTwo && <PlayerTwoJoin />}
    </div>
  );
};

export default Room;
