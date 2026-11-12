"use client";

import { isValidElement, useState, type HTMLAttributes, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

/** GFM `pre` replacement: language label + copy button + CLI-friendly styling. */
export function CodeBlock({ children, ...rest }: HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);

  const child = Array.isArray(children)
    ? children.find(isValidElement)
    : isValidElement(children)
      ? children
      : undefined;

  const className =
    child && "props" in child
      ? ((child.props as { className?: string }).className ?? "")
      : "";
  const language = /language-(\w+)/.exec(className)?.[1] ?? "text";
  const raw = extractText(children).replace(/\n$/, "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="group/code my-5 overflow-hidden rounded-card border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line bg-rack/60 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
          {language === "text" ? "code" : language}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md p-1 font-mono text-[11px] text-faint transition-colors hover:text-signal"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-ok" /> copied
            </>
          ) : (
            <>
              <Copy size={12} /> copy
            </>
          )}
        </button>
      </div>
      <pre
        {...rest}
        className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-ink"
      >
        {children}
      </pre>
    </div>
  );
}
