"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Animated butterflies and swaying leaves matching the Licoricé logo style —
 * elegant SVG botanical emblem motifs (top-down view) placed around the
 * dotted-circle ring in the HeroBanner.
 * In dark mode, butterflies are replaced with twinkling stars.
 */

/* ─── Butterfly (top-down / emblem style — symmetrical wings like the logo) ─── */
function Butterfly({
  size = 28,
  color = "rgba(255,255,255,0.3)",
  delay = 0,
}: {
  size?: number;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.svg
      className="pointer-events-none"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      animate={{ y: [0, -4, 0], scale: [1, 1.04, 1] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Left upper wing */}
      <motion.path
        d="M20 20 C14 10, 4 8, 6 16 C8 22, 14 22, 20 20Z"
        fill={color}
        animate={{
          d: [
            "M20 20 C14 10, 4 8, 6 16 C8 22, 14 22, 20 20Z",
            "M20 20 C16 13, 8 11, 9 17 C10 21, 15 21, 20 20Z",
            "M20 20 C14 10, 4 8, 6 16 C8 22, 14 22, 20 20Z",
          ],
        }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay }}
      />
      {/* Right upper wing */}
      <motion.path
        d="M20 20 C26 10, 36 8, 34 16 C32 22, 26 22, 20 20Z"
        fill={color}
        animate={{
          d: [
            "M20 20 C26 10, 36 8, 34 16 C32 22, 26 22, 20 20Z",
            "M20 20 C24 13, 32 11, 31 17 C30 21, 25 21, 20 20Z",
            "M20 20 C26 10, 36 8, 34 16 C32 22, 26 22, 20 20Z",
          ],
        }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay }}
      />
      {/* Left lower wing */}
      <motion.path
        d="M20 20 C14 24, 6 30, 10 32 C14 34, 18 26, 20 20Z"
        fill={color}
        opacity={0.7}
        animate={{
          d: [
            "M20 20 C14 24, 6 30, 10 32 C14 34, 18 26, 20 20Z",
            "M20 20 C16 23, 10 28, 12 30 C15 32, 18 25, 20 20Z",
            "M20 20 C14 24, 6 30, 10 32 C14 34, 18 26, 20 20Z",
          ],
        }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay }}
      />
      {/* Right lower wing */}
      <motion.path
        d="M20 20 C26 24, 34 30, 30 32 C26 34, 22 26, 20 20Z"
        fill={color}
        opacity={0.7}
        animate={{
          d: [
            "M20 20 C26 24, 34 30, 30 32 C26 34, 22 26, 20 20Z",
            "M20 20 C24 23, 30 28, 28 30 C25 32, 22 25, 20 20Z",
            "M20 20 C26 24, 34 30, 30 32 C26 34, 22 26, 20 20Z",
          ],
        }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay }}
      />
      {/* Body */}
      <ellipse cx="20" cy="20" rx="1.2" ry="5" fill={color} />
      {/* Antennae */}
      <path
        d="M19.5 15 C18 11, 15 9, 14 8"
        stroke={color}
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M20.5 15 C22 11, 25 9, 26 8"
        stroke={color}
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
      />
      {/* Antenna tips */}
      <circle cx="14" cy="8" r="0.8" fill={color} />
      <circle cx="26" cy="8" r="0.8" fill={color} />
    </motion.svg>
  );
}

/* ─── Botanical leaf (top-down emblem style — like the Licoricé logo leaves) ─── */
function SwayingLeaf({
  size = 22,
  color = "rgba(255,255,255,0.25)",
  delay = 0,
}: {
  size?: number;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.svg
      className="pointer-events-none"
      width={size}
      height={size * 1.4}
      viewBox="0 0 24 34"
      fill="none"
      animate={{ rotate: [-8, 8, -8], y: [0, -3, 0] }}
      transition={{
        duration: 3.5 + delay * 0.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      style={{ transformOrigin: "bottom center" }}
    >
      {/* Leaf blade */}
      <path d="M12 2 C4 8, 2 18, 12 32 C22 18, 20 8, 12 2Z" fill={color} />
      {/* Central vein */}
      <path
        d="M12 4 L12 30"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="0.5"
        strokeLinecap="round"
      />
      {/* Side veins */}
      <path
        d="M12 10 C9 12, 7 13, 6 14"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.4"
        fill="none"
      />
      <path
        d="M12 10 C15 12, 17 13, 18 14"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.4"
        fill="none"
      />
      <path
        d="M12 16 C9 18, 7 20, 5.5 21"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.4"
        fill="none"
      />
      <path
        d="M12 16 C15 18, 17 20, 18.5 21"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.4"
        fill="none"
      />
      <path
        d="M12 22 C10 24, 8 26, 7 27"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.4"
        fill="none"
      />
      <path
        d="M12 22 C14 24, 16 26, 17 27"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.4"
        fill="none"
      />
    </motion.svg>
  );
}

/* ─── Twinkling star (dark mode replacement for butterflies) ─── */
function TwinklingStar({
  size = 28,
  color = "rgba(255,255,255,0.85)",
  delay = 0,
}: {
  size?: number;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.svg
      className="pointer-events-none"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      animate={{
        scale: [1, 1.35, 0.9, 1.2, 1],
        opacity: [0.7, 1, 0.4, 0.95, 0.7],
        rotate: [0, 15, -10, 5, 0],
      }}
      transition={{
        duration: 2.4 + delay * 0.7,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {/* 4-pointed star */}
      <path
        d="M20 4 L22.4 17.6 L36 20 L22.4 22.4 L20 36 L17.6 22.4 L4 20 L17.6 17.6 Z"
        fill={color}
      />
      {/* Subtle inner glow cross */}
      <path
        d="M20 12 L20.8 19.2 L28 20 L20.8 20.8 L20 28 L19.2 20.8 L12 20 L19.2 19.2 Z"
        fill="rgba(255,255,255,0.4)"
      />
    </motion.svg>
  );
}

/* ─── Items positioned around the circle ─── */
interface OrnamentItem {
  type: "butterfly" | "leaf";
  angle: number;
  size?: number;
  delay?: number;
}

const ORNAMENTS: OrnamentItem[] = [
  { type: "butterfly", angle: 20, size: 30, delay: 0 },
  { type: "leaf", angle: 70, size: 20, delay: 0.6 },
  { type: "leaf", angle: 115, size: 24, delay: 1.2 },
  { type: "butterfly", angle: 160, size: 26, delay: 0.3 },
  { type: "leaf", angle: 205, size: 22, delay: 0.9 },
  { type: "butterfly", angle: 255, size: 28, delay: 0.5 },
  { type: "leaf", angle: 300, size: 18, delay: 1.5 },
  { type: "leaf", angle: 345, size: 21, delay: 0.2 },
];

export function BotanicalOrnaments({ radius = 250 }: { radius?: number }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div
      className="pointer-events-none absolute top-1/2 left-1/2"
      style={{
        width: radius * 2,
        height: radius * 2,
        marginLeft: -radius,
        marginTop: -radius,
      }}
    >
      {ORNAMENTS.map((item, i) => {
        const rad = (item.angle * Math.PI) / 180;
        const x = radius + Math.cos(rad) * radius;
        const y = radius + Math.sin(rad) * radius;

        return (
          <span
            key={i}
            className="absolute"
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {item.type === "butterfly" ? (
              isDark ? (
                <TwinklingStar size={item.size} delay={item.delay} />
              ) : (
                <Butterfly size={item.size} delay={item.delay} />
              )
            ) : (
              <SwayingLeaf size={item.size} delay={item.delay} />
            )}
          </span>
        );
      })}
    </div>
  );
}
