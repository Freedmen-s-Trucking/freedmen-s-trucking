import _stripe from "stripe";
import {STRIPE_SECRET_KEY} from "~src/utils/envs";

const stripe = new _stripe(STRIPE_SECRET_KEY);

export default stripe;
