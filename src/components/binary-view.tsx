"use client";

import { cn } from "@/lib/utils";

interface BinaryViewStrings {
  bitsNetwork: string;
  bitsHost: string;
  binaryAria: string;
}

/**
 * Dotted-binary IP view. Bits before `prefixBits` are the network part
 * (cyan), the rest are host bits (muted). The three dot separators are
 * rendered faintly.
 */
export function BinaryView({
  binary,
  prefixBits,
  t,
}: {
  binary: string;
  prefixBits: number;
  t: BinaryViewStrings;
}) {
  let bitIndex = 0;

  return (
    <div>
      <div
        dir="ltr"
        className="flex flex-wrap font-mono text-[13px] leading-7 sm:text-sm"
        aria-label={t.binaryAria
          .replace("{ip}", binary)
          .replace("{n}", String(prefixBits))}
      >
        {binary.split("").map((ch, i) => {
          if (ch === ".") {
            return (
              <span key={i} className="px-1 text-faint/60" aria-hidden="true">
                .
              </span>
            );
          }
          const isNetwork = bitIndex < prefixBits;
          bitIndex++;
          return (
            <span
              key={i}
              className={cn(
                "tabular-nums transition-colors",
                isNetwork
                  ? "font-semibold text-signal"
                  : "text-faint",
              )}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-faint">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-[2px] bg-signal" />
          {t.bitsNetwork.replace("{n}", String(prefixBits))}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-[2px] bg-faint/50" />
          {t.bitsHost.replace("{n}", String(32 - prefixBits))}
        </span>
      </div>
    </div>
  );
}
