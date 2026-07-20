import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, Search, Star } from "lucide-react";
import { useApp } from "../store/AppStore";
import { COURSES } from "../data/courses";
import { Card, LargeTitle, SegmentedControl, Stars } from "../components/ui";
import { LeafletMap } from "../components/LeafletMap";
import { coursePar } from "../lib/scoring";

export function Courses() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useApp();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [selectedOnMap, setSelectedOnMap] = useState<string | null>(null);

  const cities = useMemo(
    () => Array.from(new Set(COURSES.map((c) => c.city))).sort(),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COURSES.filter((c) => {
      if (cityFilter && c.city !== cityFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      );
    });
  }, [query, cityFilter]);

  const mapSelection = COURSES.find((c) => c.id === selectedOnMap);

  return (
    <div>
      <LargeTitle title="Courses">
        <p className="text-[15px] text-sub">
          {COURSES.length} courses across Finland and the Netherlands
        </p>
      </LargeTitle>

      <div className="px-4">
        <div className="flex items-center gap-2 rounded-cell bg-card2 px-3 py-2">
          <Search size={17} className="shrink-0 text-sub" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or city"
            className="w-full bg-transparent text-[16px] placeholder:text-sub"
          />
        </div>

        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          <button
            onClick={() => setCityFilter(null)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              cityFilter === null ? "bg-accent text-white" : "bg-card2 text-sub"
            }`}
          >
            All cities
          </button>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setCityFilter(cityFilter === city ? null : city)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                cityFilter === city ? "bg-accent text-white" : "bg-card2 text-sub"
              }`}
            >
              {city}
            </button>
          ))}
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

      {view === "list" ? (
        <div className="space-y-2.5 px-4 pt-4">
          {filtered.map((c) => {
            const fav = favorites.includes(c.id);
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => navigate(`/courses/${c.id}`)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-[16px] font-semibold">{c.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[13px] text-sub">
                      <MapPin size={12} />
                      {c.city}, {c.country}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-[13px] text-sub">
                      <Stars rating={c.rating} />
                      <span>
                        {c.rating.toFixed(1)} ({c.ratingCount})
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-sub">
                      {c.holes.length} holes · par {coursePar(c)} ·{" "}
                      {Math.round(
                        c.holes.reduce((a, h) => a + h.length, 0)
                      )}{" "}
                      m
                    </p>
                  </button>
                  <div className="ml-2 flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(c.id)}
                      className="press flex h-9 w-9 items-center justify-center rounded-full"
                      aria-label={fav ? "Remove favorite" : "Add favorite"}
                    >
                      <Star
                        size={20}
                        className={fav ? "text-accent" : "text-sub opacity-50"}
                        fill={fav ? "currentColor" : "none"}
                      />
                    </button>
                    <ChevronRight size={17} className="text-sub" />
                  </div>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-4 py-12 text-center text-[15px] text-sub">
              No courses match your search.
            </p>
          )}
        </div>
      ) : (
        <div className="relative px-4 pt-4">
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
            onMarkerClick={setSelectedOnMap}
            className="h-[54vh] min-h-[320px] w-full overflow-hidden rounded-card"
          />
          {mapSelection && (
            <div className="absolute inset-x-8 bottom-6 z-[1000]">
              <Card className="anim-pop p-4 shadow-xl">
                <p className="text-[15px] font-semibold">{mapSelection.name}</p>
                <p className="text-[13px] text-sub">
                  {mapSelection.city} · {mapSelection.holes.length} holes · ★{" "}
                  {mapSelection.rating.toFixed(1)}
                </p>
                <button
                  onClick={() => navigate(`/courses/${mapSelection.id}`)}
                  className="press mt-3 w-full rounded-full bg-accent py-2.5 text-[15px] font-semibold text-white"
                >
                  View course
                </button>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
