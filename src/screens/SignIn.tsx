import { useState } from "react";
import { Apple, Chrome, Link2 } from "lucide-react";
import { useApp } from "../store/AppStore";

export function SignIn() {
  const { signIn } = useApp();
  const [loading, setLoading] = useState<"apple" | "google" | null>(null);

  const doSignIn = (provider: "apple" | "google") => {
    setLoading(provider);
    window.setTimeout(() => signIn(), 900);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col justify-between px-6 pb-10 pt-24">
      <div className="anim-fade">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[22px] bg-accent shadow-lg shadow-accent/30">
          <Link2 size={40} className="text-white" strokeWidth={2.4} />
        </div>
        <h1 className="text-[44px] font-bold leading-tight tracking-tight">
          Chains
        </h1>
        <p className="mt-2 max-w-[300px] text-[17px] leading-snug text-sub">
          Scorekeeping, stats and courses for disc golf. Everything you need
          between the tee and the basket.
        </p>

        <div className="mt-10 space-y-3 text-[15px] text-sub">
          {[
            "One-thumb scoring built for the fairway",
            "Deep statistics from every round you play",
            "12 000+ courses with maps and reviews"
          ].map((t) => (
            <div key={t} className="flex items-center gap-3">
              <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-accent" />
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => doSignIn("apple")}
          disabled={loading != null}
          className="press flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-ink text-[17px] font-semibold text-app"
        >
          <Apple size={20} fill="currentColor" />
          {loading === "apple" ? "Signing in…" : "Continue with Apple"}
        </button>
        <button
          onClick={() => doSignIn("google")}
          disabled={loading != null}
          className="press flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-card text-[17px] font-semibold"
          style={{ boxShadow: "inset 0 0 0 1px var(--c-sep)" }}
        >
          <Chrome size={20} />
          {loading === "google" ? "Signing in…" : "Continue with Google"}
        </button>
        <p className="px-6 pt-2 text-center text-[12px] leading-snug text-sub">
          Demo build — sign-in is simulated and no account is created.
        </p>
      </div>
    </div>
  );
}
