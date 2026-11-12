"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Scissors } from "lucide-react";
import {
  computeSubnet,
  parseIp,
  parsePrefixOrMask,
  splitSubnets,
  type SplitResult,
  type SubnetResult,
} from "@/lib/subnet";
import { formatInt } from "@/lib/utils";
import { ResultRow } from "@/components/result-row";
import { BinaryView } from "@/components/binary-view";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";

const MAX_VISIBLE_SUBNETS = 256;

type SubnetDict = Dict["subnet"];

export function SubnetCalculator({
  t,
  lang,
}: {
  t: SubnetDict;
  lang: Lang;
}) {
  const [ip, setIp] = useState("192.168.10.37");
  const [mask, setMask] = useState("27");
  const reduce = useReducedMotion();

  const result: SubnetResult = useMemo(
    () => computeSubnet(ip, mask),
    [ip, mask],
  );

  const hasInput = ip.trim() !== "" || mask.trim() !== "";
  const error = result.ok ? null : result.error;
  const ipInvalid = ip.trim() !== "" && parseIp(ip) === null;
  const maskInvalid =
    mask.trim() !== "" && "error" in parsePrefixOrMask(mask);

  const copyAria = (label: string) => t.copyValue.replace("{label}", label);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* input console */}
      <form
        className="rounded-card border border-line bg-rack p-4 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-static">
              {t.ipAddress}
            </span>
            <input
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.10.37"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              dir="ltr"
              className={cn(
                "w-full rounded-field border bg-panel px-3.5 py-2.5 font-mono text-base text-ink placeholder:text-faint/60 sm:text-sm",
                ipInvalid ? "border-fault/60" : "border-line focus:border-signal/60",
              )}
            />
          </label>

          <span
            className="hidden pb-3 font-mono text-faint sm:block"
            aria-hidden="true"
          >
            /
          </span>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-static">
              {t.prefixOrMask}
            </span>
            <input
              value={mask}
              onChange={(e) => setMask(e.target.value)}
              placeholder="27 or 255.255.255.224"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              dir="ltr"
              className={cn(
                "w-full rounded-field border bg-panel px-3.5 py-2.5 font-mono text-base text-ink placeholder:text-faint/60 sm:text-sm",
                maskInvalid
                  ? "border-fault/60"
                  : "border-line focus:border-signal/60",
              )}
            />
          </label>
        </div>

        <p
          className={cn(
            "mt-3 min-h-[18px] font-mono text-xs",
            error && hasInput ? "text-fault" : "text-faint",
          )}
          role={error ? "alert" : undefined}
        >
          {error && hasInput ? error : t.liveHint}
        </p>
      </form>

      {/* results */}
      <AnimatePresence mode="wait">
        {result.ok ? (
          <motion.section
            key={`${result.data.ip}/${result.data.prefix}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-card border border-line bg-rack"
            aria-live="polite"
          >
            <div className="overflow-x-auto border-b border-line p-4 sm:p-6">
              <BinaryView
                binary={result.data.binary}
                prefixBits={result.data.prefixBits}
                t={{
                  bitsNetwork: t.bitsNetwork,
                  bitsHost: t.bitsHost,
                  binaryAria: t.binaryAria,
                }}
              />
            </div>
            <div className="grid p-4 sm:grid-cols-2 sm:p-6">
              <div>
                <ResultRow
                  label={t.network}
                  value={result.data.networkAddress}
                  tone="signal"
                  copyable
                  copyAria={copyAria(t.network)}
                />
                <ResultRow
                  label={t.broadcast}
                  value={result.data.broadcastAddress}
                  copyable
                  copyAria={copyAria(t.broadcast)}
                />
                <ResultRow
                  label={t.firstHost}
                  value={result.data.firstHost}
                  copyable
                  copyAria={copyAria(t.firstHost)}
                />
                <ResultRow
                  label={t.lastHost}
                  value={result.data.lastHost}
                  copyable
                  copyAria={copyAria(t.lastHost)}
                />
              </div>
              <div>
                <ResultRow
                  label={t.mask}
                  value={`${result.data.subnetMask}  /${result.data.prefix}`}
                  copyable
                  copyAria={copyAria(t.mask)}
                />
                <ResultRow
                  label={t.wildcard}
                  value={result.data.wildcardMask}
                  copyable
                  copyAria={copyAria(t.wildcard)}
                />
                <ResultRow
                  label={t.usableHosts}
                  value={formatInt(result.data.usableHosts, lang)}
                  tone="ok"
                />
                <ResultRow
                  label={t.totalAddresses}
                  value={formatInt(result.data.totalAddresses, lang)}
                />
              </div>
            </div>
            <div className="border-t border-line px-4 py-3 sm:px-6">
              <ResultRow
                label={t.ipClass}
                value={
                  `${result.data.ipClass}` +
                  (result.data.ipScopeNote ? ` · ${result.data.ipScopeNote}` : "")
                }
              />
            </div>
          </motion.section>
        ) : (
          hasInput && (
            <motion.p
              key="error-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-card border border-fault/30 bg-fault/5 p-4 text-sm text-fault sm:p-5"
            >
              {error}
            </motion.p>
          )
        )}
      </AnimatePresence>

      {/* VLSM-lite splitter */}
      {result.ok && (
        <SubnetSplitter
          ip={result.data.networkAddress}
          prefix={result.data.prefix}
          reduce={reduce}
          t={t}
          lang={lang}
        />
      )}
    </div>
  );
}

function SubnetSplitter({
  ip,
  prefix,
  reduce,
  t,
  lang,
}: {
  ip: string;
  prefix: number;
  reduce: boolean | null;
  t: SubnetDict;
  lang: Lang;
}) {
  const [countInput, setCountInput] = useState("4");
  const [split, setSplit] = useState<SplitResult | null>(null);
  const [attempted, setAttempted] = useState(false);

  const run = () => {
    setAttempted(true);
    const n = Number(countInput);
    setSplit(splitSubnets(ip, prefix, n));
  };

  const error =
    attempted && split && !split.ok ? split.error : null;

  return (
    <section className="rounded-card border border-line bg-rack p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {t.splitTitle}
          </h2>
          <p className="mt-1 text-sm text-static">
            {t.splitIntro}
            <span className="whitespace-nowrap font-mono text-signal">
              {ip}/{prefix}
            </span>
            {t.splitIntroEnd}
          </p>
        </div>
        <div className="flex items-end gap-2">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-static">
              {t.splitN}
            </span>
            <input
              type="number"
              min={1}
              max={1024}
              value={countInput}
              onChange={(e) => {
                setCountInput(e.target.value);
                setAttempted(false);
              }}
              className="w-28 rounded-field border border-line bg-panel px-3.5 py-2.5 font-mono text-sm text-ink focus:border-signal/60"
            />
          </label>
          <button
            onClick={run}
            className="flex items-center gap-2 rounded-field bg-signal/15 px-4 py-2.5 font-mono text-sm text-signal transition-colors hover:bg-signal/25"
          >
            <Scissors size={14} />
            {t.splitBtn}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-field border border-fault/30 bg-fault/5 px-3.5 py-2.5 font-mono text-xs text-fault" role="alert">
          {error}
        </p>
      )}

      <AnimatePresence>
        {split && split.ok && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5"
          >
            <p className="font-mono text-xs text-faint">
              /{prefix} →{" "}
              <span className="text-signal">/{split.newPrefix}</span> ·{" "}
              {split.k}
              {t.splitSummary}
              {formatInt(split.possible, lang)}
              {t.splitPossible}
              {split.possible !== split.subnets.length
                ? `${t.splitShowing}${split.subnets.length}${t.splitShowingEnd}`
                : ""}
            </p>

            <div className="mt-3 max-h-[420px] overflow-auto rounded-field border border-line">
              <table className="w-full min-w-[540px] border-collapse text-sm">
                <thead className="sticky top-0 bg-rack-hi">
                  <tr className="text-left font-mono text-[11px] uppercase tracking-wider text-static">
                    <th className="px-3.5 py-2.5 font-medium">{t.colNetwork}</th>
                    <th className="px-3.5 py-2.5 font-medium">{t.colRange}</th>
                    <th className="hidden px-3.5 py-2.5 font-medium sm:table-cell">
                      {t.colBroadcast}
                    </th>
                    <th className="px-3.5 py-2.5 text-right font-medium">
                      {t.colHosts}
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs sm:text-[13px]">
                  {split.subnets.slice(0, MAX_VISIBLE_SUBNETS).map((s, i) => (
                    <tr
                      key={i}
                      className="border-t border-line text-ink odd:bg-panel/40"
                    >
                      <td className="px-3.5 py-2 text-signal">{s.network}</td>
                      <td className="px-3.5 py-2 text-static">
                        {s.firstHost} – {s.lastHost}
                      </td>
                      <td className="hidden px-3.5 py-2 text-static sm:table-cell">
                        {s.broadcast}
                      </td>
                      <td className="px-3.5 py-2 text-right text-ok">
                        {formatInt(s.usableHosts, lang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {split.subnets.length > MAX_VISIBLE_SUBNETS && (
              <p className="mt-2 font-mono text-[11px] text-faint">
                {t.splitCap.replace("{n}", String(MAX_VISIBLE_SUBNETS))}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
