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
    id: 'rapport-complet',
    name: 'Rapport Complet',
    price: 29,
    currency: '€',
    period: null,
    description: 'Un rapport approfondi pour une vidéo de votre choix.',
    features: [
      'Analyse complète d\'une vidéo',
      'Rapport PDF téléchargeable',
      'Carte d\'attention seconde par seconde',
      'Recommandations personnalisées',
      'Accès à vie au rapport',
    ],
    cta: 'Obtenir mon rapport',
    highlighted: false,
    slug: 'rapport-complet',
  },
  {
    id: '5-rapports',
    name: '5 Rapports',
    price: 99,
    currency: '€',
    period: null,
    description: 'Analysez 5 vidéos et optimisez votre stratégie de contenu.',
    features: [
      '5 analyses complètes',
      'Rapports PDF téléchargeables',
      'Carte d\'attention seconde par seconde',
      'Recommandations personnalisées',
      'Comparaison entre vidéos',
      'Support prioritaire',
    ],
    cta: 'Obtenir 5 rapports',
    highlighted: true,
    slug: '5-rapports',
  },
  {
    id: 'illimite',
    name: 'Illimité',
    price: 199,
    currency: '€',
    period: 'mois',
    description: 'Analyses illimitées pour les créateurs et agences sérieux.',
    features: [
      'Analyses illimitées',
      'Rapports PDF téléchargeables',
      'Carte d\'attention seconde par seconde',
      'Recommandations personnalisées',
      'Comparaison entre vidéos',
      'Tableau de bord analytique',
      'API access',
      'Support dédié',
    ],
    cta: 'Démarrer l\'abonnement',
    highlighted: false,
    slug: 'illimite',
  },
];

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const POLLING_INTERVAL_MS = 3000;
export const POLLING_MAX_ATTEMPTS = 40; // 2 minutes max
