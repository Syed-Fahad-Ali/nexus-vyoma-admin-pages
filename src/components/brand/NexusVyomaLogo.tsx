import React from "react";
import Image from "next/image";
import wordmarkBlack from "../../../public/brand/nexus-wordmark-black.png";
import markLight from "../../../public/brand/nexus-mark-light.png";

interface NexusVyomaLogoProps {
  className?: string;
  markSize?: number;
  wordmarkHeight?: number;
  showMark?: boolean;
  showWordmark?: boolean;
  fullWidth?: boolean;
  badge?: string;
  orientation?: "horizontal" | "vertical";
}

export default function NexusVyomaLogo({
  className = "flex items-center gap-3",
  markSize = 34,
  wordmarkHeight = 24,
  showMark = false,
  showWordmark = true,
  fullWidth = false,
  badge,
  orientation = "horizontal",
}: NexusVyomaLogoProps) {
  // 1024 x 341 is ~3:1 aspect ratio
  const wordmarkWidth = Math.round(wordmarkHeight * 3.003);

  if (fullWidth && !showMark) {
    return (
      <div className={`w-full flex items-center justify-center ${className}`}>
        <Image
          src={wordmarkBlack}
          alt="Nexus Vyoma"
          unoptimized
          priority
          className="w-full h-auto max-h-[50px] object-contain select-none"
        />
        {badge && (
          <span className="text-[10px] tracking-[0.2em] font-semibold text-[#FF6A00] uppercase bg-[#FF6A00]/10 px-1.5 py-0.5 rounded ml-2">
            {badge}
          </span>
        )}
      </div>
    );
  }

  if (orientation === "vertical") {
    return (
      <div className={`flex flex-col items-center gap-2.5 ${className}`}>
        {showMark && (
          <div className="relative shrink-0 flex items-center justify-center">
            <Image
              src={markLight}
              alt="Nexus Vyoma Mark"
              width={Math.round(markSize * 1.5)}
              height={markSize}
              unoptimized
              className="h-auto object-contain drop-shadow-xs select-none"
              style={{ width: `${Math.round(markSize * 1.5)}px` }}
              priority
            />
          </div>
        )}
        {showWordmark && (
          <div className="flex flex-col items-center gap-1">
            <Image
              src={wordmarkBlack}
              alt="Nexus Vyoma"
              width={wordmarkWidth}
              height={wordmarkHeight}
              unoptimized
              className="h-auto object-contain select-none"
              style={{ height: `${wordmarkHeight}px`, width: "auto" }}
              priority
            />
            {badge && (
              <span className="text-[10px] tracking-[0.25em] font-semibold text-[#FF6A00] uppercase">
                {badge}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showMark && (
        <div className="relative shrink-0 flex items-center justify-center">
          <Image
            src={markLight}
            alt="Nexus Vyoma Mark"
            width={Math.round(markSize * 1.5)}
            height={markSize}
            unoptimized
            className="h-auto object-contain drop-shadow-xs select-none"
            style={{ width: `${Math.round(markSize * 1.5)}px` }}
            priority
          />
        </div>
      )}
      {showWordmark && (
        <div className="flex items-center gap-2">
          <Image
            src={wordmarkBlack}
            alt="Nexus Vyoma"
            width={wordmarkWidth}
            height={wordmarkHeight}
            unoptimized
            className="h-auto object-contain select-none"
            style={{ height: `${wordmarkHeight}px`, width: "auto" }}
            priority
          />
          {badge && (
            <span className="text-[10px] tracking-[0.2em] font-semibold text-[#FF6A00] uppercase bg-[#FF6A00]/10 px-1.5 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
