import React, { useState, useMemo, useEffect } from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import type { RootState, AppDispatch } from "../../store/store";
import { useNavigate } from "react-router-dom";
import {
  getAllComments,
  markAllCommentsAsViewed,
} from "../../Reducers/CommentReducers";
import { logoutUser } from "../../Reducers/AuthReducers";

interface SearchItem {
  id: string;
  type: "task" | "project" | "user";
  name: string;
}

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Use the users slice for currentUser to get profilePicture
  const { currentUser, users } = useSelector((state: RootState) => state.users);
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { comments } = useSelector((state: RootState) => state.comments);

  const [searchQuery, setSearchQuery] = useState("");
  const [unseenCount, setUnseenCount] = useState(0);

  // Load latest comments
  useEffect(() => {
    dispatch(getAllComments());
  }, [dispatch]);

  // Track unseen comments
  useEffect(() => {
    if (comments && comments.length > 0) {
      const newComments = comments.filter((c) => !c.viewed);
      setUnseenCount(newComments.length);
    } else {
      setUnseenCount(0);
    }
  }, [comments]);

  // Searchable items
  const allItems: SearchItem[] = useMemo(() => {
    const taskItems: SearchItem[] = tasks.map((t) => ({
      id: t._id,
      type: "task",
      name: t.title,
    }));
    const projectItems: SearchItem[] = projects.map((p) => ({
      id: p._id,
      type: "project",
      name: p.name,
    }));
    const userItems: SearchItem[] = users.map((u) => ({
      id: u._id,
      type: "user",
      name: u.name,
    }));
    return [...taskItems, ...projectItems, ...userItems];
  }, [tasks, projects, users]);

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
        navigate(`/admin/tasks`);
        break;
      case "project":
        navigate(`/admin/project`);
        break;
      case "user":
        navigate(`/admin/user`);
        break;
    }
  };

  const handleNotificationClick = async () => {
    navigate("/admin/comments");
    setUnseenCount(0);
    try {
      await dispatch(markAllCommentsAsViewed()).unwrap();
    } catch (err) {
      console.error("Failed to mark comments as viewed", err);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap(); // backend clears cookie + session
      navigate("/"); // redirect to login
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

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
        <motion.button
          className="relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNotificationClick}
        >
          <Bell className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
          {unseenCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unseenCount}
            </span>
          )}
        </motion.button>

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

          {/* Profile Picture */}
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

          {/* Logout Button */}
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
