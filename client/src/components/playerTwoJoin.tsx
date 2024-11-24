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
  const { gameId } = useParams<{ gameId: string }>();

  const { playerTwoName, loggedInUser } = useSelector((state: RootState) => state.player);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!playerTwoName) {
      dispatch(setPlayerTwoName("anonymous"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem("playerTwoId", loggedInUser._id);
      dispatch(setPlayerTwoId(loggedInUser._id || null));
      dispatch(setPlayerTwoName(loggedInUser.username));
    } else {
      localStorage.removeItem("playerTwoId");
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

      dispatch(setPlayerTwoName(playerName));
      dispatch(setPlayerTwoId(playerId || null));
      socket.emit("playerTwoInfo", { gameId, playerTwoName: playerName, playerTwoId: playerId });
    } else if (playerTwoName) {
      const playerName = playerTwoName;
      const playerId = id;

      dispatch(setPlayerTwoId(playerId));
      socket.emit("playerTwoInfo", { gameId, playerTwoName: playerName, playerTwoId: playerId });
    }
  };

  return (
    <div>
      <form className="flex justify-center py-3" onSubmit={handleStartGame}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 ml-3 rounded-md p-3"
        >
          Join Game!
        </motion.button>
      </form>
    </div>
  );
};

export default PlayerTwoJoin;
