import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

// ================== Types ==================
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

interface UserState {
  users: User[];
  currentUser: User | null;
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  selectedUser: null,
  loading: false,
  error: null,
  success: false,
};

// ================== Async Thunks ==================

// ✅ Get logged-in user profile
export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("users/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as User;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch profile"
    );
  }
});

// ✅ Update my profile
export const updateMyProfile = createAsyncThunk<
  User,
  FormData,
  { rejectValue: string }
>("users/updateMyProfile", async (formData, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.put(`${API_URL}/users/me/update`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data as User;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to update profile"
    );
  }
});

// ✅ Get all users (admin only)
export const getAllUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>("users/getAllUsers", async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`${API_URL}/users/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as User[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch users"
    );
  }
});

// ✅ Get user by ID (admin/manager)
export const getUserById = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>("users/getUserById", async (id, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`${API_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as User;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(error.response?.data?.message || "User not found");
  }
});

// ✅ Update user (admin/manager)
export const updateUser = createAsyncThunk<
  User,
  { id: string; formData: FormData },
  { rejectValue: string }
>("users/updateUser", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.put(`${API_URL}/users/update/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data as User;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to update user"
    );
  }
});

// ✅ Delete user (admin only)
export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("users/deleteUser", async (id, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    await axios.delete(`${API_URL}/users/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete user"
    );
  }
});

// ================== Slice ==================
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Update my profile
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.success = true;
      })

      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Get user by ID
      .addCase(getUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })

      // Update user (admin/manager)
      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? action.payload : u
        );
        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = action.payload;
        }
        state.success = true;
      })

      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
        if (state.selectedUser?._id === action.payload) {
          state.selectedUser = null;
        }
        state.success = true;
      });
  },
});

export const { clearUserError, clearUserSuccess } = userSlice.actions;
export default userSlice.reducer;
