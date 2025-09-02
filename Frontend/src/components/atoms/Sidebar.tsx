import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ClipboardList,
  Settings,
  ListTodo,
  BarChart2,
  FolderKanban,
} from "lucide-react";

const menuItems = [
  { name: "Project", path: "/project", icon: FolderKanban },
  { name: "Tasks", path: "/tasks", icon: ListTodo },
  { name: "Work Logs", path: "/work-logs", icon: ClipboardList },
  { name: "Performance", path: "/performance", icon: BarChart2 },
  { name: "Settings", path: "/settings", icon: Settings },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white/95 backdrop-blur-md border-r border-blue-200/60 shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo / Title */}
        <div className="p-6 border-b border-blue-200/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                AProjectO
              </h2>
              <p className="text-sm text-blue-500">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-md border border-blue-200"
                        : "text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-r-full" />
                    )}
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-blue-600"
                          : "text-blue-400 group-hover:text-blue-600"
                      }`}
                    />
                    <span className="font-medium">{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-200/60">
          <div className="text-xs text-blue-400 text-center">
            © 2025 AProjectO
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
