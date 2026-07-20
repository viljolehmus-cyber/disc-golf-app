import { useNavigate } from "react-router-dom";
import { ChevronRight, Disc } from "lucide-react";
import { useApp } from "../store/AppStore";
import { getCourse } from "../data/courses";
import { Card, EmptyState, LargeTitle, ScoreDot } from "../components/ui";
import { coursePar, formatToPar, playerTotals } from "../lib/scoring";
import { formatDate } from "../lib/format";

export function History() {
  const navigate = useNavigate();
  const { rounds } = useApp();
  const sorted = [...rounds].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return (
    <div>
      <LargeTitle title="Round History" back>
        <p className="text-[15px] text-sub">
          {sorted.length} {sorted.length === 1 ? "round" : "rounds"} played
        </p>
      </LargeTitle>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Disc size={28} />}
          title="No rounds yet"
          body="Start your first round and it will show up here with a full scorecard."
          action={
            <button
              onClick={() => navigate("/play/new")}
              className="press rounded-full bg-accent px-6 py-2.5 text-[15px] font-semibold text-white"
            >
              Start a round
            </button>
          }
        />
      ) : (
        <div className="space-y-2.5 px-4 pt-2">
          {sorted.map((r) => {
            const course = getCourse(r.courseId);
            const t = playerTotals(r.scores["me"] ?? [], course);
            const holes = course.holes;
            return (
              <Card
                key={r.id}
                onClick={() => navigate(`/history/${r.id}`)}
                className="p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold">
                      {course.name}
                    </p>
                    <p className="text-[13px] text-sub">
                      {formatDate(r.startedAt)} · {holes.length} holes · par{" "}
                      {coursePar(course)}
                      {r.players.length > 1 &&
                        ` · ${r.players.length} players`}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-3">
                    <div className="text-right">
                      <p
                        className={`text-[18px] font-bold tabular-nums ${
                          t.toPar < 0
                            ? "text-birdie"
                            : t.toPar === 0
                              ? "text-sub"
                              : ""
                        }`}
                      >
                        {formatToPar(t.toPar)}
                      </p>
                      <p className="text-[12px] text-sub">{t.strokes} throws</p>
                    </div>
                    <ChevronRight size={17} className="text-sub" />
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-[5px]">
                  {holes.map((h, i) => (
                    <ScoreDot
                      key={h.number}
                      strokes={r.scores["me"]?.[i] ?? null}
                      par={h.par}
                      size={7}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
