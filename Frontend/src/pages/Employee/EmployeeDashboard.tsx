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
import { ProjectIcon, TasksIcon } from "../../Icons/SidebarIcon";
import { ClockIcon } from "../../Icons/DashboardIcons";
import { getAllProjects } from "../../Reducers/ProjectReducers";
import { getAllTasks } from "../../Reducers/TaskReducers";
import { getAllLogs } from "../../Reducers/TimeLogsReducers";
import { getCurrentUser } from "../../Reducers/UserReducers";
import { format, subDays } from "date-fns";
import type { Project } from "../../Reducers/ProjectReducers";

// Animations
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6 },
  }),
};
const cardHover = { hover: { scale: 1.05, transition: { duration: 0.3 } } };

const EmployeeDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
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

  console.log("All Projects:", projects);
  console.log("All Tasks:", tasks);
  console.log("All TimeLogs:", timelogs);
  useEffect(() => {
    dispatch(getAllProjects());
    dispatch(getAllTasks());
    dispatch(getAllLogs());
    dispatch(getCurrentUser());
  }, [dispatch]);

  // ✅ Projects where employee is a member
  const myProjects = useMemo(() => {
    if (!user) return [];
    return projects.filter((p: Project) =>
      p.members?.some((m: string | { _id: string }) =>
        typeof m === "string" ? m === user._id : m._id === user._id
      )
    );
  }, [projects, user]);

  // ✅ Tasks assigned to me
  const myTasks = useMemo(() => {
    if (!user) return [];
    return tasks.filter((t) => {
      if (!t.assignedTo) return false;
      return typeof t.assignedTo === "string"
        ? t.assignedTo === user._id
        : t.assignedTo?._id === user._id;
    });
  }, [tasks, user]);

  // ✅ My Time Logs
  const myLogs = useMemo(() => {
    if (!user) return [];
    return timelogs.filter((l) =>
      l.user
        ? typeof l.user === "string"
          ? l.user === user._id
          : l.user._id === user._id
        : false
    );
  }, [timelogs, user]);

  const projectCount = myProjects.length;
  const taskCount = myTasks.length;
  const timelogCount = myLogs.length;

  // Weekly Tasks
  const weeklyTasksData = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      return { name: format(date, "EEE"), date, tasks: 0 };
    });

    myTasks.forEach((task) => {
      const taskDate = task.createdAt ? new Date(task.createdAt) : null;
      if (taskDate) {
        const dayObj = last7Days.find(
          (d) => format(d.date, "yyyy-MM-dd") === format(taskDate, "yyyy-MM-dd")
        );
        if (dayObj) dayObj.tasks += 1;
      }
    });

    return last7Days;
  }, [myTasks]);

  // Weekly TimeLogs
  const weeklyTimeLogsData = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      return { name: format(date, "EEE"), date, logs: 0 };
    });

    myLogs.forEach((log) => {
      const logDate = log.startTime ? new Date(log.startTime) : null;
      if (logDate) {
        const dayObj = last7Days.find(
          (d) => format(d.date, "yyyy-MM-dd") === format(logDate, "yyyy-MM-dd")
        );
        if (dayObj) dayObj.logs += 1;
      }
    });

    return last7Days;
  }, [myLogs]);

  if (projectLoading || taskLoading || timelogLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-lg">
        Loading employee dashboard...
      </div>
    );
  }

  const summaryCards = [
    { title: "My Projects", value: projectCount, icon: <ProjectIcon /> },
    { title: "My Tasks", value: taskCount, icon: <TasksIcon /> },
    { title: "My TimeLogs", value: timelogCount, icon: <ClockIcon /> },
  ];

  return (
    <div className="w-full min-h-screen p-6 bg-gradient-to-br from-blue-50 to-blue-100 space-y-6">
      {/* Welcome */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={0}
        className="text-center"
      >
        <h1 className="text-4xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
          Welcome Employee{" "}
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
              <div className="text-blue-600">{card.icon}</div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="flex flex-col md:flex-row gap-4 mt-6">
        {/* Weekly Tasks */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={4}
          className="w-full md:w-1/2 p-4 rounded-2xl shadow-md bg-white flex flex-col items-center"
        >
          <h2 className="font-bold text-lg mb-2">My Weekly Tasks</h2>
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

        {/* Weekly TimeLogs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={5}
          className="w-full md:w-1/2 p-4 rounded-2xl shadow-md bg-white flex flex-col items-center"
        >
          <h2 className="font-bold text-lg mb-2">My Weekly TimeLogs</h2>
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

      {/* Active Tasks */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={6}
        className="p-6 rounded-2xl shadow-md bg-white mt-6"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2">
          <TasksIcon className="w-6 h-6 text-blue-600" strokeWidth={2} />
          My Active Tasks
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
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myTasks.filter((t) => t.status !== "completed").length > 0 ? (
                myTasks
                  .filter((t) => t.status !== "completed")
                  .map((task, index) => (
                    <tr
                      key={task._id}
                      className={`transition hover:bg-blue-50 ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {task.title}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {typeof task.project === "string"
                          ? task.project
                          : task.project?.name}
                      </td>
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
                    colSpan={3}
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

export default EmployeeDashboard;
