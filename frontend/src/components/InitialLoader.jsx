'use client';

import React, { useState, useEffect } from 'react';

const STATUS_STEPS = [
  "Connecting to UniPortal Academic Engine...",
  "Verifying session credentials...",
  "Loading campus notices & schedule...",
  "Preparing interactive portal workspace..."
];

export default function InitialLoader({ onComplete, isFinished = false, minDuration = 800 }) {
  const [progress, setProgress] = useState(12);
  const [stepIndex, setStepIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();

    // Progress animation timeline
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) {
          clearInterval(interval);
          return 96;
        }
        // Micro incremental step
        const next = prev + Math.floor(Math.random() * 18) + 8;
        return next > 96 ? 96 : next;
      });
    }, 120);

    // Status text step cycler
    const textInterval = setInterval(() => {
      setStepIndex((prev) => (prev < STATUS_STEPS.length - 1 ? prev + 1 : prev));
    }, 240);

    // Completion timeout
    const completeTimeout = setTimeout(() => {
      setProgress(100);
      setStepIndex(STATUS_STEPS.length - 1);

      // Start fade out after progress reaches 100%
      const fadeTimeout = setTimeout(() => {
        setFadeOut(true);
        const exitTimeout = setTimeout(() => {
          if (onComplete) onComplete();
        }, 400); // 400ms fade transition
        return () => clearTimeout(exitTimeout);
      }, 150);

      return () => clearTimeout(fadeTimeout);
    }, Math.max(minDuration, 700));

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
      clearTimeout(completeTimeout);
    };
  }, [minDuration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-slate-100 transition-all duration-500 ease-out select-none ${
        fadeOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[130px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none animate-float" />
      
      {/* Background Dot Grid */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center">
        
        {/* Animated Brand Emblem & Ring */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer Rotating Pulse Ring */}
          <div className="absolute w-24 h-24 rounded-full border-2 border-blue-500/30 border-t-blue-400 border-r-cyan-400 animate-spin" style={{ animationDuration: '2.5s' }} />
          <div className="absolute w-28 h-28 rounded-full border border-indigo-500/20 animate-ping opacity-40" style={{ animationDuration: '3s' }} />
          
          {/* Central Logo Box */}
          <div className="w-16 h-16 rounded-2xl bg-blue-600 p-0.5 shadow-2xl shadow-blue-500/30">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <svg
                className="w-9 h-9 text-blue-400 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0v6"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand Name & Subtitle */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
          Uni<span className="text-blue-400">Portal</span>
        </h1>
        <p className="text-xs tracking-widest text-slate-400 uppercase font-medium mb-8">
          Academic Management System
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-full h-2.5 p-0.5 mb-4 shadow-inner relative overflow-hidden">
          {/* Animated Fill Bar */}
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-200 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer Overlay */}
            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
          </div>
        </div>

        {/* Progress Details & Status Text */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <span className="truncate max-w-[240px] text-slate-300 transition-all duration-300">
            {STATUS_STEPS[stepIndex]}
          </span>
          <span className="font-semibold text-blue-400 ml-2">
            {progress}%
          </span>
        </div>

        {/* Status Indicator */}
        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>System status: <span className="text-slate-200 font-medium">Operational</span></span>
        </div>

      </div>
    </div>
  );
}
