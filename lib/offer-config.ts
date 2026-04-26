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

/** Stripe Price IDs — canonical names + Railway aliases (sans renommer les vars). */
const STRIPE_PRICE_SINGLE_RESOLVED =
  process.env.STRIPE_PRICE_SINGLE_REPORT ||
  process.env.STRIPE_PRICE_SINGLE_REPORT_9;
const STRIPE_PRICE_PACK_15_RESOLVED =
  process.env.STRIPE_PRICE_PACK_15 ||
  process.env.STRIPE_PRICE_MONTHLY_89;

// Stripe payment links — set in env when you create products in Stripe Dashboard.
// Fallback URLs are placeholders; replace with real Payment Links before launch.
const STRIPE_SINGLE_URL =
  process.env.NEXT_PUBLIC_STRIPE_LINK_SINGLE ||
  "https://buy.stripe.com/00w28s5PmeXl22m3WreP11u";
const STRIPE_MONTHLY5_URL =
  process.env.NEXT_PUBLIC_STRIPE_LINK_MONTHLY5 ||
  "https://buy.stripe.com/00w28s5PmeXl22m3WreP11u";
const STRIPE_PACK_15_URL =
  process.env.NEXT_PUBLIC_STRIPE_LINK_PACK_15 ||
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
    priceCents: 900,
    priceLabel: "9€",
    summary: "Débloquez le diagnostic complet d'une seule vidéo.",
    audience: "Pour valider une vidéo précise avant de republier.",
    ctaLabel: "Choisir 9€",
    featureList: [
      "1 rapport complet",
      "Toutes les chutes d'attention",
      "Plan d'actions détaillé",
    ],
    stripePriceId:
      STRIPE_PRICE_SINGLE_RESOLVED || "price_1TNxfxKXvWnroW3IZzYmMgtN",
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
    priceCents: 2900,
    priceLabel: "29€",
    cadenceLabel: "/mois",
    summary: "5 rapports complets par mois — comme presque 2 analyses offertes vs l'unité.",
    audience: "Pour les créateurs qui testent plusieurs hooks par mois.",
    ctaLabel: "Choisir 29€/mois",
    featureList: [
      "5 rapports complets / mois",
      "Même profondeur d'analyse",
      "Idéal pour une routine de publication",
    ],
    stripePriceId:
      process.env.STRIPE_PRICE_MONTHLY_29 || "price_1TNxfxKXvWnroW3IUCapqAK5",
    stripeUrl: STRIPE_MONTHLY5_URL,
    checkoutPath: "/checkout/monthly-5",
    createsAccount: true,
    monthlyQuota: 5,
    featured: true,
  },
  {
    slug: "pack-15",
    legacySlugs: ["unlimited", "illimite-mois", "illimite"],
    name: "15 rapports / mois",
    shortLabel: "Volume",
    kicker: "Pour une série de vidéos",
    priceCents: 8900,
    priceLabel: "89€",
    cadenceLabel: "/mois",
    summary:
      "15 diagnostics complets par mois — pour les créateurs qui publient souvent.",
    audience: "Pour auditer plusieurs sorties chaque mois avec le même niveau d'analyse.",
    ctaLabel: "Choisir 89€/mois",
    featureList: [
      "15 rapports complets / mois",
      "Renouvelé chaque mois",
      "Même qualité d'analyse qu'à l'unité",
    ],
    stripePriceId:
      STRIPE_PRICE_PACK_15_RESOLVED || "price_1TNxfxKXvWnroW3IG6G9qmDF",
    stripeUrl: STRIPE_PACK_15_URL,
    checkoutPath: "/checkout/pack-15",
    createsAccount: true,
    monthlyQuota: 15,
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
