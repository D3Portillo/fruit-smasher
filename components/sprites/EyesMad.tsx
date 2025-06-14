import { cn } from "@/lib/utils"

export default function EyesMad({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-[1em]", className)}
      viewBox="0 0 408 408"
      fill="none"
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
        stroke-linecap="round"
        stroke-width="20"
        d="M280 300c-61-63-101-53-151 0"
      />
    </svg>
  )
}
