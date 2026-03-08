import * as React from "react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
  ornament?: boolean;
}

function AyurvedicOrnament({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-3 w-24 ${className}`}
      aria-hidden="true"
    >
      <path d="M0 6h42 M78 6h42" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
      <circle cx="60" cy="6" r="4" stroke="currentColor" strokeWidth="0.75" fill="none" />
      <circle cx="60" cy="6" r="1.5" fill="currentColor" />
      <path
        d="M42 3l3 3-3 3 M78 3l-3 3 3 3"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className = "",
  ornament = true,
}: SectionHeadingProps) {
  const alignClass = { left: "text-left", center: "text-center", right: "text-right" }[align];
  const ornamentAlign = { left: "mr-auto", center: "mx-auto", right: "ml-auto" }[align];
  return (
    <div className={["flex flex-col gap-3", alignClass, className].join(" ")}>
      <h2 className="font-heading text-primary text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-base leading-relaxed">{subtitle}</p>
      )}
      {ornament && (
        <div className={`${ornamentAlign} mt-1`}>
          <AyurvedicOrnament className="text-accent" />
        </div>
      )}
    </div>
  );
}
