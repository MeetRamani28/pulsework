"use client";

import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { PlusCircle, ClockIcon } from "../../Icons/DashboardIcons";
import { ProjectIcon, TasksIcon } from "../../Icons/SidebarIcon";
import { useNavigate } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subDays,
} from "date-fns";

// ✅ Import async thunks
import { getAllProjects } from "../../Reducers/ProjectReducers";
import { getAllTasks } from "../../Reducers/TaskReducers";
import { getAllLogs } from "../../Reducers/TimeLogsReducers";
import { getCurrentUser } from "../../Reducers/UserReducers";

// Interfaces
interface TaskChartData {
  name: string;
  tasks: number;
}
interface ProjectCompletionData {
  name: string;
  completed: number;
}
interface TimeLogData {
  name: string;
  logs: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6 },
  }),
};
const cardHover = { hover: { scale: 1.05, transition: { duration: 0.3 } } };

const ManagerDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);
  const { projects, loading: projectLoading } = useSelector(
    (state: RootState) => state.projects
  );
  const { tasks, loading: taskLoading } = useSelector(
    (state: RootState) => state.tasks
  );
  const { logs: timelogs, loading: timelogLoading } = useSelector(
    (state: RootState) => state.workLogs
  );

  useEffect(() => {
    dispatch(getAllProjects());
    dispatch(getAllTasks());
    dispatch(getAllLogs());
    dispatch(getCurrentUser());
  }, [dispatch]);

  // ✅ Filter only projects assigned to the logged-in manager
  const assignedProjects = useMemo(() => {
    if (!user) return [];
    return projects.filter((p) => {
      if (typeof p.manager === "string") return p.manager === user._id;
      return p.manager?._id === user._id;
    });
  }, [projects, user]);

  // ✅ Filter tasks based on manager’s projects
  const assignedTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.project) return false;

      if (typeof t.project === "string") {
        return assignedProjects.some((p) => p._id === t.project);
      }

      return assignedProjects.some(
        (p) => p._id === (t.project as { _id: string })._id
      );
    });
  }, [tasks, assignedProjects]);

  // ✅ Filter logs based on manager’s projects
  const assignedLogs = useMemo(() => {
    return timelogs.filter((l) =>
      assignedProjects.some((p) => p._id === l.project?._id)
    );
  }, [timelogs, assignedProjects]);

  const projectCount = assignedProjects.length;
  const taskCount = assignedTasks.length;
  const timelogCount = assignedLogs.length;

  // Weekly Tasks (last 7 days)
  const weeklyTasksData: TaskChartData[] = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      return { name: format(date, "EEE"), date, tasks: 0 };
    });

    assignedTasks.forEach((task) => {
      const taskDate = task.createdAt ? new Date(task.createdAt) : null;
      if (taskDate) {
        const dayObj = last7Days.find(
          (d) => format(d.date, "yyyy-MM-dd") === format(taskDate, "yyyy-MM-dd")
        );
        if (dayObj) dayObj.tasks += 1;
      }
    });

    return last7Days;
  }, [assignedTasks]);

  // Completed Projects per month
  const completedProjectsData: ProjectCompletionData[] = useMemo(() => {
    if (assignedProjects.length === 0) return [];

    const dates = assignedProjects
      .filter((p) => !!p.createdAt)
      .map((p) => new Date(p.createdAt!));
    if (dates.length === 0) return [];

    const start = startOfMonth(
      new Date(Math.min(...dates.map((d) => d.getTime())))
    );
    const end = endOfMonth(
      new Date(Math.max(...dates.map((d) => d.getTime())))
    );
    const months = eachMonthOfInterval({ start, end });

    return months.map((monthDate) => {
      const monthLabel = format(monthDate, "MMM yyyy");
      const completedCount = assignedProjects.filter(
        (p) =>
          p.status === "completed" &&
          format(new Date(p.createdAt!), "MMM yyyy") === monthLabel
      ).length;
      return { name: monthLabel, completed: completedCount };
    });
  }, [assignedProjects]);

  // TimeLogs last 7 days
  const weeklyTimeLogsData: TimeLogData[] = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      return { name: format(date, "EEE"), date, logs: 0 };
    });

    assignedLogs.forEach((log) => {
      const logDate = log.startTime ? new Date(log.startTime) : null;
      if (logDate) {
        const dayObj = last7Days.find(
          (d) => format(d.date, "yyyy-MM-dd") === format(logDate, "yyyy-MM-dd")
        );
        if (dayObj) dayObj.logs += 1;
      }
    });

    return last7Days;
  }, [assignedLogs]);

  if (projectLoading || taskLoading || timelogLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-lg">
        Loading manager dashboard...
      </div>
    );
  }

  const summaryCards = [
    { title: "Projects", value: projectCount, icon: <ProjectIcon /> },
    { title: "Tasks", value: taskCount, icon: <TasksIcon /> },
    { title: "TimeLogs", value: timelogCount, icon: <ClockIcon /> },
  ];

  return (
    <div className="w-full min-h-screen p-6 bg-gradient-to-br from-green-50 to-green-100 space-y-6">
      {/* Welcome */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={0}
        className="text-center"
      >
        <h1 className="text-4xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
          Welcome Manager{" "}
          <span className="text-blue-600">{user?.name || "User"}</span>
        </h1>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={i}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={i + 1}
            whileHover="hover"
          >
            <motion.div
              className="p-4 shadow-md rounded-2xl bg-white flex items-center justify-between hover:shadow-xl transition-all"
              variants={cardHover}
            >
              <div>
                <p className="text-gray-500">{card.title}</p>
                <h2 className="text-2xl font-bold">{card.value}</h2>
              </div>
              <div className="text-green-600">{card.icon}</div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="flex flex-col md:flex-row gap-4 mt-6">
        {/* Weekly Tasks */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={4}
          className="w-full md:w-1/3 p-4 rounded-2xl shadow-md bg-white flex flex-col items-center"
        >
          <h2 className="font-bold text-lg mb-2">Weekly Tasks</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyTasksData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#16a34a"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Completed Projects */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={5}
          className="w-full md:w-1/3 p-4 rounded-2xl shadow-md bg-white flex flex-col items-center"
        >
          <h2 className="font-bold text-lg mb-2">Completed Projects</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={completedProjectsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#f59e0b"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly TimeLogs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={6}
          className="w-full md:w-1/3 p-4 rounded-2xl shadow-md bg-white flex flex-col items-center"
        >
          <h2 className="font-bold text-lg mb-2">Weekly TimeLogs</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyTimeLogsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="logs"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={7}
        className="p-6 rounded-2xl shadow-md bg-white mt-6"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-green-600" strokeWidth={2} />
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate("/manager/project")}
            className="flex items-center gap-3 px-6 py-3 bg-green-50 text-green-700 rounded-xl shadow-md hover:bg-green-100 hover:scale-105 transition-transform duration-300"
          >
            <ProjectIcon width={22} height={22} stroke="#16a34a" />
            <span className="font-medium">Add Project</span>
          </button>
          <button
            onClick={() => navigate("/manager/tasks")}
            className="flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-700 rounded-xl shadow-md hover:bg-blue-100 hover:scale-105 transition-transform duration-300"
          >
            <TasksIcon width={22} height={22} stroke="#2563eb" />
            <span className="font-medium">Add Task</span>
          </button>
          <button
            onClick={() => navigate("/manager/work-logs")}
            className="flex items-center gap-3 px-6 py-3 bg-yellow-50 text-yellow-700 rounded-xl shadow-md hover:bg-yellow-100 hover:scale-105 transition-transform duration-300"
          >
            <ClockIcon width={22} height={22} stroke="#f59e0b" />
            <span className="font-medium">Review TimeLogs</span>
          </button>
        </div>
      </motion.div>

      {/* Active Tasks Table */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={8}
        className="p-6 rounded-2xl shadow-md bg-white mt-6"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2">
          <TasksIcon className="w-6 h-6 text-blue-600" strokeWidth={2} />
          Active Tasks
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold uppercase tracking-wider">
                  Task
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold uppercase tracking-wider">
                  Project
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignedTasks.filter((t) => t.status !== "completed").length >
              0 ? (
                assignedTasks
                  .filter((t) => t.status !== "completed")
                  .map((task, index) => (
                    <tr
                      key={task._id}
                      className={`transition hover:bg-blue-50 ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      {/* Task Title */}
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {task.title}
                      </td>

                      {/* Project Name */}
                      <td className="px-4 py-3 text-gray-700">
                        {typeof task.project === "string"
                          ? task.project
                          : task.project?.name}
                      </td>

                      {/* Assigned To */}
                      <td className="px-4 py-3 text-gray-700">
                        {typeof task.assignedTo === "string"
                          ? task.assignedTo
                          : task.assignedTo?.name || "Unassigned"}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-white text-sm font-semibold
                      ${
                        task.status === "in-progress"
                          ? "bg-blue-500"
                          : task.status === "todo"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                        >
                          {task.status === "in-progress"
                            ? "In Progress"
                            : task.status === "todo"
                            ? "Todo"
                            : "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No active tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default ManagerDashboard;
