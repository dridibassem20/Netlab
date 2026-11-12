/** Joins class names, skipping falsy values — tiny stand-in for clsx. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(iso: string, lang: "fr" | "en" = "en") {
  const d = new Date(iso);
  if (lang === "fr") {
    const months = [
      "janv.", "févr.", "mars", "avr.", "mai", "juin",
      "juil.", "août", "sept.", "oct.", "nov.", "déc.",
    ];
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Formats a bits-per-second value with an automatic unit (bps → Gbps). */
export function formatBps(bitsPerSecond: number): string {
  if (!isFinite(bitsPerSecond)) return "—";
  const units = ["bps", "kbps", "Mbps", "Gbps", "Tbps"] as const;
  let v = bitsPerSecond;
  let i = 0;
  while (v >= 1000 && i < units.length - 1) {
    v /= 1000;
    i++;
  }
  const digits = v >= 100 ? 1 : v >= 10 ? 2 : 3;
  return `${trimNum(v.toFixed(digits))} ${units[i]}`;
}

/** Formats a hertz value with an automatic unit (Hz → GHz). */
export function formatHz(hz: number): string {
  if (!isFinite(hz)) return "—";
  const units = ["Hz", "kHz", "MHz", "GHz", "THz"] as const;
  let v = hz;
  let i = 0;
  while (v >= 1000 && i < units.length - 1) {
    v /= 1000;
    i++;
  }
  const digits = v >= 100 ? 1 : v >= 10 ? 2 : 3;
  return `${trimNum(v.toFixed(digits))} ${units[i]}`;
}

/** Formats a seconds value as a human duration (e.g. "2 min 34 s"). */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)} ms`;
  if (seconds < 90) return `${trimNum(seconds.toFixed(1))} s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 90) return `${m} min ${s} s`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h} h ${rem} min`;
}

function trimNum(s: string) {
  return s.replace(/\.?0+$/, "");
}

/** Locale-aware integer formatting ("1,048" EN / "1 048" FR). */
export function formatInt(n: number, lang: "fr" | "en" = "en") {
  if (!isFinite(n)) return "—";
  return n.toLocaleString(lang === "fr" ? "fr-FR" : "en-US");
}
