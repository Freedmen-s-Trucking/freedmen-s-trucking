import {Hono} from "hono";
import {
  CollectionName,
  OrderEntity,
  OrderEntityFields,
  OrderPrivateDetailsEntity,
  type,
} from "@freedmen-s-trucking/types";
import {getFirestore, CollectionReference} from "firebase-admin/firestore";
import {Variables} from "~src/utils/types";

const router = new Hono<{Variables: Variables}>();

const apiReqVerifyDeliveryCode = type({
  deliveryCode: "string",
  orderId: "string",
});

router.get("/get-delivery-code/:orderId", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({error: "Unauthorized"}, 401);
  }
  const orderId = c.req.param("orderId");
  const order = (
    await (getFirestore().collection(CollectionName.ORDERS) as CollectionReference<OrderEntity, OrderEntity>)
      .doc(orderId)
      .get()
  ).data();
  if (!order) {
    return c.json({error: `Order ${orderId.substring(0, 8)} not found`}, 404);
  }

  if (order[OrderEntityFields.ownerId] !== user.uid) {
    return c.json({error: "Unauthorized, you are not the owner of this order"}, 401);
  }

  const orderPrivateDetailsRef = (
    getFirestore().collection(CollectionName.ORDERS_PRIVATE_DETAILS) as CollectionReference<
      OrderPrivateDetailsEntity,
      OrderPrivateDetailsEntity
    >
  ).doc(orderId);
  const orderPrivateDetails = (await orderPrivateDetailsRef.get()).data();

  if (!orderPrivateDetails?.deliveryCode) {
    return c.json({error: `Order ${orderId.substring(0, 8)} doesn't have a delivery code`}, 500);
  }

  return c.json({deliveryCode: orderPrivateDetails.deliveryCode}, 200);
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
