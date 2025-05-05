import _stripe from "stripe";
import {ENV_STRIPE_SECRET_KEY} from "~src/utils/envs";

const stripe = new _stripe(ENV_STRIPE_SECRET_KEY);

export default stripe;
