import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function EyesMad({ className }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-[1em]", className)}
      viewBox="0 0 408 408"
      fill="none"
      animate={{
        x: [0, -2, 1, -1, 2, 0, 1, -2, 0],
        y: [0, 1, -2, 2, -1, 1, 0, -1, 0],
        scale: [1, 1.03, 0.985, 1.03, 1],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <ellipse cx="285.5" cy="195.6" fill="#000" rx="29.5" ry="36" />
      <rect
        width="120.1"
        height="30"
        x="229"
        y="165"
        fill="#000"
        rx="15"
        transform="rotate(-29 229 164)"
      />
      <ellipse cx="123.5" cy="195.6" fill="#000" rx="29.5" ry="36" />
      <rect
        width="120.1"
        height="30"
        x="167"
        y="195"
        fill="#000"
        rx="15"
        transform="rotate(-153 167 195)"
      />
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeWidth={20}
        d="M280 300c-61-63-101-53-151 0"
      />
    </motion.svg>
  )
}
