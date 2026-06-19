"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Fixed app-style bottom navigation — visible on mobile only
 * (hidden on sm+ where the sticky header handles navigation).
 */
export default function BottomBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = [
    { href: "/", label: "Home", icon: "⌂" },
    { href: "/leaderboard", label: "Ranks", icon: "≡" },
    ...(user
      ? [{ href: "/my-predictions", label: "Picks", icon: "◎" }]
      : [{ href: "/login", label: "Sign in", icon: "→" }]),
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-pitch/90 backdrop-blur-md">
      <div className="flex items-center justify-around h-16">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                active ? "text-volt-bright" : "text-ink-dim"
              }`}
            >
              <span className="text-xl leading-none">{it.icon}</span>
              <span className="text-[10px] font-body tracking-wide">{it.label}</span>
              {active && <span className="absolute bottom-0 h-0.5 w-10 bg-volt rounded-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}