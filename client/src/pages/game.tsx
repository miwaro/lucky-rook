import { useState, useEffect, useMemo } from "react";
import { Chess } from "../customChess";
import { Chessboard } from "react-chessboard";
import PlayerNames from "../components/playerNames";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import getSocketInstance from "../socket";
import { useParams } from "react-router-dom";
import { getCurrentGameState, updateGameState } from "../network/games_api";
import { setGameStarted, setCurrentTurn, setFen, setBoardOrientation } from "../features/game/gameSlice";
import {
  setIsPlayerOne,
  setPlayerOneId,
  setPlayerOneName,
  setPlayerTwoId,
  setIsPlayerTwo,
  setPlayerTwoName,
} from "../features/player/playerSlice";
import Room from "../components/room";

interface MoveData {
  sourceSquare: string;
  targetSquare: string;
}

const Game: React.FC = () => {
  const [game] = useState(new Chess());
  const socket = useMemo(() => getSocketInstance(), []);
  const { isPlayerOne, isPlayerTwo } = useSelector((state: RootState) => state.player);
  const { fen, boardOrientation, currentTurn, gameStarted } = useSelector((state: RootState) => state.game);
  const { gameId } = useParams<{ gameId: string }>();

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    socket.on("playerColor", (color: "white" | "black") => {
      dispatch(setBoardOrientation(color));
    });
  }, [socket, dispatch]);

  useEffect(() => {
    if (gameId) {
      const fetchGameState = async () => {
        try {
          const gameState = await getCurrentGameState(gameId);
          const playerOneId = localStorage.getItem("playerOneId");
          const playerTwoId = localStorage.getItem("playerTwoId");

          if (playerOneId === gameState.playerOne.userId) {
            dispatch(setIsPlayerOne(true));
            dispatch(setIsPlayerTwo(false));
            socket.emit("joinGame", gameId, playerOneId, gameState.playerOne.name);
          } else if (playerTwoId === gameState.playerTwo.userId) {
            dispatch(setIsPlayerOne(false));
            dispatch(setIsPlayerTwo(true));
            socket.emit("joinGame", gameId, playerTwoId, gameState.playerTwo.name);
          } else {
            dispatch(setIsPlayerOne(false));
            dispatch(setIsPlayerTwo(false));
          }

          dispatch(setPlayerOneName(gameState.playerOne.name));
          dispatch(setPlayerOneId(gameState.playerOne.userId));
          dispatch(setPlayerTwoName(gameState.playerTwo.name));
          dispatch(setPlayerTwoId(gameState.playerTwo.userId));
          dispatch(setFen(gameState.fen));
          dispatch(setCurrentTurn(gameState.currentTurn));
          dispatch(setGameStarted(gameState.gameStarted));
          game.load(gameState.fen);
        } catch (error) {
          console.error("Error fetching game state:", error);
        }
      };

      fetchGameState();
    }
  }, [gameId, dispatch, game, socket]);

  useEffect(() => {
    socket.on("move", ({ sourceSquare, targetSquare }: MoveData) => {
      const move = game.move({ from: sourceSquare, to: targetSquare });
      if (move) {
        dispatch(setFen(game.fen()));
      }
    });

    return () => {
      socket.off("move");
    };
  }, [socket, game, dispatch]);

  useEffect(() => {
    socket.on("currentTurn", (turn: "white" | "black") => {
      dispatch(setCurrentTurn(turn));
    });

    return () => {
      socket.off("currentTurn");
    };
  }, [socket, dispatch]);

  const makeMove = (sourceSquare: string, targetSquare: string) => {
    const isWhiteTurn = game.turn() === "w";
    if ((isWhiteTurn && !isPlayerOne) || (!isWhiteTurn && !isPlayerTwo)) {
      return false;
    }
    const move = game.move({ from: sourceSquare, to: targetSquare });
    if (move) {
      const newFen = game.fen();
      dispatch(setFen(newFen));
      if (gameId) {
        socket.emit("move", { gameId, sourceSquare, targetSquare, fen: newFen });
        updateGameState(gameId, newFen, game.turn() === "w" ? "white" : "black").catch((error) => {
          console.error("Failed to update game state in the database", error);
        });
      }
    }
    return !!move;
  };

  function onDrop(sourceSquare: string, targetSquare: string): boolean {
    return makeMove(sourceSquare, targetSquare);
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-0">
      {gameStarted ? (
        <div>
          <Chessboard
            position={fen}
            boardOrientation={boardOrientation}
            boardWidth={500}
            onPieceDrop={onDrop}
            customNotationStyle={{
              color: "#000",
              fontWeight: "bold",
              fontSize: "15px",
            }}
            customBoardStyle={{
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
          />
          TURN: {currentTurn}
          <PlayerNames />
        </div>
      ) : (
        <Room />
      )}
    </div>
  );
};

export default Game;
