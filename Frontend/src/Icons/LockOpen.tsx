"use client";

import type { Variants } from "framer-motion";
import { motion, useAnimation } from "framer-motion";
import React from "react";

const shackleVariant: Variants = {
  normal: { pathLength: 1, opacity: 1, pathOffset: 0 },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    pathOffset: [1, 0],
  },
};

const bodyVariant: Variants = {
  normal: { scale: 1, opacity: 1 },
  animate: { scale: [0.9, 1.05, 1], opacity: [0.8, 1] },
};

interface LockOpenProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
}

const LockOpen = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#ffffff",
  ...props
}: LockOpenProps) => {
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
        {/* Open shackle (tilted) */}
        <motion.path
          d="M7 8V6a5 5 0 0 1 9.9-1"
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

        {/* Keyhole */}
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

export { LockOpen };
