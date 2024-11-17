import { useEffect, useMemo } from "react";
import { Chess } from "../customChess";
import { Chessboard } from "react-chessboard";
import PlayerNames from "../components/playerNames";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import getSocketInstance from "../socket";
import { setFen } from "../features/game/gameSlice";
import LinkShare from "../components/linkShare";
import { useParams } from "react-router-dom";
import PlayerTwoJoin from "../components/playerTwoJoin";
import { setIsPlayerTwo, setReceivedPlayerTwoName, setReceivedPlayerOneName } from "../features/player/playerSlice";
import { setGameStarted, setBoardOrientation, setCurrentTurn } from "../features/game/gameSlice";

interface MoveData {
  sourceSquare: string;
  targetSquare: string;
}

const Game: React.FC = () => {
  const game = useMemo(() => new Chess(), []);
  const socket = useMemo(() => getSocketInstance(), []);

  const { roomId } = useParams<{ roomId: string }>();
  const { isPlayerOne, isPlayerTwo } = useSelector((state: RootState) => state.player);
  const { fen, boardOrientation, gameStarted } = useSelector((state: RootState) => state.game);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (roomId) {
      socket.emit("joinRoom", roomId);
      if (!isPlayerOne) {
        dispatch(setIsPlayerTwo(true));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (roomId && !gameStarted) {
      socket.on("startGame", () => {
        dispatch(setGameStarted(true));
      });
    }
    return () => {
      socket.off("startGame");
    };
  }, [dispatch, gameStarted, roomId, socket]);

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
    socket.on("move", ({ sourceSquare, targetSquare }: MoveData) => {
      game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      dispatch(setFen(game.fen()));
    });

    socket.on("playerColor", (color: "white" | "black") => {
      dispatch(setBoardOrientation(color));
    });

    return () => {
      socket.off("move");
      socket.off("playerColor");
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
    const move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (move) {
      dispatch(setFen(game.fen()));
      socket.emit("move", { sourceSquare, targetSquare });
    }
    return !!move;
  };

  function onDrop(sourceSquare: string, targetSquare: string): boolean {
    return makeMove(sourceSquare, targetSquare);
  }

  return (
    <>
      {gameStarted && (
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
          <PlayerNames />
        </div>
      )}
      {isPlayerOne && !gameStarted && roomId && !isPlayerTwo && <LinkShare />}
      {isPlayerTwo && !gameStarted && <PlayerTwoJoin />}
    </>
  );
};

export default Game;
