"use client"

import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useEffect, useMemo } from "react"
import { atom, useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { useTapsEarned } from "./game"

const MAX_TAPS = 1_200 // 1200 TAPS
const TAPS_PER_SEC = 0.7 // Almost 1 TAP per second

const atomBlender = atomWithStorage("fs.blender", {
  isSetup: false,
  idleTimestamp: 0,
})

const atomIsCollected = atom(false)
export const useBlender = () => {
  const [, setTapsEarned] = useTapsEarned()
  const { toast } = useToast()
  // This can claim while "in-game" but only once per session
  const [isCollected, setIsCollected] = useAtom(atomIsCollected)
  const [{ idleTimestamp, isSetup }, setBlender] = useAtom(atomBlender)

  const earnedTillOpen = useMemo(() => {
    return idleTimestamp > 0
      ? Math.min(
          MAX_TAPS,
          Math.floor(((Date.now() - idleTimestamp) / 1000) * TAPS_PER_SEC)
        )
      : 0
  }, [idleTimestamp])

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

  return {
    isCollected,
    availableTaps,
    isSetup,
    setupBlender: () => {
      setBlender({
        // idleTimestamp is set in the main page's useEffect
        isSetup: true,
        idleTimestamp: Date.now(),
      })

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
        title: `Collected ${availableTaps} TAPS!`,
      })
      setBlender((prev) => ({
        ...prev,
        idleTimestamp: Date.now(), // Reset timestamp
      }))
      setIsCollected(true)
    },
  }
}
