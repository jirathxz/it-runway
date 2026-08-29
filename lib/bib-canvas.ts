export interface BibData {
  id: string;
  bibNumber: string;
  corral: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  distance: string;
  chipCode: string;
  tshirtSize: string;
  category?: string;
  shippingStatus?: string;
  trackingNumber?: string;
}

/**
 * Render a high-resolution, photorealistic race bib onto an HTML5 Canvas.
 * 1200 x 850 px @ 2x retina sharpness.
 */
export function generateBibCanvas(bib: BibData, athleteName: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const width = 1200;
  const height = 850;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // 1. Background (Race Bib Card with subtle gradient & rounded rect)
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, width, height);

  // Card Outer Border
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Inner subtle border
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 3;
  ctx.strokeRect(32, 32, width - 64, height - 64);

  // 2. Corner Punch Holes (Safety Pin Holes for real race bibs)
  const holeRadius = 14;
  const holes = [
    { x: 55, y: 55 },
    { x: width - 55, y: 55 },
    { x: 55, y: height - 55 },
    { x: width - 55, y: height - 55 },
  ];

  for (const hole of holes) {
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, holeRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#e2e8f0";
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // 3. Top Banner Strip
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(40, 40, width - 80, 110);

  // Brand Name & Series
  ctx.fillStyle = "#38bdf8";
  ctx.font = "900 36px 'Inter', sans-serif";
  ctx.fillText("IT RUNWAY", 70, 95);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 18px monospace";
  ctx.fillText("NAKHON PATHOM ATHLETE SERIES • 2026", 70, 125);

  // Distance Category Badge (Right side of top banner)
  const distText = bib.distance.toUpperCase().replace(/\(.*\)/, "").trim();
  ctx.fillStyle = "#facc15";
  ctx.font = "900 28px 'Inter', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(distText || "21.1 KM", width - 70, 95);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "600 16px monospace";
  ctx.fillText("CHIP TIMED RACE", width - 70, 125);
  ctx.textAlign = "left";

  // 4. Event Title & Venue Header
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 26px 'Inter', 'Noto Sans Thai', sans-serif";
  ctx.fillText(bib.eventTitle, 70, 205);

  ctx.fillStyle = "#64748b";
  ctx.font = "500 18px 'Inter', 'Noto Sans Thai', sans-serif";
  ctx.fillText(`${bib.eventDate} (${bib.eventTime}) • ${bib.location}`, 70, 240);

  // Divider Line
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 265);
  ctx.lineTo(width - 70, 265);
  ctx.stroke();

  // 5. Giant BIB Number (Athletic Headline Font)
  ctx.fillStyle = "#64748b";
  ctx.font = "700 20px monospace";
  ctx.textAlign = "center";
  ctx.fillText("OFFICIAL RACE NUMBER / BIB", width / 2, 315);

  ctx.fillStyle = "#020617";
  ctx.font = "900 130px 'Inter', monospace";
  ctx.fillText(bib.bibNumber, width / 2, 440);

  // Corral & Wave Pill
  const corralText = `${bib.corral} • WAVE 1 (START ${bib.eventTime})`;
  ctx.font = "800 24px monospace";
  const pillWidth = ctx.measureText(corralText).width + 60;
  const pillHeight = 44;
  const pillX = (width - pillWidth) / 2;
  const pillY = 475;

  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 10);
  ctx.fill();

  ctx.fillStyle = "#38bdf8";
  ctx.fillText(corralText, width / 2, pillY + 31);
  ctx.textAlign = "left";

  // 6. Bottom Information Box
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.roundRect(60, 560, width - 120, 230, 16);
  ctx.fill();
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Athlete Name
  ctx.fillStyle = "#64748b";
  ctx.font = "600 16px monospace";
  ctx.fillText("ATHLETE NAME", 90, 605);

  ctx.fillStyle = "#0f172a";
  ctx.font = "800 32px 'Inter', 'Noto Sans Thai', sans-serif";
  ctx.fillText(athleteName || "ATHLETE PRO", 90, 648);

  // Chip ID & Shirt Size
  ctx.fillStyle = "#475569";
  ctx.font = "700 18px monospace";
  ctx.fillText(`RFID CHIP: ${bib.chipCode}  |  SHIRT: SIZE ${bib.tshirtSize || "L"}`, 90, 688);

  ctx.fillStyle = "#059669";
  ctx.font = "700 16px monospace";
  ctx.fillText(`TIMING GATE: VERIFIED • STATUS: READY`, 90, 722);

  // 7. Realistic Timing Barcode (Right bottom)
  const barcodeX = width - 360;
  const barcodeY = 590;
  const barcodeHeight = 85;
  const barWeights = [3, 1, 4, 2, 1, 5, 2, 1, 4, 3, 2, 5, 1, 3, 2, 4, 1, 2, 5, 3, 1, 4, 2, 3];
  
  let curX = barcodeX;
  ctx.fillStyle = "#0f172a";
  for (const w of barWeights) {
    ctx.fillRect(curX, barcodeY, w * 2.2, barcodeHeight);
    curX += (w * 2.2) + 6;
  }

  ctx.fillStyle = "#64748b";
  ctx.font = "600 13px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`* ${bib.chipCode} *`, barcodeX + 130, barcodeY + barcodeHeight + 25);
  ctx.fillText("TIMING GATE RFID SCANNER", barcodeX + 130, barcodeY + barcodeHeight + 45);
  ctx.textAlign = "left";

  return canvas;
}

/**
 * Downloads the BIB as a crisp PNG image.
 */
export async function downloadBibImage(bib: BibData, athleteName: string): Promise<void> {
  const canvas = generateBibCanvas(bib, athleteName);
  const dataUrl = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.download = `BIB-${bib.bibNumber}-${bib.distance.replace(/\s+/g, "_")}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Prints the BIB on paper or PDF via a dedicated high-resolution print window.
 */
export function printBib(bib: BibData, athleteName: string): void {
  const canvas = generateBibCanvas(bib, athleteName);
  const dataUrl = canvas.toDataURL("image/png");

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("กรุณาอนุญาตป๊อปอัป (Popup) เพื่อเปิดหน้าต่างสั่งพิมพ์");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>พิมพ์บัตร BIB: ${bib.bibNumber} - ${athleteName}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
          }
          .bib-container {
            width: 100%;
            max-width: 960px;
            text-align: center;
          }
          img.bib-image {
            width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          }
          .print-header {
            margin-bottom: 16px;
            text-align: center;
          }
          .print-header h1 {
            font-size: 20px;
            color: #0f172a;
          }
          .print-header p {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
          }
          .instructions {
            margin-top: 16px;
            font-size: 12px;
            color: #475569;
            text-align: center;
            border: 1px dashed #cbd5e1;
            padding: 10px;
            border-radius: 8px;
          }
          @media print {
            body {
              padding: 0;
              min-height: auto;
            }
            .print-header, .instructions, .print-btn-bar {
              display: none !important;
            }
            .bib-container {
              max-width: 100% !important;
            }
            img.bib-image {
              box-shadow: none !important;
              max-height: 95vh;
              object-fit: contain;
            }
          }
        </style>
      </head>
      <body>
        <div class="bib-container">
          <div class="print-header">
            <h1>บัตรประจำตัวนักวิ่ง IT RUNWAY (Digital Race BIB)</h1>
            <p>${bib.eventTitle} • ${bib.eventDate}</p>
          </div>

          <img class="bib-image" src="${dataUrl}" alt="Race BIB ${bib.bibNumber}" />

          <div class="instructions">
            <strong>คำแนะนำ:</strong> พิมพ์ลงบนกระดาษ A4 หรือกระดาษ Tyvek เพื่อใช้เป็นบัตรวิ่งสำรอง และนำรหัส RFID ชิปจับเวลาไปแสดง ณ จุดปล่อยตัว
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
