"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ReviewItem, Concept } from "@/lib/types";
import { CheckCircleIcon, ArrowRightIcon, AlertTriangleIcon } from "./icons";
import { PanelSkeleton } from "./loading-skeleton";

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
    <div className="studio-card rounded-2xl p-5 space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E3DDD1]">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-semibold text-[#1C1917] tracking-tight">
            Spaced Review Queue
          </h3>
          <span className="bg-[#F2EDE3] border border-[#DDD6C7] text-[#57534E] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
            SM-2
          </span>
        </div>
        <span
          className={`text-xs font-mono font-medium px-2.5 py-0.5 rounded-full ${
            dueItems.length > 0
              ? "bg-[#FCECE8] text-[#B53219] border border-[#F2C0B5]"
              : "bg-[#E6F4F1] text-[#0F766E] border border-[#B2DDD5]"
          }`}
        >
          {dueItems.length > 0 ? `${dueItems.length} Due Now` : "All Caught Up"}
        </span>
      </div>

      {isLoading ? (
        <PanelSkeleton />
      ) : reviews.length === 0 ? (
        <div className="text-center py-6 text-[#78716C]">
          <CheckCircleIcon className="w-8 h-8 text-[#0F766E] mx-auto mb-2" />
          <p className="text-xs font-medium text-[#1C1917]">No reviews pending</p>
          <p className="text-[11px] text-[#78716C] mt-0.5">Your memory retention is optimal.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
          {/* Overdue / Due Today */}
          {dueItems.map((item) => (
            <div
              key={item.concept_id}
              className="bg-[#F6F3EC] border border-[#E3DDD1] rounded-xl px-3.5 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <AlertTriangleIcon className="w-3.5 h-3.5 text-[#D94F2B] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-[#1C1917] truncate">
                    {getConceptName(item.concept_id)}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium text-[#B53219] bg-[#FCECE8] px-2 py-0.5 rounded border border-[#F2C0B5]">
                  Due now
                </span>
              </div>

              {onSelectConcept ? (
                <button
                  type="button"
                  onClick={() => onSelectConcept(item.concept_id)}
                  className="text-xs font-mono font-medium text-[#D94F2B] hover:text-[#BE3E1D] flex items-center gap-1 flex-shrink-0 transition-colors cursor-pointer"
                >
                  <span>Practice</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  href={`/practice?concept_id=${item.concept_id}`}
                  className="text-xs font-mono font-medium text-[#D94F2B] hover:text-[#BE3E1D] flex items-center gap-1 flex-shrink-0 transition-colors"
                >
                  <span>Practice</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}

          {/* Upcoming reviews */}
          {upcomingItems.slice(0, 4).map((item) => (
            <div
              key={item.concept_id}
              className="bg-[#FAF7F0] border border-[#E3DDD1] rounded-xl px-3 py-2.5 flex items-center justify-between gap-2 text-xs"
            >
              <span className="text-[#57534E] font-medium truncate">
                {getConceptName(item.concept_id)}
              </span>
              <span className="text-[11px] font-mono text-[#78716C] bg-[#EAE4D8] px-2 py-0.5 rounded flex-shrink-0">
                In {item.due_in_days}d
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
