/**
 * Pure IPv4 subnetting math — no side effects, fully unit-tested.
 * All internal math uses unsigned 32-bit integers (`>>> 0`).
 */

export interface SubnetInfo {
  ip: string;
  prefix: number;
  /** Dotted subnet mask, e.g. "255.255.255.224". */
  subnetMask: string;
  /** Inverse mask, e.g. "0.0.0.31". */
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  /** Null when the range is empty (never for valid input). */
  firstHost: string;
  lastHost: string;
  /** Total addresses in the block (2 for /31, 1 for /32). */
  totalAddresses: number;
  /**
   * Usable host count: 2^(host bits) − 2 for /0–/30;
   * 2 for /31 (RFC 3021 point-to-point); 1 for /32 (host route).
   */
  usableHosts: number;
  ipClass: string;
  /** Extra note: "private", "loopback", "link-local", "multicast", "reserved". */
  ipScopeNote: string | null;
  /** 35-char dotted binary, e.g. "11000000.10101000.00001010.00100101". */
  binary: string;
  /** Bit index where host bits start (ignores the three dot separators). */
  prefixBits: number;
}

export type SubnetResult =
  | { ok: true; data: SubnetInfo }
  | { ok: false; error: string };

const U32 = 0xffffffff;

/** Parses a strict dotted-quad IPv4 string; returns the unsigned 32-bit value or null. */
export function parseIp(input: string): number | null {
  const s = input.trim();
  if (!s || !/^\d{1,3}(\.\d{1,3}){3}$/.test(s)) return null;
  const parts = s.split(".").map(Number);
  for (const p of parts) {
    if (p < 0 || p > 255) return null;
  }
  return (
    (((parts[0] << 24) >>> 0) +
      (parts[1] << 16 >>> 0) +
      (parts[2] << 8 >>> 0) +
      parts[3]) >>>
    0
  );
}

export function formatIp(n: number): string {
  const v = n >>> 0;
  return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255].join(".");
}

/** Prefix (0–32) → dotted mask. */
export function prefixToMask(prefix: number): string {
  const p = Math.min(32, Math.max(0, Math.trunc(prefix)));
  const mask = p === 0 ? 0 : (U32 << (32 - p)) >>> 0;
  return formatIp(mask);
}

/** Dotted mask → prefix; null if malformed or non-contiguous. */
export function maskToPrefix(mask: string): number | null {
  const m = parseIp(mask);
  if (m === null) return null;
  // A valid mask is 1-bits followed by 0-bits, so ~m must be a
  // low-aligned run of ones: (inv & (inv+1)) === 0.
  const inv = (m ^ U32) >>> 0;
  if ((inv & (inv + 1)) !== 0) return null;
  return 32 - popcount(inv);
}

function popcount(n: number): number {
  let v = n >>> 0;
  let count = 0;
  while (v) {
    v &= v - 1;
    count++;
  }
  return count;
}

export function ipToBinary(n: number): string {
  const v = n >>> 0;
  return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255]
    .map((o) => o.toString(2).padStart(8, "0"))
    .join(".");
}

export interface IpClassInfo {
  letter: "A" | "B" | "C" | "D" | "E";
  private: boolean;
  note: string | null;
}

export function classifyIp(n: number): IpClassInfo {
  const o1 = (n >>> 24) & 255;
  let letter: IpClassInfo["letter"];
  if (o1 < 128) letter = "A";
  else if (o1 < 192) letter = "B";
  else if (o1 < 224) letter = "C";
  else if (o1 < 240) letter = "D";
  else letter = "E";

  let note: string | null = null;
  if (letter === "D") note = "multicast";
  else if (letter === "E") note = "reserved";
  else if (o1 === 127) note = "loopback";
  else if (o1 === 169 && ((n >>> 16) & 255) === 254) note = "link-local";
  else if (o1 === 0) note = "reserved";

  const isPrivate =
    o1 === 10 ||
    (o1 === 172 && ((n >>> 16) & 255) >= 16 && ((n >>> 16) & 255) <= 31) ||
    (o1 === 192 && ((n >>> 16) & 255) === 168);

  return { letter, private: isPrivate, note };
}

/**
 * Accepts either "24" (CIDR) or "255.255.255.224" (dotted mask).
 * Returns the prefix, or an error message.
 */
export function parsePrefixOrMask(input: string): { prefix: number } | { error: string } {
  const s = input.trim();
  if (!s) return { error: "Enter a prefix length or a subnet mask." };
  if (/^\d{1,2}$/.test(s)) {
    const p = Number(s);
    if (p < 0 || p > 32) return { error: "Prefix must be between 0 and 32." };
    return { prefix: p };
  }
  const p = maskToPrefix(s);
  if (p === null) {
    return {
      error: "Invalid mask — octets must be 0–255 and 1-bits must be contiguous (e.g. 255.255.255.0).",
    };
  }
  return { prefix: p };
}

/** Core calculation. `maskOrPrefix` is a CIDR number or a dotted mask. */
export function computeSubnet(ip: string, maskOrPrefix: string): SubnetResult {
  const ipInt = parseIp(ip);
  if (ipInt === null) {
    return {
      ok: false,
      error: "Invalid IP address — use four octets from 0 to 255 (e.g. 192.168.10.37).",
    };
  }

  const parsed = parsePrefixOrMask(maskOrPrefix);
  if ("error" in parsed) return { ok: false, error: parsed.error };
  const prefix = parsed.prefix;

  const mask = prefix === 0 ? 0 : ((U32 << (32 - prefix)) >>> 0);
  const wildcard = (mask ^ U32) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const hostBits = 32 - prefix;

  let firstHost: string;
  let lastHost: string;
  let totalAddresses: number;
  let usableHosts: number;

  if (prefix >= 31) {
    totalAddresses = prefix === 31 ? 2 : 1;
    usableHosts = prefix === 31 ? 2 : 1;
    firstHost = formatIp(network);
    lastHost = formatIp(broadcast);
  } else {
    totalAddresses = 2 ** hostBits;
    usableHosts = 2 ** hostBits - 2;
    firstHost = formatIp((network + 1) >>> 0);
    lastHost = formatIp((broadcast - 1) >>> 0);
  }

  const cls = classifyIp(ipInt);

  return {
    ok: true,
    data: {
      ip: formatIp(ipInt),
      prefix,
      subnetMask: formatIp(mask),
      wildcardMask: formatIp(wildcard),
      networkAddress: formatIp(network),
      broadcastAddress: formatIp(broadcast),
      firstHost,
      lastHost,
      totalAddresses,
      usableHosts,
      ipClass: cls.letter,
      ipScopeNote: cls.note ?? (cls.private ? "private" : null),
      binary: ipToBinary(ipInt),
      prefixBits: prefix,
    },
  };
}

export interface SplitSubnet {
  network: string;
  firstHost: string;
  lastHost: string;
  broadcast: string;
  usableHosts: number;
}

export type SplitResult =
  | {
      ok: true;
      newPrefix: number;
      /** k chosen so 2^k ≥ requested count (count need not be a power of two). */
      k: number;
      /** How many subnets the new prefix actually supports (2^k). */
      possible: number;
      subnets: SplitSubnet[];
    }
  | { ok: false; error: string };

export const MAX_SPLIT_COUNT = 1024;

/**
 * "Split into N subnets" (VLSM-lite): borrows the smallest k host bits with
 * 2^k ≥ N and lists the first N subnets of the parent block that contains `ip`.
 */
export function splitSubnets(
  ip: string,
  prefix: number,
  count: number,
): SplitResult {
  if (!Number.isInteger(count) || count < 1) {
    return { ok: false, error: "Number of subnets must be a whole number of at least 1." };
  }
  if (count > MAX_SPLIT_COUNT) {
    return { ok: false, error: `Splitting is capped at ${MAX_SPLIT_COUNT} subnets.` };
  }

  const ipInt = parseIp(ip);
  if (ipInt === null) {
    return { ok: false, error: "Invalid IP address." };
  }
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return { ok: false, error: "Prefix must be between 0 and 32." };
  }

  const k = Math.ceil(Math.log2(count));
  const newPrefix = prefix + k;
  if (newPrefix > 32) {
    return {
      ok: false,
      error: `Cannot split /${prefix} into ${count}: the largest supported split is ${2 ** (32 - prefix)} subnets (/${32}).`,
    };
  }

  const parentMask = prefix === 0 ? 0 : ((U32 << (32 - prefix)) >>> 0);
  const parentNetwork = (ipInt & parentMask) >>> 0;
  const childMask = newPrefix === 32 ? U32 : ((U32 << (32 - newPrefix)) >>> 0);
  const blockSize = (U32 - childMask + 1) >>> 0; // 2^(32−newPrefix)

  const possible = 2 ** k;
  const subnets: SplitSubnet[] = [];

  for (let i = 0; i < count; i++) {
    const net = (parentNetwork + i * blockSize) >>> 0;
    const bcast = (net + blockSize - 1) >>> 0;
    const usable =
      newPrefix >= 31 ? (newPrefix === 31 ? 2 : 1) : blockSize - 2;
    subnets.push({
      network: formatIp(net),
      firstHost:
        newPrefix >= 31 ? formatIp(net) : formatIp((net + 1) >>> 0),
      lastHost:
        newPrefix >= 31 ? formatIp(bcast) : formatIp((bcast - 1) >>> 0),
      broadcast: formatIp(bcast),
      usableHosts: usable,
    });
  }

  return { ok: true, newPrefix, k, possible, subnets };
}
