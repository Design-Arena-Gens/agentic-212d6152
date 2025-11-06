"use client";

import { useMemo, useState } from 'react';
import { Loader2, Download, Wand2, Sparkles, FileText, Mail, MessageSquare } from 'lucide-react';
import { z } from 'zod';

const formSchema = z.object({
  businessName: z.string().min(1),
  industry: z.string().min(1),
  targetAudience: z.string().min(1),
  offer: z.string().min(1),
  tone: z.string().default('professional'),
  website: z.string().url().optional().or(z.literal('')),
});

export default function HomePage() {
  const [form, setForm] = useState<z.infer<typeof formSchema>>({
    businessName: '',
    industry: '',
    targetAudience: '',
    offer: '',
    tone: 'professional',
    website: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const canGenerate = useMemo(
    () => form.businessName && form.industry && form.targetAudience && form.offer,
    [form],
  );

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error('Failed to generate');
      const data = await res.json();
      setResult(data);
      setActiveTab('overview');
    } catch (err: any) {
      setError(err.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    if (!result?.personalized) return;
    const rows = [
      ['company', 'contact_name', 'title', 'email', 'personalized_intro', 'email_variant', 'cta'],
      ...result.personalized.map((r: any) => [
        r.company,
        r.contactName,
        r.title,
        r.email,
        r.personalizedIntro,
        r.emailVariant,
        r.cta,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leadgen_personalized_outreach.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <section className="md:col-span-1">
        <form onSubmit={handleGenerate} className="card space-y-4">
          <div>
            <label className="label">Business name</label>
            <input
              className="input"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              placeholder="Acme Solar"
            />
          </div>
          <div>
            <label className="label">Industry</label>
            <input
              className="input"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              placeholder="Solar energy, SaaS, Healthcare, etc."
            />
          </div>
          <div>
            <label className="label">Target audience</label>
            <input
              className="input"
              value={form.targetAudience}
              onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
              placeholder="e.g. Property managers in California"
            />
          </div>
          <div>
            <label className="label">Core offer</label>
            <input
              className="input"
              value={form.offer}
              onChange={(e) => setForm({ ...form, offer: e.target.value })}
              placeholder="e.g. Cut energy bills by 30% in 90 days"
            />
          </div>
          <div>
            <label className="label">Tone</label>
            <select
              className="input"
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="bold">Bold</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          <div>
            <label className="label">Website (optional)</label>
            <input
              className="input"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://acmesolar.com"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn w-full" disabled={!canGenerate || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating?
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" /> Generate assets
              </>
            )}
          </button>
        </form>
      </section>

      <section className="md:col-span-2">
        <div className="card">
          {!result ? (
            <div className="flex flex-col items-center py-16 text-center text-gray-600">
              <Sparkles className="mb-3 h-6 w-6 text-brand-600" />
              <p className="max-w-lg text-sm">
                Fill in your business details to generate ICP, messaging, cold emails, ads, landing
                copy, discovery questions, call script, and a personalized outreach CSV.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { id: 'overview', label: 'Overview', icon: FileText },
                  { id: 'emails', label: 'Cold Emails', icon: Mail },
                  { id: 'ads', label: 'Ad Headlines', icon: MessageSquare },
                  { id: 'landing', label: 'Landing Copy', icon: FileText },
                  { id: 'discovery', label: 'Discovery Qs', icon: MessageSquare },
                  { id: 'call', label: 'Call Script', icon: MessageSquare },
                  { id: 'csv', label: 'CSV Outreach', icon: Download },
                ].map((t) => (
                  <button
                    key={t.id}
                    className="tab"
                    data-active={activeTab === t.id}
                    onClick={() => setActiveTab(t.id)}
                  >
                    <t.icon className="h-4 w-4" /> {t.label}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-3 text-sm">
                  <h3 className="text-base font-semibold">Ideal Customer Profile</h3>
                  <pre className="whitespace-pre-wrap rounded-md bg-gray-50 p-3">{result.icp}</pre>

                  <h3 className="text-base font-semibold">Value Proposition</h3>
                  <pre className="whitespace-pre-wrap rounded-md bg-gray-50 p-3">{result.valueProp}</pre>
                </div>
              )}

              {activeTab === 'emails' && (
                <div className="space-y-3 text-sm">
                  {result.emails.map((e: string, i: number) => (
                    <div key={i} className="rounded-md border p-3">
                      <div className="mb-2 text-xs font-semibold text-gray-500">Variant {i + 1}</div>
                      <pre className="whitespace-pre-wrap">{e}</pre>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'ads' && (
                <ul className="list-disc space-y-1 pl-6 text-sm">
                  {result.adHeadlines.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}

              {activeTab === 'landing' && (
                <div className="space-y-3 text-sm">
                  <h3 className="text-base font-semibold">Hero</h3>
                  <pre className="whitespace-pre-wrap rounded-md bg-gray-50 p-3">{result.landing.hero}</pre>
                  <h3 className="text-base font-semibold">Sections</h3>
                  {result.landing.sections.map((s: any, i: number) => (
                    <div key={i} className="rounded-md border p-3">
                      <div className="mb-1 text-sm font-semibold">{s.title}</div>
                      <pre className="whitespace-pre-wrap">{s.body}</pre>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'discovery' && (
                <ol className="list-decimal space-y-1 pl-6 text-sm">
                  {result.discoveryQuestions.map((q: string, i: number) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
              )}

              {activeTab === 'call' && (
                <ul className="list-disc space-y-1 pl-6 text-sm">
                  {result.callScriptBullets.map((b: string, i: number) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}

              {activeTab === 'csv' && (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">Personalized outreach set</div>
                      <div className="text-xs text-gray-500">Rows: {result.personalized.length}</div>
                    </div>
                    <button className="btn" onClick={downloadCSV}>
                      <Download className="mr-2 h-4 w-4" /> Download CSV
                    </button>
                  </div>
                  <div className="overflow-auto rounded-md border">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          {['Company', 'Name', 'Title', 'Email', 'Intro', 'Variant', 'CTA'].map(
                            (h) => (
                              <th key={h} className="px-3 py-2 font-medium">
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {result.personalized.map((r: any, i: number) => (
                          <tr key={i} className="odd:bg-white even:bg-gray-50">
                            <td className="px-3 py-2">{r.company}</td>
                            <td className="px-3 py-2">{r.contactName}</td>
                            <td className="px-3 py-2">{r.title}</td>
                            <td className="px-3 py-2">{r.email}</td>
                            <td className="px-3 py-2">{r.personalizedIntro}</td>
                            <td className="px-3 py-2">{r.emailVariant}</td>
                            <td className="px-3 py-2">{r.cta}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
