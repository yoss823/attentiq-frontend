import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export const STRIPE_PRICES = {
  rapport_complet: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_19,
  cinq_rapports: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_49,
  illimite: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_99,
} as const;
