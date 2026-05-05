'use client';

import { useState } from 'react';
import { Repair, CATEGORY_LABELS, STATUS_LABELS, RepairCategory } from '@/lib/types';

interface RepairModalProps {
  repair: Repair;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Repair>) => Promise<void>;
  mode: 'reception' | 'department';
}

export default function RepairModal({ repair, onClose, onUpdate, mode }: RepairModalProps) {
  const [category, setCategory] = useState<RepairCategory | ''>(repair.category || '');
  const [notes, setNotes] = useState(repair.repair_notes || '');
  const [successful, setSuccessful] = useState<boolean | null>(repair.repair_successful);
  const [loading, setLoading] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmClose2, setConfirmClose2] = useState(false);

  async function handleApprove() {
    if (!category) return;
    setLoading(true);
    await onUpdate(repair.id, { status: 'approved', category: category as RepairCategory });
    setLoading(false);
    onClose();
  }

  async function handleStartWork() {
    setLoading(true);
    await onUpdate(repair.id, { status: 'in_progress', repair_notes: notes });
    setLoading(false);
    onClose();
  }

  async function handleSaveNotes() {
    setLoading(true);
    await onUpdate(repair.id, { repair_notes: notes });
    setLoading(false);
  }

  async function handleComplete() {
    if (successful === null) return;
    setLoading(true);
    await onUpdate(repair.id, {
      status: successful ? 'completed' : 'failed',
      repair_successful: successful,
      repair_notes: notes,
    });
    setLoading(false);
    onClose();
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-primary text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-lg font-bold">Reparaturauftrag</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[repair.status]}`}>
              {STATUS_LABELS[repair.status]}
            </span>
            {repair.category && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-light text-primary-dark">
                {CATEGORY_LABELS[repair.category as RepairCategory]}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 bg-muted-bg rounded-lg p-4">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Kunde</p>
              <p className="font-semibold">{repair.customer_firstname} {repair.customer_lastname}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">E-Mail</p>
              <p className="text-sm">{repair.customer_email}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Gegenstand</p>
              <p className="font-semibold">{repair.item}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Angemeldet</p>
              <p className="text-sm">{new Date(repair.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted uppercase tracking-wide">Schäden / Problembeschreibung</p>
              <p className="text-sm mt-1">{repair.damage_description}</p>
            </div>
          </div>

          {mode === 'reception' && repair.status === 'pending' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Kategorie zuweisen *</label>
              <div className="grid grid-cols-5 gap-2">
                {(['E', 'M', 'F', 'N', 'S'] as RepairCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-2 rounded-lg border-2 font-bold transition-all ${
                      category === cat
                        ? 'border-primary bg-primary text-white'
                        : 'border-border hover:border-primary text-foreground'
                    }`}
                  >
                    <div className="text-lg">{cat}</div>
                    <div className="text-xs font-normal">{CATEGORY_LABELS[cat]}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleApprove}
                disabled={!category || loading}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Wird freigegeben...' : 'Reparatur freigeben'}
              </button>
            </div>
          )}

          {mode === 'department' && (
            <div className="space-y-4">
              {repair.status === 'approved' && (
                <button
                  onClick={handleStartWork}
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Reparatur starten
                </button>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Notizen / Beschreibung</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Reparaturnotizen hinzufügen..."
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={loading}
                  className="mt-2 text-sm text-primary hover:text-primary-dark font-medium disabled:opacity-50"
                >
                  Notizen speichern
                </button>
              </div>

              {(repair.status === 'in_progress' || repair.status === 'approved') && (
                <div className="space-y-3 border-t border-border pt-4">
                  <p className="font-medium text-sm">Reparatur abschließen</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSuccessful(true)}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        successful === true
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-border hover:border-green-400'
                      }`}
                    >
                      ✓ Erfolgreich repariert
                    </button>
                    <button
                      onClick={() => setSuccessful(false)}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        successful === false
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-border hover:border-red-400'
                      }`}
                    >
                      ✗ Nicht reparierbar
                    </button>
                  </div>

                  {successful !== null && !confirmClose && (
                    <button
                      onClick={() => setConfirmClose(true)}
                      className="w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      Auftrag abschließen
                    </button>
                  )}

                  {confirmClose && !confirmClose2 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                      <p className="text-sm font-medium text-orange-800">
                        Bitte bestätigen: Auftrag wirklich abschließen?<br/>
                        <span className="text-orange-600">Eine E-Mail wird an {repair.customer_email} gesendet.</span>
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmClose(false)} className="flex-1 py-2 border border-border rounded-lg text-sm hover:bg-muted-bg transition-colors">
                          Abbrechen
                        </button>
                        <button onClick={() => setConfirmClose2(true)} className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-colors">
                          Ja, bestätigen
                        </button>
                      </div>
                    </div>
                  )}

                  {confirmClose2 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                      <p className="text-sm font-bold text-red-800">
                        ⚠ Letzte Bestätigung: Auftrag endgültig abschließen?
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => { setConfirmClose(false); setConfirmClose2(false); }} className="flex-1 py-2 border border-border rounded-lg text-sm hover:bg-muted-bg transition-colors">
                          Abbrechen
                        </button>
                        <button onClick={handleComplete} disabled={loading} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                          {loading ? 'Wird abgeschlossen...' : 'Endgültig abschließen'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
