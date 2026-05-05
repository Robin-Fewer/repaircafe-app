import Link from 'next/link';

const sections = [
  { href: '/anmeldung', label: 'Anmeldung', icon: '📋', desc: 'Neuen Reparaturauftrag anmelden' },
  { href: '/reception', label: 'Rezeption', icon: '🗃️', desc: 'Aufträge prüfen und Kategorien zuweisen' },
  { href: '/elektro', label: 'Elektro', icon: '⚡', desc: 'Elektroreparaturen (E)' },
  { href: '/mechanik', label: 'Mechanik', icon: '🔧', desc: 'Mechanische Reparaturen (M)' },
  { href: '/fahrrad', label: 'Fahrrad', icon: '🚲', desc: 'Fahrradreparaturen (F)' },
  { href: '/naehen', label: 'Nähen', icon: '🧵', desc: 'Näharbeiten (N)' },
  { href: '/schleifen', label: 'Schleifen', icon: '🔨', desc: 'Schleif- und Schärfarbeiten (S)' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊', desc: 'Statistiken und Auswertungen' },
];

export default function HomePage() {
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Willkommen beim Repair Café Bad Säckingen</h1>
        <p className="text-muted text-lg">Reparieren statt Wegwerfen – wählen Sie Ihren Bereich</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-card border-2 border-border rounded-xl p-5 transition-all shadow-sm hover:shadow-md hover:border-accent"
          >
            <div className="text-4xl mb-3">{s.icon}</div>
            <div className="font-bold text-lg text-foreground">{s.label}</div>
            <div className="text-sm text-muted mt-1">{s.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
