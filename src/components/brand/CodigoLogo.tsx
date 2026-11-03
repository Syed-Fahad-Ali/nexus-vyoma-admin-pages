import React from "react";

interface CodigoLogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  textClassName?: string;
}

export function CodigoIcon({ size = 24, className = "text-[#0A0F1E]" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Top horizontal rounded bar */}
      <path
        d="M4.5 5.5H19.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Lower rounded shield/container */}
      <path
        d="M6.5 9.5V13.8C6.5 16.8 8.96 19.2 12 19.2C15.04 19.2 17.5 16.8 17.5 13.8V9.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CodigoLogo({
  className = "flex items-center gap-2.5",
  iconSize = 22,
  showText = true,
  textClassName = "text-[15px] font-bold tracking-[0.16em] text-[#0A0F1E] uppercase",
}: CodigoLogoProps) {
  return (
    <div className={className}>
      <CodigoIcon size={iconSize} />
      {showText && <span className={textClassName}>CODIGO</span>}
    </div>
  );
}

