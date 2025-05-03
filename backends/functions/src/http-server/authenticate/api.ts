import {
  ApiReqProcessIdentityVerificationWithAuthenticate,
  apiReqProcessIdentityVerificationWithAuthenticate,
  ApiResProcessIdentityVerificationWithAuthenticate,
  CollectionName,
  DriverEntity,
  type,
} from '@freedmen-s-trucking/types';
import { CollectionReference, getFirestore } from 'firebase-admin/firestore';
import { Hono } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { isResponseError, isValidationError, up } from 'up-fetch';
import { Variables } from '../../utils/types';

const router = new Hono<{ Variables: Variables }>();

const isAuthenticateMockApi = process.env.FUNCTIONS_EMULATOR !== 'true';

const upFetch = up(fetch, () => ({
  baseUrl: `https://api-v3.authenticating.com${isAuthenticateMockApi ? '/mock' : ''}`,
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(isAuthenticateMockApi ? {} : { Authorization: `Bearer ${process.env.AUTHENTICATE_DOT_COM_TOKEN}` }),
  },
}));

const apiReqDocumentScan = type({
  userAccessCode: 'string.uuid',
  idFront: 'string.base64',
  idBack: 'string.base64',
  country: 'number.integer',
});

router.post('/identity/document/scan', async (c) => {
  const body = apiReqDocumentScan(await c.req.json());
  if (body instanceof type.errors) {
    return c.json({ error: body.summary }, 400);
  }
  const res = await upFetch('/identity/document/scan', {
    body: {
      ...body,
      userAccessCode: isAuthenticateMockApi ? '2d91a19f-d07b-48f0-912f-886ed67009dd' : body.userAccessCode,
    },
    schema: type({
      success: 'boolean',
      attempts: 'number.integer',
    }),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({ error: error.data, endpoint: error.request.url }, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({ error: error.issues }, 400);
    } else {
      return c.json({ error: 'Failed to scan document', raw: error }, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

router.post('/identity/verify', async (c) => {
  const res = await upFetch('/identity/verify', {
    body: await c.req.raw.bytes(),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({ error: error.data, endpoint: error.request.url }, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({ error: error.issues }, 400);
    } else {
      return c.json({ error: 'Failed to verify identity', raw: error }, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

router.post('/identity/document/scan/status', async (c) => {
  const res = await upFetch('/identity/document/scan/status', {
    body: await c.req.raw.bytes(),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({ error: error.data, endpoint: error.request.url }, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({ error: error.issues }, 400);
    } else {
      return c.json({ error: 'Failed to get document scan status', raw: error }, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

router.post('/process-identity-verification', async (c) => {
  const reqBody = apiReqProcessIdentityVerificationWithAuthenticate(await c.req.json());
  if (reqBody instanceof type.errors) {
    return c.json({ error: reqBody.summary }, 400);
  }

  const authUser = c.get('user');
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const dbDriverRef = (
    getFirestore().collection(CollectionName.DRIVERS) as CollectionReference<DriverEntity, DriverEntity>
  ).doc(authUser.uid);
  const dbDriver = (await dbDriverRef.get()).data();
  if (!dbDriver) {
    return c.json({ error: 'Driver not found' }, 404);
  }

  if (!dbDriver.authenticateAccessCode) {
    const res = await upFetch('/user/create', {
      body: {
        ...reqBody.user,
        firstName: isAuthenticateMockApi ? 'Jonathan' : reqBody.user.firstName,
        lastName: isAuthenticateMockApi ? 'Doe' : reqBody.user.lastName,
      },
      schema: type({
        userAccessCode: 'string',
      }),
    }).catch((error) => {
      console.error(error);
      if (isResponseError(error)) {
        return c.json({ error: error.data, endpoint: error.request.url }, error.status as ContentfulStatusCode);
      } else if (isValidationError(error)) {
        return c.json({ error: error.issues }, 400);
      } else {
        return c.json({ error: 'Failed to create user', raw: error }, 500);
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
    const res = await upFetch('/user/update', {
      method: 'PUT',
      body: {
        ...reqBody.user,
        firstName: isAuthenticateMockApi ? 'Jonathan' : reqBody.user.firstName,
        lastName: isAuthenticateMockApi ? 'Doe' : reqBody.user.lastName,
        userAccessCode: dbDriver.authenticateAccessCode,
      } satisfies ApiReqProcessIdentityVerificationWithAuthenticate['user'] & { userAccessCode: string },
      schema: apiReqProcessIdentityVerificationWithAuthenticate.get('user').partial().and({
        userAccessCode: 'string?',
      }),
    }).catch((error) => {
      console.error(error);
      if (isResponseError(error)) {
        return c.json({ error: error.data, endpoint: error.request.url }, error.status as ContentfulStatusCode);
      } else if (isValidationError(error)) {
        return c.json({ error: error.issues }, 400);
      } else {
        return c.json({ error: 'Failed to update user', raw: error }, 500);
      }
    });

    if (res instanceof Response) {
      return res;
    }
  }

  // Update user consents
  const consentReqRes = await upFetch('/user/consent', {
    body: {
      userAccessCode: isAuthenticateMockApi ? '100385a1-4308-49db-889f-9a898fa88c21' : dbDriver.authenticateAccessCode,
      isBackgroundDisclosureAccepted:
        reqBody.consents.isBackgroundDisclosureAccepted ?? dbDriver.consents?.isBackgroundDisclosureAccepted ?? false,
      GLBPurposeAndDPPAPurpose:
        reqBody.consents.GLBPurposeAndDPPAPurpose ?? dbDriver.consents?.GLBPurposeAndDPPAPurpose ?? false,
      FCRAPurpose: reqBody.consents.FCRAPurpose ?? dbDriver.consents?.FCRAPurpose ?? false,
      fullName: `${reqBody.user.firstName.trim()} ${reqBody.user.lastName.trim()}`,
    },
    schema: type({
      success: 'boolean',
    }),
  }).catch((error) => {
    console.error(error);
    if (isResponseError(error)) {
      if (error.status === 400 && error.data?.errorMessage === 'Consent has already been recorded for this user.') {
        return { success: true };
      }
      return c.json({ error: error.data, endpoint: error.request.url }, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({ error: error.issues }, 400);
    } else {
      return c.json({ error: 'Failed to parse consents', raw: error }, 500);
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
    return c.json({ error: 'Failed to save consents', raw: consentReqRes }, 500);
  }

  if (!dbDriver.authenticateAccessCode || !dbDriver.consents) {
    return c.json({ error: 'Driver consents not found', raw: dbDriver }, 500);
  }

  const res = await upFetch('/user/jwt', {
    body: {
      userAccessCode: isAuthenticateMockApi ? '100385a1-4308-49db-889f-9a898fa88c21' : dbDriver.authenticateAccessCode,
      preferredWorkflowID: process.env.AUTHENTICATE_DOT_COM_MEDALLION_ID,
      ...(!!reqBody.medallion?.redirectURL && { redirectURL: reqBody.medallion.redirectURL }),
    },
    schema: type({
      jwt: 'string',
      token: 'string',
    }),
  }).catch((error) => {
    console.error(error);
    if (isResponseError(error)) {
      return c.json(
        { error: error.data, hint: "Don't forget to pass a valid ssl url as redirectURL", endpoint: error.request.url },
        error.status as ContentfulStatusCode,
      );
    } else if (isValidationError(error)) {
      return c.json({ error: error.issues }, 400);
    } else {
      return c.json({ error: 'Failed to generate JWT', raw: error }, 500);
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

router.post('/user/create', async (c) => {
  const res = await upFetch('/user/create', {
    body: await c.req.raw.bytes(),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({ error: error.data, endpoint: error.request.url }, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({ error: error.issues }, 400);
    } else {
      return c.json({ error: 'Failed to create user', raw: error }, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

router.post('/user/consent', async (c) => {
  const res = await upFetch('/user/consent', {
    body: await c.req.raw.bytes(),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({ error: error.data, endpoint: error.request.url }, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({ error: error.issues }, 400);
    } else {
      return c.json({ error: 'Failed to save consents', raw: error }, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

const apiReqGenerateCriminalReport = type({
  userAccessCode: 'string',
});
router.post('/user/generateCriminalReport', async (c) => {
  const body = apiReqGenerateCriminalReport(await c.req.json());
  if (body instanceof type.errors) {
    return c.json({ error: body.summary }, 400);
  }
  const res = await upFetch('/user/generateCriminalReport', {
    body: JSON.stringify(body),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({ error: error.data, endpoint: error.request.url }, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({ error: error.issues }, 400);
    } else {
      return c.json({ error: 'Failed to generate criminal report', raw: error }, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

/*
{
      user: {
        userAccessCode: 'string | null',
        firstName: 'string',
        middleName: 'string',
        lastName: 'string',
        birthday: 'string',
        year: 'string',
        month: 'string',
        day: 'string',
        email: 'string',
        phone: 'string',
        houseNumber: 'string',
        streetName: 'string',
        address: 'string',
        city: 'string',
        state: 'string',
        zipCode: 'string',
        country: 'string',
        street: 'string',
        province: 'string',
        buildingNumber: 'string',
      },
      contactProof: {
        verifiedPhone: true,
        verifiedEmail: false,
      },
      photoProof: {
        face_match_score: 100,
        liveness: {
          score: 100,
          assessment: 'Live',
          error: null,
          error_code: null,
        },
      },
      identityProof: {
        numQuestions: '4',
        score: 75,
        status: true,
      },
      backgroundCheck: {
        hasCriminalRecord: false,
        hasGlobalWatchlistRecord: false,
      },
      idVerification: {
        status: 'PASS',
        description: 'The data on the ID or Passport provided was verified in authoritative databases.',
      },
      SSNVerification: {
        isSSNVerified: false,
      },
      FEINVerification: [
        {
          uuid: 'string',
          FEINMatchFound: true,
          FEINumber: 461122122,
          isCorrectFEINumber: true,
          DUNSNumber: 901219219,
          isCorrectDUNSNumber: true,
          businessName: 'Stark Industries Inc.',
          isCorrectBusinessName: true,
          isBusinessContact: true,
        },
        {
          uuid: 'string',
          FEINMatchFound: false,
          FEINumber: 461122123,
          isCorrectFEINumber: null,
          DUNSNumber: 607477367,
          isCorrectDUNSNumber: null,
          businessName: 'Acme Inc.',
          isCorrectBusinessName: null,
          isBusinessContact: null,
        },
      ],
      company: {
        companyName: 'ABC Software',
        companyId: '9e9a1ec0-4606-12d4-b965-fb0b69bb2984',
      },
      scannedUser: {
        Address: '720 N Alta Dr',
        Audit: '',
        CSC: '',
        City: 'Beverly Hills',
        Class: 'C',
        CountryShort: 'USA',
        County: '',
        DateOfBirth: '12-31-85',
        DateOfBirth4: '12-31-1985',
        Endorsements: 'NONE',
        ExpirationDate: '12-31-25',
        ExpirationDate4: '12-31-2025',
        Eyes: 'BRN',
        FatherName: '',
        Fee: '',
        Hair: 'BRN',
        Height: '069 IN',
        Id: 'A1234567',
        IdCountry: 'United States',
        IssueDate: '12-31-17',
        IssueDate4: '12-31-2017',
        IssueDateLocal: '',
        MotherName: '',
        NameFirst: 'PAT',
        NameLast: 'JOHNSON',
        NameLast1: '',
        NameLast2: '',
        NameMiddle: 'SMITH',
        NameSuffix: '',
        Nationality: '',
        Original: '',
        PlaceOfBirth: '',
        PlaceOfIssue: '',
        Restriction: 'NONE',
        Sex: 'M',
        SigNum: '',
        SocialSecurity: '',
        State: 'CA',
        Text1: '',
        Text2: '',
        Text3: '',
        Type: '',
        Weight: '155',
        Zip: '90210',
        license: 'A1234567',
        CardType: 'DRIVER LICENSE',
        TemplateType: 'DL',
        IsAddressCorrected: false,
        IsAddressVerified: false,
        IsBarcodeRead: true,
        IsIDVerified: true,
        IsOcrRead: true,
        DocumentDetectedName: 'California',
        DocumentDetectedNameShort: 'CA',
        DocumentVerificationConfidenceRating: 100,
        AuthenticationObject: null,
        AuthenticationResult: 'Passed',
        AuthenticationResultSummary: [],
        id_front: 'https://authenticate-documentation-production.s3-us-west-1.amazonaws.com/images/ID-good-01.png',
        id_back: 'https://authenticate-documentation-production.s3-us-west-1.amazonaws.com/images/ID-good-01.png',
      },
      passportData: {
        Address2: 'P<JOHNSON<<PATRICK<<<<<<<<<<<<<<<<<<<<<<<<<<',
        Address3: 'WG30004036UTO6007078M0511014<<<<<<<<<<<<<<06',
        Country: 'USA',
        CountryLong: '',
        DateOfBirth: '07-07-60',
        DateOfBirth4: '07-07-1960',
        End_POB: 'S OB ZOOO',
        ExpirationDate: '11-01-05',
        ExpirationDate4: '11-01-2005',
        IssueDate: '11-01-05',
        IssueDate4: '11-01-2005',
        NameFirst: 'PATRICK',
        NameFirst_NonMRZ: 'PATRICK',
        NameLast: 'JOHNSON',
        NameLast_NonMRZ: 'JOHNSON',
        NameMiddle: '',
        Nationality: 'UTO',
        NationalityLong: '',
        PassportNumber: 'WG3000403',
        PersonalNumber: '',
        Sex: 'M',
        AuthenticationObject: null,
        AuthenticationResult: 'Attention',
        AuthenticationResultSummary: ['Document Expired'],
        SignImage: null,
        id_front: 'https://authenticate-documentation-production.s3-us-west-1.amazonaws.com/images/ID-good-01.png',
        face_image: 'https://authenticate-documentation-production.s3-us-west-1.amazonaws.com/images/ID-good-01.png',
        signature_image:
          'https://authenticate-documentation-production.s3-us-west-1.amazonaws.com/images/ID-good-01.png',
      },
      verifyUI: {
        passport: {
          attempts: 1,
          result: 'complete',
          authentication_result: 'Passed',
          firstname: 'Patrick',
          middlename: '',
          lastname: 'JOHNSON',
          address: 'P<JOHNSON<<PATRICK<<<<<<<<<<<<<<<<<<<<<<<<<<WG30004036UTO6007078M0511014<<<<<<<<<<<<<<06',
          dob: '1980-11-13',
          gender: 'M',
          passport_number: '612299112',
          id_issued_date: '2015-05-22',
          id_expiration_date: '2035-05-21',
          nationality: 'USA',
          web_response_code: null,
          id_front: 'https://authenticate-documentation-production.s3-us-west-1.amazonaws.com/images/ID-good-01.png',
          face_image: 'https://authenticate-documentation-production.s3-us-west-1.amazonaws.com/images/ID-good-01.png',
          signature_image:
            'https://authenticate-documentation-production.s3-us-west-1.amazonaws.com/images/ID-good-01.png',
          selfie_image:
            'https://authenticate-documentation-production.s3-us-west-1.amazonaws.com/images/ID-good-01.png',
          liveness_result: {
            score: 90,
            livenessAssessment: 'Live',
          },
          liveness_error: null,
          liveness_error_code: null,
          face_match_score: 95,
          method: 'verifyUI',
        },
        scannedUser: {
          attempts: 1,
          result: 'complete',
          confidence_rating: '99',
          id_class: null,
          id_type: 'DRIVER LICENSE',
          first_name: 'Patrick',
          middle_name: '',
          last_name: 'JOHNSON',
          address: '123 Hollywood Boulevard, CA 90121',
          city: 'Beverly Hills',
          state: 'CA',
          zip: '90121',
          dob: '1980-11-13',
          gender: 'M',
          height: null,
          weight: null,
          id_number: 'A1234567',
          id_issued_date: '1994-01-21',
          id_expiration_date: '2024-11-19',
          is_barcode_read: null,
          is_ocr_read: null,
          id_front: 'https://authenticate-documentation-production.s3-us-west-1.amazonaws.com/images/ID-good-01.png',
          id_back: 'https://authenticate-documentation-production.s3-us-west-1.amazonaws.com/images/ID-good-01.png',
          face_image: 'https://authenticate-documentation-production.s3-us-west-1.amazonaws.com/images/ID-good-01.png',
          signature_image:
            'https://authenticate-documentation-production.s3-us-west-1.amazonaws.com/images/ID-good-01.png',
          liveness_result: {
            score: 0,
            livenessAssessment: 'NotLive',
          },
          liveness_error: null,
          liveness_error_code: null,
          face_match_score: 95,
          method: 'verifyUI',
        },
      },
      professionalLicense: [
        {
          license_title: 'Professional Certificate in Accounting',
          license_title_verified: true,
          license_organization: 'PCALC',
          license_organization_verified: false,
          license_number: 'xyz129',
          license_number_verified: true,
          start_date: '09-09-2011',
          start_date_verified: true,
          end_date: '09-09-2019',
          end_date_verified: true,
          state: 'CA',
          country: 'USA',
          status: 'Completed',
        },
      ],
      education: [
        {
          institution_name: 'VS - HOMETOWN UNIVERSITY',
          institution_name_verified: true,
          institution_type: 'University',
          institution_campus_name: '',
          institution_phone: '9102901219',
          institution_address: '221B Baker Street',
          institution_address_verified: true,
          institution_town: 'London',
          institution_town_verified: true,
          institution_country: 'USA',
          institution_country_verified: true,
          institution_postal_code: '21211',
          degree: 'Bachelors in Engineering',
          degree_verified: true,
          start_date: '2011-07-31',
          start_date_verified: true,
          end_date: '2014-07-31',
          end_date_verified: true,
          majors: 'Software Engineering',
          majors_verified: true,
          minors: 'Biology',
          minors_verified: true,
          honors: 'Magna Cum Laude',
          honors_verified: true,
          currently_attending: 0,
          currently_attending_verified: true,
          completed_successfully: 1,
          completed_successfully_verified: true,
          status: 'Completed',
        },
      ],
      employment: [
        {
          employer_name: 'Enterprise Two',
          employer_name_verified: true,
          employer_address: '221B Baker Street',
          employer_address_verified: true,
          employer_town: 'London',
          employer_town_verified: true,
          employer_country: 'Great Britain',
          employer_country_verified: true,
          job_title: 'Temp-2',
          job_title_verified: true,
          start_date: '2016-06-27',
          start_date_verified: true,
          end_date: '2018-06-27',
          end_date_verified: true,
          current_employment: '1',
          current_employment_verified: true,
          contract_type: 'EMPLOYMENT',
          contract_type_verified: true,
          status: 'Completed',
        },
      ],
      consent: {
        is_report_checked: 1,
        background_check_disclosure_accepted: null,
        fcra_purpose: 1,
        glb_purpose_and_dppa_purpose: 1,
      },
      bankAccountOwnerMatchResult: {
        attempts: 1,
        is_owner_matched: true,
        account: [
          {
            owner_name: 'Patrick Middleton',
            first_name: 'Patrick',
            first_name_score: 100,
            last_name: 'Middleton',
            last_name_score: 100,
            middle_name: '',
            middle_name_score: 0,
            phones: null,
            first_name_match: true,
            last_name_match: true,
            middle_name_match: false,
          },
        ],
        matched_at: '2023-10-24T18:22:43.000Z',
      },
      identityAttempts: {
        kba: 0,
        passport: 0,
        government_id: 0,
        financial_account_login: 0,
      },
    }
*/
router.post('/user/getTestResult', async (c) => {
  const authUser = c.get('user');
  const dbDriverRef = (
    getFirestore().collection(CollectionName.DRIVERS) as CollectionReference<DriverEntity, DriverEntity>
  ).doc(authUser.uid);
  const dbDriver = (await dbDriverRef.get()).data();
  if (!dbDriver) {
    return c.json({ error: 'Driver not found' }, 404);
  }
  const res = await upFetch('/user/getTestResult', {
    body: { userAccessCode: dbDriver.authenticateAccessCode },
    schema: type({
      user: type('Record<string, unknown>'),
      contactProof: type('Record<string, unknown>'),
      photoProof: type('Record<string, unknown>'),
      identityProof: type('Record<string, unknown>'),
      backgroundCheck: type('Record<string, unknown>'),
      idVerification: type('Record<string, unknown>'),
      SSNVerification: type('Record<string, unknown>'),
      FEINVerification: type('Record<string, unknown>').array(),
      company: type('Record<string, unknown>'),
      scannedUser: type('Record<string, unknown>'),
      passportData: type('Record<string, unknown>'),
      verifyUI: {
        passport: type('Record<string, unknown>'),
        scannedUser: type('Record<string, unknown>'),
      },
      professionalLicense: type('unknown').array(),
      employment: type('unknown').array(),
      consent: type('Record<string, unknown>'),
      bankAccountOwnerMatchResult: type('Record<string, unknown>'),
      identityAttempts: type('Record<string, unknown>'),
    }).partial(),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({ error: error.data, endpoint: error.request.url }, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({ error: error.issues }, 400);
    } else {
      return c.json({ error: 'Failed to get test result', raw: error }, 500);
    }
  });

  if (res instanceof Response) {
    return res;
  }

  return c.json(res, 200);
});

const apiReqCriminalReportSeven = type({
  userAccessCode: 'string',
});
router.post('/identity/request/criminal/report/seven', async (c) => {
  const body = apiReqCriminalReportSeven(await c.req.json());
  if (body instanceof type.errors) {
    return c.json({ error: body.summary }, 400);
  }
  const res = await upFetch('/identity/request/criminal/report/seven', {
    body: JSON.stringify(body),
  }).catch((error) => {
    if (isResponseError(error)) {
      return c.json({ error: error.data, endpoint: error.request.url }, error.status as ContentfulStatusCode);
    } else if (isValidationError(error)) {
      return c.json({ error: error.issues }, 400);
    } else {
      return c.json({ error: 'Failed to request criminal report', raw: error }, 500);
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
