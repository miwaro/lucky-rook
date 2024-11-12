import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useParams, useNavigate } from "react-router-dom";
import PlayerNames from "./components/playerNames";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "./store";
import { setLink } from "./features/link/linkSlice";
import { setIsPlayerTwo, setReceivedPlayerOneName, setReceivedPlayerTwoName } from "./features/player/playerSlice";
import { setFen, setGameStarted, setBoardOrientation } from "./features/game/gameSlice";
import InitiateGame from "./components/initiateGame";
import getSocketInstance from "./socket";

interface Move {
  sourceSquare: string;
  targetSquare: string;
  promotion?: string;
}

const App: React.FC = () => {
  const socket = getSocketInstance();
  const dispatch = useDispatch<AppDispatch>();
  const { isPlayerOne } = useSelector((state: RootState) => state.player);
  const { fen, gameStarted, boardOrientation } = useSelector((state: RootState) => state.game);
  const [game] = useState(new Chess());
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (roomId) {
      const link = `${window.location.origin}/game/${roomId}`;
      dispatch(setLink(link));
      socket.emit("joinRoom", roomId);
      if (!isPlayerOne) {
        dispatch(setIsPlayerTwo(true));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    socket.on("roomCreated", (roomId: string) => {
      navigate(`/game/${roomId}`);
    });

    socket.on("receivePlayerOneName", (name: string) => {
      dispatch(setReceivedPlayerOneName(name));
    });

    socket.on("playerTwoJoined", (name: string) => {
      dispatch(setReceivedPlayerTwoName(name));
    });

    socket.on("playerColor", (color: "white" | "black") => {
      dispatch(setBoardOrientation(color));
    });

    socket.on("move", ({ sourceSquare, targetSquare }: Move) => {
      game.move({ from: sourceSquare, to: targetSquare });
      dispatch(setFen(game.fen()));
    });

    socket.on("startGame", () => {
      dispatch(setGameStarted(true));
      navigate(`/game/${roomId}`);
    });

    return () => {
      socket.off("roomCreated");
      socket.off("move");
      socket.off("playerColor");
      socket.off("receivePlayerOneName");
      socket.off("playerTwoJoined");
      socket.off("startGame");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const makeMove = (sourceSquare: string, targetSquare: string) => {
    const move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (move) {
      dispatch(setFen(game.fen()));
      socket.emit("move", { sourceSquare, targetSquare });
    }
    return move !== null ? true : false;
  };

  function onDrop(sourceSquare: string, targetSquare: string): boolean {
    return makeMove(sourceSquare, targetSquare);
  }

  return (
    <div className="flex flex-col w-screen">
      <InitiateGame />
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
    </div>
  );
};

export default App;
