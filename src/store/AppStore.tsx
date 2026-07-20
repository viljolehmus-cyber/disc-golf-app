import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type {
  ActiveRound,
  FeedPost,
  Round,
  RoundPlayer,
  ThemePref
} from "../types";
import { generateFeed, generateHistoricalRounds } from "../data/seed";
import * as storage from "./storage";

interface AppState {
  authed: boolean;
  signIn: () => void;
  signOut: () => void;

  themePref: ThemePref;
  setThemePref: (t: ThemePref) => void;
  resolvedTheme: "dark" | "light";

  rounds: Round[];
  addRound: (r: Round) => void;

  favorites: string[];
  toggleFavorite: (courseId: string) => void;

  activeRound: ActiveRound | null;
  startRound: (courseId: string, players: RoundPlayer[], holeCount: number) => void;
  updateActiveRound: (patch: Partial<ActiveRound>) => void;
  setScore: (playerId: string, holeIndex: number, strokes: number | null) => void;
  finishActiveRound: () => Round | null;
  discardActiveRound: () => void;

  feed: FeedPost[];
  likedPosts: string[];
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;

  premium: boolean;
  setPremium: (v: boolean) => void;

  resetDemoData: () => void;

  toast: string | null;
  showToast: (msg: string) => void;
}

const Ctx = createContext<AppState | null>(null);

function systemDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(() => storage.load("authed", false));
  const [themePref, setThemePrefState] = useState<ThemePref>(() =>
    storage.load<ThemePref>("theme", "dark")
  );
  const [systemIsDark, setSystemIsDark] = useState(systemDark);
  const [rounds, setRounds] = useState<Round[]>(() => {
    const existing = storage.load<Round[] | null>("rounds", null);
    if (existing) return existing;
    const seeded = generateHistoricalRounds();
    storage.save("rounds", seeded);
    return seeded;
  });
  const [favorites, setFavorites] = useState<string[]>(() =>
    storage.load("favorites", ["tali", "oittaa"])
  );
  const [activeRound, setActiveRound] = useState<ActiveRound | null>(() =>
    storage.load<ActiveRound | null>("activeRound", null)
  );
  const [feed, setFeed] = useState<FeedPost[]>(() => {
    const existing = storage.load<FeedPost[] | null>("feed", null);
    if (existing) return existing;
    const seeded = generateFeed();
    storage.save("feed", seeded);
    return seeded;
  });
  const [likedPosts, setLikedPosts] = useState<string[]>(() =>
    storage.load("likedPosts", [])
  );
  const [premium, setPremiumState] = useState<boolean>(() =>
    storage.load("premium", false)
  );
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const resolvedTheme: "dark" | "light" =
    themePref === "system" ? (systemIsDark ? "dark" : "light") : themePref;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", resolvedTheme === "dark" ? "#000000" : "#F2F2F7");
  }, [resolvedTheme]);

  const setThemePref = useCallback((t: ThemePref) => {
    setThemePrefState(t);
    storage.save("theme", t);
  }, []);

  const signIn = useCallback(() => {
    setAuthed(true);
    storage.save("authed", true);
  }, []);

  const signOut = useCallback(() => {
    setAuthed(false);
    storage.save("authed", false);
  }, []);

  const addRound = useCallback((r: Round) => {
    setRounds((prev) => {
      const next = [...prev, r];
      storage.save("rounds", next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((courseId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId];
      storage.save("favorites", next);
      return next;
    });
  }, []);

  const startRound = useCallback(
    (courseId: string, players: RoundPlayer[], holeCount: number) => {
      const scores: Record<string, (number | null)[]> = {};
      players.forEach((p) => {
        scores[p.id] = new Array(holeCount).fill(null);
      });
      const ar: ActiveRound = {
        courseId,
        startedAt: new Date().toISOString(),
        players,
        scores,
        currentHole: 1,
        weatherSeed: Math.floor(Math.random() * 1e9)
      };
      setActiveRound(ar);
      storage.save("activeRound", ar);
    },
    []
  );

  const updateActiveRound = useCallback((patch: Partial<ActiveRound>) => {
    setActiveRound((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      storage.save("activeRound", next);
      return next;
    });
  }, []);

  const setScore = useCallback(
    (playerId: string, holeIndex: number, strokes: number | null) => {
      setActiveRound((prev) => {
        if (!prev) return prev;
        const playerScores = [...(prev.scores[playerId] ?? [])];
        playerScores[holeIndex] = strokes;
        const next = {
          ...prev,
          scores: { ...prev.scores, [playerId]: playerScores }
        };
        storage.save("activeRound", next);
        return next;
      });
    },
    []
  );

  const finishActiveRound = useCallback((): Round | null => {
    if (!activeRound) return null;
    const finished: Round = {
      id: `r-${Date.now()}`,
      courseId: activeRound.courseId,
      startedAt: activeRound.startedAt,
      endedAt: new Date().toISOString(),
      players: activeRound.players,
      scores: activeRound.scores
    };
    storage.remove("activeRound");
    setActiveRound(null);
    setRounds((prevRounds) => {
      const next = [...prevRounds, finished];
      storage.save("rounds", next);
      return next;
    });
    return finished;
  }, [activeRound]);

  const discardActiveRound = useCallback(() => {
    setActiveRound(null);
    storage.remove("activeRound");
  }, []);

  const toggleLike = useCallback(
    (postId: string) => {
      const liked = likedPosts.includes(postId);
      const nextLiked = liked
        ? likedPosts.filter((id) => id !== postId)
        : [...likedPosts, postId];
      storage.save("likedPosts", nextLiked);
      setLikedPosts(nextLiked);
      setFeed((pf) => {
        const nf = pf.map((p) =>
          p.id === postId ? { ...p, likes: p.likes + (liked ? -1 : 1) } : p
        );
        storage.save("feed", nf);
        return nf;
      });
    },
    [likedPosts]
  );

  const addComment = useCallback((postId: string, text: string) => {
    setFeed((prev) => {
      const next = prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `c-${Date.now()}`,
                  authorId: "me",
                  text,
                  date: new Date().toISOString()
                }
              ]
            }
          : p
      );
      storage.save("feed", next);
      return next;
    });
  }, []);

  const setPremium = useCallback((v: boolean) => {
    setPremiumState(v);
    storage.save("premium", v);
  }, []);

  const resetDemoData = useCallback(() => {
    storage.clearAll();
    window.location.hash = "#/";
    window.location.reload();
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      authed, signIn, signOut,
      themePref, setThemePref, resolvedTheme,
      rounds, addRound,
      favorites, toggleFavorite,
      activeRound, startRound, updateActiveRound, setScore,
      finishActiveRound, discardActiveRound,
      feed, likedPosts, toggleLike, addComment,
      premium, setPremium,
      resetDemoData,
      toast, showToast
    }),
    [
      authed, signIn, signOut, themePref, setThemePref, resolvedTheme, rounds,
      addRound, favorites, toggleFavorite, activeRound, startRound,
      updateActiveRound, setScore, finishActiveRound, discardActiveRound, feed,
      likedPosts, toggleLike, addComment, premium, setPremium, resetDemoData,
      toast, showToast
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
