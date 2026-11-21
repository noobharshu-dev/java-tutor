"use client";

import React, { useState } from "react";
import { CopyIcon, CheckIcon, CodeIcon } from "./icons";

interface CodeSnippetProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeSnippet({
  code,
  language = "Java",
  title,
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const lines = code.trim().split("\n");

  const highlightJavaSyntax = (line: string) => {
    // Basic syntax highlighting for Java keywords
    const keywords = [
      "public",
      "private",
      "protected",
      "class",
      "interface",
      "static",
      "final",
      "void",
      "int",
      "double",
      "float",
      "boolean",
      "char",
      "byte",
      "short",
      "long",
      "String",
      "new",
      "if",
      "else",
      "for",
      "while",
      "return",
      "null",
      "true",
      "false",
      "extends",
      "implements",
      "super",
      "this",
      "try",
      "catch",
      "throw",
      "throws",
      "@Override",
    ];

    // Escape HTML tokens
    const tokens = line.split(/(\s+|[(){}[\];,.<>=!+*/-])/);

    return tokens.map((token, i) => {
      // Comments
      if (token.startsWith("//")) {
        return (
          <span key={i} className="text-slate-500 italic">
            {token}
          </span>
        );
      }
      // String literals
      if (token.startsWith('"') || token.endsWith('"')) {
        return (
          <span key={i} className="text-emerald-400 font-medium">
            {token}
          </span>
        );
      }
      // System or standard classes
      if (token === "System" || token === "out" || token === "println" || token === "print") {
        return (
          <span key={i} className="text-indigo-300 font-semibold">
            {token}
          </span>
        );
      }
      // Keywords
      if (keywords.includes(token)) {
        return (
          <span key={i} className="text-rose-400 font-semibold">
            {token}
          </span>
        );
      }
      // Numeric literals
      if (/^\d+(\.\d+)?$/.test(token)) {
        return (
          <span key={i} className="text-amber-300">
            {token}
          </span>
        );
      }
      return <span key={i}>{token}</span>;
    });
  };

  return (
    <div className="my-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden text-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <CodeIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">
            {title || `${language} Code`}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
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

      <div className="overflow-x-auto p-4 font-mono leading-relaxed text-slate-200">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((lineText, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="w-10 pr-4 select-none text-right text-xs text-slate-600 font-mono align-top">
                  {idx + 1}
                </td>
                <td className="whitespace-pre align-top">
                  {highlightJavaSyntax(lineText)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
