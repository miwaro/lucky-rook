import React from "react";
import { FaRegClipboard } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import "react-toastify/dist/ReactToastify.css";

const LinkShare: React.FC = () => {
  const { link } = useSelector((state: RootState) => state.link);

  const copyLinkToClipboard = () => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Failed to copy link!");
        console.error("Failed to copy link: ", err);
      });
  };

  return (
    <div>
      <div className="flex justify-center items-center flex-col mt-20">
        <h2 className="text-stone-50 text-center">
          Share the link below with a friend <span className="italic">(or foe).</span> <br />
          <div className="text-sm">The game will begin when they join.</div>
        </h2>
        <motion.div
          whileTap={{ scale: 0.95 }}
          whileHover={{ opacity: 1 }}
          onClick={copyLinkToClipboard}
          className="flex items-center border border-stone-50 rounded-md mt-3 hover:bg-opacity-70 cursor-copy opacity-70"
        >
          <span className="w-fit text-xs my-2 px-2 cursor-copy">{link}</span>
          <span className="text-2xl pr-2">
            <FaRegClipboard />
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default LinkShare;
