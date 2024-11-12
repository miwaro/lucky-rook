import { motion } from "framer-motion";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setPlayerTwoName } from "../features/player/playerSlice";
import { RootState, AppDispatch } from "../store";
import getSocketInstance from "../socket";

const PlayerTwoJoin: React.FC = () => {
  const socket = getSocketInstance();
  const dispatch = useDispatch<AppDispatch>();

  const { playerTwoName } = useSelector((state: RootState) => state.player);

  const handleStartGame = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (playerTwoName) {
      socket.emit("playerTwoName", playerTwoName);
    }
  };

  return (
    <div>
      <div className="bg-stone-900 m-auto py-5">
        <h2 className="text-stone-50 text-center">Enter Your Name to Start the Game</h2>
        <form className="flex justify-center py-3" onSubmit={handleStartGame}>
          <input
            className="pl-3 bg-stone-50 text-stone-950 rounded-md h-10"
            type="text"
            placeholder="Name"
            minLength={3}
            maxLength={11}
            autoFocus
            value={playerTwoName ?? ""}
            onChange={(e) => dispatch(setPlayerTwoName(e.target.value))}
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
