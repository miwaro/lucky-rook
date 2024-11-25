import React, { useEffect } from "react";
import { FaRegClipboard } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import "react-toastify/dist/ReactToastify.css";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { useNavigate } from "react-router-dom";
import { setPlayerOneId, setPlayerOneName } from "../features/player/playerSlice";

const LinkShare: React.FC = () => {
  const navigate = useNavigate();

  const { playerOneName, loggedInUser } = useSelector((state: RootState) => state.player);
  const { link } = useSelector((state: RootState) => state.link);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem("playerId", loggedInUser._id);
      dispatch(setPlayerOneId(loggedInUser._id || null));
      dispatch(setPlayerOneName(loggedInUser.username));
    }
  }, [loggedInUser, dispatch]);

  useEffect(() => {
    if (!playerOneName && !loggedInUser) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser, playerOneName]);

  const copyLinkToClipboard = () => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied, the game will begin when they join!");
      })
      .catch((err) => {
        toast.error("Failed to copy link!");
        console.error("Failed to copy link: ", err);
      });
  };

  return (
    <div>
      <div className="flex justify-center items-center flex-col mt-20">
        <h2 className="text-stone-50 text-lg">
          Share this link with a friend <span className="italic text-sm">(or foe).</span>
        </h2>
        <motion.div
          whileTap={{ scale: 0.97 }}
          whileHover={{ opacity: 1 }}
          onClick={copyLinkToClipboard}
          className="flex items-center border border-stone-50 rounded-md mt-1 hover:bg-opacity-70 cursor-copy opacity-70"
        >
          <span className="w-fit text-xs my-2 px-2 cursor-copy">{link}</span>
          <span className="text-xl pr-1">
            <FaRegClipboard />
          </span>
        </motion.div>
        <div className="flex flex-col mt-[575px]">
          <div className="flex">
            <FormatQuoteIcon sx={{ transform: "scaleX(-1) scaleY(-1)" }} />
            <p className="text-3xl">In Chess, as it is played by masters, chance is practically eliminated.</p>
            <FormatQuoteIcon />
          </div>
          <div className="ml-20 mt-5">-Emanuel Lasker</div>
        </div>
      </div>
    </div>
  );
};

export default LinkShare;
