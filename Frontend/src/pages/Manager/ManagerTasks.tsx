"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllTasks,
  deleteTask,
  createTask,
  updateTask,
  clearTaskError,
  clearTaskSuccess,
} from "../../Reducers/TaskReducers";
import { getAllProjects } from "../../Reducers/ProjectReducers";
import { getAllUsers } from "../../Reducers/UserReducers";
import type { Task } from "../../Reducers/TaskReducers";
import { Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { PlusCircle, Users } from "../../Icons/DashboardIcons";
import { Delete } from "../../Icons/Delete";
import { EditAnimatedSquare } from "../../Icons/EditAnimated";
import { CustomDropdown } from "../../components/atoms/CustomDropdown";
import toast from "react-hot-toast";
import { Calendar1 } from "../../Icons/Calender1";
import { ProjectIcon } from "../../Icons/SidebarIcon";

interface TaskForm {
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  deadline: string;
  project: string;
  assignedTo: string;
}

const ManagerTasks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error, success } = useSelector(
    (state: RootState) => state.tasks
  );
  const { projects } = useSelector((state: RootState) => state.projects);
  const { users, currentUser } = useSelector((state: RootState) => state.users);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskForm>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    deadline: "",
    project: "",
    assignedTo: "",
  });

  // Fetch tasks, users, projects initially
  useEffect(() => {
    dispatch(getAllTasks());
    dispatch(getAllProjects());
    dispatch(getAllUsers());
  }, [dispatch]);

  // Handle success & error feedback
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTaskError());
    }

    if (success) {
      toast.success(
        editMode ? "Task updated successfully" : "Task created successfully"
      );
      dispatch(clearTaskSuccess());
      setShowForm(false);
      setEditMode(false);
      setForm({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        deadline: "",
        project: "",
        assignedTo: "",
      });
    }
  }, [error, success, dispatch, editMode]);

  // Create or update task
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Task title is required!");
    if (!form.project) return toast.error("A task must belong to a project!");
    if (!form.assignedTo)
      return toast.error("Please assign the task to a user!");

    if (editMode && currentId) {
      dispatch(updateTask({ id: currentId, updates: form })).then(() => {
        dispatch(getAllTasks());
      });
    } else {
      dispatch(createTask(form)).then(() => {
        dispatch(getAllTasks());
      });
    }
  };

  // Delete task
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTask(id)).then(() => {
        dispatch(getAllTasks());
        toast.success("Task deleted successfully 🗑️");
      });
    }
  };

  // Edit task
  const handleEdit = (task: Task) => {
    setCurrentId(task._id);

    const projectId =
      typeof task.project === "string" ? task.project : task.project?._id || "";
    const assignedId = task.assignedTo?._id || "";

    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
      project: projectId,
      assignedTo: assignedId,
    });

    setEditMode(true);
    setShowForm(true);
  };

  // Filter tasks relevant to manager
  const managerTasks = tasks.filter((t) => {
    const project = projects.find(
      (p) =>
        p._id === (typeof t.project === "string" ? t.project : t.project?._id)
    );

    if (!project) return false;

    // Normalize managerId whether it's a string or object
    const managerId =
      typeof project.manager === "string"
        ? project.manager
        : project.manager?._id;

    return managerId === currentUser?._id;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Manager Tasks</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditMode(false);
            setForm({
              title: "",
              description: "",
              status: "todo",
              priority: "medium",
              deadline: "",
              project: "",
              assignedTo: "",
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg shadow transition hover:bg-blue-100"
        >
          <PlusCircle stroke="#2563eb" height={20} /> Add Task
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      )}

      {!loading && managerTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managerTasks.map((t) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-6 border hover:shadow-lg transition"
            >
              <h2 className="text-lg font-bold text-blue-600 mb-2">
                {t.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {t.description || "No description provided."}
              </p>

              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <ProjectIcon
                    height={15}
                    width={15}
                    stroke="blue"
                    className="text-gray-400"
                  />
                  <span>
                    {typeof t.project === "string"
                      ? projects.find((p) => p._id === t.project)?.name ||
                        "Unknown Project"
                      : t.project?.name || "Unknown Project"}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-0.5">
                  <Users
                    height={15}
                    width={15}
                    stroke="blue"
                    className="text-gray-400"
                  />
                  <span>{t.assignedTo?.name || "Unassigned"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar1
                    height={15}
                    width={15}
                    stroke="blue"
                    className="text-gray-400"
                  />
                  <span>
                    {t.deadline
                      ? new Date(t.deadline).toLocaleDateString()
                      : "No deadline"}
                  </span>
                </div>
              </div>

              <div className="flex mt-2 gap-3">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    t.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : t.status === "in-progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t.status}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    t.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : t.priority === "medium"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t.priority}
                </span>
              </div>

              <div className="flex items-center justify-end mt-4 ml-4">
                <button onClick={() => handleEdit(t)}>
                  <EditAnimatedSquare />
                </button>
                <button onClick={() => handleDelete(t._id)}>
                  <Delete height={20} stroke="red" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && managerTasks.length === 0 && (
        <div className="text-center text-gray-500 italic py-10">
          No tasks assigned to you or your projects.
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            {/* Modal Header & Close button */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
            <div className="px-6 pt-6 pb-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editMode ? "Edit Task" : "Create Task"}
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm text-gray-600">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-600">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm text-gray-600">Project</label>
                <CustomDropdown
                  options={projects.map((p) => ({
                    label: p.name,
                    value: p._id,
                  }))}
                  selected={form.project}
                  onSelect={(value) => setForm({ ...form, project: value })}
                  placeholder="Select Project"
                />
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm text-gray-600">
                  Assigned To
                </label>
                <CustomDropdown
                  options={users.map((u) => ({ label: u.name, value: u._id }))}
                  selected={form.assignedTo}
                  onSelect={(value) => setForm({ ...form, assignedTo: value })}
                  placeholder="Select User"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm text-gray-600">Status</label>
                <CustomDropdown
                  options={[
                    { label: "Todo", value: "todo" },
                    { label: "In Progress", value: "in-progress" },
                    { label: "Completed", value: "completed" },
                  ]}
                  selected={form.status}
                  onSelect={(value) =>
                    setForm({
                      ...form,
                      status: value as "todo" | "in-progress" | "completed",
                    })
                  }
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm text-gray-600">Priority</label>
                <CustomDropdown
                  options={[
                    { label: "Low", value: "low" },
                    { label: "Medium", value: "medium" },
                    { label: "High", value: "high" },
                  ]}
                  selected={form.priority}
                  onSelect={(value) =>
                    setForm({
                      ...form,
                      priority: value as "low" | "medium" | "high",
                    })
                  }
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm text-gray-600">Deadline</label>
                <input
                  type="date"
                  value={form.deadline || ""}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : editMode ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManagerTasks;
