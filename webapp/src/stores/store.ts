import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authCtrl, AuthState } from "./controllers/auth-ctrl";
import { appCtrl } from "./controllers/app-ctrl";
import {
  persistStore,
  persistReducer,
  PersistConfig,
  createMigrate,
  MigrationManifest,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const migrations: MigrationManifest = {
  1: () => {
    return undefined;
  },
  1.1: () => {
    return undefined;
  },
  2: (state) => {
    return state;
  },
};

const persistConfig: PersistConfig<AuthState> = {
  key: "freedman-app",
  version: 2,
  storage,
  migrate: createMigrate(migrations, { debug: false }),
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
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  reducer: rootReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
