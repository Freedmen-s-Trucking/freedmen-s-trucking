import { configureStore } from "@reduxjs/toolkit";
import { authCtrl } from "./controllers/auth-ctrl";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// README: https://blog.logrocket.com/persist-state-redux-persist-redux-toolkit-react
const persistConfig = {
  key: "freedman-app",
  version: 1,
  storage,
};

export const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),

  reducer: {
    authCtrl: persistReducer(persistConfig, authCtrl.reducer),
  },
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
