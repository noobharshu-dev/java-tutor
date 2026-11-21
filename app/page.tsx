"use client";

import React, { useEffect, useState } from "react";
import {
  AnswerResponse,
  Concept,
  MasteryResponse,
  Question,
  ReviewItem,
  TeacherResponse,
} from "@/lib/types";
import {
  apiGetConcepts,
  apiGetMastery,
  apiGetQuestion,
  apiGetReviews,
  apiGetTeacherDashboard,
  apiSubmitAnswer,
} from "@/components/api-client";
import { Navbar, ActiveTab } from "@/components/navbar";
import { TutorView } from "@/components/tutor-view";
import { MasteryView } from "@/components/mastery-view";
import { ReviewView } from "@/components/review-view";
import { TeacherView } from "@/components/teacher-view";
import { DiagnosticModal } from "@/components/diagnostic-modal";
import { BrainIcon, AwardIcon } from "@/components/icons";

export default function Home() {
  const [studentId, setStudentId] = useState<string>("student-1");
  const [activeTab, setActiveTab] = useState<ActiveTab>("tutor");

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [masteryData, setMasteryData] = useState<MasteryResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [teacherData, setTeacherData] = useState<TeacherResponse | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<AnswerResponse | null>(null);
  const [activeConceptId, setActiveConceptId] = useState<string | undefined>(undefined);

  const toPercent = (val: number | undefined): number => {
    if (val === undefined || isNaN(val)) return 0;
    return val <= 1 ? Math.round(val * 100) : Math.round(val);
  };

  // Initial load with cleanup flag to satisfy React 19 hook guidelines
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [fetchedConcepts, fetchedMastery, fetchedReviews, fetchedTeacher] =
          await Promise.all([
            apiGetConcepts(),
            apiGetMastery(studentId),
            apiGetReviews(studentId),
            apiGetTeacherDashboard(),
          ]);

        if (!ignore) {
          setConcepts(fetchedConcepts);
          setMasteryData(fetchedMastery);
          setReviews(fetchedReviews);
          setTeacherData(fetchedTeacher);
        }

        const q = await apiGetQuestion(studentId);
        if (!ignore) {
          setCurrentQuestion(q);
          setActiveConceptId(q.concept_id);
        }
      } catch (err) {
        console.error("Error loading tutor data:", err);
      }
    }

    void loadData();

    return () => {
      ignore = true;
    };
  }, [studentId]);

  // Handle Answer Submission
  const handleSubmitAnswer = async (optionId: string, reasoning: string) => {
    if (!currentQuestion) return;
    setIsSubmitting(true);
    try {
      const response = await apiSubmitAnswer({
        student_id: studentId,
        question_id: currentQuestion.id,
        option_id: optionId,
        reasoning,
      });

      setDiagnosticResult(response);
      setShowDiagnosticModal(true);

      // Update local mastery cache
      if (response.mastery) {
        setMasteryData((prev) =>
          prev
            ? { ...prev, mastery: response.mastery }
            : { mastery: response.mastery, edges: [] }
        );
      }
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Continue to Next Question from Diagnostic Modal
  const handleContinueAfterDiagnosis = () => {
    if (diagnosticResult?.next_question) {
      setCurrentQuestion(diagnosticResult.next_question);
      setActiveConceptId(diagnosticResult.next_question.concept_id);
    }
    setShowDiagnosticModal(false);
    setDiagnosticResult(null);
  };

  // Skip or load another question
  const handleSkipQuestion = async () => {
    try {
      const q = await apiGetQuestion(studentId);
      setCurrentQuestion(q);
      setActiveConceptId(q.concept_id);
    } catch (err) {
      console.error("Error skipping question:", err);
    }
  };

  // Select a concept from Mastery or Review to practice
  const handleSelectConceptToPractice = async (conceptId: string) => {
    setActiveTab("tutor");
    setActiveConceptId(conceptId);
    try {
      const q = await apiGetQuestion(studentId, conceptId);
      setCurrentQuestion(q);
    } catch (err) {
      console.error("Error loading question for concept:", err);
    }
  };

  const dueReviewsCount = reviews.filter((r) => r.due_in_days <= 0).length;
  const activeConcept = concepts.find((c) => c.id === activeConceptId);
  const rawMastery =
    activeConceptId && masteryData?.mastery
      ? masteryData.mastery[activeConceptId]
      : 0.5;
  const currentConceptMastery = toPercent(rawMastery);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 md:pb-12">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        studentId={studentId}
        onSelectStudent={setStudentId}
        dueReviewsCount={dueReviewsCount}
      />

      {/* Hero / Quick Status Banner */}
      <div className="bg-gradient-to-b from-indigo-950/40 via-slate-950 to-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Adaptive Java Tutor
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-xs text-slate-400 font-mono">
                  Real-time cognitive diagnosis
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeTab === "tutor" && "Diagnostic Practice Mode"}
                {activeTab === "mastery" && "Java Concept Mastery Graph"}
                {activeTab === "review" && "Spaced Memory Reviews"}
                {activeTab === "teacher" && "Classroom Diagnostic Analytics"}
              </h1>
            </div>

            {/* Quick stats badge */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center gap-2.5">
                <BrainIcon className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">
                    Active Learner
                  </span>
                  <span className="font-semibold text-slate-200">
                    {studentId}
                  </span>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center gap-2.5">
                <AwardIcon className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">
                    Active Concept
                  </span>
                  <span className="font-semibold text-slate-200">
                    {activeConcept?.name || "Java Fundamentals"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "tutor" && (
          <TutorView
            question={currentQuestion}
            concepts={concepts}
            studentId={studentId}
            isSubmitting={isSubmitting}
            onSubmitAnswer={handleSubmitAnswer}
            onSkipQuestion={handleSkipQuestion}
          />
        )}

        {activeTab === "mastery" && (
          <MasteryView
            masteryData={masteryData}
            concepts={concepts}
            onSelectConceptToPractice={handleSelectConceptToPractice}
          />
        )}

        {activeTab === "review" && (
          <ReviewView
            reviews={reviews}
            concepts={concepts}
            onStartReview={handleSelectConceptToPractice}
          />
        )}

        {activeTab === "teacher" && (
          <TeacherView teacherData={teacherData} conceptsList={concepts} />
        )}
      </main>

      {/* Diagnostic Misconception Modal */}
      {diagnosticResult && (
        <DiagnosticModal
          isOpen={showDiagnosticModal}
          correct={diagnosticResult.correct}
          misconception={diagnosticResult.misconception}
          conceptName={activeConcept?.name || "Java Concept"}
          conceptMastery={
            activeConceptId && diagnosticResult.mastery
              ? toPercent(diagnosticResult.mastery[activeConceptId])
              : currentConceptMastery
          }
          nextQuestion={diagnosticResult.next_question}
          onContinue={handleContinueAfterDiagnosis}
        />
      )}
    </div>
  );
}
