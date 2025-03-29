import { AccountType } from "@freedman-trucking/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AppState {
  requestedAuthAction: {
    type: "login" | "signup" | null;
    targetAccount?: AccountType;
  } | null;
}

const initialState: AppState = {
  requestedAuthAction: null,
};

export const appCtrl = createSlice({
  name: "app-ctrl",
  initialState,
  reducers: {
    setRequestedAuthAction: (
      state,
      action: PayloadAction<AppState["requestedAuthAction"]>,
    ) => {
      state.requestedAuthAction = action.payload;
    },
    getRequestedAuthAction: (state) => {
      return {
        ...state,
      };
    },
  },
});

export const { setRequestedAuthAction, getRequestedAuthAction } =
  appCtrl.actions;

export default appCtrl.reducer;
