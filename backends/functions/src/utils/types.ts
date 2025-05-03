import type {DecodedIdToken} from "firebase-admin/auth";

export type Variables = {
  user: DecodedIdToken;
};
