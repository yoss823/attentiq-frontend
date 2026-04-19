import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Attentiq — Analyse TikTok par IA',
  description:
    'Découvrez ce qui capte vraiment l\'attention sur TikTok. Analysez n\'importe quelle vidéo en quelques secondes grâce à notre IA.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight text-white">
          Attentiq
        </span>
        <Link
          href="/analyze"
          className="text-sm font-medium text-brand-300 hover:text-white transition-colors"
        >
          Analyser une vidéo →
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-900/60 border border-brand-700/50 rounded-full px-4 py-1.5 text-sm text-brand-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          Propulsé par l&apos;IA
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-balance mb-6">
          Comprenez ce qui{' '}
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            capte l&apos;attention
          </span>{' '}
          sur TikTok
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
          Attentiq analyse vos vidéos TikTok seconde par seconde et identifie
          les moments clés qui retiennent — ou perdent — votre audience. Prenez
          des décisions créatives basées sur des données réelles.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-brand-900/50 hover:shadow-brand-700/50 hover:-translate-y-0.5"
          >
            Analyser une vidéo gratuitement
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link
            href="/checkout/rapport-complet"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium px-6 py-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-all duration-200"
          >
            Voir les tarifs
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <p className="text-slate-500 text-sm mb-8 uppercase tracking-widest font-medium">
          Ils utilisent Attentiq
        </p>
        <div className="flex flex-wrap justify-center gap-8 text-slate-400">
          {['@creator_pro', '@viral_studio', '@content_lab', '@tiktok_growth'].map(
            (handle) => (
              <span key={handle} className="text-lg font-semibold opacity-50">
                {handle}
              </span>
            )
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-r from-brand-700 to-purple-700 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à comprendre votre audience ?
          </h2>
          <p className="text-brand-200 mb-8 text-lg">
            Collez l&apos;URL d&apos;une vidéo TikTok et obtenez votre analyse en moins
            d&apos;une minute.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-brand-50 transition-colors shadow-xl"
          >
            Commencer maintenant — c&apos;est gratuit
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Attentiq. Tous droits réservés.</p>
      </footer>
    </main>
  );
}

const features = [
  {
    icon: '🎯',
    title: 'Analyse de l\'attention',
    description:
      'Notre IA identifie seconde par seconde les moments où votre audience décroche ou s\'engage davantage.',
  },
  {
    icon: '📊',
    title: 'Rapport détaillé',
    description:
      'Recevez un rapport complet avec des recommandations concrètes pour améliorer vos prochaines vidéos.',
  },
  {
    icon: '⚡',
    title: 'Résultats en 60 secondes',
    description:
      'Collez une URL TikTok et obtenez votre analyse complète en moins d\'une minute, sans inscription.',
  },
];
