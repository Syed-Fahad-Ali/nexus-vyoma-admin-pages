"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import NexusVyomaLogo from "@/components/brand/NexusVyomaLogo";
import GoogleIcon from "@/components/brand/GoogleIcon";

export default function HomePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/events");
    }
  }, [isLoaded, isSignedIn, router]);

  // Avoid showing sign-in UI to already-authenticated users while redirecting
  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-white text-[#0A0F1E] antialiased selection:bg-[#FF6A00]/10 selection:text-[#0A0F1E]">
      {/* ======================================================== */}
      {/* Left Sidebar (Desktop Only)                              */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex flex-col justify-between w-[300px] xl:w-[340px] 2xl:w-[380px] shrink-0 bg-[#F8F9FA] border-r border-[#E5E7EB] p-8 xl:p-10 select-none">
        {/* Top: Nexus Vyoma Arched Wordmark Only */}
        <div>
          <NexusVyomaLogo
            showMark={false}
            wordmarkHeight={30}
          />
        </div>

        {/* Middle: Event Management System Description */}
        <div className="py-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-[12px] font-semibold tracking-[0.2em] text-[#FF6A00] uppercase">
              ADMIN PORTAL
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[#6B7280]">
            Admin Page for Nexus Vyoma.
            <br />
            Coordination, Monitoring, and Volunteering.
          </p>
          <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex items-center gap-2 text-xs text-[#9CA3AF]">
            <span>10 · 11 · 12 NOV 2026</span>
            <span>•</span>
            <span>Hyderabad</span>
          </div>
        </div>

        {/* Bottom: Credits */}
        <div>
          <p className="text-xs text-[#9CA3AF] font-normal tracking-wide">
            Developed by{" "}
            <a
              href="https://nexusvyoma.islec.edu.in/organizers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6B7280] hover:text-[#0A0F1E] underline underline-offset-2 transition-colors"
            >
              Tech Team - Nexus Vyoma
            </a>
          </p>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* Right / Main Content Area (Mobile + Desktop)              */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col justify-between lg:justify-center items-center min-h-screen w-full bg-white px-6 py-10 sm:py-16">
        {/* Spacer for mobile layout alignment */}
        <div className="lg:hidden w-full h-4" />

        {/* Centered Sign-in Card Box */}
        <div className="w-full max-w-[360px] mx-auto my-auto flex flex-col">
          {/* Nexus Vyoma Arched Wordmark Only */}
          <div className="flex justify-center mb-8">
            <NexusVyomaLogo
              showMark={false}
              wordmarkHeight={42}
            />
          </div>

          {/* Header Block */}
          <div className="text-left mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#0A0F1E]">
              Sign in
            </h1>
            <p className="text-sm text-[#6B7280] mt-1.5 font-normal">
              Use your verified Google account to continue to the Admin portal.
            </p>
          </div>

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={() => router.push("/sign-in")}
            aria-label="Continue with Google"
            className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] text-[14px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] active:bg-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            <GoogleIcon size={18} />
            <span>Continue with Google</span>
          </button>

          {/* Invite notice */}
          <div className="flex items-center gap-1.5 mt-4 text-[#9CA3AF]">
            <span className="text-xs font-normal">
              Only invited members can Log in.
            </span>
          </div>
        </div>

        {/* Mobile Footer Credit */}
        <div>
          <p className="text-xs text-[#9CA3AF] font-normal tracking-wide">
            Developed by{" "}
            <a
              href="https://nexusvyoma.islec.edu.in/organizers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6B7280] hover:text-[#0A0F1E] underline underline-offset-2 transition-colors"
            >
              Tech Team - Nexus Vyoma
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
