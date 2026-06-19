"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import MuteToggle from "./MuteToggle";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/leaderboard", label: "Leaderboard" },
    ...(user ? [{ href: "/my-predictions", label: "My Picks" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line backdrop-blur-md bg-pitch/70">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-xl tracking-tight">
          FIFA<span className="text-gradient-volt">26</span>
        </Link>

        <nav className="flex items-center gap-2 font-body text-sm">
          <MuteToggle />

          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-md transition-all ${
                  active
                    ? "nav-pill text-white"
                    : "text-ink-dim hover:text-volt-bright"
                }`}
              >
                {l.label}
              </Link>
            );
          })}

          {loading ? null : user ? (
            <div className="flex items-center gap-3 ml-2">
              <span className="font-display font-bold text-volt-bright">{user.username}</span>
              <button
                onClick={logout}
                className="text-ink-dim hover:text-live transition-colors text-xs"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login" className="text-ink-dim hover:text-volt-bright transition-colors px-3 py-2">
                Sign in
              </Link>
              <Link href="/register" className="btn-volt text-white font-display font-bold px-4 py-2 rounded-md">
                Join
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}