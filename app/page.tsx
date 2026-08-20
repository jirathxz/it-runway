import type { Metadata } from "next";
import Carousel from "@/components/Carousel";
import Reveal from "@/components/Reveal";
import { EventCard, RecoCard, MiniCard, RegCard } from "@/components/EventCards";
import { getEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IT-Runway — ปฏิทินงานวิ่ง สมัครงานวิ่ง มาราธอน เทรล",
  description:
    "รวมปฏิทินงานวิ่งทั่วไทย สมัครงานวิ่ง มาราธอน เทรล ฟันรัน ผ่านระบบไอที-รันเวย์",
};

export default async function Home() {
  const events = await getEvents();
  const hero = events
    .filter((e) => e.category === "hero")
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const newEvents = events
    .filter((e) => e.category === "new")
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const popular = events
    .filter((e) => e.category === "popular")
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const reco = events.find((e) => e.category === "recommend");
  const others = events
    .filter((e) => e.category === "others")
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const register = events
    .filter((e) => e.category === "register")
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

  const showNew = newEvents.length > 0;
  const showPopular = popular.length > 0;
  const showReco = Boolean(reco);
  const showOthers = others.length > 0;
  const showRegister = register.length > 0;
  const showTop = showNew || showPopular;
  const showMid = showReco || showOthers;

  return (
    <>
      {hero.length > 0 && <Carousel slides={hero} variant="poster" />}

      {showTop && (
        <section className="row" aria-labelledby="hNew">
          <div className={showNew && showPopular ? "wrap two-col" : "wrap"}>
            {showNew && (
              <div className="col">
                <Reveal as="header" className="sec-head">
                  <span className="sec-km" aria-hidden="true">
                    2K
                  </span>
                  <h2 id="hNew" className="sec-title">
                    รายการวิ่งเปิดใหม่
                  </h2>
                  <span className="sec-rule" aria-hidden="true" />
                </Reveal>
                <Reveal className="vstack">
                  {newEvents.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </Reveal>
              </div>
            )}
            {showPopular && (
              <div className="col">
                <Reveal as="header" className="sec-head">
                  <h2 id="hPopular" className="sec-title">
                    รายการวิ่งยอดนิยม
                  </h2>
                  <span className="sec-rule" aria-hidden="true" />
                </Reveal>
                <Reveal className="vstack">
                  {popular.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </Reveal>
              </div>
            )}
          </div>
        </section>
      )}

      {showMid && (
        <section className="row row-b" aria-labelledby="hReco">
          <div className={showReco && showOthers ? "wrap two-col-b" : "wrap"}>
            {showReco && reco && (
              <div className="col">
                <Reveal as="header" className="sec-head">
                  <span className="sec-km" aria-hidden="true">
                    4K
                  </span>
                  <h2 id="hReco" className="sec-title">
                    แนะนำเลย
                  </h2>
                  <span className="sec-rule" aria-hidden="true" />
                </Reveal>
                <Reveal>
                  <RecoCard event={reco} />
                </Reveal>
              </div>
            )}
            {showOthers && (
              <div className="col">
                <Reveal as="header" className="sec-head">
                  <h2 id="hOthers" className="sec-title">
                    รายการอื่น ๆ
                  </h2>
                  <span className="sec-rule" aria-hidden="true" />
                </Reveal>
                <Reveal className="mini-grid">
                  {others.map((e) => (
                    <MiniCard key={e.id} event={e} />
                  ))}
                </Reveal>
              </div>
            )}
          </div>
        </section>
      )}

      {showRegister && (
        <section className="row" aria-labelledby="hOpen">
          <div className="wrap">
            <Reveal as="header" className="sec-head">
              <span className="sec-km" aria-hidden="true">
                6K
              </span>
              <h2 id="hOpen" className="sec-title">
                งานที่เปิดรับสมัครผ่านรันลา
              </h2>
              <span className="sec-rule" aria-hidden="true" />
            </Reveal>
            <Reveal className="reg-grid">
              {register.map((e) => (
                <RegCard key={e.id} event={e} />
              ))}
            </Reveal>
            <div className="center">
              <Reveal>
                <a className="btn btn-ghost" href="#">
                  ดูกิจกรรมอื่นๆ ทั้งหมด…
                </a>
              </Reveal>
            </div>
          </div>
        </section>
      )}
    </>
  );
}