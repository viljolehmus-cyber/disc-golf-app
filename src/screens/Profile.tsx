import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Clock,
  Crown,
  Settings as SettingsIcon,
  Star,
  Trophy
} from "lucide-react";
import { useApp } from "../store/AppStore";
import { getCourse } from "../data/courses";
import { CURRENT_USER } from "../data/players";
import { Avatar, Card, LargeTitle } from "../components/ui";
import { formatToPar, playerTotals } from "../lib/scoring";

export function Profile() {
  const navigate = useNavigate();
  const { rounds, favorites, premium } = useApp();

  const totals = rounds.map((r) =>
    playerTotals(r.scores["me"] ?? [], getCourse(r.courseId))
  );
  const best = totals.length ? Math.min(...totals.map((t) => t.toPar)) : null;
  const throwsTotal = totals.reduce((a, t) => a + t.strokes, 0);

  const rows = [
    {
      icon: Clock,
      label: "Round history",
      detail: `${rounds.length}`,
      to: "/history"
    },
    {
      icon: Star,
      label: "Favorite courses",
      detail: `${favorites.length}`,
      to: "/courses"
    },
    {
      icon: Trophy,
      label: "Tournaments",
      detail: "",
      to: "/tournaments"
    },
    {
      icon: SettingsIcon,
      label: "Settings",
      detail: "",
      to: "/settings"
    }
  ];

  return (
    <div>
      <LargeTitle title="Profile" />

      <div className="px-4 pt-2">
        <Card className="flex items-center gap-4 p-4">
          <Avatar name={CURRENT_USER.name} size={64} />
          <div className="flex-1">
            <p className="text-[20px] font-bold">{CURRENT_USER.name}</p>
            <p className="text-[14px] text-sub">
              {CURRENT_USER.handle} · {CURRENT_USER.homeCity}
            </p>
            <p className="text-[12px] text-sub">
              Member since {CURRENT_USER.memberSince}
            </p>
          </div>
          {premium && (
            <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold uppercase text-accent">
              <Crown size={12} /> Pro
            </span>
          )}
        </Card>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: "Rounds", value: `${rounds.length}` },
            { label: "Throws", value: `${throwsTotal}` },
            { label: "Best", value: best != null ? formatToPar(best) : "—" }
          ].map((s) => (
            <Card key={s.label} className="p-3.5 text-center">
              <p className="text-[22px] font-bold tabular-nums">{s.value}</p>
              <p className="text-[11px] font-medium text-sub">{s.label}</p>
            </Card>
          ))}
        </div>

        {!premium && (
          <Card
            onClick={() => navigate("/premium")}
            className="mt-3 border border-accent/30 bg-gradient-to-br from-accent/15 to-accent/5 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white">
                <Crown size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[16px] font-bold">Chains Pro</p>
                <p className="text-[13px] text-sub">
                  Advanced analytics, offline maps and more
                </p>
              </div>
              <ChevronRight size={18} className="text-accent" />
            </div>
          </Card>
        )}

        <Card className="mt-3 divide-y divide-sep">
          {rows.map((row) => (
            <button
              key={row.label}
              onClick={() => navigate(row.to)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <row.icon size={20} className="text-accent" />
              <p className="flex-1 text-[15px] font-semibold">{row.label}</p>
              {row.detail && (
                <span className="text-[14px] tabular-nums text-sub">
                  {row.detail}
                </span>
              )}
              <ChevronRight size={17} className="text-sub" />
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
}
