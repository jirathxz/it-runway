"use client";

import { useMemo, useRef, useState } from "react";
import { Icon } from "./icons";
import type { Distance } from "@/lib/types";

const fmt = new Intl.NumberFormat("en-US");

export default function ApplyForm({
  eventName,
  code,
  distances,
  tag,
}: {
  eventName: string;
  code?: string;
  distances: Distance[];
  tag?: string;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [type, setType] = useState<string>("");
  const [dist, setDist] = useState<string>("");
  const [stdId, setStdId] = useState("");
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState("");

  const internal = type === "internal";

  const fee = useMemo(() => {
    if (!type || !dist) return null;
    const item = distances.find((d) => d.dist === dist);
    if (!item) return null;
    return internal ? item.feeInternal : item.feeExternal;
  }, [type, dist, distances, internal]);

  const feeNote = internal ? "ค่าสมัคร (นักศึกษาภายใน)" : "ค่าสมัคร (บุคคลภายนอก)";

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!type || !dist) {
      scrollToForm();
      return;
    }
    if (internal && !/^6\d{8}$/.test(stdId)) {
      const input = form.elements.namedItem("stdId") as HTMLInputElement;
      input.setCustomValidity(
        "รหัสนักศึกษาต้องเป็นเลข 9 หลักขึ้นต้นด้วย 6 (เช่น 612345678)"
      );
      input.reportValidity();
      return;
    }
    if (!form.reportValidity()) return;
    const item = distances.find((d) => d.dist === dist)!;
    const name = (form.elements.namedItem("fullName") as HTMLInputElement).value;
    setSummary(
      `${name} · ${dist} ${item.name} · ${
        internal ? "นักศึกษาภายใน" : "บุคคลภายนอก"
      } · ค่าสมัคร ${fmt.format(fee ?? 0)} บาท — ใบยืนยันการสมัครส่งไปที่อีเมลของคุณแล้ว`
    );
    setDone(true);
    requestAnimationFrame(() =>
      document
        .getElementById("applySuccess")
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    );
  };

  const reset = () => {
    formRef.current?.reset();
    setType("");
    setDist("");
    setStdId("");
    setDone(false);
    setSummary("");
  };

  if (done) {
    return (
      <div className="form-success" id="applySuccess">
        <span className="success-icon" aria-hidden="true">
          <Icon name="check" />
        </span>
        <h3>ยืนยันการสมัครแล้ว</h3>
        <p>{summary}</p>
        <button className="btn btn-ghost" type="button" onClick={reset}>
          สมัครผู้เข้าร่วมรายอื่น
        </button>
      </div>
    );
  }

  return (
    <form
      className="form-card"
      id="applyForm"
      onSubmit={onSubmit}
      ref={formRef}
      noValidate
    >
      <div className="field f-full">
        <span className="f-label">
          ประเภทผู้สมัคร <span className="req" aria-hidden="true">*</span>
        </span>
        <div className="pill-group" id="typePills">
          <label className="pill">
            <input
              type="radio"
              name="applyType"
              value="internal"
              required
              checked={type === "internal"}
              onChange={() => setType("internal")}
            />
            <span>นักศึกษาภายใน มรภ.นครปฐม</span>
          </label>
          <label className="pill">
            <input
              type="radio"
              name="applyType"
              value="external"
              required
              checked={type === "external"}
              onChange={() => setType("external")}
            />
            <span>บุคคลภายนอก</span>
          </label>
        </div>
      </div>
      {internal && (
        <div className="field f-full" id="stdWrap">
          <label className="f-label" htmlFor="fStd">
            รหัสนักศึกษา (6XXXXXXXX) <span className="req">*</span>
          </label>
          <input
            className="input"
            id="fStd"
            name="stdId"
            type="text"
            inputMode="numeric"
            maxLength={9}
            placeholder="6XXXXXXXX"
            autoComplete="off"
            required
            value={stdId}
            onChange={(e) => {
              setStdId(e.target.value.replace(/[^0-9]/g, ""));
              e.currentTarget.setCustomValidity("");
            }}
          />
          <small className="field-note">
            เริ่มต้นด้วยเลข 6 จำนวน 9 หลัก เช่น 612345678 — ใช้ตรวจสิทธิ์นักศึกษา
            มหาวิทยาลัยราชภัฏนครปฐม
          </small>
        </div>
      )}
      <div className="f-grid">
        <div className="field">
          <label className="f-label" htmlFor="fFull">
            ชื่อ-นามสกุล <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            className="input"
            id="fFull"
            name="fullName"
            type="text"
            required
            placeholder="ชื่อ นามสกุล"
          />
        </div>
        <div className="field">
          <span className="f-label">
            ระยะทาง <span className="req" aria-hidden="true">*</span>
          </span>
          <div className="pill-group" id="distPills">
            {distances.map((d) => (
              <label className="pill" key={d.dist}>
                <input
                  type="radio"
                  name="applyDist"
                  value={d.dist}
                  required
                  checked={dist === d.dist}
                  onChange={() => setDist(d.dist)}
                />
                <span>
                  {d.dist} · {d.name}
                </span>
              </label>
            ))}
          </div>
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
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label className="f-label" htmlFor="fLine">
            LINE ID
          </label>
          <input
            className="input"
            id="fLine"
            name="line"
            type="text"
            placeholder="@username"
          />
        </div>
        <div className="field">
          <label className="f-label" htmlFor="fBlood">
            หมู่เลือด
          </label>
          <select className="input" id="fBlood" name="blood" defaultValue="">
            <option value="">ไม่ระบุ</option>
            <option>A</option>
            <option>B</option>
            <option>AB</option>
            <option>O</option>
          </select>
        </div>
        <div className="field">
          <label className="f-label" htmlFor="fEmeName">
            ผู้ติดต่อฉุกเฉิน (ชื่อ)
          </label>
          <input
            className="input"
            id="fEmeName"
            name="emeName"
            type="text"
            placeholder="ชื่อ-นามสกุล"
          />
        </div>
        <div className="field">
          <label className="f-label" htmlFor="fEmePhone">
            ผู้ติดต่อฉุกเฉิน (เบอร์โทร)
          </label>
          <input
            className="input"
            id="fEmePhone"
            name="emePhone"
            type="tel"
            placeholder="08x-xxx-xxxx"
          />
        </div>
      </div>
      <div className="fee-line">
        <span className="fee-note">{fee === null ? "" : feeNote}</span>
        <span className="fee-value">{fee === null ? "—" : `${fmt.format(fee)} บาท`}</span>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">
          ดำเนินการชำระเงิน
        </button>
      </div>
      <p className="form-hint">
        กดส่งข้อมูลเพื่อไปขั้นตอนชำระเงินค่าสมัครผ่านบัตร/พร้อมเพย์
        ระบบออกใบเสร็จอัตโนมัติ
      </p>
      <input type="hidden" name="eventName" value={eventName} />
      <input type="hidden" name="eventCode" value={code ?? ""} />
      <input type="hidden" name="eventTag" value={tag ?? ""} />
    </form>
  );
}