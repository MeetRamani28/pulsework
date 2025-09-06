import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

// ================== Types ==================
export interface Comment {
  _id: string;
  content: string;
  task?: string;
  project?: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  viewed: boolean;
}

interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: CommentState = {
  comments: [],
  loading: false,
  error: null,
  success: false,
};

// ================== Async Thunks ==================

// ✅ Add comment to task
export const addCommentToTask = createAsyncThunk<
  Comment,
  { taskId: string; content: string },
  { rejectValue: string }
>(
  "comments/addCommentToTask",
  async ({ taskId, content }, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.post(
        `${API_URL}/comments/task/${taskId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data as Comment;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

// ✅ Get all comments (Admin/Manager → all, User → own)
export const getAllComments = createAsyncThunk<
  Comment[],
  void,
  { rejectValue: string }
>("comments/getAllComments", async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`${API_URL}/comments/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as Comment[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch comments"
    );
  }
});

// ✅ Add comment to project
export const addCommentToProject = createAsyncThunk<
  Comment,
  { projectId: string; content: string },
  { rejectValue: string }
>(
  "comments/addCommentToProject",
  async ({ projectId, content }, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.post(
        `${API_URL}/comments/project/${projectId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data as Comment;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

// ✅ Get comments for task
export const getCommentsForTask = createAsyncThunk<
  Comment[],
  string,
  { rejectValue: string }
>("comments/getCommentsForTask", async (taskId, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`${API_URL}/comments/task/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as Comment[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch task comments"
    );
  }
});

// ✅ Get comments for project
export const getCommentsForProject = createAsyncThunk<
  Comment[],
  string,
  { rejectValue: string }
>("comments/getCommentsForProject", async (projectId, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`${API_URL}/comments/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as Comment[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch project comments"
    );
  }
});

// ✅ Update comment
export const updateComment = createAsyncThunk<
  Comment,
  { id: string; content: string },
  { rejectValue: string }
>("comments/updateComment", async ({ id, content }, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.put(
      `${API_URL}/comments/update/${id}`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data as Comment;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to update comment"
    );
  }
});

// ✅ Delete comment
export const deleteComment = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("comments/deleteComment", async (id, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    await axios.delete(`${API_URL}/comments/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete comment"
    );
  }
});

export const markAllCommentsAsViewed = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("comments/markAllAsViewed", async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    await axios.put(`${API_URL}/comments/mark-viewed`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to mark as viewed"
    );
  }
});

// ================== Slice ==================
const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearCommentError: (state) => {
      state.error = null;
    },
    clearCommentSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Comment
      .addCase(addCommentToTask.fulfilled, (state, action) => {
        state.comments.unshift(action.payload); // newest on top
        state.success = true;
      })
      .addCase(addCommentToProject.fulfilled, (state, action) => {
        state.comments.unshift(action.payload);
        state.success = true;
      })

      // Get All Comments
      .addCase(getAllComments.fulfilled, (state, action) => {
        state.comments = action.payload;
      })

      // Get Comments
      .addCase(getCommentsForTask.fulfilled, (state, action) => {
        state.comments = action.payload;
      })
      .addCase(getCommentsForProject.fulfilled, (state, action) => {
        state.comments = action.payload;
      })

      // Update Comment
      .addCase(updateComment.fulfilled, (state, action) => {
        state.comments = state.comments.map((c) =>
          c._id === action.payload._id
            ? {
                ...c,
                content: action.payload.content,
                updatedAt: action.payload.updatedAt,
              }
            : c
        );
        state.success = true;
      })

      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter((c) => c._id !== action.payload);
        state.success = true;
      })

      // Mark All as Viewed
      .addCase(markAllCommentsAsViewed.fulfilled, (state) => {
        state.comments = state.comments.map((c) => ({ ...c, viewed: true }));
      })

      // Handle Errors + Loading
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (
          action
        ): action is
          | ReturnType<typeof addCommentToTask.rejected>
          | ReturnType<typeof addCommentToProject.rejected>
          | ReturnType<typeof getCommentsForTask.rejected>
          | ReturnType<typeof getCommentsForProject.rejected>
          | ReturnType<typeof updateComment.rejected>
          | ReturnType<typeof deleteComment.rejected> =>
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || "Something went wrong";
        }
      );
  },
});

export const { clearCommentError, clearCommentSuccess } = commentSlice.actions;
export default commentSlice.reducer;
