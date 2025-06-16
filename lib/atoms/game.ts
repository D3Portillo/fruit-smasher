"use client"

import type { MonsterTypes } from "@/lib/game"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { MAX_MULTIPLIER } from "@/components/ModalBoost"

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
