import { useState, useEffect, useMemo } from "react";
import { Chess } from "../customChess";
import { Chessboard } from "react-chessboard";
import PlayerNames from "../components/playerModule/playerNames";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import getSocketInstance from "../socket";
import { useNavigate, useParams } from "react-router-dom";
import {
  setCurrentTurn,
  setFen,
  setBoardOrientation,
  setResult,
  addMove,
  setMoves,
  setIsGameOver,
} from "../features/game/gameSlice";
import Room from "../components/room";
import { motion } from "framer-motion";

interface MoveData {
  sourceSquare: string;
  targetSquare: string;
}

const Game: React.FC = () => {
  const [game] = useState(new Chess());
  const socket = useMemo(() => getSocketInstance(), []);
  const navigate = useNavigate();
  const { loggedInUser, isPlayerOne, isPlayerTwo } = useSelector((state: RootState) => state.player);
  const { fen, boardOrientation, gameStarted, result, isGameOver, currentTurn } = useSelector(
    (state: RootState) => state.game
  );
  const { gameId } = useParams<{ gameId: string }>();

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    socket.on("loadGameState", (gameState) => {
      const playerId = localStorage.getItem("playerId");
      game.load(gameState.fen);

      dispatch(setFen(gameState.fen));
      dispatch(setCurrentTurn(gameState.currentTurn));
      dispatch(setMoves(gameState.moves));
      if (gameState.playerOne?.userId === playerId) {
        dispatch(setBoardOrientation("white"));
      } else {
        dispatch(setBoardOrientation("black"));
      }
    });

    return () => {
      socket.off("loadGameState");
    };
  }, [socket, game, dispatch]);

  useEffect(() => {
    socket.on("startNewGame", (newGameId: string) => {
      game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
      dispatch(setIsGameOver(false));
      dispatch(setResult(""));
      dispatch(setFen(game.fen()));
      dispatch(setMoves([]));
      dispatch(setCurrentTurn("white"));
      navigate(`/${newGameId}`);
      const playerId = localStorage.getItem("playerId");
      const playerName = loggedInUser?.username || "anonymous";
      socket.emit("joinGame", newGameId, playerId, playerName);
    });
    return () => {
      socket.off("startNewGame");
    };
  }, [socket, game, navigate, dispatch, loggedInUser]);

  useEffect(() => {
    const piecePlacement = fen.split(" ")[0];
    if (piecePlacement === "start") return;
    const hasWhiteKing = piecePlacement.includes("K");
    const hasBlackKing = piecePlacement.includes("k");

    if (!hasWhiteKing) {
      alert("BLACK WINS!");
      dispatch(setResult("BLACK WINS"));
      dispatch(setIsGameOver(true));
    }

    if (!hasBlackKing) {
      alert("WHITE WINS!");
      dispatch(setResult("WHITE WINS"));
      dispatch(setIsGameOver(true));
    }
  }, [fen, dispatch]);

  useEffect(() => {
    socket.on("move", ({ sourceSquare, targetSquare }: MoveData) => {
      const move = game.move({ from: sourceSquare, to: targetSquare });
      if (move) {
        dispatch(setFen(game.fen()));
      }
    });

    socket.on("moveData", (moves) => {
      dispatch(setMoves(moves));
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
        dispatch(
          addMove({
            fen: newFen,
            moveNumber: game.moves.length + 1,
            color: currentTurn,
            from: sourceSquare,
            to: targetSquare,
          })
        );
      }
    }
    return !!move;
  };

  function onDrop(sourceSquare: string, targetSquare: string): boolean {
    return makeMove(sourceSquare, targetSquare);
  }

  const canDrag = result === null || !isGameOver;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-0">
      {!gameStarted ? (
        <Room />
      ) : (
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="border-2 border-stone-950 p-4 bg-stone-800 rounded-lg">
            <Chessboard
              position={fen}
              boardOrientation={boardOrientation}
              boardWidth={500}
              onPieceDrop={onDrop}
              arePiecesDraggable={canDrag}
              customBoardStyle={{
                borderRadius: "6px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              }}
            />
          </div>
          <div className="ml-4">
            <PlayerNames />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Game;
