import {
  computeSubnet,
  prefixToMask,
  formatIp,
} from "@/lib/subnet";
import type { Lang } from "@/lib/i18n/config";

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** Bookkeeping for tests/grading — not shown to the user. */
  meta: { kind: SubnetKind; ip: string; prefix: number };
}

export type SubnetKind =
  | "broadcast"
  | "network"
  | "firstHost"
  | "lastHost"
  | "usableHosts"
  | "wildcard";

type Rng = () => number;

/** Mulberry32 — small deterministic PRNG so tests are reproducible. */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: Rng, min: number, max: number) {
  return min + Math.floor(rng() * (max - min + 1));
}

function randomPrivateIp(rng: Rng): string {
  const pool = randInt(rng, 0, 2);
  if (pool === 0) return `10.${randInt(rng, 0, 255)}.${randInt(rng, 0, 255)}.${randInt(rng, 1, 254)}`;
  if (pool === 1) {
    return `172.${randInt(rng, 16, 31)}.${randInt(rng, 0, 255)}.${randInt(rng, 1, 254)}`;
  }
  return `192.168.${randInt(rng, 0, 255)}.${randInt(rng, 1, 254)}`;
}

const COMMON_PREFIXES = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30] as const;

function buildQuestion(
  kind: SubnetKind,
  ip: string,
  prefix: number,
  rng: Rng,
  lang: Lang = "en",
): GeneratedQuestion {
  const result = computeSubnet(ip, String(prefix));
  if (!result.ok) throw new Error("generator produced invalid subnet");
  const info = result.data;

  const numberFmt = lang === "fr" ? "fr-FR" : "en-US";
  const fmt = (n: number) => n.toLocaleString(numberFmt);

  const stems: Record<SubnetKind, Record<Lang, string>> = {
    broadcast: {
      en: `What is the broadcast address of ${ip}/${prefix}?`,
      fr: `Quelle est l'adresse de broadcast de ${ip}/${prefix} ?`,
    },
    network: {
      en: `What is the network address of ${ip}/${prefix}?`,
      fr: `Quelle est l'adresse réseau de ${ip}/${prefix} ?`,
    },
    firstHost: {
      en: `What is the first usable host address of ${ip}/${prefix}?`,
      fr: `Quelle est la première adresse utilisable de ${ip}/${prefix} ?`,
    },
    lastHost: {
      en: `What is the last usable host address of ${ip}/${prefix}?`,
      fr: `Quelle est la dernière adresse utilisable de ${ip}/${prefix} ?`,
    },
    usableHosts: {
      en: `How many usable host addresses does /${prefix} provide?`,
      fr: `Combien d'adresses utilisables fournit un /${prefix} ?`,
    },
    wildcard: {
      en: `What is the wildcard mask of ${ip}/${prefix}?`,
      fr: `Quel est le masque wildcard de ${ip}/${prefix} ?`,
    },
  };

  const correct: Record<SubnetKind, string> = {
    broadcast: info.broadcastAddress,
    network: info.networkAddress,
    firstHost: info.firstHost,
    lastHost: info.lastHost,
    usableHosts: fmt(info.usableHosts),
    wildcard: info.wildcardMask,
  };

  const hostBits = 32 - prefix;
  const blockSize = 2 ** hostBits;
  const netInt = ipToInt(info.networkAddress);
  const bcastInt = ipToInt(info.broadcastAddress);

  const distractors: Record<SubnetKind, string[]> = {
    // Off-by-one, the subnet itself, and the broadcast of the NEXT subnet.
    broadcast: [
      info.networkAddress,
      formatIp((bcastInt + 1) >>> 0),
      formatIp((bcastInt + blockSize) >>> 0),
    ],
    network: [
      info.broadcastAddress,
      formatIp((netInt + 1) >>> 0),
      formatIp((netInt - 1) >>> 0),
    ],
    firstHost: [
      info.networkAddress,
      formatIp((ipToInt(info.firstHost) + 1) >>> 0),
      info.lastHost,
    ],
    lastHost: [
      info.broadcastAddress,
      formatIp((ipToInt(info.lastHost) - 1) >>> 0),
      info.firstHost,
    ],
    usableHosts: [
      fmt(info.usableHosts + 2),
      fmt(Math.max(0, info.usableHosts - 1)),
      fmt(info.usableHosts + 1),
    ],
    wildcard: [
      info.subnetMask,
      prefixToMask(Math.max(0, prefix - 1)),
      info.broadcastAddress,
    ],
  };

  // Guarantee 4 unique options.
  const seen = new Set<string>([correct[kind]]);
  const uniques = distractors[kind].filter((d) => {
    if (seen.has(d)) return false;
    seen.add(d);
    return true;
  });
  let filler = 1;
  while (uniques.length < 3) {
    const extra =
      kind === "usableHosts"
        ? fmt(info.usableHosts + 2 + filler)
        : formatIp((ipToInt(correct[kind]) + filler * 3) >>> 0);
    if (!seen.has(extra)) {
      seen.add(extra);
      uniques.push(extra);
    }
    filler++;
  }

  const options = [correct[kind], ...uniques.slice(0, 3)];

  // Fisher–Yates with the seeded rng.
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  const correctIndex = options.indexOf(correct[kind]);

  const explanations: Record<SubnetKind, Record<Lang, string>> = {
    broadcast: {
      en: `Host bits = 32 − ${prefix} = ${hostBits}, block size = ${info.totalAddresses}. ${ip} sits in the subnet ${info.networkAddress}/${prefix} (mask ${info.subnetMask}), whose broadcast is ${info.broadcastAddress}.`,
      fr: `Bits d'hôte = 32 − ${prefix} = ${hostBits}, taille du bloc = ${info.totalAddresses}. ${ip} se trouve dans le sous-réseau ${info.networkAddress}/${prefix} (masque ${info.subnetMask}), dont le broadcast est ${info.broadcastAddress}.`,
    },
    network: {
      en: `Block size = ${info.totalAddresses} (${hostBits} host bits). ${ip} falls in the subnet starting at ${info.networkAddress} (mask ${info.subnetMask}).`,
      fr: `Taille du bloc = ${info.totalAddresses} (${hostBits} bits d'hôte). ${ip} tombe dans le sous-réseau qui commence à ${info.networkAddress} (masque ${info.subnetMask}).`,
    },
    firstHost: {
      en: `Subnet ${info.networkAddress}/${prefix}: the network address is ${info.networkAddress}, so the first usable host is one above it — ${info.firstHost}.`,
      fr: `Sous-réseau ${info.networkAddress}/${prefix} : l'adresse réseau est ${info.networkAddress}, donc le premier hôte utilisable est juste au-dessus — ${info.firstHost}.`,
    },
    lastHost: {
      en: `Subnet ${info.networkAddress}/${prefix}: the broadcast is ${info.broadcastAddress}, so the last usable host is one below it — ${info.lastHost}.`,
      fr: `Sous-réseau ${info.networkAddress}/${prefix} : le broadcast est ${info.broadcastAddress}, donc le dernier hôte utilisable est juste en dessous — ${info.lastHost}.`,
    },
    usableHosts: {
      en: `/${prefix} leaves ${hostBits} host bits → 2^${hostBits} = ${info.totalAddresses} total addresses, minus the network and broadcast = ${info.usableHosts} usable hosts.`,
      fr: `/${prefix} laisse ${hostBits} bits d'hôte → 2^${hostBits} = ${info.totalAddresses} adresses au total, moins le réseau et le broadcast = ${info.usableHosts} hôtes utilisables.`,
    },
    wildcard: {
      en: `The wildcard is the inverse of the mask ${info.subnetMask}: all 1-bits flip to 0 and vice versa → ${info.wildcardMask} (also written as /${prefix}).`,
      fr: `Le wildcard est l'inverse du masque ${info.subnetMask} : tous les bits à 1 deviennent 0 et inversement → ${info.wildcardMask} (aussi noté /${prefix}).`,
    },
  };

  return {
    question: stems[kind][lang],
    options,
    correctIndex,
    explanation: explanations[kind][lang],
    meta: { kind, ip, prefix },
  };
}

/** Parses a dotted IP into an unsigned 32-bit int (distractor arithmetic only). */
function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  return (
    (((parts[0] << 24) >>> 0) +
      (parts[1] << 16 >>> 0) +
      (parts[2] << 8 >>> 0) +
      parts[3]) >>>
    0
  );
}

const KINDS: SubnetKind[] = [
  "broadcast",
  "network",
  "firstHost",
  "lastHost",
  "usableHosts",
  "wildcard",
];

export function generateSubnetQuestion(rng: Rng, lang: Lang = "en"): GeneratedQuestion {
  const ip = randomPrivateIp(rng);
  const prefix = COMMON_PREFIXES[Math.floor(rng() * COMMON_PREFIXES.length)];
  const kind = KINDS[Math.floor(rng() * KINDS.length)];
  return buildQuestion(kind, ip, prefix, rng, lang);
}

export function generateSubnetQuiz(
  count: number,
  rng: Rng,
  lang: Lang = "en",
): GeneratedQuestion[] {
  const out: GeneratedQuestion[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard < count * 20) {
    guard++;
    const q = generateSubnetQuestion(rng, lang);
    const key = `${q.meta.kind}:${q.meta.ip}/${q.meta.prefix}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  while (out.length < count) {
    out.push(generateSubnetQuestion(rng, lang));
  }
  return out;
}
