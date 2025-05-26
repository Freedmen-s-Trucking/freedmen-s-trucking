import {Hono} from "hono";
import {CollectionName, type, DriverEntity, apiReqSendBatchMessage} from "@freedmen-s-trucking/types";
import {getFirestore, CollectionReference} from "firebase-admin/firestore";
import {Variables} from "~src/utils/types";
import TwilioSdk from "twilio";

const router = new Hono<{Variables: Variables}>();

router.post("/sms/send-batch-message-to-drivers", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({error: "Unauthorized"}, 401);
  }

  const req = apiReqSendBatchMessage(await c.req.json());
  if (req instanceof type.errors) {
    return c.json({error: req.summary}, 400);
  }

  const sms = req.message;
  const uids = req.uids;

  const driverRefs = uids.map((uid) => {
    return (getFirestore().collection(CollectionName.DRIVERS) as CollectionReference<DriverEntity, DriverEntity>).doc(
      uid,
    );
  });

  const smsClient = TwilioSdk(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  const driverDocs = await Promise.all(driverRefs.map((ref) => ref.get()));

  const promises = driverDocs.map(async (doc) => {
    const phone = doc.data()?.phoneNumber;
    if (phone) {
      try {
        return await smsClient.messages.create({
          body: sms,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }
    return Promise.reject(
      new Error(
        `The driver #${doc.id.substring(0, 8)} ${doc.data()?.firstName} ${doc.data()?.lastName} does not have a phone number`,
      ),
    );
  });

  const results = await Promise.all(promises);
  const failures: Error[] = [];
  const successes: any[] = [];
  results.forEach((result) => {
    if (result instanceof Error) {
      failures.push({...result, message: result.message || result.toString(), stack: undefined});
    } else {
      successes.push(result);
    }
  });

  return c.json({successes, failures}, 200);
});

export default router;
