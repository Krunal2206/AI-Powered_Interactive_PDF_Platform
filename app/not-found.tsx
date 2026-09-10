"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Home,
  LayoutDashboard,
  Upload,
  Sparkles,
  HelpCircle,
  FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Background ambient lighting glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-125 sm:w-175 h-125 bg-purple-600/15 rounded-full blur-3xl -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-1/4 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl -z-10"
      />

      <main className="w-full max-w-2xl mx-auto flex flex-col items-center text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-purple-500/10 border border-purple-500/25 text-purple-300 backdrop-blur-md mb-6 shadow-xs animate-in fade-in zoom-in duration-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
          </span>
          <span>404 • Missing Document</span>
        </div>

        {/* Engaging Custom SVG Illustration */}
        <div className="relative w-full max-w-sm sm:max-w-md h-64 sm:h-72 mb-6 flex items-center justify-center select-none">
          {/* Outer floating glow circle */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-purple-600/20 via-pink-600/15 to-transparent blur-2xl animate-pulse duration-3000" />

          <svg
            viewBox="0 0 420 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
            role="img"
            aria-label="Illustration of a lost PDF document floating in digital space"
          >
            <defs>
              <linearGradient
                id="docGrad"
                x1="60"
                y1="30"
                x2="320"
                y2="290"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient
                id="borderGrad"
                x1="60"
                y1="30"
                x2="320"
                y2="290"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient
                id="foldGrad"
                x1="260"
                y1="30"
                x2="320"
                y2="90"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="aiGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
              <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
              <filter
                id="softGlow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Radar scan concentric circles */}
            <circle
              cx="210"
              cy="155"
              r="135"
              stroke="#a855f7"
              strokeWidth="1"
              strokeDasharray="6 6"
              opacity="0.25"
            />
            <circle
              cx="210"
              cy="155"
              r="105"
              stroke="#c084fc"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.3"
            />
            <circle cx="210" cy="155" r="75" fill="url(#radarGlow)" />

            {/* Background PDF Shadow */}
            <ellipse
              cx="210"
              cy="275"
              rx="100"
              ry="14"
              fill="#000000"
              opacity="0.4"
            />

            {/* Main Floating PDF Document */}
            <g className="transition-transform duration-700 ease-out hover:-translate-y-1">
              {/* Document Base (with folded corner cut) */}
              <path
                d="M 120 40 
                   L 260 40 
                   L 310 90 
                   L 310 250 
                   Q 310 260, 300 260 
                   L 120 260 
                   Q 110 260, 110 250 
                   L 110 50 
                   Q 110 40, 120 40 Z"
                fill="url(#docGrad)"
                stroke="url(#borderGrad)"
                strokeWidth="2"
              />

              {/* Folded Corner flap */}
              <path
                d="M 260 40 
                   L 260 82 
                   Q 260 90, 268 90 
                   L 310 90 Z"
                fill="url(#foldGrad)"
                stroke="#c084fc"
                strokeWidth="1.5"
                opacity="0.9"
              />

              {/* PDF Badge on header */}
              <rect
                x="130"
                y="60"
                width="52"
                height="22"
                rx="6"
                fill="#ec4899"
                fillOpacity="0.2"
                stroke="#ec4899"
                strokeWidth="1.5"
              />
              <text
                x="141"
                y="76"
                fill="#f472b6"
                fontSize="11"
                fontWeight="700"
                fontFamily="sans-serif"
                letterSpacing="1"
              >
                PDF
              </text>

              {/* Document Text Line Skeletons */}
              <rect
                x="195"
                y="67"
                width="50"
                height="8"
                rx="4"
                fill="#64748b"
                opacity="0.5"
              />
              <rect
                x="130"
                y="105"
                width="130"
                height="7"
                rx="3.5"
                fill="#475569"
                opacity="0.6"
              />
              <rect
                x="130"
                y="123"
                width="150"
                height="7"
                rx="3.5"
                fill="#475569"
                opacity="0.4"
              />
              <rect
                x="130"
                y="141"
                width="110"
                height="7"
                rx="3.5"
                fill="#475569"
                opacity="0.3"
              />

              {/* Central Hollow Question Mark & 404 Stamp */}
              <g transform="translate(160, 160)">
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="74"
                  rx="12"
                  fill="#0f172a"
                  fillOpacity="0.75"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <text
                  x="50"
                  y="36"
                  fill="url(#aiGlow)"
                  fontSize="20"
                  fontWeight="800"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  404
                </text>
                <text
                  x="50"
                  y="56"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="500"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  PAGE MISSING
                </text>
              </g>

              {/* Laser / Scanner beam across the document */}
              <line
                x1="105"
                y1="130"
                x2="315"
                y2="130"
                stroke="url(#aiGlow)"
                strokeWidth="2"
                opacity="0.8"
                filter="url(#softGlow)"
              />
            </g>

            {/* Floating Satellite 1: AI Chat Bubble with typing dots */}
            <g
              className="transition-transform duration-500 ease-in-out"
              transform="translate(45, 95)"
            >
              <rect
                width="84"
                height="46"
                rx="14"
                fill="#1e1b4b"
                stroke="#a855f7"
                strokeWidth="1.5"
                filter="url(#softGlow)"
              />
              <path d="M 64 46 L 72 56 L 74 46 Z" fill="#1e1b4b" />
              <circle cx="28" cy="23" r="3.5" fill="#c084fc">
                <animate
                  attributeName="opacity"
                  values="0.3;1;0.3"
                  dur="1.4s"
                  repeatCount="indefinite"
                  begin="0s"
                />
              </circle>
              <circle cx="42" cy="23" r="3.5" fill="#c084fc">
                <animate
                  attributeName="opacity"
                  values="0.3;1;0.3"
                  dur="1.4s"
                  repeatCount="indefinite"
                  begin="0.2s"
                />
              </circle>
              <circle cx="56" cy="23" r="3.5" fill="#c084fc">
                <animate
                  attributeName="opacity"
                  values="0.3;1;0.3"
                  dur="1.4s"
                  repeatCount="indefinite"
                  begin="0.4s"
                />
              </circle>
            </g>

            {/* Floating Satellite 2: Glowing Magnifying Glass searching */}
            <g transform="translate(290, 165)">
              <circle
                cx="34"
                cy="34"
                r="24"
                fill="#1e1b4b"
                fillOpacity="0.6"
                stroke="#ec4899"
                strokeWidth="3"
              />
              <circle cx="34" cy="34" r="17" fill="url(#radarGlow)" />
              <line
                x1="51"
                y1="51"
                x2="72"
                y2="72"
                stroke="#ec4899"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <text
                x="34"
                y="40"
                fill="#f472b6"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                ?
              </text>
            </g>

            {/* Little Sparkles / Neural Stars */}
            <g fill="#ec4899" opacity="0.85">
              <path d="M 90 220 Q 90 226 96 226 Q 90 226 90 232 Q 90 226 84 226 Q 90 226 90 220 Z" />
              <path
                d="M 345 75 Q 345 81 351 81 Q 345 81 345 87 Q 345 81 339 81 Q 345 81 345 75 Z"
                fill="#c084fc"
              />
              <path
                d="M 205 20 Q 205 24 209 24 Q 205 24 205 28 Q 205 24 201 24 Q 205 24 205 20 Z"
                fill="#fb7185"
              />
            </g>
          </svg>
        </div>

        {/* Engaging Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
          Page Lost in the{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Digital Stacks
          </span>
        </h1>

        {/* Descriptive Body */}
        <p className="text-slate-300 sm:text-lg max-w-lg mb-8 leading-relaxed">
          The document, chat conversation, or route you are looking for has
          either been moved, deleted, or never existed in our library.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12 w-full max-w-md">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex-1 min-w-35 border-white/20 hover:bg-white/10 hover:text-white hover:shadow-purple-500/25 transition-all duration-300 cursor-pointer h-11"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Button
            asChild
            className="flex-1 min-w-35 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40 hover:shadow-purple-700/50 transition-all cursor-pointer h-11"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Home Page
            </Link>
          </Button>

          <Button
            asChild
            variant="secondary"
            className="flex-1 min-w-35 bg-slate-800/80 hover:bg-slate-700/90 text-slate-100 border border-slate-700/50 cursor-pointer h-11"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>

        {/* Helpful Quick Shortcuts Box */}
        <div className="w-full max-w-lg p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl text-left">
          <div className="flex items-center gap-2 mb-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Looking for something specific?</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href="/dashboard/upload"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/30 transition-all group"
            >
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-purple-300 transition-colors">
                  Upload PDF
                </p>
                <p className="text-xs text-slate-500">Add a new document</p>
              </div>
            </Link>

            <Link
              href="/pricing"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/30 transition-all group"
            >
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20 transition-colors">
                <FileQuestion className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-pink-300 transition-colors">
                  Plans & Pricing
                </p>
                <p className="text-xs text-slate-500">Explore features</p>
              </div>
            </Link>

            <Link
              href="/contact"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/30 transition-all group sm:col-span-2"
            >
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                  Need Help or Found a Bug?
                </p>
                <p className="text-xs text-slate-500">
                  Contact our support team
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
