import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Reducers/AuthReducers.tsx";
import projectReducer from "../Reducers/ProjectReducers.tsx";
import taskReducer from "../Reducers/TaskReducers.tsx";
import TimeLogReducer from "../Reducers/TimeLogsReducers.tsx";
import userReducer from "../Reducers/UserReducers.tsx";
import NotificationReducer from "../Reducers/NotificationReducers.tsx";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    projects: projectReducer,
    workLogs: TimeLogReducer,
    users: userReducer,
    notifications: NotificationReducer,
  },
});

// Inferred types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
