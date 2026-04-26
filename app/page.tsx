import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Attentiq — Comprenez ce qui capte l\'attention sur TikTok',
  description:
    'Diagnostic structurel de la rétention sur les formats courts. Analysez vos vidéos TikTok et comprenez pourquoi votre audience décroche.',
};

const features = [
  {
    icon: '🎯',
    title: 'Diagnostic de rétention',
    description:
      'Identifiez les secondes exactes où votre audience décroche et pourquoi.',
  },
  {
    icon: '🔍',
    title: 'Analyse frame par frame',
    description:
      'Transcription audio, analyse visuelle, détection des moments de décrochage.',
  },
  {
    icon: '⚡',
    title: 'Actions concrètes',
    description:
      'Recevez 3 à 5 recommandations précises pour vos prochaines vidéos.',
  },
];

const socialProof = [
  { handle: '@marieclaire_content', followers: '142K', niche: 'Lifestyle' },
  { handle: '@thomasfitpro', followers: '89K', niche: 'Fitness' },
  { handle: '@juliettecooks', followers: '203K', niche: 'Food' },
  { handle: '@alexbusiness', followers: '67K', niche: 'Business' },
  { handle: '@sophiavlog', followers: '315K', niche: 'Vlog' },
  { handle: '@maximetech', followers: '54K', niche: 'Tech' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight text-white">
          Attentiq
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/guide"
            className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block"
          >
            Comment ça marche
          </Link>
          <Link
            href="/analyze"
            className="text-sm font-semibold text-brand-300 hover:text-white transition-colors"
          >
            Analyser une vidéo →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-950/60 border border-brand-800/50 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span className="text-xs font-semibold text-brand-300 uppercase tracking-widest">
            Diagnostic IA en 90 secondes
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
          Comprenez ce qui capte{' '}
          <span className="text-brand-300">l&apos;attention</span> sur TikTok
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Attentiq analyse vos vidéos et identifie les secondes exactes où votre
          audience décroche — avec les causes et les actions pour y remédier.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold py-4 px-8 rounded-xl transition-colors text-base shadow-lg shadow-brand-900/50"
          >
            Analyser une vidéo/photo/texte par exemple
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/guide"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Comment ça marche ?
          </Link>
        </div>
      </section>

      {/* Features Grid */}
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
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-8">
          Utilisé par des créateurs TikTok
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {socialProof.map((creator) => (
            <div
              key={creator.handle}
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
            >
              <p className="text-xs font-semibold text-brand-300 truncate">
                {creator.handle}
              </p>
              <p className="text-xs text-slate-500 mt-1">{creator.followers}</p>
              <p className="text-xs text-slate-600">{creator.niche}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-brand-950/60 border border-brand-800/50 rounded-3xl p-10 sm:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Prêt à comprendre votre audience ?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Obtenez un diagnostic complet de votre vidéo TikTok en moins de 2
            minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold py-4 px-8 rounded-xl transition-colors text-base shadow-lg shadow-brand-900/50"
            >
              Analyser une vidéo/photo/texte par exemple
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/checkout/rapport-complet"
              className="text-sm font-medium text-brand-300 hover:text-white border border-brand-800 hover:border-brand-500 rounded-xl px-6 py-4 transition-all"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-white">Attentiq</span>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/guide" className="hover:text-white transition-colors">
              Guide
            </Link>
            <Link
              href="/transparence"
              className="hover:text-white transition-colors"
            >
              Transparence
            </Link>
            <Link
              href="/checkout/rapport-complet"
              className="hover:text-white transition-colors"
            >
              Tarifs
            </Link>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Attentiq
          </p>
        </div>
      </footer>
    </main>
  );
}

