"use client";

import { useRef, useState } from "react";
import { Icon } from "./icons";

export default function OrgForm({
  topics,
  provinces,
  estCounts,
  statuses,
  channels,
  times,
}: {
  topics: { label: string; other?: boolean }[];
  provinces: string[];
  estCounts: string[];
  statuses: string[];
  channels: string[];
  times: string[];
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [pressed, setPressed] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);

  const otherSelected = topics.some(
    (t) => t.other && pressed[t.label]
  );

  const toggle = (label: string) =>
    setPressed((p) => ({ ...p, [label]: !p[label] }));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current?.reportValidity()) return;
    setDone(true);
    requestAnimationFrame(() =>
      document
        .getElementById("formSuccess")
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    );
  };

  const reset = () => {
    formRef.current?.reset();
    setPressed({});
    setDone(false);
  };

  const pillRadio = (val: string, name: string, checked: boolean, required?: boolean) => (
    <label className="pill" key={val}>
      <input
        type="radio"
        name={name}
        value={val}
        defaultChecked={checked}
        required={required}
      />
      <span>{val}</span>
    </label>
  );

  if (done) {
    return (
      <div className="form-success" id="formSuccess">
        <span className="success-icon" aria-hidden="true">
          <Icon name="check" />
        </span>
        <h3>ส่งข้อมูลแล้ว</h3>
        <p>
          ทีมงานของเราจะติดต่อกลับภายใน 1–2 วันทำการ
          ทางช่องทางและช่วงเวลาที่คุณเลือก
        </p>
        <button className="btn btn-ghost" type="button" onClick={reset}>
          ส่งข้อมูลรายการใหม่
        </button>
      </div>
    );
  }

  return (
    <form className="form-card" id="orgForm" ref={formRef} onSubmit={onSubmit}>
      <h3 className="form-title">สิ่งที่อยากปรึกษา</h3>
      <p className="form-hint">เลือกได้หลายข้อ</p>
      <div
        className="pill-group"
        id="topicChips"
        role="group"
        aria-label="สิ่งที่อยากปรึกษา"
      >
        {topics.map((t) => (
          <button
            key={t.label}
            type="button"
            className="pill-btn"
            aria-pressed={pressed[t.label] ? "true" : "false"}
            onClick={() => toggle(t.label)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {otherSelected && (
        <div className="field" id="otherWrap">
          <label className="f-label" htmlFor="otherInput">
            ระบุสิ่งที่อยากปรึกษา
          </label>
          <input
            className="input"
            id="otherInput"
            name="otherTopic"
            type="text"
            placeholder="เช่น ต้องการแพ็กเกจประชาสัมพันธ์และจับเวลา RFID"
          />
        </div>
      )}
      <div className="f-grid">
        <div className="field">
          <label className="f-label" htmlFor="fName">
            ชื่อกิจกรรมงาน <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            className="input"
            id="fName"
            name="name"
            type="text"
            required
            placeholder="เช่น มินิมาราธอนนครปฐม 2027"
          />
        </div>
        <div className="field">
          <label className="f-label" htmlFor="fDate">
            ช่วงเวลาที่จะจัดงาน
          </label>
          <input
            className="input"
            id="fDate"
            name="dateRange"
            type="text"
            placeholder="เช่น ก.พ.–มี.ค. 2570"
          />
        </div>
        <div className="field">
          <label className="f-label" htmlFor="fProvince">
            จังหวัด <span className="req" aria-hidden="true">*</span>
          </label>
          <select className="input" id="fProvince" name="province" required defaultValue="">
            <option value="" disabled>
              เลือกจังหวัด…
            </option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="f-label">จำนวนผู้สมัครงานโดยประมาณ</span>
          <div className="pill-group">
            {estCounts.map((v, i) => pillRadio(v, "est", i === 0))}
          </div>
        </div>
        <div className="field f-full">
          <span className="f-label">สถานะงาน</span>
          <div className="pill-group">
            {statuses.map((v, i) => pillRadio(v, "status", i === 0))}
          </div>
        </div>
        <div className="field">
          <label className="f-label" htmlFor="fContact">
            ชื่อผู้ติดต่อ <span className="req" aria-hidden="true">*</span>
          </label>
          <input className="input" id="fContact" name="contact" type="text" required />
        </div>
        <div className="field">
          <label className="f-label" htmlFor="fPhone">
            เบอร์โทร <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            className="input"
            id="fPhone"
            name="phone"
            type="tel"
            required
            placeholder="08x-xxx-xxxx"
          />
        </div>
        <div className="field">
          <label className="f-label" htmlFor="fEmail">
            อีเมล <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            className="input"
            id="fEmail"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
          />
        </div>
        <div className="field">
          <label className="f-label" htmlFor="fLine">
            LINE ID
          </label>
          <input className="input" id="fLine" name="line" type="text" placeholder="@it-runway" />
        </div>
        <div className="field">
          <span className="f-label">
            สะดวกติดต่อกลับช่องทางไหน <span className="req" aria-hidden="true">*</span>
          </span>
          <div className="pill-group">
            {channels.map((v, i) => pillRadio(v, "channel", false, i === 0))}
          </div>
        </div>
        <div className="field">
          <span className="f-label">ช่วงเวลาที่สะดวก</span>
          <div className="pill-group">
            {times.map((v) => (
              <label className="pill" key={v}>
                <input type="checkbox" name="time" value={v} />
                <span>{v}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="field f-full">
          <label className="f-label" htmlFor="fDetail">
            รายละเอียดที่ต้องปรึกษา
          </label>
          <textarea
            className="input"
            id="fDetail"
            name="detail"
            rows={5}
            placeholder="เล่าเพิ่มเติมเกี่ยวกับงานที่วางแผนไว้…"
          />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">
          ส่งข้อมูล
        </button>
      </div>
    </form>
  );
}