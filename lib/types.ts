export type EventCategory =
  | "hero"
  | "new"
  | "popular"
  | "recommend"
  | "others"
  | "register"
  | "current";

export type Highlight = { icon: string; title: string; label: string };
export type Distance = {
  dist: string;
  name: string;
  start: string;
  desc: string;
  feeInternal: number;
  feeExternal: number;
};
export type EarlyBird = { until: string; discount: number };
export type ScheduleItem = { time: string; label: string };
export type Contact = { email: string; line: string; orgEmail?: string };

export type EventExtra = {
  tag?: string;
  desc?: string;
  highlights?: Highlight[];
  distances?: Distance[];
  earlyBird?: EarlyBird;
  pack?: string;
  schedule?: ScheduleItem[];
  rules?: string[];
  contact?: Contact;
  limit?: string;
};

export type EventRow = {
  id: string;
  category: EventCategory;
  sort?: number;
  code?: string;
  tag?: string;
  tagType?: "dawn" | "night";
  title?: string;
  sub?: string;
  date?: string;
  start?: string;
  place?: string;
  org?: string;
  dist?: string;
  distLabel?: string;
  deadline?: string;
  slotsLeft?: number;
  slotsTotal?: number;
  grad?: string;
  route?: string;
  ghost?: string;
  extra?: EventExtra;
};

export type OrgSlide = { title: string; sub: string; grad: string };
export type RoadmapStep = { title: string; desc: string };
export type Stat = { v: number; label: string };
export type TrustedEvent = { name: string; tag: string; dist: string; grad: string };
export type ServiceItem = { icon: string; title: string; desc: string };
export type ServiceGroup = { title: string; sub: string; items: ServiceItem[] };
export type OrgFormData = {
  topics: { label: string; other?: boolean }[];
  provinces: string[];
  estCounts: string[];
  statuses: string[];
  channels: string[];
  times: string[];
};
export type Services = Record<"promo" | "register" | "raceDay", ServiceGroup>;

export type Organizer = {
  supportEmail: string;
  heroSlides: OrgSlide[];
  roadmap: RoadmapStep[];
  statsTrack: Stat[];
  statsCommunity: Stat[];
  trusted: TrustedEvent[];
  services: Services;
  form: OrgFormData;
};

export type NavItem = { key: string; label: string; href: string };
export type FooterLink = { label: string; href: string; icon?: string };

export type SeedData = {
  meta: { year: number };
  nav: NavItem[];
  footer: {
    tagline: string;
    start: FooterLink[];
    organizer: FooterLink[];
    about: FooterLink[];
    legal: { note: string; links: FooterLink[] };
  };
  current: EventRow;
  organizer: Organizer;
  events: EventRow[];
};