import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../atoms/Sidebar";
import Header from "../atoms/Header";
import type { RootState, AppDispatch } from "../../store/store";
import { getCurrentUser } from "../../Reducers/AuthReducers";

const DashboardLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading, token } = useSelector(
    (state: RootState) => state.auth
  );

  // ✅ Fetch user if token exists but user is null
  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [token, user, dispatch]);

  // ✅ Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null; // wait until user is fetched
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 custom-scrollbar overflow-auto p-6">
          <Outlet /> {/* ✅ Nested pages (Dashboard, Project, Tasks, etc.) render here */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
