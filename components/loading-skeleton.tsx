"use client";

import React from "react";
import { RefreshCwIcon, AlertTriangleIcon } from "./icons";

export function QuestionSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-pulse">
      {/* Session Progress Header Skeleton */}
      <div className="flex items-center justify-between pb-3 border-b border-[#DDD6C7]">
        <div className="flex items-center gap-3">
          <div className="h-4 w-36 bg-[#E7E1D5] rounded-md" />
          <div className="h-4 w-2 bg-[#E7E1D5] rounded-full" />
          <div className="h-4 w-24 bg-[#E7E1D5] rounded-md" />
        </div>
        <div className="h-4 w-28 bg-[#E7E1D5] rounded-md" />
      </div>

      {/* Main Question Card Skeleton */}
      <div className="rounded-2xl border border-[#DDD6C7] bg-[#FFFDF9] studio-card p-6 sm:p-8">
        {/* Meta tags */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#DDD6C7]">
          <div className="h-6 w-32 bg-[#EFEAE0] border border-[#DDD6C7] rounded-full" />
          <div className="h-6 w-24 bg-[#E7E1D5] rounded-full" />
        </div>

        {/* Prompt Lines */}
        <div className="mt-6 flex flex-col gap-2.5">
          <div className="h-6 w-3/4 bg-[#E7E1D5] rounded-lg" />
          <div className="h-6 w-1/2 bg-[#E7E1D5]/80 rounded-lg" />
        </div>

        {/* Code Box Skeleton */}
        <div className="mt-5 rounded-xl border border-[#DDD6C7] bg-[#1C1917] p-5 overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
              <div className="h-3 w-28 bg-stone-800 rounded ml-2" />
            </div>
            <div className="h-5 w-16 bg-stone-800 rounded" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-4 w-5/6 bg-stone-800 rounded" />
            <div className="h-4 w-2/3 bg-stone-800/80 rounded" />
            <div className="h-4 w-4/5 bg-stone-800/90 rounded" />
            <div className="h-4 w-1/2 bg-stone-800/70 rounded" />
          </div>
        </div>

        {/* Option Cards Skeleton */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="h-4 w-32 bg-[#E7E1D5] rounded" />
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl border border-[#DDD6C7] bg-[#F6F3EC]"
              >
                <div className="w-7 h-7 rounded-lg bg-[#E7E1D5] flex-shrink-0" />
                <div className="h-4 w-3/5 bg-[#E7E1D5] rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Line Skeleton */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="h-4 w-48 bg-[#E7E1D5] rounded" />
          <div className="h-12 w-full bg-[#EFEAE0] border border-[#DDD6C7] rounded-xl" />
          <div className="h-11 w-full bg-[#E7E1D5] rounded-xl mt-2" />
        </div>
      </div>
    </div>
  );
}

export function GraphSkeleton() {
  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-[#FFFDF9] rounded-2xl border border-[#DDD6C7] studio-card animate-pulse relative overflow-hidden">
      <div className="grid grid-cols-3 gap-6 w-full max-w-2xl opacity-75">
        <div className="col-span-3 flex justify-center">
          <div className="w-48 h-20 bg-[#EFEAE0] rounded-xl border border-[#DDD6C7]" />
        </div>
        <div className="col-span-3 flex justify-around">
          <div className="w-44 h-20 bg-[#EFEAE0] rounded-xl border border-[#DDD6C7]" />
          <div className="w-44 h-20 bg-[#EFEAE0] rounded-xl border border-[#DDD6C7]" />
        </div>
        <div className="col-span-3 flex justify-between">
          <div className="w-40 h-20 bg-[#EFEAE0] rounded-xl border border-[#DDD6C7]" />
          <div className="w-40 h-20 bg-[#EFEAE0] rounded-xl border border-[#DDD6C7]" />
          <div className="w-40 h-20 bg-[#EFEAE0] rounded-xl border border-[#DDD6C7]" />
        </div>
      </div>
      <div className="mt-8 flex items-center gap-2 text-[#57534E] text-xs font-mono">
        <RefreshCwIcon className="w-4 h-4 animate-spin text-[#D94F2B]" />
        <span>Synthesizing Concept Knowledge Network...</span>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="w-full p-6 bg-[#FFFDF9] rounded-2xl border border-[#DDD6C7] studio-card animate-pulse flex flex-col gap-4">
      <div className="flex items-center justify-between pb-4 border-b border-[#DDD6C7]">
        <div className="h-6 w-56 bg-[#E7E1D5] rounded-lg" />
        <div className="h-9 w-64 bg-[#EFEAE0] border border-[#DDD6C7] rounded-xl" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="flex items-center gap-3">
            <div className="h-10 w-40 bg-[#E7E1D5] rounded-xl flex-shrink-0" />
            <div className="flex-1 grid grid-cols-12 gap-2">
              {[...Array(12)].map((_, col) => (
                <div key={col} className="h-10 bg-[#EFEAE0] rounded-lg" />
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
    <div className="rounded-2xl border border-[#DDD6C7] bg-[#FFFDF9] studio-card p-5 animate-pulse flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#DDD6C7]">
        <div className="h-5 w-32 bg-[#E7E1D5] rounded" />
        <div className="h-5 w-24 bg-[#E7E1D5] rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 bg-[#EFEAE0] border border-[#DDD6C7] rounded-xl"
          />
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
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl border border-[#F2C0B5] bg-[#FCECE8] max-w-lg mx-auto shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-white text-[#C23B22] border border-[#F2C0B5] flex items-center justify-center mb-4 shadow-xs">
        <AlertTriangleIcon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-display font-semibold text-[#1C1917] tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#57534E] mt-2 max-w-sm leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 px-5 py-2.5 rounded-xl bg-[#D94F2B] hover:bg-[#BE3E1D] text-[#FFFDF9] text-xs font-medium transition-all shadow-[0_2px_0_0_#9E3115] active:translate-y-[1px] flex items-center gap-2 cursor-pointer"
        >
          <RefreshCwIcon className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
