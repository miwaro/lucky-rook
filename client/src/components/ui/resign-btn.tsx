import { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { Tooltip } from "@mui/material";
import { setIsGameOver } from "../../features/game/gameSlice";
import { AppDispatch } from "../../store";
import { Socket } from "socket.io-client";
import FlagIcon from "@mui/icons-material/Flag";

interface ResignProps {
  socket: Socket;
  gameId: string | undefined;
  playerId: string | null;
  playerOneId: string;
  playerTwoId: string;
}

const ResignButton = ({ socket, gameId, playerId, playerOneId, playerTwoId }: ResignProps) => {
  const [clickCount, setClickCount] = useState(0);
  const dispatch = useDispatch<AppDispatch>();

  const handleResign = () => {
    if (clickCount === 0) {
      setClickCount(1);
      setTimeout(() => setClickCount(0), 5000);
    } else {
      setClickCount(0);
      dispatch(setIsGameOver(true));
      if (playerOneId === playerId) {
        socket.emit("playerResigns", { gameId, isPlayerOne: true });
      } else if (playerTwoId === playerId) {
        socket.emit("playerResigns", { gameId, isPlayerOne: false });
      }
    }
  };

  return (
    <div className="flex gap-3">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleResign}
        className={`px-4 py-2 rounded text-white font-bold transition ${
          clickCount === 0 ? "bg-stone-800 hover:bg-stone-900" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        <Tooltip title="RESIGN">
          <FlagIcon />
        </Tooltip>
      </motion.button>
    </div>
  );
};

export default ResignButton;
