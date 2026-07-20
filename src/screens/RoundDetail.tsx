import { useNavigate, useParams } from "react-router-dom";
import { Share2, Sparkles } from "lucide-react";
import { useApp } from "../store/AppStore";
import { getCourse } from "../data/courses";
import { Avatar, Card, LargeTitle } from "../components/ui";
import { ScorecardGrid } from "../components/ScorecardGrid";
import { analyzeRound } from "../lib/insights";
import {
  countScores,
  coursePar,
  formatToPar,
  playerTotals
} from "../lib/scoring";
import { formatDateTime } from "../lib/format";

export function RoundDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rounds, showToast } = useApp();
  const round = rounds.find((r) => r.id === id);

  if (!round) {
    return (
      <div>
        <LargeTitle title="Round" back />
        <p className="px-4 pt-6 text-[15px] text-sub">
          This round could not be found.
        </p>
      </div>
    );
  }

  const course = getCourse(round.courseId);
  const board = round.players
    .map((p) => ({ player: p, ...playerTotals(round.scores[p.id] ?? [], course) }))
    .sort((a, b) => a.toPar - b.toPar || a.strokes - b.strokes);
  const counts = countScores(round.scores["me"] ?? [], course);
  const insights = analyzeRound(round, course, "me");

  const share = async () => {
    const lines = [
      `⛓️ Chains — ${course.name}`,
      ...board.map(
        (b, i) => `${i + 1}. ${b.player.name}: ${b.strokes} (${formatToPar(b.toPar)})`
      )
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      showToast("Results copied to clipboard");
    } catch {
      showToast("Couldn't access clipboard");
    }
  };

  return (
    <div>
      <LargeTitle
        title={course.name}
        back
        right={
          <button
            onClick={share}
            className="press flex h-8 w-8 items-center justify-center rounded-full bg-card2 text-accent"
            aria-label="Share"
          >
            <Share2 size={16} />
          </button>
        }
      >
        <p className="text-[15px] text-sub">
          {formatDateTime(round.startedAt)} · par {coursePar(course)}
        </p>
      </LargeTitle>

      <div className="px-4 pt-2">
        <Card className="divide-y divide-sep">
          {board.map((row, i) => (
            <div key={row.player.id} className="flex items-center gap-3 p-3.5">
              <span
                className={`w-5 text-center text-[15px] font-bold ${
                  i === 0 ? "text-accent" : "text-sub"
                }`}
              >
                {i + 1}
              </span>
              <Avatar name={row.player.name} size={36} />
              <p className="flex-1 text-[15px] font-semibold">{row.player.name}</p>
              <span className="text-[14px] tabular-nums text-sub">
                {row.strokes}
              </span>
              <span
                className={`w-11 text-right text-[18px] font-bold tabular-nums ${
                  row.toPar < 0 ? "text-birdie" : row.toPar === 0 ? "text-sub" : ""
                }`}
              >
                {formatToPar(row.toPar)}
              </span>
            </div>
          ))}
        </Card>
      </div>

      <div className="px-4 pt-4">
        <ScorecardGrid round={round} course={course} />
      </div>

      <div className="grid grid-cols-4 gap-2 px-4 pt-4">
        {[
          { label: "Birdies+", value: counts.birdies + counts.eagles, color: "#30D158" },
          { label: "Pars", value: counts.pars, color: "#8E8E93" },
          { label: "Bogeys", value: counts.bogeys, color: "#FF9F0A" },
          { label: "Double+", value: counts.doubles, color: "#FF453A" }
        ].map((s) => (
          <Card key={s.label} className="p-3 text-center">
            <p className="text-[20px] font-bold tabular-nums" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-[11px] font-medium text-sub">{s.label}</p>
          </Card>
        ))}
      </div>

      {insights.length > 0 && (
        <div className="px-4 pt-4">
          <Card>
            <div className="flex items-center gap-2 border-b border-sep px-4 py-3">
              <Sparkles size={16} className="text-accent-hi" />
              <p className="text-[15px] font-bold">AI Insights</p>
            </div>
            <div className="divide-y divide-sep">
              {insights.map((ins) => (
                <div key={ins.title} className="px-4 py-3.5">
                  <p className="text-[14px] font-semibold">{ins.title}</p>
                  <p className="mt-1 text-[13px] leading-snug text-sub">{ins.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div className="px-4 pt-5">
        <button
          onClick={() => navigate(`/courses/${course.id}`)}
          className="press w-full rounded-full bg-card py-3 text-[15px] font-semibold text-accent"
        >
          View course
        </button>
      </div>
    </div>
  );
}
