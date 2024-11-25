import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setIsPlayerOne, setPlayerOneId, setPlayerOneName } from "../features/player/playerSlice";
import { setLink } from "../features/link/linkSlice";
import { v4 as uuidv4 } from "uuid";
import getSocketInstance from "../socket";
import { setGameId } from "../features/game/gameSlice";

const Lobby: React.FC = () => {
  const socketRef = useRef(getSocketInstance());
  const socket = socketRef.current;

  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  const { playerOneName, loggedInUser } = useSelector((state: RootState) => state.player);

  useEffect(() => {
    if (!playerOneName) {
      dispatch(setPlayerOneName("anonymous"));
    }
  }, [playerOneName, dispatch]);

  useEffect(() => {
    if (loggedInUser) {
      const { username, _id } = loggedInUser;
      localStorage.setItem("playerId", _id);
      dispatch(setPlayerOneId(_id || null));
      dispatch(setPlayerOneName(username));
    } else {
      localStorage.removeItem("playerId");
      dispatch(setPlayerOneName("anonymous"));
    }
  }, [loggedInUser, dispatch]);

  useEffect(() => {
    socket.on("gameCreated", ({ gameId }: { gameId: string }) => {
      const link = `${window.location.origin}/${gameId}`;
      dispatch(setGameId(gameId));
      dispatch(setLink(link));
      navigate(`/${gameId}`);
    });

    return () => {
      socket.off("gameCreated");
    };
  }, [dispatch, navigate, socket]);

  const createGame = (e: React.FormEvent) => {
    e.preventDefault();

    let id = localStorage.getItem("playerId");
    const gameId = uuidv4().slice(0, 8);

    if (!id && !loggedInUser) {
      id = uuidv4().slice(0, 8);
      localStorage.setItem("playerId", id);
    }

    if (loggedInUser) {
      const { username, _id } = loggedInUser;
      dispatch(setPlayerOneName(username));
      dispatch(setPlayerOneId(_id || null));
      dispatch(setIsPlayerOne(true));
      socket.emit("createGame", username, _id, gameId);
    } else if (playerOneName) {
      const playerName = playerOneName;
      const playerId = id;
      dispatch(setIsPlayerOne(true));
      dispatch(setPlayerOneId(playerId));
      socket.emit("createGame", playerName, playerId, gameId);
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
          >
            Play a Friend!
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default Lobby;
