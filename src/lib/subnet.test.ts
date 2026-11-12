import { describe, expect, it } from "vitest";
import {
  classifyIp,
  computeSubnet,
  formatIp,
  ipToBinary,
  maskToPrefix,
  parseIp,
  parsePrefixOrMask,
  prefixToMask,
  splitSubnets,
} from "./subnet";

describe("parseIp", () => {
  it("accepts valid addresses", () => {
    expect(parseIp("192.168.10.37")).toBe(0xc0a80a25);
    expect(parseIp("0.0.0.0")).toBe(0);
    expect(parseIp("255.255.255.255")).toBe(0xffffffff);
    expect(parseIp(" 10.0.0.1 ")).toBe(0x0a000001);
  });

  it("rejects invalid addresses", () => {
    expect(parseIp("256.1.1.1")).toBeNull();
    expect(parseIp("1.1.1")).toBeNull();
    expect(parseIp("1.1.1.1.1")).toBeNull();
    expect(parseIp("a.b.c.d")).toBeNull();
    expect(parseIp("")).toBeNull();
    expect(parseIp("-1.0.0.0")).toBeNull();
    expect(parseIp("1.1.1.1 ")).not.toBeNull();
    expect(parseIp("01.02.03.04")).toBe(0x01020304);
  });
});

describe("formatIp / ipToBinary / masks", () => {
  it("round-trips", () => {
    expect(formatIp(0xc0a80a25)).toBe("192.168.10.37");
    expect(ipToBinary(0xc0a80a25)).toBe(
      "11000000.10101000.00001010.00100101",
    );
  });

  it("converts prefixes to masks", () => {
    expect(prefixToMask(24)).toBe("255.255.255.0");
    expect(prefixToMask(0)).toBe("0.0.0.0");
    expect(prefixToMask(32)).toBe("255.255.255.255");
    expect(prefixToMask(27)).toBe("255.255.255.224");
  });

  it("converts masks to prefixes", () => {
    expect(maskToPrefix("255.255.255.0")).toBe(24);
    expect(maskToPrefix("255.255.255.128")).toBe(25);
    expect(maskToPrefix("0.0.0.0")).toBe(0);
    expect(maskToPrefix("255.255.255.255")).toBe(32);
  });

  it("rejects non-contiguous masks", () => {
    expect(maskToPrefix("255.255.0.255")).toBeNull();
    expect(maskToPrefix("128.0.255.0")).toBeNull();
    expect(maskToPrefix("255.0.255.0")).toBeNull();
  });
});

describe("parsePrefixOrMask", () => {
  it("accepts CIDR and mask forms", () => {
    expect(parsePrefixOrMask("24")).toEqual({ prefix: 24 });
    expect(parsePrefixOrMask("255.255.255.0")).toEqual({ prefix: 24 });
  });

  it("explains errors", () => {
    expect(parsePrefixOrMask("")).toHaveProperty("error");
    expect(parsePrefixOrMask("33")).toHaveProperty("error");
    expect(parsePrefixOrMask("255.255.0.255")).toHaveProperty("error");
  });
});

describe("computeSubnet — the classic /27", () => {
  const r = computeSubnet("192.168.10.37", "27");
  it("computes all fields", () => {
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const d = r.data;
    expect(d.networkAddress).toBe("192.168.10.32");
    expect(d.broadcastAddress).toBe("192.168.10.63");
    expect(d.firstHost).toBe("192.168.10.33");
    expect(d.lastHost).toBe("192.168.10.62");
    expect(d.subnetMask).toBe("255.255.255.224");
    expect(d.wildcardMask).toBe("0.0.0.31");
    expect(d.totalAddresses).toBe(32);
    expect(d.usableHosts).toBe(30);
    expect(d.ipClass).toBe("C");
    expect(d.binary).toBe("11000000.10101000.00001010.00100101");
  });
});

describe("computeSubnet — class, scope and 10.x", () => {
  it("classifies private A", () => {
    const r = computeSubnet("10.20.30.40", "255.0.0.0");
    if (!r.ok) throw new Error("expected ok");
    expect(r.data.ipClass).toBe("A");
    expect(r.data.ipScopeNote).toBe("private");
    expect(r.data.usableHosts).toBe(2 ** 24 - 2);
  });

  it("classifies 172.16-31.x as private B", () => {
    const info = classifyIp(parseIp("172.16.5.9")!);
    expect(info.letter).toBe("B");
    expect(info.private).toBe(true);
    expect(classifyIp(parseIp("172.32.5.9")!).private).toBe(false);
  });

  it("marks loopback and multicast", () => {
    expect(classifyIp(parseIp("127.0.0.1")!).note).toBe("loopback");
    expect(classifyIp(parseIp("224.0.0.5")!).letter).toBe("D");
    expect(classifyIp(parseIp("224.0.0.5")!).note).toBe("multicast");
  });
});

describe("computeSubnet — edge prefixes", () => {
  it("handles /31 per RFC 3021", () => {
    const r = computeSubnet("10.0.0.4", "31");
    if (!r.ok) throw new Error("expected ok");
    expect(r.data.networkAddress).toBe("10.0.0.4");
    expect(r.data.broadcastAddress).toBe("10.0.0.5");
    expect(r.data.firstHost).toBe("10.0.0.4");
    expect(r.data.lastHost).toBe("10.0.0.5");
    expect(r.data.totalAddresses).toBe(2);
    expect(r.data.usableHosts).toBe(2);
  });

  it("handles /32 host routes", () => {
    const r = computeSubnet("192.168.1.7", "32");
    if (!r.ok) throw new Error("expected ok");
    expect(r.data.networkAddress).toBe("192.168.1.7");
    expect(r.data.broadcastAddress).toBe("192.168.1.7");
    expect(r.data.firstHost).toBe("192.168.1.7");
    expect(r.data.lastHost).toBe("192.168.1.7");
    expect(r.data.totalAddresses).toBe(1);
    expect(r.data.usableHosts).toBe(1);
  });

  it("handles /0 and /30", () => {
    const zero = computeSubnet("1.2.3.4", "0");
    if (!zero.ok) throw new Error("expected ok");
    expect(zero.data.networkAddress).toBe("0.0.0.0");
    expect(zero.data.broadcastAddress).toBe("255.255.255.255");
    expect(zero.data.usableHosts).toBe(2 ** 32 - 2);

    const thirty = computeSubnet("10.0.0.5", "30");
    if (!thirty.ok) throw new Error("expected ok");
    expect(thirty.data.networkAddress).toBe("10.0.0.4");
    expect(thirty.data.firstHost).toBe("10.0.0.5");
    expect(thirty.data.lastHost).toBe("10.0.0.6");
    expect(thirty.data.usableHosts).toBe(2);
  });

  it("returns errors for bad input", () => {
    expect(computeSubnet("256.0.0.1", "24")).toEqual({
      ok: false,
      error: expect.stringContaining("Invalid IP"),
    });
    expect(computeSubnet("192.168.1.1", "")).toHaveProperty("error");
    expect(computeSubnet("192.168.1.1", "33")).toHaveProperty("error");
    expect(computeSubnet("192.168.1.1", "255.255.0.255")).toHaveProperty("error");
  });
});

describe("splitSubnets", () => {
  it("splits /24 into 4 /26s", () => {
    const r = splitSubnets("192.168.1.130", 24, 4);
    if (!r.ok) throw new Error("expected ok");
    expect(r.newPrefix).toBe(26);
    expect(r.k).toBe(2);
    expect(r.possible).toBe(4);
    expect(r.subnets.map((s) => s.network)).toEqual([
      "192.168.1.0",
      "192.168.1.64",
      "192.168.1.128",
      "192.168.1.192",
    ]);
    expect(r.subnets[0].broadcast).toBe("192.168.1.63");
    expect(r.subnets[0].usableHosts).toBe(62);
  });

  it("rounds non-power-of-two counts up and reports the slack", () => {
    const r = splitSubnets("192.168.1.0", 24, 3);
    if (!r.ok) throw new Error("expected ok");
    expect(r.newPrefix).toBe(26);
    expect(r.possible).toBe(4);
    expect(r.subnets).toHaveLength(3);
  });

  it("count 1 returns the original subnet", () => {
    const r = splitSubnets("10.1.2.3", 16, 1);
    if (!r.ok) throw new Error("expected ok");
    expect(r.newPrefix).toBe(16);
    expect(r.subnets[0].network).toBe("10.1.0.0");
    expect(r.subnets[0].broadcast).toBe("10.1.255.255");
  });

  it("splits a /31 into two /32s", () => {
    const r = splitSubnets("10.0.0.4", 31, 2);
    if (!r.ok) throw new Error("expected ok");
    expect(r.newPrefix).toBe(32);
    expect(r.subnets.map((s) => s.network)).toEqual(["10.0.0.4", "10.0.0.5"]);
    expect(r.subnets[0].usableHosts).toBe(1);
  });

  it("rejects impossible splits", () => {
    expect(splitSubnets("10.0.0.1", 32, 2)).toEqual({
      ok: false,
      error: expect.stringContaining("Cannot split"),
    });
    expect(splitSubnets("10.0.0.1", 31, 5)).toHaveProperty("error");
    expect(splitSubnets("10.0.0.1", 24, 2000)).toHaveProperty("error");
    expect(splitSubnets("bad", 24, 2)).toHaveProperty("error");
    expect(splitSubnets("10.0.0.1", 24, 0)).toHaveProperty("error");
  });
});
