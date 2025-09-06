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
import { Bell, Users, BarChart, PlusCircle } from "../../Icons/DashboardIcons";
import { CommentIcon, ProjectIcon, TasksIcon } from "../../Icons/SidebarIcon";
import { useNavigate } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  subDays,
} from "date-fns";

// ✅ Import async thunks
import { getAllProjects } from "../../Reducers/ProjectReducers";
import { getAllTasks } from "../../Reducers/TaskReducers";
import { getAllUsers } from "../../Reducers/UserReducers";
import { getAllComments } from "../../Reducers/CommentReducers";
import { getCurrentUser } from "../../Reducers/UserReducers";

// Interfaces for chart data
interface TaskChartData {
  name: string;
  tasks: number;
}
interface UserGrowthData {
  name: string;
  users: number;
}
interface ProjectCompletionData {
  name: string;
  completed: number;
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6 },
  }),
};

const cardHover = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);
  const { projects, loading: projectLoading } = useSelector(
    (state: RootState) => state.projects
  );
  const { tasks, loading: taskLoading } = useSelector(
    (state: RootState) => state.tasks
  );
  const { users, loading: userLoading } = useSelector(
    (state: RootState) => state.users
  );
  const { comments, loading: commentLoading } = useSelector(
    (state: RootState) => state.comments
  );

  useEffect(() => {
    dispatch(getAllProjects());
    dispatch(getAllTasks());
    dispatch(getAllUsers());
    dispatch(getAllComments());
    dispatch(getCurrentUser());
  }, [dispatch]);

  const projectCount = projects?.length || 0;
  const taskCount = tasks?.length || 0;
  const userCount = users?.length || 0;
  const alertCount = comments?.length || 0;

  // Weekly Tasks (last 7 days)
  const weeklyTasksData: TaskChartData[] = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      return { name: format(date, "EEE"), date, tasks: 0 };
    });

    tasks.forEach((task) => {
      const taskDate = task.createdAt ? new Date(task.createdAt) : null;
      if (taskDate) {
        const dayObj = last7Days.find(
          (d) => format(d.date, "yyyy-MM-dd") === format(taskDate, "yyyy-MM-dd")
        );
        if (dayObj) dayObj.tasks += 1;
      }
    });

    return last7Days;
  }, [tasks]);

  // User Growth per week (all weeks)
  const userGrowthData: UserGrowthData[] = useMemo(() => {
    if (!users || users.length === 0) return [];

    // only users with a valid createdAt
    const validUsers = users.filter(
      (u): u is typeof u & { createdAt: string } => !!u.createdAt
    );

    if (validUsers.length === 0) return [];

    const dates = validUsers.map((u) => new Date(u.createdAt!));

    const start = startOfWeek(
      new Date(Math.min(...dates.map((d) => d.getTime())))
    );
    const end = endOfWeek(new Date(Math.max(...dates.map((d) => d.getTime()))));
    const weeks = eachWeekOfInterval({ start, end });

    return weeks.map((weekDate) => {
      const weekLabel = `W${format(weekDate, "w yyyy")}`;
      const usersCount = validUsers.filter(
        (u) =>
          format(new Date(u.createdAt!), "w yyyy") ===
          format(weekDate, "w yyyy")
      ).length;
      return { name: weekLabel, users: usersCount };
    });
  }, [users]);

  // Completed Projects per month
  const completedProjectsData: ProjectCompletionData[] = useMemo(() => {
    if (!projects || projects.length === 0) return [];

    // only projects with a valid createdAt
    const validProjects = projects.filter(
      (p): p is typeof p & { createdAt: string } => !!p.createdAt
    );

    if (validProjects.length === 0) return [];

    const dates = validProjects.map((p) => new Date(p.createdAt!));
    const start = startOfMonth(
      new Date(Math.min(...dates.map((d) => d.getTime())))
    );
    const end = endOfMonth(
      new Date(Math.max(...dates.map((d) => d.getTime())))
    );
    const months = eachMonthOfInterval({ start, end });

    return months.map((monthDate) => {
      const monthLabel = format(monthDate, "MMM yyyy");
      const completedCount = validProjects.filter(
        (p) =>
          p.status === "completed" &&
          format(new Date(p.createdAt!), "MMM yyyy") === monthLabel
      ).length;
      return { name: monthLabel, completed: completedCount };
    });
  }, [projects]);

  if (projectLoading || taskLoading || userLoading || commentLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-lg">
        Loading dashboard data...
      </div>
    );
  }

  const summaryCards = [
    { title: "Projects", value: projectCount, icon: <ProjectIcon /> },
    { title: "Tasks", value: taskCount, icon: <BarChart /> },
    { title: "Users", value: userCount, icon: <Users /> },
    { title: "Alerts", value: alertCount, icon: <Bell /> },
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
          Welcome to PulseWork&apos;s{" "}
          <span className="text-blue-700">{user?.name || "Admin"}</span>
        </h1>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Charts Section */}
      <div className="space-y-4 md:space-y-0">
        {/* Weekly Tasks */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={5}
          className="w-full p-4 mb-4 rounded-2xl shadow-md bg-white flex flex-col items-center"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart width={28} height={28} />
            <h2 className="font-bold text-lg">Weekly Tasks</h2>
          </div>
          {weeklyTasksData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyTasksData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5, stroke: "#2563eb", strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 italic mt-10">No Weekly Tasks Data</p>
          )}
        </motion.div>

        {/* User Growth & Completed Projects */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          {/* User Growth */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={6}
            className="w-full md:w-1/2 p-4 rounded-2xl shadow-md bg-white flex flex-col items-center"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users width={28} height={28} />
              <h2 className="font-bold text-lg">User Growth</h2>
            </div>
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5, stroke: "#10b981", strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 italic mt-10">No User Growth Data</p>
            )}
          </motion.div>

          {/* Completed Projects */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={7}
            className="w-full md:w-1/2 p-4 rounded-2xl shadow-md bg-white flex flex-col items-center"
          >
            <div className="flex items-center gap-2 mb-2">
              <ProjectIcon width={28} height={28} />
              <h2 className="font-bold text-lg">Completed Projects</h2>
            </div>
            {completedProjectsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
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
                    dot={{ r: 5, stroke: "#f59e0b", strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 mt-10">No Completed Projects</p>
            )}
          </motion.div>
        </div>
      </div>

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
                  Assigned To
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold uppercase tracking-wider">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.filter((t) => t.status === "in-progress").length > 0 ? (
                tasks
                  .filter((t) => t.status === "in-progress")
                  .slice(0, 5)
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
                        {task.assignedTo?.name || "Unassigned"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-white text-sm font-semibold bg-yellow-500">
                          In Progress
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No active tasks in progress
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={9}
        className="p-6 rounded-2xl shadow-md bg-white mt-6"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-blue-600" strokeWidth={2} />
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate("/admin/project")}
            className="flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-700 rounded-xl shadow-md hover:bg-blue-100 hover:scale-105 transition-transform duration-300"
          >
            <ProjectIcon width={22} height={22} stroke="#2563eb" />
            <span className="font-medium">Add Project</span>
          </button>

          <button
            onClick={() => navigate("/admin/tasks")}
            className="flex items-center gap-3 px-6 py-3 bg-green-50 text-green-700 rounded-xl shadow-md hover:bg-green-100 hover:scale-105 transition-transform duration-300"
          >
            <TasksIcon width={22} height={22} stroke="#16a34a" />
            <span className="font-medium">Add Task</span>
          </button>

          <button
            onClick={() => navigate("/admin/comments")}
            className="flex items-center gap-3 px-6 py-3 bg-yellow-50 text-yellow-700 rounded-xl shadow-md hover:bg-yellow-100 hover:scale-105 transition-transform duration-300"
          >
            <CommentIcon width={22} height={22} stroke="#f59e0b" />
            <span className="font-medium">Add Comment</span>
          </button>
        </div>
      </motion.div>

      {/* Latest Comments */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={11}
        className="p-6 rounded-2xl shadow-md bg-white flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <CommentIcon width={24} height={24} stroke="#2563eb" />
          </div>
          <h2 className="text-lg font-bold text-blue-700">Latest Comments</h2>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {comments && comments.length > 0 ? (
            comments
              .slice(-2)
              .reverse()
              .map((comment) => (
                <div
                  key={comment._id}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <p className="text-gray-800 text-sm">{comment.content}</p>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>By: {comment.user?.name || "Unknown"}</span>
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString()}{" "}
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-gray-500 italic">No comments available</p>
          )}
        </div>

        <button
          onClick={() => navigate("/admin/comments")}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 transition"
        >
          View All Comments
        </button>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
