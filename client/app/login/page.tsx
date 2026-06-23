"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Field from "@/components/Field";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await login(emailOrUsername, password);
      router.push("/"); // success -> home
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="card-angled bg-panel border border-line p-8 w-full max-w-sm">
        <h1 className="font-display font-black text-3xl mb-1">
          SIGN <span className="text-volt">IN</span>
        </h1>
        <p className="text-ink-dim text-sm font-body mb-6">Back to the pitch.</p>

        <div className="space-y-4">
          <Field label="Email or Username" value={emailOrUsername} onChange={setEmailOrUsername} placeholder="nisith" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        </div>

        {error && <p className="text-red-400 text-sm font-body mt-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 w-full bg-volt text-pitch font-display font-bold tracking-wide py-3
                     hover:bg-volt-deep transition-colors disabled:opacity-50"
        >
          {submitting ? "SIGNING IN..." : "SIGN IN"}
        </button>

        <p className="text-ink-dim text-sm font-body mt-6 mb-4 text-center">
          New here?{" "}
          <Link href="/register" className="text-volt hover:underline">Create an account</Link>
        </p>
        <GoogleSignInButton/>
      </div>
      
    </main>
  );
}