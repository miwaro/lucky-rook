import { useState, useEffect, useMemo } from "react";
import { Chess } from "../customChess";
import { Chessboard } from "react-chessboard";
import PlayerNames from "../components/playerNames";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import getSocketInstance from "../socket";
import { useParams } from "react-router-dom";
import { updateGameState } from "../network/games_api";
import { setCurrentTurn, setFen, setBoardOrientation, setResult } from "../features/game/gameSlice";
import Room from "../components/room";

interface MoveData {
  sourceSquare: string;
  targetSquare: string;
}

const Game: React.FC = () => {
  const [game] = useState(new Chess());
  const socket = useMemo(() => getSocketInstance(), []);
  const { isPlayerOne, isPlayerTwo } = useSelector((state: RootState) => state.player);
  const { fen, boardOrientation, gameStarted, result, isGameOver } = useSelector((state: RootState) => state.game);
  const { gameId } = useParams<{ gameId: string }>();

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    socket.on("rematchStatus", ({ rematchRequestedByPlayerOne, rematchRequestedByPlayerTwo }) => {
      if (rematchRequestedByPlayerOne && rematchRequestedByPlayerTwo && isGameOver) {
        game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        dispatch(setFen(game.fen()));
      } else {
        if (isPlayerOne && rematchRequestedByPlayerOne) {
          // setRematchMessage('Waiting for Player Two to accept the rematch...');
        } else if (!isPlayerOne && rematchRequestedByPlayerTwo) {
          // setRematchMessage('Waiting for Player One to accept the rematch...');
        } else {
          // setRematchMessage('Opponent has requested a rematch. Click rematch to accept.');
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerOne, socket, isGameOver]);

  useEffect(() => {
    socket.on("playerColor", (color: "white" | "black") => {
      dispatch(setBoardOrientation(color));
    });
  }, [socket, dispatch]);

  useEffect(() => {
    const piecePlacement = fen.split(" ")[0];
    if (piecePlacement === "start") return;
    const hasWhiteKing = piecePlacement.includes("K");
    const hasBlackKing = piecePlacement.includes("k");

    if (!hasWhiteKing) {
      alert("BLACK WINS!");
      dispatch(setResult("BLACK WINS"));
    }

    if (!hasBlackKing) {
      alert("WHITE WINS!");
      dispatch(setResult("WHITE WINS"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen]);

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
        // TODO: move to server
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
        <div className="flex">
          <div className="border-2 border-stone-950 p-4 bg-stone-800 rounded-lg">
            <Chessboard
              position={fen}
              boardOrientation={boardOrientation}
              boardWidth={500}
              onPieceDrop={onDrop}
              // eslint-disable-next-line no-constant-binary-expression
              arePiecesDraggable={result === null ? true : false || isGameOver}
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
      ) : (
        <Room />
      )}
    </div>
  );
};

export default Game;
