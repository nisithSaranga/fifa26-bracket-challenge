"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Field from "@/components/Field";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can use only letters, numbers and underscores");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    try {
      await register(username, email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="card-angled bg-panel border border-line p-8 w-full max-w-sm">
        <h1 className="font-display font-black text-3xl mb-1">
          JOIN THE <span className="text-volt">CHALLENGE</span>
        </h1>
        <p className="text-ink-dim text-sm font-body mb-6">Make your picks. Climb the table.</p>

        <div className="space-y-4">
          <Field label="Username" value={username} onChange={setUsername} placeholder="nisith" />
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="min 8 characters" />
        </div>
        <p className="text-ink-dim text-xs font-body mt-3">
          Username: 3+ characters, letters, numbers and underscores only.
        </p>
        {error && <p className="text-red-400 text-sm font-body mt-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 w-full bg-volt text-pitch font-display font-bold tracking-wide py-3
                     hover:bg-volt-deep transition-colors disabled:opacity-50"
        >
          {submitting ? "CREATING..." : "CREATE ACCOUNT"}
        </button>

        <p className="text-ink-dim text-sm font-body mt-6 text-center">
          Already playing?{" "}
          <Link href="/login" className="text-volt hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}