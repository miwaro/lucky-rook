import React from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setIsPlayerOne, setPlayerOneName } from "../features/player/playerSlice";
import getSocketInstance from "../socket";

const PlayerOneCreateAndJoin: React.FC = () => {
  const socket = getSocketInstance();
  const dispatch = useDispatch<AppDispatch>();
  const { playerOneName } = useSelector((state: RootState) => state.player);

  const createRoom = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (playerOneName) {
      socket.emit("createRoom", playerOneName);
      dispatch(setIsPlayerOne(true));
    }
  };

  return (
    <div>
      <div className="bg-stone-900 m-auto py-5">
        <h2 className="text-stone-50 text-center">Enter Your Name to Join a Game Room.</h2>
        <form className="flex justify-center py-3" onSubmit={createRoom}>
          <input
            className="pl-3 bg-stone-50 text-stone-950 rounded-md h-10"
            type="text"
            placeholder="Name"
            minLength={3}
            maxLength={11}
            autoFocus
            value={playerOneName ?? ""}
            onChange={(e) => dispatch(setPlayerOneName(e.target.value))}
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
