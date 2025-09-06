import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

export interface Session {
  startedAt: string;
  endedAt?: string;
  duration?: number;
}

export interface TimeLog {
  _id: string;
  task: { _id: string; title: string };
  project: { _id: string; name: string };
  user: { _id: string; name: string; email: string };
  startTime: string;
  endTime?: string;
  isRunning: boolean;
  status: "running" | "paused" | "stopped";
  sessions: Session[];
  createdAt?: string;
  updatedAt?: string;
}

interface TimeLogState {
  logs: TimeLog[];
  currentLog: TimeLog | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: TimeLogState = {
  logs: [],
  currentLog: null,
  loading: false,
  error: null,
  success: false,
};

// Helper to set headers
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return { Authorization: `Bearer ${token}` };
};

// ================== Async Thunks ==================

// Start a log
export const startLog = createAsyncThunk<
  TimeLog,
  string,
  { rejectValue: string }
>("timelog/startLog", async (taskId, { rejectWithValue }) => {
  try {
    const res = await axios.post(
      `${API_URL}/timelogs/start/${taskId}`,
      {},
      { headers: getAuthHeaders() }
    );
    return res.data as TimeLog;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to start log"
    );
  }
});

// Pause a log
export const pauseLog = createAsyncThunk<
  TimeLog,
  string,
  { rejectValue: string }
>("timelog/pauseLog", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.put(
      `${API_URL}/timelogs/pause/${id}`,
      {},
      { headers: getAuthHeaders() }
    );
    return res.data as TimeLog;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to pause log"
    );
  }
});

// Resume a log
export const resumeLog = createAsyncThunk<
  TimeLog,
  string,
  { rejectValue: string }
>("timelog/resumeLog", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.put(
      `${API_URL}/timelogs/resume/${id}`,
      {},
      { headers: getAuthHeaders() }
    );
    return res.data as TimeLog;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to resume log"
    );
  }
});

// Stop a log
export const stopLog = createAsyncThunk<
  TimeLog,
  string,
  { rejectValue: string }
>("timelog/stopLog", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.put(
      `${API_URL}/timelogs/stop/${id}`,
      {},
      { headers: getAuthHeaders() }
    );
    return res.data as TimeLog;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to stop log"
    );
  }
});

// Get all logs (Admin)
export const getAllLogs = createAsyncThunk<
  TimeLog[],
  void,
  { rejectValue: string }
>("timelog/getAllLogs", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_URL}/timelogs/getAllLogs`, {
      headers: getAuthHeaders(),
    });
    return res.data as TimeLog[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch logs"
    );
  }
});

// Get logs by task
export const getLogsByTask = createAsyncThunk<
  TimeLog[],
  string,
  { rejectValue: string }
>("timelog/getLogsByTask", async (taskId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_URL}/timelogs/task/${taskId}`, {
      headers: getAuthHeaders(),
    });
    return res.data as TimeLog[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch task logs"
    );
  }
});

// Get a single log by ID
export const getLogById = createAsyncThunk<
  TimeLog,
  string,
  { rejectValue: string }
>("timelog/getLogById", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_URL}/timelogs/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data as TimeLog;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch log"
    );
  }
});

// Delete a log
export const deleteLog = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("timelog/deleteLog", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/timelogs/delete/${id}`, {
      headers: getAuthHeaders(),
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete log"
    );
  }
});

// ================== Slice ==================
const timeLogSlice = createSlice({
  name: "timelog",
  initialState,
  reducers: {
    clearTimeLogError: (state) => {
      state.error = null;
    },
    clearTimeLogSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start
      .addCase(startLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startLog.fulfilled, (state, action: PayloadAction<TimeLog>) => {
        state.loading = false;
        state.logs.push(action.payload);
        state.currentLog = action.payload;
        state.success = true;
      })
      .addCase(startLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Pause
      .addCase(pauseLog.fulfilled, (state, action: PayloadAction<TimeLog>) => {
        state.currentLog = action.payload;
        state.logs = state.logs.map((log) =>
          log._id === action.payload._id ? action.payload : log
        );
        state.success = true;
      })

      // Resume
      .addCase(resumeLog.fulfilled, (state, action: PayloadAction<TimeLog>) => {
        state.currentLog = action.payload;
        state.logs = state.logs.map((log) =>
          log._id === action.payload._id ? action.payload : log
        );
        state.success = true;
      })

      // Stop
      .addCase(stopLog.fulfilled, (state, action: PayloadAction<TimeLog>) => {
        state.currentLog = action.payload;
        state.logs = state.logs.map((log) =>
          log._id === action.payload._id ? action.payload : log
        );
        state.success = true;
      })

      // Get All
      .addCase(getAllLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllLogs.fulfilled,
        (state, action: PayloadAction<TimeLog[]>) => {
          state.loading = false;
          state.logs = action.payload;
        }
      )
      .addCase(getAllLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Get Logs By Task
      .addCase(getLogsByTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getLogsByTask.fulfilled,
        (state, action: PayloadAction<TimeLog[]>) => {
          state.loading = false;
          state.logs = action.payload;
        }
      )
      .addCase(getLogsByTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Get Log By ID
      .addCase(getLogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getLogById.fulfilled,
        (state, action: PayloadAction<TimeLog>) => {
          state.loading = false;
          state.currentLog = action.payload;
        }
      )
      .addCase(getLogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Delete
      .addCase(deleteLog.fulfilled, (state, action: PayloadAction<string>) => {
        state.logs = state.logs.filter((log) => log._id !== action.payload);
        if (state.currentLog?._id === action.payload) state.currentLog = null;
      });
  },
});

export const { clearTimeLogError, clearTimeLogSuccess } = timeLogSlice.actions;
export default timeLogSlice.reducer;
