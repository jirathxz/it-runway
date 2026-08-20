import { supabase, isSupabaseConfigured } from "./supabase";
import { seed } from "./seed";
import type { EventRow, Organizer, EventExtra } from "./types";

type EventsRow = {
  id: string;
  code: string | null;
  category: string;
  sort: number | null;
  tag: string | null;
  tag_type: string | null;
  title: string | null;
  sub: string | null;
  date: string | null;
  start: string | null;
  place: string | null;
  org: string | null;
  dist: string | null;
  dist_label: string | null;
  deadline: string | null;
  slots_left: number | null;
  slots_total: number | null;
  grad: string | null;
  route_color: string | null;
  ghost_color: string | null;
  extra: EventExtra | null;
};

const mapEventsRow = (r: EventsRow): EventRow => ({
  id: r.id,
  code: r.code ?? undefined,
  category: r.category as EventRow["category"],
  sort: r.sort ?? undefined,
  tag: r.tag ?? undefined,
  tagType: (r.tag_type as "dawn" | "night" | undefined) ?? undefined,
  title: r.title ?? undefined,
  sub: r.sub ?? undefined,
  date: r.date ?? undefined,
  start: r.start ?? undefined,
  place: r.place ?? undefined,
  org: r.org ?? undefined,
  dist: r.dist ?? undefined,
  distLabel: r.dist_label ?? undefined,
  deadline: r.deadline ?? undefined,
  slotsLeft: r.slots_left ?? undefined,
  slotsTotal: r.slots_total ?? undefined,
  grad: r.grad ?? undefined,
  route: r.route_color ?? undefined,
  ghost: r.ghost_color ?? undefined,
  extra: r.extra ?? undefined,
});

export async function getEvents(): Promise<EventRow[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("sort", { ascending: true });
      if (!error && data && data.length > 0) {
        return (data as EventsRow[]).map(mapEventsRow);
      }
    } catch {
      // fall back to seed below
    }
  }
  return seed.events;
}

export async function getOrganizer(): Promise<Organizer> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("organizer_content")
        .select("*")
        .eq("id", "default")
        .single();
      if (!error && data) {
        return {
          supportEmail: data.support_email ?? seed.organizer.supportEmail,
          heroSlides: data.hero_slides ?? seed.organizer.heroSlides,
          roadmap: data.roadmap ?? seed.organizer.roadmap,
          statsTrack: data.stats_track ?? seed.organizer.statsTrack,
          statsCommunity: data.stats_community ?? seed.organizer.statsCommunity,
          trusted: data.trusted ?? seed.organizer.trusted,
          services: data.services ?? seed.organizer.services,
          form: data.form ?? seed.organizer.form,
        };
      }
    } catch {
      // fall back to seed below
    }
  }
  return seed.organizer;
}

export async function getCurrentEvent(): Promise<EventRow> {
  const events = await getEvents();
  return events.find((e) => e.category === "current") ?? seed.current;
}

export async function getEventsById(id: string): Promise<EventRow | undefined> {
  const events = await getEvents();
  return events.find((e) => e.id === id);
}