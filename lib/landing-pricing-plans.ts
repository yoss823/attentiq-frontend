/**
 * Cartes tarifaires landing (vidéo / texte / image) : même grille que Stripe,
 * pour éviter des prix différents par page. L'essai gratuit n'est pas une carte
 * tarifaire : aperçu limité (voir textes sur chaque page).
 */
export type LandingPlanCard = {
  kicker: string;
  priceLabel: string;
  cadenceLabel?: string;
  summary: string;
  featureList: string[];
  ctaLabel: string;
  ctaHref: string;
  featured: boolean;
};

export const LANDING_PAID_PLANS: LandingPlanCard[] = [
  {
    kicker: "Pour débloquer un diagnostic",
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
    priceLabel: "29€",
    cadenceLabel: "/mois",
    summary:
      "5 rapports complets / mois — près de 2 analyses offertes vs 5 × 9 € à l'unité.",
    featureList: [
      "5 rapports complets / mois",
      "Même profondeur d'analyse",
      "Idéal pour une routine de publication",
    ],
    ctaLabel: "Choisir 29€/mois",
    ctaHref: "/checkout/monthly-5",
    featured: true,
  },
  {
    kicker: "Pour une série de contenus",
    priceLabel: "89€",
    cadenceLabel: "/mois",
    summary: "15 diagnostics complets par mois — abonnement mensuel.",
    featureList: [
      "15 rapports complets / mois",
      "Renouvelé chaque mois",
      "Chaque rapport : même contenu qu'une analyse à 9 €",
    ],
    ctaLabel: "Choisir 89€/mois",
    ctaHref: "/checkout/pack-15",
    featured: false,
  },
];
