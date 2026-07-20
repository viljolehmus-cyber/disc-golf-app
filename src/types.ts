export interface Hole {
  number: number;
  par: number;
  length: number; // meters
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string; // ISO
  text: string;
}

export interface Course {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  rating: number;
  ratingCount: number;
  holes: Hole[];
  description: string;
  reviews: Review[];
}

export interface Friend {
  id: string;
  name: string;
  handle: string;
  homeCity: string;
  roundsPlayed: number;
  avgToPar: number;
}

export interface RoundPlayer {
  id: string;
  name: string;
  isGuest?: boolean;
}

export interface Round {
  id: string;
  courseId: string;
  startedAt: string; // ISO
  endedAt: string; // ISO
  players: RoundPlayer[];
  /** playerId -> strokes per hole (index = hole - 1), null = not played */
  scores: Record<string, (number | null)[]>;
}

export interface ActiveRound {
  courseId: string;
  startedAt: string;
  players: RoundPlayer[];
  scores: Record<string, (number | null)[]>;
  currentHole: number; // 1-based
  weatherSeed: number;
}

export interface FeedPost {
  id: string;
  authorId: string;
  kind: "round" | "personal-best" | "review" | "milestone";
  date: string;
  title: string;
  body: string;
  courseId?: string;
  score?: number; // to par
  likes: number;
  comments: { id: string; authorId: string; text: string; date: string }[];
}

export interface TournamentPlayerRow {
  name: string;
  toPar: number;
  thru: number | "F";
}

export interface Tournament {
  id: string;
  name: string;
  courseId: string;
  date: string;
  status: "live" | "upcoming";
  entryFee: string;
  players: number;
  format: string;
  ctp: { hole: number; name: string; distance: string };
  standings: TournamentPlayerRow[];
}

export type ThemePref = "dark" | "light" | "system";
