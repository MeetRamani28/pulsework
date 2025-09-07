"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  pauseLog,
  resumeLog,
  startLog,
  stopLog,
} from "../../Reducers/TimeLogsReducers";
import { getAllTasks } from "../../Reducers/TaskReducers";
import toast from "react-hot-toast";
import { CustomDropdown } from "../../components/atoms/CustomDropdown";
import { motion, AnimatePresence } from "framer-motion";

const TimerPopup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentLog, loading } = useSelector(
    (state: RootState) => state.workLogs
  );
  const { tasks } = useSelector((state: RootState) => state.tasks);

  const [seconds, setSeconds] = useState(0);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const hasStartedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    dispatch(getAllTasks());
  }, [dispatch]);

  // live timer effect
  useEffect(() => {
    if (currentLog?.status === "running") {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(
          () => setSeconds((prev) => prev + 1),
          1000
        );
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentLog?.status]);

  useEffect(() => {
    if (currentLog?.status === "stopped") {
      setSeconds(0);
      toast.success("Timer stopped ✅");
      window.close();
    }
  }, [currentLog?.status]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!selectedProject) return toast.error("Select a project first");
    if (!selectedTask) return toast.error("Select a task first");
    if (!hasStartedRef.current) {
      setSeconds(0);
      dispatch(startLog(selectedTask));
      toast.success("Timer started ✅");
      hasStartedRef.current = true;
    }
  };

  const handlePause = () => {
    if (!currentLog) return;
    dispatch(pauseLog(currentLog._id));
    toast("Paused ⏸️");
  };

  const handleResume = () => {
    if (!currentLog) return;
    dispatch(resumeLog(currentLog._id));
    toast("Resumed ▶️");
  };

  const handleStop = () => {
    if (!currentLog) return;
    dispatch(stopLog(currentLog._id));
    setSeconds(0);
    toast.success("Stopped ✅");
  };

  const handleCancel = () => {
    toast("Closed without stopping ⏹️");
    window.close();
  };

  const projectOptions = [
    ...new Map(
      tasks
        .filter((t) => t.project && typeof t.project !== "string")
        .map((t) => [
          (t.project as { _id: string; name: string })._id,
          {
            label: (t.project as { _id: string; name: string }).name,
            value: (t.project as { _id: string; name: string })._id,
          },
        ])
    ).values(),
  ];

  return (
    <motion.div
      className="h-screen w-full flex flex-col bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-4 px-6 flex justify-between items-center shadow-md"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">⏱ Timer</h1>
      </motion.div>

      {/* Dropdowns */}
      <motion.div
        className="p-6 flex flex-col md:flex-row gap-4 justify-center items-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <CustomDropdown
          options={projectOptions}
          selected={selectedProject}
          onSelect={(val) => {
            setSelectedProject(val);
            setSelectedTask("");
          }}
          placeholder="Select Project"
          disabled={!!currentLog && currentLog.status !== "stopped"}
        />
        <CustomDropdown
          options={tasks
            .filter(
              (t) =>
                t.project &&
                typeof t.project !== "string" &&
                t.project._id === selectedProject
            )
            .map((t) => ({ label: t.title, value: t._id }))}
          selected={selectedTask}
          onSelect={setSelectedTask}
          placeholder="Select Task"
          disabled={!!currentLog && currentLog.status !== "stopped"}
        />
      </motion.div>

      {/* Timer Display */}
      <motion.div
        className="flex-1 flex flex-col justify-center items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.div
          className="text-7xl md:text-8xl font-mono font-extrabold mb-8 text-gray-800"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {formatTime(seconds)}
        </motion.div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <AnimatePresence>
            {!currentLog && (
              <motion.button
                onClick={handleStart}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                Start
              </motion.button>
            )}
            {currentLog?.status === "running" && (
              <motion.button
                onClick={handlePause}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                Pause
              </motion.button>
            )}
            {currentLog?.status === "paused" && (
              <motion.button
                onClick={handleResume}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                Resume
              </motion.button>
            )}
            {currentLog && (
              <motion.button
                onClick={handleStop}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                Stop
              </motion.button>
            )}
            <motion.button
              onClick={handleCancel}
              className="px-8 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-xl font-semibold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimerPopup;
