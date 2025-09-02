import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Reducers/AuthReducers.tsx";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Inferred types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
