import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight, Play, Star, Trophy, Zap } from "lucide-react";
import { useApp } from "../store/AppStore";
import { COURSES, getCourse } from "../data/courses";
import { CURRENT_USER } from "../data/players";
import { generateTournaments } from "../data/seed";
import { Avatar, Card, LargeTitle, SectionLabel } from "../components/ui";
import { coursePar, formatToPar, playerTotals } from "../lib/scoring";
import { formatDate } from "../lib/format";

export function PlayHome() {
  const navigate = useNavigate();
  const { rounds, activeRound, favorites } = useApp();
  const tournaments = generateTournaments();
  const recent = [...rounds]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 3);
  const favCourses = COURSES.filter((c) => favorites.includes(c.id)).slice(0, 4);
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <LargeTitle
        title="Play"
        right={<Avatar name={CURRENT_USER.name} size={32} />}
      >
        <p className="text-[15px] text-sub">
          {greeting}, {CURRENT_USER.name.split(" ")[0]} — perfect day for a round.
        </p>
      </LargeTitle>

      <div className="space-y-3 px-4 pt-2">
        {activeRound && (
          <Card
            onClick={() => navigate("/round")}
            className="anim-pop border border-accent/40 bg-accent/10 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-accent">
                  <Zap size={14} /> Round in progress
                </p>
                <p className="mt-1 text-[17px] font-bold">
                  {getCourse(activeRound.courseId).name}
                </p>
                <p className="text-[13px] text-sub">
                  Hole {activeRound.currentHole} of{" "}
                  {getCourse(activeRound.courseId).holes.length} ·{" "}
                  {activeRound.players.length}{" "}
                  {activeRound.players.length === 1 ? "player" : "players"}
                </p>
              </div>
              <ChevronRight className="text-accent" />
            </div>
          </Card>
        )}

        <button
          onClick={() => navigate("/play/new")}
          className="press flex h-[92px] w-full items-center justify-between rounded-card bg-accent px-6 text-white shadow-lg shadow-accent/25"
        >
          <div className="text-left">
            <p className="text-[22px] font-bold">Start Round</p>
            <p className="text-[14px] text-white/80">
              Pick a course and tee off
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <Play size={26} fill="currentColor" className="ml-1" />
          </div>
        </button>
      </div>

      <SectionLabel>Tournaments</SectionLabel>
      <div className="space-y-2.5 px-4">
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
                      Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-card2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sub">
                      <CalendarDays size={11} /> {formatDate(t.date)}
                    </span>
                  )}
                  <span className="rounded-full bg-card2 px-2 py-0.5 text-[11px] font-bold text-sub">
                    {t.entryFee}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-[16px] font-semibold">
                  {t.name}
                </p>
                <p className="truncate text-[13px] text-sub">
                  {getCourse(t.courseId).name} · {t.players} players
                </p>
              </div>
              <Trophy size={20} className="ml-3 shrink-0 text-sub" />
            </div>
          </Card>
        ))}
      </div>

      {favCourses.length > 0 && (
        <>
          <SectionLabel>Favorites</SectionLabel>
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4">
            {favCourses.map((c) => (
              <div key={c.id} className="w-[170px] shrink-0">
                <Card
                  onClick={() => navigate(`/courses/${c.id}`)}
                  className="h-full p-3.5"
                >
                  <Star size={16} className="mb-2 text-accent" fill="currentColor" />
                  <p className="truncate text-[14px] font-semibold">{c.name}</p>
                  <p className="text-[12px] text-sub">
                    {c.city} · {c.holes.length} holes
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionLabel>Recent rounds</SectionLabel>
      <div className="space-y-2.5 px-4">
        {recent.map((r) => {
          const course = getCourse(r.courseId);
          const { toPar, strokes } = playerTotals(r.scores["me"] ?? [], course);
          return (
            <Card
              key={r.id}
              onClick={() => navigate(`/history/${r.id}`)}
              className="flex items-center justify-between p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold">{course.name}</p>
                <p className="text-[13px] text-sub">
                  {formatDate(r.startedAt)} · par {coursePar(course)}
                </p>
              </div>
              <div className="ml-3 text-right">
                <p
                  className={`text-[17px] font-bold tabular-nums ${
                    toPar < 0 ? "text-birdie" : toPar === 0 ? "text-sub" : ""
                  }`}
                >
                  {formatToPar(toPar)}
                </p>
                <p className="text-[12px] text-sub">{strokes} throws</p>
              </div>
            </Card>
          );
        })}
        <button
          onClick={() => navigate("/history")}
          className="press w-full py-2 text-center text-[15px] font-semibold text-accent"
        >
          All rounds
        </button>
      </div>
    </div>
  );
}
