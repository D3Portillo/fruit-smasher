"use client"

import { atomWithStorage } from "jotai/utils"
import { MiniKit } from "@worldcoin/minikit-js"
import Image from "next/image"

import { FaBlender } from "react-icons/fa"
import asset_pineapple from "@/assets/pineapple.png"
import asset_orange from "@/assets/orange.png"
import asset_fresa from "@/assets/fresa.png"
import asset_watermelon from "@/assets/watermelon.png"

import Blades from "@/components/sprites/Blades"
import { useAtom } from "jotai/react"
import { cn } from "@/lib/utils"
import { numberToShortWords } from "@/lib/numbers"
import EyesMad from "@/components/sprites/EyesMad"
import EyesAmazed from "@/components/sprites/EyesAmazed"
import EyesDead from "@/components/sprites/EyesDead"
import { useAudioMachine } from "@/lib/sounds"
import ClickSpawn, { HealthPoint } from "@/components/ClickSpawn"
import { VIBRATES } from "@/lib/window"
import { useEffect, useState } from "react"

import { AnimatePresence, motion } from "framer-motion"
import { useTimer } from "@/lib/time"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import ExplodingDiv from "@/components/ExplodingDiv"
import { getRandomMonsterName, type MonsterTypes } from "@/lib/game"
import EnergyPortal from "@/components/EnergyPortal"
import ModalTaps from "@/components/ModalTaps"
import ModalBoost from "@/components/ModalBoost"
import { useWorldAuth } from "@radish-la/world-auth"
import ModalProfile from "@/components/ModalProfile"
import ModalBlender from "@/components/ModalBlender"

const atomMonster = atomWithStorage("fs.current.monster", {
  hp: 250,
  name: "Pineapple Larry",
  type: "pineapple" as MonsterTypes,
})

const atomTapsGivenForEnemy = atomWithStorage("fs.current.tapsForEnemy", 0)
const atomTapMultiplier = atomWithStorage("fs.current.tapMultiplier", 1)
const MOCK_TAPS_EARNED = 24_234_242
const TIME_TO_DRILL = 13 // seconds

let timer: NodeJS.Timeout | undefined = undefined
export default function Home() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [isDrilling, setIsDrilling] = useState({
    impact: 40,
    active: false,
  })

  const { toast } = useToast()
  const [tapMultiplier, setTapMultiplier] = useAtom(atomTapMultiplier)
  const { isConnected, signIn, user } = useWorldAuth()
  const [rotateKey, setRotateKey] = useState(0)

  const [monster, setMonster] = useAtom(atomMonster)
  const [tapsForEnemy, setTapsForEnemy] = useAtom(atomTapsGivenForEnemy)

  const { playSound } = useAudioMachine([
    "pop1",
    "pop2",
    "pop3",
    "drill",
    "hitlong",
    "cry",
    "error",
    "bgx",
  ])

  const safePaddingBottom = MiniKit.deviceProperties.safeAreaInsets?.bottom || 0

  const {
    elapsedTime,
    isComplete: isDrillReady,
    restart,
  } = useTimer(TIME_TO_DRILL)

  const ENEMY_HP = Math.max(0, monster.hp - tapsForEnemy)
  const DEFEATED_RATIO = (ENEMY_HP / monster.hp) * 100

  function generateNewMonster() {
    const type = ["pineapple", "orange", "watermelon", "fresa"][
      Math.floor(Math.random() * 4)
    ] as MonsterTypes

    setMonster({
      hp: 250 + Math.round(Math.random() * 150),
      name: getRandomMonsterName(type),
      type,
    })
    setTapsForEnemy(0)
  }

  const IS_ENEMY_DEFEATED = ENEMY_HP <= 0.5

  useEffect(() => {
    clearTimeout(timer)
    if (IS_ENEMY_DEFEATED && tapsForEnemy > 2) {
      timer = setTimeout(() => {
        playSound("cry")
        VIBRATES.success()
        generateNewMonster()
      }, 75)
    }
  }, [IS_ENEMY_DEFEATED, tapsForEnemy])

  useEffect(() => {
    // Start bg sound after first tap
    // to avoid autoplay issues on mobile :)
    if (isGameStarted) playSound("bgx", "0.2", { loop: true })
  }, [isGameStarted])

  function handleTap({ isMuted }: { isMuted?: boolean } = {}) {
    if (!isGameStarted) setIsGameStarted(true)

    const value = Math.random()
    const isBigTap = value < 0.15 || value > 0.85

    const TAP_AMOUNT =
      tapMultiplier * (isBigTap ? 3 + Math.floor(Math.random() * 7) : 1)

    setTapsForEnemy((count) => count + TAP_AMOUNT)

    if (!isMuted) {
      if (isBigTap) {
        playSound("hitlong")
        VIBRATES.tap()
      }
      const randomPop = 1 + Math.floor(Math.random() * 3)
      playSound(`pop${randomPop}` as any, "0.75")
    }

    return TAP_AMOUNT
  }

  return (
    <main
      className="flex bg-white max-w-xl mx-auto flex-col h-dvh overflow-hidden"
      style={{
        paddingBottom: `${safePaddingBottom}px`,
      }}
    >
      <nav className="flex px-5 pt-5 items-start justify-between">
        <ModalTaps
          trigger={
            <button className="text-left">
              <strong className="text-2xl">
                {(MOCK_TAPS_EARNED + tapsForEnemy).toLocaleString("en-US")}
              </strong>
              <p className="text-lg -mt-1.5 font-medium">TAPS</p>
            </button>
          }
        />

        {isConnected ? (
          <ModalProfile
            trigger={
              <button
                style={{
                  backgroundImage: `url(${
                    user?.profilePictureUrl || "/marble.png"
                  })`,
                }}
                className="size-11 bg-cover border-3 border-black shadow-lg rounded-2xl"
              />
            }
          />
        ) : (
          <button
            style={{
              backgroundImage: `url(/marble.png)`,
            }}
            onClick={signIn}
            className="size-11 bg-cover border-3 border-black shadow-lg rounded-2xl"
          />
        )}
      </nav>

      <ClickSpawn
        onTap={() => handleTap()}
        className="flex group outline-none pt-8 pb-12 flex-grow flex-col items-center justify-start"
      >
        <div
          style={{
            display: isGameStarted ? "flex" : "none",
          }}
          className="fixed text-fs-green justify-center items-end pointer-events-none bottom-20 left-0 right-0"
        >
          <motion.div
            key={rotateKey}
            style={{
              scale: 2,
              opacity: 1,
              translateY: "70%",
            }}
            animate={{
              rotate: rotateKey > 0 ? 360 : 0,
              opacity: 0,
            }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <Blades className="w-[150vw]" />
          </motion.div>
        </div>

        <div className="flex-grow pointer-events-none" />

        <div className="flex group-active:scale-[0.98] transition ease-in duration-75 select-none flex-grow items-center justify-center">
          {isDrilling.active ? (
            <AnimatePresence>
              <HealthPoint
                id={-1}
                amount={isDrilling.impact}
                x={window.innerWidth * 0.45}
                y={window.innerHeight * 0.12}
              />
            </AnimatePresence>
          ) : null}

          <ExplodingDiv
            fragmentCount={24}
            className="w-[60vw] max-w-[14rem]"
            explode={IS_ENEMY_DEFEATED}
            fragmentEmojis={
              monster.type === "watermelon"
                ? ["🍉", "💥", "🍉", "🔥", "🍉"]
                : monster.type === "fresa"
                ? ["🍓", "💥", "🍓", "🔥", "🍓"]
                : monster.type === "orange"
                ? ["🍊", "💥", "🍊", "🔥", "🍊"]
                : ["🍍", "💥", "🍍", "🔥", "🍍"]
            }
          >
            {DEFEATED_RATIO < 4 ? (
              <EyesDead className="w-1/2 z-1 absolute left-1/4 bottom-1/4" />
            ) : DEFEATED_RATIO < 37 ? (
              <EyesAmazed className="w-1/2 z-1 absolute left-1/4 bottom-1/4" />
            ) : (
              <EyesMad className="w-1/2 z-1 absolute left-1/4 bottom-1/4" />
            )}
            <motion.div
              animate={
                isDrilling.active
                  ? {
                      rotate: [0, -16, 0, -10, 0, -5, 0],
                    }
                  : {}
              }
              transition={{
                duration: 0.4,
                ease: "easeOut",
                times: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1],
              }}
            >
              <Image
                key={monster.type}
                placeholder="blur"
                src={
                  monster.type === "fresa"
                    ? asset_fresa
                    : monster.type === "watermelon"
                    ? asset_watermelon
                    : monster.type === "orange"
                    ? asset_orange
                    : asset_pineapple
                }
                alt=""
              />
            </motion.div>
          </ExplodingDiv>
        </div>

        <div className="min-h-24 pointer-events-none mb-20 w-full flex items-end justify-center">
          {isGameStarted ? (
            <div className="w-full select-none px-5">
              <h2 className="font-semibold whitespace-nowrap text-xl">
                {monster.name} (
                {ENEMY_HP < 1 ? "<1" : numberToShortWords(ENEMY_HP)} HP)
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
            <p className="leading-tight animate-pulse text-black/60 font-medium">
              Tap the screen to smash the fruit ☝️
            </p>
          )}
        </div>
      </ClickSpawn>

      <nav className="bg-black shrink-0 z-1 px-4 pb-1 h-14 [&_*:not(.clipper)]:z-1 [&_*:not(.clipper)]:relative relative flex items-end justify-between">
        <div className="h-[125%] clipper bg-black rounded-t-[100%] absolute -inset-x-6 bottom-full"></div>

        <div className="w-32 flex justify-start">
          <ModalBlender
            trigger={
              <button className="p-2 relative text-white">
                <div className="absolute top-2 left-px text-2xl rotate-12">
                  🫐
                </div>
                <FaBlender className="text-4xl" />
                <strong>1.4K</strong>
              </button>
            }
          />
        </div>

        <section className="flex flex-col">
          <button
            onClick={() => {
              // Early exit if already drilling
              if (isDrilling.active) return
              if (!isDrillReady) {
                playSound("error")
                return toast.error({
                  title: "Blade is not ready",
                })
              }

              playSound("cry")
              VIBRATES.doubleTap()

              handleTap({
                isMuted: true,
              })
              const IMPACT = 45 + Math.floor(Math.random() * 45)
              setIsDrilling({
                active: true,
                impact: IMPACT,
              })

              // Add new key to trigger rotation animation
              setRotateKey((prev) => prev + 1)

              // Increment taps for enemy by the impact amount
              setTapsForEnemy((count) => count + IMPACT)
              playSound("drill", "0.8")
              restart()
            }}
            className="bg-white shrink-0 outline-none group size-32 border-[0.6rem] border-black rounded-full flex items-center justify-center"
          >
            <EnergyPortal isActive={isDrillReady} />

            <motion.div
              key={rotateKey}
              animate={rotateKey > 0 ? { rotate: 360 } : {}}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              onAnimationComplete={() =>
                setIsDrilling({
                  impact: 0,
                  active: false,
                })
              }
            >
              <Blades className="w-20 scale-105" />
            </motion.div>
          </button>

          <div
            className={cn(
              isDrillReady
                ? "font-bold text-fs-green"
                : "font-medium text-white/50",
              "text-xs text-center mt-0.5 pb-2"
            )}
          >
            {isDrillReady ? "READY" : `${TIME_TO_DRILL - elapsedTime}s`}
          </div>
        </section>

        <div className="w-32 flex text-white justify-end">
          <ModalBoost
            trigger={
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
                <strong>x{tapMultiplier.toFixed(1)}</strong>
              </button>
            }
          />
        </div>
      </nav>
    </main>
  )
}
