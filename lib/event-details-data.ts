export interface ShirtSize {
  size: string;
  chestInch: number;
  chestCm: number;
  lengthInch: number;
  lengthCm: number;
  recommended: string;
}

export const SHIRT_SIZE_CHART: ShirtSize[] = [
  { size: "XS", chestInch: 34, chestCm: 86, lengthInch: 25, lengthCm: 63, recommended: "น้ำหนัก 40-50 กก." },
  { size: "S", chestInch: 36, chestCm: 91, lengthInch: 26, lengthCm: 66, recommended: "น้ำหนัก 50-60 กก." },
  { size: "M", chestInch: 38, chestCm: 96, lengthInch: 27, lengthCm: 68, recommended: "น้ำหนัก 60-70 กก." },
  { size: "L", chestInch: 40, chestCm: 101, lengthInch: 28, lengthCm: 71, recommended: "น้ำหนัก 70-80 กก." },
  { size: "XL", chestInch: 42, chestCm: 106, lengthInch: 29, lengthCm: 73, recommended: "น้ำหนัก 80-90 กก." },
  { size: "2XL", chestInch: 44, chestCm: 111, lengthInch: 30, lengthCm: 76, recommended: "น้ำหนัก 90-100 กก." },
  { size: "3XL", chestInch: 46, chestCm: 117, lengthInch: 31, lengthCm: 78, recommended: "น้ำหนัก 100+ กก." },
];

export interface ScheduleItem {
  time: string;
  activity: string;
  details?: string;
  isHighlight?: boolean;
}

export interface RouteDetail {
  distanceLabel: string;
  cutoffHours: string;
  elevationGain: string;
  waterStations: number;
  medicalPoints: number;
  surface: string;
  description: string;
}

export interface EventDetailData {
  id: string;
  title: string;
  location: string;
  googleMapsUrl: string;
  coordinates: { lat: number; lng: number };
  dateFormatted: string;
  startFormattedTime: string;
  description: string;
  organizer: string;
  shirtDescription: string;
  shirtColor: string;
  medalDescription: string;
  routes: RouteDetail[];
  expoSchedule: ScheduleItem[];
  raceDaySchedule: ScheduleItem[];
  parkingInfo: string[];
  rules: string[];
}

export function generateEventDetailData(event: {
  id: string;
  title: string;
  location: string;
  date: string | Date;
  distance: string;
  price: number;
  image?: string | null;
}): EventDetailData {
  const dt = new Date(event.date);
  const thaiDate = dt.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });
  const hours = dt.getUTCHours().toString().padStart(2, "0");
  const minutes = dt.getUTCMinutes().toString().padStart(2, "0");
  const startFormattedTime = hours !== "00" ? `${hours}:${minutes} น.` : "05:30 น.";

  const isTrail = event.title.toLowerCase().includes("trail") || event.title.includes("เทรล") || event.title.includes("ป่า");
  const isNight = event.title.toLowerCase().includes("night") || event.title.includes("ไนท์") || event.title.includes("ราตรี");

  // Determine Google Maps search query
  const mapsQuery = encodeURIComponent(`${event.location} นครปฐม`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const distances = event.distance.split("/").map((d) => d.trim());

  const routes: RouteDetail[] = distances.map((dist) => {
    const isHalf = dist.includes("21");
    const isMini = dist.includes("10");
    const isFun = dist.includes("5") || dist.includes("3");

    return {
      distanceLabel: dist,
      cutoffHours: isHalf ? "3 ชั่วโมง 30 นาที (09:00 น.)" : isMini ? "2 ชั่วโมง (07:45 น.)" : "1 ชั่วโมง (07:00 น.)",
      elevationGain: isTrail ? (isHalf ? "+320m" : isMini ? "+180m" : "+80m") : "+15m (ทางราบมาตรฐาน)",
      waterStations: isHalf ? 9 : isMini ? 5 : 2,
      medicalPoints: isHalf ? 4 : isMini ? 3 : 2,
      surface: isTrail ? "Single Track 60% • Dirt Road 40%" : "ถนนลาดยางแอสฟัลต์ 100% ปิดการจราจร 100%",
      description: isTrail
        ? `เส้นทางธรรมชาติและสวนเกษตร ลัดเลาะร่มเงาไม้ จุดชมทัศนียภาพ และทางดินท้าทาย`
        : `เส้นทางราบเรียบ ถนนมาตรฐาน วิ่งผ่านแลนด์มาร์กสำคัญของจังหวัดนครปฐม`,
    };
  });

  return {
    id: event.id,
    title: event.title,
    location: event.location,
    googleMapsUrl,
    coordinates: { lat: 13.8196, lng: 100.0601 },
    dateFormatted: thaiDate,
    startFormattedTime,
    description: `ร่วมสัมผัสประสบการณ์งานวิ่งมาตรฐานสากลในจังหวัดนครปฐม พร้อมระบบบันทึกเวลา RFID Chip Timing ความแม่นยำสูง รับรองเส้นทางและจัดขึ้นเพื่อส่งเสริมสุขภาพ ท่องเที่ยว และกีฬาในท้องถิ่น`,
    organizer: "ชมรมกีฬาวิ่งนครปฐม ร่วมกับ IT Runway Timing Gate System",
    shirtDescription: "ผ้า Micro Polyester Hexagon Cool-Tech สัมผัสนุ่ม แห้งไวเป็นพิเศษ ไม่เสียดสีผิว พิมพ์ลาย Full Sublimation เอกลักษณ์เฉพาะงานนี้",
    shirtColor: isNight ? "Dark Obsidian & Neon Gold" : isTrail ? "Forest Olive & Golden Yellow" : "Charcoal Black & Sunrise Yellow",
    medalDescription: "เหรียญรางวัลหล่อโลหะ Zinc Alloy สลักลายสามมิติชุบสีทองด้าน พร้อมริบบิ้นสายคล้องพิมพ์ลายผ้าสะท้อนแสง",
    routes,
    expoSchedule: [
      { time: "10:00 - 12:00 น.", activity: "เปิดจุดลงทะเบียนรับเบอร์วิ่ง (BIB) และเสื้อที่ระลึกรอบเช้า" },
      { time: "13:00 - 17:00 น.", activity: "เปิดรับ Race Pack รอบบ่าย และกิจกรรม Running Expo สินค้ากีฬา" },
      { time: "18:00 น.", activity: "ปิดจุดรับ Race Pack ประจำวัน (งดแจกวันแข่งขัน)" },
    ],
    raceDaySchedule: [
      { time: isNight ? "17:00 น." : "04:30 น.", activity: "เปิดจุดรับฝากสัมภาระและตรวจเช็คอินจุดสตาร์ท" },
      { time: isNight ? "18:00 น." : "05:00 น.", activity: "กิจกรรมยืดเหยียดกล้ามเนื้อและอบอุ่นร่างกาย (Warm-up Activity)" },
      { time: isNight ? "18:15 น." : "05:15 น.", activity: "พิธีเปิดการแข่งขันและบรีฟความปลอดภัยบนเส้นทางวิ่ง" },
      { time: isNight ? "18:30 น." : "05:30 น.", activity: `ปล่อยตัวนักวิ่งระยะ ${distances[distances.length - 1] || "21.1 KM"}`, isHighlight: true },
      { time: isNight ? "18:45 น." : "05:45 น.", activity: `ปล่อยตัวนักวิ่งระยะ ${distances[1] || "10.5 KM"}`, isHighlight: true },
      { time: isNight ? "19:00 น." : "06:00 น.", activity: `ปล่อยตัวนักวิ่งระยะ ${distances[0] || "5 KM"}`, isHighlight: true },
      { time: isNight ? "20:30 น." : "07:30 น.", activity: "พิธีมอบถ้วยรางวัล Overall และผู้ชนะกลุ่มอายุ (Age Categories)", isHighlight: true },
      { time: isNight ? "22:00 น." : "09:00 น.", activity: "ปิดจุดเส้นชัย (Race Cut-off Time) และสิ้นสุดการแข่งขัน" },
    ],
    parkingInfo: [
      "ลานจอดรถหลักโซน A: รองรับรถยนต์ 450 คัน (ห่างจากจุดสตาร์ท 150 เมตร)",
      "ลานจอดรถสำรองโซน B: รองรับรถยนต์ 300 คัน พร้อมรถรับ-ส่ง Shuttle Service",
      "จุดจอดรถจักรยานยนต์โซน C: ติดกับจุดรับฝากของ",
    ],
    rules: [
      "นักวิ่งต้องติดเบอร์วิ่ง (BIB) ไว้ที่บริเวณหน้าอกด้านหน้าให้เห็นชัดเจนตลอดการแข่งขัน",
      "ระบบจับเวลาจะทำงานอัตโนมัติผ่าน RFID Chip ที่ติดอยู่ด้านหลัง BIB เท่านั้น",
      "ไม่อนุญาตให้นำจักรยาน รถเข็น หรือสัตว์เลี้ยงลงสู่เส้นทางวิ่งแข่งขัน",
      "ผู้สมัครที่วิ่งผิดเส้นทางหรือขึ้นยานพาหนะระหว่างทางจะถูกตัดสิทธิ์จากการแข่งขันทันที",
      "การตัดสินของคณะกรรมการสมาคมและ Official Timing ถือเป็นที่สิ้นสุด",
    ],
  };
}
