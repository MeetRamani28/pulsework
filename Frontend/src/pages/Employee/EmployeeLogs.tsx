"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllSummaries,
  clearTimeLogError,
  clearTimeLogSuccess,
} from "../../Reducers/TimeLogsReducers";
import { getAllTasks } from "../../Reducers/TaskReducers";
import toast from "react-hot-toast";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const EmployeeWorkLogs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { error, success, currentLog, summaries } = useSelector(
    (state: RootState) => state.workLogs
  );

  useEffect(() => {
    dispatch(getAllSummaries());
    dispatch(getAllTasks());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTimeLogError());
    }
    if (success) {
      toast.success("Action successful");
      dispatch(clearTimeLogSuccess());
    }
  }, [error, success, dispatch]);

  // open popup directly
  const handleStart = () => {
    const timerWindow = window.open(
      `/employee/timer-popup`,
      "TimerPopup",
      "width=450,height=450,resizable,scrollbars=no"
    );

    if (!timerWindow) toast.error("Please allow popups for this site.");
  };

  // ✅ Convert seconds into HH:MM format
  const formatHHMM = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Use summary from backend, fallback to totalHours in seconds if needed
  const calendarEvents = summaries
    ? summaries.map((s) => ({
        id: s.date,
        title: `Hours: ${
          s.formatted || formatHHMM(s.totalHours * 3600)
        }\nTasks: ${s.taskCount}`,
        start: s.date,
        allDay: true,
        color: "#3b82f6",
      }))
    : [];

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h1
          className="text-3xl font-extrabold text-blue-700 tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          My Work Calendar
        </motion.h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition"
        >
          <Play size={18} />
          Start Timer
        </motion.button>
      </div>

      {/* Running Task Banner */}
      {currentLog?.status === "running" && (
        <motion.div
          className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-semibold text-green-700">
            ⏱ Currently running:{" "}
            <span className="text-green-800">{currentLog.task?.title}</span>
          </p>
        </motion.div>
      )}

      {/* Calendar Container */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg border p-6 min-h-[550px]"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth",
          }}
          events={calendarEvents}
          height="auto"
        />
      </motion.div>
    </motion.div>
  );
};

export default EmployeeWorkLogs;
