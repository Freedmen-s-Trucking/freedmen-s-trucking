import {Hono} from "hono";
import {CollectionName, OrderPrivateDetailsEntity, type} from "@freedmen-s-trucking/types";
import {getFirestore, CollectionReference} from "firebase-admin/firestore";

const router = new Hono();

const apiReqVerifyDeliveryCode = type({
  deliveryCode: "string",
  orderId: "string",
});

router.post("/verify-delivery-code", async (c) => {
  const req = apiReqVerifyDeliveryCode(await c.req.json());
  if (req instanceof type.errors) {
    return c.json({error: req.summary}, 400);
  }

  const orderPrivateDetailsRef = (
    getFirestore().collection(CollectionName.ORDERS_PRIVATE_DETAILS) as CollectionReference<
      OrderPrivateDetailsEntity,
      OrderPrivateDetailsEntity
    >
  ).doc(req.orderId);
  const orderPrivateDetails = (await orderPrivateDetailsRef.get()).data();

  if (!orderPrivateDetails?.deliveryCode) {
    return c.json({error: `Order ${req.orderId.substring(0, 8)} doesn't have a delivery code`}, 500);
  }

  if (orderPrivateDetails.deliveryCode !== req.deliveryCode) {
    return c.json({error: "Invalid delivery code"}, 400);
  }

  return c.json({success: true}, 200);
});

export default router;
