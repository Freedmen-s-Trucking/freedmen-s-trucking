import {
  AdminEntity,
  DriverEntity,
  UserEntity,
} from "@freedmen-s-trucking/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { UserInfo, UserMetadata } from "firebase/auth";

export class AppUser {
  readonly info: Readonly<UserEntity>;
  readonly driverInfo?: Readonly<DriverEntity>;
  readonly adminInfo?: Readonly<AdminEntity>;
  readonly meta: Readonly<UserMetadata>;
  readonly providerData: Readonly<UserInfo[]>;
  readonly isAnonymous: boolean;
  readonly isEmailVerified: boolean;

  constructor({
    info,
    driverInfo,
    adminInfo,
    meta,
    providerData,
    isAnonymous,
    isEmailVerified,
  }: {
    info: Readonly<UserEntity>;
    driverInfo?: Readonly<DriverEntity>;
    adminInfo?: Readonly<AdminEntity>;
    meta: Readonly<UserMetadata>;
    providerData: Readonly<UserInfo[]>;
    isAnonymous: boolean;
    isEmailVerified: boolean;
  }) {
    this.info = info;
    this.driverInfo = driverInfo;
    this.adminInfo = adminInfo;
    this.meta = meta;
    this.providerData = providerData;
    this.isAnonymous = isAnonymous;
    this.isEmailVerified = isEmailVerified;
  }
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
    updateDriverInfo: (state, action: PayloadAction<Partial<DriverEntity>>) => {
      if (state.user) {
        state.user.driverInfo = {
          ...(state.user.driverInfo || ({} as DriverEntity)),
          ...action.payload,
        };
      }
    },
    setUser: (state, action: PayloadAction<AppUser>) => {
      state.user = {
        info: action.payload.info,
        driverInfo: action.payload.driverInfo,
        adminInfo: action.payload.adminInfo,
        meta: action.payload.meta,
        providerData: [...action.payload.providerData],
        isAnonymous: action.payload.isAnonymous,
        isEmailVerified: action.payload.isEmailVerified,
      };
    },
  },
});

export const { setUser: setUser, updateDriverInfo: updateDriverInfo } =
  authCtrl.actions;

export default authCtrl.reducer;
