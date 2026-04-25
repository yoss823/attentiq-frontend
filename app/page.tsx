'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const formats = [
    {
      id: 'video',
      icon: '🎬',
      title: 'Vidéo',
      description: 'TikTok, Instagram, YouTube ou upload',
      cta: 'Analyser une vidéo',
    },
    {
      id: 'text',
      icon: '📝',
      title: 'Texte',
      description: 'Copier-coller votre contenu',
      cta: 'Analyser du texte',
    },
    {
      id: 'image',
      icon: '🖼️',
      title: 'Image',
      description: 'JPG, PNG ou WebP',
      cta: 'Analyser une image',
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Attentiq</h1>
          <p className="text-gray-400 text-lg mb-2">
            Diagnostic d&apos;attention en 60 secondes
          </p>
          <p className="text-gray-500 text-sm">
            Comprenez pourquoi votre contenu perd l&apos;attention et comment le fixer.
          </p>
        </div>

        {/* Format Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => router.push('/analyze')}
              className="group bg-gray-900 border border-gray-700 rounded-2xl p-8 hover:border-white hover:bg-gray-800 transition-all text-left"
            >
              <div className="text-5xl mb-4">{format.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{format.title}</h2>
              <p className="text-gray-400 text-sm mb-6">{format.description}</p>
              <div className="inline-block bg-white text-black font-semibold py-2 px-4 rounded-lg group-hover:bg-gray-100 transition-colors text-sm">
                {format.cta} →
              </div>
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold mb-6">Comment ça marche</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-3">1️⃣</div>
              <p className="text-gray-300 text-sm">
                <strong>Soumettez</strong> votre contenu (vidéo, texte ou image)
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">2️⃣</div>
              <p className="text-gray-300 text-sm">
                <strong>Attendez</strong> 60 à 90 secondes pour l&apos;analyse
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">3️⃣</div>
              <p className="text-gray-300 text-sm">
                <strong>Recevez</strong> un diagnostic clair + 3 actions
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => router.push('/analyze')}
            className="bg-white text-black font-semibold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors text-lg mb-4"
          >
            Commencer l&apos;analyse →
          </button>
          <p className="text-gray-600 text-xs">
            Vos données ne sont pas stockées. Le contenu est analysé puis supprimé.
          </p>
        </div>
      </div>
    </main>
  );
}
