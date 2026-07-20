import type { Course, Round } from "../types";

export function formatToPar(n: number): string {
  if (n === 0) return "E";
  return n > 0 ? `+${n}` : `${n}`;
}

export type ScoreClass = "birdie" | "par" | "bogey" | "double" | "none";

export function classifyScore(strokes: number | null, par: number): ScoreClass {
  if (strokes == null || strokes === 0) return "none";
  const diff = strokes - par;
  if (diff <= -1) return "birdie";
  if (diff === 0) return "par";
  if (diff === 1) return "bogey";
  return "double";
}

export const scoreColors: Record<ScoreClass, string> = {
  birdie: "#30D158",
  par: "#8E8E93",
  bogey: "#FF9F0A",
  double: "#FF453A",
  none: "transparent"
};

export function scoreLabel(strokes: number, par: number): string {
  const diff = strokes - par;
  if (strokes === 1) return "Ace";
  if (diff <= -3) return "Albatross";
  if (diff === -2) return "Eagle";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double bogey";
  return `+${diff}`;
}

export function playerTotals(
  scores: (number | null)[],
  course: Course
): { strokes: number; toPar: number; holesPlayed: number } {
  let strokes = 0;
  let toPar = 0;
  let holesPlayed = 0;
  scores.forEach((s, i) => {
    if (s != null && s > 0) {
      strokes += s;
      toPar += s - course.holes[i].par;
      holesPlayed++;
    }
  });
  return { strokes, toPar, holesPlayed };
}

export function coursePar(course: Course): number {
  return course.holes.reduce((a, h) => a + h.par, 0);
}

export function roundToPar(round: Round, course: Course, playerId: string): number {
  return playerTotals(round.scores[playerId] ?? [], course).toPar;
}

export interface ScoreCounts {
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubles: number;
}

export function countScores(
  scores: (number | null)[],
  course: Course,
  acc?: ScoreCounts
): ScoreCounts {
  const c = acc ?? { eagles: 0, birdies: 0, pars: 0, bogeys: 0, doubles: 0 };
  scores.forEach((s, i) => {
    if (s == null || s === 0) return;
    const diff = s - course.holes[i].par;
    if (diff <= -2) c.eagles++;
    else if (diff === -1) c.birdies++;
    else if (diff === 0) c.pars++;
    else if (diff === 1) c.bogeys++;
    else c.doubles++;
  });
  return c;
}
