"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import type { RootState, AppDispatch } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../Reducers/AuthReducers";
import { getCurrentUser } from "../../Reducers/UserReducers";
import { clearLastCompletedProject } from "../../Reducers/ProjectReducers";
import { clearLastCompletedTask } from "../../Reducers/TaskReducers";

interface SearchItem {
  id: string;
  type: "task" | "project" | "user";
  name: string;
}

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentUser } = useSelector((state: RootState) => state.users);
  const { lastCompletedTask, tasks } = useSelector(
    (state: RootState) => state.tasks
  );
  const { lastCompletedProject, projects } = useSelector(
    (state: RootState) => state.projects
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [managerNotifications, setManagerNotifications] = useState<
    SearchItem[]
  >([]);
  const [employeeNotifications, setEmployeeNotifications] = useState<
    SearchItem[]
  >([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load current user
  useEffect(() => {
    if (!currentUser) dispatch(getCurrentUser());
  }, [dispatch, currentUser]);

  // ✅ Manager notifications for completed tasks/projects
  useEffect(() => {
    if (!currentUser || currentUser.roles?.toLowerCase() !== "manager") return;

    const newNotifications: SearchItem[] = [];

    if (lastCompletedTask) {
      newNotifications.push({
        id: lastCompletedTask._id,
        type: "task",
        name: lastCompletedTask.title,
      });
    }

    if (lastCompletedProject) {
      const isManager =
        typeof lastCompletedProject.manager === "string"
          ? lastCompletedProject.manager === currentUser._id
          : lastCompletedProject.manager?._id === currentUser._id;

      if (isManager) {
        newNotifications.push({
          id: lastCompletedProject._id,
          type: "project",
          name: lastCompletedProject.name,
        });
      }
    }

    if (newNotifications.length > 0) {
      setManagerNotifications((prev) => [...prev, ...newNotifications]);
      dispatch(clearLastCompletedTask());
      dispatch(clearLastCompletedProject());
    }
  }, [lastCompletedTask, lastCompletedProject, currentUser, dispatch]);

  // ✅ Employee notifications for assigned tasks/projects
  useEffect(() => {
    if (!currentUser) return;

    const readNotifications: string[] = JSON.parse(
      localStorage.getItem("readNotifications") || "[]"
    );

    const newTaskNotifications = tasks
      .filter((t) => {
        const assignedArray = Array.isArray(t.assignedTo) ? t.assignedTo : [];
        return (
          assignedArray.some((a) =>
            typeof a === "string"
              ? a === currentUser._id
              : a._id === currentUser._id
          ) && !readNotifications.includes(t._id)
        );
      })
      .map((t) => ({ id: t._id, type: "task" as const, name: t.title }));

    const newProjectNotifications = projects
      .filter((p) => {
        return (
          p.members?.some((m) =>
            typeof m === "string"
              ? m === currentUser._id
              : m._id === currentUser._id
          ) && !readNotifications.includes(p._id)
        );
      })
      .map((p) => ({ id: p._id, type: "project" as const, name: p.name }));

    if (newTaskNotifications.length || newProjectNotifications.length) {
      setEmployeeNotifications((prev) => {
        const combined = [
          ...prev,
          ...newTaskNotifications,
          ...newProjectNotifications,
        ];
        return combined.filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        );
      });
    }
  }, [tasks, projects, currentUser]);

  const role = currentUser?.roles?.toLowerCase() || "employee";
  // ✅ Searchable items
  const allItems: SearchItem[] = useMemo(() => {
    if (!currentUser) return [];

    let taskItems: SearchItem[] = [];
    let projectItems: SearchItem[] = [];
    let userItems: SearchItem[] = [];

    if (role === "admin") {
      // 🔹 Admin can see all
      taskItems = tasks.map((t) => ({
        id: t._id,
        type: "task" as const,
        name: t.title,
      }));

      projectItems = projects.map((p) => ({
        id: p._id,
        type: "project" as const,
        name: p.name,
      }));

      userItems = [
        ...projects
          .flatMap((p) =>
            p.members?.map((m: string | { _id: string; name: string }) =>
              typeof m === "string"
                ? null
                : { id: m._id, type: "user" as const, name: m.name }
            )
          )
          .filter(Boolean),
        { id: currentUser._id, type: "user" as const, name: currentUser.name },
      ] as SearchItem[];
    } else if (role === "manager") {
      // 🔹 Manager can see only projects where he is manager + tasks in those projects
      const myProjects = projects.filter((p) =>
        typeof p.manager === "string"
          ? p.manager === currentUser._id
          : p.manager?._id === currentUser._id
      );

      projectItems = myProjects.map((p) => ({
        id: p._id,
        type: "project" as const,
        name: p.name,
      }));

      const myProjectIds = myProjects.map((p) => p._id);

      taskItems = tasks
        .filter((t) =>
          typeof t.project === "string"
            ? myProjectIds.includes(t.project)
            : myProjectIds.includes(t.project?._id)
        )
        .map((t) => ({ id: t._id, type: "task" as const, name: t.title }));

      userItems = [
        { id: currentUser._id, type: "user" as const, name: currentUser.name },
      ];
    } else {
      // 🔹 Employee → projects where he is member + tasks assigned to him
      const myProjects = projects.filter((p) =>
        p.members?.some((m) =>
          typeof m === "string"
            ? m === currentUser._id
            : m._id === currentUser._id
        )
      );

      projectItems = myProjects.map((p) => ({
        id: p._id,
        type: "project" as const,
        name: p.name,
      }));

      const myTasks = tasks.filter((t) => {
        if (!t.assignedTo) return false;
        return typeof t.assignedTo === "string"
          ? t.assignedTo === currentUser._id
          : t.assignedTo?._id === currentUser._id;
      });

      taskItems = myTasks.map((t) => ({
        id: t._id,
        type: "task" as const,
        name: t.title,
      }));

      userItems = [
        { id: currentUser._id, type: "user" as const, name: currentUser.name },
      ];
    }

    // remove duplicates
    const unique = (arr: SearchItem[]) =>
      arr.filter(
        (v, i, a) =>
          a.findIndex((t) => t.id === v.id && t.type === v.type) === i
      );

    return [
      ...unique(taskItems),
      ...unique(projectItems),
      ...unique(userItems),
    ];
  }, [tasks, projects, currentUser, role]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return [];
    return allItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allItems]);

  const handleSelectItem = (item: SearchItem) => {
    setSearchQuery("");
    switch (item.type) {
      case "task":
        navigate(`/${role}/tasks`);
        break;
      case "project":
        navigate(`/${role}/project`);
        break;
      case "user":
        navigate(`/${role}/profile`);
        break;
    }
  };

  const handleNotificationClick = (item: SearchItem) => {
    if (role === "manager") {
      switch (item.type) {
        case "task":
          navigate(`/manager/tasks`);
          break;
        case "project":
          navigate(`/manager/project`);
          break;
      }
      setManagerNotifications((prev) => prev.filter((n) => n.id !== item.id));
    } else {
      switch (item.type) {
        case "task":
          navigate(`/${role}/tasks`);
          break;
        case "project":
          navigate(`/${role}/project`);
          break;
      }
      const readNotifications: string[] = JSON.parse(
        localStorage.getItem("readNotifications") || "[]"
      );
      if (!readNotifications.includes(item.id)) {
        localStorage.setItem(
          "readNotifications",
          JSON.stringify([...readNotifications, item.id])
        );
      }
      setEmployeeNotifications((prev) => prev.filter((n) => n.id !== item.id));
    }
    setShowNotifications(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      localStorage.removeItem("readNotifications");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const notifications =
    role === "manager" ? managerNotifications : employeeNotifications;

  return (
    <motion.header
      className="flex flex-col md:flex-row items-center justify-between bg-white border-b px-6 py-3 shadow-sm relative"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Search Bar */}
      <div className="w-full md:w-1/2 relative">
        <motion.div
          className="flex items-center w-full px-4 py-2 border rounded-lg shadow-sm bg-white focus-within:ring-2 focus-within:ring-blue-500"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Search className="h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by task, project, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-2 w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </motion.div>

        <AnimatePresence>
          {filteredItems.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredItems.map((item) => (
                <motion.li
                  key={item.id}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                  whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  onClick={() => handleSelectItem(item)}
                >
                  <span className="font-semibold">{item.name}</span>{" "}
                  <span className="text-gray-400 text-xs">({item.type})</span>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6 mt-3 md:mt-0">
        {/* Notifications */}
        <div className="relative">
          <Bell
            className="h-6 w-6 text-gray-600 hover:text-indigo-600 cursor-pointer"
            onClick={() => setShowNotifications((prev) => !prev)}
          />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {notifications.length}
            </span>
          )}

          <AnimatePresence>
            {showNotifications && notifications.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-60 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
              >
                {notifications.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                  >
                    {item.name} ({item.type})
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* User Info & Logout */}
        <motion.div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">
              {currentUser?.name || "Guest User"}
            </p>
            <p className="text-xs text-gray-500">
              {currentUser?.roles || "No role"}
            </p>
          </div>

          {currentUser?.profilePicture ? (
            <motion.img
              src={`${import.meta.env.VITE_API_URL}/${
                currentUser.profilePicture
              }`}
              alt={currentUser.name || "Profile"}
              className="h-10 w-10 rounded-full border border-gray-300 object-cover"
            />
          ) : (
            <motion.img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentUser?.name || "Guest"
              )}&background=6366f1&color=fff`}
              alt="User Avatar"
              className="h-10 w-10 rounded-full border border-gray-300"
            />
          )}

          <motion.button
            onClick={handleLogout}
            className="ml-2 flex items-center px-2 py-1 rounded text-red-600 hover:border-red-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="h-4 w-4 mr-1" />
          </motion.button>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
