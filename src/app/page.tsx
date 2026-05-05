import Link from 'next/link';

const sections = [
  { href: '/anmeldung', label: 'Anmeldung', icon: '📋', desc: 'Neuen Reparaturauftrag anmelden', color: 'bg-green-50 border-green-200 hover:border-green-400' },
  { href: '/reception', label: 'Rezeption', icon: '🗃️', desc: 'Aufträge prüfen und Kategorien zuweisen', color: 'bg-blue-50 border-blue-200 hover:border-blue-400' },
  { href: '/elektro', label: 'Elektro', icon: '⚡', desc: 'Elektroreparaturen (E)', color: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400' },
  { href: '/mechanik', label: 'Mechanik', icon: '🔧', desc: 'Mechanische Reparaturen (M)', color: 'bg-sky-50 border-sky-200 hover:border-sky-400' },
  { href: '/fahrrad', label: 'Fahrrad', icon: '🚲', desc: 'Fahrradreparaturen (F)', color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400' },
  { href: '/naehen', label: 'Nähen', icon: '🧵', desc: 'Näharbeiten (N)', color: 'bg-pink-50 border-pink-200 hover:border-pink-400' },
  { href: '/schleifen', label: 'Schleifen', icon: '🔨', desc: 'Schleif- und Schärfarbeiten (S)', color: 'bg-purple-50 border-purple-200 hover:border-purple-400' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊', desc: 'Statistiken und Auswertungen', color: 'bg-gray-50 border-gray-200 hover:border-gray-400' },
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
            className={`border-2 rounded-xl p-5 transition-all shadow-sm hover:shadow-md ${s.color}`}
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
