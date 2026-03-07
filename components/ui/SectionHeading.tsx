import * as React from "react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const alignClass = { left: "text-left", center: "text-center", right: "text-right" }[align];
  return (
    <div className={["flex flex-col gap-2", alignClass, className].join(" ")}>
      <h2 className="font-heading text-primary text-3xl font-semibold md:text-4xl">{title}</h2>
      {subtitle && <p className="text-muted">{subtitle}</p>}
    </div>
  );
}
