import { useEffect, useRef } from "react";

export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frameId = 0;
    let observer: IntersectionObserver | undefined;

    const animate = () => {
      const start = performance.now();
      const duration = 1600;

      const update = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        element.textContent = `${Math.round(to * easedProgress).toLocaleString()}${suffix}`;

        if (progress < 1) frameId = requestAnimationFrame(update);
      };

      frameId = requestAnimationFrame(update);
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            observer?.disconnect();
            animate();
          }
        },
        { rootMargin: "50px" },
      );
      observer.observe(element);
    } else {
      animate();
    }

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [suffix, to]);

  return <span ref={ref}>0{suffix}</span>;
}
