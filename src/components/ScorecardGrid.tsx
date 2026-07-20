import type { Course, Round } from "../types";
import { ScoreCell } from "./ui";
import { initials } from "../lib/format";
import { formatToPar, playerTotals } from "../lib/scoring";

/** Players × holes scorecard grid with score-class colors. */
export function ScorecardGrid({ round, course }: { round: Round; course: Course }) {
  return (
    <div className="overflow-x-auto rounded-card bg-card p-3">
      <table className="border-separate" style={{ borderSpacing: "2px" }}>
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-card pr-2 text-left text-[11px] font-semibold text-sub">
              Hole
            </th>
            {course.holes.map((h) => (
              <th
                key={h.number}
                className="h-8 w-8 text-center text-[12px] font-semibold text-sub"
              >
                {h.number}
              </th>
            ))}
            <th className="w-12 text-center text-[11px] font-semibold text-sub">
              Total
            </th>
          </tr>
          <tr>
            <th className="sticky left-0 z-10 bg-card pr-2 text-left text-[11px] font-medium text-sub">
              Par
            </th>
            {course.holes.map((h) => (
              <th
                key={h.number}
                className="text-center text-[12px] font-medium tabular-nums text-sub"
              >
                {h.par}
              </th>
            ))}
            <th className="text-center text-[12px] font-medium tabular-nums text-sub">
              {course.holes.reduce((a, h) => a + h.par, 0)}
            </th>
          </tr>
        </thead>
        <tbody>
          {round.players.map((p) => {
            const scores = round.scores[p.id] ?? [];
            const t = playerTotals(scores, course);
            return (
              <tr key={p.id}>
                <td className="sticky left-0 z-10 bg-card pr-2 text-[13px] font-semibold">
                  {initials(p.name)}
                </td>
                {course.holes.map((h, i) => (
                  <td key={h.number}>
                    <ScoreCell strokes={scores[i] ?? null} par={h.par} />
                  </td>
                ))}
                <td className="text-center">
                  <span className="text-[13px] font-bold tabular-nums">
                    {t.strokes}
                  </span>
                  <span
                    className={`block text-[11px] font-semibold tabular-nums ${
                      t.toPar < 0 ? "text-birdie" : "text-sub"
                    }`}
                  >
                    {formatToPar(t.toPar)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
