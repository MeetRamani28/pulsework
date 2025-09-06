import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

// ================== Types ==================
export interface Project {
  _id: string;
  name: string;
  description?: string;
  manager: string | { _id: string; name: string; email: string };
  members: Array<string | { _id: string; name: string; email: string }>;
  status?: string;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  manager?: string;
  members?: string[];
  status?: string;
  deadline?: string;
}

// ================== Async Thunks ==================

// ✅ Create Project
export const createProject = createAsyncThunk<
  Project,
  {
    name: string;
    description?: string;
    manager?: string;
    members?: string[];
    deadline?: string;
  },
  { rejectValue: string }
>("project/createProject", async (projectData, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.post(`${API_URL}/projects/create`, projectData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.project as Project;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to create project"
    );
  }
});

// ✅ Get All Projects (Admin/Manager only)
export const getAllProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>("project/getAllProjects", async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`${API_URL}/projects/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.projects as Project[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch projects"
    );
  }
});

// ✅ Get My Projects
export const getMyProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>("project/getMyProjects", async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`${API_URL}/projects/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.projects as Project[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch my projects"
    );
  }
});

// ✅ Get Project by ID
export const getProjectById = createAsyncThunk<
  Project,
  string,
  { rejectValue: string }
>("project/getProjectById", async (id, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`${API_URL}/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.project as Project;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Project not found"
    );
  }
});

// ✅ Update Project
export const updateProject = createAsyncThunk<
  Project,
  { id: string; updates: ProjectUpdate },
  { rejectValue: string }
>("project/updateProject", async ({ id, updates }, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.put(`${API_URL}/projects/update/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.project as Project;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to update project"
    );
  }
});

// ✅ Delete Project
export const deleteProject = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("project/deleteProject", async (id, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    await axios.delete(`${API_URL}/projects/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete project"
    );
  }
});

// ================== Slice ==================

interface ProjectState {
  projects: Project[];
  myProjects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ProjectState = {
  projects: [],
  myProjects: [],
  currentProject: null,
  loading: false,
  error: null,
  success: false,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    clearProjectSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
        state.myProjects.push(action.payload);
        state.success = true;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Get All Projects
      .addCase(getAllProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Get My Projects
      .addCase(getMyProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.myProjects = action.payload;
      })
      .addCase(getMyProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Get Project By ID
      .addCase(getProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
        state.projects = state.projects.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
        state.myProjects = state.myProjects.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
        state.success = true;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter((p) => p._id !== action.payload);
        state.myProjects = state.myProjects.filter(
          (p) => p._id !== action.payload
        );
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }
        state.success = true;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });
  },
});

export const { clearProjectError, clearProjectSuccess } = projectSlice.actions;
export default projectSlice.reducer;
