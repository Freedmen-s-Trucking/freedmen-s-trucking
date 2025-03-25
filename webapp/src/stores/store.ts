import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authCtrl } from "./controllers/auth-ctrl";
import { appCtrl } from "./controllers/app-ctrl";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// README: https://blog.logrocket.com/persist-state-redux-persist-redux-toolkit-react
const persistConfig = {
  key: "freedman-app",
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  authCtrl: persistReducer(persistConfig, authCtrl.reducer),
  appCtrl: appCtrl.reducer,
});

export const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  reducer: rootReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
