import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export const STRIPE_LINKS = {
  rapport_complet: process.env.NEXT_PUBLIC_STRIPE_LINK_SINGLE,
  cinq_rapports: process.env.NEXT_PUBLIC_STRIPE_LINK_MONTHLY5,
  illimite: process.env.NEXT_PUBLIC_STRIPE_LINK_UNLIMITED,
} as const;
