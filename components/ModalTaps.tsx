"use client"

import { Fragment, PropsWithChildren, useEffect, useState } from "react"
import useSWR from "swr"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  useToast,
} from "@worldcoin/mini-apps-ui-kit-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

import { MiniKit } from "@worldcoin/minikit-js"
import { erc20Abi, formatEther, parseEther } from "viem"
import { getDispenserPayload } from "@/actions/dispenser"

import { useWorldAuth } from "@radish-la/world-auth"
import {
  MAX_WAIT_TIME,
  MIN_WAIT_TIME,
  useBladeLevels,
  useTapsEarned,
} from "@/lib/atoms/game"
import { useAudioMachine, useTapPopSound } from "@/lib/sounds"
import { numberToShortWords } from "@/lib/numbers"
import { worldClient } from "@/lib/world"

import { ADDRESS_DISPENSER, ADDRESS_TAPS } from "@/lib/constants"
import { ABI_DISPENSER } from "@/lib/abis"

import { GiFruitBowl } from "react-icons/gi"
import { BiSolidTime } from "react-icons/bi"
import { RiArrowLeftWideFill } from "react-icons/ri"

import { executeWorldPayment, MINI_APP_RECIPIENT } from "@/actions/payments"
import { MAX_TAPS_CAPACITY, useBlender } from "@/lib/atoms/blender"

import MainButton from "./MainButton"
import Blades from "./sprites/Blades"

const BLADE_TIME_REDUCE_PAYMENT = 1.3 // 1 WLD
export default function ModalTaps({ trigger }: { trigger?: React.ReactNode }) {
  const [section, setSection] = useState("claim")
  const [upgradeItemIndex, setUpgradeItemIndex] = useState(0)

  const [isOpen, setIsOpen] = useState(false)
  const [localStoredTaps] = useTapsEarned()

  const { toast } = useToast()
  const { signIn, address } = useWorldAuth()

  const { playSound } = useAudioMachine(["setup"])
  const { withTapSound } = useTapPopSound()

  const {
    setTapsCapacity,
    capacity,
    nextLevel: nextBlenderLevel,
    currentLevel: currentBlenderLevel,
  } = useBlender()

  const { data: balance = 0 } = useSWR(
    address ? `balance.taps.${address}.${isOpen}` : null,
    async () => {
      if (!address || !isOpen) return 0
      const balance = await worldClient.readContract({
        address: ADDRESS_TAPS,
        functionName: "balanceOf",
        abi: erc20Abi,
        args: [address],
      })

      return Number(formatEther(balance))
    }
  )

  const {
    incrementBladeLevel,
    isMaxedOut: isMaxedBlades,
    nextLevelData: nextBladeLevelData,
    currentLevelIndex: bladeLevelIndex,
    damageRange,
    setWaitTime,
    waitTime,
  } = useBladeLevels()

  const {
    data: claimedTAPS = 0,
    error,
    isLoading,
    isValidating,
  } = useSWR(
    // We revalidate anytime a new "tap" is earned
    address && isOpen ? `claimed.fs.${address}.${localStoredTaps}` : null,
    // Only fetch when the modal is open and address is available
    async () => {
      if (!address) return 0
      const claimed = await worldClient.readContract({
        address: ADDRESS_DISPENSER,
        functionName: "claimed",
        abi: ABI_DISPENSER,
        args: [address],
      })

      return Number(formatEther(claimed))
    }
  )

  const isSynced = !error && !isLoading && !isValidating

  const claimableTAPS = isSynced
    ? // Won't claim until syncing is done
      Math.max(0, localStoredTaps - claimedTAPS)
    : 0

  const isClaiming = claimableTAPS > 0

  const closeModal = () => setIsOpen(false)

  async function handleClaim() {
    if (!address) return signIn()
    // Close modal when nothing to claim
    if (!isClaiming) return closeModal()

    const { amount, deadline, signature } = await getDispenserPayload(address, {
      requestingAmount: claimableTAPS,
    })

    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          abi: ABI_DISPENSER,
          address: ADDRESS_DISPENSER,
          functionName: "claim",
          args: [amount, deadline, signature],
        },
      ],
    })

    if (finalPayload.status === "success") {
      toast.success({
        title: `Claimed ${numberToShortWords(claimableTAPS)} TAPS`,
      })
      // Close modal after successful claim
      return closeModal()
    }

    // Do not show error state if user denied the transaction
    // Only if there was an error when executing the transaction
    const isErrored = Boolean((finalPayload as any)?.details?.debugUrl)
    if (isErrored) {
      toast.error({
        title: "Failed. Please try again",
      })
    }
  }

  const UPGRADES = [
    {
      type: "blade-damage",
      isMaxed: isMaxedBlades,
      render() {
        return (
          <UpgradeItem
            key={`upgrade-item-${this.type}`}
            explainer={
              <Fragment>
                {" "}
                Increase the blade's{" "}
                <strong className="font-medium underline underline-offset-4">
                  TAPS power
                </strong>{" "}
                and deal more damage to fruits in each use.
              </Fragment>
            }
            iconImage={
              <Blades className="size-20 shrink-0 animate-[spin_6s_linear_infinite] text-black" />
            }
            title={
              <Fragment>
                🔩 Blades (
                {this.isMaxed ? (
                  <span className="text-fs-purple-pink">MAX</span>
                ) : (
                  `LVL ${bladeLevelIndex + 1}`
                )}
                )
              </Fragment>
            }
          >
            <p className="mt-1.5 text-sm text-black/60">
              <strong className="font-medium w-20 inline-block">
                {this.isMaxed ? "Damage" : "Current"}
              </strong>{" "}
              {damageRange[0]} - {damageRange[1]} TAPS
            </p>

            {this.isMaxed ? null : (
              <Fragment>
                <p className="mt-0.5 text-sm text-black/60">
                  <strong className="font-medium w-20 inline-block">
                    Next 🔰
                  </strong>{" "}
                  {nextBladeLevelData.damageRange[0]} -{" "}
                  {nextBladeLevelData.damageRange[1]} TAPS
                </p>

                <hr className="my-2 border border-black" />
                <p className="text-sm font-medium text-black">
                  <strong className="w-20 inline-block">COST</strong>{" "}
                  {nextBladeLevelData.costInTAPS.toLocaleString("en-US")} TAPS
                </p>
              </Fragment>
            )}
          </UpgradeItem>
        )
      },
      async tryUpgrade() {
        if (!address) return signIn()

        if (balance < nextBladeLevelData.costInTAPS) {
          return toast.error({
            title: "Insufficient TAPS Balance",
          })
        }

        const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
          transaction: [
            {
              abi: erc20Abi,
              address: ADDRESS_TAPS,
              functionName: "transfer",
              args: [
                MINI_APP_RECIPIENT,
                parseEther(nextBladeLevelData.costInTAPS.toString()),
              ],
            },
          ],
        })

        if (finalPayload.status === "success") {
          incrementBladeLevel()
          playSound("setup")
          toast.success({
            title: `Blades upgraded to LVL ${nextBladeLevelData.index + 1}`,
          })
        }
      },
    },
    {
      type: "blade-time",
      isMaxed: waitTime <= MIN_WAIT_TIME,
      render() {
        const { level, nextWaitTime, price } = this.data
        return (
          <UpgradeItem
            key={`upgrade-item-${this.type}`}
            title={
              <Fragment>
                ⏰ Blades (
                {waitTime <= MIN_WAIT_TIME ? (
                  <span className="text-fs-purple-pink">MAX</span>
                ) : (
                  `LVL ${level}`
                )}
                )
              </Fragment>
            }
            iconImage={
              <figure className="relative shrink-0">
                <Blades className="size-20 scale-90 shrink-0 text-black" />
                <div className="absolute scale-110 bg-gradient-to-br from-fs-green/20 to-fs-green/10 border-3 border-black rounded-full inset-0 grid place-items-center">
                  <BiSolidTime className="text-black" />
                </div>
              </figure>
            }
            explainer={
              <Fragment>
                Reduce the{" "}
                <strong className="font-medium underline underline-offset-4">
                  time to wait
                </strong>{" "}
                for the blades to be ready for use.
              </Fragment>
            }
          >
            <p className="mt-1.5 text-sm text-black/60">
              <strong className="font-medium whitespace-nowrap w-20 inline-block">
                Wait Time
              </strong>{" "}
              {waitTime}s
            </p>

            {this.isMaxed ? null : (
              <Fragment>
                <p className="mt-0.5 text-sm text-black/60">
                  <strong className="font-medium w-20 inline-block">
                    Next 🔰
                  </strong>{" "}
                  {nextWaitTime}s
                </p>

                <hr className="my-2 border border-black" />

                <p className="text-sm font-medium text-black">
                  <strong className="w-20 inline-block">COST</strong>
                  {price} WLD
                </p>
              </Fragment>
            )}
          </UpgradeItem>
        )
      },
      get data() {
        const level = 1 + (MAX_WAIT_TIME - waitTime)
        return {
          level,
          nextWaitTime: Math.max(MIN_WAIT_TIME, waitTime - 1),
          price: Number(Number(level * BLADE_TIME_REDUCE_PAYMENT).toFixed(2)),
        }
      },
      async tryUpgrade() {
        if (!address) return signIn()

        const { nextWaitTime, price } = this.data
        const TITLE = `Blades wait time reduced to ${nextWaitTime}s`
        const result = await executeWorldPayment({
          amount: price,
          initiatorAddress: address,
          paymentDescription: TITLE,
          token: "WLD",
        })

        if (result?.status === "success") {
          setWaitTime(nextWaitTime)
          toast.success({
            title: TITLE,
          })
        }
      },
    },
    {
      type: "blender-amount",
      isMaxed: capacity >= MAX_TAPS_CAPACITY,
      render() {
        return (
          <UpgradeItem
            key={`upgrade-item-${this.type}`}
            explainer={
              <Fragment>
                Increase blender's TAPS capacity and{" "}
                <strong className="font-medium underline underline-offset-4">
                  collect more
                </strong>{" "}
                tokens when idle.
              </Fragment>
            }
            title={
              <Fragment>
                🍱 Blender (
                {this.isMaxed ? (
                  <span className="text-fs-purple-pink">MAX</span>
                ) : (
                  `LVL ${currentBlenderLevel}`
                )}
                )
              </Fragment>
            }
            iconImage={
              <figure className="size-20 shrink-0 scale-110 border-3 border-black bg-fs-green rounded-full grid place-items-center">
                <GiFruitBowl className="text-5xl scale-105 text-black" />
              </figure>
            }
          >
            <p className="mt-1.5 text-sm text-black/60">
              <strong className="font-medium w-20 inline-block">
                Capacity
              </strong>{" "}
              {capacity.toLocaleString("en-US")} TAPS
            </p>

            {this.isMaxed ? null : (
              <Fragment>
                <p className="mt-0.5 text-sm text-black/60">
                  <strong className="font-medium w-20 inline-block">
                    Next 🔰
                  </strong>{" "}
                  {nextBlenderLevel.capacity.toLocaleString("en-US")} TAPS
                </p>

                <hr className="my-2 border border-black" />

                <p className="text-sm font-medium text-black">
                  <strong className="w-20 inline-block">COST</strong>{" "}
                  {nextBlenderLevel.costInWLD.toLocaleString("en-US")} WLD
                </p>
              </Fragment>
            )}
          </UpgradeItem>
        )
      },
      async tryUpgrade() {
        if (!address) return signIn()
        const TITLE = `Blender upgraded to LVL ${currentBlenderLevel + 1}`
        const result = await executeWorldPayment({
          amount: nextBlenderLevel.costInWLD,
          initiatorAddress: address,
          paymentDescription: TITLE,
          token: "WLD",
        })

        if (result?.status === "success") {
          setTapsCapacity(nextBlenderLevel.capacity)
          toast.success({
            title: TITLE,
          })
        }
      },
    },
  ]

  const UPGRADE = UPGRADES[upgradeItemIndex]

  useEffect(() => {
    if (isOpen) {
      // Reset section to "claim" when modal opens
      setSection("claim")
    }
  }, [isOpen])

  useEffect(() => {
    // Reset upgrade item index when section changes
    setUpgradeItemIndex(0)
  }, [section])

  function handleNextUpgradeItem() {
    const isOffSet = upgradeItemIndex === UPGRADES.length - 1
    setUpgradeItemIndex(
      // Circular navigation
      isOffSet ? 0 : upgradeItemIndex + 1
    )
  }

  function handlePreviousUpgradeItem() {
    const isOffSet = upgradeItemIndex === 0
    setUpgradeItemIndex(
      // Circular navigation
      isOffSet ? UPGRADES.length - 1 : upgradeItemIndex - 1
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger onClick={withTapSound()} asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <Tabs value={section} onValueChange={setSection}>
          <Fragment>
            <AlertDialogHeader aria-role="header">
              <h2 className="text-2xl font-semibold">Manage TAPS</h2>
            </AlertDialogHeader>

            <nav className="-mx-8 -mt-2 mb-4 px-8">
              <TabsList className="grid grid-cols-2 border-b border-b-black/7">
                <TabsTrigger
                  onClick={withTapSound()}
                  className="border-b-3 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
                  value="claim"
                >
                  Claim
                </TabsTrigger>

                <TabsTrigger
                  onClick={withTapSound()}
                  className="border-b-3 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
                  value="upgrade"
                >
                  Upgrades
                </TabsTrigger>
              </TabsList>
            </nav>

            <TabsContent asChild value="claim">
              <Fragment>
                <AlertDialogDescription className="mb-4 min-h-[28vh]">
                  <p>
                    <strong className="font-medium">TAPS</strong> total supply
                    represent the number of times a human-being has clicked/tap
                    the screen to smash a fruit monster in the Mini App.
                  </p>

                  {claimedTAPS > 0 && (
                    <p className="mt-3 font-semibold text-black">
                      💎 Claimed: {numberToShortWords(claimedTAPS)} TAPS
                    </p>
                  )}
                </AlertDialogDescription>

                <div className="py-2" />

                <AlertDialogFooter>
                  <MainButton onClick={handleClaim}>
                    {isClaiming
                      ? `Claim ${numberToShortWords(claimableTAPS)} TAPS`
                      : "Got it"}
                  </MainButton>
                </AlertDialogFooter>
              </Fragment>
            </TabsContent>

            <TabsContent asChild value="upgrade">
              <section className="relative w-full">
                <AlertDialogDescription
                  asChild
                  className="mb-4 -mx-9 min-h-[28vh]"
                >
                  <div className="flex">
                    <button
                      onClick={withTapSound(handlePreviousUpgradeItem)}
                      className="shrink-0 w-10 pl-1 pt-16 rounded-2xl flex items-start justify-center"
                    >
                      <RiArrowLeftWideFill className="text-black scale-150" />
                    </button>

                    {UPGRADE.render()}

                    <button
                      onClick={withTapSound(handleNextUpgradeItem)}
                      className="shrink-0 w-10 pr-1 pt-16 rounded-2xl flex items-start justify-center"
                    >
                      <RiArrowLeftWideFill className="rotate-180 text-black scale-150" />
                    </button>
                  </div>
                </AlertDialogDescription>

                <div className="py-2" />

                <AlertDialogFooter>
                  <MainButton
                    onClick={
                      UPGRADE.isMaxed
                        ? closeModal
                        : UPGRADE.tryUpgrade.bind(UPGRADE)
                    }
                  >
                    {UPGRADE.isMaxed
                      ? "Continue playing"
                      : UPGRADE.type.includes("blade")
                      ? "Upgrade Blades"
                      : "Upgrade Blender"}
                  </MainButton>
                </AlertDialogFooter>
              </section>
            </TabsContent>
            <p className="text-xs -mb-3 text-center text-black/60 mt-4">
              Token balance: {balance.toLocaleString("en-US")} TAPS
            </p>
          </Fragment>
        </Tabs>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function UpgradeItem({
  explainer,
  title,
  children,
  iconImage,
}: PropsWithChildren<{
  title: JSX.Element | string
  explainer: JSX.Element | string
  iconImage: JSX.Element
}>) {
  return (
    <div className="flex-grow">
      <div className="flex min-h-[9rem] gap-8 py-3 px-5 border-3 border-black rounded-2xl items-center">
        <div className="shrink-0">{iconImage}</div>

        <div className="w-full">
          <h2 className="text-lg whitespace-nowrap text-black font-semibold">
            {title}
          </h2>

          {children}
        </div>
      </div>

      <p className="mt-3 max-w-[16rem] mx-auto text-xs text-center">
        {explainer}
      </p>
    </div>
  )
}
