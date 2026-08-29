/**
 * Demo runner presets and individual field demo generators for testing
 */

export interface RunnerProfileState {
  name: string;
  phone: string;
  gender: string;
  birthdate: string;
  bloodType: string;
  emergencyName: string;
  emergencyPhone: string;
  medicalConditions: string;
  tshirtSize: string;
  preferredDistance: string;
  runningClub: string;
  targetPace: string;
}

export const DEMO_RUNNER_PRESETS = [
  {
    label: "นักวิ่งนครปฐม ขาแรง (10K / 21K)",
    description: "โปรไฟล์สมบูรณ์ พร้อมข้อมูลการแพทย์และติดต่อฉุกเฉินครบถ้วน",
    data: {
      name: "ธนภัทร รุ่งเรือง (Tanapat Runway)",
      phone: "081-234-5678",
      gender: "male",
      birthdate: "1996-08-15",
      bloodType: "O+",
      emergencyName: "คุณสมศรี ใจดี (มารดา)",
      emergencyPhone: "089-876-5432",
      medicalConditions: "ไม่มีโรคประจำตัว",
      tshirtSize: "L",
      preferredDistance: "21K",
      runningClub: "Nakhon Pathom Runner Club",
      targetPace: "05:15",
    },
  },
  {
    label: "นักวิ่งหญิง สายสุขภาพ (Fun Run / Mini)",
    description: "โปรไฟล์นักวิ่งหญิง พร้อมเบอร์ติดต่อฉุกเฉิน",
    data: {
      name: "กานดา สุวรรณภูมิ (Kanda Runway)",
      phone: "082-998-1122",
      gender: "female",
      birthdate: "1998-11-20",
      bloodType: "B+",
      emergencyName: "คุณวิชาญ สุวรรณภูมิ (บิดา)",
      emergencyPhone: "086-554-3321",
      medicalConditions: "ภูมิแพ้อากาศเล็กน้อย",
      tshirtSize: "M",
      preferredDistance: "10K",
      runningClub: "Salaya City Runners",
      targetPace: "06:30",
    },
  },
  {
    label: "นักวิ่งมาราธอน Veteran (42K / Ultra)",
    description: "โปรไฟล์นักวิ่งระยะไกล ชมรมพระปฐมเจดีย์",
    data: {
      name: "สมชาย รักสงบ (Somchai Phra Pathom)",
      phone: "085-333-7788",
      gender: "male",
      birthdate: "1988-04-12",
      bloodType: "AB+",
      emergencyName: "คุณสุภาพร รักสงบ (ภรรยา)",
      emergencyPhone: "084-222-9900",
      medicalConditions: "ไม่มีโรคประจำตัว",
      tshirtSize: "XL",
      preferredDistance: "42K",
      runningClub: "Phra Pathom Chedi Marathon Club",
      targetPace: "04:45",
    },
  },
];

export const DEMO_FIELD_DEFAULTS = {
  name: "ธนภัทร รุ่งเรือง (Tanapat Runner)",
  phone: "081-234-5678",
  gender: "male",
  birthdate: "1996-08-15",
  bloodType: "O+",
  emergencyName: "คุณสมศรี ใจดี (มารดา)",
  emergencyPhone: "089-876-5432",
  medicalConditions: "ไม่มีโรคประจำตัว",
  tshirtSize: "L",
  preferredDistance: "21K",
  runningClub: "Nakhon Pathom Runner Club",
  targetPace: "05:15",
};

/**
 * Check whether runner profile has all required fields for event registration
 */
export function checkProfileCompleteness(profile: Partial<RunnerProfileState>) {
  const missing: { key: keyof RunnerProfileState; label: string }[] = [];

  if (!profile.name || profile.name.trim() === "") {
    missing.push({ key: "name", label: "ชื่อ-นามสกุล" });
  }
  if (!profile.phone || profile.phone.trim() === "") {
    missing.push({ key: "phone", label: "เบอร์โทรศัพท์ติดต่อ" });
  }
  if (!profile.gender || profile.gender.trim() === "") {
    missing.push({ key: "gender", label: "เพศ" });
  }
  if (!profile.birthdate || profile.birthdate.trim() === "") {
    missing.push({ key: "birthdate", label: "วันเดือนปีเกิด" });
  }
  if (!profile.bloodType || profile.bloodType.trim() === "") {
    missing.push({ key: "bloodType", label: "หมู่โลหิต" });
  }
  if (!profile.emergencyName || profile.emergencyName.trim() === "") {
    missing.push({ key: "emergencyName", label: "ชื่อผู้ติดต่อฉุกเฉิน" });
  }
  if (!profile.emergencyPhone || profile.emergencyPhone.trim() === "") {
    missing.push({ key: "emergencyPhone", label: "เบอร์ติดต่อฉุกเฉิน" });
  }

  const totalRequired = 7;
  const completedCount = totalRequired - missing.length;
  const percentage = Math.round((completedCount / totalRequired) * 100);

  return {
    isComplete: missing.length === 0,
    missing,
    percentage,
    completedCount,
    totalRequired,
  };
}
