import { useAudioMachine } from "@/lib/sounds"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

interface Fragment {
  id: number
  emoji: string
  x: number
  y: number
  rotation: number
  scale: number
}

interface ExplodingDivProps {
  children: React.ReactNode
  explode: boolean
  fragmentEmojis?: string[]
  fragmentCount?: number
  className?: string
}

export default function ExplodingDiv({
  children,
  explode,
  fragmentEmojis = ["💥", "⭐", "✨", "🔥", "💫", "⚡"],
  fragmentCount = 12,
  className,
}: ExplodingDivProps) {
  const [isExploding, setIsExploding] = useState(false)
  const [fragments, setFragments] = useState<Fragment[]>([])
  const { playSound } = useAudioMachine(["explode"])

  useEffect(() => {
    if (explode && !isExploding) {
      startExplosion()
    } else if (!explode) {
      reset()
    }
  }, [explode, isExploding])

  const startExplosion = () => {
    // Generate random fragments
    const newFragments: Fragment[] = Array.from(
      { length: fragmentCount },
      (_, i) => ({
        id: i,
        emoji:
          fragmentEmojis[Math.floor(Math.random() * fragmentEmojis.length)],
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        rotation: Math.random() * 720 - 360,
        scale: 0.5 + Math.random() * 1,
      })
    )

    setFragments(newFragments)
    setIsExploding(true)
    playSound("explode")

    // Clean up fragments after animation
    setTimeout(() => {
      setFragments([])
    }, 1500)
  }

  const reset = () => {
    setIsExploding(false)
    setFragments([])
  }

  return (
    <div className={cn("relative", className)}>
      {/* Main content - always present to prevent layout shift */}
      <motion.div
        className="pointer-events-none"
        animate={
          isExploding ? { scale: 0, rotate: 180 } : { scale: 1, rotate: 0 }
        }
        transition={{
          duration: 0.2,
          ease: "easeIn",
          rotate: { duration: 0.3 },
        }}
        style={{
          // Keep element in layout even when scaled to 0
          visibility: isExploding && !explode ? "hidden" : "visible",
        }}
      >
        {children}
      </motion.div>

      {/* Explosion fragments */}
      <AnimatePresence>
        {fragments.map((fragment) => (
          <motion.div
            key={fragment.id}
            className="absolute top-1/2 left-1/2 pointer-events-none text-2xl"
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              x: fragment.x,
              y: fragment.y,
              scale: fragment.scale,
              rotate: fragment.rotation,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
            }}
          >
            {fragment.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
