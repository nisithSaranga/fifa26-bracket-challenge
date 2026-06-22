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
    { href: "/bracket", label: "Bracket" },
    { href: "/leaderboard", label: "Leaderboard" },
    ...(user ? [{ href: "/my-predictions", label: "My Picks" }] : []),
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line backdrop-blur-md bg-pitch/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        <Link href="/" className="font-display font-black text-xl tracking-tight shrink-0">
          FIFA<span className="text-gradient-volt">26</span>
        </Link>

        <nav className="flex items-center gap-2 font-body text-sm">
          <MuteToggle />

          {/* Desktop nav links — hidden on mobile, where the BottomBar handles navigation */}
          <div className="hidden sm:flex items-center gap-2">
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
          </div>

          {loading ? null : user ? (
            <div className="flex items-center gap-2 sm:gap-3 sm:ml-2">
              <span className="font-display font-bold text-volt-bright truncate max-w-[100px]">
                {user.username}
              </span>
              <button
                onClick={logout}
                className="text-ink-dim hover:text-live transition-colors text-xs shrink-0"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 sm:ml-2">
              <Link
                href="/login"
                className="text-ink-dim hover:text-volt-bright transition-colors px-2 sm:px-3 py-2 shrink-0"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-volt text-white font-display font-bold px-3 sm:px-4 py-2 rounded-md shrink-0"
              >
                Join
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}