import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import schoolsReducer from "./slices/schoolsSlice";
import parentsReducer from "./slices/parentsSlice";
import driversReducer from "./slices/driversSlice";
import vehiclesReducer from "./slices/vehiclesSlice";
import routesReducer from "./slices/routesSlice";
import routeAssignmentsReducer from "./slices/routeAssignmentsSlice";
import staffReducer from "./slices/staffSlice";
import roleReducer from "./slices/roleSlice";
import studentsReducer from "./slices/studentsSlice";
import profileReducer from "./slices/profileSlice";
import overviewReducer from "./slices/overviewSlice";
import tripsReducer from "./slices/tripsSlice";
import gradesReducer from "./slices/gradesSlice";
import preferencesReducer from "./slices/preferencesSlice";
import notificationsReducer from "./slices/notificationsSlice";

// Configure persistence for auth slice
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "token", "userId"], // Only persist these fields
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const rootReducer = {
  auth: persistedAuthReducer,
  schools: schoolsReducer,
  parents: parentsReducer,
  drivers: driversReducer,
  vehicles: vehiclesReducer,
  routes: routesReducer,
  routeAssignments: routeAssignmentsReducer,
  staff: staffReducer,
  roles: roleReducer,
  students: studentsReducer,
  profile: profileReducer,
  overview: overviewReducer,
  trips: tripsReducer,
  grades: gradesReducer,
  preferences: preferencesReducer,
  notifications: notificationsReducer,
};

// Create store with explicit configuration
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
      immutableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
