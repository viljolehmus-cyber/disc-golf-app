import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useApp } from "../store/AppStore";
import { getCourse } from "../data/courses";
import { Card, EmptyState, LargeTitle, SegmentedControl } from "../components/ui";
import {
  countScores,
  formatToPar,
  playerTotals,
  type ScoreCounts
} from "../lib/scoring";
import { formatDate } from "../lib/format";

type Range = "all" | "3m" | "1m";

export function Stats() {
  const navigate = useNavigate();
  const { rounds } = useApp();
  const [range, setRange] = useState<Range>("all");

  const filtered = useMemo(() => {
    const cutoff =
      range === "all"
        ? 0
        : Date.now() - (range === "3m" ? 91 : 30) * 86400000;
    return rounds
      .filter((r) => new Date(r.startedAt).getTime() >= cutoff)
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  }, [rounds, range]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    let totalThrows = 0;
    let totalToPar = 0;
    const counts: ScoreCounts = { eagles: 0, birdies: 0, pars: 0, bogeys: 0, doubles: 0 };
    let best: { toPar: number; roundId: string; course: string; date: string } | null = null;
    const holeAgg = new Map<string, { sum: number; n: number; label: string }>();

    filtered.forEach((r) => {
      const course = getCourse(r.courseId);
      const scores = r.scores["me"] ?? [];
      const t = playerTotals(scores, course);
      totalThrows += t.strokes;
      totalToPar += t.toPar;
      countScores(scores, course, counts);
      if (!best || t.toPar < best.toPar) {
        best = {
          toPar: t.toPar,
          roundId: r.id,
          course: course.name,
          date: r.startedAt
        };
      }
      scores.forEach((s, i) => {
        if (s == null) return;
        const key = `${course.id}-${i}`;
        const prev = holeAgg.get(key) ?? {
          sum: 0,
          n: 0,
          label: `${course.name.split(" ")[0]} #${i + 1}`
        };
        prev.sum += s - course.holes[i].par;
        prev.n += 1;
        holeAgg.set(key, prev);
      });
    });

    let bestHole: { label: string; avg: number } | null = null;
    let worstHole: { label: string; avg: number } | null = null;
    holeAgg.forEach((v) => {
      if (v.n < 2) return;
      const avg = v.sum / v.n;
      if (!bestHole || avg < bestHole.avg) bestHole = { label: v.label, avg };
      if (!worstHole || avg > worstHole.avg) worstHole = { label: v.label, avg };
    });

    return {
      totalRounds: filtered.length,
      totalThrows,
      avgToPar: totalToPar / filtered.length,
      counts,
      best: best as { toPar: number; roundId: string; course: string; date: string } | null,
      bestHole: bestHole as { label: string; avg: number } | null,
      worstHole: worstHole as { label: string; avg: number } | null
    };
  }, [filtered]);

  const chartData = useMemo(
    () =>
      filtered.map((r) => {
        const course = getCourse(r.courseId);
        return {
          ts: new Date(r.startedAt).getTime(),
          toPar: playerTotals(r.scores["me"] ?? [], course).toPar,
          course: course.name,
          id: r.id
        };
      }),
    [filtered]
  );

  return (
    <div>
      <LargeTitle title="Stats">
        <p className="text-[15px] text-sub">Computed from your saved rounds</p>
      </LargeTitle>

      <div className="px-4">
        <SegmentedControl
          value={range}
          onChange={setRange}
          options={[
            { value: "all", label: "All" },
            { value: "3m", label: "3M" },
            { value: "1m", label: "1M" }
          ]}
        />
      </div>

      {!stats ? (
        <EmptyState
          icon={<BarChart3 size={28} />}
          title="No rounds in this range"
          body="Play a round — or widen the time range — and your statistics will appear here."
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
        <>
          <div className="grid grid-cols-2 gap-2 px-4 pt-4">
            {[
              { label: "Rounds", value: `${stats.totalRounds}` },
              { label: "Total throws", value: `${stats.totalThrows}` },
              {
                label: "Avg score to par",
                value:
                  (stats.avgToPar >= 0 ? "+" : "") + stats.avgToPar.toFixed(1)
              },
              {
                label: "Best round",
                value: stats.best ? formatToPar(stats.best.toPar) : "—",
                sub: stats.best ? stats.best.course : undefined,
                onClick: stats.best
                  ? () => navigate(`/history/${stats.best!.roundId}`)
                  : undefined
              }
            ].map((s) => (
              <Card key={s.label} className="p-4" onClick={s.onClick}>
                <p className="text-[26px] font-bold tabular-nums leading-8">
                  {s.value}
                </p>
                <p className="mt-0.5 text-[12px] font-medium text-sub">
                  {s.label}
                  {s.sub ? ` · ${s.sub}` : ""}
                </p>
              </Card>
            ))}
          </div>

          <div className="px-4 pt-3">
            <Card className="p-4">
              <p className="text-[15px] font-bold">Score development</p>
              <p className="pb-3 text-[12px] text-sub">
                Score to par per round · lower is better
              </p>
              <div className="h-[210px] w-full">
                <ResponsiveContainer>
                  <LineChart
                    data={chartData}
                    margin={{ top: 6, right: 6, bottom: 0, left: -22 }}
                  >
                    <CartesianGrid
                      stroke="var(--c-sep)"
                      strokeWidth={1}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="ts"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      scale="time"
                      tickFormatter={(ts: number) =>
                        new Date(ts).toLocaleDateString("en-US", { month: "short" })
                      }
                      tick={{ fill: "var(--c-sub)", fontSize: 11 }}
                      axisLine={{ stroke: "var(--c-sep)" }}
                      tickLine={false}
                      ticks={monthTicks(chartData)}
                    />
                    <YAxis
                      tick={{ fill: "var(--c-sub)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => formatToPar(v)}
                      allowDecimals={false}
                    />
                    <ReferenceLine
                      y={0}
                      stroke="var(--c-sub)"
                      strokeDasharray="4 4"
                      strokeOpacity={0.5}
                    />
                    <Tooltip
                      cursor={{ stroke: "var(--c-sub)", strokeDasharray: "3 3" }}
                      content={<ChartTip />}
                    />
                    <Line
                      type="monotone"
                      dataKey="toPar"
                      stroke="var(--c-accent)"
                      strokeWidth={2}
                      dot={{
                        r: 3.5,
                        fill: "var(--c-accent)",
                        stroke: "var(--c-card)",
                        strokeWidth: 2
                      }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="px-4 pt-3">
            <Card className="p-4">
              <p className="pb-3 text-[15px] font-bold">Score breakdown</p>
              <ScoreDistribution counts={stats.counts} />
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-2 px-4 pt-3 pb-6">
            <Card className="p-4">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-sub">
                Best hole
              </p>
              {stats.bestHole ? (
                <>
                  <p className="mt-1 text-[17px] font-bold">{stats.bestHole.label}</p>
                  <p className="text-[13px] font-semibold text-birdie">
                    avg {stats.bestHole.avg >= 0 ? "+" : ""}
                    {stats.bestHole.avg.toFixed(1)} to par
                  </p>
                </>
              ) : (
                <p className="mt-1 text-[13px] text-sub">
                  Play a course twice to unlock
                </p>
              )}
            </Card>
            <Card className="p-4">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-sub">
                Toughest hole
              </p>
              {stats.worstHole ? (
                <>
                  <p className="mt-1 text-[17px] font-bold">{stats.worstHole.label}</p>
                  <p className="text-[13px] font-semibold text-bogey">
                    avg {stats.worstHole.avg >= 0 ? "+" : ""}
                    {stats.worstHole.avg.toFixed(1)} to par
                  </p>
                </>
              ) : (
                <p className="mt-1 text-[13px] text-sub">
                  Play a course twice to unlock
                </p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function monthTicks(data: { ts: number }[]): number[] {
  if (data.length < 2) return data.map((d) => d.ts);
  const first = new Date(data[0].ts);
  const last = new Date(data[data.length - 1].ts);
  const ticks: number[] = [];
  const d = new Date(first.getFullYear(), first.getMonth() + 1, 1);
  while (d <= last) {
    ticks.push(d.getTime());
    d.setMonth(d.getMonth() + 1);
  }
  return ticks.length > 0 ? ticks : [data[0].ts, data[data.length - 1].ts];
}

function ChartTip({
  active,
  payload
}: {
  active?: boolean;
  payload?: { payload: { ts: number; toPar: number; course: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-cell bg-card2 px-3 py-2 shadow-lg">
      <p className="text-[12px] font-semibold">{p.course}</p>
      <p className="text-[11px] text-sub">
        {formatDate(new Date(p.ts).toISOString())} ·{" "}
        <span className="font-bold text-ink">{formatToPar(p.toPar)}</span>
      </p>
    </div>
  );
}

function ScoreDistribution({ counts }: { counts: ScoreCounts }) {
  const items = [
    { label: "Eagle+", value: counts.eagles, color: "#30D158" },
    { label: "Birdie", value: counts.birdies, color: "#30D158" },
    { label: "Par", value: counts.pars, color: "#8E8E93" },
    { label: "Bogey", value: counts.bogeys, color: "#FF9F0A" },
    { label: "Double+", value: counts.doubles, color: "#FF453A" }
  ];
  const total = items.reduce((a, x) => a + x.value, 0) || 1;
  return (
    <div>
      <div className="flex h-3 gap-[2px] overflow-hidden rounded-full">
        {items
          .filter((x) => x.value > 0)
          .map((x) => (
            <div
              key={x.label}
              style={{
                width: `${(x.value / total) * 100}%`,
                background: x.color,
                opacity: x.label === "Eagle+" ? 0.75 : 1
              }}
            />
          ))}
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1">
        {items.map((x) => (
          <div key={x.label} className="text-center">
            <p className="text-[16px] font-bold tabular-nums" style={{ color: x.color }}>
              {x.value}
            </p>
            <p className="text-[10px] font-medium text-sub">{x.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
