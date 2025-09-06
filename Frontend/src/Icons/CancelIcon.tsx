"use client";

import type { Variants } from "framer-motion";
import { motion, useAnimation } from "framer-motion";

const pathVariant: Variants = {
  normal: { pathLength: 1, opacity: 1, pathOffset: 0 },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    pathOffset: [1, 0],
  },
};

const circleVariant: Variants = {
  normal: { pathLength: 1, pathOffset: 0, scale: 1 },
  animate: { pathLength: [0, 1], pathOffset: [1, 0], scale: [0.5, 1] },
};

interface CancelIconProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
}

const CancelIcon = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#ffffff",
  ...props
}: CancelIconProps) => {
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
        {/* Circle background */}
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          animate={controls}
          variants={circleVariant}
        />
        {/* X path */}
        <motion.path
          d="M9 9l6 6M15 9l-6 6"
          variants={pathVariant}
          transition={{ delay: 0.2, duration: 0.4 }}
          animate={controls}
        />
      </svg>
    </div>
  );
};

export { CancelIcon };
