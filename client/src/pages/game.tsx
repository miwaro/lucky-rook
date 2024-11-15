import { useState, useRef, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import PlayerNames from "../components/playerNames";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import getSocketInstance from "../socket";
import { setFen } from "../features/game/gameSlice";
import LinkShare from "../components/linkShare";
import { useParams, useNavigate } from "react-router-dom";
import PlayerTwoJoin from "../components/playerTwoJoin";
import { setIsPlayerTwo } from "../features/player/playerSlice";
import { setGameStarted } from "../features/game/gameSlice";

const Game = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();

  const [game] = useState(new Chess());
  const { isPlayerOne, isPlayerTwo } = useSelector((state: RootState) => state.player);
  const { fen, boardOrientation, gameStarted } = useSelector((state: RootState) => state.game);

  const dispatch = useDispatch<AppDispatch>();

  const socketRef = useRef(getSocketInstance());
  const socket = socketRef.current;

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
        navigate(`/game/${roomId}`);
      });
    }
    return () => {
      socket.off("startGame");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, socket]);

  useEffect(() => {
    socket.on("move", ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string }) => {
      game.move({ from: sourceSquare, to: targetSquare });
      dispatch(setFen(game.fen()));
    });

    return () => {
      socket.off("move");
    };
  }, [socket, game, dispatch]);

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
