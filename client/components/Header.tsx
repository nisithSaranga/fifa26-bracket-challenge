"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import MuteToggle from "./MuteToggle";

export default function Header() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="border-b border-line">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-lg tracking-tight">
          FIFA<span className="text-gold">26</span>
        </Link>

        <nav className="flex items-center gap-5 font-body text-sm">
        <MuteToggle />
          {loading ? null : user ? (
            <>
            <Link href="/my-predictions" className="text-ink-dim hover:text-gold transition-colors">
                My Predictions
              </Link>
              <span className="text-ink-dim">
                Hi, <span className="text-ink font-medium">{user.username}</span>
              </span>
              <button onClick={logout} className="text-ink-dim hover:text-gold transition-colors">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-ink-dim hover:text-gold transition-colors">Sign in</Link>
              <Link href="/register" className="bg-gold text-pitch font-display font-bold px-4 py-2 hover:bg-gold-deep transition-colors">
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}