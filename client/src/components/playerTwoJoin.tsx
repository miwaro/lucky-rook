import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { setPlayerTwoName, setPlayerTwoId } from "../features/player/playerSlice";
import { RootState, AppDispatch } from "../store";
import getSocketInstance from "../socket";
import { useParams } from "react-router-dom";
import { setGameId } from "../features/game/gameSlice";
import { v4 as uuidv4 } from "uuid";

const PlayerTwoJoin: React.FC = () => {
  const socketRef = useRef(getSocketInstance());
  const socket = socketRef.current;
  const { gameId } = useParams<{ gameId: string }>();

  const { loggedInUser, playerTwoName, playerTwoId, isPlayerOne } = useSelector((state: RootState) => state.player);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (gameId) {
      dispatch(setGameId(gameId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  useEffect(() => {
    if (gameId) {
      let id = localStorage.getItem("playerId");
      if (!id && !loggedInUser) {
        id = uuidv4().slice(0, 8);
        localStorage.setItem("playerId", id);
      }

      const playerName = loggedInUser?.username || "anonymous";
      const userId = loggedInUser?._id || id;

      dispatch(setPlayerTwoName(playerName));
      dispatch(setPlayerTwoId(userId || null));

      if (!isPlayerOne) {
        socket.emit("joinGame", gameId, userId, playerName);
      }

      return () => {
        socket.off("joinGame");
      };
    }
  }, [dispatch, gameId, isPlayerOne, loggedInUser, playerTwoName, socket]);

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem("playerId", loggedInUser._id);
      dispatch(setPlayerTwoId(loggedInUser._id || null));
      dispatch(setPlayerTwoName(loggedInUser.username || "anonymous"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  const handleStartGame = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    socket.emit("startGame", gameId, playerTwoName, playerTwoId);
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
