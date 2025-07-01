"use client"

import { Fragment, useEffect, useState } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import Image from "next/image"

import {
  useBladeLevels,
  useTapMultiplier,
  useTapsEarned,
  useTotalKilledMonsters,
} from "@/lib/atoms/game"

import { useAtom } from "jotai/react"
import { atomWithStorage } from "jotai/utils"
import { beautifyAddress, cn } from "@/lib/utils"
import { numberToShortWords } from "@/lib/numbers"

import { AnimatePresence, motion } from "framer-motion"

import { shuffleArray } from "@/lib/arrays"
import { useTimer } from "@/lib/time"
import { useWorldAuth } from "@radish-la/world-auth"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useAudioMachine, useTapPopSound } from "@/lib/sounds"

import {
  getRandomMonsterName,
  MONSTER_TYPES,
  type MonsterTypes,
} from "@/lib/game"

import EnergyPortal from "@/components/EnergyPortal"
import ModalTaps from "@/components/ModalTaps"
import ModalBoost from "@/components/ModalBoost"
import ModalProfile, { MONSTER_ASSETS } from "@/components/ModalProfile"

import EyesMad from "@/components/sprites/EyesMad"
import EyesAmazed from "@/components/sprites/EyesAmazed"
import TriggerBlenderSetup from "@/components/TriggerBlenderSetup"
import EyesDead from "@/components/sprites/EyesDead"
import ClickSpawn, { HealthPoint } from "@/components/ClickSpawn"
import ExplodingDiv from "@/components/ExplodingDiv"
import Blades from "@/components/sprites/Blades"

import { tapPowerCurve } from "@/components/ModalBoost/internals"

const atomTapsGivenForEnemy = atomWithStorage("fs.current.tapsForEnemy", 0)
const atomMonster = atomWithStorage("fs.current.monster", {
  hp: 250,
  name: "Pineapple Larry",
  type: "pineapple" as MonsterTypes,
})

let monsterMutexTimer: NodeJS.Timeout | undefined = undefined
export default function Home() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [loadedAsset, setLoadedAsset] = useState({} as Record<string, boolean>)
  const { isConnected, signIn, user, address } = useWorldAuth()
  const { toast } = useToast()

  const { multiplier, isMaxedOut } = useTapMultiplier()
  const { incrementMonsterKill } = useTotalKilledMonsters()
  const [tapsForEnemy, setTapsForEnemy] = useAtom(atomTapsGivenForEnemy)

  const { damageRange, waitTime } = useBladeLevels()
  const [isDrilling, setIsDrilling] = useState({
    impact: 1,
    active: false,
  })

  const [tapsEarned, setTapsEarned] = useTapsEarned()
  const [rotateKey, setRotateKey] = useState(0)
  const [monster, setMonster] = useAtom(atomMonster)

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

  const { withTapSound } = useTapPopSound()

  function incrTapsGiven(amount: number) {
    // Round individually to avoid floating point issues
    setTapsForEnemy((thisGameTaps) => Math.round(thisGameTaps + amount))
    setTapsEarned((acc) => Math.round(acc + amount))
  }

  const safePaddingBottom = MiniKit.deviceProperties.safeAreaInsets?.bottom || 0

  // Based on time to wait for the drill to be ready
  const { elapsedTime, isComplete: isDrillReady, restart } = useTimer(waitTime)

  const ENEMY_HP = Math.max(0, monster.hp - tapsForEnemy)
  const DEFEATED_RATIO = (ENEMY_HP / monster.hp) * 100

  function generateNewMonster() {
    // Save stats for current defeated monster
    incrementMonsterKill(monster.type)
    const newMmonsterType = shuffleArray(
      // Exclude current monster type
      MONSTER_TYPES.filter((type) => type !== monster.type)
    ).at(0) as MonsterTypes

    setTapsForEnemy(0)
    setMonster({
      hp: 250 + Math.round(Math.random() * 170), // 250-420 HP
      name: getRandomMonsterName(newMmonsterType),
      type: newMmonsterType,
    })
  }

  const IS_ENEMY_DEFEATED = ENEMY_HP <= 0.5

  useEffect(() => {
    clearTimeout(monsterMutexTimer)
    if (IS_ENEMY_DEFEATED && tapsForEnemy > 2) {
      monsterMutexTimer = setTimeout(() => {
        playSound("cry")
        generateNewMonster()
      }, 75)
    }
  }, [IS_ENEMY_DEFEATED, tapsForEnemy])

  useEffect(() => {
    // Start bg sound after first tap
    // to avoid autoplay issues on mobile :)
    if (isGameStarted) playSound("bgx", "0.15", { loop: true })
  }, [isGameStarted])

  function _checkGameStarted() {
    // Game starts as soon as the user taps any game-related element
    if (!isGameStarted) setIsGameStarted(true)
  }

  function handleTap() {
    _checkGameStarted()

    const BASE_TAP = tapPowerCurve(multiplier) // Curve power from 1-6 based on multiplier
    // So users feel more the "difference" even for small upgrades

    const MAX_SINGLE_TAP = 3.5 // Reduce tap power

    const BIG_TAP =
      BASE_TAP +
      Math.round(
        Math.random() *
          (MAX_SINGLE_TAP *
            // Cap to 1.x multiplier
            Math.min(1.3, multiplier))
      )

    const rand = Math.random()
    const isBigTap = rand < 0.14 || rand > 0.86 // 14 - 28% big tap chance

    const DAMAGE = Math.round(
      // Cap to 2x multiplier's MAX damage
      multiplier * (isBigTap ? BIG_TAP : Math.min(2, BASE_TAP))
    )

    incrTapsGiven(DAMAGE)

    if (isBigTap) playSound("hitlong")

    const randomPop = 1 + Math.floor(Math.random() * 3)
    playSound(`pop${randomPop}` as any, "0.75")

    // Return the total damage dealt
    // Used inside different context/components
    return DAMAGE
  }

  function handleBladeTrigger() {
    // Early exit if already drilling
    if (isDrilling.active) return
    if (!isDrillReady) {
      playSound("error")
      return toast.error({
        title: "Blade is not ready",
      })
    }

    _checkGameStarted()

    playSound("cry")

    const [BLADE_MIN, BLADE_MAX] = damageRange
    const IMPACT =
      // Impact is a random value between BLADE_MIN and BLADE_MAX
      BLADE_MIN + Math.round(Math.random() * (BLADE_MAX - BLADE_MIN))
    setIsDrilling({
      active: true,
      impact: IMPACT,
    })

    // Add new key to trigger rotation animation
    setRotateKey((prev) => prev + 1)

    // Increment taps for enemy by the impact amount
    incrTapsGiven(IMPACT)

    // Vibrate on drill
    playSound("drill", "0.8")
    restart()
  }

  const PROFILE_IMAGE = (
    <figure
      style={{
        backgroundImage: `url(${user?.profilePictureUrl || "/marble.png"})`,
      }}
      className="size-11 bg-black bg-cover border-3 border-black shadow-lg rounded-2xl"
    />
  )

  const isAssetLoadComplete = Object.keys(MONSTER_ASSETS).every(
    (image) => loadedAsset[image]
  )

  return (
    <main
      className="flex max-w-xl mx-auto flex-col h-dvh overflow-hidden"
      style={{
        paddingBottom: `${safePaddingBottom}px`,
        backgroundColor: isAssetLoadComplete ? undefined : "white",
      }}
    >
      <div className="hidden">
        {Object.entries(MONSTER_ASSETS).map(([monsterType, image]) => {
          // Preload all monster images
          return (
            <Image
              priority
              onLoadingComplete={() =>
                setLoadedAsset((prev) => ({ ...prev, [monsterType]: true }))
              }
              key={`image-for-${monsterType}`}
              src={image}
              alt=""
            />
          )
        })}
      </div>

      {isAssetLoadComplete ? (
        <Fragment>
          <div className="bg-white flex flex-col flex-grow">
            <nav className="flex h-24 px-5 pt-5 items-start justify-between">
              <ModalTaps
                trigger={
                  <button className="text-left">
                    <strong className="text-2xl">
                      {tapsEarned <= 0
                        ? "NO."
                        : tapsEarned < 10
                        ? `0${Math.floor(tapsEarned)}`
                        : tapsEarned.toLocaleString("en-US", {
                            maximumFractionDigits: 3,
                          })}
                    </strong>
                    <p className="text-lg -mt-1.5 font-medium">TAPS</p>
                  </button>
                }
              />

              {isConnected ? (
                <ModalProfile
                  trigger={
                    <button className="flex flex-col items-end">
                      {PROFILE_IMAGE}
                      <div className="text-xs mt-1 font-semibold">
                        {user?.username ||
                          (address
                            ? beautifyAddress(address, 4, "")
                            : "Connected")}
                      </div>
                    </button>
                  }
                />
              ) : (
                <button
                  onClick={withTapSound(signIn)}
                  className="flex flex-col items-end"
                >
                  {PROFILE_IMAGE}
                  <div className="text-xs mt-1 font-semibold">Connect</div>
                </button>
              )}
            </nav>

            <ClickSpawn
              onTap={handleTap}
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

              <div
                style={{
                  transition: "transform 50ms ease-out",
                }}
                className="flex group-active:scale-[0.975] select-none flex-grow items-center justify-center"
              >
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
                  fragmentEmojis={getEmojiParticles(monster.type)}
                  explode={IS_ENEMY_DEFEATED}
                >
                  {DEFEATED_RATIO < 4 ? (
                    <EyesDead className="w-1/2 z-1 absolute left-1/4 bottom-1/4" />
                  ) : DEFEATED_RATIO < 37 ? (
                    <EyesAmazed className="w-1/2 z-1 absolute left-1/4 bottom-1/4" />
                  ) : (
                    <EyesMad className="w-1/2 z-1 absolute left-1/4 bottom-1/4" />
                  )}
                  <motion.div
                    animate={{
                      rotate: isDrilling.active
                        ? [0, -16, 0, -10, 0, -5, 0]
                        : [],
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                      times: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1],
                    }}
                  >
                    <Image
                      className="w-full"
                      src={MONSTER_ASSETS[monster.type]}
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
          </div>

          <nav className="bg-black shrink-0 z-1 px-4 pb-1 h-14 [&_*:not(.clipper)]:z-1 [&_*:not(.clipper)]:relative relative flex items-end justify-between">
            <div className="h-[125%] clipper bg-black rounded-t-[100%] absolute -inset-x-6 bottom-full"></div>

            <TriggerBlenderSetup />

            <section className="flex flex-col">
              <button
                onClick={handleBladeTrigger}
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
                {isDrillReady ? "READY" : `${waitTime - elapsedTime}s`}
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
                    {isMaxedOut ? (
                      <strong className="text-fs-purple">MAX</strong>
                    ) : (
                      <strong>x{multiplier.toFixed(1)}</strong>
                    )}
                  </button>
                }
              />
            </div>
          </nav>
        </Fragment>
      ) : (
        <div className="fixed inset-0 flex items-center justify-center">
          <p className="text-black/60 font-medium">Loading...</p>
        </div>
      )}
    </main>
  )
}

function getEmojiParticles(monsterType: MonsterTypes) {
  const emoji = (
    {
      fresa: "🍓",
      orange: "🍊",
      pineapple: "🍍",
      watermelon: "🍉",
    } satisfies Record<MonsterTypes, string>
  )[monsterType]

  return [emoji, "💥", "🍊", "🔥", emoji]
}
