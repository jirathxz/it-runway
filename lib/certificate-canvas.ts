export interface CertificateData {
  id: string;
  name: string;
  bib: string;
  club: string;
  category?: string;
  distance: string;
  chipTime: string;
  gunTime: string;
  pace: string;
  rank: number;
  gender: string;
  ageGroup: string;
  eventTitle: string;
  eventDate: string;
  location?: string;
  image?: string;
}

/**
 * Render a high-resolution, luxury Finisher e-Certificate onto an HTML5 Canvas.
 * 1600 x 1130 px (Standard A4 Landscape ratio).
 */
export function generateCertificateCanvas(data: CertificateData): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const width = 1600;
  const height = 1130;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // 1. Certificate Clean Cream/White Background
  ctx.fillStyle = "#FAF9F5";
  ctx.fillRect(0, 0, width, height);

  // 2. Inner White Sheet with subtle drop shadow
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(30, 30, width - 60, height - 60);

  // 3. Ornate Double Gold Border
  // Outer Border
  ctx.strokeStyle = "#B45309"; // Dark Amber / Gold
  ctx.lineWidth = 6;
  ctx.strokeRect(45, 45, width - 90, height - 90);

  // Inner Thin Gold Line
  ctx.strokeStyle = "#F59E0B";
  ctx.lineWidth = 2;
  ctx.strokeRect(58, 58, width - 116, height - 116);

  // Decorative Corner Flourishes
  const cornerSize = 40;
  const corners = [
    { x: 58, y: 58, dx: 1, dy: 1 },
    { x: width - 58, y: 58, dx: -1, dy: 1 },
    { x: 58, y: height - 58, dx: 1, dy: -1 },
    { x: width - 58, y: height - 58, dx: -1, dy: -1 },
  ];

  for (const c of corners) {
    ctx.strokeStyle = "#D97706";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y + c.dy * cornerSize);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(c.x + c.dx * cornerSize, c.y);
    ctx.stroke();

    // Corner decorative circle
    ctx.beginPath();
    ctx.arc(c.x + c.dx * 16, c.y + c.dy * 16, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#B45309";
    ctx.fill();
  }

  // 4. Header: System & Brand
  ctx.textAlign = "center";
  ctx.fillStyle = "#475569";
  ctx.font = "bold 16px 'Prompt', 'Inter', sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("IT RUNWAY TIMING SYSTEM • OFFICIAL TIMING PARTNER", width / 2, 115);
  ctx.letterSpacing = "0px";

  // Gold Star Badge Icon (Draw with Canvas)
  ctx.fillStyle = "#D97706";
  ctx.font = "24px sans-serif";
  ctx.fillText("✦  ✦  ✦", width / 2, 150);

  // Main Title: FINISHER CERTIFICATE
  ctx.fillStyle = "#78350F"; // Deep Luxury Bronze Gold
  ctx.font = "900 48px 'Prompt', 'Montserrat', sans-serif";
  ctx.fillText("FINISHER CERTIFICATE", width / 2, 210);

  // Subtitle
  ctx.fillStyle = "#64748B";
  ctx.font = "500 18px 'Prompt', 'Inter', sans-serif";
  ctx.fillText("เกียรติบัตรรับรองการเข้าร่วมและผลการแข่งขันอย่างเป็นทางการ", width / 2, 245);

  // Gold Divider Line with center diamond
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(220, 275);
  ctx.lineTo(width - 220, 275);
  ctx.stroke();

  ctx.fillStyle = "#B45309";
  ctx.beginPath();
  ctx.arc(width / 2, 275, 4, 0, Math.PI * 2);
  ctx.fill();

  // 5. Presentee Intro
  ctx.fillStyle = "#64748B";
  ctx.font = "400 18px 'Prompt', 'Inter', sans-serif";
  ctx.fillText("ขอมอบเกียรติบัตรฉบับนี้เพื่อแสดงว่า", width / 2, 330);

  // 6. Athlete Name (Grand Display)
  ctx.fillStyle = "#0F172A"; // Very dark slate
  ctx.font = "900 52px 'Prompt', 'Inter', sans-serif";
  ctx.fillText(data.name, width / 2, 400);

  // Club & BIB Number Subtext
  ctx.fillStyle = "#334155";
  ctx.font = "bold 20px 'Prompt', 'Inter', sans-serif";
  const clubText = data.club ? `สังกัด: ${data.club}  •  ` : "";
  ctx.fillText(`${clubText}หมายเลขประจำตัว BIB: #${data.bib}`, width / 2, 445);

  // 7. Event & Distance Accomplishment
  ctx.fillStyle = "#475569";
  ctx.font = "500 22px 'Prompt', 'Inter', sans-serif";
  ctx.fillText(
    `ได้สำเร็จการแข่งขันในรายการ "${data.eventTitle}"`,
    width / 2,
    510
  );

  const formattedDistance = data.distance.toUpperCase().includes("KM") || data.distance.toUpperCase().includes("K")
    ? data.distance
    : `${data.distance} KM`;

  ctx.fillText(
    `ระยะทาง ${formattedDistance} • ประเภท ${data.category || "Official Finisher"}`,
    width / 2,
    545
  );

  // 8. Stats Box (Chip Time, Avg Pace, Overall Rank)
  const boxY = 600;
  const boxW = 1100;
  const boxH = 160;
  const boxX = (width - boxW) / 2;

  // Box Background
  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Box Divider Lines
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(boxX + boxW / 3, boxY + 20);
  ctx.lineTo(boxX + boxW / 3, boxY + boxH - 20);
  ctx.moveTo(boxX + (boxW * 2) / 3, boxY + 20);
  ctx.lineTo(boxX + (boxW * 2) / 3, boxY + boxH - 20);
  ctx.stroke();

  // Box 1: Chip Time
  ctx.textAlign = "center";
  ctx.fillStyle = "#64748B";
  ctx.font = "bold 15px 'Prompt', 'Inter', sans-serif";
  ctx.fillText("เวลาสุทธิ (CHIP TIME)", boxX + boxW / 6, boxY + 50);

  ctx.fillStyle = "#0F172A";
  ctx.font = "900 38px 'Prompt', 'JetBrains Mono', monospace";
  ctx.fillText(data.chipTime, boxX + boxW / 6, boxY + 105);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "500 13px 'Prompt', 'Inter', sans-serif";
  ctx.fillText(`Gun Time: ${data.gunTime || data.chipTime}`, boxX + boxW / 6, boxY + 135);

  // Box 2: Average Pace
  ctx.fillStyle = "#64748B";
  ctx.font = "bold 15px 'Prompt', 'Inter', sans-serif";
  ctx.fillText("เพซเฉลี่ย (AVG PACE)", boxX + boxW / 2, boxY + 50);

  ctx.fillStyle = "#059669"; // Emerald 600
  ctx.font = "900 38px 'Prompt', 'JetBrains Mono', monospace";
  ctx.fillText(data.pace, boxX + boxW / 2, boxY + 105);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "500 13px 'Prompt', 'Inter', sans-serif";
  ctx.fillText("นาที / กิโลเมตร", boxX + boxW / 2, boxY + 135);

  // Box 3: Overall Rank
  ctx.fillStyle = "#64748B";
  ctx.font = "bold 15px 'Prompt', 'Inter', sans-serif";
  ctx.fillText("อันดับรวม (OVERALL RANK)", boxX + (boxW * 5) / 6, boxY + 50);

  ctx.fillStyle = "#B45309"; // Amber 700
  ctx.font = "900 38px 'Prompt', 'JetBrains Mono', monospace";
  ctx.fillText(`อันดับ #${data.rank}`, boxX + (boxW * 5) / 6, boxY + 105);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "500 13px 'Prompt', 'Inter', sans-serif";
  const genderTh = data.gender === "female" ? "หญิง" : "ชาย";
  ctx.fillText(`รุ่น: ${genderTh} (${data.ageGroup})`, boxX + (boxW * 5) / 6, boxY + 135);

  // 9. Footer: Venue, Date & Official Verification Seal with SAFE Non-Overlapping Layout
  const footerY = 820;
  const leftX = boxX;
  const rightX = boxX + boxW;
  const maxColumnWidth = 420; // Safe width that never hits center seal

  // Clean venue string (first meaningful part)
  const venueDisplay = data.location
    ? (data.location.split(" - ")[0] || data.location).split(",")[0].trim()
    : "จังหวัดนครปฐม (Nakhon Pathom)";

  // Left Column: Venue & Date
  ctx.textAlign = "left";
  ctx.fillStyle = "#1E293B";
  ctx.font = "bold 17px 'Prompt', 'Inter', sans-serif";
  ctx.fillText(venueDisplay, leftX, footerY + 50, maxColumnWidth);

  ctx.fillStyle = "#64748B";
  ctx.font = "500 15px 'Prompt', 'Inter', sans-serif";
  ctx.fillText(`วันที่จัดกิจกรรม: ${data.eventDate}`, leftX, footerY + 80, maxColumnWidth);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "500 12px 'Prompt', 'JetBrains Mono', monospace";
  ctx.fillText(`CERTIFICATE ID: CERT-${data.id.slice(0, 8).toUpperCase()}-${data.bib}`, leftX, footerY + 105, maxColumnWidth);

  // Right Column: Certified Stamp / Timing Master
  ctx.textAlign = "right";
  ctx.fillStyle = "#059669";
  ctx.font = "900 19px 'Prompt', 'Inter', sans-serif";
  ctx.fillText("✓ OFFICIAL TIMING VERIFIED", rightX, footerY + 50, maxColumnWidth);

  ctx.fillStyle = "#475569";
  ctx.font = "500 14px 'Prompt', 'Inter', sans-serif";
  ctx.fillText("ระบบบันทึกเวลามาตรฐาน IT RUNWAY TIMING", rightX, footerY + 80, maxColumnWidth);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "400 12px 'Prompt', 'Inter', sans-serif";
  ctx.fillText("Authorized Race Director & Timing Director", rightX, footerY + 105, maxColumnWidth);

  // Center Column: Gold Seal / Medallion in Center (Isolated with ample breathing room)
  const sealX = width / 2;
  const sealY = footerY + 75;

  // Ribbon tails below medal
  ctx.fillStyle = "#D97706";
  ctx.beginPath();
  ctx.moveTo(sealX - 25, sealY + 25);
  ctx.lineTo(sealX - 35, sealY + 65);
  ctx.lineTo(sealX - 20, sealY + 55);
  ctx.lineTo(sealX - 5, sealY + 65);
  ctx.lineTo(sealX - 10, sealY + 25);
  ctx.fill();

  ctx.fillStyle = "#B45309";
  ctx.beginPath();
  ctx.moveTo(sealX + 10, sealY + 25);
  ctx.lineTo(sealX + 5, sealY + 65);
  ctx.lineTo(sealX + 20, sealY + 55);
  ctx.lineTo(sealX + 35, sealY + 65);
  ctx.lineTo(sealX + 25, sealY + 25);
  ctx.fill();

  // Medal Circle
  ctx.beginPath();
  ctx.arc(sealX, sealY, 44, 0, Math.PI * 2);
  ctx.fillStyle = "#FEF3C7";
  ctx.fill();
  ctx.strokeStyle = "#D97706";
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sealX, sealY, 37, 0, Math.PI * 2);
  ctx.strokeStyle = "#B45309";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#92400E";
  ctx.font = "bold 10px 'Prompt', sans-serif";
  ctx.fillText("OFFICIAL", sealX, sealY - 11);
  ctx.font = "900 14px 'Prompt', sans-serif";
  ctx.fillText("TIMING", sealX, sealY + 6);
  ctx.font = "bold 9px 'Prompt', sans-serif";
  ctx.fillText("★ CERTIFIED ★", sealX, sealY + 22);

  return canvas;
}

/**
 * Trigger immediate browser download of the certificate as high-res PNG
 */
export function downloadCertificateImage(data: CertificateData) {
  const canvas = generateCertificateCanvas(data);
  const link = document.createElement("a");
  const filename = `Certificate_${data.bib}_${data.name.replace(/\s+/g, "_")}.png`;
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Print the certificate cleanly as PDF
 */
export function printCertificate(data: CertificateData) {
  const canvas = generateCertificateCanvas(data);
  const dataUrl = canvas.toDataURL("image/png");

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>e-Certificate - ${data.name} (#${data.bib})</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #ffffff;
          }
          img {
            width: 100vw;
            height: 100vh;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="e-Certificate" />
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
