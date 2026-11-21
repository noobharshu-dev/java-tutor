"use client";

import React, { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { CopyIcon, CheckIcon } from "./icons";

interface ShikiCodeProps {
  code: string;
  lang?: string;
  title?: string;
}

export function ShikiCode({
  code,
  lang = "java",
  title = "Snippet.java",
}: ShikiCodeProps) {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function highlight() {
      try {
        const highlighted = await codeToHtml(code.trim(), {
          lang,
          theme: "one-dark-pro",
        });
        if (isMounted) {
          setHtml(highlighted);
        }
      } catch (err) {
        console.warn("Shiki highlighting fallback:", err);
      }
    }

    void highlight();

    return () => {
      isMounted = false;
    };
  }, [code, lang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-4 rounded-xl border border-[#2E2A27] bg-[#1C1917] shadow-sm overflow-hidden text-sm">
      {/* Sleek Subtle Top Bar */}
      <div className="bg-[#26221F] px-4 py-2 border-b border-[#34302C] flex items-center justify-between">
        <span className="font-mono text-xs text-[#A8A29E] tracking-tight">
          {title}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono text-[#D6D3D1] hover:text-white transition-colors cursor-pointer"
          aria-label={copied ? "Copied code" : "Copy code"}
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5 text-[#0F766E]" />
              <span className="text-[#0F766E]">Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-3.5 h-3.5 text-[#A8A29E]" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-[#F5F2EB] font-mono text-xs sm:text-[13px] leading-relaxed [&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:!p-0 [&>pre]:font-mono [&_code]:font-mono">
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="text-[#D6D3D1]">
            <code>{code.trim()}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
