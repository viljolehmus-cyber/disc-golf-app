import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Plus, UserPlus } from "lucide-react";
import { useApp } from "../store/AppStore";
import { getCourse } from "../data/courses";
import { CURRENT_USER, FRIENDS } from "../data/players";
import type { RoundPlayer } from "../types";
import { Avatar, Card } from "../components/ui";
import { coursePar } from "../lib/scoring";

export function PlayerPicker() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const courseId = params.get("course") ?? "tali";
  const course = getCourse(courseId);
  const { startRound } = useApp();

  const [selected, setSelected] = useState<string[]>([]);
  const [guests, setGuests] = useState<RoundPlayer[]>([]);
  const [guestName, setGuestName] = useState("");

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const addGuest = () => {
    const name = guestName.trim();
    if (!name) return;
    setGuests((g) => [...g, { id: `guest-${Date.now()}`, name, isGuest: true }]);
    setGuestName("");
  };

  const start = () => {
    const players: RoundPlayer[] = [
      { id: CURRENT_USER.id, name: CURRENT_USER.name },
      ...FRIENDS.filter((f) => selected.includes(f.id)).map((f) => ({
        id: f.id,
        name: f.name
      })),
      ...guests
    ];
    startRound(courseId, players, course.holes.length);
    navigate("/round", { replace: true });
  };

  const totalPlayers = 1 + selected.length + guests.length;

  return (
    <div className="flex min-h-screen flex-col pb-32">
      <div className="sticky top-0 z-30 bg-app/85 backdrop-blur-xl">
        <div className="flex h-[52px] items-center px-4">
          <button
            onClick={() => navigate(-1)}
            className="press -ml-2 flex items-center text-[17px] text-accent"
          >
            <ChevronLeft size={26} strokeWidth={2.2} className="-mr-0.5" />
            Course
          </button>
        </div>
        <div className="px-4 pb-3">
          <p className="text-[28px] font-bold">Add Players</p>
          <p className="text-[14px] text-sub">
            {course.name} · {course.holes.length} holes · par {coursePar(course)}
          </p>
        </div>
      </div>

      <div className="px-4">
        <Card className="divide-y divide-sep">
          <div className="flex items-center gap-3 p-3.5">
            <Avatar name={CURRENT_USER.name} size={40} />
            <div className="flex-1">
              <p className="text-[15px] font-semibold">{CURRENT_USER.name}</p>
              <p className="text-[13px] text-sub">You</p>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white">
              <Check size={16} strokeWidth={3} />
            </div>
          </div>
        </Card>

        <p className="px-1 pb-2 pt-6 text-[13px] font-semibold uppercase tracking-wide text-sub">
          Friends
        </p>
        <Card className="divide-y divide-sep">
          {FRIENDS.map((f) => {
            const on = selected.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggle(f.id)}
                className="flex w-full items-center gap-3 p-3.5 text-left"
              >
                <Avatar name={f.name} size={40} />
                <div className="flex-1">
                  <p className="text-[15px] font-semibold">{f.name}</p>
                  <p className="text-[13px] text-sub">{f.handle}</p>
                </div>
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150 ${
                    on
                      ? "bg-accent text-white"
                      : "bg-transparent text-transparent shadow-[inset_0_0_0_1.5px_var(--c-sep)]"
                  }`}
                >
                  <Check size={16} strokeWidth={3} />
                </div>
              </button>
            );
          })}
        </Card>

        <p className="px-1 pb-2 pt-6 text-[13px] font-semibold uppercase tracking-wide text-sub">
          Guest
        </p>
        <Card className="p-3.5">
          {guests.map((g) => (
            <div key={g.id} className="mb-3 flex items-center gap-3">
              <Avatar name={g.name} size={36} />
              <p className="flex-1 text-[15px] font-semibold">{g.name}</p>
              <button
                onClick={() => setGuests((gs) => gs.filter((x) => x.id !== g.id))}
                className="text-[13px] font-semibold text-sub"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card2 text-sub">
              <UserPlus size={17} />
            </div>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGuest()}
              placeholder="Guest name"
              className="flex-1 bg-transparent text-[15px] placeholder:text-sub"
            />
            <button
              onClick={addGuest}
              disabled={!guestName.trim()}
              className="press flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white disabled:opacity-30"
              aria-label="Add guest"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        </Card>
      </div>

      <div className="safe-b fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-app via-app/95 to-transparent px-4 pb-6 pt-8">
        <button
          onClick={start}
          className="press mx-auto flex h-[54px] w-full max-w-[568px] items-center justify-center rounded-full bg-accent text-[17px] font-bold text-white shadow-lg shadow-accent/25"
        >
          Start round · {totalPlayers} {totalPlayers === 1 ? "player" : "players"}
        </button>
      </div>
    </div>
  );
}
