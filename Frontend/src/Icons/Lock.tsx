"use client";

import type { Variants } from "framer-motion";
import { motion, useAnimation } from "framer-motion";

const shackleVariant: Variants = {
  normal: { pathLength: 1, opacity: 1, pathOffset: 0 },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    pathOffset: [1, 0],
  },
};

const bodyVariant: Variants = {
  normal: {
    scale: 1,
    opacity: 1,
  },
  animate: {
    x: [-4, 0],
    opacity: [0.3, 1],
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

interface LockProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
}

const Lock = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#ffffff",
  ...props
}: LockProps) => {
  const controls = useAnimation();

  return (
    <div
      style={{
        cursor: "pointer",
        userSelect: "none",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {/* Lock shackle (top curve) */}
        <motion.path
          d="M7 10V7a5 5 0 0 1 10 0v3"
          animate={controls}
          variants={shackleVariant}
          transition={{ duration: 0.6 }}
        />

        {/* Lock body */}
        <motion.rect
          x="5"
          y="10"
          width="14"
          height="11"
          rx="2"
          ry="2"
          animate={controls}
          variants={bodyVariant}
          transition={{ duration: 0.4 }}
        />

        {/* Lock keyhole */}
        <motion.circle
          cx="12"
          cy="16"
          r="1.5"
          animate={controls}
          variants={bodyVariant}
          transition={{ duration: 0.3, delay: 0.1 }}
        />
      </svg>
    </div>
  );
};

export { Lock };
