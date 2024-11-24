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
  const { gameId } = useParams();

  const dispatch = useDispatch<AppDispatch>();
  const { playerOneName, loggedInUser } = useSelector((state: RootState) => state.player);

  useEffect(() => {
    if (!playerOneName) {
      dispatch(setPlayerOneName("anonymous"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem("playerOneId", loggedInUser._id);
      dispatch(setPlayerOneId(loggedInUser._id || null));
      dispatch(setPlayerOneName(loggedInUser.username));
    } else {
      localStorage.removeItem("playerOneId");
      dispatch(setPlayerOneName("anonymous"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  useEffect(() => {
    socket.on("gameCreated", ({ gameId }: { gameId: string }) => {
      const link = `${window.location.origin}/${gameId}`;
      dispatch(setLink(link));
      navigate(`/${gameId}`);
    });

    return () => {
      socket.off("gameCreated");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, gameId]);

  const createGame = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    let id = localStorage.getItem("playerOneId");
    const gameId = uuidv4().slice(0, 8);

    if (!id && !loggedInUser) {
      id = uuidv4().slice(0, 8);
      localStorage.setItem("playerOneId", id);
    }

    if (loggedInUser && loggedInUser !== null) {
      const { username, _id } = loggedInUser;
      dispatch(setPlayerOneName(username));
      dispatch(setPlayerOneId(_id || null));
      dispatch(setIsPlayerOne(true));
      socket.emit("createGame", username, _id, gameId);
    } else if (playerOneName) {
      const playerName = playerOneName;
      const playerId = id;
      socket.emit("createGame", playerName, playerId, gameId);
      dispatch(setIsPlayerOne(true));
      dispatch(setPlayerOneId(playerId));
    }
  };

  return (
    <div>
      <div>
        <form className="flex justify-center py-3" onSubmit={createGame}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-orange-700 mt-8 hover:bg-orange-800 ml-3 rounded-md p-3 caret-transparent"
            disabled={!playerOneName && !loggedInUser?.username}
            tabIndex={-1}
          >
            Play a Friend!
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default Lobby;
