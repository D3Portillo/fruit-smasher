import { cn } from "@/lib/utils"

export default function EyesDead({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-[1em]", className)}
      viewBox="0 0 408 408"
      fill="none"
    >
      <path
        stroke="#000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="20"
        d="M267 95c15 23 27 31 60 27M81 125c27 4 41-1 60-27"
      />
      <path
        stroke="#000"
        stroke-linecap="round"
        stroke-width="20"
        d="M269 297c-38 19-93-24-130 2"
      />
      <path
        fill="#fff"
        stroke="#000"
        stroke-width="14"
        d="M133 146c24 0 45 22 45 50s-21 50-45 50-45-22-45-50 21-50 45-50Z"
      />
      <path
        stroke="#000"
        stroke-linecap="round"
        stroke-width="14"
        d="M127 215c-23-40 15-59 20-18"
      />
      <path
        fill="#fff"
        stroke="#000"
        stroke-width="14"
        d="M275 146c-24 0-45 22-45 50s21 50 45 50 45-22 45-50-21-50-45-50Z"
      />
      <path
        stroke="#000"
        stroke-linecap="round"
        stroke-width="14"
        d="M281 215c23-40-15-59-20-18"
      />
    </svg>
  )
}
