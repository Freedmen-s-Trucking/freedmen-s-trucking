import {up} from "up-fetch";
import {type} from "@freedmen-s-trucking/types";

export const isAuthenticateMockApi = process.env.FUNCTIONS_EMULATOR === "true";

export const upFetch = up(fetch, () => ({
  baseUrl: `https://api-v3.authenticating.com${isAuthenticateMockApi ? "/mock" : ""}`,
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...(isAuthenticateMockApi ? {} : {Authorization: `Bearer ${process.env.AUTHENTICATE_DOT_COM_TOKEN}`}),
  },
}));

export const verifyIdentity = (userAccessCode: string) =>
  upFetch("/identity/verify", {
    body: {
      userAccessCode: isAuthenticateMockApi ? "100385a1-4308-49db-889f-9a898fa88c21" : userAccessCode,
    },
    schema: type({
      success: "boolean",
      IDVScore: type({
        ssn: "number | null",
        name: "number | null",
        dob: "number | null",
      }).partial(),
    }).partial(),
  });

export const sevenYearCriminalReport = (userAccessCode: string) =>
  upFetch("/identity/request/criminal/report/seven", {
    body: {userAccessCode: isAuthenticateMockApi ? "100385a1-4308-49db-889f-9a898fa88c21" : userAccessCode},
    schema: type({
      result: {
        Candidates: {
          Message: "'No Criminal Records Found' | string",
        },
      },
      error: "boolean",
      message: "'Request Results' | string",
      status: "'COMPLETE' | string",
    }),
  });
