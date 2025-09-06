"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";
import type { Variants } from "framer-motion";

// ================== SHARED VARIANTS ==================
const pathVariant: Variants = {
  normal: { pathLength: 1, opacity: 1, pathOffset: 0 },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    pathOffset: [1, 0],
  },
};

// const circleVariant: Variants = {
//   normal: { pathLength: 1, pathOffset: 0, scale: 1 },
//   animate: { pathLength: [0, 1], pathOffset: [1, 0], scale: [0.5, 1] },
// };

// ================== PROPS ==================
interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
}

// ================== DASHBOARD ==================
export const DashboardIcon: React.FC<IconProps> = ({
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
      className="p-1 cursor-pointer select-none"
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
        <motion.rect
          x="3"
          y="3"
          width="7"
          height="7"
          animate={controls}
          variants={pathVariant}
        />
        <motion.rect
          x="14"
          y="3"
          width="7"
          height="7"
          animate={controls}
          variants={pathVariant}
          transition={{ delay: 0.1 }}
        />
        <motion.rect
          x="14"
          y="14"
          width="7"
          height="7"
          animate={controls}
          variants={pathVariant}
          transition={{ delay: 0.2 }}
        />
        <motion.rect
          x="3"
          y="14"
          width="7"
          height="7"
          animate={controls}
          variants={pathVariant}
          transition={{ delay: 0.3 }}
        />
      </svg>
    </div>
  );
};

// ================== PROJECT (Folder Style) ==================
export const ProjectIcon: React.FC<IconProps> = ({
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
      className="p-1 cursor-pointer select-none"
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
        {/* Folder body */}
        <motion.path
          d="M3 7h5l2 3h11v10H3z"
          variants={pathVariant}
          animate={controls}
        />
        {/* Folder tab */}
        <motion.path
          d="M3 7V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2"
          variants={pathVariant}
          animate={controls}
          transition={{ delay: 0.2 }}
        />
      </svg>
    </div>
  );
};

// ================== TASKS ==================
export const TasksIcon: React.FC<IconProps> = ({
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
      className="p-1 cursor-pointer select-none"
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
          d="M9 11l3 3L22 4"
          variants={pathVariant}
          animate={controls}
        />
        <motion.path
          d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
          variants={pathVariant}
          animate={controls}
          transition={{ delay: 0.2 }}
        />
      </svg>
    </div>
  );
};

// ================== COMMENT (Square & Professional Style) ==================
export const CommentIcon: React.FC<IconProps> = ({
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
      className="p-1 cursor-pointer select-none"
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
        {/* Square chat box */}
        <motion.rect
          x="3"
          y="3"
          width="18"
          height="14"
          rx="2"
          ry="2"
          variants={pathVariant}
          animate={controls}
        />

        {/* Tail of the comment box */}
        <motion.path
          d="M8 21l3-4h10"
          variants={pathVariant}
          animate={controls}
          transition={{ delay: 0.2 }}
        />

        {/* Message text lines inside */}
        <motion.line
          x1="7"
          y1="9"
          x2="17"
          y2="9"
          variants={pathVariant}
          animate={controls}
          transition={{ delay: 0.3 }}
        />
        <motion.line
          x1="7"
          y1="13"
          x2="14"
          y2="13"
          variants={pathVariant}
          animate={controls}
          transition={{ delay: 0.4 }}
        />
      </svg>
    </div>
  );
};


// ================== SETTINGS ==================
export const ProfileIcon: React.FC<IconProps> = ({
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
      className="p-1 cursor-pointer select-none"
    >
      <motion.svg
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
        {/* Head */}
        <motion.circle
          cx="12"
          cy="8"
          r="4"
          variants={pathVariant}
          animate={controls}
        />
        {/* Shoulders/Body */}
        <motion.path
          d="M4 20c0-4 4-6 8-6s8 2 8 6"
          variants={pathVariant}
          animate={controls}
          transition={{ delay: 0.2 }}
        />
      </motion.svg>
    </div>
  );
};
