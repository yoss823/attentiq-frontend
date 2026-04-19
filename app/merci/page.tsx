import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merci pour votre achat !',
  description: 'Votre commande a bien été reçue. Vous allez recevoir votre rapport Attentiq très prochainement.',
};

export default function MerciPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto w-full">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white hover:text-brand-300 transition-colors"
        >
          Attentiq
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full text-center">
          {/* Success icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-4">
            Merci pour votre achat ! 🎉
          </h1>

          <p className="text-slate-300 text-lg mb-3 leading-relaxed">
            Votre commande a bien été reçue et est en cours de traitement.
          </p>

          <p className="text-slate-400 mb-10 leading-relaxed">
            Vous recevrez votre rapport par e-mail dans les prochaines minutes.
            Si vous ne le voyez pas, pensez à vérifier vos spams.
          </p>

          {/* Next steps */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
            <h2 className="text-white font-semibold mb-4 text-center">
              Prochaines étapes
            </h2>
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-brand-600/40 border border-brand-500/50 flex items-center justify-center text-brand-300 text-sm font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium">{step.title}</p>
                    <p className="text-slate-400 text-sm">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Analyser une autre vidéo
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 px-6 py-3 rounded-xl transition-all"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6 text-center text-slate-500 text-sm">
        <p>
          Une question ?{' '}
          <a
            href="mailto:support@attentiq.com"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            support@attentiq.com
          </a>
        </p>
      </footer>
    </main>
  );
}

const steps = [
  {
    title: 'Confirmation par e-mail',
    description:
      'Un e-mail de confirmation vous a été envoyé avec le récapitulatif de votre commande.',
  },
  {
    title: 'Traitement de votre rapport',
    description:
      'Notre IA analyse votre vidéo. Cela prend généralement moins de 5 minutes.',
  },
  {
    title: 'Réception du rapport',
    description:
      'Vous recevrez votre rapport PDF complet par e-mail dès qu\'il sera prêt.',
  },
];
