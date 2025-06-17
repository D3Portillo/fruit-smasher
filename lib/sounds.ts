import { useEffect, useRef } from "react"
import { noOp } from "./utils"

const ASSETS = {
  pop1: "/sound/pop1.mp3",
  pop2: "/sound/pop2.mp3",
  pop3: "/sound/pop3.mp3",
  drill: "/sound/drill.mp3",
  hitlong: "/sound/hitlong.mp3",
  cry: "/sound/cry.mp3",
  error: "/sound/error.mp3",
  explode: "/sound/explode.mp3",
  bgx: "/sound/bg.mp3",
}

type AudioAssets = keyof typeof ASSETS
type ZeroToOneString = "0" | `0.${number}` | "1"
export const useAudioMachine = <T extends AudioAssets>(assets: Array<T>) => {
  const audioAssets = useRef(null as Record<T, HTMLAudioElement> | null)

  useEffect(() => {
    audioAssets.current = Object.fromEntries(
      assets.map((key) => {
        console.debug(`Loading audio asset: ${key}`)
        const audio = new Audio(ASSETS[key])
        audio.load() // Preload audio
        return [key, audio]
      })
    ) as any
  }, assets)

  function getAudioAsset(type: T) {
    const asset = audioAssets.current?.[type]
    if (!asset) throw `Audio asset ${type} not found`
    return asset
  }

  const playSound = (
    type: T,
    volumeLevel: ZeroToOneString = "1",
    { loop = false }: { loop?: boolean } = {}
  ) => {
    const audio = getAudioAsset(type)

    audio.loop = loop
    audio.volume = Number(volumeLevel) // Set volume
    audio.currentTime = 0 // Reset to start
    audio.play().catch(noOp)
  }

  return {
    playSound,
    stopSound: (type: T) => {
      const audio = getAudioAsset(type)
      audio.pause() // Pause the audio
      audio.currentTime = 0 // Reset to start
    },
  }
}
