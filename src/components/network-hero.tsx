"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

/**
 * Signature element: a small network topology whose nodes pulse like
 * status LEDs while packets travel along the edges, with gentle mouse
 * parallax. Decorative — hidden from assistive tech.
 */

interface Node {
  x: number;
  y: number;
  label: string;
  /** Green nodes read as "healthy endpoints", cyan as routers. */
  ok?: boolean;
}

const NODES: Node[] = [
  { x: 90, y: 300, label: "gw", },
  { x: 200, y: 120, label: "r1" },
  { x: 340, y: 215, label: "core" },
  { x: 500, y: 105, label: "r2" },
  { x: 585, y: 265, label: "ap", ok: true },
  { x: 260, y: 330, label: "sw1" },
  { x: 445, y: 325, label: "srv", ok: true },
];

const EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [2, 5],
  [2, 6],
  [0, 5],
  [4, 6],
  [1, 3],
];

/** Edges that carry visible packets. */
const PACKET_EDGES: Array<{
  edge: [number, number];
  dur: number;
  begin: number;
}> = [
  { edge: [0, 1], dur: 2.6, begin: 0 },
  { edge: [1, 2], dur: 2.1, begin: 1.2 },
  { edge: [2, 3], dur: 2.4, begin: 0.6 },
  { edge: [3, 4], dur: 2.0, begin: 1.8 },
  { edge: [2, 6], dur: 2.8, begin: 0.3 },
];

export function NetworkHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });
  const tx = useTransform(sx, [-0.5, 0.5], [10, -10]);
  const ty = useTransform(sy, [-0.5, 0.5], [8, -8]);

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 640 400"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <motion.g style={{ x: tx, y: ty }}>
          {/* edges */}
          {EDGES.map(([a, b], i) => (
            <line
              key={i}
              x1={NODES[a].x}
              y1={NODES[a].y}
              x2={NODES[b].x}
              y2={NODES[b].y}
              stroke="#1d2b45"
              strokeWidth={1.4}
            />
          ))}

          {/* packets traveling along edges (SMIL, disabled with reduced motion) */}
          {!reduce &&
            PACKET_EDGES.map(({ edge, dur, begin }, i) => {
              const [a, b] = edge;
              return (
                <circle
                  key={i}
                  r={2.4}
                  fill="#3ddc97"
                  opacity={0.9}
                  style={{
                    filter: "drop-shadow(0 0 4px rgba(61,220,151,0.8))",
                  }}
                >
                  <animateMotion
                    dur={`${dur}s`}
                    begin={`${begin}s`}
                    repeatCount="indefinite"
                    path={`M ${NODES[a].x} ${NODES[a].y} L ${NODES[b].x} ${NODES[b].y}`}
                  />
                </circle>
              );
            })}

          {/* node pulse rings */}
          {!reduce &&
            NODES.map((n, i) => (
              <motion.circle
                key={`pulse-${i}`}
                cx={n.x}
                cy={n.y}
                fill="none"
                stroke={n.ok ? "#3ddc97" : "#38e1ff"}
                strokeWidth={1.2}
                initial={{ r: 6, opacity: 0.55 }}
                animate={{ r: 20, opacity: 0 }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  delay: i * 0.45,
                  ease: "easeOut",
                }}
              />
            ))}

          {/* nodes */}
          {NODES.map((n, i) => (
            <g key={i}>
              <circle
                cx={n.x}
                cy={n.y}
                r={4.5}
                fill={n.ok ? "#3ddc97" : "#38e1ff"}
                style={{
                  filter: `drop-shadow(0 0 6px ${n.ok ? "rgba(61,220,151,0.7)" : "rgba(56,225,255,0.7)"})`,
                }}
              />
              <text
                x={n.x}
                y={n.y + 18}
                textAnchor="middle"
                fontSize={9}
                fontFamily="var(--font-jetbrains), monospace"
                fill="#5d6f85"
              >
                {n.label}
              </text>
            </g>
          ))}
        </motion.g>
      </svg>
    </div>
  );
}
