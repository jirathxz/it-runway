const KM_DOTS = [
  { x: 140, y: 314, label: "3K" },
  { x: 226, y: 238, label: "6K" },
  { x: 302, y: 154, label: "9K" },
];

export default function RouteArt({
  color = "#E9EEF3",
  accent = "#FFC72C",
  className = "route",
}: {
  color?: string;
  accent?: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 460"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path
        d="M56 396 C 92 366, 98 330, 140 314 S 190 250, 226 238 S 292 198, 302 154 S 324 94, 342 70"
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="10 8"
        opacity={0.9}
      />
      {KM_DOTS.map((d) => (
        <g key={d.label}>
          <circle cx={d.x} cy={d.y} r={4.5} fill={color} />
          <text x={d.x} y={d.y - 13} textAnchor="middle" fill={color}>
            {d.label}
          </text>
        </g>
      ))}
      <circle cx="56" cy="396" r="8" fill={accent} opacity={0.25} />
      <circle cx="56" cy="396" r="4.5" fill={accent} />
      <text x="56" y="424" textAnchor="middle" fill={accent}>
        START
      </text>
      <rect x="335" y="58" width="14" height="9" fill={accent} />
      <line x1="342" y1="58" x2="342" y2="38" stroke={accent} strokeWidth={2} />
      <text x="342" y="32" textAnchor="middle" fill={accent}>
        FINISH
      </text>
    </svg>
  );
}