import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JavaTutor — Intelligent Java Learning & Misconception Diagnosis",
  description:
    "Adaptive Java tutoring system detecting subtle misconceptions and tracking concept mastery with real-time feedback.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
