"use client";

import React, { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { CopyIcon, CheckIcon, CodeIcon } from "./icons";

interface ShikiCodeProps {
  code: string;
  lang?: string;
  title?: string;
}

export function ShikiCode({ code, lang = "java", title = "Java Code Snippet" }: ShikiCodeProps) {
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
    <div className="my-4 rounded-2xl border border-slate-800 bg-[#1e222b] shadow-xl overflow-hidden text-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <CodeIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">
            {title}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 min-h-[32px]"
          aria-label={copied ? "Copied code" : "Copy code"}
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="p-4 overflow-x-auto text-slate-100 font-mono text-xs sm:text-sm leading-relaxed [&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:!p-0 [&>pre]:font-mono [&_code]:font-mono">
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="text-slate-300">
            <code>{code.trim()}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
