export function WaveDivider({
  flip = false,
  from = "var(--surface)",
  to = "var(--background)",
}: {
  flip?: boolean;
  from?: string;
  to?: string;
}) {
  return (
    <div
      className="relative -mt-px h-16 w-full sm:h-24"
      style={{ background: from, transform: flip ? "scaleY(-1)" : undefined }}
      aria-hidden
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d="M0,64 C240,120 480,0 720,40 C960,80 1200,120 1440,56 L1440,120 L0,120 Z"
          style={{ fill: to }}
        />
        <path
          d="M0,80 C240,40 480,110 720,70 C960,30 1200,80 1440,72 L1440,120 L0,120 Z"
          style={{ fill: to, opacity: 0.55 }}
        />
      </svg>
    </div>
  );
}

