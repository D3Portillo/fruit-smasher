"use client"

import { atomWithStorage } from "jotai/utils"
import { MiniKit } from "@worldcoin/minikit-js"
import Image from "next/image"

import { FaBlender } from "react-icons/fa"
import asset_pineapple from "@/assets/pineapple.png"
import Blades from "@/components/sprites/Blades"
import { useAtom } from "jotai/react"
import { cn } from "@/lib/utils"
import { numberToShortWords } from "@/lib/numbers"
import EyesMad from "@/components/sprites/EyesMad"
import EyesAmazed from "@/components/sprites/EyesAmazed"
import EyesDead from "@/components/sprites/EyesDead"
import { useAudioMachine } from "@/lib/sounds"

const atomIsTutorialComplete = atomWithStorage("fs.isTutorialCompleted", false)
const atomEnemyLife = atomWithStorage("zfs.current.enemyLife", 200)
const atomTapsGivenForEnemy = atomWithStorage("zfs.current.tapsForEnemy", 0)

const MOCK_TAPS_EARNED = 24_234_242
export default function Home() {
  const [isTutorialComplete, setIsTutorialComplete] = useAtom(
    atomIsTutorialComplete
  )

  const [enemyLife, setEnemyLife] = useAtom(atomEnemyLife)
  const [tapsForEnemy, setTapsForEnemy] = useAtom(atomTapsGivenForEnemy)

  const { playSound } = useAudioMachine(["pop1", "pop2", "pop3", "drill"])
  const safePaddingBottom = MiniKit.deviceProperties.safeAreaInsets?.bottom || 0

  function handleTap({ isMuted }: { isMuted?: boolean } = {}) {
    if (!isTutorialComplete) {
      setIsTutorialComplete(true)
    }

    setTapsForEnemy((count) => count + 1)

    if (!isMuted) {
      const randomPop = 1 + Math.floor(Math.random() * 3)
      playSound(`pop${randomPop}` as any, "0.75")
    }
  }

  const ENEMY_HP = Math.max(0, enemyLife - tapsForEnemy)
  const DEFEATED_RATIO = (ENEMY_HP / enemyLife) * 100

  return (
    <main
      className="flex bg-white max-w-xl mx-auto flex-col h-dvh overflow-hidden"
      style={{
        paddingBottom: `${safePaddingBottom}px`,
      }}
    >
      <nav className="flex px-5 pt-5 items-start justify-between">
        <div>
          <strong className="text-2xl">
            {(MOCK_TAPS_EARNED + tapsForEnemy).toLocaleString("en-US")}
          </strong>
          <p className="text-lg -mt-1.5 font-medium">TAPS</p>
        </div>

        <div className="size-11 bg-black rounded-2xl"></div>
      </nav>

      <section
        tabIndex={-1}
        onClick={() => handleTap()}
        role="button"
        className="flex outline-none pt-8 pb-12 flex-grow flex-col items-center justify-start"
      >
        <div className="flex select-none flex-grow items-center justify-center">
          <div className="w-[60vw] relative max-w-xs">
            {DEFEATED_RATIO < 4 ? (
              <EyesDead className="w-1/2 absolute left-1/4 bottom-1/4" />
            ) : DEFEATED_RATIO < 55 ? (
              <EyesAmazed className="w-1/2 absolute left-1/4 bottom-1/4" />
            ) : (
              <EyesMad className="w-1/2 absolute left-1/4 bottom-1/4" />
            )}
            <Image src={asset_pineapple} alt="" />
          </div>
        </div>

        <div className="flex-grow pointer-events-none" />

        <div className="min-h-24 pointer-events-none mb-28 w-full flex items-end justify-center">
          {isTutorialComplete ? (
            <div className="w-full select-none px-5">
              <h2 className="font-semibold text-xl">
                Pineapple Larry ({numberToShortWords(ENEMY_HP)} HP)
              </h2>

              <div className="bg-black/3 mt-2 w-full h-3.5 rounded-full overflow-auto border-3 border-black">
                <div
                  style={{
                    width: `${DEFEATED_RATIO}%`,
                  }}
                  className="h-full transition-all min-w-1 rounded-full bg-black"
                />
              </div>
            </div>
          ) : (
            <p className="leading-none animate-pulse text-black/60 font-medium">
              Tap the screen to
              <br />
              smash the fruit ☝️
            </p>
          )}
        </div>
      </section>

      <nav className="bg-black shrink-0 z-1 px-4 pb-1 h-14 [&_*:not(.clipper)]:z-1 [&_*:not(.clipper)]:relative relative flex items-end justify-between">
        <div className="h-[125%] clipper pointer-events-none bg-black rounded-t-[100%] absolute -inset-x-6 bottom-full"></div>

        <div className="w-32 flex justify-start">
          <button className="p-2 text-white">
            <FaBlender className="text-4xl" />
            <strong>1.4K</strong>
          </button>
        </div>

        <button
          onClick={() => {
            handleTap({
              isMuted: true,
            })
            setEnemyLife((prev) => Math.max(0, prev - 10))
            playSound("drill", "0.8")
          }}
          className="bg-white shrink-0 outline-none group bottom-1/2 size-32 border-[0.6rem] border-black rounded-full flex items-center justify-center"
        >
          <Blades className="w-20 scale-105 group-focus-within:rotate-[360deg] duration-700 ease-in-out" />
        </button>

        <div className="w-32 flex text-white justify-end">
          <button className="p-2">
            <svg
              className="w-[1em] text-3xl"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 30 40"
              fill="none"
            >
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M3.63 12.25a7.87 7.87 0 1 1 15.75 0 1.75 1.75 0 0 0 3.5 0 11.37 11.37 0 1 0-22.75 0 1.75 1.75 0 0 0 3.5 0ZM10 7.54a9.8 9.8 0 0 1 2.58-.02c1.9.25 3.1 1.93 3.27 3.73.2 2.19.44 5.2.47 7l.87.19c2.1.42 4.9.99 7.24 2.02a9.42 9.42 0 0 1 3.59 2.53 5.27 5.27 0 0 1 1.12 4.19 41.96 41.96 0 0 1-1.7 7.32 7.32 7.32 0 0 1-6.15 5.03c-3.4.39-6.83.38-10.22-.06-2.47-.32-4.76-1.6-5.93-3.88a26.9 26.9 0 0 1-2.52-8.07 5.3 5.3 0 0 1 1.7-4.69l2.36-2.2c0-4.58.11-7.61.22-9.5.1-1.75 1.28-3.33 3.1-3.59"
                clip-rule="evenodd"
              />
            </svg>
            <strong>x1.2</strong>
          </button>
        </div>
      </nav>
    </main>
  )
}
