"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllLogs,
  deleteLog,
  clearTimeLogError,
  clearTimeLogSuccess,
} from "../../Reducers/TimeLogsReducers";
import type { TimeLog } from "../../Reducers/TimeLogsReducers";
import { getAllProjects } from "../../Reducers/ProjectReducers";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Delete } from "../../Icons/Delete";
import toast from "react-hot-toast";
import { Users } from "../../Icons/DashboardIcons";
import { Calendar1 } from "../../Icons/Calender1";
import { ProjectIcon } from "../../Icons/SidebarIcon";

const ManagerTimeLogs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { logs, loading, error, success } = useSelector(
    (state: RootState) => state.workLogs
  );
  const { projects } = useSelector((state: RootState) => state.projects);
  const { currentUser } = useSelector((state: RootState) => state.users);

  // Fetch all logs and projects
  useEffect(() => {
    dispatch(getAllLogs());
    dispatch(getAllProjects());
  }, [dispatch]);

  // Handle error & success
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTimeLogError());
    }
    if (success) {
      dispatch(clearTimeLogSuccess());
    }
  }, [error, success, dispatch]);

  // Delete log
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this log?")) {
      dispatch(deleteLog(id)).then(() => {
        toast.success("Log deleted successfully 🗑️");
      });
    }
  };

  // Filter logs relevant to the manager
  const managerLogs = logs.filter((log: TimeLog) => {
    const project = projects.find(
      (p) =>
        p._id ===
        (typeof log.project === "string" ? log.project : log.project?._id)
    );
    if (!project) return false;

    const managerId =
      typeof project.manager === "string"
        ? project.manager
        : project.manager?._id;

    return log.user._id === currentUser?._id || managerId === currentUser?._id;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">
        Manager Time Logs
      </h1>

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      )}

      {!loading && managerLogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managerLogs.map((log: TimeLog) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-6 border hover:shadow-lg transition"
            >
              <h2 className="text-lg font-bold text-blue-600 mb-2">
                {log.task.title}
              </h2>

              <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <ProjectIcon
                    height={15}
                    width={15}
                    stroke="blue"
                    className="text-gray-400"
                  />
                  <span>
                    {(() => {
                      const projectId =
                        typeof log.project === "string"
                          ? log.project
                          : log.project._id;
                      const project = projects.find((p) => p._id === projectId);
                      return project?.name || "Unknown Project";
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-0.5">
                  <Users
                    height={15}
                    width={15}
                    stroke="blue"
                    className="text-gray-400"
                  />
                  <span>{log.user.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar1
                    height={15}
                    width={15}
                    stroke="blue"
                    className="text-gray-400"
                  />
                  <span>
                    {log.startTime
                      ? new Date(log.startTime).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                {log.endTime && (
                  <div className="flex items-center gap-2">
                    <Calendar1
                      height={15}
                      width={15}
                      stroke="blue"
                      className="text-gray-400"
                    />
                    <span>{new Date(log.endTime).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    log.status === "running"
                      ? "bg-green-100 text-green-700"
                      : log.status === "paused"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {log.status}
                </span>
                <button onClick={() => handleDelete(log._id)}>
                  <Delete height={20} stroke="red" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && managerLogs.length === 0 && (
        <div className="text-center text-gray-500 italic py-10">
          No time logs found for you or your projects.
        </div>
      )}
    </div>
  );
};

export default ManagerTimeLogs;
