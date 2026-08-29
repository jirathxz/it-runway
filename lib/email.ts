import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.EMAIL_FROM || "IT Runway <onboarding@resend.dev>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  if (resend) {
    try {
      const response = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
        text: text || subject,
      });
      return { success: true, data: response };
    } catch (error) {
      console.error("[Email] Failed to send email via Resend:", error);
      return { success: false, error };
    }
  }

  // Development Fallback: Log to console
  console.log("\n================ [DEV EMAIL SIMULATOR] ================");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Text/Preview: ${text || subject}`);
  console.log("-------------------------------------------------------");
  console.log(html);
  console.log("=======================================================\n");

  return { success: true, simulated: true };
}

// IT Runway styled email template
function createEmailTemplate({
  title,
  heading,
  description,
  buttonText,
  buttonUrl,
  subtext,
}: {
  title: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  subtext?: string;
}) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0a0a0b; font-family: 'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f5f5f0; }
        .container { max-width: 540px; margin: 40px auto; background-color: #141417; border: 1px solid #27272a; border-radius: 14px; overflow: hidden; }
        .header { padding: 32px 32px 24px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 24px; font-weight: 800; color: #facc15; letter-spacing: -0.5px; text-transform: uppercase; }
        .content { padding: 32px; }
        .heading { font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 12px; }
        .description { font-size: 14px; line-height: 1.6; color: #a8a6a0; margin: 0 0 28px; }
        .btn-wrapper { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background-color: #facc15; color: #0a0a0b; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 8px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; }
        .subtext { font-size: 12px; color: #7c7c78; line-height: 1.5; margin-top: 24px; border-top: 1px solid #27272a; padding-top: 16px; word-break: break-all; }
        .footer { padding: 20px 32px; background-color: #0d0d0f; text-align: center; font-size: 12px; color: #52525b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">IT RUNWAY</div>
        </div>
        <div class="content">
          <h1 class="heading">${heading}</h1>
          <p class="description">${description}</p>
          <div class="btn-wrapper">
            <a href="${buttonUrl}" class="btn" target="_blank">${buttonText}</a>
          </div>
          <p class="subtext">
            ${subtext || `หากปุ่มด้านบนไม่ทำงาน ให้คัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:`}<br/>
            <a href="${buttonUrl}" style="color: #facc15;">${buttonUrl}</a>
          </p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} IT Runway. ระบบจัดการงานวิ่งและกีฬานครปฐม
        </div>
      </div>
    </body>
  </html>
  `;
}

export async function sendVerificationEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  const html = createEmailTemplate({
    title: "ยืนยันที่อยู่อีเมล — IT Runway",
    heading: "ยืนยันที่อยู่อีเมลของคุณ",
    description: "ขอบคุณที่ลงทะเบียนกับ IT Runway กรุณากดปุ่มด้านล่างเพื่อยืนยันบัญชีของคุณและเริ่มใช้งานระบบงานวิ่งนครปฐม",
    buttonText: "ยืนยันอีเมลทันที",
    buttonUrl: url,
  });

  return sendEmail({
    to: email,
    subject: "ยืนยันที่อยู่อีเมลของคุณ — IT Runway",
    html,
    text: `กรุณากดยืนยันอีเมลของคุณที่: ${url}`,
  });
}

export async function sendResetPasswordEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  const html = createEmailTemplate({
    title: "ตั้งรหัสผ่านใหม่ — IT Runway",
    heading: "รีเซ็ตรหัสผ่านบัญชีของคุณ",
    description: "เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี IT Runway ของคุณ หากคุณไม่ได้เป็นผู้ส่งคำขอนี้ คุณสามารถละเว้นอีเมลนี้ได้อย่างปลอดภัย",
    buttonText: "ตั้งรหัสผ่านใหม่",
    buttonUrl: url,
  });

  return sendEmail({
    to: email,
    subject: "คำขอตั้งรหัสผ่านใหม่ — IT Runway",
    html,
    text: `ตั้งรหัสผ่านใหม่ของคุณได้ที่: ${url}`,
  });
}

export async function sendMagicLinkEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  const html = createEmailTemplate({
    title: "เข้าสู่ระบบด้วย Magic Link — IT Runway",
    heading: "ลิงก์เข้าสู่ระบบ IT Runway",
    description: "คลิกปุ่มด้านล่างเพื่อเข้าสู่ระบบ IT Runway โดยไม่ต้องใช้รหัสผ่าน ลิงก์นี้สามารถใช้งานได้เพียงครั้งเดียว",
    buttonText: "เข้าสู่ระบบทันที",
    buttonUrl: url,
  });

  return sendEmail({
    to: email,
    subject: "เข้าสู่ระบบด้วย Magic Link — IT Runway",
    html,
    text: `เข้าสู่ระบบได้ที่: ${url}`,
  });
}
