"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllComments,
  deleteComment,
  updateComment,
  clearCommentError,
  clearCommentSuccess,
} from "../../Reducers/CommentReducers";
import type { Comment } from "../../Reducers/CommentReducers";
import { Loader2, Trash2, Edit2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const AdminComments: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { comments, loading, error, success } = useSelector(
    (state: RootState) => state.comments
  );

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  // Fetch all comments
  useEffect(() => {
    dispatch(getAllComments());
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCommentError());
    }
  }, [error, dispatch]);

  // Handle success
  useEffect(() => {
    if (success) {
      setEditingCommentId(null);
      setEditContent("");
      dispatch(clearCommentSuccess());
    }
  }, [success, dispatch]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setActionLoading(id);
    const result = await dispatch(deleteComment(id));
    setActionLoading(null);

    if (deleteComment.fulfilled.match(result)) {
      toast.success("Comment deleted successfully");
    } else {
      toast.error(result.payload || "Failed to delete comment");
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setActionLoading(id);
    const result = await dispatch(updateComment({ id, content: editContent }));
    setActionLoading(null);

    if (updateComment.fulfilled.match(result)) {
      toast.success("Comment updated successfully");
    } else {
      toast.error(result.payload || "Failed to update comment");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-700">Admin Comments</h1>

      {comments.length === 0 ? (
        <div className="text-gray-500 italic mt-10">No comments found.</div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
            <thead className="bg-blue-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Comment
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  User
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Created At
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {comments.map((comment) => (
                  <motion.tr
                    key={comment._id}
                    className="border-b hover:bg-gray-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="py-3 px-4 text-gray-700">
                      {editingCommentId === comment._id ? (
                        <input
                          type="text"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring focus:ring-blue-200"
                        />
                      ) : (
                        comment.content
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {comment.user?.name || "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 flex justify-center gap-2">
                      {editingCommentId === comment._id ? (
                        <>
                          <ActionButton
                            loading={actionLoading === comment._id}
                            onClick={() => handleSaveEdit(comment._id)}
                            color="green"
                            icon={<Check size={16} />}
                            text="Save"
                          />
                          <ActionButton
                            loading={false}
                            onClick={handleCancelEdit}
                            color="red-light"
                            icon={<X size={16} />}
                            text="Cancel"
                          />
                        </>
                      ) : (
                        <>
                          <ActionButton
                            loading={false}
                            onClick={() => handleEdit(comment)}
                            color="yellow"
                            icon={<Edit2 size={16} />}
                            text="Edit"
                          />
                          <ActionButton
                            loading={actionLoading === comment._id}
                            onClick={() => handleDelete(comment._id)}
                            color="red"
                            icon={<Trash2 size={16} />}
                            text="Delete"
                          />
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminComments;

// ----------------------
// Action Button Component
// ----------------------
interface ActionButtonProps {
  loading: boolean;
  onClick: () => void;
  color: "green" | "yellow" | "red" | "red-light";
  icon: React.ReactNode;
  text: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  loading,
  onClick,
  color,
  icon,
  text,
}) => {
  const colors = {
    green: "bg-green-100 text-green-700 hover:bg-green-200",
    yellow: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    red: "bg-red-100 text-red-700 hover:bg-red-200",
    "red-light": "bg-red-50 text-red-500 hover:bg-red-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-3 py-1 rounded flex items-center gap-1 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed ${colors[color]}`}
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : icon}
      {text}
    </button>
  );
};
