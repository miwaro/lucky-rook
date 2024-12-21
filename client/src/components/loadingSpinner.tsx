import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface TextToSpinnerProps {
  text?: string;
  delay?: number;
}

export default function TextToSpinner({ text = "Loading...", delay = 1500 }: TextToSpinnerProps) {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSpinner(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-40 h-10 flex items-center justify-center overflow-hidden">
        <AnimatePresence>
          {!showSpinner && (
            <motion.span
              className="text-xl font-bold"
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 0.8 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 1.5 }}
            >
              {text}
            </motion.span>
          )}
        </AnimatePresence>
        {showSpinner && (
          <motion.div
            className="absolute w-5 h-5 border-4 border-t-blue-500 border-gray-300 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 360 }}
            transition={{ duration: 1.5 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ animation: "spin 1s linear infinite" }}
          ></motion.div>
        )}
      </div>
    </div>
  );
}
