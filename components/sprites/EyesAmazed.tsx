import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function EyesAmazed({ className }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-[1em]", className)}
      viewBox="0 0 408 408"
      fill="none"
      animate={{
        x: [0, -2, 1, 0, -1, 2, 0, 1, -2, 0],
        y: [0, 1, -2, 1, 2, -1, 1, 0, -1, 0],
        scale: [1, 1.02, 0.99, 1.02, 1],
      }}
      transition={{
        duration: 9,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path
        stroke="#000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="20"
        d="M263 94c27-3 41 2 60 27M81 124c16-22 28-29 60-27"
      />
      <path
        fill="#fff"
        stroke="#000"
        stroke-width="14"
        d="M278 131c24 0 45 22 45 50s-21 50-45 50-45-22-45-50 21-50 45-50Z"
      />
      <circle cx="274" cy="187.1" r="17" fill="#000" />
      <path
        fill="#fff"
        stroke="#000"
        stroke-width="14"
        d="M133 131c24 0 45 22 45 50s-21 50-45 50-45-22-45-50 21-50 45-50Z"
      />
      <circle cx="137" cy="187.1" r="17" fill="#000" />
      <path
        stroke="#000"
        stroke-linecap="round"
        stroke-width="20"
        d="M272 304c-122 100-32-59-152 0"
      />
    </motion.svg>
  )
}
