import { describe, expect, it } from "vitest";
import {
  attenuationLoss,
  dbToRatio,
  dbmToMw,
  fsplDb,
  linkBudget,
  mwToDbm,
  nyquistBitRate,
  powerAfterLoss,
  ratioToDb,
  shannonCapacity,
  snrDbToLinear,
  snrLinearToDb,
  transferSeconds,
} from "./telecom";
import { formatDuration } from "./utils";

describe("dB <-> ratio", () => {
  it("converts dB to power ratios", () => {
    expect(dbToRatio(0)).toBeCloseTo(1);
    expect(dbToRatio(10)).toBeCloseTo(10);
    expect(dbToRatio(30)).toBeCloseTo(1000);
    expect(dbToRatio(-3)).toBeCloseTo(10 ** -0.3);
  });

  it("supports amplitude mode (20·log)", () => {
    expect(dbToRatio(0, "amplitude")).toBeCloseTo(1);
    expect(dbToRatio(20, "amplitude")).toBeCloseTo(10);
    expect(dbToRatio(40, "amplitude")).toBeCloseTo(100);
  });

  it("converts ratios back to dB", () => {
    expect(ratioToDb(1000)).toBeCloseTo(30);
    expect(ratioToDb(0.01)).toBeCloseTo(-20);
    expect(ratioToDb(10, "amplitude")).toBeCloseTo(20);
  });

  it("rejects non-positive ratios", () => {
    expect(ratioToDb(0)).toBeNull();
    expect(ratioToDb(-5)).toBeNull();
  });
});

describe("dBm <-> mW", () => {
  it("converts", () => {
    expect(dbmToMw(0)).toBeCloseTo(1);
    expect(dbmToMw(30)).toBeCloseTo(1000);
    expect(dbmToMw(20)).toBeCloseTo(100);
    expect(mwToDbm(1)).toBeCloseTo(0);
    expect(mwToDbm(100)).toBeCloseTo(20);
    expect(mwToDbm(0.001)).toBeCloseTo(-30);
  });

  it("rejects mW <= 0", () => {
    expect(mwToDbm(0)).toBeNull();
    expect(mwToDbm(-3)).toBeNull();
  });
});

describe("Shannon capacity", () => {
  it("computes C = B·log2(1+SNR)", () => {
    // B=3000 Hz, SNR=30 dB (1000 linear) → ~29 901 b/s (classic textbook value)
    const c = shannonCapacity(3000, snrDbToLinear(30));
    expect(c).toBeCloseTo(29_901.7, 1);
  });

  it("zero SNR means zero capacity", () => {
    expect(shannonCapacity(1_000_000, 0)).toBe(0);
  });

  it("scales linearly with bandwidth", () => {
    expect(shannonCapacity(4_000_000, 1000)).toBeCloseTo(
      2 * shannonCapacity(2_000_000, 1000),
    );
  });
});

describe("SNR conversions", () => {
  it("dB ↔ linear", () => {
    expect(snrLinearToDb(1000)).toBeCloseTo(30);
    expect(snrLinearToDb(1)).toBeCloseTo(0);
    expect(snrDbToLinear(20)).toBeCloseTo(100);
    expect(snrLinearToDb(0)).toBeNull();
    expect(snrLinearToDb(-1)).toBeNull();
  });
});

describe("free-space path loss", () => {
  it("matches the classic 2.4 GHz / 1 km reference (~100 dB)", () => {
    const loss = fsplDb(1, 2400);
    expect(loss).not.toBeNull();
    // 32.44 + 20log10(1) + 20log10(2400) ≈ 32.44 + 0 + 67.6 ≈ 100.05
    expect(loss!).toBeCloseTo(100.05, 1);
  });

  it("6 dB more for each doubling of distance", () => {
    expect(fsplDb(2, 2400)! - fsplDb(1, 2400)!).toBeCloseTo(6.02, 2);
    expect(fsplDb(1, 4800)! - fsplDb(1, 2400)!).toBeCloseTo(6.02, 2);
  });

  it("rejects zero/negative inputs", () => {
    expect(fsplDb(0, 2400)).toBeNull();
    expect(fsplDb(1, 0)).toBeNull();
    expect(fsplDb(-1, 2400)).toBeNull();
  });
});

describe("link budget", () => {
  it("computes received power and margin", () => {
    // Ptx 20 dBm + 2 dBi + 2 dBi − 100 dB loss = −76 dBm at the receiver.
    const r = linkBudget(20, 2, 2, 100, -80);
    expect(r.receivedPowerDbm).toBeCloseTo(-76);
    expect(r.marginDb).toBeCloseTo(4);
  });

  it("negative margin means the link does not close", () => {
    const r = linkBudget(10, 0, 0, 90, -70);
    expect(r.receivedPowerDbm).toBeCloseTo(-80);
    expect(r.marginDb).toBeCloseTo(-10);
  });
});

describe("Nyquist bit rate", () => {
  it("computes C = 2·B·log2(M)", () => {
    // 3000 Hz, 2 levels → 6000 b/s (textbook value)
    expect(nyquistBitRate(3000, 2)).toBe(6000);
    // 3100 Hz, 8 levels → 18 600 b/s
    expect(nyquistBitRate(3100, 8)).toBeCloseTo(18_600);
  });

  it("rejects fewer than 2 levels", () => {
    expect(nyquistBitRate(3000, 1)).toBeNull();
    expect(nyquistBitRate(3000, 0)).toBeNull();
  });
});

describe("attenuation", () => {
  it("multiplies rate by length", () => {
    expect(attenuationLoss(0.2, 10)).toBeCloseTo(2); // fiber, dB/km × km
    expect(attenuationLoss(0.2, 0)).toBe(0);
    expect(attenuationLoss(-1, 5)).toBeNull();
  });

  it("applies loss to a power level", () => {
    expect(powerAfterLoss(0, 2)).toBeCloseTo(-2);
    expect(powerAfterLoss(10, 20)).toBeCloseTo(-10);
  });
});

describe("transfer time", () => {
  it("computes seconds from bytes and bps", () => {
    // 1 MB (1e6 bytes) over 8 Mbps (8e6 b/s) = 1 s
    expect(transferSeconds(1_000_000, 8_000_000)).toBeCloseTo(1);
    // 1 GiB over 100 Mbps ≈ 85.9 s
    expect(transferSeconds(1024 ** 3, 100e6)).toBeCloseTo(85.899, 2);
  });

  it("rejects zero/negative speed", () => {
    expect(transferSeconds(100, 0)).toBeNull();
    expect(transferSeconds(-1, 100)).toBeNull();
  });
});

describe("formatDuration", () => {
  it("renders human-readable durations", () => {
    expect(formatDuration(0.5)).toBe("500 ms");
    expect(formatDuration(30)).toBe("30 s");
    expect(formatDuration(154)).toBe("2 min 34 s");
    expect(formatDuration(5400)).toBe("1 h 30 min");
  });
});
