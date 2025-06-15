import { motion } from "framer-motion"
import { useRef, useEffect, useState } from "react"

export default function EnergyPortal({ isActive = true }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [particleDistance, setParticleDistance] = useState(60)

  useEffect(() => {
    if (wrapperRef.current) {
      const { width, height } = wrapperRef.current.getBoundingClientRect()
      const minSize = Math.min(width, height)
      setParticleDistance(minSize * 0.6)
    }
  }, [isActive]) // Recalculate when portal becomes active

  if (!isActive) return null

  return (
    <div
      ref={wrapperRef}
      className="!absolute inset-0 flex items-center justify-center"
    >
      {/* Outer ring */}
      <motion.div
        className="absolute size-full rounded-full border-4 border-fs-green"
        animate={{
          rotate: 360,
          scale: [1, 1.07, 1],
          opacity: [0.7, 0.8, 0.7],
        }}
        transition={{
          rotate: { duration: 4, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Particle effects */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="size-1.5 bg-fs-green rounded-full"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
          }}
          animate={{
            x: [0, Math.cos((i * 45 * Math.PI) / 180) * particleDistance],
            y: [0, Math.sin((i * 45 * Math.PI) / 180) * particleDistance],
            opacity: [1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Glow effect */}
      <div className="!absolute size-full rounded-full bg-fs-green/10 blur-xl scale-110" />
    </div>
  )
}
