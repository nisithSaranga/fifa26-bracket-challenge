import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";

/*
 * next/font downloads the fonts at BUILD time and self-hosts them —
 * no request to Google at runtime, no layout shift. Each font exposes
 * a CSS variable that globals.css maps into the type roles.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FIFA 2026 Bracket Challenge",
  description:
    "Predict the 2026 World Cup — group stages, brackets, and every match. Live scores, leaderboards, and bragging rights.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}