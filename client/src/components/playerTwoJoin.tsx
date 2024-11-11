import { motion } from "framer-motion";
import React from "react";
import { Socket } from "socket.io-client";

interface PlayerTwoJoinProps {
  playerTwoName: string | null;
  socket: Socket;
  setPlayerTwoName: (name: string) => void;
}

const PlayerTwoJoin: React.FC<PlayerTwoJoinProps> = ({
  playerTwoName,
  socket,
  setPlayerTwoName,
}) => {
  const handleStartGame = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (playerTwoName) {
      socket.emit("playerTwoName", playerTwoName);
    }
  };

  return (
    <div>
      <div className="bg-stone-900 m-auto py-5">
        <h2 className="text-stone-50 text-center">
          Enter Your Name to Start the Game
        </h2>
        <form className="flex justify-center py-3" onSubmit={handleStartGame}>
          <input
            className="pl-3 bg-stone-50 text-stone-950 rounded-md h-10"
            type="text"
            placeholder="Name"
            minLength={3}
            maxLength={11}
            autoFocus
            value={playerTwoName ?? ""}
            onChange={(e) => setPlayerTwoName(e.target.value)}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-green-700 hover:bg-green-800 ml-3 rounded-md w-12"
          >
            GO!
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default PlayerTwoJoin;
