'use client';

import { useState, useEffect, useCallback } from 'react';
import { Repair, CATEGORY_LABELS, STATUS_LABELS, RepairCategory } from '@/lib/types';
import RepairModal from '@/components/RepairModal';

export default function ReceptionPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Repair | null>(null);
  const [tab, setTab] = useState<'pending' | 'overview'>('pending');

  const fetchRepairs = useCallback(async () => {
    const statusFilter = tab === 'pending' ? 'pending' : 'pending,approved,in_progress,completed,failed';
    const res = await fetch(`/api/repairs?status=${statusFilter}`);
    const data = await res.json();
    setRepairs(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    fetchRepairs();
    const interval = setInterval(fetchRepairs, 15000);
    return () => clearInterval(interval);
  }, [fetchRepairs]);

  async function handleUpdate(id: string, updates: Partial<Repair>) {
    await fetch(`/api/repairs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    await fetchRepairs();
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const categoryColor: Record<string, string> = {
    E: 'bg-yellow-50 text-yellow-700',
    M: 'bg-blue-50 text-blue-700',
    F: 'bg-emerald-50 text-emerald-700',
    N: 'bg-pink-50 text-pink-700',
    S: 'bg-purple-50 text-purple-700',
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🗃️</span>
        <div>
          <h1 className="text-2xl font-bold">Rezeption</h1>
          <p className="text-muted text-sm">Eingehende Aufträge prüfen und freigeben</p>
        </div>
        <div className="ml-auto">
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {repairs.filter(r => r.status === 'pending').length} ausstehend
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['pending', 'overview'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-primary text-white' : 'bg-card border border-border hover:bg-muted-bg'
            }`}
          >
            {t === 'pending' ? 'Ausstehende Anmeldungen' : 'Alle Aufträge'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : repairs.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <div className="text-5xl mb-4">✓</div>
          <p className="text-lg font-medium">Keine ausstehenden Anmeldungen</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted-bg border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Zeitpunkt</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Kunde</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Gegenstand</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Kategorie</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {repairs.map((r) => (
                  <tr key={r.id} className="hover:bg-muted-bg/50 transition-colors">
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString('de-DE')}<br/>
                      <span className="text-xs">{new Date(r.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.customer_firstname} {r.customer_lastname}</div>
                      <div className="text-xs text-muted">{r.customer_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.item}</div>
                      <div className="text-xs text-muted line-clamp-1">{r.damage_description}</div>
                    </td>
                    <td className="px-4 py-3">
                      {r.category ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColor[r.category]}`}>
                          {r.category} – {CATEGORY_LABELS[r.category as RepairCategory]}
                        </span>
                      ) : (
                        <span className="text-muted text-xs">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(r)}
                        className="text-primary hover:text-primary-dark text-sm font-medium underline"
                      >
                        {r.status === 'pending' ? 'Freigeben' : 'Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <RepairModal
          repair={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          mode="reception"
        />
      )}
    </div>
  );
}
