"use client";

import type { Variants, Transition } from "framer-motion";
import { motion, useAnimation } from "framer-motion";

interface EditProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
}

const lineVariants: Variants = {
  normal: { rotate: 0, y: 0 },
  animate: { rotate: -8, y: -2 },
};

const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

const EditAnimatedSquare = ({
  width = 20,
  height = 20,
  strokeWidth = 2,
  stroke = "#2563eb", // blue default
  ...props
}: EditProps) => {
  const controls = useAnimation();

  return (
    <div
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
      className="w-10 h-10 flex items-center justify-center cursor-pointer 
                 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
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
        {/* Pencil body (new icon style) */}
        <motion.path
          d="M12 20h9"
          variants={lineVariants}
          animate={controls}
          transition={springTransition}
        />
        <motion.path
          d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
          variants={lineVariants}
          animate={controls}
          transition={springTransition}
        />
      </svg>
    </div>
  );
};

export { EditAnimatedSquare };
