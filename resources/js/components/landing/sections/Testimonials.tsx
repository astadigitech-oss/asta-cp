import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useLandingData, TestimonialItem } from "@/hooks/useLandingData";
import { stripHtml } from "@/components/lib/utils";
import { SectionHeading } from "../common";

const defaultTestimonials: TestimonialItem[] = [
  {
    id: 1,
    name: "Surya Aditama",
    role: "Head of IT",
    org: "Dinas Kominfo",
    quote: "Asta Digital built a portal that met our strict standards.",
    tag: "Government",
    rating: 5,
  },
  {
    id: 2,
    name: "Ratih Pratiwi",
    role: "Director",
    org: "PT Mitra Andalan",
    quote: "Clear communication and premium execution. Our internal system is far more efficient.",
    tag: "Enterprise",
    rating: 5,
  },
];

const testimonialGradients = [
  "from-[oklch(0.45_0.18_230)] to-[oklch(0.35_0.16_250)]",
  "from-[oklch(0.48_0.2_195)] to-[oklch(0.38_0.18_215)]",
];

function getInitials(name: string) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function TestimonialAvatar({ avatar, name, colorClass }: { avatar?: string; name: string; colorClass: string }) {
  const [imgError, setImgError] = useState(false);

  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={name}
        className="h-[52px] w-[52px] shrink-0 rounded-2xl object-cover shadow-soft border border-white/40"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${colorClass} text-base font-bold text-white shadow-soft`}
      style={{ width: 52, height: 52 }}
    >
      {getInitials(name)}
    </div>
  );
}

export function Testimonials() {
  const { t } = useTranslation();
  const { data: landingData } = useLandingData();
  const testimonials = (landingData?.testimonials && landingData.testimonials.length > 0)
    ? landingData.testimonials
    : defaultTestimonials;

  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const len = testimonials.length;

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (len === 0) return;
    timerRef.current = setInterval(() => setIdx((v) => (v + 1) % len), 6000);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [len]);

  const goTo = (i: number) => { if (len === 0) return; setIdx((i + len) % len); resetTimer(); };
  const prev = () => goTo(idx - 1);
  const next = () => goTo(idx + 1);

  return (
    <section id="testimoni" className="relative overflow-hidden bg-surface py-6 sm:py-6 lg:py-6">
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-ocean opacity-60" />
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            eyebrow={t("testimonials.eyebrow")}
            title={t("testimonials.title")}
            desc={t("testimonials.description")}
          />
        </motion.div>

        <div
          className="relative mt-14 flex justify-center"
          style={{ height: 420, perspective: "1400px" }}
        >
          {testimonials.map((tItem, i) => {
            const offset = (i - idx + len) % len;
            const isActive = offset === 0;
            // Show up to 2 cards stacked behind the active one
            const stackPos = offset <= 2 ? offset : len - offset <= 2 ? -(len - offset) : null;
            if (stackPos === null) return null;

            const cardColor = testimonialGradients[i % testimonialGradients.length];
            const starCount = tItem.rating ?? 5;

            // Stack offsets: active = 0, behind-1 = slightly down+shrink, behind-2 = more
            const stackScale = isActive ? 1 : stackPos === 1 ? 0.95 : 0.9;
            const stackY = isActive ? 0 : stackPos === 1 ? 18 : 32;
            const stackOpacity = isActive ? 1 : stackPos === 1 ? 0.6 : 0.35;
            const stackZ = isActive ? 30 : stackPos === 1 ? 20 : 10;

            return (
              <motion.figure
                key={tItem.id || tItem.name}
                animate={{
                  scale: stackScale,
                  opacity: stackOpacity,
                  y: stackY,
                  zIndex: stackZ,
                }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                style={{ transformOrigin: "top center", pointerEvents: isActive ? "auto" : "none" }}
                className="absolute w-full max-w-2xl 2xl:max-w-3xl 3xl:max-w-4xl overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-glass backdrop-blur-md"
              >
                <div className={`relative bg-gradient-to-br ${cardColor} px-8 pt-8 pb-10`}>
                  {tItem.tag && (
                    <span className="inline-block rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
                      {tItem.tag}
                    </span>
                  )}
                  <div className="mt-4 flex gap-1">
                    {[...Array(starCount)].map((_, si) => (
                      <svg key={si} viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-yellow-300 drop-shadow">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                <div className="px-8 pb-8 pt-6">
                  <blockquote className="font-display text-[1.05rem] font-semibold leading-relaxed text-primary sm:text-lg">
                    &ldquo;{stripHtml(tItem.quote)}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-4">
                    <TestimonialAvatar avatar={tItem.avatar} name={tItem.name} colorClass={cardColor} />
                    <div>
                      <div className="font-display text-base font-bold text-primary">{tItem.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {tItem.role && <span>{tItem.role}</span>}
                        {tItem.role && tItem.org && <span> · </span>}
                        {tItem.org && <span className="font-semibold text-secondary">{tItem.org}</span>}
                      </div>
                    </div>
                  </figcaption>
                </div>
              </motion.figure>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={prev}
            aria-label={t("common.previous")}
            className="grid h-10 w-10 place-items-center rounded-full border border-primary/15 bg-white/70 text-primary/60 shadow-soft backdrop-blur transition-all hover:border-accent/40 hover:text-secondary cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === i ? "w-8 gradient-accent" : "w-2 bg-primary/25"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            aria-label={t("common.next")}
            className="grid h-10 w-10 place-items-center rounded-full border border-primary/15 bg-white/70 text-primary/60 shadow-soft backdrop-blur transition-all hover:border-accent/40 hover:text-secondary cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

