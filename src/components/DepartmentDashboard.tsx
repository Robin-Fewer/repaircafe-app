'use client';

import { useState, useEffect, useCallback } from 'react';
import { Repair, RepairCategory, CATEGORY_LABELS, STATUS_LABELS } from '@/lib/types';
import RepairModal from './RepairModal';

interface DepartmentDashboardProps {
  category: RepairCategory;
  icon: string;
}

export default function DepartmentDashboard({ category, icon }: DepartmentDashboardProps) {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Repair | null>(null);

  const fetchRepairs = useCallback(async () => {
    const res = await fetch(`/api/repairs?category=${category}&status=approved,in_progress`);
    const data = await res.json();
    setRepairs(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [category]);

  useEffect(() => {
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

  const approved = repairs.filter((r) => r.status === 'approved');
  const inProgress = repairs.filter((r) => r.status === 'in_progress');

  const statusColor: Record<string, string> = {
    approved: 'border-l-blue-500',
    in_progress: 'border-l-orange-500',
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{CATEGORY_LABELS[category]}</h1>
          <p className="text-muted text-sm">Reparatur-Dashboard – Kategorie {category}</p>
        </div>
        <div className="ml-auto flex gap-3 text-sm">
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
            {approved.length} Neu
          </div>
          <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-medium">
            {inProgress.length} In Arbeit
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : repairs.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <div className="text-5xl mb-4">✓</div>
          <p className="text-lg font-medium">Keine offenen Aufträge</p>
          <p className="text-sm">Alle Reparaturen in dieser Abteilung sind abgeschlossen.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {approved.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Neue Aufträge ({approved.length})</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {approved.map((r) => (
                  <RepairCard key={r.id} repair={r} onClick={() => setSelected(r)} colorClass={statusColor.approved} />
                ))}
              </div>
            </div>
          )}
          {inProgress.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">In Bearbeitung ({inProgress.length})</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inProgress.map((r) => (
                  <RepairCard key={r.id} repair={r} onClick={() => setSelected(r)} colorClass={statusColor.in_progress} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selected && (
        <RepairModal
          repair={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          mode="department"
        />
      )}
    </div>
  );
}

function RepairCard({ repair, onClick, colorClass }: { repair: Repair; onClick: () => void; colorClass: string }) {
  return (
    <button
      onClick={onClick}
      className={`bg-card rounded-xl border-l-4 ${colorClass} shadow-sm hover:shadow-md transition-shadow p-4 text-left w-full`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-semibold text-foreground">{repair.item}</span>
        <span className="text-xs text-muted">{new Date(repair.created_at).toLocaleDateString('de-DE')}</span>
      </div>
      <p className="text-sm text-muted mb-2 line-clamp-2">{repair.damage_description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{repair.customer_firstname} {repair.customer_lastname}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          repair.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {STATUS_LABELS[repair.status]}
        </span>
      </div>
      {repair.repair_notes && (
        <p className="text-xs text-muted mt-2 italic line-clamp-1">📝 {repair.repair_notes}</p>
      )}
    </button>
  );
}
