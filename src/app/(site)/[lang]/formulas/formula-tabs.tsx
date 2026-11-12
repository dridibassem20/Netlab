"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  dbmToMw,
  dbToRatio,
  fsplDb,
  linkBudget,
  mwToDbm,
  nyquistBitRate,
  powerAfterLoss,
  ratioToDb,
  shannonCapacity,
  snrDbToLinear,
  snrLinearToDb,
  attenuationLoss,
  transferSeconds,
} from "@/lib/telecom";
import { formatBps, formatDuration, formatHz, cn } from "@/lib/utils";
import { ResultRow } from "@/components/result-row";
import type { Dict } from "@/lib/i18n/dictionaries";

type FDict = Dict["formulas"];

/* ── small shared pieces ─────────────────────────────────────────── */

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0 flex-1">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-static">
        {label}
      </span>
      {children}
    </label>
  );
}

function NumInput({
  value,
  onChange,
  placeholder,
  step,
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: string;
  min?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      step={step}
      min={min}
      dir="ltr"
      inputMode="decimal"
      className="w-full rounded-field border border-line bg-panel px-3 py-2.5 font-mono text-sm text-ink placeholder:text-faint/60 focus:border-signal/60"
    />
  );
}

function UnitSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="shrink-0 rounded-field border border-line bg-panel px-2.5 py-2.5 font-mono text-xs text-static focus:border-signal/60"
      aria-label="Unit"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex max-w-full overflow-x-auto rounded-field border border-line bg-panel p-0.5 no-scrollbar"
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "shrink-0 rounded-[8px] px-3 py-1.5 font-mono text-xs transition-colors",
            value === o.value
              ? "bg-signal/15 text-signal"
              : "text-faint hover:text-static",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function FormulaBox({ children }: { children: ReactNode }) {
  return (
    <div
      dir="ltr"
      className="overflow-x-auto rounded-field border border-line bg-panel px-4 py-3 font-mono text-sm text-signal/90 no-scrollbar"
    >
      {children}
    </div>
  );
}

const EMPTY = "—";

function num(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Human-friendly display for ratios that can span 10^±12. */
function formatRatio(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return EMPTY;
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e6 || abs < 1e-4)) {
    return n.toExponential(4).replace("e+", " e");
  }
  return String(Number(n.toPrecision(6)));
}

/* ── 1. Decibels ─────────────────────────────────────────────────── */

function DecibelCalc({ t }: { t: FDict }) {
  const [dirA, setDirA] = useState("db2ratio");
  const [modeA, setModeA] = useState("power");
  const [dbA, setDbA] = useState("30");
  const [ratioA, setRatioA] = useState("1000");

  const [dirB, setDirB] = useState("dbm2mw");
  const [dbm, setDbm] = useState("20");
  const [mw, setMw] = useState("100");

  const m = modeA === "power" ? "power" : "amplitude";
  const ratioOut = dirA === "db2ratio" && num(dbA) !== null
    ? dbToRatio(num(dbA)!, m)
    : null;
  const dbOut = dirA === "ratio2db" && num(ratioA) !== null
    ? ratioToDb(num(ratioA)!, m)
    : null;

  const mwOut = dirB === "dbm2mw" && num(dbm) !== null ? dbmToMw(num(dbm)!) : null;
  const dbmOut = dirB === "mw2dbm" && num(mw) !== null ? mwToDbm(num(mw)!) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h3 className="font-display text-base font-semibold">
            {t.dbTitle} · dB ↔ ratio
          </h3>
          <div className="flex flex-wrap gap-2">
            <Toggle
              ariaLabel="Conversion direction"
              value={dirA}
              onChange={setDirA}
              options={[
                { value: "db2ratio", label: t.toggleDbToRatio },
                { value: "ratio2db", label: t.toggleRatioToDb },
              ]}
            />
            <Toggle
              ariaLabel="Ratio type"
              value={modeA}
              onChange={setModeA}
              options={[
                { value: "power", label: t.togglePower },
                { value: "amplitude", label: t.toggleAmplitude },
              ]}
            />
          </div>
        </div>
        <FormulaBox>
          {modeA === "power" ? "ratio = 10^(dB/10)" : "ratio = 10^(dB/20)"}
        </FormulaBox>
        <div className="mt-4">
          {dirA === "db2ratio" ? (
            <div className="flex gap-3">
              <Field label={t.fieldDb}>
                <NumInput value={dbA} onChange={setDbA} />
              </Field>
            </div>
          ) : (
            <div className="flex gap-3">
              <Field label={t.fieldLinearRatio}>
                <NumInput value={ratioA} onChange={setRatioA} min="0" />
              </Field>
            </div>
          )}
          <div className="mt-3 border-b border-line">
            <ResultRow
              label={dirA === "db2ratio" ? t.resultRatio : t.fieldDb}
              value={
                dirA === "db2ratio"
                  ? formatRatio(ratioOut)
                  : dbOut !== null
                    ? `${Number(dbOut.toFixed(2))} dB`
                    : EMPTY
              }
              tone="signal"
            />
          </div>
          {dirA === "ratio2db" && num(ratioA) !== null && num(ratioA)! <= 0 && (
            <p className="mt-2 font-mono text-xs text-fault">
              {t.ratioPositive}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h3 className="font-display text-base font-semibold">
            {t.dbmTitle}
          </h3>
          <Toggle
            ariaLabel="dBm conversion direction"
            value={dirB}
            onChange={setDirB}
            options={[
              { value: "dbm2mw", label: "dBm → mW" },
              { value: "mw2dbm", label: "mW → dBm" },
            ]}
          />
        </div>
        <FormulaBox>P(mW) = 10^(dBm/10) · ref = 1 mW</FormulaBox>
        <div className="mt-4">
          {dirB === "dbm2mw" ? (
            <Field label={t.fieldPowerDbm}>
              <NumInput value={dbm} onChange={setDbm} />
            </Field>
          ) : (
            <Field label={t.fieldPowerMw}>
              <NumInput value={mw} onChange={setMw} min="0" />
            </Field>
          )}
          <div className="mt-3 border-b border-line">
            <ResultRow
              label={dirB === "dbm2mw" ? "mW" : "dBm"}
              value={
                dirB === "dbm2mw"
                  ? formatRatio(mwOut)
                  : dbmOut !== null
                    ? `${Number(dbmOut.toFixed(2))} dBm`
                    : EMPTY
              }
              tone="signal"
            />
          </div>
          {dirB === "mw2dbm" && num(mw) !== null && num(mw)! <= 0 && (
            <p className="mt-2 font-mono text-xs text-fault">
              {t.powerPositive}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 2. Shannon ──────────────────────────────────────────────────── */

function ShannonCalc({ t }: { t: FDict }) {
  const [b, setB] = useState("20");
  const [bUnit, setBUnit] = useState("1e6"); // multiplier to Hz
  const [snr, setSnr] = useState("30");
  const [snrUnit, setSnrUnit] = useState("db");

  const bHz = num(b) !== null ? num(b)! * Number(bUnit) : null;
  const snrLinear =
    num(snr) === null
      ? null
      : snrUnit === "db"
        ? snrDbToLinear(num(snr)!)
        : num(snr)!;

  const capacity =
    bHz !== null && snrLinear !== null ? shannonCapacity(bHz, snrLinear) : null;

  return (
    <div className="flex flex-col gap-4">
      <FormulaBox>C = B · log₂(1 + SNR)</FormulaBox>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Field label={t.fieldBandwidth}>
          <div className="flex gap-2">
            <NumInput value={b} onChange={setB} min="0" />
            <UnitSelect
              value={bUnit}
              onChange={setBUnit}
              options={[
                { value: "1", label: "Hz" },
                { value: "1e3", label: "kHz" },
                { value: "1e6", label: "MHz" },
                { value: "1e9", label: "GHz" },
              ]}
            />
          </div>
        </Field>
        <Field label={t.fieldSnr}>
          <div className="flex gap-2">
            <NumInput value={snr} onChange={setSnr} min="0" />
            <UnitSelect
              value={snrUnit}
              onChange={setSnrUnit}
              options={[
                { value: "db", label: "dB" },
                { value: "linear", label: t.unitLinear },
              ]}
            />
          </div>
        </Field>
      </div>
      <div>
        <ResultRow
          label={t.resultCapacity}
          value={capacity !== null ? formatBps(capacity) : EMPTY}
          tone="signal"
        />
        <ResultRow
          label={t.resultBandwidth}
          value={bHz !== null ? formatHz(bHz) : EMPTY}
        />
      </div>
      <p className="font-mono text-[11px] leading-relaxed text-faint">
        {t.shannonNote}
      </p>
    </div>
  );
}

/* ── 3. SNR ──────────────────────────────────────────────────────── */

function SnrCalc({ t }: { t: FDict }) {
  const [mode, setMode] = useState("powers");
  const [signal, setSignal] = useState("-40");
  const [noise, setNoise] = useState("-90");
  const [val, setVal] = useState("100");
  const [dir, setDir] = useState("lin2db");

  const snrDb =
    mode === "powers" && num(signal) !== null && num(noise) !== null
      ? num(signal)! - num(noise)!
      : null;

  const converted =
    mode === "ratio" && num(val) !== null
      ? dir === "lin2db"
        ? snrLinearToDb(num(val)!)
        : snrDbToLinear(num(val)!)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h3 className="font-display text-base font-semibold">{t.snrTitle}</h3>
        <Toggle
          ariaLabel="SNR input mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "powers", label: t.snrFromPowers },
            { value: "ratio", label: t.snrRatioToggle },
          ]}
        />
      </div>

      <FormulaBox>
        SNR(dB) = 10·log₁₀(P_signal / P_noise) = P_signal(dBm) − P_noise(dBm)
      </FormulaBox>

      {mode === "powers" ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Field label={t.fieldSignalPower}>
              <NumInput value={signal} onChange={setSignal} />
            </Field>
            <Field label={t.fieldNoisePower}>
              <NumInput value={noise} onChange={setNoise} />
            </Field>
          </div>
          <ResultRow
            label={t.snrTitle}
            value={snrDb !== null ? `${Number(snrDb.toFixed(1))} dB` : EMPTY}
            tone="signal"
          />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="flex min-w-0 flex-1 gap-2">
              <Field label={dir === "lin2db" ? `${t.snrTitle} (${t.unitLinear})` : `${t.snrTitle} (dB)`}>
                <NumInput
                  value={val}
                  onChange={setVal}
                  min={dir === "lin2db" ? "0" : undefined}
                />
              </Field>
            </div>
            <Toggle
              ariaLabel="SNR direction"
              value={dir}
              onChange={setDir}
              options={[
                { value: "lin2db", label: `${t.unitLinear} → dB` },
                { value: "db2lin", label: `dB → ${t.unitLinear}` },
              ]}
            />
          </div>
          <ResultRow
            label={dir === "lin2db" ? `${t.snrTitle} (dB)` : `${t.snrTitle} (${t.unitLinear})`}
            value={
              converted === null
                ? EMPTY
                : dir === "lin2db"
                  ? `${Number(converted.toFixed(2))} dB`
                  : formatRatio(converted)
            }
            tone="signal"
          />
          {dir === "lin2db" && num(val) !== null && num(val)! <= 0 && (
            <p className="font-mono text-xs text-fault">
              {t.snrLinearPositive}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* ── 4. Free-space path loss ─────────────────────────────────────── */

function FsplCalc({ t }: { t: FDict }) {
  const [d, setD] = useState("1");
  const [dUnit, setDUnit] = useState("km");
  const [f, setF] = useState("2400");
  const [fUnit, setFUnit] = useState("MHz");

  const km = dUnit === "km" ? 1 : 0.001;
  const mhz = fUnit === "MHz" ? 1 : 1000;
  const loss =
    num(d) !== null && num(f) !== null
      ? fsplDb(num(d)! * km, num(f)! * mhz)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <FormulaBox>FSPL(dB) = 20log₁₀(d_km) + 20log₁₀(f_MHz) + 32.44</FormulaBox>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Field label={t.fieldDistance}>
          <div className="flex gap-2">
            <NumInput value={d} onChange={setD} min="0" />
            <UnitSelect
              value={dUnit}
              onChange={setDUnit}
              options={[
                { value: "km", label: "km" },
                { value: "m", label: "m" },
              ]}
            />
          </div>
        </Field>
        <Field label={t.fieldFrequency}>
          <div className="flex gap-2">
            <NumInput value={f} onChange={setF} min="0" />
            <UnitSelect
              value={fUnit}
              onChange={setFUnit}
              options={[
                { value: "MHz", label: "MHz" },
                { value: "GHz", label: "GHz" },
              ]}
            />
          </div>
        </Field>
      </div>
      <ResultRow
        label={t.resultFspl}
        value={loss !== null ? `${Number(loss.toFixed(2))} dB` : EMPTY}
        tone="signal"
      />
      <p className="font-mono text-[11px] leading-relaxed text-faint">
        {t.fsplNote}
      </p>
    </div>
  );
}

/* ── 5. Link budget ──────────────────────────────────────────────── */

function LinkBudgetCalc({ t }: { t: FDict }) {
  const [tx, setTx] = useState("20");
  const [gtx, setGtx] = useState("2");
  const [grx, setGrx] = useState("2");
  const [losses, setLosses] = useState("100");
  const [sens, setSens] = useState("-80");

  const r =
    num(tx) !== null &&
    num(gtx) !== null &&
    num(grx) !== null &&
    num(losses) !== null &&
    num(sens) !== null
      ? linkBudget(num(tx)!, num(gtx)!, num(grx)!, num(losses)!, num(sens)!)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <FormulaBox>
        P_rx = P_tx + G_tx + G_rx − L · margin = P_rx − Sensitivity
      </FormulaBox>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t.fieldTxPower}>
          <NumInput value={tx} onChange={setTx} />
        </Field>
        <Field label={t.fieldTxGain}>
          <NumInput value={gtx} onChange={setGtx} />
        </Field>
        <Field label={t.fieldRxGain}>
          <NumInput value={grx} onChange={setGrx} />
        </Field>
        <Field label={t.fieldLosses}>
          <NumInput value={losses} onChange={setLosses} min="0" />
        </Field>
        <Field label={t.fieldSensitivity}>
          <NumInput value={sens} onChange={setSens} />
        </Field>
      </div>
      <ResultRow
        label={t.resultReceived}
        value={
          r ? `${Number(r.receivedPowerDbm.toFixed(1))} dBm` : EMPTY
        }
      />
      <ResultRow
        label={t.resultMargin}
        value={r ? `${Number(r.marginDb.toFixed(1))} dB` : EMPTY}
        tone={r ? (r.marginDb >= 0 ? "ok" : "fault") : "default"}
      />
      <p className="font-mono text-[11px] leading-relaxed text-faint">
        {r
          ? r.marginDb >= 0
            ? t.budgetOk.replace("{n}", Number(r.marginDb.toFixed(1)).toString())
            : t.budgetFail.replace(
                "{n}",
                Number(Math.abs(r.marginDb).toFixed(1)).toString(),
              )
          : t.budgetEmpty}
      </p>
    </div>
  );
}

/* ── 6. Nyquist ──────────────────────────────────────────────────── */

function NyquistCalc({ t }: { t: FDict }) {
  const [b, setB] = useState("3100");
  const [bUnit, setBUnit] = useState("1");
  const [levels, setLevels] = useState("8");

  const bHz = num(b) !== null ? num(b)! * Number(bUnit) : null;
  const rate =
    bHz !== null && num(levels) !== null
      ? nyquistBitRate(bHz, num(levels)!)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <FormulaBox>C = 2 · B · log₂(M)</FormulaBox>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Field label={t.fieldBandwidth}>
          <div className="flex gap-2">
            <NumInput value={b} onChange={setB} min="0" />
            <UnitSelect
              value={bUnit}
              onChange={setBUnit}
              options={[
                { value: "1", label: "Hz" },
                { value: "1e3", label: "kHz" },
                { value: "1e6", label: "MHz" },
              ]}
            />
          </div>
        </Field>
        <Field label={t.fieldLevels}>
          <NumInput value={levels} onChange={setLevels} min="2" step="1" />
        </Field>
      </div>
      <ResultRow
        label={t.resultNyquist}
        value={rate !== null ? formatBps(rate) : EMPTY}
        tone="signal"
      />
      <p className="font-mono text-[11px] leading-relaxed text-faint">
        {t.nyquistNote}
      </p>
      {num(levels) !== null && num(levels)! < 2 && (
        <p className="font-mono text-xs text-fault">
          {t.nyquistMin}
        </p>
      )}
    </div>
  );
}

/* ── 7. Attenuation ──────────────────────────────────────────────── */

function AttenuationCalc({ t }: { t: FDict }) {
  const [rate, setRate] = useState("0.2");
  const [rateUnit, setRateUnit] = useState("km"); // dB per km or per 100 m
  const [length, setLength] = useState("10");
  const [lengthUnit, setLengthUnit] = useState("km");
  const [inputPower, setInputPower] = useState("0");

  // Normalize length to meters.
  const lengthM =
    num(length) !== null ? num(length)! * (lengthUnit === "km" ? 1000 : 1) : null;

  const loss =
    num(rate) !== null && lengthM !== null
      ? rateUnit === "km"
        ? attenuationLoss(num(rate)!, lengthM / 1000) // dB/km × km
        : attenuationLoss(num(rate)!, lengthM / 100) // dB/100m × (length/100 m)
      : null;

  const outputPower =
    loss !== null && num(inputPower) !== null
      ? powerAfterLoss(num(inputPower)!, loss)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <FormulaBox>L(dB) = α (dB/unit) × length</FormulaBox>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Field label={t.fieldRate}>
          <div className="flex gap-2">
            <NumInput value={rate} onChange={setRate} min="0" />
            <UnitSelect
              value={rateUnit}
              onChange={setRateUnit}
              options={[
                { value: "km", label: "dB/km" },
                { value: "m", label: "dB/100m" },
              ]}
            />
          </div>
        </Field>
        <Field label={t.fieldLength}>
          <div className="flex gap-2">
            <NumInput value={length} onChange={setLength} min="0" />
            <UnitSelect
              value={lengthUnit}
              onChange={setLengthUnit}
              options={[
                { value: "km", label: "km" },
                { value: "m", label: "m" },
              ]}
            />
          </div>
        </Field>
        <Field label={t.fieldInputPower}>
          <NumInput value={inputPower} onChange={setInputPower} />
        </Field>
      </div>
      <ResultRow
        label={t.resultLoss}
        value={loss !== null ? `${Number(loss.toFixed(2))} dB` : EMPTY}
        tone="signal"
      />
      <ResultRow
        label={t.resultOutputPower}
        value={
          outputPower !== null
            ? `${Number(outputPower.toFixed(1))} dBm`
            : EMPTY
        }
      />
      <p className="font-mono text-[11px] leading-relaxed text-faint">
        {t.attenNote}
      </p>
    </div>
  );
}

/* ── 8. Transfer time ────────────────────────────────────────────── */

function TransferCalc({ t }: { t: FDict }) {
  const [size, setSize] = useState("700");
  const [sizeUnit, setSizeUnit] = useState("1e6"); // bytes multiplier
  const [speed, setSpeed] = useState("100");
  const [speedUnit, setSpeedUnit] = useState("1e6"); // bps multiplier
  const [speedIsBytes, setSpeedIsBytes] = useState("bits");

  const bytes = num(size) !== null ? num(size)! * Number(sizeUnit) : null;
  const bps =
    num(speed) !== null
      ? num(speed)! *
        Number(speedUnit) *
        (speedIsBytes === "bytes" ? 8 : 1)
      : null;

  const seconds =
    bytes !== null && bps !== null ? transferSeconds(bytes, bps) : null;

  return (
    <div className="flex flex-col gap-4">
      <FormulaBox>t = file_size × 8 ÷ link_speed</FormulaBox>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Field label={t.fieldFileSize}>
          <div className="flex gap-2">
            <NumInput value={size} onChange={setSize} min="0" />
            <UnitSelect
              value={sizeUnit}
              onChange={setSizeUnit}
              options={[
                { value: "1e3", label: "KB" },
                { value: "1e6", label: "MB" },
                { value: "1e9", label: "GB" },
              ]}
            />
          </div>
        </Field>
        <Field label={t.fieldLinkSpeed}>
          <div className="flex flex-wrap gap-2">
            <NumInput value={speed} onChange={setSpeed} />
            <UnitSelect
              value={speedUnit}
              onChange={setSpeedUnit}
              options={[
                { value: "1e3", label: "kb/s" },
                { value: "1e6", label: "Mb/s" },
                { value: "1e9", label: "Gb/s" },
              ]}
            />
            <UnitSelect
              value={speedIsBytes}
              onChange={setSpeedIsBytes}
              options={[
                { value: "bits", label: "bits" },
                { value: "bytes", label: "B" },
              ]}
            />
          </div>
        </Field>
      </div>
      <ResultRow
        label={t.resultTransfer}
        value={seconds !== null ? formatDuration(seconds) : EMPTY}
        tone="signal"
      />
      <ResultRow
        label={t.fieldLinkSpeed}
        value={bps !== null ? formatBps(bps) : EMPTY}
      />
      <p className="font-mono text-[11px] leading-relaxed text-faint">
        {t.transferNote}
      </p>
    </div>
  );
}

/* ── tabs ────────────────────────────────────────────────────────── */

export function FormulaTabs({ t }: { t: FDict }) {
  const TABS = [
    { id: "db", label: t.dbTitle, glyph: "dB", node: <DecibelCalc t={t} /> },
    { id: "shannon", label: t.shannonTitle, glyph: "C", node: <ShannonCalc t={t} /> },
    { id: "snr", label: t.snrTitle, glyph: "S/N", node: <SnrCalc t={t} /> },
    { id: "fspl", label: t.fsplTitle, glyph: "FSPL", node: <FsplCalc t={t} /> },
    { id: "budget", label: t.budgetTitle, glyph: "P_rx", node: <LinkBudgetCalc t={t} /> },
    { id: "nyquist", label: t.nyquistTitle, glyph: "2B", node: <NyquistCalc t={t} /> },
    { id: "atten", label: t.attenTitle, glyph: "α", node: <AttenuationCalc t={t} /> },
    { id: "transfer", label: t.transferTitle, glyph: "t", node: <TransferCalc t={t} /> },
  ];

  const [active, setActive] = useState(TABS[0].id);
  const current = TABS.find((tab) => tab.id === active)!;

  return (
    <div>
      <div
        role="tablist"
        aria-label={t.tabsAria}
        className="flex gap-1 overflow-x-auto border-b border-line pb-px no-scrollbar"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "relative shrink-0 rounded-t-lg px-4 py-2.5 text-sm transition-colors",
              active === tab.id
                ? "text-signal"
                : "text-faint hover:text-static",
            )}
          >
            {tab.label}
            {active === tab.id && (
              <motion.span
                layoutId="formula-tab"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-signal"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={current.id}
          role="tabpanel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 rounded-card border border-line bg-rack p-4 sm:p-7"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="shrink-0 rounded-md border border-signal/30 bg-signal/10 px-2 py-1 font-mono text-[11px] text-signal">
              {current.glyph}
            </span>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              {current.label}
            </h2>
          </div>
          {current.node}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
