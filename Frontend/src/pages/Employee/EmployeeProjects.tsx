"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { getAllProjects } from "../../Reducers/ProjectReducers";
import { getAllUsers } from "../../Reducers/UserReducers";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Calendar1 } from "../../Icons/Calender1";
import { Users } from "../../Icons/DashboardIcons";

const EmployeeProjects: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading } = useSelector(
    (state: RootState) => state.projects
  );
  const { currentUser } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(getAllProjects());
    dispatch(getAllUsers());
  }, [dispatch]);

  const myProjects = projects.filter((p) => {
    const isManager =
      typeof p.manager === "string"
        ? p.manager === currentUser?._id
        : p.manager?._id === currentUser?._id;

    const isMember = p.members?.some((m) =>
      typeof m === "string"
        ? m === currentUser?._id
        : m._id === currentUser?._id
    );

    return isManager || isMember;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">My Projects</h1>

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      )}

      {!loading && currentUser && (
        <>
          {myProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map((p) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-md p-6 border hover:shadow-lg transition"
                >
                  <h2 className="text-lg font-bold text-blue-600 mb-2">
                    {p.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {p.description || "No description provided."}
                  </p>

                  <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2 ml-0.5">
                      <Users
                        height={15}
                        width={15}
                        stroke="blue"
                        className="text-gray-400"
                      />
                      <span>
                        {typeof p.manager === "string"
                          ? p.manager
                          : p.manager?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar1
                        height={15}
                        width={15}
                        stroke="blue"
                        className="text-gray-400"
                      />
                      <span>
                        {p.deadline
                          ? new Date(p.deadline).toLocaleDateString()
                          : "No deadline"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-2 ${
                      p.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : p.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.status || "N/A"}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 italic py-10">
              No projects assigned to you.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeProjects;
