'use client';

import { useState, useEffect, useCallback } from 'react';
import { Repair, CATEGORY_LABELS, RepairCategory } from '@/lib/types';


function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className={`bg-card rounded-xl border border-border p-5 shadow-sm`}>
      <p className="text-sm text-muted">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color || 'text-foreground'}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [today] = useState(new Date().toISOString().split('T')[0]);
  const [year] = useState(new Date().getFullYear().toString());

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      setPwError('Falsches Passwort.');
    }
  }

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/repairs');
    const data = await res.json();
    setRepairs(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) {
      fetchAll();
      const i = setInterval(fetchAll, 30000);
      return () => clearInterval(i);
    }
  }, [authed, fetchAll]);

  async function handleExport(type: string) {
    setExportLoading(type);
    const params = new URLSearchParams({ type });
    if (type === 'daily') params.set('date', today);
    if (type === 'yearly') params.set('year', year);
    const res = await fetch(`/api/export?${params}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'daily' ? `Tagesabschluss_${today}.xlsx` : type === 'yearly' ? `Jahresabschluss_${year}.xlsx` : 'Alle_Reparaturen.xlsx';
    a.click();
    URL.revokeObjectURL(url);
    setExportLoading(null);
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto mt-16">
        <div className="bg-card rounded-xl border border-border shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔒</div>
            <h1 className="text-xl font-bold">Dashboard – Zugang</h1>
            <p className="text-sm text-muted mt-1">Bitte geben Sie das Passwort ein</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setPwError(''); }}
              className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Passwort"
              autoFocus
            />
            {pwError && <p className="text-red-600 text-sm">{pwError}</p>}
            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-semibold transition-colors">
              Einloggen
            </button>
          </form>
        </div>
      </div>
    );
  }

  const total = repairs.length;
  const completed = repairs.filter((r) => r.status === 'completed').length;
  const failed = repairs.filter((r) => r.status === 'failed').length;
  const inProgress = repairs.filter((r) => r.status === 'in_progress').length;
  const pending = repairs.filter((r) => r.status === 'pending').length;
  const successRate = completed + failed > 0 ? Math.round((completed / (completed + failed)) * 100) : 0;

  const todayRepairs = repairs.filter((r) => r.created_at.startsWith(today));
  const yearRepairs = repairs.filter((r) => r.created_at.startsWith(year));

  const byCategory = (['E', 'M', 'F', 'N', 'S'] as RepairCategory[]).map((cat) => {
    const catList = repairs.filter((r) => r.category === cat);
    const catCompleted = catList.filter((r) => r.status === 'completed').length;
    const catFailed = catList.filter((r) => r.status === 'failed').length;
    return {
      cat,
      label: CATEGORY_LABELS[cat],
      total: catList.length,
      completed: catCompleted,
      failed: catFailed,
      inProgress: catList.filter((r) => r.status === 'in_progress').length,
      rate: catCompleted + catFailed > 0 ? Math.round((catCompleted / (catCompleted + catFailed)) * 100) : null,
    };
  });

  const catColors: Record<RepairCategory, string> = {
    E: 'bg-yellow-400',
    M: 'bg-blue-400',
    F: 'bg-emerald-400',
    N: 'bg-pink-400',
    S: 'bg-purple-400',
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">📊</span>
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted text-sm">Live-Statistiken – automatische Aktualisierung alle 30 Sekunden</p>
        </div>
        <button onClick={() => setAuthed(false)} className="ml-auto text-sm text-muted hover:text-foreground underline">
          Abmelden
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-base font-semibold text-muted uppercase tracking-wide mb-3">Gesamt (alle Zeit)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Gesamt" value={total} />
              <StatCard label="Ausstehend" value={pending} color="text-yellow-600" />
              <StatCard label="In Bearbeitung" value={inProgress} color="text-orange-600" />
              <StatCard label="Erfolgreich" value={completed} color="text-green-600" />
              <StatCard label="Nicht rep." value={failed} color="text-red-600" />
              <StatCard label="Erfolgsquote" value={`${successRate}%`} color="text-primary" sub={`${completed} von ${completed + failed} abgeschl.`} />
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-muted uppercase tracking-wide mb-3">Heute ({new Date(today).toLocaleDateString('de-DE')})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Anmeldungen" value={todayRepairs.length} />
              <StatCard label="Abgeschlossen" value={todayRepairs.filter(r => r.status === 'completed').length} color="text-green-600" />
              <StatCard label="Nicht rep." value={todayRepairs.filter(r => r.status === 'failed').length} color="text-red-600" />
              <StatCard label="Noch offen" value={todayRepairs.filter(r => ['pending','approved','in_progress'].includes(r.status)).length} color="text-orange-600" />
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-muted uppercase tracking-wide mb-3">Jahr {year}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Reparaturen" value={yearRepairs.length} />
              <StatCard label="Erfolgreich" value={yearRepairs.filter(r => r.status === 'completed').length} color="text-green-600" />
              <StatCard label="Nicht rep." value={yearRepairs.filter(r => r.status === 'failed').length} color="text-red-600" />
              <StatCard
                label="Erfolgsquote"
                value={(() => {
                  const c = yearRepairs.filter(r => r.status === 'completed').length;
                  const f = yearRepairs.filter(r => r.status === 'failed').length;
                  return c + f > 0 ? `${Math.round(c / (c + f) * 100)}%` : '–';
                })()}
                color="text-primary"
              />
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-muted uppercase tracking-wide mb-3">Nach Kategorie (gesamt)</h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted-bg border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-muted">Kategorie</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted">Gesamt</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted">In Arbeit</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted">Erfolgreich</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted">Nicht rep.</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted">Erfolgsquote</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {byCategory.map(({ cat, label, total: catTotal, completed: catC, failed: catF, inProgress: catIP, rate }) => (
                    <tr key={cat} className="hover:bg-muted-bg/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${catColors[cat]}`} />
                          <span className="font-medium">{cat} – {label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{catTotal}</td>
                      <td className="px-4 py-3 text-right text-orange-600">{catIP}</td>
                      <td className="px-4 py-3 text-right text-green-600">{catC}</td>
                      <td className="px-4 py-3 text-right text-red-600">{catF}</td>
                      <td className="px-4 py-3 text-right">
                        {rate !== null ? (
                          <span className={`font-medium ${rate >= 70 ? 'text-green-600' : rate >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                            {rate}%
                          </span>
                        ) : '–'}
                      </td>
                      <td className="px-4 py-3">
                        {catTotal > 0 && (
                          <div className="flex h-2 rounded-full overflow-hidden bg-muted-bg w-20 ml-auto">
                            <div className="bg-green-400" style={{ width: `${catTotal > 0 ? (catC / catTotal) * 100 : 0}%` }} />
                            <div className="bg-orange-400" style={{ width: `${catTotal > 0 ? (catIP / catTotal) * 100 : 0}%` }} />
                            <div className="bg-red-400" style={{ width: `${catTotal > 0 ? (catF / catTotal) * 100 : 0}%` }} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-muted uppercase tracking-wide mb-3">Export</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleExport('daily')}
                disabled={!!exportLoading}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                📥 {exportLoading === 'daily' ? 'Wird exportiert...' : `Tagesabschluss ${new Date(today).toLocaleDateString('de-DE')}`}
              </button>
              <button
                onClick={() => handleExport('yearly')}
                disabled={!!exportLoading}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                📥 {exportLoading === 'yearly' ? 'Wird exportiert...' : `Jahresabschluss ${year}`}
              </button>
              <button
                onClick={() => handleExport('all')}
                disabled={!!exportLoading}
                className="bg-card hover:bg-muted-bg border border-border text-foreground px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                📥 {exportLoading === 'all' ? 'Wird exportiert...' : 'Alle Reparaturen'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
