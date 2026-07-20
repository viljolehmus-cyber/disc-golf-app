import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, Search, X } from "lucide-react";
import { COURSES } from "../data/courses";
import { Card, SegmentedControl, Stars } from "../components/ui";
import { LeafletMap } from "../components/LeafletMap";
import { coursePar } from "../lib/scoring";

export function NewRound() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [selectedOnMap, setSelectedOnMap] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COURSES;
    return COURSES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [query]);

  const mapSelection = COURSES.find((c) => c.id === selectedOnMap);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-30 bg-app/85 pb-3 backdrop-blur-xl">
        <div className="flex h-[52px] items-center justify-between px-4">
          <p className="text-[20px] font-bold">New Round</p>
          <button
            onClick={() => navigate("/")}
            className="press flex h-8 w-8 items-center justify-center rounded-full bg-card2 text-sub"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-4">
          <div className="flex items-center gap-2 rounded-cell bg-card2 px-3 py-2">
            <Search size={17} className="shrink-0 text-sub" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses or cities"
              className="w-full bg-transparent text-[16px] placeholder:text-sub"
            />
          </div>
          <SegmentedControl
            className="mt-3"
            value={view}
            onChange={setView}
            options={[
              { value: "list", label: "List" },
              { value: "map", label: "Map" }
            ]}
          />
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-2.5 px-4 pb-10 pt-1">
          {filtered.map((c) => (
            <Card
              key={c.id}
              onClick={() => navigate(`/play/players?course=${c.id}`)}
              className="flex items-center justify-between p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-[16px] font-semibold">{c.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[13px] text-sub">
                  <MapPin size={12} />
                  {c.city}, {c.country}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[13px] text-sub">
                  <Stars rating={c.rating} />
                  <span>
                    {c.rating.toFixed(1)} · {c.holes.length} holes · par{" "}
                    {coursePar(c)}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="ml-3 shrink-0 text-sub" />
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-12 text-center text-[15px] text-sub">
              No courses match “{query}”. Try a city like Helsinki or Rotterdam.
            </p>
          )}
        </div>
      ) : (
        <div className="relative flex-1 px-4 pb-6">
          <LeafletMap
            center={[61.5, 24.5]}
            zoom={6}
            fitToMarkers
            markers={filtered.map((c) => ({
              id: c.id,
              lat: c.lat,
              lng: c.lng,
              label: c.name,
              active: c.id === selectedOnMap
            }))}
            onMarkerClick={(id) => setSelectedOnMap(id)}
            className="h-[calc(100vh-240px)] min-h-[320px] w-full overflow-hidden rounded-card"
          />
          {mapSelection && (
            <div className="absolute inset-x-8 bottom-12 z-[1000]">
              <Card className="anim-pop p-4 shadow-xl">
                <p className="text-[15px] font-semibold">{mapSelection.name}</p>
                <p className="text-[13px] text-sub">
                  {mapSelection.city} · {mapSelection.holes.length} holes · par{" "}
                  {coursePar(mapSelection)} · ★ {mapSelection.rating.toFixed(1)}
                </p>
                <button
                  onClick={() =>
                    navigate(`/play/players?course=${mapSelection.id}`)
                  }
                  className="press mt-3 w-full rounded-full bg-accent py-2.5 text-[15px] font-semibold text-white"
                >
                  Play here
                </button>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
