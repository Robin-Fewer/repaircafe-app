import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
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
          <div className="max-w-7xl mx-auto px-4 py-2">
            <Image
              src="/repair-cafe-logo.png"
              alt="Repair Café Bad Säckingen"
              width={220}
              height={60}
              className="brightness-0 invert sepia saturate-50 h-14 w-auto"
              priority
            />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
