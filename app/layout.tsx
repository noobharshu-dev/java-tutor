import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plumb · Know where you stand",
  description:
    "An adaptive exam-prep tutor with a learner model. The student's knowledge is a topographic map where elevation reflects mastery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Script
          src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
