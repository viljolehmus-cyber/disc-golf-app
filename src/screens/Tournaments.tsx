import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight, Trophy, Users } from "lucide-react";
import { getCourse } from "../data/courses";
import { generateTournaments } from "../data/seed";
import { Card, LargeTitle } from "../components/ui";
import { formatDate } from "../lib/format";

export function Tournaments() {
  const navigate = useNavigate();
  const tournaments = generateTournaments();

  return (
    <div>
      <LargeTitle title="Tournaments" back>
        <p className="text-[15px] text-sub">Local events run through Chains</p>
      </LargeTitle>

      <div className="space-y-2.5 px-4 pt-2">
        {tournaments.map((t) => (
          <Card
            key={t.id}
            onClick={() => navigate(`/tournaments/${t.id}`)}
            className="p-4"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {t.status === "live" ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                      Live now
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-card2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sub">
                      <CalendarDays size={11} /> {formatDate(t.date)}
                    </span>
                  )}
                  <span className="rounded-full bg-card2 px-2 py-0.5 text-[11px] font-bold text-sub">
                    Entry {t.entryFee}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-[17px] font-bold">{t.name}</p>
                <p className="truncate text-[13px] text-sub">
                  {getCourse(t.courseId).name} · {t.format}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[13px] text-sub">
                  <Users size={13} /> {t.players} players
                </p>
              </div>
              <ChevronRight size={18} className="ml-3 shrink-0 text-sub" />
            </div>
          </Card>
        ))}
      </div>

      <div className="px-4 pt-6">
        <Card className="flex items-center gap-3 bg-card2/60 p-4">
          <Trophy size={20} className="text-accent" />
          <p className="text-[13px] leading-snug text-sub">
            Want to run your own event? Tournament hosting tools are part of{" "}
            <button
              onClick={() => navigate("/premium")}
              className="font-semibold text-accent"
            >
              Chains Pro
            </button>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}
