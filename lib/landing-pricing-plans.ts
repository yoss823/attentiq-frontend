/**
 * Cartes tarifaires landing (vidéo / texte / image) : même grille que Stripe,
 * pour éviter des prix différents par page. L'essai gratuit n'est pas une carte
 * tarifaire : aperçu limité (voir textes sur chaque page).
 */
export type LandingPlanCard = {
  kicker: string;
  priceCents: number;
  priceLabel: string;
  cadenceLabel?: string;
  summary: string;
  featureList: string[];
  ctaLabel: string;
  ctaHref: string;
  featured: boolean;
};

export const LANDING_LAUNCH_DISCOUNT_PERCENT = 20;

/** Prix barré : `salePriceCents` est déjà le tarif remisé (-20 %). */
export function getLandingListPriceCents(salePriceCents: number) {
  return Math.round(salePriceCents / (1 - LANDING_LAUNCH_DISCOUNT_PERCENT / 100));
}

export function formatLandingEuroCents(valueCents: number) {
  const euros = valueCents / 100;
  const hasDecimals = valueCents % 100 !== 0;
  if (!hasDecimals) {
    return `${Math.round(euros)}€`;
  }
  return `${euros.toFixed(2).replace(".", ",")}€`;
}

export const LANDING_PAID_PLANS: LandingPlanCard[] = [
  {
    kicker: "Pour débloquer un diagnostic",
    priceCents: 900,
    priceLabel: "9€",
    summary:
      "Un rapport complet — même profondeur pour vidéo, texte ou image.",
    featureList: [
      "1 rapport complet",
      "Toutes les chutes d'attention",
      "Plan d'actions détaillé",
    ],
    ctaLabel: "Choisir 9€",
    ctaHref: "/checkout/rapport-complet",
    featured: false,
  },
  {
    kicker: "Pour publier chaque semaine",
    priceCents: 3500,
    priceLabel: "35€",
    cadenceLabel: "/mois",
    summary:
      "5 rapports complets / mois — un tarif équilibré pour publier chaque semaine.",
    featureList: [
      "5 rapports complets / mois",
      "Même profondeur d'analyse",
      "Assistant : jusqu'à 3 réponses personnalisées par rapport",
    ],
    ctaLabel: "Choisir 35€/mois",
    ctaHref: "/checkout/monthly-5",
    featured: true,
  },
  {
    kicker: "Pour une série de contenus",
    priceCents: 8900,
    priceLabel: "89€",
    cadenceLabel: "/mois",
    summary: "15 diagnostics complets par mois — abonnement mensuel.",
    featureList: [
      "15 rapports complets / mois",
      "Assistant : jusqu'à 5 réponses personnalisées par rapport",
      "Chaque rapport : même contenu qu'une analyse à 9 €",
    ],
    ctaLabel: "Choisir 89€/mois",
    ctaHref: "/checkout/pack-15",
    featured: false,
  },
];
