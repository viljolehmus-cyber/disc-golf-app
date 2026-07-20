import type { Friend } from "../types";

export const CURRENT_USER = {
  id: "me",
  name: "Viljo Lehmus",
  handle: "@viljo",
  homeCity: "Helsinki",
  memberSince: "2024"
};

export const FRIENDS: Friend[] = [
  { id: "f-aino", name: "Aino Korhonen", handle: "@ainok", homeCity: "Helsinki", roundsPlayed: 214, avgToPar: 2.1 },
  { id: "f-eetu", name: "Eetu Virtanen", handle: "@eetuv", homeCity: "Espoo", roundsPlayed: 158, avgToPar: 4.8 },
  { id: "f-sofia", name: "Sofia Laine", handle: "@sofial", homeCity: "Helsinki", roundsPlayed: 302, avgToPar: -0.4 },
  { id: "f-juho", name: "Juho Mäkelä", handle: "@juhom", homeCity: "Vantaa", roundsPlayed: 96, avgToPar: 7.2 },
  { id: "f-emma", name: "Emma Niemi", handle: "@emman", homeCity: "Tampere", roundsPlayed: 187, avgToPar: 3.5 },
  { id: "f-onni", name: "Onni Salmi", handle: "@onnis", homeCity: "Helsinki", roundsPlayed: 243, avgToPar: 1.9 },
  { id: "f-venla", name: "Venla Rantanen", handle: "@venlar", homeCity: "Jyväskylä", roundsPlayed: 129, avgToPar: 5.6 },
  { id: "f-leo", name: "Leo Heikkinen", handle: "@leoh", homeCity: "Rotterdam", roundsPlayed: 78, avgToPar: 6.3 }
];

export function friendById(id: string): Friend | undefined {
  return FRIENDS.find((f) => f.id === id);
}

export function personName(id: string): string {
  if (id === CURRENT_USER.id) return CURRENT_USER.name;
  return friendById(id)?.name ?? "Player";
}
