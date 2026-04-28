# Stripe — configuration Attentiq (à jour)

## 1. Compte et clés

1. [Dashboard Stripe](https://dashboard.stripe.com) → **Développeurs** → **Clés API**
2. Récupérer la clé **publique** `pk_test_…` / `pk_live_…` et la clé **secrète** `sk_test_…` / `sk_live_…`

Variables Railway / `.env` :

| Variable | Rôle |
|----------|------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Côté navigateur (Stripe.js) |
| `STRIPE_SECRET_KEY` | Serveur Next : vérification session, `/merci`, sync paiement |

## 2. Produits et montants (vidéo, texte, image : même grille)

| Offre | Montant | Type |
|-------|---------|------|
| Rapport complet | **9 €** | Paiement unique |
| 5 rapports / mois | **35 €** | Abonnement mensuel |
| 15 rapports / mois | **89 €** | Abonnement mensuel |

Crée **3 Prices** (ou 3 **Payment Links**) correspondants dans Stripe.

## 3. Payment Links (recommandé)

Pour chaque offre, crée un **Payment Link** et copie l’URL `https://buy.stripe.com/…` :

| Variable | Exemple |
|----------|---------|
| `NEXT_PUBLIC_STRIPE_LINK_SINGLE` | Lien **9 €** |
| `NEXT_PUBLIC_STRIPE_LINK_MONTHLY5` | Lien **35 €/mois** (legacy Stripe : **29 €** si l’ancien price est encore actif) |
| `NEXT_PUBLIC_STRIPE_LINK_PACK_15` **ou** `NEXT_PUBLIC_STRIPE_LINK_UNLIMITED` | Lien **89 €/mois** |

**URL de succès** de chaque lien :  
`https://<ton-domaine>/merci?session_id={CHECKOUT_SESSION_ID}`

Optionnel mais utile : **métadonnées** sur le lien / la session (`jobId`, `videoUrl`, `offerSlug`) pour le rapport **9 €** lancé depuis l’analyse vidéo, si le cookie de checkout n’est plus présent.

## 4. Price IDs (API serveur)

Utilisés notamment par `POST /api/checkout` (session Checkout programmatique) et la config offres :

| Variable |
|----------|
| `STRIPE_PRICE_SINGLE_REPORT` ou `STRIPE_PRICE_SINGLE_REPORT_9` |
| `STRIPE_PRICE_MONTHLY_35` (recommandé) ou `STRIPE_PRICE_MONTHLY_29` (legacy) |
| `STRIPE_PRICE_PACK_15` ou `STRIPE_PRICE_MONTHLY_89` |

## 5. Base de données (recommandé en prod)

| Variable | Rôle |
|----------|------|
| `DATABASE_URL` | Postgres : historique paiements, contexte checkout, page **Compte** |

Sans Postgres, le retour `/merci` fonctionne quand même grâce à la **vérification directe** de la session Stripe (`verify-session`).

## 6. Webhook Nanocorp (optionnel, legacy)

`POST /api/webhooks/nanocorp` — si un service externe notifie les paiements, il alimente la même table que la sync Stripe. Ce n’est **pas** obligatoire si la vérif session + Stripe suffit.

En production, définis **`NANOCORP_WEBHOOK_SECRET`** : le handler exige alors `Authorization: Bearer <secret>` ou le header `X-Webhook-Secret` (sinon `401`). Sans secret, l’endpoint reste ouvert (à éviter si l’URL est publique).

## 7. Tests

- Carte test : `4242 4242 4242 4242`, date future, CVC quelconque.
- Parcours : checkout → paiement → `/merci` → redirection analyse ou accès premium.

Voir aussi **`.env.example`**.
