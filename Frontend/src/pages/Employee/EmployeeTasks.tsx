"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllTasks,
  updateTask,
  clearTaskError,
  clearTaskSuccess,
} from "../../Reducers/TaskReducers";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ProjectIcon } from "../../Icons/SidebarIcon";
import { Calendar1 } from "../../Icons/Calender1";
import toast from "react-hot-toast";
import { CustomDropdown } from "../../components/atoms/CustomDropdown";

// Explicit status type
type TaskStatus = "todo" | "in-progress" | "completed";

const EmployeeTasks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error, success } = useSelector(
    (state: RootState) => state.tasks
  );
  const { projects } = useSelector((state: RootState) => state.projects);
  const { currentUser } = useSelector((state: RootState) => state.users);

  // Load tasks initially
  useEffect(() => {
    dispatch(getAllTasks());
  }, [dispatch]);

  // Success / Error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTaskError());
    }
    if (success) {
      toast.success("Task status updated ✅");
      dispatch(clearTaskSuccess());
    }
  }, [error, success, dispatch]);

  // Filter only employee's tasks
  const myTasks = tasks.filter((t) => t.assignedTo?._id === currentUser?._id);

  // Update task status
  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    dispatch(updateTask({ id, updates: { status: newStatus } })).then(() => {
      dispatch(getAllTasks());
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">My Tasks</h1>

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      )}

      {!loading && myTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTasks.map((t) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-6 border hover:shadow-lg transition"
            >
              <h2 className="text-lg font-bold text-blue-600 mb-2">
                {t.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {t.description || "No description"}
              </p>

              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <ProjectIcon height={15} width={15} stroke="blue" />
                  <span>
                    {typeof t.project === "string"
                      ? projects.find((p) => p._id === t.project)?.name
                      : t.project?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-0.5">
                  <Calendar1 height={15} width={15} stroke="blue" />
                  <span>
                    {t.deadline
                      ? new Date(t.deadline).toLocaleDateString()
                      : "No deadline"}
                  </span>
                </div>
              </div>

              {/* Status Updater */}
              <div className="mt-4">
                <label className="block text-sm text-gray-600 mb-1">
                  Status
                </label>
                <CustomDropdown
                  options={[
                    { label: "Todo", value: "todo" },
                    { label: "In Progress", value: "in-progress" },
                    { label: "Completed", value: "completed" },
                  ]}
                  selected={t.status || ""}
                  onSelect={(value) =>
                    handleStatusChange(t._id, value as TaskStatus)
                  }
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && myTasks.length === 0 && (
        <div className="text-center text-gray-500 italic py-10">
          You have no tasks assigned 🎉
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
