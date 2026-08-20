import Link from "next/link";
import RouteArt from "./RouteArt";
import { currentEvent } from "@/lib/seed";
import type { EventRow } from "@/lib/types";

export function EventCard({ event }: { event: EventRow }) {
  return (
    <article className="card">
      <div className="card-top">
        {event.tag ? (
          <span className={`chip chip-${event.tagType ?? "dawn"}`}>
            {event.tag}
          </span>
        ) : null}
        <span className="card-code">{event.code}</span>
      </div>
      <h3 className="card-title">{event.title}</h3>
      <p className="card-data">
        <span>{event.start}</span>
        <span className="sep" aria-hidden="true" />
        <span>{event.dist}</span>
      </p>
      <dl className="card-meta">
        <div>
          <dt>วันที่</dt>
          <dd>{event.date}</dd>
        </div>
        <div>
          <dt>สถานที่</dt>
          <dd>{event.place}</dd>
        </div>
      </dl>
      <p className="card-org">
        ผู้จัดงาน: <b>{event.org}</b>
      </p>
      <Link className="card-cta" href={`/events/${event.id}`}>
        สมัครเลย <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export function RecoCard({ event }: { event: EventRow }) {
  return (
    <article className="reco">
      <div className="reco-visual" style={{ background: event.grad }}>
        <RouteArt color={event.route || "#E9EEF3"} />
        <span className="reco-dist">{event.dist}</span>
      </div>
      <div className="reco-body">
        <div className="card-top">
          <span className={`chip chip-${event.tagType ?? "night"}`}>
            {event.tag}
          </span>
          <span className="card-code">{event.code}</span>
        </div>
        <h3 className="reco-title">{event.title}</h3>
        <p className="reco-sub">{event.sub}</p>
        <dl className="reco-meta">
          <div>
            <dt>วันที่</dt>
            <dd>{event.date}</dd>
          </div>
          <div>
            <dt>เวลาเริ่ม</dt>
            <dd>{event.start}</dd>
          </div>
          <div>
            <dt>สถานที่</dt>
            <dd>{event.place}</dd>
          </div>
          <div>
            <dt>ระยะทาง</dt>
            <dd>{event.distLabel}</dd>
          </div>
        </dl>
        <p className="card-org">
          ผู้จัดงาน: <b>{event.org}</b>
        </p>
        <div className="btn-row">
          <Link className="btn btn-primary" href={`/events/${event.id}`}>
            สมัครเลย!
          </Link>
          <Link className="btn btn-ghost" href={`/events/${event.id}`}>
            ดูรายละเอียด
          </Link>
        </div>
      </div>
    </article>
  );
}

export function MiniCard({ event }: { event: EventRow }) {
  return (
    <article className="mini">
      <div className="mini-head">
        <span>{event.code}</span>
        <span className="mini-dist">{event.dist}</span>
      </div>
      <h4 className="mini-name">{event.title}</h4>
      <p className="mini-place">
        {event.place} · {event.date}
      </p>
    </article>
  );
}

export function RegCard({ event }: { event: EventRow }) {
  const pct =
    event.slotsTotal && event.slotsLeft !== undefined
      ? Math.round((event.slotsLeft / event.slotsTotal) * 100)
      : 0;
  return (
    <article className="reg">
      <div className="reg-top">
        <span className="chip chip-dawn">เปิดรับสมัคร</span>
        <span className="reg-dist">{event.dist}</span>
      </div>
      <h3 className="reg-name">{event.title}</h3>
      <p className="reg-place">
        {event.place} · {event.date}
      </p>
      <p className="reg-deadline">
        รับสมัครถึง <b>{event.deadline}</b>
      </p>
      <div className="slots">
        <span className="slots-bar">
          <span
            className={`slots-fill${pct < 20 ? " low" : ""}`}
            style={{ width: `${pct}%` }}
          />
        </span>
        <span className="slots-num">
          เหลือ {event.slotsLeft}/{event.slotsTotal}
        </span>
      </div>
      <Link className="card-cta" href={`/events/${currentEvent.id}`}>
        สมัครเลย <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}