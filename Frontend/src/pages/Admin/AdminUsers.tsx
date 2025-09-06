"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllUsers,
  deleteUser,
  updateUser,
  clearUserError,
  clearUserSuccess,
} from "../../Reducers/UserReducers";
import type { User } from "../../Reducers/UserReducers";
import { Loader2, User as UserIcon, X } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PlusCircle } from "../../Icons/DashboardIcons";
import { CustomDropdown } from "../../components/atoms/CustomDropdown";
import { EditAnimatedSquare } from "../../Icons/EditAnimated";
import { Delete } from "../../Icons/Delete";

interface UserForm {
  name: string;
  email: string;
  roles: string;
  bio: string;
  phone: string;
  jobTitle: string;
  department: string;
  location: string;
  profilePicture?: File | null;
}

const AdminUsers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error, success } = useSelector(
    (state: RootState) => state.users
  );

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    roles: "employee",
    bio: "",
    phone: "",
    jobTitle: "",
    department: "",
    location: "",
    profilePicture: null,
  });

  // Fetch all users
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Handle success & error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearUserError());
    }
    if (success) {
      toast.success(
        editMode ? "User updated successfully" : "User created successfully"
      );
      dispatch(clearUserSuccess());
      setShowForm(false);
      setEditMode(false);
      setCurrentId(null);
      setForm({
        name: "",
        email: "",
        roles: "employee",
        bio: "",
        phone: "",
        jobTitle: "",
        department: "",
        location: "",
        profilePicture: null,
      });
    }
  }, [error, success, dispatch, editMode]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim())
      return toast.error("Name & Email are required!");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as string | Blob);
      }
    });

    if (editMode && currentId) {
      dispatch(updateUser({ id: currentId, formData }));
    } else {
      toast.error("Create user not implemented in this snippet");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(id));
      toast.success("User deleted successfully 🗑️");
    }
  };

  const handleEdit = (user: User) => {
    setCurrentId(user._id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      roles: user.roles || "employee",
      bio: user.bio || "",
      phone: user.phone || "",
      jobTitle: user.jobTitle || "",
      department: user.department || "",
      location: user.location || "",
      profilePicture: null,
    });
    setEditMode(true);
    setShowForm(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Users</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditMode(false);
            setForm({
              name: "",
              email: "",
              roles: "employee",
              bio: "",
              phone: "",
              jobTitle: "",
              department: "",
              location: "",
              profilePicture: null,
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg shadow transition hover:bg-blue-100"
        >
          <PlusCircle stroke="#2563eb" height={20} /> Add User
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      )}

      {/* User Cards */}
      {!loading && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u) => {
            const profileImageUrl = u.profilePicture
              ? `${import.meta.env.VITE_API_URL}/${u.profilePicture}`
              : null;

            console.log("Profile Image URL:", profileImageUrl);

            return (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md p-6 border hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon size={32} className="text-gray-400" />
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-blue-600">
                      {u.name}
                    </h2>
                    <span className="text-gray-500 text-sm">{u.roles}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {u.email}
                </p>

                {/* Meta */}
                <div className="flex flex-col gap-1 text-sm text-gray-500 mb-4">
                  {u.jobTitle && <div>Job Title: {u.jobTitle}</div>}
                  {u.department && <div>Department: {u.department}</div>}
                  {u.location && <div>Location: {u.location}</div>}
                  {u.phone && <div>Phone: {u.phone}</div>}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleEdit(u)}
                    className="text-blue-600 hover:underline"
                  >
                    <EditAnimatedSquare />
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="text-red-600 hover:underline"
                  >
                    <Delete height={20} stroke="red" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <div className="text-center text-gray-500 italic py-10">
          No users found.
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
                {editMode ? "Edit User" : "Create User"}
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
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Role Dropdown */}
              <div>
                <label className="block text-sm text-gray-600">Role</label>
                <CustomDropdown
                  options={[
                    { label: "Admin", value: "admin" },
                    { label: "Manager", value: "manager" },
                    { label: "Employee", value: "employee" },
                  ]}
                  selected={form.roles}
                  onSelect={(value) => setForm({ ...form, roles: value })}
                  placeholder="Select Role"
                />
              </div>

              {/* Optional fields */}
              <div>
                <label className="block text-sm text-gray-600">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={form.jobTitle}
                    onChange={(e) =>
                      setForm({ ...form, jobTitle: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">
                    Department
                  </label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Profile Picture */}
              <div>
                <label className="block text-sm text-gray-600">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      profilePicture: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full mt-1"
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

export default AdminUsers;
