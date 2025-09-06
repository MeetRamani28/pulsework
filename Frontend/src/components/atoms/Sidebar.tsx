import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, easeOut } from "framer-motion"; // ✅ imported easeOut correctly
import type { RootState } from "../../store/store";
import {
  DashboardIcon,
  ProjectIcon,
  TasksIcon,
  CommentIcon,
  ProfileIcon,
} from "../../Icons/SidebarIcon";
import { Calendar1 } from "../../Icons/Calender1";

type MenuItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[]; // optional: restrict menu to specific roles
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "", icon: DashboardIcon },
  { name: "Project", path: "project", icon: ProjectIcon },
  { name: "Tasks", path: "tasks", icon: TasksIcon },
  { name: "Users", path: "user", icon: ProfileIcon, roles: ["admin"] }, // only for admin
  { name: "Work Logs", path: "work-logs", icon: Calendar1 },
  { name: "Comments", path: "comments", icon: CommentIcon },
  { name: "Profile", path: "profile", icon: ProfileIcon }, // only for admin
];

// Sidebar slide-in animation
const sidebarVariants = {
  hidden: { x: -80, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: easeOut }, // ✅ fixed type error
  },
};

// Stagger menu items
const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentUser } = useSelector((state: RootState) => state.users);
  const role = currentUser?.roles?.toLowerCase() || "employee";

  return (
    <motion.div
      className="w-64 bg-white/95 backdrop-blur-md border-r border-blue-200/60 shadow-lg"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      <div className="flex flex-col h-full">
        {/* Logo / Profile Section */}
        <motion.div
          className="p-6 border-b border-blue-200/60 flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative w-12 h-12 mb-3 mr-3">
            {currentUser?.profilePicture ? (
              <motion.img
                src={`${import.meta.env.VITE_API_URL}/${
                  currentUser.profilePicture
                }`}
                alt={currentUser.name || "Profile"}
                className="w-full h-full rounded-full object-cover shadow-md border-2 border-white"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
              <motion.div
                className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-full flex items-center justify-center shadow-md"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-white text-lg font-bold">
                  {currentUser?.name?.[0]?.toUpperCase() || "A"}
                </span>
              </motion.div>
            )}
          </div>

          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
            PulseWork&apos;s
            <p className="text-sm text-blue-500 capitalize">
              {user?.roles?.toLowerCase()}
            </p>
          </h2>
        </motion.div>

        {/* Menu */}
        <motion.nav
          className="flex-1 p-4"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          <ul className="space-y-2">
            {menuItems
              .filter((item) => !item.roles || item.roles.includes(role)) // ✅ role-based filtering
              .map((item) => {
                const Icon = item.icon;
                const fullPath = item.path
                  ? `/${role}/${item.path}`
                  : `/${role}`;

                const isActive =
                  location.pathname === fullPath ||
                  (item.path === "" && location.pathname === `/${role}/`);

                return (
                  <motion.li key={item.name} variants={itemVariants}>
                    <NavLink
                      to={fullPath}
                      end={item.path === ""}
                      className="relative flex items-center space-x-3 px-4 py-3 rounded-xl group"
                    >
                      {/* Active background highlight */}
                      {isActive && (
                        <motion.div
                          layoutId="active-bg"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-md"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}

                      {/* Icon */}
                      <Icon
                        className={`relative z-10 w-5 h-5 transition-transform ${
                          isActive
                            ? "text-blue-700 scale-110"
                            : "text-blue-400 group-hover:text-blue-600"
                        }`}
                      />

                      {/* Label */}
                      <span
                        className={`relative z-10 font-medium transition-colors ${
                          isActive
                            ? "text-blue-700 font-semibold"
                            : "text-blue-600"
                        }`}
                      >
                        {item.name}
                      </span>
                    </NavLink>
                  </motion.li>
                );
              })}
          </ul>
        </motion.nav>

        {/* Footer */}
        <motion.div
          className="p-4 border-t border-blue-200/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="text-xs text-blue-400 text-center">
            © 2025 PulseWork&apos;s
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
