import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Check,
  CloudUpload,
  Crown,
  FileSpreadsheet,
  MapPinOff,
  MonitorSmartphone,
  ShieldCheck,
  X
} from "lucide-react";
import { useApp } from "../store/AppStore";

const PERKS = [
  {
    icon: ShieldCheck,
    title: "No ads, ever",
    body: "A completely clean experience on the course."
  },
  {
    icon: BarChart3,
    title: "Advanced analytics",
    body: "Hole-by-hole trends, strokes gained and consistency scores."
  },
  {
    icon: MapPinOff,
    title: "Offline maps",
    body: "Full course maps and GPS distances without a signal."
  },
  {
    icon: FileSpreadsheet,
    title: "Excel & PDF export",
    body: "Download any scorecard or your full history in one tap."
  },
  {
    icon: CloudUpload,
    title: "Cloud backup",
    body: "Every round backed up automatically and instantly."
  },
  {
    icon: MonitorSmartphone,
    title: "Multi-device sync",
    body: "Phone, tablet and web — always the same data."
  }
];

export function Premium() {
  const navigate = useNavigate();
  const { premium, setPremium, showToast } = useApp();
  const [plan, setPlan] = useState<"yearly" | "monthly">("yearly");
  const [buying, setBuying] = useState(false);

  const purchase = () => {
    setBuying(true);
    window.setTimeout(() => {
      setPremium(true);
      setBuying(false);
      showToast("Welcome to Chains Pro");
    }, 1100);
  };

  return (
    <div className="flex min-h-screen flex-col pb-10">
      <div className="flex h-[52px] items-center justify-end px-4">
        <button
          onClick={() => navigate(-1)}
          className="press flex h-8 w-8 items-center justify-center rounded-full bg-card2 text-sub"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-6 text-center">
        <div className="anim-pop mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-accent shadow-lg shadow-accent/30">
          <Crown size={34} className="text-white" />
        </div>
        <h1 className="mt-4 text-[32px] font-bold tracking-tight">Chains Pro</h1>
        <p className="mx-auto mt-1 max-w-[280px] text-[15px] text-sub">
          Every tool serious players use, in one membership.
        </p>
      </div>

      <div className="mt-7 space-y-1 px-5">
        {PERKS.map((p) => (
          <div key={p.title} className="flex items-start gap-3.5 rounded-card p-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
              <p.icon size={18} />
            </div>
            <div>
              <p className="text-[15px] font-semibold">{p.title}</p>
              <p className="text-[13px] leading-snug text-sub">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1" />

      {premium ? (
        <div className="px-6 pt-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-birdie/15 text-birdie">
            <Check size={24} strokeWidth={3} />
          </div>
          <p className="mt-2 text-[17px] font-bold">You're a Pro member</p>
          <p className="text-[13px] text-sub">
            Thanks for supporting Chains. All perks are unlocked.
          </p>
          <button
            onClick={() => {
              setPremium(false);
              showToast("Subscription cancelled");
            }}
            className="press mt-4 text-[14px] font-semibold text-sub underline-offset-2"
          >
            Cancel subscription
          </button>
        </div>
      ) : (
        <div className="px-5 pt-6">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setPlan("yearly")}
              className={`rounded-card p-4 text-left transition-all ${
                plan === "yearly"
                  ? "bg-accent/10 shadow-[inset_0_0_0_2px_var(--c-accent)]"
                  : "bg-card shadow-[inset_0_0_0_1px_var(--c-sep)]"
              }`}
            >
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Save 40%
              </span>
              <p className="mt-2 text-[20px] font-bold">39,99 € / yr</p>
              <p className="text-[12px] text-sub">3,33 € per month</p>
            </button>
            <button
              onClick={() => setPlan("monthly")}
              className={`rounded-card p-4 text-left transition-all ${
                plan === "monthly"
                  ? "bg-accent/10 shadow-[inset_0_0_0_2px_var(--c-accent)]"
                  : "bg-card shadow-[inset_0_0_0_1px_var(--c-sep)]"
              }`}
            >
              <p className="mt-[26px] text-[20px] font-bold">5,49 € / mo</p>
              <p className="text-[12px] text-sub">Billed monthly</p>
            </button>
          </div>
          <button
            onClick={purchase}
            disabled={buying}
            className="press mt-4 h-[54px] w-full rounded-full bg-accent text-[17px] font-bold text-white shadow-lg shadow-accent/25 disabled:opacity-60"
          >
            {buying ? "Processing…" : "Start free week"}
          </button>
          <p className="pt-3 text-center text-[11px] leading-relaxed text-sub">
            Demo build — no payment happens. 7-day trial, then{" "}
            {plan === "yearly" ? "39,99 € per year" : "5,49 € per month"}. Cancel
            anytime.
          </p>
        </div>
      )}
    </div>
  );
}
