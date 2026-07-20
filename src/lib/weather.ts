import { mulberry32 } from "./random";

export interface Weather {
  tempC: number;
  windMs: number;
  windDeg: number; // direction wind blows FROM
  condition: "sunny" | "partly" | "cloudy" | "drizzle";
  label: string;
}

export function mockWeather(seed: number): Weather {
  const rng = mulberry32(seed);
  const conditions: Weather["condition"][] = ["sunny", "partly", "partly", "cloudy", "drizzle"];
  const condition = conditions[Math.floor(rng() * conditions.length)];
  const labels: Record<Weather["condition"], string> = {
    sunny: "Sunny",
    partly: "Partly cloudy",
    cloudy: "Overcast",
    drizzle: "Light drizzle"
  };
  return {
    tempC: 13 + Math.round(rng() * 11),
    windMs: Math.round((2 + rng() * 7) * 10) / 10,
    windDeg: Math.round(rng() * 360),
    condition,
    label: labels[condition]
  };
}

export function windCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(((deg % 360) / 45)) % 8];
}
