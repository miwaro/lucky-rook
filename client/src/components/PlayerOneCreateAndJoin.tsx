import React from "react";
import { motion } from "framer-motion";

interface JoinFormProps {
  createRoom: (event: React.FormEvent) => void;
  playerOneName: string | null;
  setPlayerOneName: (name: string) => void;
}

const PlayerOneCreateAndJoin: React.FC<JoinFormProps> = ({
  createRoom,
  playerOneName,
  setPlayerOneName,
}) => {
  return (
    <div>
      <div className="bg-stone-900 m-auto py-5">
        <h2 className="text-stone-50 text-center">
          Enter Your Name to Join a Game Room.
        </h2>
        <form className="flex justify-center py-3" onSubmit={createRoom}>
          <input
            className="pl-3 bg-stone-50 text-stone-950 rounded-md h-10"
            type="text"
            placeholder="Name"
            minLength={3}
            maxLength={11}
            autoFocus
            value={playerOneName ?? ""}
            onChange={(e) => setPlayerOneName(e.target.value)}
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

export default PlayerOneCreateAndJoin;
