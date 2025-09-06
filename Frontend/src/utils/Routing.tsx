import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { getCurrentUser } from "../Reducers/AuthReducers";

import AuthPage from "../pages/AuthPage";
import NotFound from "../pages/NotFound";
import DashboardLayout from "../components/molecules/DashboardLayout";

// Role-based dashboards
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManagerDashboard from "../pages/Manager/ManagerDashboard";
import EmployeeDashboard from "../pages/Employee/EmployeeDashboard";
import AdminProject from "../pages/Admin/AdminProject";
import AdminTask from "../pages/Admin/AdminTask";
import AdminWorkLogs from "../pages/Admin/AdminWorkLogs";
import AdminProfile from "../pages/Admin/AdminProfile";
import AdminComments from "../pages/Admin/AdminPComments";
import AdminUsers from "../pages/Admin/AdminUsers";
import ManagerProjects from "../pages/Manager/MangerProjects";
import ManagerTasks from "../pages/Manager/ManagerTasks";
import ManagerProfile from "../pages/Manager/ManagerProfile";
import ManagerTimeLogs from "../pages/Manager/ManagerTimeLogs";

const PrivateRoute: React.FC<{
  children: React.ReactNode;
  roles?: string[];
}> = ({ children, roles }) => {
  const { user, token, loading } = useSelector(
    (state: RootState) => state.auth
  );

  // No token → redirect to login
  if (!token) return <Navigate to="/" replace />;

  // Still fetching user → show loading
  if (loading) return <div>Loading user...</div>;

  // Token exists but no user → invalid token, redirect
  if (!user) return <Navigate to="/" replace />;

  // Role check
  if (roles) {
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
    const hasAccess = roles.some((role) => userRoles.includes(role));
    if (!hasAccess) return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const Routing: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);

  // Fetch user if token exists but no user
  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [token, user, dispatch]);

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<AuthPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute roles={["admin"]}>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="project" element={<AdminProject />} />
        <Route path="tasks" element={<AdminTask />} />
        <Route path="user" element={<AdminUsers />} />
        <Route path="work-logs" element={<AdminWorkLogs />} />
        <Route path="comments" element={<AdminComments />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Manager Routes */}
      <Route
        path="/manager/*"
        element={
          <PrivateRoute roles={["manager"]}>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<ManagerDashboard />} />
        <Route path="project" element={<ManagerProjects />} />
        <Route path="tasks" element={<ManagerTasks />} />
        <Route path="work-logs" element={<ManagerTimeLogs />} />
        <Route path="profile" element={<ManagerProfile />} />
      </Route>

      {/* Employee Routes */}
      <Route
        path="/employee/*"
        element={
          <PrivateRoute roles={["employee"]}>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<EmployeeDashboard />} />
      </Route>

      {/* Unauthorized */}
      <Route path="/unauthorized" element={<div>🚫 Unauthorized Access</div>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Routing;
