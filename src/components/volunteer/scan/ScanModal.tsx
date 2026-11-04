"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Camera, RefreshCw, Zap, CheckCircle2 } from "lucide-react";
import { type ScannedMember } from "@/lib/dummy-scan-data";

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (member: ScannedMember) => void;
  recentScans: ScannedMember[];
  currentVolunteer?: string;
}

const SIMULATED_ATTENDEES = [
  { name: "Armaan Malik", email: "armaan.m@islec.edu.in", event: "Tech Battles — Hackathon" },
  { name: "Simran Kaur", email: "simran.k@cbit.ac.in", event: "Cosplay Showcase" },
  { name: "Bilal Ahmed", email: "bilal.ahmed@mjcet.ac.in", event: "Automobile Expo" },
  { name: "Deepa Reddy", email: "deepa.r@vnr.ac.in", event: "Qawwali Night" },
  { name: "Hassan Raza", email: "hassan.raza@islec.edu.in", event: "DJ Night — EDM Blast" },
  { name: "Snehlata Das", email: "snehlata.d@ou.ac.in", event: "Food Fest Exhibition" },
];

export default function ScanModal({
  isOpen,
  onClose,
  onScanSuccess,
  recentScans,
  currentVolunteer = "Syed Ali Quadri",
}: ScanModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  // Initialize rear camera stream
  useEffect(() => {
    if (!isOpen) return;

    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          setHasCamera(false);
          setCameraError("Camera API not supported on this browser");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasCamera(true);
        setCameraError(null);
      } catch (err: unknown) {
        setHasCamera(false);
        const errorMessage =
          err instanceof Error ? err.message : "Unable to access camera";
        setCameraError(errorMessage);
      }
    }

    startCamera();

    // Clean up camera stream on close
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle triggered scan (e.g. from camera QR detection or simulation button)
  const triggerScan = (attendee?: { name: string; email: string; event: string }) => {
    const picked =
      attendee ||
      SIMULATED_ATTENDEES[Math.floor(Math.random() * SIMULATED_ATTENDEES.length)];

    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newRecord: ScannedMember = {
      id: `sc-${Date.now()}`,
      name: picked.name,
      email: picked.email,
      timestamp: `Today, ${timeString}`,
      scannedBy: currentVolunteer,
      eventName: picked.event,
      ticketId: `NV26-TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "Checked In",
    };

    onScanSuccess(newRecord);

    setScannedFeedback(`Scanned: ${picked.name}`);
    setTimeout(() => {
      setScannedFeedback(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs select-none animate-in fade-in-0 duration-200">
      {/* Outer Modal Container matching the wireframe */}
      <div className="w-full max-w-[480px] rounded-3xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-2xl flex flex-col gap-5 relative max-h-[92vh] overflow-hidden">
        {/* Close Button Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
            <h2 className="text-sm font-bold tracking-tight text-[#0A0F1E] uppercase">
              Mobile Back Camera Scanner
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#0A0F1E] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            aria-label="Close scanner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* Top Half: Scanner Viewport (Camera / Viewfinder)        */}
        {/* ======================================================== */}
        <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-2xl border-2 border-[#E5E7EB] bg-[#0A0F1E] overflow-hidden flex items-center justify-center shadow-inner">
          {/* Live Video Feed from Back Camera */}
          {hasCamera ? (
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            /* Fallback Graphic if camera is denied/unavailable */
            <div className="flex flex-col items-center justify-center p-6 text-center z-10 text-white/70">
              <Camera className="w-10 h-10 text-white/40 mb-2 animate-bounce" />
              <p className="text-xs font-semibold text-white">
                Back Camera Ready
              </p>
              <p className="text-[11px] text-white/50 max-w-[240px] mt-1">
                {cameraError || "Point rear camera at attendee QR ticket."}
              </p>
            </div>
          )}

          {/* Scanner Viewfinder Targeting Frame */}
          <div className="absolute inset-6 sm:inset-10 border border-white/20 rounded-xl pointer-events-none flex flex-col justify-between p-2">
            {/* Top Corners */}
            <div className="flex justify-between w-full">
              <div className="w-5 h-5 border-t-3 border-l-3 border-[#FF6A00] rounded-tl-md" />
              <div className="w-5 h-5 border-t-3 border-r-3 border-[#FF6A00] rounded-tr-md" />
            </div>

            {/* Scanning Laser Line */}
            <div className="relative w-full h-full">
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent shadow-[0_0_12px_#FF6A00] animate-laser-scan" />
            </div>

            {/* Bottom Corners */}
            <div className="flex justify-between w-full">
              <div className="w-5 h-5 border-b-3 border-l-3 border-[#FF6A00] rounded-bl-md" />
              <div className="w-5 h-5 border-b-3 border-r-3 border-[#FF6A00] rounded-br-md" />
            </div>
          </div>

          {/* Success Flash Toast */}
          {scannedFeedback && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#16A34A] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in-0 zoom-in-95 z-30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{scannedFeedback}</span>
            </div>
          )}

          {/* Simulate Scan Button Overlay */}
          <div className="absolute bottom-3 right-3 z-20">
            <button
              type="button"
              onClick={() => triggerScan()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#0A0F1E] text-xs font-semibold shadow-md backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Simulate Scan</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Bottom Half: Scanned Attendees Table                    */}
        {/* ======================================================== */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs flex flex-col flex-1 min-h-[170px] max-h-[220px]">
          {/* Table Header exactly as wireframe: Name | email | Time */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#F8F9FA] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider shrink-0">
            <div className="col-span-4 truncate">Name</div>
            <div className="col-span-5 truncate">email</div>
            <div className="col-span-3 text-right truncate">Time</div>
          </div>

          {/* Table Rows */}
          <div className="overflow-y-auto divide-y divide-[#E5E7EB] flex-1">
            {recentScans.length > 0 ? (
              recentScans.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 px-4 py-2 text-xs items-center hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="col-span-4 font-semibold text-[#0A0F1E] truncate">
                    {item.name}
                  </div>
                  <div className="col-span-5 text-[#6B7280] truncate font-mono text-[11px]">
                    {item.email}
                  </div>
                  <div className="col-span-3 text-right text-[#4B5563] text-[11px] font-mono truncate">
                    {item.timestamp.replace("Today, ", "")}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#9CA3AF] flex flex-col items-center justify-center">
                <RefreshCw className="w-4 h-4 mb-1 animate-spin text-[#D1D5DB]" />
                <span>Waiting for next QR scan...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

