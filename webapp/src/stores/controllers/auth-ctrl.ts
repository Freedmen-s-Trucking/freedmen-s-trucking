import {
  CustomerEntity,
  DriverEntity,
  UserEntity,
} from "@freedman-trucking/entities";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { UserInfo, UserMetadata } from "firebase/auth";

export interface AppUser {
  readonly info: UserEntity;
  readonly driverInfo?: DriverEntity;
  readonly customerInfo?: CustomerEntity;
  readonly meta: UserMetadata;
  readonly providerData: UserInfo[];
  readonly isAnonymous: boolean;
  readonly isEmailVerified: boolean;
}

export interface AuthState {
  user: AppUser | null;
}

const initialState: AuthState = {
  user: null,
};

export const authCtrl = createSlice({
  name: "auth-ctrl",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AppUser>) => {
      state.user = action.payload;
    },
    getUser: (state) => {
      return {
        ...state,
      };
    },
  },
});

export const { setUser, getUser } = authCtrl.actions;

export default authCtrl.reducer;
