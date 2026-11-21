"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ReviewItem, Concept } from "@/lib/types";
import { ClockIcon, CheckCircleIcon, ArrowRightIcon, RefreshCwIcon, AlertTriangleIcon } from "./icons";

interface ReviewsDuePanelProps {
  studentId?: string;
  concepts?: Concept[];
  onSelectConcept?: (conceptId: string) => void;
}

export function ReviewsDuePanel({
  studentId = "student-1",
  concepts = [],
  onSelectConcept,
}: ReviewsDuePanelProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const url = new URL("/api/reviews", window.location.origin);
    url.searchParams.set("student_id", studentId);

    fetch(url.toString())
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reviews");
        return res.json();
      })
      .then((data: ReviewItem[]) => {
        if (isMounted && Array.isArray(data)) {
          setReviews(data);
        }
      })
      .catch((err) => {
        console.warn("Falling back to /api/review:", err);
        // Fallback to /api/review
        fetch(`/api/review?student_id=${studentId}`)
          .then((res) => res.json())
          .then((fallbackData) => {
            if (isMounted && Array.isArray(fallbackData)) setReviews(fallbackData);
          })
          .catch(() => {});
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const getConceptName = (id: string) => {
    const found = concepts.find((c) => c.id === id);
    return found ? found.name : id;
  };

  const dueItems = reviews.filter((r) => r.due_in_days <= 0);
  const upcomingItems = reviews.filter((r) => r.due_in_days > 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col gap-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base tracking-tight">Reviews Due</h3>
        </div>
        <span
          className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
            dueItems.length > 0
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          }`}
        >
          {dueItems.length > 0 ? `${dueItems.length} Due Today` : "All Caught Up"}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-6 text-slate-400">
          <RefreshCwIcon className="w-5 h-5 animate-spin mr-2 text-indigo-400" />
          <span className="text-xs">Checking SM-2 retention curves...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          <CheckCircleIcon className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-white">No reviews pending</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Your memory retention is optimal.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
          {/* Overdue / Due Today */}
          {dueItems.map((item) => (
            <div
              key={item.concept_id}
              className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-white truncate">
                    {getConceptName(item.concept_id)}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-amber-300 font-semibold">
                  Due today
                </span>
              </div>

              {onSelectConcept ? (
                <button
                  type="button"
                  onClick={() => onSelectConcept(item.concept_id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1 flex-shrink-0 min-h-[32px]"
                >
                  <span>Review</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  href={`/practice?concept_id=${item.concept_id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1 flex-shrink-0 min-h-[32px]"
                >
                  <span>Review</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}

          {/* Upcoming reviews */}
          {upcomingItems.slice(0, 4).map((item) => (
            <div
              key={item.concept_id}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/50 flex items-center justify-between gap-2 text-xs"
            >
              <span className="text-slate-300 font-medium truncate">
                {getConceptName(item.concept_id)}
              </span>
              <span className="text-[11px] font-mono text-slate-500 flex-shrink-0">
                In {item.due_in_days}d
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
