import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronsLeft } from "../Icons/ChevronsLeft";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-white to-blue-600 text-white relative overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Animated Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center max-w-lg w-full px-6"
      >
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 shadow-2xl border border-white/20">
          <h1 className="text-7xl font-extrabold drop-shadow-md tracking-wide">
            404
          </h1>
          <p className="mt-4 text-lg text-gray-200">
            Oops! The page you’re looking for doesn’t exist or has been moved.
          </p>

          {/* Back Button */}
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <ChevronsLeft width={20} height={20} stroke="#fff" /> Back to Home
          </Link>
        </div>
      </motion.div>

      {/* Animated Background Elements */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500 rounded-full opacity-30 blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full opacity-30 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
      />
    </div>
  );
};

export default NotFound;
