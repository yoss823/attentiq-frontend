export type AttentiqOffer = {
  slug: string;
  legacySlugs?: string[];
  name: string;
  shortLabel: string;
  kicker: string;
  priceCents: number;
  priceLabel: string;
  cadenceLabel?: string;
  summary: string;
  audience: string;
  ctaLabel: string;
  featureList: string[];
  stripePriceId: string;
  stripeUrl: string;
  checkoutPath: string;
  createsAccount?: boolean;
  monthlyQuota: number | null;
  featured?: boolean;
};

// Stripe payment links — update these when new links are generated in the Stripe dashboard.
// These are used as fallbacks when the /api/checkout/prepare session creation fails.
// Primary checkout flow uses /api/checkout/prepare to create dynamic Stripe sessions.
const STRIPE_SINGLE_URL =
  process.env.NEXT_PUBLIC_STRIPE_LINK_SINGLE ||
  "https://buy.stripe.com/00w28s5PmeXl22m3WreP11u";
const STRIPE_MONTHLY5_URL =
  process.env.NEXT_PUBLIC_STRIPE_LINK_MONTHLY5 ||
  "https://buy.stripe.com/00w28s5PmeXl22m3WreP11u";
const STRIPE_UNLIMITED_URL =
  process.env.NEXT_PUBLIC_STRIPE_LINK_UNLIMITED ||
  "https://buy.stripe.com/00w28s5PmeXl22m3WreP11u";

export const FREE_TEASER_LIMITS = {
  drops: 3,
  actions: 2,
} as const;

export const ATTENTIQ_OFFERS: AttentiqOffer[] = [
  {
    slug: "single",
    legacySlugs: ["rapport-complet"],
    name: "Rapport complet",
    shortLabel: "One-shot",
    kicker: "Pour débloquer une vidéo",
    priceCents: 1900,
    priceLabel: "19€",
    summary: "Débloquez le diagnostic complet d'une seule vidéo.",
    audience: "Pour valider une vidéo précise avant de republier.",
    ctaLabel: "Choisir 19€",
    featureList: [
      "1 rapport complet",
      "Toutes les chutes d'attention",
      "Plan d'actions détaillé",
    ],
    stripePriceId: "price_1TNxfxKXvWnroW3IZzYmMgtN",
    stripeUrl: STRIPE_SINGLE_URL,
    checkoutPath: "/checkout/single",
    monthlyQuota: 1,
  },
  {
    slug: "monthly-5",
    legacySlugs: ["5-rapports-mois"],
    name: "5 rapports / mois",
    shortLabel: "Creator",
    kicker: "Pour publier chaque semaine",
    priceCents: 4900,
    priceLabel: "49€",
    cadenceLabel: "/mois",
    summary: "Gardez un rythme d'audit sans passer en illimité.",
    audience: "Pour les créateurs qui testent plusieurs hooks par mois.",
    ctaLabel: "Choisir 49€/mois",
    featureList: [
      "5 rapports complets / mois",
      "Même profondeur d'analyse",
      "Le meilleur point de départ pour une routine",
    ],
    stripePriceId: "price_1TNxfxKXvWnroW3IUCapqAK5",
    stripeUrl: STRIPE_MONTHLY5_URL,
    checkoutPath: "/checkout/monthly-5",
    createsAccount: true,
    monthlyQuota: 5,
    featured: true,
  },
  {
    slug: "unlimited",
    legacySlugs: ["illimite-mois"],
    name: "Illimité / mois",
    shortLabel: "Studio",
    kicker: "Pour une équipe ou un volume élevé",
    priceCents: 9900,
    priceLabel: "99€",
    cadenceLabel: "/mois",
    summary: "Passez toutes vos vidéos au diagnostic sans friction.",
    audience: "Pour les équipes, studios et créateurs intensifs.",
    ctaLabel: "Choisir 99€/mois",
    featureList: [
      "Rapports complets illimités",
      "Aucune limite de volume",
      "Pensé pour une cadence de publication soutenue",
    ],
    stripePriceId: "price_1TNxfxKXvWnroW3IG6G9qmDF",
    stripeUrl: STRIPE_UNLIMITED_URL,
    checkoutPath: "/checkout/unlimited",
    createsAccount: true,
    monthlyQuota: null,
  },
];


export function normalizeOfferSlug(slug: string | null | undefined) {
  const trimmed = slug?.trim();

  if (!trimmed) {
    return null;
  }

  return (
    ATTENTIQ_OFFERS.find(
      (offer) =>
        offer.slug === trimmed || offer.legacySlugs?.includes(trimmed)
    )?.slug ?? null
  );
}

export function getOfferRouteSlugs() {
  return ATTENTIQ_OFFERS.flatMap((offer) => [
    offer.slug,
    ...(offer.legacySlugs ?? []),
  ]);
}

export function getOfferBySlug(slug: string) {
  const normalizedSlug = normalizeOfferSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  return ATTENTIQ_OFFERS.find((offer) => offer.slug === normalizedSlug) ?? null;
}

export function getOfferByPriceCents(priceCents: number) {
  return ATTENTIQ_OFFERS.find((offer) => offer.priceCents === priceCents) ?? null;
}

export function getTeaserDrops<T>(items: T[] | null | undefined) {
  return Array.isArray(items) ? items.slice(0, FREE_TEASER_LIMITS.drops) : [];
}

export function getTeaserActions<T>(items: T[] | null | undefined) {
  return Array.isArray(items) ? items.slice(0, FREE_TEASER_LIMITS.actions) : [];
}
