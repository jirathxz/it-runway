import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import ApplyForm from "@/components/ApplyForm";
import RouteArt from "@/components/RouteArt";
import { Icon } from "@/components/icons";
import { getEventsById } from "@/lib/data";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

const fmt = new Intl.NumberFormat("en-US");

export async function generateMetadata({
  params,
}: PageProps<"/events/[id]">): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventsById(id);
  if (!event) return { title: "ไม่พบงานนี้" };
  return {
    title: `${event.title ?? "งานวิ่ง"} — สมัครงานวิ่ง`,
    description:
      event.extra?.desc ??
      `${event.title ?? ""} — ${event.date ?? ""} ${event.place ?? ""} ผ่าน IT-Runway`,
  };
}

export default async function EventPage({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const event = await getEventsById(id);
  if (!event) notFound();

  const extra = event.extra;
  const isFull = Boolean(extra && extra.distances && extra.distances.length > 0);

  return (
    <>
      <nav className="crumb" aria-label="breadcrumb">
        <div className="wrap">
          <ol>
            <li>
              <Link href="/">หน้าแรก</Link>
            </li>
            <li>
              <Link href="/#">
                {event.place?.includes("จ.")
                  ? "จังหวัด" + event.place.split("จ.").pop()
                  : "งานวิ่ง"}
              </Link>
            </li>
            <li>งานนี้</li>
          </ol>
        </div>
      </nav>

      <section className="ev-hero" aria-label="รายละเอียดงาน">
        <div className="wrap">
          <div className="ev-grid">
            <div className="ev-poster">
              <div
                className="poster-bg"
                style={{ background: event.grad ?? "#12171E" }}
              />
              <RouteArt color={event.route || "#E9EEF3"} />
              <span
                className="poster-dist"
                style={{ color: event.ghost, whiteSpace: "pre-line" }}
              >
                {event.distLabel?.replace(/\s·\s/g, "\n") ?? event.dist}
              </span>
            </div>
            <div className="ev-info">
              <div className="panel-top">
                <span className="chip chip-dawn">{extra?.tag ?? event.tag ?? "รายการวิ่ง"}</span>
                <span className="card-code">{event.code}</span>
              </div>
              <h1 className="ev-title">{event.title}</h1>
              <p className="ev-desc">
                {extra?.desc ??
                  "รายละเอียดเส้นทางและข้อมูลการสมัครจะประกาศเร็ว ๆ นี้ ติดตามประกาศผ่าน IT-Runway"}
              </p>
              <dl className="meta-grid">
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
                  <dd>{event.distLabel ?? event.dist}</dd>
                </div>
                {extra?.limit ? (
                  <div>
                    <dt>จำนวนจำกัด</dt>
                    <dd>{extra.limit}</dd>
                  </div>
                ) : null}
                {event.deadline ? (
                  <div>
                    <dt>รับสมัครถึง</dt>
                    <dd>{event.deadline}</dd>
                  </div>
                ) : null}
              </dl>
              <p className="card-org">
                ผู้จัดงาน: <b>{event.org}</b>
              </p>
              <div className="btn-row">
                {isFull ? (
                  <a className="btn btn-primary" href="#apply">
                    สมัครตอนนี้
                  </a>
                ) : (
                  <Link className="btn btn-primary" href="/events/run-0001">
                    งานที่เปิดรับสมัคร
                  </Link>
                )}
                <a className="btn btn-ghost" href="#hDist">
                  ดูระยะและราคา
                </a>
              </div>
            </div>
          </div>
          {extra?.highlights && extra.highlights.length > 0 ? (
            <ul className="hl-strip">
              {extra.highlights.map((h) => (
                <li className="hl" key={h.title}>
                  <span className="hl-icon">
                    <Icon name={h.icon} />
                  </span>
                  <span className="hl-text">
                    <b>{h.title}</b>
                    <small>{h.label}</small>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="row" aria-labelledby="hDist">
        <div className="wrap">
          <Reveal as="header" className="sec-head">
            <h2 id="hDist" className="sec-title">
              ระยะทาง & ค่าสมัคร
            </h2>
            <span className="sec-rule" aria-hidden="true" />
          </Reveal>
          {extra?.earlyBird ? (
            <p className="sec-sub">
              สมัคร Early Bird ภายใน {extra.earlyBird.until} ลดค่าสมัครทุกระยะ{" "}
              {extra.earlyBird.discount} บาท
            </p>
          ) : null}
          <div className="dist-grid">
            {(extra?.distances ?? []).map((d) => (
              <article className="dist" key={d.dist}>
                <div className="dist-head">
                  <span className="dist-km">{d.dist}</span>
                  <span className="chip chip-night">{d.name}</span>
                </div>
                <div className="dist-start">ปล่อยตัว {d.start}</div>
                <p>{d.desc}</p>
                <dl className="fee">
                  <div>
                    <dt>นักศึกษาภายใน</dt>
                    <dd>{fmt.format(d.feeInternal)} บาท</dd>
                  </div>
                  <div>
                    <dt>บุคคลภายนอก</dt>
                    <dd>{fmt.format(d.feeExternal)} บาท</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          {!isFull ? (
            <p className="sec-sub">
              ยังไม่เปิดรับสมัครสำหรับงานนี้ — ดูงานที่เปิดรับสมัครผ่าน
              IT-Runway <Link href="/events/run-0001">ที่นี่</Link>
            </p>
          ) : null}
        </div>
      </section>

      <section className="row row-b" aria-labelledby="hCourse">
        <div className="wrap">
          <Reveal as="header" className="sec-head">
            <h2 id="hCourse" className="sec-title">
              ข้อมูลเส้นทาง
            </h2>
            <span className="sec-rule" aria-hidden="true" />
          </Reveal>
          {extra?.desc ? <p className="sec-sub">{extra.desc}</p> : null}
          <div className="two-col">
            {extra?.pack ? (
              <div className="pack-note">
                <strong>แพ็คนักวิ่ง</strong>
                <span>{extra.pack}</span>
              </div>
            ) : null}
            {extra?.schedule && extra.schedule.length > 0 ? (
              <div className="timeline">
                <h3 className="tl-title">กำหนดการวันงาน</h3>
                {extra.schedule.map((s) => (
                  <div className="tl-item" key={s.time + s.label}>
                    <span className="tl-time">{s.time}</span>
                    <span className="tl-dash" aria-hidden="true" />
                    <span className="tl-label">{s.label}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {isFull && extra?.distances ? (
        <section className="row" aria-labelledby="hApply">
          <div className="wrap">
            <Reveal as="header" className="sec-head">
              <h2 id="hApply" className="sec-title">
                สมัครเข้าร่วมงาน
              </h2>
              <span className="sec-rule" aria-hidden="true" />
            </Reveal>
            <p className="sec-sub">
              กรอกข้อมูลและเลือกประเภทผู้สมัคร — นักศึกษามหาวิทยาลัยราชภัฏนครปฐม
              ใส่รหัสนักศึกษาเพื่อรับส่วนลดพิเศษ
            </p>
            <Reveal>
              <ApplyForm
                eventName={event.title ?? ""}
                code={event.code}
                tag={extra.tag}
                distances={extra.distances}
              />
            </Reveal>
          </div>
        </section>
      ) : null}

      {extra?.rules && extra.rules.length > 0 ? (
        <section className="row row-b" aria-labelledby="hRules">
          <div className="wrap">
            <Reveal as="header" className="sec-head">
              <h2 id="hRules" className="sec-title">
                เงื่อนไขการสมัคร
              </h2>
              <span className="sec-rule" aria-hidden="true" />
            </Reveal>
            <ul className="rules">
              {extra.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}