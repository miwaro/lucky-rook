import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setIsPlayerOne, setPlayerOneName } from "../features/player/playerSlice";
import { setLink } from "../features/link/linkSlice";
import { setGameId } from "../features/game/gameSlice"; // Import the action to set the gameId

import getSocketInstance from "../socket";

const PlayerOneCreateAndJoin: React.FC = () => {
  const socketRef = useRef(getSocketInstance());
  const socket = socketRef.current;

  const navigate = useNavigate();
  const { roomId } = useParams();

  const dispatch = useDispatch<AppDispatch>();
  const { playerOneName, loggedInUser } = useSelector((state: RootState) => state.player);

  useEffect(() => {
    if (!loggedInUser) {
      dispatch(setPlayerOneName(""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  useEffect(() => {
    socket.on("roomCreated", ({ roomId, gameId }: { roomId: string; gameId: string }) => {
      const link = `${window.location.origin}/game/${roomId}`;
      dispatch(setLink(link));
      dispatch(setGameId(gameId));
      navigate(`/game/${roomId}`);
    });

    return () => {
      socket.off("roomCreated");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId]);

  const createRoom = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (loggedInUser && loggedInUser !== null) {
      dispatch(setPlayerOneName(loggedInUser.username));
      socket.emit("createRoom", loggedInUser.username);
      dispatch(setIsPlayerOne(true));
    } else if (playerOneName) {
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
            className={`${loggedInUser ? "bg-gray-300 cursor-default" : ""}
            pl-3 bg-stone-50 text-stone-950 rounded-md h-10`}
            type="text"
            placeholder="Name"
            minLength={3}
            maxLength={11}
            disabled={!loggedInUser && loggedInUser !== null}
            autoFocus={!loggedInUser}
            value={loggedInUser?.username || playerOneName || ""}
            onChange={(e) => dispatch(setPlayerOneName(e.target.value))}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-green-700 hover:bg-green-800 ml-3 rounded-md w-12 caret-transparent"
            disabled={!playerOneName && !loggedInUser?.username}
            tabIndex={-1}
          >
            GO!
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default PlayerOneCreateAndJoin;
