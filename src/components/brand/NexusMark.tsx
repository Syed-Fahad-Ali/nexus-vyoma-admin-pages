import React from "react";

export default function NexusMark({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Nexus Vyoma Emblem"
    >
      <defs>
        {/* Top Segment: Crimson Red */}
        <linearGradient id="nvTopGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D8182B" />
          <stop offset="100%" stopColor="#9C0B1B" />
        </linearGradient>
        {/* Middle Segment: Deep Orange */}
        <linearGradient id="nvMidGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6A00" />
          <stop offset="100%" stopColor="#E54E00" />
        </linearGradient>
        {/* Bottom Segment: Golden Amber */}
        <linearGradient id="nvBotGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBB03B" />
          <stop offset="100%" stopColor="#D98A00" />
        </linearGradient>
        {/* Star Glow */}
        <filter id="starHalo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>

      {/* Top Segment */}
      <path
        d="M26 18 C 22 18, 18 24, 22 30 L 40 45 L 56 45 L 36 22 C 32 18, 28 18, 26 18 Z"
        fill="url(#nvTopGrad)"
      />
      <path
        d="M74 18 C 78 18, 82 24, 78 30 L 60 45 L 44 45 L 64 22 C 68 18, 72 18, 74 18 Z"
        fill="url(#nvTopGrad)"
      />

      {/* Middle Segment */}
      <polygon
        points="38,48 62,48 68,54 32,54"
        fill="url(#nvMidGrad)"
      />

      {/* Bottom Segment */}
      <path
        d="M30 57 L 50 57 L 22 82 L 14 74 Z"
        fill="url(#nvBotGrad)"
      />
      <path
        d="M70 57 L 50 57 L 78 82 L 86 74 Z"
        fill="url(#nvBotGrad)"
      />

      {/* Orbital Ellipse Loop */}
      <ellipse
        cx="50"
        cy="50"
        rx="42"
        ry="13"
        transform="rotate(-26 50 50)"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeOpacity="0.85"
        fill="none"
      />

      {/* Star Spark Flare on Orbit */}
      <g transform="translate(74, 34)">
        <circle cx="0" cy="0" r="4" fill="#FBB03B" filter="url(#starHalo)" />
        <path
          d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
}

