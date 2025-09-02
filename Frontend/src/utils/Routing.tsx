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

const PrivateRoute: React.FC<{
  children: React.ReactNode;
  roles?: string[];
}> = ({ children, roles }) => {
  const { user, token } = useSelector((state: RootState) => state.auth);

  if (!token) return <Navigate to="/" replace />;
  if (!user) return <div>Loading...</div>; // wait until user is fetched

  if (roles && !roles.includes(user.roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const Routing: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);

  // ✅ Fetch user if token exists but no user
  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [token, user, dispatch]);

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<AuthPage />} />

      {/* Role-Based Dashboards wrapped in DashboardLayout */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute roles={["admin"]}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/manager/*"
        element={
          <PrivateRoute roles={["manager"]}>
            <DashboardLayout>
              <ManagerDashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/employee/*"
        element={
          <PrivateRoute roles={["employee"]}>
            <DashboardLayout>
              <EmployeeDashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* Unauthorized */}
      <Route path="/unauthorized" element={<div>🚫 Unauthorized Access</div>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Routing;
