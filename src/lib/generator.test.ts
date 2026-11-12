import { describe, expect, it } from "vitest";
import { computeSubnet, formatIp, parseIp, prefixToMask } from "./subnet";
import {
  generateSubnetQuestion,
  generateSubnetQuiz,
  makeRng,
  type SubnetKind,
} from "./quiz/generator";

describe("generated subnetting questions", () => {
  it("is deterministic for a given seed", () => {
    const a = generateSubnetQuestion(makeRng(42));
    const b = generateSubnetQuestion(makeRng(42));
    expect(a).toEqual(b);
  });

  it("always produces 4 unique options with a valid correct index", () => {
    const rng = makeRng(7);
    for (let i = 0; i < 300; i++) {
      const q = generateSubnetQuestion(rng);
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
    }
  });

  it("correct option always matches the subnet math", () => {
    const rng = makeRng(1234);
    for (let i = 0; i < 300; i++) {
      const q = generateSubnetQuestion(rng);
      const { kind, ip, prefix } = q.meta;
      const r = computeSubnet(ip, String(prefix));
      if (!r.ok) throw new Error("bad meta");
      const truth: Record<SubnetKind, string> = {
        broadcast: r.data.broadcastAddress,
        network: r.data.networkAddress,
        firstHost: r.data.firstHost,
        lastHost: r.data.lastHost,
        usableHosts: r.data.usableHosts.toLocaleString("en-US"),
        wildcard: r.data.wildcardMask,
      };
      expect(q.options[q.correctIndex]).toBe(truth[kind]);
      // and every distractor must be wrong
      for (let k = 0; k < q.options.length; k++) {
        if (k !== q.correctIndex) {
          expect(q.options[k]).not.toBe(truth[kind]);
        }
      }
    }
  });

  it("wildcard questions answer with the inverse of the mask", () => {
    const rng = makeRng(99);
    for (let i = 0; i < 100; i++) {
      const q = generateSubnetQuestion(rng);
      if (q.meta.kind !== "wildcard") continue;
      const maskInt = parseIp(prefixToMask(q.meta.prefix))!;
      const wildcard = formatIp((maskInt ^ 0xffffffff) >>> 0);
      expect(q.options[q.correctIndex]).toBe(wildcard);
    }
  });

  it("quiz generator fills the requested count without duplicates", () => {
    const quiz = generateSubnetQuiz(10, makeRng(2024));
    expect(quiz).toHaveLength(10);
    const keys = new Set(
      quiz.map((q) => `${q.meta.kind}:${q.meta.ip}/${q.meta.prefix}`),
    );
    expect(keys.size).toBe(10);
  });

  it("renders question stems and numbers in the requested language", () => {
    const fr = generateSubnetQuestion(makeRng(42), "fr");
    const en = generateSubnetQuestion(makeRng(42), "en");
    expect(fr.question).toMatch(/Quelle|Combien|Quel/);
    expect(en.question).toMatch(/What|How/);
    expect(fr).not.toEqual(en);
    // FR numbers use fr-FR spacing, EN uses commas
    for (let i = 0; i < 50; i++) {
      const q = generateSubnetQuestion(makeRng(1000 + i), "fr");
      if (q.meta.kind !== "usableHosts") continue;
      if (q.meta.prefix > 22) continue; // < 1000 hosts → no separator
      expect(q.options[q.correctIndex]).toMatch(/[\s\u202f]/);
      break;
    }
  });
});
