import _stripe from 'stripe';

const stripe = new _stripe(process.env.STRIPE_SECRET_KEY!);

export default stripe;
