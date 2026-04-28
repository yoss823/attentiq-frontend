import { DEFAULT_PUBLIC_BACKEND_URL } from "./backend-public-url";

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string | null;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  slug: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "rapport-complet",
    name: "Rapport complet",
    price: 9,
    currency: "€",
    period: null,
    description: "Un diagnostic complet pour une vidéo courte de votre choix.",
    features: [
      "1 analyse complète",
      "Diagnostic d'attention + plan d'actions",
      "Pour vos prochaines vidéos",
    ],
    cta: "Obtenir mon rapport",
    highlighted: false,
    slug: "rapport-complet",
  },
  {
    id: "5-rapports",
    name: "5 rapports / mois",
    price: 35,
    currency: "€",
    period: "mois",
    description: "5 diagnostics complets par mois pour garder le rythme.",
    features: [
      "5 rapports complets / mois",
      "Même profondeur qu'à l'unité",
      "Assistant : jusqu'à 3 réponses personnalisées par rapport",
    ],
    cta: "S'abonner",
    highlighted: true,
    slug: "5-rapports",
  },
  {
    id: "pack-15",
    name: "15 rapports / mois",
    price: 89,
    currency: "€",
    period: "mois",
    description:
      "15 diagnostics complets par mois — abonnement mensuel, idéal si vous produisez souvent.",
    features: [
      "15 rapports complets / mois",
      "Assistant : jusqu'à 5 réponses personnalisées par rapport",
      "Chaque rapport : même contenu qu'une analyse à 9 €",
    ],
    cta: "S'abonner",
    highlighted: false,
    slug: "pack-15",
  },
];

/** Base API (alias) — alignée sur le même défaut que `lib/api.ts`. Préférer `.env.local` en dev. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  DEFAULT_PUBLIC_BACKEND_URL;

export const POLLING_INTERVAL_MS = 3000;
export const POLLING_MAX_ATTEMPTS = 40; // 2 minutes max
