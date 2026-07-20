import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Play, Star } from "lucide-react";
import { useApp } from "../store/AppStore";
import { COURSES } from "../data/courses";
import { Card, LargeTitle, SectionLabel, Stars } from "../components/ui";
import { LeafletMap } from "../components/LeafletMap";
import { coursePar } from "../lib/scoring";
import { formatDate } from "../lib/format";

export function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, rounds } = useApp();
  const course = COURSES.find((c) => c.id === id);

  if (!course) {
    return (
      <div>
        <LargeTitle title="Course" back />
        <p className="px-4 pt-6 text-[15px] text-sub">Course not found.</p>
      </div>
    );
  }

  const fav = favorites.includes(course.id);
  const playedHere = rounds.filter((r) => r.courseId === course.id).length;
  const totalLength = course.holes.reduce((a, h) => a + h.length, 0);

  return (
    <div>
      <LargeTitle
        title={course.name}
        back
        right={
          <button
            onClick={() => toggleFavorite(course.id)}
            className="press flex h-9 w-9 items-center justify-center rounded-full bg-card2"
            aria-label={fav ? "Remove favorite" : "Add favorite"}
          >
            <Star
              size={19}
              className={fav ? "text-accent" : "text-sub"}
              fill={fav ? "currentColor" : "none"}
            />
          </button>
        }
      >
        <p className="flex items-center gap-1 text-[15px] text-sub">
          <MapPin size={14} />
          {course.city}, {course.country}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-[14px] text-sub">
          <Stars rating={course.rating} size={15} />
          <span>
            {course.rating.toFixed(1)} · {course.ratingCount} ratings
          </span>
        </div>
      </LargeTitle>

      <div className="px-4 pt-1">
        <LeafletMap
          center={[course.lat, course.lng]}
          zoom={14}
          markers={[
            { id: course.id, lat: course.lat, lng: course.lng, label: course.name }
          ]}
          className="h-[180px] w-full overflow-hidden rounded-card"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pt-3">
        {[
          { label: "Holes", value: `${course.holes.length}` },
          { label: "Par", value: `${coursePar(course)}` },
          { label: "Length", value: `${(totalLength / 1000).toFixed(1)} km` }
        ].map((s) => (
          <Card key={s.label} className="p-3 text-center">
            <p className="text-[20px] font-bold tabular-nums">{s.value}</p>
            <p className="text-[11px] font-medium text-sub">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="px-4 pt-3">
        <button
          onClick={() => navigate(`/play/players?course=${course.id}`)}
          className="press flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-accent text-[16px] font-bold text-white shadow-lg shadow-accent/20"
        >
          <Play size={18} fill="currentColor" /> Play this course
        </button>
        {playedHere > 0 && (
          <p className="pt-2 text-center text-[13px] text-sub">
            You've played here {playedHere} {playedHere === 1 ? "time" : "times"}
          </p>
        )}
      </div>

      <div className="px-4 pt-5">
        <p className="text-[14px] leading-relaxed text-sub">{course.description}</p>
      </div>

      <SectionLabel>Holes</SectionLabel>
      <div className="px-4">
        <Card className="divide-y divide-sep">
          {course.holes.map((h) => (
            <div key={h.number} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-7 text-[15px] font-bold tabular-nums text-accent">
                {h.number}
              </span>
              <div className="h-1 flex-1 rounded-full bg-card2">
                <div
                  className="h-1 rounded-full bg-accent/50"
                  style={{
                    width: `${Math.min(100, (h.length / 260) * 100)}%`
                  }}
                />
              </div>
              <span className="w-12 text-right text-[14px] tabular-nums text-sub">
                {h.length} m
              </span>
              <span className="w-12 text-right text-[14px] font-semibold tabular-nums">
                Par {h.par}
              </span>
            </div>
          ))}
        </Card>
      </div>

      <SectionLabel>Reviews</SectionLabel>
      <div className="space-y-2.5 px-4 pb-4">
        {course.reviews.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold">{r.author}</p>
              <span className="text-[12px] text-sub">{formatDate(r.date)}</span>
            </div>
            <div className="mt-1">
              <Stars rating={r.rating} />
            </div>
            <p className="mt-2 text-[14px] leading-snug text-sub">{r.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
