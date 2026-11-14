// The north point on a plan: a needle in a ring, turned to true north (PLAN_NORTH in
// floors.js, degrees clockwise from the top of the drawing), with an upright "N" at its
// tip so it reads the right way up however far the needle turns. Drawn in the plans' own
// dark ink, so it sits on the ivory sheet like the rest of the linework.

export function NorthArrow({ deg, className = '' }) {
  const t = (deg * Math.PI) / 180;
  // The N sits just past the needle's tip, along the same bearing.
  const nx = 50 + 35 * Math.sin(t);
  const ny = 50 - 35 * Math.cos(t);
  return (
    <svg
      viewBox="0 0 100 100"
      className={`pointer-events-none ${className}`}
      role="img"
      aria-label={`North points ${Math.round(deg)}° clockwise from the top of the plan`}
    >
      {/* Its own ivory disc, so it reads clear of whatever linework is near. */}
      <circle cx="50" cy="50" r="48" fill="var(--color-w-ivory)" stroke="var(--color-w-deep)" strokeOpacity="0.25" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="24" fill="none" stroke="var(--color-w-deep)" strokeOpacity="0.3" strokeWidth="1.2" />
      <g transform={`rotate(${deg} 50 50)`}>
        {/* The needle: the north half filled gold, the south half an outline. */}
        <path d="M50 22 L58 50 L50 45 L42 50 Z" fill="var(--color-w-gold-deep)" />
        <path d="M50 78 L58 50 L50 55 L42 50 Z" fill="none" stroke="var(--color-w-deep)" strokeOpacity="0.55" strokeWidth="1.5" strokeLinejoin="round" />
      </g>
      <text
        x={nx}
        y={ny}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
        letterSpacing="0.05em"
        fill="var(--color-w-deep)"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        N
      </text>
    </svg>
  );
}
