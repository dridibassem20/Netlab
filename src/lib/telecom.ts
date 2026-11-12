/**
 * Pure telecom formula functions — every function has a documented unit
 * convention and is unit-tested. Null (or an explicit error variant) is
 * returned for inputs that are mathematically undefined.
 */

/** dB → linear power ratio (or amplitude ratio with mode = "amplitude", 20·log). */
export function dbToRatio(
  db: number,
  mode: "power" | "amplitude" = "power",
): number {
  return mode === "power" ? 10 ** (db / 10) : 10 ** (db / 20);
}

/** Linear ratio → dB. Ratio must be positive; returns null otherwise. */
export function ratioToDb(
  ratio: number,
  mode: "power" | "amplitude" = "power",
): number | null {
  if (ratio <= 0) return null;
  return mode === "power" ? 10 * Math.log10(ratio) : 20 * Math.log10(ratio);
}

/** dBm → milliwatts (P_mW = 10^(dBm/10), referenced to 1 mW). */
export function dbmToMw(dbm: number): number {
  return 10 ** (dbm / 10);
}

/** Milliwatts → dBm; null for mW ≤ 0 (log undefined). */
export function mwToDbm(mw: number): number | null {
  if (mw <= 0) return null;
  return 10 * Math.log10(mw);
}

/** Shannon–Hartley: C = B·log₂(1+SNR), B in Hz, SNR linear, C in bits/s. */
export function shannonCapacity(bandwidthHz: number, snrLinear: number): number {
  return bandwidthHz * Math.log2(1 + snrLinear);
}

/** SNR dB → linear power ratio (10^(dB/10)). */
export function snrDbToLinear(snrDb: number): number {
  return 10 ** (snrDb / 10);
}

/** Linear SNR → dB; null for SNR ≤ 0. */
export function snrLinearToDb(snrLinear: number): number | null {
  if (snrLinear <= 0) return null;
  return 10 * Math.log10(snrLinear);
}

/**
 * Free-space path loss (Friis): FSPL(dB) = 20log₁₀(d_km) + 20log₁₀(f_MHz) + 32.44.
 * Returns null when distance or frequency is not strictly positive.
 */
export function fsplDb(distanceKm: number, freqMhz: number): number | null {
  if (distanceKm <= 0 || freqMhz <= 0) return null;
  return (
    20 * Math.log10(distanceKm) + 20 * Math.log10(freqMhz) + 32.44
  );
}

export interface LinkBudgetResult {
  /** Power arriving at the receiver: Ptx + Gtx + Grx − losses. */
  receivedPowerDbm: number;
  /** receivedPowerDbm − sensitivity; positive = link closes with headroom. */
  marginDb: number;
}

/**
 * Link budget. Units: dBm for powers, dBi for gains, dB for losses.
 * margin = Ptx + Gtx + Grx − Losses − Sensitivity.
 */
export function linkBudget(
  txPowerDbm: number,
  txGainDb: number,
  rxGainDb: number,
  totalLossDb: number,
  rxSensitivityDbm: number,
): LinkBudgetResult {
  const receivedPowerDbm =
    txPowerDbm + txGainDb + rxGainDb - totalLossDb;
  return {
    receivedPowerDbm,
    marginDb: receivedPowerDbm - rxSensitivityDbm,
  };
}

/** Nyquist: C = 2·B·log₂(M), B in Hz, M distinct symbol levels ≥ 2. Null if invalid. */
export function nyquistBitRate(
  bandwidthHz: number,
  levels: number,
): number | null {
  if (!Number.isFinite(levels) || levels < 2) return null;
  return 2 * bandwidthHz * Math.log2(levels);
}

/**
 * Attenuation: total loss (dB) = rate (dB per unit length) × length.
 * Returns null for negative inputs.
 */
export function attenuationLoss(
  dbPerUnit: number,
  lengthUnits: number,
): number | null {
  if (dbPerUnit < 0 || lengthUnits < 0) return null;
  return dbPerUnit * lengthUnits;
}

/** Power after loss: Pout = Pin − loss (dB). */
export function powerAfterLoss(inputPowerDbm: number, lossDb: number): number {
  return inputPowerDbm - lossDb;
}

/** Transfer time (seconds) = fileBytes × 8 / speedBps. Null for speed ≤ 0. */
export function transferSeconds(
  fileBytes: number,
  speedBps: number,
): number | null {
  if (fileBytes < 0 || speedBps <= 0) return null;
  return (fileBytes * 8) / speedBps;
}
