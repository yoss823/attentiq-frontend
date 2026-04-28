# Ancien guide Stripe (long)

La procédure maintenue à jour est **`STRIPE_SETUP.md`** ainsi que **`.env.example`**.

Les montants alignés sur le code actuel : **9 €** (rapport unitaire), **35 €/mois** (5 rapports), **89 €/mois** (15 rapports) — Payment Links, `STRIPE_PRICE_*`, etc. Une variable legacy **`STRIPE_PRICE_MONTHLY_29`** peut encore pointer vers un ancien price Stripe à 29 €. Ignore toute mention de 19 € / 49 € / 99 € ou de `NEXT_PUBLIC_STRIPE_PRICE_ID_*` : **ce n’est plus utilisé par le code**.

---

*Le reste de ce fichier historique a été retiré pour éviter les contradictions. Utilise `STRIPE_SETUP.md`.*
