import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { setPlayerTwoName, setPlayerTwoId } from "../features/player/playerSlice";
import { RootState, AppDispatch } from "../store";
import getSocketInstance from "../socket";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const PlayerTwoJoin: React.FC = () => {
  const socketRef = useRef(getSocketInstance());
  const socket = socketRef.current;
  const { roomId } = useParams<{ roomId: string }>();

  const { playerTwoName, loggedInUser } = useSelector((state: RootState) => state.player);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem("playerTwoId", loggedInUser._id);
      dispatch(setPlayerTwoId(loggedInUser._id || null));
      dispatch(setPlayerTwoName(loggedInUser.username));
    } else {
      localStorage.removeItem("playerTwoId");
      dispatch(setPlayerTwoName(""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  const handleStartGame = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    let id = localStorage.getItem("playerTwoId");

    if (!id && !loggedInUser) {
      id = uuidv4();
      localStorage.setItem("playerTwoId", id);
    }

    if (loggedInUser && loggedInUser !== null) {
      const playerName = loggedInUser.username;
      const playerId = loggedInUser._id;

      dispatch(setPlayerTwoName(playerName || null));
      dispatch(setPlayerTwoId(playerId || null));
      socket.emit("playerTwoInfo", { roomId, playerTwoName: playerName, playerTwoId: playerId });
    } else if (playerTwoName) {
      const playerName = playerTwoName;
      const playerId = id;

      dispatch(setPlayerTwoId(playerId));
      socket.emit("playerTwoInfo", { roomId, playerTwoName: playerName, playerTwoId: playerId });
    }
  };

  return (
    <div>
      <div className="bg-stone-900 m-auto py-5">
        <h2 className="text-stone-50 text-center">Enter Your Name to Start the Game</h2>
        <form className="flex justify-center py-3" onSubmit={handleStartGame}>
          <input
            className={`${loggedInUser ? "bg-gray-300 cursor-default" : ""}
                    pl-3 bg-stone-50 text-stone-950 rounded-md h-10`}
            type="text"
            placeholder="Name"
            minLength={3}
            maxLength={11}
            disabled={!!loggedInUser}
            autoFocus={!loggedInUser}
            value={loggedInUser?.username || playerTwoName || ""}
            onChange={(e) => dispatch(setPlayerTwoName(e.target.value))}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-green-700 hover:bg-green-800 ml-3 rounded-md w-12"
            disabled={!playerTwoName && !loggedInUser?.username}
          >
            GO!
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default PlayerTwoJoin;
