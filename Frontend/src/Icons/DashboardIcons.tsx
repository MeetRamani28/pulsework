"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
}

// ================= SHARED ANIMATION VARIANTS =================
const pathVariant = {
  normal: { pathLength: 1, opacity: 1 },
  animate: { pathLength: [0, 1], opacity: [0, 1], transition: { duration: 0.5 } },
};

const circleVariant = {
  normal: { scale: 1, opacity: 1 },
  animate: { scale: [0.8, 1.2, 1], opacity: [0.8, 1, 0.9], transition: { duration: 0.6 } },
};

// ================= BELL ICON =================
export const Bell: React.FC<IconProps> = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#2563eb",
  ...props
}) => {
  const controls = useAnimation();
  return (
    <div
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
      style={{ cursor: "pointer", display: "inline-flex" }}
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
        <motion.path
          d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
          variants={pathVariant}
          animate={controls}
        />
        <motion.circle cx="12" cy="21" r="1" variants={circleVariant} animate={controls} />
      </svg>
    </div>
  );
};

// ================= USERS ICON =================
export const Users: React.FC<IconProps> = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#2563eb",
  ...props
}) => {
  const controls = useAnimation();
  return (
    <div
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
      style={{ cursor: "pointer", display: "inline-flex" }}
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
        <motion.circle cx="12" cy="8" r="5" variants={circleVariant} animate={controls} />
        <motion.path
          d="M20 21a8 8 0 0 0-16 0"
          variants={pathVariant}
          animate={controls}
        />
      </svg>
    </div>
  );
};

// ================= CLIPBOARD LIST ICON =================
export const ClipboardList: React.FC<IconProps> = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#2563eb",
  ...props
}) => {
  const controls = useAnimation();
  return (
    <div
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
      style={{ cursor: "pointer", display: "inline-flex" }}
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
        <motion.rect x="9" y="2" width="6" height="20" rx="2" ry="2" variants={pathVariant} animate={controls} />
        <motion.line x1="9" y1="8" x2="15" y2="8" variants={pathVariant} animate={controls} />
        <motion.line x1="9" y1="14" x2="15" y2="14" variants={pathVariant} animate={controls} />
      </svg>
    </div>
  );
};

// ================= BAR CHART ICON =================
export const BarChart: React.FC<IconProps> = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#2563eb",
  ...props
}) => {
  const controls = useAnimation();
  return (
    <div
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
      style={{ cursor: "pointer", display: "inline-flex" }}
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
        <motion.rect x="4" y="10" width="4" height="10" variants={pathVariant} animate={controls} />
        <motion.rect x="10" y="6" width="4" height="14" variants={pathVariant} animate={controls} />
        <motion.rect x="16" y="2" width="4" height="18" variants={pathVariant} animate={controls} />
      </svg>
    </div>
  );
};

// ================= PLUS CIRCLE ICON =================
export const PlusCircle: React.FC<IconProps> = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#2563eb",
  ...props
}) => {
  const controls = useAnimation();
  return (
    <div
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
      style={{ cursor: "pointer", display: "inline-flex" }}
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
        <motion.circle cx="12" cy="12" r="10" variants={circleVariant} animate={controls} />
        <motion.line x1="12" y1="8" x2="12" y2="16" variants={pathVariant} animate={controls} />
        <motion.line x1="8" y1="12" x2="16" y2="12" variants={pathVariant} animate={controls} />
      </svg>
    </div>
  );
};

export const CommentsIcon: React.FC<IconProps> = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#2563eb",
  ...props
}) => {
  const controls = useAnimation();

  return (
    <div
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
      style={{ cursor: "pointer", display: "inline-flex" }}
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
        {/* Chat bubble */}
        <motion.path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          variants={pathVariant}
          animate={controls}
        />
        {/* Three dots */}
        <motion.circle cx="9" cy="10" r="1" variants={circleVariant} animate={controls} />
        <motion.circle cx="13" cy="10" r="1" variants={circleVariant} animate={controls} />
        <motion.circle cx="17" cy="10" r="1" variants={circleVariant} animate={controls} />
      </svg>
    </div>
  );
};