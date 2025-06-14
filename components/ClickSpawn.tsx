import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

interface ClickEffect {
  id: number
  amount: number
  x: number
  y: number
}

export default function ClickSpawn({
  children,
  className,
  onTap,
  ...props
}: {
  children: React.ReactNode
  className?: string
  onTap?: (e: React.MouseEvent<HTMLDivElement>) => void
}) {
  const [clicks, setClicks] = useState<ClickEffect[]>([])
  const [nextId, setNextId] = useState(0)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const amount = onTap?.(e) || 1
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newClick: ClickEffect = {
      id: nextId,
      amount,
      x,
      y,
    }

    setClicks((prev) => [...prev, newClick])
    setNextId((prev) => prev + 1)

    // Remove the click effect after animation completes
    setTimeout(() => {
      setClicks((prev) => prev.filter((click) => click.id !== newClick.id))
    }, 1000)
  }

  return (
    <div
      {...props}
      role="button"
      tabIndex={-1}
      className={`relative ${className}`}
      onClick={handleClick}
    >
      {children}

      <AnimatePresence>
        {clicks.map((click) => (
          <motion.div
            key={click.id}
            className={cn(
              click.amount > 1
                ? "text-fs-red-est text-[2.2rem]"
                : "text-fs-red text-3xl",
              "absolute pointer-events-none font-bold z-10"
            )}
            style={{
              left: click.x,
              top: click.y,
              textShadow: "0 0 5px rgba(255, 0, 0, 0.3)",
            }}
            initial={{
              opacity: 1,
              y: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 0,
              y: -50,
              scale: 1.2,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
          >
            -{click.amount}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
