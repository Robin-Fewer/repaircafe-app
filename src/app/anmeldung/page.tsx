'use client';

import { useState } from 'react';

export default function AnmeldungPage() {
  const [form, setForm] = useState({
    customer_lastname: '',
    customer_firstname: '',
    customer_email: '',
    item: '',
    damage_description: '',
    signature_agreed: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.signature_agreed) {
      setError('Bitte bestätigen Sie die Risikohinweise.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Ein Fehler ist aufgetreten.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-primary mb-3">Anmeldung erfolgreich!</h2>
        <p className="text-muted mb-6">
          Ihre Reparaturanfrage wurde erfasst. Bitte bringen Sie Ihren Gegenstand zur Rezeption.
          Sie werden per E-Mail benachrichtigt, sobald die Reparatur abgeschlossen ist.
        </p>
        <button
          onClick={() => { setSuccess(false); setForm({ customer_lastname: '', customer_firstname: '', customer_email: '', item: '', damage_description: '', signature_agreed: false }); }}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Weitere Anmeldung
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-2">Reparatur anmelden</h1>
      <p className="text-muted mb-6">Füllen Sie das Formular aus, um Ihren Gegenstand zur Reparatur anzumelden.</p>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="customer_firstname">Vorname *</label>
            <input
              id="customer_firstname"
              name="customer_firstname"
              type="text"
              required
              value={form.customer_firstname}
              onChange={handleChange}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Max"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="customer_lastname">Nachname *</label>
            <input
              id="customer_lastname"
              name="customer_lastname"
              type="text"
              required
              value={form.customer_lastname}
              onChange={handleChange}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Mustermann"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="customer_email">E-Mail-Adresse *</label>
          <input
            id="customer_email"
            name="customer_email"
            type="email"
            required
            value={form.customer_email}
            onChange={handleChange}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="max.mustermann@beispiel.de"
          />
          <p className="text-xs text-muted mt-1">Wir benachrichtigen Sie hier, wenn die Reparatur abgeschlossen ist.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="item">Gegenstand *</label>
          <input
            id="item"
            name="item"
            type="text"
            required
            value={form.item}
            onChange={handleChange}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="z.B. Tischlampe, Kaffeemaschine, Hose..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="damage_description">Beschreibung der Schäden / des Problems *</label>
          <textarea
            id="damage_description"
            name="damage_description"
            required
            rows={4}
            value={form.damage_description}
            onChange={handleChange}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Beschreiben Sie bitte möglichst genau, was defekt ist und wie es dazu gekommen ist..."
          />
        </div>

        <div className="bg-muted-bg rounded-lg p-4 border border-border">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="signature_agreed"
              checked={form.signature_agreed}
              onChange={handleChange}
              className="mt-0.5 w-5 h-5 rounded border-border text-primary focus:ring-primary flex-shrink-0"
            />
            <span className="text-sm text-foreground">
              <strong>Risikohinweis – Digitale Unterschrift:</strong> Ich bin mir bewusst, dass eine Reparatur nicht immer erfolgreich sein kann.
              Ich akzeptiere das Risiko, dass mein Gegenstand möglicherweise nicht repariert werden kann.
              Das Repair Café Bad Säckingen übernimmt keine Haftung für Schäden, die im Rahmen des Reparaturversuchs entstehen können.
            </span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Wird angemeldet...' : 'Reparatur anmelden'}
        </button>
      </form>
    </div>
  );
}
