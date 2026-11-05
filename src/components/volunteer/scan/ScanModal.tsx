"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import QrScanner from "qr-scanner";
import {
  X,
  Camera,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Volume2,
  ShieldCheck,
  Ban,
} from "lucide-react";
import { type ScannedMember } from "@/lib/dummy-scan-data";

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (member: ScannedMember) => void;
  recentScans: ScannedMember[];
  currentVolunteer?: string;
}

export interface QrPayload {
  userId: string;
  userEmail: string;
}

/**
 * Validates whether the raw string is a valid JSON object matching:
 * { "userId": string, "userEmail": string }
 */
export function validateQrPayload(raw: string): { isValid: true; data: QrPayload } | { isValid: false; error: string } {
  try {
    const parsed = JSON.parse(raw.trim());
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.userId === "string" &&
      parsed.userId.trim().length > 0 &&
      typeof parsed.userEmail === "string" &&
      parsed.userEmail.trim().length > 0
    ) {
      return {
        isValid: true,
        data: {
          userId: parsed.userId.trim(),
          userEmail: parsed.userEmail.trim(),
        },
      };
    }
    return {
      isValid: false,
      error: "Invalid scan: Missing {userId, userEmail}",
    };
  } catch {
    return {
      isValid: false,
      error: "Invalid scan: QR code is not valid JSON",
    };
  }
}

/**
 * High-performance Web Audio API Synthesizer: Clear high-pitch chime for valid scans.
 */
function playScanTick() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // High clear pitch (1046.5Hz / C6 -> 1318.5Hz / E6)
    osc.type = "sine";
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.035);

    // Fast exponential decay (90ms)
    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.085);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {
    // Graceful fallback
  }
}

/**
 * Low-frequency buzz alert for invalid QR payload.
 */
function playInvalidScanTone() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Low harsh tone (220Hz -> 140Hz)
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.19);
  } catch {
    // Graceful fallback
  }
}

export default function ScanModal({
  isOpen,
  onClose,
  onScanSuccess,
  recentScans,
  currentVolunteer = "YOUR_NAME",
}: ScanModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const lastScannedRaw = useRef<string | null>(null);
  const lastScanTime = useRef<number>(0);

  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Handle scanned raw string with JSON validation
  const handleScannedResult = useCallback(
    (rawText: string) => {
      const now = Date.now();

      // Debounce duplicate identical scans within 2.5 seconds
      if (lastScannedRaw.current === rawText && now - lastScanTime.current < 2500) {
        return;
      }
      lastScannedRaw.current = rawText;
      lastScanTime.current = now;

      const validation = validateQrPayload(rawText);

      if (validation.isValid) {
        const { userId, userEmail } = validation.data;
        playScanTick();

        const timeString = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        const inferredName = userEmail
          .split("@")[0]
          .replace(/[._]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const newRecord: ScannedMember = {
          id: `sc-${Date.now()}`,
          userId,
          name: inferredName || `User ${userId}`,
          email: userEmail,
          timestamp: `Today, ${timeString}`,
          scannedBy: currentVolunteer,
          eventName: "Nexus Fest Gate",
          ticketId: userId,
          status: "Checked In",
        };

        onScanSuccess(newRecord);
        setFeedback({
          type: "success",
          message: `Verified: ${userId} (${userEmail})`,
        });
      } else {
        playInvalidScanTone();
        setFeedback({
          type: "error",
          message: validation.error,
        });
      }

      setTimeout(() => {
        setFeedback((prev) => (prev?.message ? null : prev));
      }, 3000);
    },
    [currentVolunteer, onScanSuccess]
  );

  // Initialize Nimiq QrScanner
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function initQrScanner() {
      setIsInitializing(true);
      setCameraError(null);

      try {
        const hasCam = await QrScanner.hasCamera();
        if (!isMounted) return;

        if (!hasCam) {
          setHasCamera(false);
          setIsInitializing(false);
          setCameraError("No camera detected on this device.");
          return;
        }

        const videoElem = videoRef.current;
        if (!videoElem) {
          setIsInitializing(false);
          return;
        }

        const scanner = new QrScanner(
          videoElem,
          (result: QrScanner.ScanResult) => {
            if (result && typeof result.data === "string") {
              handleScannedResult(result.data);
            }
          },
          {
            onDecodeError: () => {
              // Normal frame skips when no QR code is in camera view
            },
            preferredCamera: "environment",
            maxScansPerSecond: 12,
            highlightScanRegion: false,
            highlightCodeOutline: true,
          }
        );

        scannerRef.current = scanner;
        await scanner.start();

        if (isMounted) {
          setHasCamera(true);
          setIsInitializing(false);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setHasCamera(false);
        setIsInitializing(false);
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Camera access was denied or device is busy.";
        setCameraError(errorMsg);
      }
    }

    initQrScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, [isOpen, handleScannedResult]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs select-none animate-in fade-in-0 duration-200">
      {/* Outer Modal Container */}
      <div className="w-full max-w-[480px] rounded-3xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-2xl flex flex-col gap-4 relative max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                hasCamera ? "bg-[#16A34A] animate-pulse" : "bg-[#D97706]"
              }`}
            />
            <h2 className="text-sm font-bold tracking-tight text-[#0A0F1E] uppercase">
              QR Ticket Scanner (Nimiq)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              title="Audio feedback enabled"
              className="text-[#16A34A] bg-[#DCFCE7] p-1.5 rounded-full flex items-center justify-center"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#0A0F1E] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
              aria-label="Close scanner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expected JSON Schema Pill */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[11px] text-[#4B5563]">
          <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] truncate">
            <span className="font-semibold text-[#0A0F1E]">Required payload:</span>
            <span className="text-[#FF6A00]">{"{ userId, userEmail }"}</span>
          </div>
          <span className="text-[10px] font-semibold text-[#16A34A] shrink-0 bg-[#DCFCE7] px-2 py-0.5 rounded">
            JSON Only
          </span>
        </div>

        {/* Viewfinder Container */}
        <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-2xl border-2 border-[#E5E7EB] bg-[#0A0F1E] overflow-hidden flex items-center justify-center shadow-inner">
          {/* Permanent Video Element attached to QrScanner */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              hasCamera ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />

          {/* Standby / Initializing View */}
          {!hasCamera && (
            <div className="flex flex-col items-center justify-center p-6 text-center z-10 text-white/70">
              {isInitializing ? (
                <>
                  <RefreshCw className="w-8 h-8 text-[#FF6A00] animate-spin mb-2" />
                  <p className="text-xs font-semibold text-white">Starting Nimiq QR Scanner...</p>
                  <p className="text-[11px] text-white/50 mt-1">Acquiring high-speed camera lens</p>
                </>
              ) : (
                <>
                  <Camera className="w-10 h-10 text-white/40 mb-2 animate-bounce" />
                  <p className="text-xs font-semibold text-white">Camera Standby</p>
                  <p className="text-[11px] text-white/50 max-w-[240px] mt-1">
                    {cameraError || "Point camera directly at attendee QR code."}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Scanner Viewfinder Targeting Frame */}
          <div className="absolute inset-6 sm:inset-10 border border-white/20 rounded-xl pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between w-full">
              <div className="w-5 h-5 border-t-3 border-l-3 border-[#FF6A00] rounded-tl-md" />
              <div className="w-5 h-5 border-t-3 border-r-3 border-[#FF6A00] rounded-tr-md" />
            </div>

            {/* Scanning Laser Line */}
            <div className="relative w-full h-full">
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent shadow-[0_0_12px_#FF6A00] animate-laser-scan" />
            </div>

            <div className="flex justify-between w-full">
              <div className="w-5 h-5 border-b-3 border-l-3 border-[#FF6A00] rounded-bl-md" />
              <div className="w-5 h-5 border-b-3 border-r-3 border-[#FF6A00] rounded-br-md" />
            </div>
          </div>

          {/* Dynamic Flash Feedback Toast: Green for valid, Red for invalid */}
          {feedback && (
            <div
              className={`absolute top-3 left-1/2 -translate-x-1/2 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in zoom-in-95 z-30 max-w-[92%] ${
                feedback.type === "success"
                  ? "bg-[#16A34A] border border-[#22C55E]"
                  : "bg-[#DC2626] border border-[#EF4444]"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-white" />
              )}
              <span className="truncate">{feedback.message}</span>
            </div>
          )}

          {/* Quick Simulation Buttons for Testing JSON vs Invalid */}
          <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between z-20 gap-2">
            <button
              type="button"
              onClick={() => handleScannedResult("INVALID_STRING_NOT_JSON")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-[#FCA5A5] text-[11px] font-semibold backdrop-blur-xs transition-transform active:scale-95 cursor-pointer border border-red-500/30"
              title="Test invalid QR payload"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Simulate Invalid</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const randomId = `NV-USR-${Math.floor(1000 + Math.random() * 9000)}`;
                const emails = [
                  "armaan.m@islec.edu.in",
                  "simran.k@cbit.ac.in",
                  "bilal.ahmed@mjcet.ac.in",
                  "deepa.r@vnr.ac.in",
                ];
                const pickedEmail = emails[Math.floor(Math.random() * emails.length)];
                const payload = JSON.stringify({
                  userId: randomId,
                  userEmail: pickedEmail,
                });
                handleScannedResult(payload);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-[#0A0F1E] text-[11px] font-semibold shadow-md backdrop-blur-xs transition-transform active:scale-95 cursor-pointer border border-[#E5E7EB]"
              title="Test valid JSON {userId, userEmail}"
            >
              <Zap className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Simulate Valid JSON</span>
            </button>
          </div>
        </div>

        {/* Scanned Attendees Table */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs flex flex-col flex-1 min-h-[160px] max-h-[200px]">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#F8F9FA] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider shrink-0">
            <div className="col-span-4 truncate">User ID / Name</div>
            <div className="col-span-5 truncate">userEmail</div>
            <div className="col-span-3 text-right truncate">Time</div>
          </div>

          <div className="overflow-y-auto divide-y divide-[#E5E7EB] flex-1">
            {recentScans.length > 0 ? (
              recentScans.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 px-4 py-2 text-xs items-center hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="col-span-4 truncate">
                    <span className="font-semibold text-[#0A0F1E] block truncate">
                      {item.userId || item.ticketId}
                    </span>
                    <span className="text-[10px] text-[#6B7280] block truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="col-span-5 text-[#4B5563] truncate font-mono text-[11px]">
                    {item.email}
                  </div>
                  <div className="col-span-3 text-right text-[#4B5563] text-[11px] font-mono truncate">
                    {item.timestamp.replace("Today, ", "")}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#9CA3AF] flex flex-col items-center justify-center">
                <ShieldCheck className="w-5 h-5 mb-1 text-[#D1D5DB]" />
                <span>Ready for live attendee JSON pass scan...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
