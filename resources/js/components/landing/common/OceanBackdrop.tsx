export function OceanBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 gradient-ocean" />
      <div className="absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-[oklch(0.78_0.14_195/0.25)] blur-2xl will-change-transform" />
      <div className="absolute -right-32 top-40 h-[460px] w-[460px] rounded-full bg-[oklch(0.55_0.14_235/0.25)] blur-2xl will-change-transform" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-background" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, oklch(1 0 0 / 0.6) 1px, transparent 1.5px), radial-gradient(circle at 70% 80%, oklch(1 0 0 / 0.5) 1px, transparent 1.5px), radial-gradient(circle at 40% 70%, oklch(0.78 0.14 195 / 0.6) 1px, transparent 1.5px)",
          backgroundSize: "220px 220px, 340px 340px, 180px 180px",
        }}
      />
    </div>
  );
}

