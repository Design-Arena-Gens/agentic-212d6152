import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LeadGen Agent ? Universal AI Lead Generation',
  description: 'Generate ICP, messaging, outreach, and assets for any business.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="min-h-screen text-gray-900 antialiased">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-brand-600">LeadGen</span> Agent
            </h1>
            <p className="text-sm text-gray-600">
              AI agent that generates ICP, messaging, outreach, and assets for any business.
            </p>
          </header>
          {children}
          <footer className="mt-16 border-t pt-6 text-xs text-gray-500">
            Built for Vercel deployment. Optional LLM via OPENAI_API_KEY.
          </footer>
        </div>
      </body>
    </html>
  );
}
