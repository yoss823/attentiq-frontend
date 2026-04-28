# Déploiement des comptes et publication — réalité technique

## Ce qu’on ne peut pas faire « automatiquement » ici

- Créer des comptes Instagram, TikTok, YouTube, LinkedIn ou X avec un e-mail fourni dans le chat : **vérifications humaines** (SMS, app authenticator, parfois pièce d’identité pour les comptes pro).
- Publier en continu sans **vos** accès API / Business Manager : chaque plateforme exige une **authentification OAuth** ou des outils officiels (Meta Business Suite, etc.) liés à **votre** identité légale ou société.

## Ce que vous pouvez mettre en place vous-mêmes (ensuite semi-auto)

1. **Meta (Instagram + Facebook)**  
   - Compte Instagram pro → lier à **Meta Business Suite**.  
   - Option : **Meta Graph API** + token longue durée pour planifier des posts (outil type Buffer, Later, ou script serveur avec vos secrets).

2. **TikTok**  
   - **TikTok for Business** / Content Posting API selon éligibilité et validation du compte.

3. **YouTube Shorts**  
   - **YouTube Data API** avec compte Google Cloud + OAuth ; upload Shorts comme vidéos verticales.

4. **LinkedIn**  
   - **LinkedIn Marketing API** / OAuth entreprise — souvent réservé aux pages org validées.

5. **X**  
   - API **payante** et conditions changeantes ; prévoir un outil tiers ou publication manuelle au début.

## Recommandation pour démarrer vite

1. Créer les comptes **à la main** (même e-mail partout si vous voulez).  
2. Poster **3 semaines** manuellement avec ce pack (rythme + message).  
3. Quand le flux est stable, brancher **un scheduler** (Later, Metricool, etc.) avec vos visuels dans `public/marketing/social/`.

## Checklist lancement (30 min)

- [ ] Nom d’utilisateur cohérent (`attentiq`, `attentiq_io`, etc.)  
- [ ] Bio copiée depuis `INSTAGRAM.md`  
- [ ] Lien : `https://www.attentiq.io`  
- [ ] 3 premiers posts = les 3 PNG + légendes du pack  
- [ ] Story « Lien en bio »  
- [ ] Activer **profil pro** + catégorie « Produit/service »  
