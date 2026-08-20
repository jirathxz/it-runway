import raw from "../supabase/seed.json";
import type { SeedData, EventRow, Organizer } from "./types";

export const seed = raw as SeedData;

export const navItems = seed.nav;
export const footerData = seed.footer;
export const year = seed.meta.year;
export const organizer: Organizer = seed.organizer;
export const currentEvent: EventRow = seed.current;

export function eventsByCategory(category: EventRow["category"]): EventRow[] {
  return seed.events
    .filter((e) => e.category === category)
    .slice()
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
}

export function getEventById(id: string): EventRow | undefined {
  return seed.events.find((e) => e.id === id);
}