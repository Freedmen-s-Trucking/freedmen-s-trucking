import { AccountType } from "@freedmen-s-trucking/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface InfoBubbleState {
  type: "success" | "failure" | "warning" | "info";
  title: string;
  message: string;
}

export interface AppState {
  requestedAuthAction: {
    type: "login" | "signup" | null;
    targetAccount?: AccountType;
    redirectToDashboard?: boolean;
    strict?: boolean;
  } | null;
  infoBubble: InfoBubbleState | null;
}

const initialState: AppState = {
  requestedAuthAction: null,
  infoBubble: null,
};

export const appCtrl = createSlice({
  name: "app-ctrl",
  initialState,
  reducers: {
    showInfoBubble: (state, action: PayloadAction<InfoBubbleState | null>) => {
      state.infoBubble = action.payload;
    },
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

export const {
  setRequestedAuthAction,
  getRequestedAuthAction,
  showInfoBubble,
} = appCtrl.actions;

export default appCtrl.reducer;
