/** NetLab logo mark — three linked nodes, one of them "up" (green). */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#0d1420" stroke="#1d2b45" />
      <g stroke="#38e1ff" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M10 22 L16 11 L23 19 L10 22" />
      </g>
      <circle cx="10" cy="22" r="2.4" fill="#38e1ff" />
      <circle cx="16" cy="11" r="2.4" fill="#38e1ff" />
      <circle cx="23" cy="19" r="2.4" fill="#3ddc97" />
    </svg>
  );
}
