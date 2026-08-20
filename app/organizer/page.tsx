import type { Metadata } from "next";
import Carousel from "@/components/Carousel";
import Reveal from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import OrgForm from "@/components/OrgForm";
import RouteArt from "@/components/RouteArt";
import { Icon } from "@/components/icons";
import { getOrganizer } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "สำหรับผู้จัดงาน",
  description:
    "ระบบจัดการงานวิ่งครบวงจร — ประชาสัมพันธ์ รับสมัคร จับเวลา RFID และส่งผล ให้งานของคุณราบรื่นตั้งแต่ต้นจนจบ",
};

export default async function OrganizerPage() {
  const org = await getOrganizer();

  return (
    <>
      <Carousel slides={org.heroSlides} variant="org" />

      <section className="row" id="roadmap" aria-labelledby="hRoad">
        <div className="wrap">
          <Reveal as="header" className="sec-head">
            <h2 id="hRoad" className="sec-title">
              ขั้นตอนการทำงาน
            </h2>
            <span className="sec-rule" aria-hidden="true" />
          </Reveal>
          <ol className="roadmap">
            {org.roadmap.map((r, i) => (
              <li className="rm-step" key={r.title}>
                <span className="rm-num" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="rm-title">{r.title}</h3>
                <p className="rm-desc">{r.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="row row-b" aria-labelledby="hStats">
        <div className="wrap">
          <Reveal as="header" className="sec-head">
            <h2 id="hStats" className="sec-title">
              ผลงานที่ผ่านมา
            </h2>
            <span className="sec-rule" aria-hidden="true" />
          </Reveal>
          <dl className="stats stats-4">
            {org.statsTrack.map((s) => (
              <StatCounter key={s.label} value={s.v} label={s.label} />
            ))}
          </dl>
          <Reveal as="header" className="sec-head sec-head-2">
            <h2 className="sec-title">ชุมชนนักวิ่งของเรา</h2>
            <span className="sec-rule" aria-hidden="true" />
          </Reveal>
          <dl className="stats stats-3">
            {org.statsCommunity.map((s) => (
              <StatCounter key={s.label} value={s.v} label={s.label} />
            ))}
          </dl>
        </div>
      </section>

      <section className="row" aria-labelledby="hTrusted">
        <div className="wrap">
          <Reveal as="header" className="sec-head">
            <h2 id="hTrusted" className="sec-title">
              งานที่ไว้วางใจ
            </h2>
            <span className="sec-rule" aria-hidden="true" />
          </Reveal>
          <div className="gallery-grid">
            {org.trusted.map((g) => (
              <Reveal as="article" className="gpost" key={g.name}>
                <div className="gpost-visual" style={{ background: g.grad }}>
                  <span className="gpost-dist">{g.dist}</span>
                </div>
                <div className="gpost-foot">
                  <span className="gpost-name">{g.name}</span>
                  <span className="chip chip-dawn">{g.tag}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {(["promo", "register", "raceDay"] as const).map((key, idx) => {
        const svc = org.services[key];
        return (
          <section
            className={`row${idx % 2 === 0 ? " row-b" : ""}`}
            id={key === "promo" ? "promo" : undefined}
            aria-labelledby={`h-${key}`}
            key={key}
          >
            <div className="wrap">
              <Reveal as="header" className="sec-head">
                <h2 id={`h-${key}`} className="sec-title">
                  {svc.title}
                </h2>
                <span className="sec-rule" aria-hidden="true" />
              </Reveal>
              <p className="sec-sub">{svc.sub}</p>
              <div className="svc-grid">
                {svc.items.map((s) => (
                  <article className="svc" key={s.title}>
                    <span className="svc-icon">
                      <Icon name={s.icon} />
                    </span>
                    <h3 className="svc-title">{s.title}</h3>
                    <p>{s.desc}</p>
                    <a className="card-cta" href="#">
                      รายละเอียด <span aria-hidden="true">→</span>
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="row row-b" id="form" aria-labelledby="hForm">
        <div className="wrap">
          <Reveal as="header" className="sec-head">
            <h2 id="hForm" className="sec-title">
              ปรึกษาทีมงาน / ขอใบเสนอราคา
            </h2>
            <span className="sec-rule" aria-hidden="true" />
          </Reveal>
          <p className="sec-sub">
            กรอกข้อมูลด้านล่าง ทีมงานจะติดต่อกลับภายใน 1–2 วันทำการ
            ข้อมูลของคุณถูกใช้เพื่อติดต่อกลับเท่านั้น
          </p>
          <Reveal>
            <OrgForm
              topics={org.form.topics}
              provinces={org.form.provinces}
              estCounts={org.form.estCounts}
              statuses={org.form.statuses}
              channels={org.form.channels}
              times={org.form.times}
            />
          </Reveal>
        </div>
      </section>

      <section className="row" aria-labelledby="hCta">
        <div className="wrap">
          <div className="cta-card">
            <RouteArt />
            <div className="cta-inner">
              <h2 className="cta-title">
                พร้อมจัดงานวิ่งครั้งต่อไปให้ราบรื่นขึ้นไหม?
              </h2>
              <div className="btn-row cta-btns">
                <a className="btn btn-primary" href="#promo">
                  ประชาสัมพันธ์งานฟรี
                </a>
                <a className="btn btn-ghost" href="#form">
                  ปรึกษาทีมงาน
                </a>
              </div>
              <p className="cta-alt">
                หรือติดต่อเราที่{" "}
                <a href={`mailto:${org.supportEmail}`}>{org.supportEmail}</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}