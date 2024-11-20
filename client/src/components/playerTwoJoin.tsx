import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { setPlayerTwoName, setPlayerTwoId } from "../features/player/playerSlice";
import { RootState, AppDispatch } from "../store";
import getSocketInstance from "../socket";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { setGameStarted, setGameId } from "../features/game/gameSlice";
import { setLink } from "../features/link/linkSlice";

const PlayerTwoJoin: React.FC = () => {
  const socketRef = useRef(getSocketInstance());
  const socket = socketRef.current;
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  const { playerTwoName, loggedInUser } = useSelector((state: RootState) => state.player);
  const { gameStarted } = useSelector((state: RootState) => state.game);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!loggedInUser) {
      dispatch(setPlayerTwoName(""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  useEffect(() => {
    if (roomId && !gameStarted) {
      console.log("gets here to useEffect");
      socket.on("startGame", (gameId: string) => {
        dispatch(setGameStarted(true));
        dispatch(setGameId(gameId));
        const link = `${window.location.origin}/room/${roomId}/game/${gameId}`;
        dispatch(setLink(link));
        navigate(`/room/${roomId}/game/${gameId}`);
      });
    }
    return () => {
      socket.off("startGame");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, gameStarted, roomId, socket]);

  const handleStartGame = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const anonymousPlayerId = uuidv4();
    const { username, _id } = loggedInUser || {};

    if (loggedInUser && loggedInUser !== null) {
      const playerName = username;
      const playerId = _id;

      dispatch(setPlayerTwoName(playerName || null));
      dispatch(setPlayerTwoId(playerId || null));
      socket.emit("playerTwoInfo", { roomId, playerTwoName: playerName, playerTwoId: playerId });
    } else if (playerTwoName) {
      const playerName = playerTwoName;
      const playerId = anonymousPlayerId;

      socket.emit("playerTwoInfo", { roomId, playerTwoName: playerName, playerTwoId: playerId });
      dispatch(setPlayerTwoId(playerId));
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
