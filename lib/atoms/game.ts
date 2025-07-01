"use client"

import type { MonsterTypes } from "@/lib/game"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { MAX_MULTIPLIER } from "@/components/ModalBoost"
import { BLADE_LEVELS } from "@/components/sprites/Blades"

export const atomTapsEarned = atomWithStorage("fs.tapsEarned", 0)
export const useTapsEarned = () => useAtom(atomTapsEarned)

/**
 * This is used to calculate the total damage per tap.
 * The default value is 1, meaning no multiplier.
 * It can be increased by purchasing upgrades or boosts.
 */
export const atomTapMultiplier = atomWithStorage("fs.tapMultiplier", 1)
export const useTapMultiplier = () => {
  const [multiplier, setMultiplier] = useAtom(atomTapMultiplier)

  return {
    multiplier,
    setMultiplier,
    isMaxedOut: multiplier >= MAX_MULTIPLIER,
  }
}

const atomTotalKilledMonsters = atomWithStorage(
  "fs.totalKilledMonsters",
  {} as Record<MonsterTypes, number | undefined>
)

export const useTotalKilledMonsters = () => {
  const [killedMonsters, setTotalKilledMonsters] = useAtom(
    atomTotalKilledMonsters
  )

  function incrementMonsterKill(type: MonsterTypes) {
    setTotalKilledMonsters((prev) => ({
      ...prev,
      [type]: 1 + (prev[type] || 0),
    }))
  }

  return {
    killedMonsters,
    incrementMonsterKill,
  }
}

export const atomBladeLevel = atomWithStorage(
  "fs.bladeLevels",
  0
  // Level from "LEVELS" array in components/sprites/Blades.tsx
)

export const MAX_WAIT_TIME = 13
export const MIN_WAIT_TIME = 10
const atomBladeTimeToWait = atomWithStorage("fs.timeToWaits", MAX_WAIT_TIME)

const MAX_UPGRADE_INDEX = BLADE_LEVELS.length - 1
export const useBladeLevels = () => {
  const [waitTime, setWaitTime] = useAtom(atomBladeTimeToWait)
  const [bladeLevel, setBladeLevel] = useAtom(atomBladeLevel)

  const NEXT_LEVEL_INDEX = Math.min(bladeLevel + 1, MAX_UPGRADE_INDEX)
  const incrementBladeLevel = () => setBladeLevel(NEXT_LEVEL_INDEX)

  const { damageRange } = BLADE_LEVELS[bladeLevel]
  const nextLevelData = {
    ...BLADE_LEVELS[NEXT_LEVEL_INDEX],
    index: NEXT_LEVEL_INDEX,
  }

  return {
    damageRange,
    waitTime,
    setWaitTime: (timeInSeconds: number) => {
      // Clamp to MIN-MAX
      setWaitTime(
        Math.max(MIN_WAIT_TIME, Math.min(MAX_WAIT_TIME, timeInSeconds))
      )
    },
    nextLevelData,
    isMaxedOut: bladeLevel >= MAX_UPGRADE_INDEX,
    currentLevelIndex: bladeLevel,
    incrementBladeLevel,
  }
}
