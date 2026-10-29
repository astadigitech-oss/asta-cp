import React from "react";

export function SectionHeadingNoEye({
  title,
  desc,
  center = true,
  invert = false,
}: {
  title: string;
  desc?: string;
  center?: boolean;
  invert?: boolean;
}) {
  return (
    <div className={`max-w-3xl 2xl:max-w-4xl 3xl:max-w-5xl ${center ? "mx-auto text-center" : ""}`}>
      <h2
        className={`mt-4 font-display text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl ${
          invert ? "text-primary-foreground" : "text-primary"
        }`}
      >
        {title}
      </h2>
      {desc && (
        <p
          className={`mt-4 text-base leading-relaxed sm:text-lg ${
            invert ? "text-primary-foreground/75" : "text-muted-foreground"
          }`}
        >
          {desc}
        </p>
      )}
    </div>
  );
}

