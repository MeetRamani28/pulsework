import React from "react";
import { Bell, Search } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const Header: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <header className="flex items-center justify-between bg-white border-b px-6 py-3 shadow-sm">
      {/* Search Bar */}
      <div className="flex flex-1 max-w-xl items-center bg-gray-100 rounded-full px-4 py-2">
        <Search className="h-5 w-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search for anything..."
          className="ml-2 flex-1 bg-transparent outline-none text-sm text-gray-700"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6 ml-6">
        {/* Notification */}
        <button className="relative">
          <Bell className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">
              {user?.name || "Guest User"}
            </p>
            <p className="text-xs text-gray-500">{user?.roles || "No role"}</p>
          </div>
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              user?.name || "Guest"
            )}&background=6366f1&color=fff`}
            alt="User Avatar"
            className="h-10 w-10 rounded-full border border-gray-300"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
