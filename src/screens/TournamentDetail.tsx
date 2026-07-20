import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Crosshair, Share2, Ticket, Users } from "lucide-react";
import { useApp } from "../store/AppStore";
import { getCourse } from "../data/courses";
import { generateTournaments } from "../data/seed";
import { Avatar, Card, LargeTitle, SectionLabel } from "../components/ui";
import { coursePar, formatToPar } from "../lib/scoring";
import { formatDate } from "../lib/format";

export function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const t = generateTournaments().find((x) => x.id === id);

  if (!t) {
    return (
      <div>
        <LargeTitle title="Tournament" back />
        <p className="px-4 pt-6 text-[15px] text-sub">Tournament not found.</p>
      </div>
    );
  }

  const course = getCourse(t.courseId);

  const share = async () => {
    const lines = [
      `🏆 ${t.name} — ${course.name}`,
      t.status === "live" ? "Live standings:" : `Starts ${formatDate(t.date)}`,
      ...t.standings
        .slice(0, 5)
        .map(
          (s, i) =>
            `${i + 1}. ${s.name} ${formatToPar(s.toPar)}${
              s.thru === "F" ? " (F)" : ` (thru ${s.thru})`
            }`
        ),
      "Followed on Chains ⛓️"
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      showToast("Results copied to clipboard");
    } catch {
      showToast("Couldn't access clipboard");
    }
  };

  return (
    <div>
      <LargeTitle
        title={t.name}
        back
        right={
          <button
            onClick={share}
            className="press flex h-8 w-8 items-center justify-center rounded-full bg-card2 text-accent"
            aria-label="Share results"
          >
            <Share2 size={16} />
          </button>
        }
      >
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {t.status === "live" ? (
            <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Live now
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-card2 px-2.5 py-1 text-[12px] font-bold text-sub">
              <CalendarDays size={12} /> {formatDate(t.date)}
            </span>
          )}
          <span className="flex items-center gap-1 rounded-full bg-card2 px-2.5 py-1 text-[12px] font-bold text-sub">
            <Ticket size={12} /> Entry {t.entryFee}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-card2 px-2.5 py-1 text-[12px] font-bold text-sub">
            <Users size={12} /> {t.players} players
          </span>
        </div>
      </LargeTitle>

      <div className="px-4 pt-1">
        <Card
          onClick={() => navigate(`/courses/${course.id}`)}
          className="flex items-center justify-between p-4"
        >
          <div>
            <p className="text-[15px] font-semibold">{course.name}</p>
            <p className="text-[13px] text-sub">
              {course.city} · {course.holes.length} holes · par {coursePar(course)}
            </p>
            <p className="mt-0.5 text-[13px] text-sub">{t.format}</p>
          </div>
          <span className="text-[13px] font-semibold text-accent">View</span>
        </Card>
      </div>

      {t.status === "live" ? (
        <>
          <SectionLabel>Standings</SectionLabel>
          <div className="px-4">
            <Card className="divide-y divide-sep">
              {t.standings.map((row, i) => (
                <div key={row.name} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`w-6 text-[15px] font-bold tabular-nums ${
                      i === 0 ? "text-accent" : "text-sub"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <Avatar name={row.name} size={34} />
                  <p className="flex-1 truncate text-[14px] font-semibold">
                    {row.name}
                  </p>
                  <span className="text-[12px] tabular-nums text-sub">
                    {row.thru === "F" ? "F" : `thru ${row.thru}`}
                  </span>
                  <span
                    className={`w-10 text-right text-[16px] font-bold tabular-nums ${
                      row.toPar < 0 ? "text-birdie" : row.toPar === 0 ? "text-sub" : ""
                    }`}
                  >
                    {formatToPar(row.toPar)}
                  </span>
                </div>
              ))}
            </Card>
          </div>

          <SectionLabel>Closest to pin</SectionLabel>
          <div className="px-4 pb-6">
            <Card className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/12 text-accent">
                <Crosshair size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold">
                  Hole {t.ctp.hole} · {t.ctp.name}
                </p>
                <p className="text-[13px] text-sub">
                  {t.ctp.distance} from the basket
                </p>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="px-4 pt-4 pb-6">
          <Card className="p-5 text-center">
            <p className="text-[16px] font-bold">Registration open</p>
            <p className="mx-auto mt-1 max-w-[280px] text-[13px] text-sub">
              {t.players} spots · two rounds of {course.holes.length} holes at{" "}
              {course.name}. CTP on hole {t.ctp.hole} sponsored by the local club.
            </p>
            <button
              onClick={() => showToast("Registration is simulated in this demo")}
              className="press mt-4 w-full rounded-full bg-accent py-3 text-[15px] font-bold text-white"
            >
              Register · {t.entryFee}
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}
