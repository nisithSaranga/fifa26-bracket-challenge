import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/Header";
import { AudioProvider } from "@/lib/audio-context";
import Footer from "@/components/Footer";
import BottomBar from "@/components/BottomBar";

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
      <body className="antialiased">
    <AuthProvider>
          <AudioProvider>
            <Header />
            {children}
            <Footer />
            <BottomBar />
          </AudioProvider>
        </AuthProvider>
        </body>
    </html>
  );
}