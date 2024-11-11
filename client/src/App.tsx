import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import io from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LinkShare from "./components/linkShare";
import PlayerOneCreateAndJoin from "./components/PlayerOneCreateAndJoin";
import PlayerTwoJoin from "./components/playerTwoJoin";
import PlayerNames from "./components/playerNames";

const socket = io("http://localhost:5000", {
  transports: ["websocket"], // disables polling, but may want to remove later
});

interface Move {
  sourceSquare: string;
  targetSquare: string;
}

const App: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [link, setLink] = useState("");
  const [game, setGame] = useState<Chess>(new Chess());

  const [playerOneName, setPlayerOneName] = useState<string | null>(null);
  const [playerTwoName, setPlayerTwoName] = useState<string | null>(null);

  const [isPlayerOne, setIsPlayerOne] = useState(false);
  const [isPlayerTwo, setIsPlayerTwo] = useState(false);

  const [receivedPlayerOneName, setReceivedPlayerOneName] = useState<string | null>(null);
  const [receivedPlayerTwoName, setReceivedPlayerTwoName] = useState<string | null>(null);

  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (roomId) {
      const link = `${window.location.origin}/game/${roomId}`;
      setLink(link);
      socket.emit("joinRoom", roomId);
      if (!isPlayerOne) {
        setIsPlayerTwo(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    socket.on("roomCreated", (roomId: string) => {
      navigate(`/game/${roomId}`);
    });

    socket.on("receivePlayerOneName", (name: string) => {
      setReceivedPlayerOneName(name);
    });

    socket.on("playerTwoJoined", (name: string) => {
      setReceivedPlayerTwoName(name);
    });

    socket.on("playerColor", (color: "white" | "black") => {
      setBoardOrientation(color);
    });

    socket.on("move", ({ sourceSquare, targetSquare }: Move) => {
      const newGame = new Chess(game.fen());
      newGame.move({ from: sourceSquare, to: targetSquare });
      setGame(newGame);
    });

    socket.on("startGame", () => {
      setGameStarted(true);
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
  }, [game, navigate]);

  const createRoom = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (playerOneName) {
      socket.emit("createRoom", playerOneName);
      setIsPlayerOne(true);
    }
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Failed to copy link!");
        console.error("Failed to copy link: ", err);
      });
  };

  const makeMove = (sourceSquare: string, targetSquare: string) => {
    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({ from: sourceSquare, to: targetSquare });
    if (move) {
      setGame(gameCopy);
      socket.emit("move", { sourceSquare, targetSquare });
    }
    return move !== null ? true : false;
  };

  return (
    <div className="flex flex-col w-screen">
      {!roomId && (
        <PlayerOneCreateAndJoin
          createRoom={createRoom}
          playerOneName={playerOneName}
          setPlayerOneName={setPlayerOneName}
        />
      )}

      {isPlayerOne && !gameStarted && (
        <div>
          <LinkShare roomId={roomId} copyLink={copyLinkToClipboard} link={link} />
        </div>
      )}

      {isPlayerTwo && !gameStarted && (
        <PlayerTwoJoin playerTwoName={playerTwoName} socket={socket} setPlayerTwoName={setPlayerTwoName} />
      )}

      {gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div>
            <Chessboard
              position={game.fen()}
              boardOrientation={boardOrientation}
              boardWidth={500}
              onPieceDrop={(sourceSquare, targetSquare) => {
                return makeMove(sourceSquare, targetSquare);
              }}
            />
          </div>
          <PlayerNames
            boardOrientation={boardOrientation}
            playerOneName={playerOneName}
            playerTwoName={playerTwoName}
            receivedPlayerOneName={receivedPlayerOneName}
            receivedPlayerTwoName={receivedPlayerTwoName}
          />
        </div>
      )}
    </div>
  );
};

export default App;
