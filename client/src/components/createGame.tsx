// import { useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

interface CreateGameProps {
  roomId: string | undefined;
  setRoomId: (roomId: string) => void;
}

const CreateGame: React.FC<CreateGameProps> = ({ roomId, setRoomId }) => {
  // const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createGame = () => {
    socket.emit("createGame");
    socket.on("gameCreated", (roomId) => {
      setRoomId(roomId);
      navigate(`/game/${roomId}`);
    });
  };

  const copyLinkToClipboard = () => {
    const link = `${window.location.origin}/game/${roomId}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  return (
    <div>
      <button onClick={createGame}>Create Game</button>
      {roomId && (
        <div>
          <p>
            Game link:{" "}
            <a
              href={`/game/${roomId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {window.location.origin}/game/{roomId}
            </a>
          </p>
          <button onClick={copyLinkToClipboard}>Copy Link to Clipboard</button>
        </div>
      )}
    </div>
  );
};

export default CreateGame;
