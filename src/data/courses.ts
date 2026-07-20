import type { Course, Hole, Review } from "../types";
import { hashString, mulberry32, pick } from "../lib/random";

interface CourseSeed {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  rating: number;
  ratingCount: number;
  holeCount: 9 | 18 | 20;
  description: string;
}

const SEEDS: CourseSeed[] = [
  {
    id: "tali",
    name: "Tali DiscGolfPark",
    city: "Helsinki",
    country: "Finland",
    lat: 60.2131,
    lng: 24.8664,
    rating: 4.6,
    ratingCount: 1284,
    holeCount: 18,
    description:
      "A classic parkland layout weaving through the old Tali manor grounds. Tight wooded lanes on the front nine open into long, windswept field holes on the back. One of the busiest courses in the Nordics — go early on weekends."
  },
  {
    id: "kivikko",
    name: "Kivikko DiscGolfPark",
    city: "Helsinki",
    country: "Finland",
    lat: 60.2344,
    lng: 25.0621,
    rating: 4.4,
    ratingCount: 976,
    holeCount: 18,
    description:
      "Rocky, technical terrain built on granite outcrops with dramatic elevation for the region. Precise placement beats raw power on almost every hole. Concrete tees throughout."
  },
  {
    id: "siltamaki",
    name: "Siltamäki Frisbeegolf",
    city: "Helsinki",
    country: "Finland",
    lat: 60.2751,
    lng: 24.9832,
    rating: 4.1,
    ratingCount: 421,
    holeCount: 9,
    description:
      "A friendly nine along the Keravanjoki river — open fairways, short walks between holes and great for an after-work loop. Popular with beginners and families."
  },
  {
    id: "oittaa",
    name: "Oittaa DiscGolfPark",
    city: "Espoo",
    country: "Finland",
    lat: 60.2634,
    lng: 24.6481,
    rating: 4.7,
    ratingCount: 1102,
    holeCount: 18,
    description:
      "Championship-level track by lake Bodom. Long pine-forest fairways, well-defined OB and beautiful lake views on holes 12–14. Hosts national tour events every season."
  },
  {
    id: "puolarmaari",
    name: "Puolarmaari Frisbeegolf",
    city: "Espoo",
    country: "Finland",
    lat: 60.1628,
    lng: 24.7351,
    rating: 4.0,
    ratingCount: 356,
    holeCount: 9,
    description:
      "Compact wooded nine in central Espoo. Short but sneaky — low ceilings and guardian trees punish lazy lines. Ideal for putting and approach practice."
  },
  {
    id: "keimola",
    name: "Keimolanmäki DiscGolfPark",
    city: "Vantaa",
    country: "Finland",
    lat: 60.3241,
    lng: 24.8342,
    rating: 4.5,
    ratingCount: 803,
    holeCount: 18,
    description:
      "Built on the old Keimola motor circuit hill. Big elevation swings, huge sightlines and a monster 160 m downhill finisher. Windy on the open top section."
  },
  {
    id: "beast",
    name: "Nokia DiscGolfPark — The Beast",
    city: "Nokia",
    country: "Finland",
    lat: 61.4782,
    lng: 23.4541,
    rating: 4.9,
    ratingCount: 1567,
    holeCount: 20,
    description:
      "Finland's most famous course and a true championship beast: 20 holes of pro-length fairways, punishing rough and legendary risk-reward par 5s. Bring every disc you own."
  },
  {
    id: "hervanta",
    name: "Hervanta DiscGolfPark",
    city: "Tampere",
    country: "Finland",
    lat: 61.4463,
    lng: 23.8581,
    rating: 4.3,
    ratingCount: 688,
    holeCount: 18,
    description:
      "Student-city staple next to the university campus. Fast-playing forest layout with a good mix of hyzer and anhyzer lines. Well maintained, lit for winter rounds."
  },
  {
    id: "laajavuori",
    name: "Laajavuori DiscGolfPark",
    city: "Jyväskylä",
    country: "Finland",
    lat: 62.2631,
    lng: 25.6812,
    rating: 4.8,
    ratingCount: 1345,
    holeCount: 18,
    description:
      "Ski-resort course with serious vertical. Signature hole 7 throws off the fell top with a 40 m drop. Demanding but fair — a bucket-list round for every Finnish player."
  },
  {
    id: "meritoppila",
    name: "Meri-Toppila DiscGolfPark",
    city: "Oulu",
    country: "Finland",
    lat: 65.0302,
    lng: 25.4432,
    rating: 4.2,
    ratingCount: 512,
    holeCount: 18,
    description:
      "Seaside park course in northern Oulu. Flat but exposed — the Gulf of Bothnia wind is the real hazard. Fast greens and excellent signage."
  },
  {
    id: "kralingse",
    name: "Kralingse Bos Disc Golf",
    city: "Rotterdam",
    country: "Netherlands",
    lat: 51.9362,
    lng: 4.5121,
    rating: 4.4,
    ratingCount: 447,
    holeCount: 18,
    description:
      "The Netherlands' flagship course in Rotterdam's Kralingse forest, right by the lake. Flat, tree-lined fairways where wind shaping decides everything. Lively local club scene."
  },
  {
    id: "amsterdamse",
    name: "Amsterdamse Bos Disc Golf",
    city: "Amstelveen",
    country: "Netherlands",
    lat: 52.3112,
    lng: 4.8271,
    rating: 4.0,
    ratingCount: 289,
    holeCount: 9,
    description:
      "Relaxed nine in the vast Amsterdamse Bos park. Wide open with a few water carries — perfect warm-up before club evenings on Thursdays."
  }
];

function makeHoles(seedId: string, count: number): Hole[] {
  const rng = mulberry32(hashString(seedId));
  const holes: Hole[] = [];
  for (let i = 1; i <= count; i++) {
    const r = rng();
    let par: number;
    // The Beast plays long; small courses play short.
    const long = seedId === "beast" || seedId === "oittaa" || seedId === "laajavuori";
    if (long) {
      par = r < 0.5 ? 3 : r < 0.85 ? 4 : 5;
    } else if (count === 9) {
      par = r < 0.85 ? 3 : 4;
    } else {
      par = r < 0.72 ? 3 : r < 0.96 ? 4 : 5;
    }
    let length: number;
    if (par === 3) length = 55 + Math.round(rng() * 65); // 55–120
    else if (par === 4) length = 125 + Math.round(rng() * 60); // 125–185
    else length = 190 + Math.round(rng() * 70); // 190–260
    holes.push({ number: i, par, length });
  }
  return holes;
}

const REVIEW_AUTHORS = [
  "Mikko T.",
  "Anna-Liisa V.",
  "Jesse K.",
  "Petra H.",
  "Daan V.",
  "Sanni M.",
  "Tuomas R.",
  "Lotte B."
];

const REVIEW_TEXTS = [
  "Fairways in great shape right now. Tee signs are clear and the flow between holes is logical. Will be back.",
  "Fun layout with a couple of standout holes. Gets crowded on weekend afternoons — weekday mornings are perfect.",
  "Challenging but fair. First-timers should take the short tees. The finishing stretch is fantastic.",
  "Baskets catch really well and the OB lines are clearly marked. One of my favourite courses in the area.",
  "Some muddy spots after rain near the low holes, otherwise excellent. Bring a towel in spring.",
  "Great mix of open and wooded holes. Signature hole alone is worth the trip.",
  "Well maintained and easy to follow even without the app. Friendly locals gave us line tips.",
  "Solid course for all skill levels. Parking and facilities close to hole 1."
];

function makeReviews(seedId: string, rating: number): Review[] {
  const rng = mulberry32(hashString(seedId + "-reviews"));
  const n = 3;
  const out: Review[] = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const daysAgo = 4 + Math.floor(rng() * 120);
    out.push({
      id: `${seedId}-rev-${i}`,
      author: pick(rng, REVIEW_AUTHORS),
      rating: Math.max(3, Math.min(5, Math.round(rating + (rng() - 0.5) * 2))),
      date: new Date(now - daysAgo * 86400000).toISOString(),
      text: REVIEW_TEXTS[(hashString(seedId) + i * 3) % REVIEW_TEXTS.length]
    });
  }
  return out;
}

export const COURSES: Course[] = SEEDS.map((s) => ({
  id: s.id,
  name: s.name,
  city: s.city,
  country: s.country,
  lat: s.lat,
  lng: s.lng,
  rating: s.rating,
  ratingCount: s.ratingCount,
  holes: makeHoles(s.id, s.holeCount),
  description: s.description,
  reviews: makeReviews(s.id, s.rating)
}));

export function getCourse(id: string): Course {
  const c = COURSES.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown course: ${id}`);
  return c;
}
