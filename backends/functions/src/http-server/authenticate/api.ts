import {
  ApiReqProcessIdentityVerificationWithAuthenticate,
  apiReqProcessIdentityVerificationWithAuthenticate,
  ApiResProcessIdentityVerificationWithAuthenticate,
  CollectionName,
  DriverEntity,
  type,
} from "@freedmen-s-trucking/types";
import {CollectionReference, getFirestore} from "firebase-admin/firestore";
import {Hono} from "hono";
import {ContentfulStatusCode} from "hono/utils/http-status";
import {isResponseError, isValidationError, up} from "up-fetch";
import {Variables} from "../../utils/types";

const router = new Hono<{Variables: Variables}>();

const isAuthenticateMockApi = process.env.FUNCTIONS_EMULATOR !== "true";

const upFetch = up(fetch, () => ({
  baseUrl: `https://api-v3.authenticating.com${isAuthenticateMockApi ? "/mock" : ""}`,
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...(isAuthenticateMockApi ? {} : {Authorization: `Bearer ${process.env.AUTHENTICATE_DOT_COM_TOKEN}`}),
  },
}));

const apiReqDocumentScan = type({
  userAccessCode: "string.uuid",
  idFront: "string.base64",
  idBack: "string.base64",
  country: "number.integer",
});

router.post("/identity/document/scan", async (c) => {
  const body = apiReqDocumentScan(await c.req.json());
  if (body instanceof type.errors) {
    return c.json({error: body.summary}, 400);
  }
  const res = await upFetch("/identity/document/scan", {
    body: {
      ...body,
      userAccessCode: isAuthenticateMockApi ? "2d91a19f-d07b-48f0-912f-886ed67009dd" : body.userAccessCode,
    },
    schema: type({
      success: "boolean",
      attempts: "number.integer",
    }),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({error: error.data, endpoint: error.request.url}, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({error: error.issues}, 400);
    } else {
      return c.json({error: "Failed to scan document", raw: error}, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

router.post("/identity/verify", async (c) => {
  const res = await upFetch("/identity/verify", {
    body: await c.req.raw.bytes(),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({error: error.data, endpoint: error.request.url}, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({error: error.issues}, 400);
    } else {
      return c.json({error: "Failed to verify identity", raw: error}, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

router.post("/identity/document/scan/status", async (c) => {
  const res = await upFetch("/identity/document/scan/status", {
    body: await c.req.raw.bytes(),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({error: error.data, endpoint: error.request.url}, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({error: error.issues}, 400);
    } else {
      return c.json({error: "Failed to get document scan status", raw: error}, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

router.post("/process-identity-verification", async (c) => {
  const reqBody = apiReqProcessIdentityVerificationWithAuthenticate(await c.req.json());
  if (reqBody instanceof type.errors) {
    return c.json({error: reqBody.summary}, 400);
  }

  const authUser = c.get("user");
  if (!authUser) {
    return c.json({error: "Unauthorized"}, 401);
  }

  const dbDriverRef = (
    getFirestore().collection(CollectionName.DRIVERS) as CollectionReference<DriverEntity, DriverEntity>
  ).doc(authUser.uid);
  const dbDriver = (await dbDriverRef.get()).data();
  if (!dbDriver) {
    return c.json({error: "Driver not found"}, 404);
  }

  if (!dbDriver.authenticateAccessCode) {
    const res = await upFetch("/user/create", {
      body: {
        ...reqBody.user,
        firstName: isAuthenticateMockApi ? "Jonathan" : reqBody.user.firstName,
        lastName: isAuthenticateMockApi ? "Doe" : reqBody.user.lastName,
      },
      schema: type({
        userAccessCode: "string",
      }),
    }).catch((error) => {
      console.error(error);
      if (isResponseError(error)) {
        return c.json({error: error.data, endpoint: error.request.url}, error.status as ContentfulStatusCode);
      } else if (isValidationError(error)) {
        return c.json({error: error.issues}, 400);
      } else {
        return c.json({error: "Failed to create user", raw: error}, 500);
      }
    });

    if (res instanceof Response) {
      return res;
    }

    dbDriver.authenticateAccessCode = res.userAccessCode;
    await dbDriverRef.update({
      authenticateAccessCode: res.userAccessCode,
    });
  } else {
    const res = await upFetch("/user/update", {
      method: "PUT",
      body: {
        ...reqBody.user,
        firstName: isAuthenticateMockApi ? "Jonathan" : reqBody.user.firstName,
        lastName: isAuthenticateMockApi ? "Doe" : reqBody.user.lastName,
        userAccessCode: dbDriver.authenticateAccessCode,
      } satisfies ApiReqProcessIdentityVerificationWithAuthenticate["user"] & {
        userAccessCode: string;
      },
      schema: apiReqProcessIdentityVerificationWithAuthenticate.get("user").partial().and({
        userAccessCode: "string?",
      }),
    }).catch((error) => {
      console.error(error);
      if (isResponseError(error)) {
        return c.json({error: error.data, endpoint: error.request.url}, error.status as ContentfulStatusCode);
      } else if (isValidationError(error)) {
        return c.json({error: error.issues}, 400);
      } else {
        return c.json({error: "Failed to update user", raw: error}, 500);
      }
    });

    if (res instanceof Response) {
      return res;
    }
  }

  // Update user consents
  const consentReqRes = await upFetch("/user/consent", {
    body: {
      userAccessCode: isAuthenticateMockApi ? "100385a1-4308-49db-889f-9a898fa88c21" : dbDriver.authenticateAccessCode,
      isBackgroundDisclosureAccepted:
        reqBody.consents.isBackgroundDisclosureAccepted ?? dbDriver.consents?.isBackgroundDisclosureAccepted ?? false,
      GLBPurposeAndDPPAPurpose:
        reqBody.consents.GLBPurposeAndDPPAPurpose ?? dbDriver.consents?.GLBPurposeAndDPPAPurpose ?? false,
      FCRAPurpose: reqBody.consents.FCRAPurpose ?? dbDriver.consents?.FCRAPurpose ?? false,
      fullName: `${reqBody.user.firstName.trim()} ${reqBody.user.lastName.trim()}`,
    },
    schema: type({
      success: "boolean",
    }),
  }).catch((error) => {
    console.error(error);
    if (isResponseError(error)) {
      if (error.status === 400 && error.data?.errorMessage === "Consent has already been recorded for this user.") {
        return {success: true};
      }
      return c.json({error: error.data, endpoint: error.request.url}, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({error: error.issues}, 400);
    } else {
      return c.json({error: "Failed to parse consents", raw: error}, 500);
    }
  });

  if (consentReqRes instanceof Response) {
    return consentReqRes;
  }

  if (consentReqRes.success) {
    dbDriver.consents = reqBody.consents;
    await dbDriverRef.update({
      consents: reqBody.consents,
    });
  } else {
    return c.json({error: "Failed to save consents", raw: consentReqRes}, 500);
  }

  if (!dbDriver.authenticateAccessCode || !dbDriver.consents) {
    return c.json({error: "Driver consents not found", raw: dbDriver}, 500);
  }

  const res = await upFetch("/user/jwt", {
    body: {
      userAccessCode: isAuthenticateMockApi ? "100385a1-4308-49db-889f-9a898fa88c21" : dbDriver.authenticateAccessCode,
      preferredWorkflowID: process.env.AUTHENTICATE_DOT_COM_MEDALLION_ID,
      ...(!!reqBody.medallion?.redirectURL && {
        redirectURL: reqBody.medallion.redirectURL,
      }),
    },
    schema: type({
      jwt: "string",
      token: "string",
    }),
  }).catch((error) => {
    console.error(error);
    if (isResponseError(error)) {
      return c.json(
        {
          error: error.data,
          hint: "Don't forget to pass a valid ssl url as redirectURL",
          endpoint: error.request.url,
        },
        error.status as ContentfulStatusCode,
      );
    } else if (isValidationError(error)) {
      return c.json({error: error.issues}, 400);
    } else {
      return c.json({error: "Failed to generate JWT", raw: error}, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }
  const resBody = {
    ...res,
    processVerificationUrl: `https://verify.authenticating.com/?token=${res.token}`,
    authenticateAccessCode: dbDriver.authenticateAccessCode,
  } satisfies ApiResProcessIdentityVerificationWithAuthenticate;
  return c.json(resBody, 200);
});

router.post("/user/create", async (c) => {
  const res = await upFetch("/user/create", {
    body: await c.req.raw.bytes(),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({error: error.data, endpoint: error.request.url}, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({error: error.issues}, 400);
    } else {
      return c.json({error: "Failed to create user", raw: error}, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

router.post("/user/consent", async (c) => {
  const res = await upFetch("/user/consent", {
    body: await c.req.raw.bytes(),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({error: error.data, endpoint: error.request.url}, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({error: error.issues}, 400);
    } else {
      return c.json({error: "Failed to save consents", raw: error}, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

const apiReqGenerateCriminalReport = type({
  userAccessCode: "string",
});
router.post("/user/generateCriminalReport", async (c) => {
  const body = apiReqGenerateCriminalReport(await c.req.json());
  if (body instanceof type.errors) {
    return c.json({error: body.summary}, 400);
  }
  const res = await upFetch("/user/generateCriminalReport", {
    body: JSON.stringify(body),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({error: error.data, endpoint: error.request.url}, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({error: error.issues}, 400);
    } else {
      return c.json({error: "Failed to generate criminal report", raw: error}, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

router.post("/user/getTestResult", async (c) => {
  const authUser = c.get("user");
  const dbDriverRef = (
    getFirestore().collection(CollectionName.DRIVERS) as CollectionReference<DriverEntity, DriverEntity>
  ).doc(authUser.uid);
  const dbDriver = (await dbDriverRef.get()).data();
  if (!dbDriver) {
    return c.json({error: "Driver not found"}, 404);
  }
  const res = await upFetch("/user/getTestResult", {
    body: {userAccessCode: dbDriver.authenticateAccessCode},
    schema: type({
      user: type("Record<string, unknown>"),
      contactProof: type("Record<string, unknown>"),
      photoProof: type("Record<string, unknown>"),
      identityProof: type("Record<string, unknown>"),
      backgroundCheck: type("Record<string, unknown>"),
      idVerification: type("Record<string, unknown>"),
      SSNVerification: type("Record<string, unknown>"),
      FEINVerification: type("Record<string, unknown>").array(),
      company: type("Record<string, unknown>"),
      scannedUser: type("Record<string, unknown>"),
      passportData: type("Record<string, unknown>"),
      verifyUI: {
        passport: type("Record<string, unknown>"),
        scannedUser: type("Record<string, unknown>"),
      },
      professionalLicense: type("unknown").array(),
      employment: type("unknown").array(),
      consent: type("Record<string, unknown>"),
      bankAccountOwnerMatchResult: type("Record<string, unknown>"),
      identityAttempts: type("Record<string, unknown>"),
    }).partial(),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({error: error.data, endpoint: error.request.url}, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({error: error.issues}, 400);
    } else {
      return c.json({error: "Failed to get test result", raw: error}, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

const apiReqCriminalReportSeven = type({
  userAccessCode: "string",
});
router.post("/identity/request/criminal/report/seven", async (c) => {
  const body = apiReqCriminalReportSeven(await c.req.json());
  if (body instanceof type.errors) {
    return c.json({error: body.summary}, 400);
  }
  const res = await upFetch("/identity/request/criminal/report/seven", {
    body: JSON.stringify(body),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({error: error.data, endpoint: error.request.url}, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({error: error.issues}, 400);
    } else {
      return c.json({error: "Failed to request criminal report", raw: error}, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

// const apiReqWatchlistGlobal = type({
//   userAccessCode: 'string',
// });
// router.post('/identity/watchlist/global', async (c) => {
//   const body = apiReqWatchlistGlobal(await c.req.json());
//   if (body instanceof type.errors) {
//     return c.json({ error: body.summary }, 400);
//   }
//   const res = await upFetch(`/identity/watchlist/global/${body.userAccessCode}`, {
//     headers,
//   });
//   return c.newResponse(
//     await res.body.bytes(),
//     res.statusCode as StatusCode,
//     Object.fromEntries(Object.entries(res.headers).filter(([_, value]) => value !== undefined)) as Record<
//       string,
//       string | string[]
//     >,
//   );
// });

export default router;
