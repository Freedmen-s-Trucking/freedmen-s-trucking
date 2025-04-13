import {
  combineReducers,
  configureStore,
  isPlain,
  SerializableStateInvariantMiddlewareOptions,
} from "@reduxjs/toolkit";
import { authCtrl } from "./controllers/auth-ctrl";
import { appCtrl } from "./controllers/app-ctrl";
import { settingsCtrl, SettingsState } from "./controllers/settings-ctrl";
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
import { Timestamp } from "firebase/firestore";

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

const persistConfig: PersistConfig<SettingsState> = {
  key: "freedman-settings",
  version: 2,
  storage,
  migrate: createMigrate(migrations, { debug: false }),
};

const rootReducer = combineReducers({
  appCtrl: appCtrl.reducer,
  authCtrl: authCtrl.reducer,
  settingsCtrl: persistReducer(persistConfig, settingsCtrl.reducer),
});

export const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: <SerializableStateInvariantMiddlewareOptions>{
        isSerializable: (value: unknown) => {
          if (value instanceof Timestamp) {
            return true;
          }
          return isPlain(value);
        },
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          // "auth-ctrl/setUser",
        ],

        ignoredActionPaths: ["payload.getIDToken"],
        ignoredPaths: ["authCtrl.user.getIDToken"],
      },
    }),
  reducer: rootReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
