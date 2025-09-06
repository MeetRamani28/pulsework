"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import type { TimeLog } from "../../Reducers/TimeLogsReducers";
import {
  pauseLog,
  resumeLog,
  stopLog,
  deleteLog,
  getAllLogs,
  clearTimeLogError,
  clearTimeLogSuccess,
} from "../../Reducers/TimeLogsReducers";
import { Loader2, Play, Pause, Square as Stop, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const AdminWorkLogs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { logs, loading, error, success } = useSelector(
    (state: RootState) => state.workLogs
  );

  const [filter, setFilter] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handlePause = async (logId: string) => {
    setActionLoading(logId);
    const result = await dispatch(pauseLog(logId));
    setActionLoading(null);
    if (pauseLog.fulfilled.match(result)) {
      toast.success("Task paused successfully");
    } else {
      toast.error(result.payload || "Failed to pause task");
    }
  };

  const handleResume = async (logId: string) => {
    setActionLoading(logId);
    const result = await dispatch(resumeLog(logId));
    setActionLoading(null);
    if (resumeLog.fulfilled.match(result)) {
      toast.success("Task resumed successfully");
    } else {
      toast.error(result.payload || "Failed to resume task");
    }
  };

  const handleStop = async (logId: string) => {
    setActionLoading(logId);
    const result = await dispatch(stopLog(logId));
    setActionLoading(null);
    if (stopLog.fulfilled.match(result)) {
      toast.success("Task stopped successfully");
    } else {
      toast.error(result.payload || "Failed to stop task");
    }
  };

  const handleRestart = async (logId: string) => {
    setActionLoading(logId);
    const result = await dispatch(resumeLog(logId)); // For stopped tasks
    setActionLoading(null);
    if (resumeLog.fulfilled.match(result)) {
      toast.success("Task restarted successfully");
    } else {
      toast.error(result.payload || "Failed to restart task");
    }
  };

  const handleDelete = async (logId: string) => {
    if (confirm("Are you sure you want to delete this log?")) {
      setActionLoading(logId);
      const result = await dispatch(deleteLog(logId));
      setActionLoading(null);
      if (deleteLog.fulfilled.match(result)) {
        toast.success("Task deleted successfully");
      } else {
        toast.error(result.payload || "Failed to delete task");
      }
    }
  };

  // Fetch logs on mount
  useEffect(() => {
    dispatch(getAllLogs());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTimeLogError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      dispatch(clearTimeLogSuccess());
    }
  }, [success, dispatch]);

  const filteredLogs = logs.filter(
    (log) =>
      (log.task?.title ?? "").toLowerCase().includes(filter.toLowerCase()) ||
      (log.project?.name ?? "").toLowerCase().includes(filter.toLowerCase()) ||
      (log.user?.name ?? "").toLowerCase().includes(filter.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-700">Admin WorkLogs</h1>

      <input
        type="text"
        placeholder="Search by task, project, or user..."
        className="w-full md:w-1/2 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {filteredLogs.length === 0 ? (
        <div className="text-gray-500 italic mt-10">No logs found.</div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
            <thead className="bg-blue-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Task
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Project
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Assigned To
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Start
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  End
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredLogs.map((log: TimeLog) => (
                  <motion.tr
                    key={log._id}
                    className="border-b hover:bg-gray-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="py-3 px-4 text-gray-700">
                      {log.task?.title ?? "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {log.project?.name ?? "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {log.user?.name ?? "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {log.startTime
                        ? new Date(log.startTime).toLocaleString()
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {log.endTime
                        ? new Date(log.endTime).toLocaleString()
                        : "-"}
                    </td>
                    <td className="py-3 px-4">
                      {log.status === "running" && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Running
                        </span>
                      )}
                      {log.status === "paused" && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                          Paused
                        </span>
                      )}
                      {log.status === "stopped" && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          Stopped
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 flex justify-center gap-2">
                      {log.status === "running" && (
                        <>
                          <ActionButton
                            loading={actionLoading === log._id}
                            onClick={() => handlePause(log._id)}
                            color="yellow"
                            icon={<Pause size={16} />}
                            text="Pause"
                          />
                          <ActionButton
                            loading={actionLoading === log._id}
                            onClick={() => handleStop(log._id)}
                            color="red"
                            icon={<Stop size={16} />}
                            text="Stop"
                          />
                        </>
                      )}

                      {log.status === "paused" && (
                        <>
                          <ActionButton
                            loading={actionLoading === log._id}
                            onClick={() => handleResume(log._id)}
                            color="green"
                            icon={<Play size={16} />}
                            text="Resume"
                          />
                          <ActionButton
                            loading={actionLoading === log._id}
                            onClick={() => handleStop(log._id)}
                            color="red"
                            icon={<Stop size={16} />}
                            text="Stop"
                          />
                        </>
                      )}

                      {log.status === "stopped" && (
                        <ActionButton
                          loading={actionLoading === log._id}
                          onClick={() => handleRestart(log._id)}
                          color="green"
                          icon={<Play size={16} />}
                          text="Resume"
                        />
                      )}

                      <ActionButton
                        loading={actionLoading === log._id}
                        onClick={() => handleDelete(log._id)}
                        color="red-light"
                        icon={<Trash2 size={16} />}
                        text="Delete"
                      />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminWorkLogs;

// ----------------------
// Helper Action Button
// ----------------------
interface ActionButtonProps {
  loading: boolean;
  onClick: () => void;
  color: "green" | "yellow" | "red" | "red-light";
  icon: React.ReactNode;
  text: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  loading,
  onClick,
  color,
  icon,
  text,
}) => {
  const colors = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    "red-light": "bg-red-50 text-red-500",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-3 py-1 rounded flex items-center gap-1 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed ${colors[color]}`}
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : icon}
      {text}
    </button>
  );
};
