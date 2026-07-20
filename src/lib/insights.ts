import type { Course, Round } from "../types";
import { playerTotals } from "./scoring";

export interface Insight {
  title: string;
  body: string;
}

/**
 * Rule-based "AI" analysis of a finished round, presented as AI-generated.
 * All numbers are computed from the actual scores.
 */
export function analyzeRound(
  round: Round,
  course: Course,
  playerId: string
): Insight[] {
  const scores = round.scores[playerId] ?? [];
  const played = scores
    .map((s, i) => ({ strokes: s, hole: course.holes[i] }))
    .filter((x) => x.strokes != null && x.strokes > 0) as {
    strokes: number;
    hole: { number: number; par: number; length: number };
  }[];
  if (played.length === 0) return [];

  const out: { severity: number; insight: Insight }[] = [];
  const avgToPar = (xs: typeof played) =>
    xs.reduce((a, x) => a + (x.strokes - x.hole.par), 0) / Math.max(1, xs.length);

  const long = played.filter((x) => x.hole.length >= 100);
  const short = played.filter((x) => x.hole.length < 100);
  if (long.length >= 3 && short.length >= 3) {
    const dl = avgToPar(long);
    const ds = avgToPar(short);
    if (dl - ds > 0.45) {
      out.push({
        severity: (dl - ds) * 2,
        insight: {
          title: "Distance is costing you strokes",
          body: `You averaged ${dl >= 0 ? "+" : ""}${dl.toFixed(1)} on holes over 100 m versus ${
            ds >= 0 ? "+" : ""
          }${ds.toFixed(1)} on shorter ones. Add two field sessions of max-distance drive reps this week — focus on a full reach-back before worrying about speed.`
        }
      });
    } else if (ds - dl > 0.45) {
      out.push({
        severity: (ds - dl) * 2,
        insight: {
          title: "Short game leaking strokes",
          body: `Holes under 100 m played ${ds >= 0 ? "+" : ""}${ds.toFixed(1)} for you today — worse than your long holes (${dl >= 0 ? "+" : ""}${dl.toFixed(1)}). That usually means missed circle-1 putts. Try a daily 20-putt ladder from 5, 7 and 9 m.`
        }
      });
    }
  }

  const doubles = played.filter((x) => x.strokes - x.hole.par >= 2);
  if (doubles.length >= 2) {
    const holesList = doubles.slice(0, 3).map((d) => d.hole.number).join(", ");
    out.push({
      severity: doubles.length,
      insight: {
        title: "Blow-up holes decided this round",
        body: `${doubles.length} holes went double bogey or worse (holes ${holesList}). After a bad drive, take the easy pitch-out — one committed recovery shot per hole would have saved you ${doubles.length} strokes today.`
      }
    });
  }

  if (played.length >= 9) {
    const third = Math.floor(played.length / 3);
    const early = avgToPar(played.slice(0, third));
    const late = avgToPar(played.slice(-third));
    if (late - early > 0.5) {
      out.push({
        severity: (late - early) * 1.5,
        insight: {
          title: "Fading on the closing stretch",
          body: `Your first holes averaged ${early >= 0 ? "+" : ""}${early.toFixed(1)} but the final stretch slipped to ${late >= 0 ? "+" : ""}${late.toFixed(1)}. Build a pre-shot routine you repeat on every tee — consistency late in the round is usually focus, not fatigue.`
        }
      });
    }
  }

  const birdies = played.filter((x) => x.strokes - x.hole.par <= -1);
  if (birdies.length >= 3) {
    out.push({
      severity: 1,
      insight: {
        title: "Birdie looks are there",
        body: `${birdies.length} birdies today shows your lines are working. The next gain is converting pars on the ${
          played.filter((x) => x.strokes === x.hole.par + 1).length
        } holes you bogeyed — track which tee shots left you blocked and pick a safer landing zone.`
      }
    });
  }

  const { toPar } = playerTotals(round.scores[playerId] ?? [], course);
  if (out.length < 2) {
    out.push({
      severity: 0.5,
      insight: {
        title: toPar <= 0 ? "Strong, balanced round" : "Solid baseline round",
        body:
          toPar <= 0
            ? "No major leaks detected — your scoring was spread evenly across hole types. Keep this course in rotation and start attacking pin positions on your approach shots."
            : "Your misses were spread out rather than clustered, which is the easiest profile to improve. Pick one skill (drives, approaches or putting) per practice session instead of mixing all three."
      }
    });
  }

  return out
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 3)
    .map((x) => x.insight);
}

/** Mid-round projected final score-to-par. */
export function predictFinal(
  scores: (number | null)[],
  course: Course
): number | null {
  const played = scores
    .map((s, i) => ({ s, par: course.holes[i].par }))
    .filter((x) => x.s != null && x.s > 0);
  if (played.length < 2) return null;
  const toPar = played.reduce((a, x) => a + (x.s! - x.par), 0);
  const perHole = toPar / played.length;
  const remaining = course.holes.length - played.length;
  // Slight regression toward par for stability early in the round
  const damp = 0.75 + 0.25 * (played.length / course.holes.length);
  return Math.round(toPar + perHole * remaining * damp);
}
