import Link from "next/link";
import { footerData, year } from "@/lib/seed";
import { Icon } from "./icons";

const linkList = (items: { label: string; href: string; icon?: string }[]) =>
  items.map((i) => (
    <li key={i.label}>
      <a href={i.href}>
        {i.icon ? <Icon name={i.icon} /> : null}
        {i.label}
      </a>
    </li>
  ));

export default function Footer() {
  const f = footerData;
  return (
    <footer className="footer">
      <div className="finish-strip" aria-hidden="true" />
      <div className="wrap footer-grid">
        <div className="f-col f-brand">
          <Link className="brand brand-light" href="/">
            IT-Runway<span className="brand-dot" aria-hidden="true" />
          </Link>
          <p className="f-tag" id="footerTagline">
            {f.tagline}
          </p>
          <svg className="f-route" viewBox="0 0 240 44" aria-hidden="true">
            <circle cx="10" cy="34" r="3.5" />
            <path d="M10 34 C 44 32, 48 14, 84 16 S 138 40, 176 20 S 222 8, 232 10" />
            <circle cx="232" cy="10" r="3" />
          </svg>
        </div>
        <div className="f-col">
          <h3 className="f-title">เริ่มต้น</h3>
          <ul>{linkList(f.start)}</ul>
        </div>
        <div className="f-col">
          <h3 className="f-title">สำหรับเจ้าของหรือผู้จัดกิจกรรม</h3>
          <ul>{linkList(f.organizer)}</ul>
          <h3 className="f-title f-title-sub">เกี่ยวกับเรา</h3>
          <ul className="f-about">{linkList(f.about)}</ul>
        </div>
        <div className="f-col">
          <h3 className="f-title">นัยทางกฎหมาย</h3>
          <p className="f-note" id="footerLegalNote">
            {f.legal.note}
          </p>
          <ul>{linkList(f.legal.links)}</ul>
        </div>
      </div>
      <div className="f-bar">
        <div className="wrap f-bar-inner">
          <span>งานวิ่งทั่วไทย · ปฏิทินงานวิ่ง สมัครงานวิ่ง มาราธอน เทรล</span>
          <span id="fYear">{`IT-Runway · ${year}`}</span>
        </div>
      </div>
    </footer>
  );
}