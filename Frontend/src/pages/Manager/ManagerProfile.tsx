"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../store/store";
import {
  getCurrentUser,
  updateMyProfile,
  clearUserError,
  clearUserSuccess,
} from "../../Reducers/UserReducers";
import { toast } from "sonner";
import { Shield, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EditAnimatedSquare } from "../../Icons/EditAnimated";
import { motion } from "framer-motion";
import { SaveIcon } from "../../Icons/SaveIcon";
import { CancelIcon } from "../../Icons/CancelIcon";

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const inputVariant = {
  hover: { scale: 1.01, transition: { duration: 0.2 } },
  focus: { scale: 1.02, transition: { duration: 0.2 } },
};
const panelVariant = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export interface User {
  _id: string;
  name: string;
  email: string;
  roles: string;
  bio?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ManagerProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, loading, error, success } = useSelector(
    (state: RootState) => state.users
  );
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<Partial<User>>({});
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setUserData(currentUser);
      const url = currentUser.profilePicture
        ? `${import.meta.env.VITE_API_URL}/${currentUser.profilePicture}`
        : null;
      setProfilePreview(url);
    }
  }, [currentUser]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearUserError());
    }
    if (success) {
      toast.success("Profile updated successfully");
      dispatch(clearUserSuccess());
      setIsEditing(false);
    }
  }, [error, success, dispatch]);

  const handleChange = (field: keyof User, value: string) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleProfileChange = (file: File | null) => {
    if (!file) return;
    setProfileFile(file);
    const reader = new FileReader();
    reader.onload = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!userData.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && key !== "profilePicture")
        formData.append(key, value as string);
    });
    if (profileFile) formData.append("profilePicture", profileFile);
    dispatch(updateMyProfile(formData));
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "manager":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[80vh]">
        <div className="text-blue-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-full">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial="hidden"
          animate="visible"
          variants={cardVariant}
        >
          <motion.div
            className="bg-white p-6 rounded-lg shadow space-y-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-800">
                Profile Information
              </h2>
              {!isEditing && (
                <button
                  className="text-blue-700 px-3 py-1 rounded"
                  onClick={() => setIsEditing(true)}
                >
                  <EditAnimatedSquare />
                </button>
              )}
            </div>

            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-2xl font-bold text-white">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt={userData.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={32} className="text-gray-400" />
                )}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-800">
                  {userData.name}
                </div>
                <div className="text-gray-600">{userData.email}</div>
                <div className="flex space-x-2 mt-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(
                      userData.roles
                    )}`}
                  >
                    <Shield className="inline w-3 h-3 mr-1" />
                    {userData.roles}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Full Name", field: "name", type: "text" },
                {
                  label: "Email",
                  field: "email",
                  type: "email",
                  disabled: true,
                },
                { label: "Phone", field: "phone", type: "text" },
                { label: "Job Title", field: "jobTitle", type: "text" },
                { label: "Department", field: "department", type: "text" },
                { label: "Location", field: "location", type: "text" },
              ].map(({ label, field, type, disabled }) => (
                <motion.div
                  key={field}
                  variants={inputVariant}
                  whileHover="hover"
                  whileFocus="focus"
                >
                  <label className="block text-gray-700 font-medium mb-1">
                    {label}
                  </label>
                  {isEditing ? (
                    <input
                      type={type}
                      value={userData[field as keyof User] ?? ""}
                      onChange={(e) =>
                        handleChange(field as keyof User, e.target.value)
                      }
                      disabled={disabled}
                      className="w-full border border-blue-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      {userData[field as keyof User]}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Bio field */}
              <motion.div
                className="col-span-1 md:col-span-2"
                variants={inputVariant}
                whileHover="hover"
                whileFocus="focus"
              >
                <label className="block text-gray-700 font-medium mb-1">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={userData.bio ?? ""}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    className="w-full border border-blue-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={4}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap">
                    {userData.bio || "-"}
                  </div>
                )}
              </motion.div>

              {isEditing && (
                <motion.div
                  className="col-span-1 md:col-span-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-gray-700 font-medium mb-1">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleProfileChange(e.target.files?.[0] ?? null)
                    }
                    className="w-full"
                  />
                </motion.div>
              )}
            </div>

            {isEditing && (
              <motion.div
                className="flex space-x-3 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  onClick={handleSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center h-10 bg-blue-600 pr-4 text-white rounded"
                >
                  <SaveIcon height={20} stroke="white" /> Save
                </motion.button>
                <motion.button
                  onClick={() => setIsEditing(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center h-10 bg-red-600 pr-4 text-white rounded"
                >
                  <CancelIcon height={20} stroke="white" /> Cancel
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={panelVariant}
        >
          <motion.div
            className="bg-white p-4 rounded-lg shadow space-y-2"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-blue-800">
              Quick Actions
            </h2>
            <button
              onClick={() => navigate("/manager/tasks")}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View My Tasks
            </button>
            <button
              onClick={() => navigate("/manager/work-logs")}
              className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
            >
              Time Logs
            </button>
          </motion.div>

          <motion.div
            className="bg-white p-4 rounded-lg shadow space-y-2"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-blue-800">System Info</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <div>
                <span className="font-medium">Platform:</span> PulseWork
              </div>
              <div>
                <span className="font-medium">Version:</span> v1.0.0
              </div>
              <div>
                <span className="font-medium">User ID:</span>{" "}
                {userData._id?.slice(0, 8)}...
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ManagerProfile;
