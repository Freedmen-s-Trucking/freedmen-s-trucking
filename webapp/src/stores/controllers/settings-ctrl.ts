import { createSlice } from "@reduxjs/toolkit";

export type SettingsState = {
  deviceFingerprint: string | null;
  deviceFCMTokenLastUpdated: string | null;
};

const initialState: SettingsState = {
  deviceFingerprint: null,
  deviceFCMTokenLastUpdated: null,
};

export const settingsCtrl = createSlice({
  name: "settings-ctrl",
  initialState,
  reducers: {
    setDeviceFingerprint: (state, action) => {
      state.deviceFingerprint = action.payload;
    },
    setDeviceFCMTokenLastUpdated: (state, action) => {
      state.deviceFCMTokenLastUpdated = action.payload;
    },
  },
});

export const { setDeviceFingerprint, setDeviceFCMTokenLastUpdated } =
  settingsCtrl.actions;

export default settingsCtrl.reducer;
