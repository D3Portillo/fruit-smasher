"use client"

import { Fragment, useState } from "react"
import useSWR from "swr"

import {
  AlertDialog,
  AlertDialogClose,
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
import { useBladeLevels, useTapsEarned } from "@/lib/atoms/game"
import { useAudioMachine, useTapPopSound } from "@/lib/sounds"
import { numberToShortWords } from "@/lib/numbers"
import { worldClient } from "@/lib/world"

import { ADDRESS_DISPENSER, ADDRESS_TAPS } from "@/lib/constants"
import { ABI_DISPENSER } from "@/lib/abis"

import MainButton from "./MainButton"
import ChildrenWrapper from "./ChildrenWrapper"
import Blades from "./sprites/Blades"
import { MINI_APP_RECIPIENT } from "@/actions/payments"

export default function ModalTaps({ trigger }: { trigger?: React.ReactNode }) {
  const [section, setSection] = useState("claim")
  const [isOpen, setIsOpen] = useState(false)
  const [localStoredTaps] = useTapsEarned()

  const { toast } = useToast()
  const { signIn, address } = useWorldAuth()

  const { playSound } = useAudioMachine(["setup"])
  const { withTapSound } = useTapPopSound()

  const { data: balance = 0 } = useSWR(
    address ? `balance.taps.${address}` : null,
    async () => {
      if (!address) return 0
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
    nextLevelData,
    currentLevelIndex,
    damageRange,
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
  const isClaiming = section === "claim" && claimableTAPS > 0
  const ActionContainer = isClaiming ? ChildrenWrapper : AlertDialogClose

  async function handleClaim() {
    if (!address) return signIn()

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
      return setIsOpen(false)
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

  async function handleUpgrade() {
    if (!address) return signIn()

    if (balance < nextLevelData.costInTAPS) {
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
            parseEther(nextLevelData.costInTAPS.toString()),
          ],
        },
      ],
    })

    if (finalPayload.status === "success") {
      incrementBladeLevel()
      playSound("setup")
      toast.success({
        title: `Blades upgraded to LVL ${nextLevelData.index + 1}`,
      })

      // Close modal after successful upgrade
      setIsOpen(false)
    }
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
              <TabsList className="border-b grid grid-cols-2 border-b-black/3">
                <TabsTrigger
                  className="border-b-2 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
                  value="claim"
                >
                  Claim
                </TabsTrigger>

                <TabsTrigger
                  className="border-b-2 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
                  value="upgrade"
                >
                  Upgrades
                </TabsTrigger>
              </TabsList>
            </nav>

            <TabsContent asChild value="claim">
              <Fragment>
                <AlertDialogDescription className="mb-4">
                  <p>
                    <strong>TAPS</strong> total supply represents the number of
                    times a human-person has clicked in the screen to smash a
                    fruit monster in Worldchain.
                  </p>

                  {claimedTAPS > 0 && (
                    <p className="mt-3 font-semibold text-black">
                      💎 Claimed: {numberToShortWords(claimedTAPS)} TAPS
                    </p>
                  )}
                </AlertDialogDescription>

                <div className="py-2" />

                <AlertDialogFooter>
                  <ActionContainer asChild>
                    <MainButton onClick={isClaiming ? handleClaim : undefined}>
                      {isClaiming
                        ? `Claim ${numberToShortWords(claimableTAPS)} TAPS`
                        : "Got it"}
                    </MainButton>
                  </ActionContainer>
                </AlertDialogFooter>
              </Fragment>
            </TabsContent>

            <TabsContent asChild value="upgrade">
              <Fragment>
                <AlertDialogDescription className="mb-4">
                  <p>
                    Increase the Blade's TAPS power and deal more damage to
                    fruits in each use.
                  </p>

                  <div className="flex gap-4 p-3 border-3 border-black rounded-2xl mt-4 items-center justify-evenly">
                    <Blades className="size-20 animate-[spin_6s_linear_infinite] text-black" />
                    <div className="whitespace-nowrap">
                      <p className="text-lg text-black font-semibold">
                        Blades{" "}
                        {isMaxedBlades
                          ? `(MAX)`
                          : `(LVL ${currentLevelIndex + 1})`}
                      </p>

                      <p className="mt-1.5 text-sm text-black/60">
                        <strong className="font-medium w-16 inline-block">
                          {isMaxedBlades ? "Damage" : "Current"}
                        </strong>{" "}
                        {damageRange[0]} - {damageRange[1]} TAPS
                      </p>

                      {isMaxedBlades ? null : (
                        <Fragment>
                          <p className="mt-0.5 text-sm text-black/60">
                            <strong className="font-medium w-16 inline-block">
                              Next 🔰
                            </strong>{" "}
                            {nextLevelData.damageRange[0]} -{" "}
                            {nextLevelData.damageRange[1]} TAPS
                          </p>

                          <hr className="my-2" />

                          <p className="text-sm text-black/60">
                            <strong className="font-medium w-16 inline-block">
                              Cost
                            </strong>{" "}
                            {nextLevelData.costInTAPS.toLocaleString("en-US")}{" "}
                            TAPS
                          </p>
                        </Fragment>
                      )}
                    </div>
                  </div>
                </AlertDialogDescription>

                <div className="py-2" />

                <AlertDialogFooter>
                  <MainButton
                    onClick={isMaxedBlades ? undefined : handleUpgrade}
                  >
                    {isMaxedBlades ? "Continue playing" : "Upgrade Blades"}
                  </MainButton>
                </AlertDialogFooter>
              </Fragment>
            </TabsContent>
          </Fragment>
        </Tabs>
      </AlertDialogContent>
    </AlertDialog>
  )
}
