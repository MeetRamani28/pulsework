"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllProjects,
  deleteProject,
  createProject,
  updateProject,
  clearProjectError,
  clearProjectSuccess,
} from "../../Reducers/ProjectReducers";
import type { Project } from "../../Reducers/ProjectReducers";
import { Loader2, Calendar, User, X } from "lucide-react";
import { motion } from "framer-motion";
import { PlusCircle } from "../../Icons/DashboardIcons";
import { getAllUsers } from "../../Reducers/UserReducers";
import { Delete } from "../../Icons/Delete";
import { EditAnimatedSquare } from "../../Icons/EditAnimated";
import toast from "react-hot-toast";
import { CustomDropdown } from "../../components/atoms/CustomDropdown";

interface ProjectForm {
  name: string;
  description: string;
  manager: string;
  members: string[];
  status: string;
  deadline: string;
}

const AdminProject: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading, error, success } = useSelector(
    (state: RootState) => state.projects
  );
  const { users } = useSelector((state: RootState) => state.users);

  const availableManagers = users.filter((u) => u.roles === "manager");
  const availableEmployees = users.filter((u) => u.roles === "employee");

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState<ProjectForm>({
    name: "",
    description: "",
    manager: "",
    members: [],
    status: "in-progress",
    deadline: "",
  });

  // Fetch projects & users initially
  useEffect(() => {
    dispatch(getAllProjects());
    dispatch(getAllUsers());
  }, [dispatch]);

  // Handle success & error feedback
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProjectError());
    }

    if (success && !deleteId) {
      toast.success(
        editMode
          ? "Project updated successfully"
          : "Project created successfully"
      );
      dispatch(clearProjectSuccess());
      setShowForm(false);
      setEditMode(false);
      setForm({
        name: "",
        description: "",
        manager: "",
        members: [],
        status: "in-progress",
        deadline: "",
      });
    }
    if (success && deleteId) {
      toast.success("Project deleted successfully 🗑️");
      dispatch(clearProjectSuccess());
      setDeleteId(null);
    }
  }, [error, success, dispatch, editMode, deleteId]);

  // Create or update project
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Project name is required!");
    if (!form.manager) return toast.error("A project must have one manager!");

    try {
      if (editMode && currentId) {
        await dispatch(
          updateProject({ id: currentId, updates: form })
        ).unwrap();
      } else {
        await dispatch(createProject(form)).unwrap();
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Something went wrong!");
    }
  };

  // Delete project
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      dispatch(deleteProject(id));
      setDeleteId(id);
    }
  };

  // Edit project
  const handleEdit = (project: Project) => {
    setCurrentId(project._id);
    setForm({
      name: project.name,
      description: project.description || "",
      manager:
        typeof project.manager === "string"
          ? project.manager
          : project.manager?._id || "",
      members:
        project.members?.map((m) => (typeof m === "string" ? m : m._id)) || [],
      status: project.status || "in-progress",
      deadline: project.deadline ? project.deadline.split("T")[0] : "",
    });
    setEditMode(true);
    setShowForm(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Projects</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditMode(false);
            setForm({
              name: "",
              description: "",
              manager: "",
              members: [],
              status: "in-progress",
              deadline: "",
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg shadow transition hover:bg-blue-100"
        >
          <PlusCircle stroke="#2563eb" height={20} /> Add Project
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      )}

      {/* Project Cards */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p: Project) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-6 border hover:shadow-lg transition"
            >
              <h2 className="text-lg font-bold text-blue-600 mb-2">{p.name}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {p.description || "No description provided."}
              </p>

              {/* Meta */}
              <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span>
                    {typeof p.manager === "string"
                      ? users.find((u) => u._id === p.manager)?.name ||
                        "Unassigned"
                      : p.manager?.name || "Unassigned"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>
                    {p.deadline
                      ? new Date(p.deadline).toLocaleDateString()
                      : "No deadline"}
                  </span>
                </div>
              </div>

              {/* Status */}
              <span
                className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-4 ${
                  p.status === "completed"
                    ? "bg-blue-100 text-blue-700"
                    : p.status === "in-progress"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {p.status || "N/A"}
              </span>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button onClick={() => handleEdit(p)}>
                  <EditAnimatedSquare />
                </button>
                <button onClick={() => handleDelete(p._id)}>
                  <Delete height={20} stroke="red" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="text-center text-gray-500 italic py-10">
          No projects found.
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 
                       overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            {/* Close */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editMode ? "Edit Project" : "Create Project"}
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-600">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full mt-1 px-3 py-2 border rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Manager Dropdown */}
              <div>
                <label className="block text-sm text-gray-600">Manager</label>
                <CustomDropdown
                  options={availableManagers.map((m) => ({
                    label: m.name,
                    value: m._id,
                  }))}
                  selected={form.manager}
                  onSelect={(value) => setForm({ ...form, manager: value })}
                  placeholder="Select Manager"
                />
              </div>

              {/* Members Multi-Select */}
              <div>
                <label className="block text-sm text-gray-600">Members</label>
                <CustomDropdown
                  options={availableEmployees.map((e) => ({
                    label: e.name,
                    value: e._id,
                  }))}
                  selected={form.members}
                  onSelectMulti={(values: string[]) =>
                    setForm({ ...form, members: values })
                  }
                  multi
                  placeholder={
                    form.members.length > 0
                      ? `${form.members.length} selected`
                      : "Select Members"
                  }
                />
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block text-sm text-gray-600">Status</label>
                <CustomDropdown
                  options={[
                    { label: "Planned", value: "planned" },
                    { label: "In Progress", value: "in-progress" },
                    { label: "Completed", value: "completed" },
                  ]}
                  selected={form.status}
                  onSelect={(value) => setForm({ ...form, status: value })}
                  placeholder="Select Status"
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
                  className="w-full mt-1 px-3 py-2 border rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            {/* Actions */}
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

export default AdminProject;
