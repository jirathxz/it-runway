# 🛠️ Tech Stack, Frameworks & Libraries — IT Runway

เอกสารรวบรวม Framework, Library, Tools และ Dependencies ทั้งหมดที่ใช้งานในโปรเจกต์ **IT Runway** พร้อมคำอธิบายหน้าที่และการนำไปใช้งาน

---

## 🚀 Core Framework & Runtime

| Library / Framework | Version | หน้าที่และการใช้งานในโปรเจกต์ |
| :--- | :--- | :--- |
| **[Next.js](https://nextjs.org/)** | `16.3.3` | **Fullstack React Framework** — โครงสร้างหลักของแอปพลิเคชัน (App Router, Server Components, API Route Handlers) |
| **[React](https://react.dev/)** | `19.2.8` | **Frontend UI Library** — จัดการ Component Lifecycle, Hooks, State และ UI rendering |
| **[React DOM](https://react.dev/)** | `19.2.8` | **DOM Renderer** — สำหรับแสดงผล React components ลงบน Web Browser |
| **[TypeScript](https://www.typescriptlang.org/)** | `^5` | **Type System** — เพิ่ม Type Safety ป้องกัน Runtime Errors ทั้งฝั่ง Client และ Server |
| **[PNPM](https://pnpm.io/)** | `11.24.0` | **Fast & Disk Space Efficient Package Manager** |

---

## 🎨 UI, Styling & Design System

| Library / Tool | Version | หน้าที่และการใช้งานในโปรเจกต์ |
| :--- | :--- | :--- |
| **[Tailwind CSS](https://tailwindcss.com/)** | `^4` | **Utility-First CSS Framework (v4)** — กำหนดสไตล์ UI, Responsive Layouts, Glassmorphism, Theme Tokens ผ่าน Utility Classes |
| **[@tailwindcss/postcss](https://tailwindcss.com/)** | `^4` | **PostCSS Integration** — ตัวประมวลผล Tailwind CSS สำหรับ Next.js build pipeline |
| **[Lucide React](https://lucide.dev/)** | `^1.34.0` | **Modern Icon Set** — ชุดไอคอน SVG แบบคมชัด ปรับขนาดและสีได้ง่ายตาม UI Design |
| **[ReactBits](https://reactbits.dev/)** *(Custom Components)* | — | **Creative Interactive UI Suite** — Components ลูกเล่นพิเศษ (Aurora WebGL, DriftWall, BlurText, ShinyText, SpotlightCard, CountUp, SplitText, FadeContent) |

---

## ✨ Animation & Graphics (Creative Web)

| Library | Version | หน้าที่และการใช้งานในโปรเจกต์ |
| :--- | :--- | :--- |
| **[Framer Motion](https://www.framer.com/motion/)** | `^13.1.1` | **React Motion & Gesture Library** — แอนิเมชันสำหรับ UI transitions, Hover effects, Layout animations, Fade/Slide |
| **[GSAP (GreenSock)](https://greensock.com/gsap/)** | `^3.15.0` | **High-Performance Animation Platform** — จัดการไทม์ไลน์แอนิเมชันที่ซับซ้อน, Text Staggering, Smooth Easing |
| **[OGL](https://github.com/oframe/ogl)** | `^1.0.11` | **Minimal WebGL Library** — เรนเดอร์ Shaders และกราฟิก GPU คุณภาพสูง (ใช้สร้างพื้นหลัง **Aurora Shader Effect**) |

---

## 🔐 Authentication & Backend Services

| Library / Service | Version | หน้าที่และการใช้งานในโปรเจกต์ |
| :--- | :--- | :--- |
| **[Better Auth](https://better-auth.com/)** | `^1.7.2` | **Comprehensive Authentication Framework** — จัดการระบบล็อกอินหลายรูปแบบ (Email/Password, Google OAuth, Magic Link, Phone OTP, Email Verification, Password Reset, Admin Roles) พร้อม Drizzle Adapter |
| **[Resend](https://resend.com/)** | `^6.24.0` | **Transactional Email Service** — ส่งอีเมลยืนยันตัวตน, Magic Link, และรีเซ็ตรหัสผ่าน พร้อม Fallback Console Simulator สำหรับ Development |
| **[Neon Serverless Postgres](https://neon.tech/)** | Cloud | **Cloud PostgreSQL Database** — ฐานข้อมูลหลักของระบบ รองรับ Auto-scaling และ Connection Pooling |
| **[Drizzle ORM](https://orm.drizzle.team/)** | `^0.45.2` | **TypeScript ORM** — จัดการ Schema, Type-safe Queries และ Mutations เชื่อมต่อกับ PostgreSQL |
| **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** | `^0.31.10` | **Migration & CLI Tool** — สำหรับสร้าง/รัน Migration และ Sync Schema กับ Database |
| **[node-postgres (`pg`)](https://node-postgres.com/)** | `^8.23.0` | **PostgreSQL Client** — จัดการ Database Connection Pool (`Pool`) |
| **[@neon/config](https://neon.tech/)** | `^1.0.5` | **Neon Configuration SDK** — จัดการ Config และการเชื่อมต่อของ Neon Postgres |
| **[@vercel/functions](https://vercel.com/docs/functions)** | `^3.9.5` | **Vercel Serverless Utilities** — เช่น `attachDatabasePool` ช่วย Reuse Database Connection Pool บน Serverless |

---

## 🧪 Testing & Code Quality (Dev Tools)

| Tool | Version | หน้าที่และการใช้งานในโปรเจกต์ |
| :--- | :--- | :--- |
| **[Playwright](https://playwright.dev/)** | `^1.62.1` | **End-to-End (E2E) Testing** — ตรวจสอบและทดสอบการทำงานของเว็บไซต์บน Browser อัตโนมัติ |
| **[ESLint](https://eslint.org/)** | `^9` | **Code Linter** — ตรวจสอบไวยากรณ์และคุณภาพของโค้ด |
| **[eslint-config-next](https://nextjs.org/docs/app/building-your-application/configuring/eslint)** | `16.3.3` | **Next.js ESLint Preset** — กฎและ Best practices สำหรับ Next.js & React Hooks |
| **Type Definitions** | `^19`, `^20`, `^8` | `@types/node`, `@types/react`, `@types/react-dom`, `@types/pg` |

---

## 📁 สรุปโครงสร้างการใช้งานหลักใน Source Code

```
it-runway/
├── app/
│   ├── admin/            # Admin Dashboard (Role-based access)
│   ├── api/
│   │   ├── auth/[...all] # Better Auth API Route Handler (GET, POST)
│   │   ├── events/       # Database queries (Drizzle ORM + Neon)
│   │   └── pexels/       # Pexels Image API integration
│   ├── auth/
│   │   ├── forgot-password/ # Password recovery request
│   │   ├── reset-password/  # New password setup with token
│   │   ├── sign-in/         # Multi-tab Sign In (Email, Magic Link, Phone OTP, Google)
│   │   ├── sign-up/         # Registration page
│   │   └── verify-email/    # Email verification handler & resend
│   ├── globals.css       # Tailwind CSS v4 setup & theme styles
│   ├── layout.tsx        # Root layout, fonts & metadata
│   └── page.tsx          # Landing page & UI views (With session badge)
├── components/
│   ├── auth/             # Reusable AuthCard & GoogleSignInButton
│   └── reactbits/        # OGL, GSAP, Framer Motion interactive components
├── lib/
│   ├── auth-client.ts    # Better Auth React Client + Plugins
│   ├── auth-schema.ts    # Better Auth Drizzle Schema (Users, Sessions, Accounts, Verification)
│   ├── auth.ts           # Better Auth Server Configuration
│   ├── db.ts             # Connection pool & Drizzle ORM instance
│   ├── email.ts          # Resend Transactional Email Helper + Dev Simulator
│   └── schema.ts         # PostgreSQL database schema (Events + Auth tables)
├── drizzle.config.ts     # Drizzle Kit configuration
└── neon.ts               # Neon configuration
```
