import type { SVGProps } from "react";

export function Icon({
  name,
  ...props
}: { name: string } & SVGProps<SVGSVGElement>) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    ...props,
  };

  switch (name) {
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    case "fb":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.6v3h2.4v7h2.5z" />
        </svg>
      );
    case "megaphone":
      return (
        <svg {...common}>
          <path d="M3 10v4h2.5L10 17V7L5.5 10H3Z" />
          <path d="M10 9.5a5.5 5.5 0 0 1 0 5" />
          <path d="M14.5 8.5a8 8 0 0 1 0 7" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
          <path d="M3.5 9.5h17M8 3v4M16 3v4" />
        </svg>
      );
    case "tag":
      return (
        <svg {...common}>
          <circle cx="7.5" cy="7.5" r="1.3" />
          <circle cx="16.5" cy="16.5" r="1.3" />
          <path d="m6.5 17.5 11-11" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="m12 3.5 8.5 4.75L12 13 3.5 8.25 12 3.5Z" />
          <path d="M3.5 12.5 12 17.25l8.5-4.75" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...common}>
          <rect x="3" y="6.5" width="18" height="13" rx="2.5" />
          <path d="M3 10.5h18" />
          <circle cx="16.5" cy="14" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 20V11M10 20V5M16 20v-6M21 20H3" />
        </svg>
      );
    case "qr":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
          <path d="M13.5 20.5h3.5V17h-3.5z" />
          <path d="M20.5 14v2.5" />
        </svg>
      );
    case "timer":
      return (
        <svg {...common}>
          <circle cx="12" cy="13.5" r="7" />
          <path d="M12 13.5V9.5M10 2.5h4M12 6.5v-4" />
        </svg>
      );
    case "medal":
      return (
        <svg {...common}>
          <circle cx="12" cy="9.5" r="5.5" />
          <path d="m12 15-2.2 6 2.2-1.6L14 21l-2.2-6" />
        </svg>
      );
    case "search":
      return (
        <svg {...common} strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "chevron-left":
      return (
        <svg {...common} strokeWidth={2}>
          <path d="m15 5-7 7 7 7" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...common} strokeWidth={2}>
          <path d="m9 5 7 7-7 7" />
        </svg>
      );
    case "burger":
      return (
        <svg {...common} strokeWidth={2}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} strokeWidth={2.4}>
          <path d="m4.5 12.5 5 5 10-11" />
        </svg>
      );
    default:
      return null;
  }
}