import type { FeedPost, Round, Tournament } from "../types";
import { COURSES } from "./courses";
import { CURRENT_USER, FRIENDS } from "./players";
import { mulberry32, pick } from "../lib/random";

/**
 * Generates ~15 historical rounds for the current user over the past 6 months.
 * Deterministic apart from being anchored to "now" at seed time; results are
 * persisted to localStorage on first launch.
 */
export function generateHistoricalRounds(): Round[] {
  const rng = mulberry32(20260720);
  const rounds: Round[] = [];
  const courseIds = [
    "tali", "kivikko", "tali", "oittaa", "siltamaki", "keimola", "tali",
    "hervanta", "oittaa", "kivikko", "beast", "puolarmaari", "laajavuori",
    "tali", "kralingse"
  ];
  const now = Date.now();

  courseIds.forEach((courseId, i) => {
    const course = COURSES.find((c) => c.id === courseId)!;
    // Spread over ~175 days, newest last. Slight improvement over time.
    const daysAgo = Math.round(175 - (170 * i) / (courseIds.length - 1) + rng() * 6 - 3);
    const start = new Date(now - daysAgo * 86400000);
    start.setHours(10 + Math.floor(rng() * 8), Math.floor(rng() * 60), 0, 0);

    // Skill drifts from ~+0.55 to ~+0.35 to-par per hole as the season progresses.
    let skill = 0.42 - (0.24 * i) / (courseIds.length - 1);
    if (i === 13) skill = -0.2; // personal best round at Tali

    const players = [{ id: CURRENT_USER.id, name: CURRENT_USER.name }];
    // Roughly half of rounds include 1–2 friends
    if (rng() < 0.55) {
      const shuffled = [...FRIENDS].sort(() => rng() - 0.5);
      shuffled.slice(0, 1 + (rng() < 0.4 ? 1 : 0)).forEach((f) =>
        players.push({ id: f.id, name: f.name })
      );
    }

    const scores: Record<string, (number | null)[]> = {};
    players.forEach((p) => {
      const pSkill = p.id === CURRENT_USER.id ? skill : 0.05 + rng() * 0.35;
      scores[p.id] = course.holes.map((h) => {
        const r = rng();
        const s = pSkill + (h.length > 110 ? 0.06 : 0);
        const base = h.par;
        if (r < 0.2 - s * 0.28) return Math.max(1, base - 1); // birdie
        if (r < 0.68 - s * 0.35) return base;
        if (r < 0.93 - s * 0.12) return base + 1;
        if (r < 0.985 - s * 0.03) return base + 2;
        return base + 3;
      });
    });

    const durationMin = 70 + Math.floor(rng() * 60);
    rounds.push({
      id: `r-${start.getTime()}`,
      courseId,
      startedAt: start.toISOString(),
      endedAt: new Date(start.getTime() + durationMin * 60000).toISOString(),
      players,
      scores
    });
  });

  return rounds;
}

export function generateFeed(): FeedPost[] {
  const now = Date.now();
  const h = 3600000;
  const posts: FeedPost[] = [
    {
      id: "p1", authorId: "f-sofia", kind: "round", date: new Date(now - 2 * h).toISOString(),
      title: "finished a round at Oittaa DiscGolfPark",
      body: "Bogey-free back nine. The lake holes were playing calm for once — went 3 down through 12–14.",
      courseId: "oittaa", score: -3, likes: 12,
      comments: [
        { id: "c1", authorId: "f-onni", text: "Bogey-free at Oittaa?? Teach me", date: new Date(now - 1.5 * h).toISOString() },
        { id: "c2", authorId: "f-aino", text: "That back nine is unreal 🔥", date: new Date(now - 1 * h).toISOString() }
      ]
    },
    {
      id: "p2", authorId: "f-eetu", kind: "personal-best", date: new Date(now - 6 * h).toISOString(),
      title: "set a personal best at Tali DiscGolfPark",
      body: "Finally broke my Tali curse. Four birdies, and the new forehand held up on 16 and 17.",
      courseId: "tali", score: 1, likes: 18,
      comments: [
        { id: "c3", authorId: "me", text: "Huge! That forehand work is paying off", date: new Date(now - 5 * h).toISOString() }
      ]
    },
    {
      id: "p3", authorId: "f-aino", kind: "review", date: new Date(now - 11 * h).toISOString(),
      title: "reviewed Keimolanmäki DiscGolfPark",
      body: "★★★★★ — The downhill finisher never gets old. Wind was howling on the top section but the course drains so well after rain.",
      courseId: "keimola", likes: 7, comments: []
    },
    {
      id: "p4", authorId: "f-juho", kind: "round", date: new Date(now - 22 * h).toISOString(),
      title: "finished a round at Siltamäki Frisbeegolf",
      body: "Quick after-work nine with the river loop crew. Lost a disc in the Keravanjoki, found two. Net positive.",
      courseId: "siltamaki", score: 5, likes: 9,
      comments: [
        { id: "c4", authorId: "f-venla", text: "The river giveth 😄", date: new Date(now - 20 * h).toISOString() }
      ]
    },
    {
      id: "p5", authorId: "f-onni", kind: "milestone", date: new Date(now - 30 * h).toISOString(),
      title: "reached 250 career rounds",
      body: "Round 250 in the books. Started with a single Leopard in 2021 — now the bag weighs more than my groceries.",
      likes: 24,
      comments: [
        { id: "c5", authorId: "f-sofia", text: "Congrats! 🎉", date: new Date(now - 28 * h).toISOString() },
        { id: "c6", authorId: "f-leo", text: "Legend", date: new Date(now - 26 * h).toISOString() }
      ]
    },
    {
      id: "p6", authorId: "f-emma", kind: "round", date: new Date(now - 2 * 24 * h).toISOString(),
      title: "finished a round at Hervanta DiscGolfPark",
      body: "Night round under the lights. Glow discs and -1 through the front — then the woods ate me alive.",
      courseId: "hervanta", score: 4, likes: 11,
      comments: []
    },
    {
      id: "p7", authorId: "f-venla", kind: "review", date: new Date(now - 3 * 24 * h).toISOString(),
      title: "reviewed Laajavuori DiscGolfPark",
      body: "★★★★☆ — Hole 7 off the fell is the best single hole in Finland, fight me. Bring trail shoes, the climbs are real.",
      courseId: "laajavuori", likes: 15,
      comments: [
        { id: "c7", authorId: "f-emma", text: "Not fighting you, you're right", date: new Date(now - 2.7 * 24 * h).toISOString() }
      ]
    },
    {
      id: "p8", authorId: "f-leo", kind: "round", date: new Date(now - 4 * 24 * h).toISOString(),
      title: "finished a round at Kralingse Bos Disc Golf",
      body: "Rotterdam wind final boss. Threw a putter 60 m on hole 4 and it still came back at me.",
      courseId: "kralingse", score: 8, likes: 6,
      comments: []
    },
    {
      id: "p9", authorId: "f-sofia", kind: "milestone", date: new Date(now - 5 * 24 * h).toISOString(),
      title: "won the Helsinki Weekly at Kivikko",
      body: "Took the weekly by two strokes! CTP on 7 as well — 1.4 m from the chains off the tee.",
      courseId: "kivikko", likes: 31,
      comments: [
        { id: "c8", authorId: "me", text: "Unstoppable lately 👏", date: new Date(now - 4.8 * 24 * h).toISOString() },
        { id: "c9", authorId: "f-eetu", text: "GG, that 7 tee shot was filthy", date: new Date(now - 4.5 * 24 * h).toISOString() }
      ]
    },
    {
      id: "p10", authorId: "f-aino", kind: "round", date: new Date(now - 6 * 24 * h).toISOString(),
      title: "finished a round at Nokia DiscGolfPark — The Beast",
      body: "The Beast remains undefeated. +9 and honestly proud of it. Hole 18 par 5 took a chunk of my soul.",
      courseId: "beast", score: 9, likes: 14,
      comments: [
        { id: "c10", authorId: "f-juho", text: "+9 at the Beast is a win in my book", date: new Date(now - 5.5 * 24 * h).toISOString() }
      ]
    }
  ];
  return posts;
}

export function generateTournaments(): Tournament[] {
  const now = Date.now();
  const rng = mulberry32(777);
  const liveNames = [
    "Sofia Laine", "Onni Salmi", "Aino Korhonen", "Mikko Tervo", "Eetu Virtanen",
    "Petra Hakala", "Emma Niemi", "Jesse Kallio", "Venla Rantanen", "Tuomas Rinne",
    "Juho Mäkelä", "Leo Heikkinen"
  ];
  const standings = liveNames
    .map((name, i) => ({
      name,
      toPar: Math.round(-4 + i * 1.4 + rng() * 2),
      thru: (i < 8 ? 14 + Math.floor(rng() * 4) : "F") as number | "F"
    }))
    .sort((a, b) => a.toPar - b.toPar);

  return [
    {
      id: "t-kivikko-open",
      name: "Kivikko Autumn Open",
      courseId: "kivikko",
      date: new Date(now - 3 * 3600000).toISOString(),
      status: "live",
      entryFee: "15 €",
      players: 12,
      format: "Singles · 18 holes · PDGA C-tier",
      ctp: { hole: 7, name: "Sofia Laine", distance: "1.4 m" },
      standings
    },
    {
      id: "t-beast-champs",
      name: "Beast Championship Weekend",
      courseId: "beast",
      date: new Date(now + 12 * 86400000).toISOString(),
      status: "upcoming",
      entryFee: "35 €",
      players: 72,
      format: "Singles · 2 × 20 holes · PDGA B-tier",
      ctp: { hole: 11, name: "—", distance: "—" },
      standings: []
    }
  ];
}
