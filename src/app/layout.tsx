import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Repair Café Bad Säckingen",
  description: "Reparaturverwaltung für das Repair Café Bad Säckingen",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground">
        <header className="bg-primary shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="16" fill="#c9a87c" fillOpacity="0.25" stroke="#c9a87c" strokeWidth="1.5"/>
              <path d="M12 18c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6z" fill="#c9a87c" fillOpacity="0.3"/>
              <path d="M18 10v2M18 24v2M10 18h2M24 18h2" stroke="#c9a87c" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="3.5" fill="#c9a87c"/>
            </svg>
            <div>
              <div className="font-bold text-xl leading-tight text-accent">Repair Café</div>
              <div className="text-xs leading-tight text-accent/70">Bad Säckingen</div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
