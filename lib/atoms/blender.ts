"use client"

import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useEffect, useMemo } from "react"
import { atom, useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { useTapsEarned } from "./game"

export const MAX_TAPS_CAPACITY = 2_800
export const INIITAL_TAPS_CAPACITY = 1_200 // 1,200 TAPS
const TAPS_PER_SEC = 0.7 // Almost 1 TAP per second

const LEVELS = [
  { level: 1, capacity: INIITAL_TAPS_CAPACITY, costInWLD: 0 },
  { level: 2, capacity: 1500, costInWLD: 1 },
  { level: 3, capacity: 2000, costInWLD: 1.5 },
  { level: 4, capacity: 2500, costInWLD: 2 },
  { level: 5, capacity: MAX_TAPS_CAPACITY, costInWLD: 2.5 },
]

const atomBlender = atomWithStorage("fs.blender", {
  isSetup: false,
  idleTimestamp: 0,
  capacity: INIITAL_TAPS_CAPACITY, // Max TAPS that can be earned
})

const atomIsCollected = atom(false)
export const useBlender = () => {
  const [, setTapsEarned] = useTapsEarned()
  const { toast } = useToast()
  // This can claim while "in-game" but only once per session
  const [isCollected, setIsCollected] = useAtom(atomIsCollected)
  const [
    { idleTimestamp, isSetup,
      // Introuced new prop
      // Was causing to fail and blank screen
      // @see https://github.com/D3Portillo/fruit-smasher/commit/9f7c271a654283e5c8257497091b58159247fce8#diff-cf176e01f0ad0f3a84162112a380a037bd7051c32b7a5868c8637c025a6fcc5fR24
      capacity = INIITAL_TAPS_CAPACITY },
    setBlender,
  ] = useAtom(atomBlender)

  const earnedTillOpen = useMemo(() => {
    return idleTimestamp > 0
      ? Math.min(
          capacity,
          Math.floor(((Date.now() - idleTimestamp) / 1000) * TAPS_PER_SEC)
        )
      : 0
  }, [idleTimestamp, capacity])

  const availableTaps =
    // If the blender is setup, and not collected - user can collect balance
    // earned until openning the app
    isSetup && !isCollected ? earnedTillOpen : 0

  useEffect(() => {
    let timer: NodeJS.Timeout

    // We want to update the idle timestamp every 5 seconds
    // this to be the closest to the latest time a user leaves the app
    if (isCollected && isSetup) {
      timer = setTimeout(() => {
        setBlender((prev) => ({
          ...prev,
          idleTimestamp: Date.now(),
        }))
      }, 5_000)
    }

    return () => clearTimeout(timer)
  }, [isCollected, isSetup, idleTimestamp])

  const currentLevelIndex =
    LEVELS.findIndex((level) => level.capacity >= capacity) ||
    // Fallback to the first level if no level matches
    0

  const currentLevel = currentLevelIndex + 1
  return {
    currentLevelIndex,
    currentLevel,
    nextLevel:
      // Index based on current level
      // Fallback to the last level if current level is the last one
      LEVELS[currentLevel] || LEVELS[currentLevelIndex],
    isCollected,
    availableTaps,
    isSetup,
    capacity,
    setTapsCapacity: (capacity: number) => {
      setBlender((prev) => ({
        ...prev,
        capacity:
          // Clamp capacity to range [INIITAL_TAPS_CAPACITY, MAX_TAPS_CAPACITY]
          Math.min(
            MAX_TAPS_CAPACITY,
            Math.max(INIITAL_TAPS_CAPACITY, capacity)
          ),
      }))
    },
    setupBlender: () => {
      setBlender((prev) => ({
        ...prev,
        isSetup: true,
        idleTimestamp: Date.now(),
      }))

      toast.success({
        title: "Blender ready!",
      })
    },
    collect: () => {
      if (!isSetup) {
        return toast.error({
          title: "Blender not set up",
        })
      }

      if (isCollected) {
        return toast.error({
          title: "Already collected",
        })
      }

      setTapsEarned((prev) => prev + availableTaps)
      toast.success({
        title: `Collected ${availableTaps.toLocaleString("en-US")} TAPS!`,
      })

      setBlender((prev) => ({
        ...prev,
        idleTimestamp: Date.now(), // Reset timestamp
      }))
      setIsCollected(true)
    },
  }
}
