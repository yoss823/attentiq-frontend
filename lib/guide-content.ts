export type GuideFormatKey = "video" | "text" | "image";

export function parseGuideFormatParam(raw: string | null | undefined): GuideFormatKey {
  if (raw === "text" || raw === "image") return raw;
  return "video";
}

export type GuideCopy = {
  format: GuideFormatKey;
  label: string;
  heroSubtitle: string;
  steps: { number: string; title: string; description: string }[];
  reportContains: string[];
  ctaTitle: string;
  ctaBody: string;
  ctaHref: string;
  ctaButton: string;
  footerTagline: string;
};

const SHARED_LIMITATIONS = [
  "Ce n'est pas une prédiction de vues",
  "Ce n'est pas une promesse de viralité",
  "Ce n'est pas une lecture des algorithmes internes des plateformes — c'est une lecture de votre contenu",
];

const VIDEO: GuideCopy = {
  format: "video",
  label: "Vidéo courte",
  heroSubtitle:
    "3 étapes. Environ une minute. Un diagnostic d'attention sur votre contenu court (moins de 60 s pour l'URL).",
  steps: [
    {
      number: "01",
      title: "Vous collez une URL publique ou importez un fichier",
      description:
        "TikTok, YouTube Shorts, Reel Instagram, Snapchat Spotlight, ou fichier MP4/MOV/WebM — une vidéo courte.",
    },
    {
      number: "02",
      title: "Attentiq lit le texte et inspecte le signal disponible",
      description:
        "Texte a l'ecran et audio systematiques ; visuel lorsque les images sont exploitables. Reperage des ruptures d'attention quand le signal le permet.",
    },
    {
      number: "03",
      title: "Vous recevez un diagnostic actionnable",
      description:
        "Score, résumé, levier principal, actions concrètes. Le gratuit est un teaser ; le complet détaille timeline et plan.",
    },
  ],
  reportContains: [
    "Un score global de tenue d'attention (1 à 10)",
    "Un résumé qui dit ce qui aide et ce qui freine",
    "Les moments de rupture quand la chronologie est disponible (sinon mention explicite)",
    "La règle de décrochage principale telle que le modèle la lit",
    "La perception « spectateur » telle qu'inférée du contenu",
    "Des actions correctives concrètes pour la prochaine publication",
  ],
  ctaTitle: "Prêt à voir ce que cache votre vidéo ?",
  ctaBody:
    "Collez une URL ou importez un fichier. L'analyse prend en général 60 à 90 secondes.",
  ctaHref: "/analyze",
  ctaButton: "Analyser une vidéo gratuitement",
  footerTagline: "Attentiq — diagnostic d'attention pour vidéos courtes",
};

const TEXT: GuideCopy = {
  format: "text",
  label: "Texte",
  heroSubtitle:
    "Même esprit que la vidéo : un avis structuré sur ce qui retient ou perd l'attention — pour posts, scripts, emails.",
  steps: [
    {
      number: "01",
      title: "Vous collez votre texte (post, script, accroche…)",
      description:
        "Jusqu'à la limite indiquée sur la page ; pas besoin de compte pour l'aperçu gratuit.",
    },
    {
      number: "02",
      title: "Attentiq lit votre texte: clarte, promesse, preuve, CTA",
      description:
        "Densite, rythme de lecture, risques de confusion ou d'abandon avant la fin.",
    },
    {
      number: "03",
      title: "Vous recevez un diagnostic actionnable",
      description:
        "Score, résumé, levier principal, actions. Le gratuit reste limité ; le complet approfondit.",
    },
  ],
  reportContains: [
    "Un score global de clarté / tenue d'attention (1 à 10)",
    "Un résumé : ce qui accroche, ce qui fatigue, ce qui manque",
    "Les passages à risque (lourdeur, promesse floue, CTA absent…)",
    "La règle dominante que le modèle retient pour votre texte",
    "La perception lecteur inférée",
    "Des actions de réécriture priorisées",
  ],
  ctaTitle: "Prêt à auditer votre texte ?",
  ctaBody: "Allez sur l'analyse texte : collage, diagnostic, même logique teaser / complet.",
  ctaHref: "/text",
  ctaButton: "Analyser un texte gratuitement",
  footerTagline: "Attentiq — diagnostic d'attention pour textes",
};

const IMAGE: GuideCopy = {
  format: "image",
  label: "Image",
  heroSubtitle:
    "Pour créas, slides, pubs statiques : hiérarchie, message, friction visuelle — même cadre teaser / complet.",
  steps: [
    {
      number: "01",
      title: "Vous importez une image (JPEG, PNG, WebP)",
      description:
        "Une créa à la fois ; idéal pour tester une pub, une vignette ou un visuel social.",
    },
    {
      number: "02",
      title: "Attentiq lit le visuel et le texte present dans l'image",
      description:
        "Point focal, lisibilite, surcharge, CTA visible ou non, coherence avec la promesse.",
    },
    {
      number: "03",
      title: "Vous recevez un diagnostic actionnable",
      description:
        "Score, résumé, levier principal, pistes de correction visuelle ou de message.",
    },
  ],
  reportContains: [
    "Un score global d'efficacité attentionnelle du visuel (1 à 10)",
    "Un résumé : ce qui attire le regard, ce qui noie le message",
    "Les zones ou messages à risque (preuve, CTA, hiérarchie)",
    "La règle dominante lue sur l'image",
    "La perception « première seconde » inférée",
    "Des actions concrètes pour la prochaine itération visuelle",
  ],
  ctaTitle: "Prêt à tester votre visuel ?",
  ctaBody: "Ouvrez l'analyse image : upload, diagnostic, même logique d'aperçu gratuit.",
  ctaHref: "/images",
  ctaButton: "Analyser une image gratuitement",
  footerTagline: "Attentiq — diagnostic d'attention pour images",
};

const BY_FORMAT: Record<GuideFormatKey, GuideCopy> = {
  video: VIDEO,
  text: TEXT,
  image: IMAGE,
};

export function getGuideCopy(format: GuideFormatKey): GuideCopy {
  return BY_FORMAT[format];
}

export function getSharedLimitations(): string[] {
  return SHARED_LIMITATIONS;
}
