import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@features/auth";
import { authApi } from "@features/auth/api/authApi";
import { dashboardApi } from "@features/dashboard/api/dashBoardApi";
import { studentApi } from "@features/students/api/studentApi";

const apis = [authApi, dashboardApi, studentApi]
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
})