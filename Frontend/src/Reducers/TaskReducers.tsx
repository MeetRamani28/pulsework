import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

// ================== Types ==================
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status?: "todo" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high";
  deadline?: string;
  project: string | { _id: string; name: string };
  assignedTo?: { _id: string; name: string };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: "todo" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high";
  deadline?: string;
  assignedTo?: string;
}

// ================== Async Thunks ==================

// ✅ Create Task
export const createTask = createAsyncThunk<
  Task,
  {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    deadline?: string;
    project: string;
    assignedTo?: string;
  },
  { rejectValue: string }
>("task/createTask", async (taskData, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.post(`${API_URL}/tasks/create`, taskData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.task as Task;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to create task"
    );
  }
});

// ✅ Get All Tasks (Admin/Manager only)
export const getAllTasks = createAsyncThunk<
  Task[],
  void,
  { rejectValue: string }
>("task/getAllTasks", async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`${API_URL}/tasks/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as Task[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch tasks"
    );
  }
});

// ✅ Get Tasks by Project
export const getTasksByProject = createAsyncThunk<
  Task[],
  string,
  { rejectValue: string }
>("task/getTasksByProject", async (projectId, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`${API_URL}/tasks/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as Task[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch tasks"
    );
  }
});

// ✅ Get Task by ID
export const getTaskById = createAsyncThunk<
  Task,
  string,
  { rejectValue: string }
>("task/getTaskById", async (id, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`${API_URL}/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as Task;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(error.response?.data?.message || "Task not found");
  }
});

// ✅ Update Task
export const updateTask = createAsyncThunk<
  Task,
  { id: string; updates: TaskUpdate },
  { rejectValue: string }
>("task/updateTask", async ({ id, updates }, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.put(`${API_URL}/tasks/update/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.updatedTask as Task;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to update task"
    );
  }
});

// ✅ Delete Task
export const deleteTask = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("task/deleteTask", async (id, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    await axios.delete(`${API_URL}/tasks/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete task"
    );
  }
});

// ================== Slice ==================
interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  lastCompletedTask?: Task;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  success: false,
  lastCompletedTask: undefined,
};

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    clearTaskSuccess: (state) => {
      state.success = false;
    },
    clearLastCompletedTask: (state) => {
      state.lastCompletedTask = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
        state.success = true;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // ✅ Get All Tasks (Admin/Manager only)
      .addCase(getAllTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(getAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Get Tasks by Project
      .addCase(getTasksByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasksByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(getTasksByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Get Task by ID
      .addCase(getTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.currentTask = updated;
        state.tasks = state.tasks.map((t) =>
          t._id === updated._id ? updated : t
        );
        state.success = true;

        // Manager notification: task newly completed
        if (updated.status === "completed") {
          state.lastCompletedTask = updated;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        if (state.currentTask?._id === action.payload) {
          state.currentTask = null;
        }
        state.success = true;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });
  },
});

export const { clearTaskError, clearTaskSuccess, clearLastCompletedTask } =
  taskSlice.actions;
export default taskSlice.reducer;
