import { useState, useEffect, useMemo } from "react";
import { Chess } from "../customChess";
import { Chessboard } from "react-chessboard";
import PlayerNames from "../components/playerNames";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import getSocketInstance from "../socket";
import { useParams } from "react-router-dom";
import { getCurrentGameState, getRoomState, updateGameState } from "../network/games_api";
import { setGameStarted, setCurrentTurn, setFen, setBoardOrientation } from "../features/game/gameSlice";
import {
  setIsPlayerOne,
  setPlayerOneId,
  setPlayerOneName,
  setPlayerTwoId,
  setIsPlayerTwo,
  setPlayerTwoName,
} from "../features/player/playerSlice";

interface MoveData {
  sourceSquare: string;
  targetSquare: string;
}

const Game: React.FC = () => {
  const [game] = useState(new Chess());
  const socket = useMemo(() => getSocketInstance(), []);
  const { isPlayerOne, isPlayerTwo } = useSelector((state: RootState) => state.player);
  const { fen, boardOrientation, currentTurn } = useSelector((state: RootState) => state.game);
  const { roomId } = useParams<{ roomId: string }>();

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    socket.on("playerColor", (color: "white" | "black") => {
      dispatch(setBoardOrientation(color));
    });
  }, [socket, dispatch]);

  useEffect(() => {
    if (roomId) {
      const fetchGameState = async () => {
        try {
          const gameState = await getCurrentGameState(roomId);
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
  }, [roomId, dispatch, game, socket]);

  useEffect(() => {
    if (roomId) {
      const fetchRoomState = async () => {
        try {
          const roomState = await getRoomState(roomId);
          const playerOneId = localStorage.getItem("playerOneId");
          const playerTwoId = localStorage.getItem("playerTwoId");

          if (playerOneId === roomState.playerOne.userId) {
            dispatch(setIsPlayerOne(true));
            socket.emit("joinRoom", roomId, playerOneId, roomState.playerOne.name);
          } else if (playerTwoId === roomState.playerTwo.userId) {
            dispatch(setIsPlayerTwo(true));
            socket.emit("joinRoom", roomId, playerTwoId, roomState.playerTwo.name);
          }

          dispatch(setPlayerOneName(roomState.playerOne.name));
          dispatch(setPlayerOneId(roomState.playerOne.userId));
          dispatch(setPlayerTwoName(roomState.playerTwo.name));
          dispatch(setPlayerTwoId(roomState.playerTwo.userId));
        } catch (error) {
          console.error("Error fetching room state:", error);
        }
      };

      fetchRoomState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, dispatch]);

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
      if (roomId) {
        socket.emit("move", { roomId, sourceSquare, targetSquare, fen: newFen });
        updateGameState(roomId, newFen, game.turn() === "w" ? "white" : "black").catch((error) => {
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
      </div>
      TURN: {currentTurn}
      <PlayerNames />
    </div>
  );
};

export default Game;
