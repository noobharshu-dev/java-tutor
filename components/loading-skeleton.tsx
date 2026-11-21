"use client";

import React from "react";
import { RefreshCwIcon, AlertTriangleIcon } from "./icons";

export function QuestionSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-pulse">
      {/* Session Progress Header Skeleton */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-4 w-36 bg-slate-800 rounded-md" />
          <div className="h-4 w-2 bg-slate-800 rounded-full" />
          <div className="h-4 w-24 bg-slate-800 rounded-md" />
        </div>
        <div className="h-4 w-28 bg-slate-800 rounded-md" />
      </div>

      {/* Main Question Card Skeleton */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8">
        {/* Meta tags */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="h-6 w-32 bg-indigo-950/60 border border-indigo-800/40 rounded-full" />
          <div className="h-6 w-24 bg-slate-800 rounded-full" />
        </div>

        {/* Prompt Lines */}
        <div className="mt-6 flex flex-col gap-2.5">
          <div className="h-6 w-3/4 bg-slate-800 rounded-lg" />
          <div className="h-6 w-1/2 bg-slate-800/80 rounded-lg" />
        </div>

        {/* Code Box Skeleton */}
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-800" />
              <div className="w-3 h-3 rounded-full bg-slate-800" />
              <div className="w-3 h-3 rounded-full bg-slate-800" />
              <div className="h-3 w-28 bg-slate-800 rounded ml-2" />
            </div>
            <div className="h-6 w-16 bg-slate-800 rounded-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
            <div className="h-4 w-2/3 bg-slate-800/50 rounded" />
            <div className="h-4 w-4/5 bg-slate-800/70 rounded" />
            <div className="h-4 w-1/2 bg-slate-800/60 rounded" />
            <div className="h-4 w-3/4 bg-slate-800/50 rounded" />
          </div>
        </div>

        {/* Option Cards Skeleton */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="h-4 w-32 bg-slate-800/80 rounded" />
          <div className="grid grid-cols-1 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-950/50"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex-shrink-0" />
                <div className="h-4 w-3/5 bg-slate-800/70 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Line Skeleton */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="h-4 w-48 bg-slate-800/70 rounded" />
          <div className="h-12 w-full bg-slate-950/80 border border-slate-800 rounded-xl" />
          <div className="h-12 w-full bg-slate-800 rounded-2xl mt-2" />
        </div>
      </div>
    </div>
  );
}

export function GraphSkeleton() {
  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-slate-950/90 rounded-3xl border border-slate-800 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-radial from-indigo-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="grid grid-cols-3 gap-8 w-full max-w-2xl opacity-60">
        <div className="col-span-3 flex justify-center">
          <div className="w-48 h-20 bg-slate-800 rounded-2xl border border-slate-700" />
        </div>
        <div className="col-span-3 flex justify-around">
          <div className="w-44 h-20 bg-slate-800 rounded-2xl border border-slate-700" />
          <div className="w-44 h-20 bg-slate-800 rounded-2xl border border-slate-700" />
        </div>
        <div className="col-span-3 flex justify-between">
          <div className="w-40 h-20 bg-slate-800 rounded-2xl border border-slate-700" />
          <div className="w-40 h-20 bg-slate-800 rounded-2xl border border-slate-700" />
          <div className="w-40 h-20 bg-slate-800 rounded-2xl border border-slate-700" />
        </div>
      </div>
      <div className="mt-8 flex items-center gap-2 text-slate-400 text-xs font-mono">
        <RefreshCwIcon className="w-4 h-4 animate-spin text-indigo-400" />
        <span>Synthesizing Concept Knowledge Network...</span>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="w-full p-6 bg-slate-900/80 rounded-3xl border border-slate-800 animate-pulse flex flex-col gap-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="h-6 w-56 bg-slate-800 rounded-lg" />
        <div className="h-9 w-64 bg-slate-950 border border-slate-800 rounded-xl" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="flex items-center gap-3">
            <div className="h-10 w-40 bg-slate-800 rounded-xl flex-shrink-0" />
            <div className="flex-1 grid grid-cols-12 gap-2">
              {[...Array(12)].map((_, col) => (
                <div key={col} className="h-10 bg-slate-800/60 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 animate-pulse flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="h-5 w-32 bg-slate-800 rounded" />
        <div className="h-5 w-24 bg-slate-800 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-slate-950/70 border border-slate-800/80 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ErrorStateCard({
  title = "Something went wrong",
  message = "Failed to load data from the server.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-3xl border border-rose-900/50 bg-rose-950/20 backdrop-blur-md shadow-2xl max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4">
        <AlertTriangleIcon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-sm leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 min-h-[44px] cursor-pointer"
        >
          <RefreshCwIcon className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
