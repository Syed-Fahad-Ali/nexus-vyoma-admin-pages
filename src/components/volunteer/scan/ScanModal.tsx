"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import QrScanner from "qr-scanner";
import {
  X,
  Camera,
  RefreshCw,
  CheckCircle2,
  Volume2,
  AlertCircle,
} from "lucide-react";
import { type ScannedMember } from "@/lib/dummy-scan-data";

export interface ScanResultFeedback {
  success: boolean;
  message: string;
  email?: string;
}

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (member: ScannedMember) => Promise<ScanResultFeedback | void> | void;
  recentScans?: ScannedMember[];
  currentVolunteer?: string;
}

export interface QrPayload {
  userId: string;
  userEmail: string;
}

/**
 * Extracts userId, userEmail, and name from any scanned string or JSON payload.
 * Accepts any format without rejection.
 */
export function extractQrPayload(raw: string): { userId: string; userEmail: string; name?: string } {
  try {
    const parsed = JSON.parse(raw.trim());
    if (typeof parsed === "object" && parsed !== null) {
      const userId = String(parsed.userId || parsed.id || parsed.ticketId || `USR-${Date.now().toString().slice(-4)}`);
      const userEmail = String(parsed.userEmail || parsed.email || `${userId.toLowerCase()}@islec.edu.in`);
      const name = parsed.name || parsed.fullName || userEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      return { userId, userEmail, name };
    }
  } catch {
    // Plain text or URL fallback
  }

  const trimmed = raw.trim();
  if (trimmed.includes("@")) {
    const userEmail = trimmed;
    const name = userEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const userId = `USR-${Math.abs(trimmed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0))}`;
    return { userId, userEmail, name };
  }

  const userId = trimmed || `USR-${Date.now().toString().slice(-4)}`;
  return {
    userId,
    userEmail: `${userId.toLowerCase().replace(/[^a-z0-9]/g, "")}@islec.edu.in`,
    name: `Attendee ${userId}`,
  };
}

/**
 * Legacy compatibility helper
 */
export function validateQrPayload(raw: string): { isValid: true; data: QrPayload } {
  const extracted = extractQrPayload(raw);
  return {
    isValid: true,
    data: {
      userId: extracted.userId,
      userEmail: extracted.userEmail,
    },
  };
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

export default function ScanModal({
  isOpen,
  onClose,
  onScanSuccess,
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

  // Handle scanned raw string without rejecting any payload
  const handleScannedResult = useCallback(
    async (rawText: string) => {
      const now = Date.now();

      // Debounce duplicate identical scans within 2 seconds
      if (lastScannedRaw.current === rawText && now - lastScanTime.current < 2000) {
        return;
      }
      lastScannedRaw.current = rawText;
      lastScanTime.current = now;

      const { userId, userEmail, name } = extractQrPayload(rawText);
      playScanTick();

      const timeString = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const newRecord: ScannedMember = {
        id: `sc-${Date.now()}`,
        userId,
        name: name || `User ${userId}`,
        email: userEmail,
        timestamp: `Today, ${timeString}`,
        scannedBy: currentVolunteer,
        eventName: "Nexus Fest Gate",
        ticketId: userId,
        status: "Checked In",
      };

      try {
        const result = await onScanSuccess(newRecord);
        if (result && typeof result === "object") {
          setFeedback({
            type: result.success ? "success" : "error",
            message: result.message,
          });
        } else {
          setFeedback({
            type: "success",
            message: `${userEmail} has been checked in`,
          });
        }
      } catch (err) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : `${userEmail} check-in failed`,
        });
      }

      setTimeout(() => {
        setFeedback((prev) => (prev ? null : prev));
      }, 3500);
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
        const errMsg = err instanceof Error ? err.message : "Failed to access camera.";
        setCameraError(errMsg);
        setHasCamera(false);
        setIsInitializing(false);
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

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 select-none"
    >
      {/* Outer Modal Container */}
      <div className="w-full max-w-[460px] rounded-3xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-2xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                hasCamera ? "bg-[#16A34A] animate-pulse" : "bg-[#D97706]"
              }`}
            />
            <h2 className="text-sm font-bold tracking-tight text-[#0A0F1E] uppercase">
              QR Ticket Scanner
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

        {/* Viewfinder Container */}
        <div className="relative w-full aspect-square rounded-2xl border-2 border-[#E5E7EB] bg-[#0A0F1E] overflow-hidden flex items-center justify-center shadow-inner">
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
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center z-10">
              {isInitializing ? (
                <>
                  <RefreshCw className="w-8 h-8 text-[#FF6A00] animate-spin" />
                  <span className="text-xs font-semibold text-white">
                    Activating high-speed scanner...
                  </span>
                  <span className="text-[11px] text-[#9CA3AF]">
                    Requesting camera permissions
                  </span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-[#EF4444]">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-white">
                    {cameraError || "Camera Unavailable"}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF] max-w-[220px]">
                    Use the simulation trigger below to test QR pass verification.
                  </span>
                </>
              )}
            </div>
          )}

          {/* Targeting Corner Brackets overlay */}
          <div className="absolute inset-8 pointer-events-none flex flex-col justify-between z-10 opacity-80">
            <div className="flex justify-between w-full">
              <div className="w-6 h-6 border-t-3 border-l-3 border-[#FF6A00] rounded-tl-md" />
              <div className="w-6 h-6 border-t-3 border-r-3 border-[#FF6A00] rounded-tr-md" />
            </div>

            {/* Scanning Laser Line */}
            <div className="relative w-full h-full">
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent shadow-[0_0_12px_#FF6A00] animate-laser-scan" />
            </div>

            <div className="flex justify-between w-full">
              <div className="w-6 h-6 border-b-3 border-l-3 border-[#FF6A00] rounded-bl-md" />
              <div className="w-6 h-6 border-b-3 border-r-3 border-[#FF6A00] rounded-br-md" />
            </div>
          </div>

          {/* Dynamic Flash Feedback Toast */}
          {feedback && (
            <div
              className={`absolute top-4 left-1/2 -translate-x-1/2 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200 z-30 max-w-[92%] backdrop-blur-md ${
                feedback.type === "success"
                  ? "bg-[#16A34A]/95 border border-[#22C55E] text-white shadow-green-950/40"
                  : "bg-[#DC2626]/95 border border-[#EF4444] text-white shadow-red-950/40"
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
        </div>
      </div>
    </div>
  );
}
