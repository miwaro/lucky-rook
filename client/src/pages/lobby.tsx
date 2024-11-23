import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setIsPlayerOne, setPlayerOneId, setPlayerOneName } from "../features/player/playerSlice";
import { setLink } from "../features/link/linkSlice";
import { v4 as uuidv4 } from "uuid";

import getSocketInstance from "../socket";

const Lobby: React.FC = () => {
  const socketRef = useRef(getSocketInstance());
  const socket = socketRef.current;

  const navigate = useNavigate();
  const { roomId } = useParams();

  const dispatch = useDispatch<AppDispatch>();
  const { playerOneName, loggedInUser } = useSelector((state: RootState) => state.player);

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem("playerOneId", loggedInUser._id);
      dispatch(setPlayerOneId(loggedInUser._id || null));
      dispatch(setPlayerOneName(loggedInUser.username));
    } else {
      localStorage.removeItem("playerOneId");
      dispatch(setPlayerOneName(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  useEffect(() => {
    socket.on("roomCreated", ({ roomId }: { roomId: string }) => {
      const link = `${window.location.origin}/room/${roomId}`;
      dispatch(setLink(link));
      navigate(`/room/${roomId}`);
    });

    return () => {
      socket.off("roomCreated");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId]);

  const createRoom = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    let id = localStorage.getItem("playerOneId");

    if (!id && !loggedInUser) {
      id = uuidv4();
      localStorage.setItem("playerOneId", id);
    }

    if (loggedInUser && loggedInUser !== null) {
      const { username, _id } = loggedInUser;
      dispatch(setPlayerOneName(username));
      dispatch(setPlayerOneId(_id || null));
      dispatch(setIsPlayerOne(true));
      socket.emit("createRoom", username, _id);
    } else if (playerOneName) {
      const playerName = playerOneName;
      const playerId = id;

      socket.emit("createRoom", playerName, playerId);
      dispatch(setIsPlayerOne(true));
      dispatch(setPlayerOneId(playerId));
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
            disabled={!!loggedInUser}
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

export default Lobby;
