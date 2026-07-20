import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudDrizzle,
  CloudSun,
  Flag,
  ListOrdered,
  Minus,
  Navigation,
  Plus,
  Sun,
  X
} from "lucide-react";
import { useApp } from "../store/AppStore";
import { getCourse } from "../data/courses";
import { Avatar, SegmentedControl, Sheet } from "../components/ui";
import {
  classifyScore,
  formatToPar,
  playerTotals,
  scoreColors,
  scoreLabel
} from "../lib/scoring";
import { predictFinal } from "../lib/insights";
import { mockWeather, windCompass } from "../lib/weather";
import { hashString, mulberry32 } from "../lib/random";

const WEATHER_ICONS = {
  sunny: Sun,
  partly: CloudSun,
  cloudy: Cloud,
  drizzle: CloudDrizzle
};

export function Scoring() {
  const navigate = useNavigate();
  const {
    activeRound,
    setScore,
    updateActiveRound,
    finishActiveRound,
    discardActiveRound
  } = useApp();
  const [tab, setTab] = useState<"score" | "map">("score");
  const [showBoard, setShowBoard] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [slideDir, setSlideDir] = useState<"r" | "l">("r");
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (!activeRound) navigate("/", { replace: true });
  }, [activeRound, navigate]);

  const course = useMemo(
    () => (activeRound ? getCourse(activeRound.courseId) : null),
    [activeRound?.courseId]
  );
  const weather = useMemo(
    () => mockWeather(activeRound?.weatherSeed ?? 1),
    [activeRound?.weatherSeed]
  );

  if (!activeRound || !course) return null;

  const holeIdx = activeRound.currentHole - 1;
  const hole = course.holes[holeIdx];
  const lastHole = activeRound.currentHole === course.holes.length;
  const WeatherIcon = WEATHER_ICONS[weather.condition];

  const goToHole = (n: number) => {
    if (n < 1 || n > course.holes.length) return;
    setSlideDir(n > activeRound.currentHole ? "r" : "l");
    updateActiveRound({ currentHole: n });
  };

  const allScored = activeRound.players.every((p) =>
    activeRound.scores[p.id]?.every((s) => s != null)
  );

  const board = activeRound.players
    .map((p) => ({
      player: p,
      ...playerTotals(activeRound.scores[p.id] ?? [], course)
    }))
    .sort((a, b) => a.toPar - b.toPar || a.strokes - b.strokes);

  const myScores = activeRound.scores["me"];
  const projected = myScores ? predictFinal(myScores, course) : null;

  const finish = () => {
    const done = finishActiveRound();
    if (done) navigate("/round/finish", { replace: true, state: { roundId: done.id } });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 56) return;
    goToHole(activeRound.currentHole + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-app/85 backdrop-blur-xl">
        <div className="flex h-[52px] items-center justify-between px-4">
          <button
            onClick={() => navigate("/")}
            className="press flex h-8 w-8 items-center justify-center rounded-full bg-card2 text-sub"
            aria-label="Pause round"
          >
            <X size={18} />
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate text-[15px] font-semibold">{course.name}</p>
            <p className="text-[11px] text-sub">
              Hole {activeRound.currentHole} of {course.holes.length}
            </p>
          </div>
          <button
            onClick={() => setShowBoard(true)}
            className="press flex h-8 w-8 items-center justify-center rounded-full bg-card2 text-accent"
            aria-label="Leaderboard"
          >
            <ListOrdered size={17} />
          </button>
        </div>

        {/* Weather + projection strip */}
        <div className="flex items-center justify-center gap-2 pb-2">
          <span className="flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[12px] font-medium text-sub">
            <WeatherIcon size={13} />
            {weather.tempC}° {weather.label}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[12px] font-medium text-sub">
            <Navigation
              size={12}
              className="text-accent-hi"
              style={{ transform: `rotate(${weather.windDeg + 180}deg)` }}
              fill="currentColor"
            />
            {weather.windMs} m/s {windCompass(weather.windDeg)}
          </span>
          {projected != null && (
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[12px] font-bold text-accent">
              Proj. {formatToPar(projected)}
            </span>
          )}
        </div>
      </div>

      <div
        className="flex flex-1 flex-col"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Hole header */}
        <div
          key={`h-${activeRound.currentHole}`}
          className={slideDir === "r" ? "anim-slide-r" : "anim-slide-l"}
        >
          <div className="flex items-end justify-between px-5 pt-3">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wide text-sub">
                Hole
              </p>
              <p className="text-[56px] font-bold leading-none tracking-tight">
                {hole.number}
              </p>
            </div>
            <div className="flex gap-6 pb-1 text-right">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-wide text-sub">
                  Par
                </p>
                <p className="text-[28px] font-bold leading-8">{hole.par}</p>
              </div>
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-wide text-sub">
                  Length
                </p>
                <p className="text-[28px] font-bold leading-8">
                  {hole.length}
                  <span className="text-[15px] font-semibold text-sub"> m</span>
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 pt-3">
            <SegmentedControl
              value={tab}
              onChange={setTab}
              options={[
                { value: "score", label: "Score" },
                { value: "map", label: "Map" }
              ]}
            />
          </div>

          {tab === "score" ? (
            <div className="space-y-2.5 px-4 pt-4">
              {activeRound.players.map((p) => (
                <PlayerScoreRow
                  key={p.id}
                  name={p.name}
                  strokes={activeRound.scores[p.id]?.[holeIdx] ?? null}
                  par={hole.par}
                  totals={playerTotals(activeRound.scores[p.id] ?? [], course)}
                  onChange={(v) => setScore(p.id, holeIdx, v)}
                />
              ))}
            </div>
          ) : (
            <HoleMap
              courseId={course.id}
              holeNumber={hole.number}
              par={hole.par}
              length={hole.length}
              windDeg={weather.windDeg}
              windMs={weather.windMs}
            />
          )}
        </div>

        <div className="flex-1" />

        {/* Hole navigation */}
        <div className="safe-b sticky bottom-0 z-20 bg-app/85 px-4 pb-5 pt-3 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-center gap-[5px]">
            {course.holes.map((h, i) => {
              const holePlayed = activeRound.players.some(
                (p) => activeRound.scores[p.id]?.[i] != null
              );
              const current = i === holeIdx;
              return (
                <button
                  key={h.number}
                  onClick={() => goToHole(i + 1)}
                  aria-label={`Hole ${h.number}`}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: current ? 18 : 6,
                    height: 6,
                    background: current
                      ? "var(--c-accent)"
                      : holePlayed
                        ? "var(--c-accent)"
                        : "var(--c-sep)",
                    opacity: current ? 1 : holePlayed ? 0.55 : 1
                  }}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToHole(activeRound.currentHole - 1)}
              disabled={activeRound.currentHole === 1}
              className="press flex h-[52px] w-[72px] items-center justify-center rounded-full bg-card disabled:opacity-30"
              aria-label="Previous hole"
            >
              <ChevronLeft size={26} />
            </button>
            {lastHole || allScored ? (
              <button
                onClick={finish}
                className="press flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-accent text-[17px] font-bold text-white"
              >
                <Flag size={18} /> Finish round
              </button>
            ) : (
              <button
                onClick={() => goToHole(activeRound.currentHole + 1)}
                className="press flex h-[52px] flex-1 items-center justify-center gap-1 rounded-full bg-card text-[17px] font-semibold"
              >
                Next hole <ChevronRight size={20} className="text-sub" />
              </button>
            )}
            {!lastHole && !allScored ? null : (
              <button
                onClick={() => goToHole(activeRound.currentHole + 1)}
                disabled={lastHole}
                className="press flex h-[52px] w-[72px] items-center justify-center rounded-full bg-card disabled:opacity-30"
                aria-label="Next hole"
              >
                <ChevronRight size={26} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live leaderboard sheet */}
      <Sheet open={showBoard} onClose={() => setShowBoard(false)} title="Leaderboard">
        <div className="px-5">
          {board.map((row, i) => {
            const pos =
              i > 0 && board[i - 1].toPar === row.toPar
                ? "T" + (board.findIndex((b) => b.toPar === row.toPar) + 1)
                : i + 1;
            return (
              <div
                key={row.player.id}
                className="flex items-center gap-3 border-b border-sep py-3 last:border-0"
              >
                <span className="w-6 text-[15px] font-bold text-sub">{pos}</span>
                <Avatar name={row.player.name} size={36} />
                <div className="flex-1">
                  <p className="text-[15px] font-semibold">{row.player.name}</p>
                  <p className="text-[12px] text-sub">
                    Thru {row.holesPlayed} · {row.strokes} throws
                  </p>
                </div>
                <span
                  className={`text-[20px] font-bold tabular-nums ${
                    row.toPar < 0 ? "text-birdie" : row.toPar === 0 ? "text-sub" : ""
                  }`}
                >
                  {formatToPar(row.toPar)}
                </span>
              </div>
            );
          })}
          <div className="space-y-2.5 pt-4">
            <button
              onClick={finish}
              className="press w-full rounded-full bg-accent py-3 text-[16px] font-bold text-white"
            >
              Finish round
            </button>
            {!confirmDiscard ? (
              <button
                onClick={() => setConfirmDiscard(true)}
                className="press w-full py-2 text-[15px] font-semibold text-dbl"
              >
                Discard round
              </button>
            ) : (
              <button
                onClick={() => {
                  discardActiveRound();
                  navigate("/", { replace: true });
                }}
                className="press w-full rounded-full bg-dbl/15 py-3 text-[15px] font-bold text-dbl"
              >
                Tap again to confirm discard
              </button>
            )}
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function PlayerScoreRow({
  name,
  strokes,
  par,
  totals,
  onChange
}: {
  name: string;
  strokes: number | null;
  par: number;
  totals: { strokes: number; toPar: number; holesPlayed: number };
  onChange: (v: number | null) => void;
}) {
  const cls = classifyScore(strokes, par);
  const color =
    cls === "none" ? "var(--c-sub)" : cls === "par" ? "var(--c-ink)" : scoreColors[cls];

  return (
    <div className="rounded-card bg-card p-3">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Avatar name={name} size={36} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold leading-tight">
              {name.split(" ")[0]}
            </p>
            <p className="text-[12px] tabular-nums text-sub">
              {formatToPar(totals.toPar)} · {totals.strokes} thr
            </p>
          </div>
        </div>

        <button
          onClick={() => onChange(Math.max(1, (strokes ?? par) - 1))}
          className="press flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-card2 active:bg-accent-press/30"
          aria-label={`Minus for ${name}`}
        >
          <Minus size={26} strokeWidth={2.5} />
        </button>

        <button
          onClick={() => onChange(par)}
          className="press flex h-[58px] w-[64px] shrink-0 flex-col items-center justify-center rounded-cell bg-card2"
          aria-label={`Set par for ${name}`}
        >
          {strokes == null ? (
            <>
              <span className="text-[17px] font-bold text-accent">Par</span>
              <span className="text-[11px] text-sub">tap</span>
            </>
          ) : (
            <>
              <span
                className="text-[27px] font-bold leading-7 tabular-nums"
                style={{ color }}
              >
                {strokes}
              </span>
              <span className="text-[10px] font-medium" style={{ color }}>
                {scoreLabel(strokes, par)}
              </span>
            </>
          )}
        </button>

        <button
          onClick={() => onChange((strokes ?? par) + 1)}
          className="press flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-card2 active:bg-accent-press/30"
          aria-label={`Plus for ${name}`}
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

/** Stylized hole diagram with simulated GPS distance. */
function HoleMap({
  courseId,
  holeNumber,
  par,
  length,
  windDeg,
  windMs
}: {
  courseId: string;
  holeNumber: number;
  par: number;
  length: number;
  windDeg: number;
  windMs: number;
}) {
  const [distance, setDistance] = useState(length);

  useEffect(() => {
    setDistance(length);
    const rng = mulberry32(hashString(`${courseId}-${holeNumber}-gps`) + Date.now() % 97);
    const id = window.setInterval(() => {
      setDistance((d) => {
        const floor = 9 + Math.round(rng() * 5);
        if (d <= floor) return d;
        return Math.max(floor, d - (3 + Math.round(rng() * 6)));
      });
    }, 1600);
    return () => window.clearInterval(id);
  }, [courseId, holeNumber, length]);

  const rng = mulberry32(hashString(`${courseId}-${holeNumber}`));
  const bend = (rng() - 0.5) * 130;
  const trees = Array.from({ length: 14 }, () => ({
    x: 30 + rng() * 260,
    y: 60 + rng() * 260,
    r: 5 + rng() * 9
  })).filter((t) => Math.abs(t.x - (160 + bend * ((360 - t.y) / 300))) > 34);

  const progress = 1 - Math.max(0, (distance - 10) / Math.max(1, length - 10));
  const discY = 370 - progress * 300;
  const discX = 160 + bend * Math.sin((progress * Math.PI) / 1.15) * 0.8;

  return (
    <div className="px-4 pt-4">
      <div className="relative overflow-hidden rounded-card bg-card">
        <svg viewBox="0 0 320 420" className="w-full">
          <defs>
            <linearGradient id="fairway" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="var(--c-card2)" />
              <stop offset="1" stopColor="var(--c-card)" />
            </linearGradient>
          </defs>
          <rect width="320" height="420" fill="url(#fairway)" />
          {trees.map((t, i) => (
            <circle
              key={i}
              cx={t.x}
              cy={t.y}
              r={t.r}
              fill="var(--c-sub)"
              opacity="0.16"
            />
          ))}
          {/* Fairway line tee → basket */}
          <path
            d={`M 160 375 Q ${160 + bend} 220 160 48`}
            stroke="var(--c-accent)"
            strokeWidth="2"
            strokeDasharray="6 7"
            fill="none"
            opacity="0.75"
          />
          {/* Tee pad */}
          <rect x="146" y="372" width="28" height="16" rx="3" fill="var(--c-sub)" opacity="0.55" />
          <text x="160" y="404" textAnchor="middle" fontSize="10" fill="var(--c-sub)" fontWeight="600">
            TEE
          </text>
          {/* Basket */}
          <circle cx="160" cy="42" r="13" fill="none" stroke="var(--c-accent)" strokeWidth="2" />
          <circle cx="160" cy="42" r="4.5" fill="var(--c-accent)" />
          <text x="160" y="20" textAnchor="middle" fontSize="10" fill="var(--c-sub)" fontWeight="600">
            BASKET
          </text>
          {/* Simulated player position */}
          <circle cx={discX} cy={discY} r="7" fill="var(--c-accent-hi)">
            <animate attributeName="opacity" values="1;0.5;1" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx={discX} cy={discY} r="12" fill="none" stroke="var(--c-accent-hi)" strokeWidth="1.5" opacity="0.4" />
        </svg>

        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-app/80 px-2.5 py-1 text-[11px] font-bold text-accent backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          GPS
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-app/80 px-2.5 py-1 text-[11px] font-semibold text-sub backdrop-blur">
          <Navigation
            size={11}
            className="text-accent-hi"
            style={{ transform: `rotate(${windDeg + 180}deg)` }}
            fill="currentColor"
          />
          {windMs} m/s
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-cell bg-app/85 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sub">
              Distance to basket
            </p>
            <p className="text-[26px] font-bold leading-7 tabular-nums">
              {distance} m
            </p>
          </div>
          <div className="text-right text-[12px] leading-snug text-sub">
            <p>Par {par}</p>
            <p>{length} m from tee</p>
          </div>
        </div>
      </div>
      <p className="px-1 pt-2 text-center text-[11px] text-sub">
        Simulated GPS · positions are illustrative in this demo
      </p>
    </div>
  );
}
