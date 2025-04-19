import { createSlice } from "@reduxjs/toolkit";

export type SettingsState = unknown;

const initialState: SettingsState = {};

export const settingsCtrl = createSlice({
  name: "settings-ctrl",
  initialState,
  reducers: {},
});

// export const { } = settingsCtrl.actions;

export default settingsCtrl.reducer;
