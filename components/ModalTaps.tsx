"use client"

import { useState } from "react"
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

import { MiniKit } from "@worldcoin/minikit-js"
import { formatEther } from "viem"
import { getDispenserPayload } from "@/actions/dispenser"

import { useWorldAuth } from "@radish-la/world-auth"
import { useTapsEarned } from "@/lib/atoms/game"
import { useTapPopSound } from "@/lib/sounds"
import { numberToShortWords } from "@/lib/numbers"
import { worldClient } from "@/lib/world"

import { ADDRESS_DISPENSER } from "@/lib/constants"
import { ABI_DISPENSER } from "@/lib/abis"

import MainButton from "./MainButton"
import ChildrenWrapper from "./ChildrenWrapper"

export default function ModalTaps({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [localStoredTaps] = useTapsEarned()
  const { toast } = useToast()
  const { signIn, address } = useWorldAuth()
  const { withTapSound } = useTapPopSound()

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

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger onClick={withTapSound()} asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">Earned TAPS</h2>
        </AlertDialogHeader>

        <AlertDialogDescription className="mb-4">
          <p>
            <strong>TAPS</strong> total supply represents the number of times a
            human-person has clicked in the screen to smash a fruit monster in
            Worldchain.
          </p>

          {claimedTAPS > 0 && (
            <p className="mt-3 font-semibold text-black">
              💎 Claimed: {numberToShortWords(claimedTAPS)} TAPS
            </p>
          )}
        </AlertDialogDescription>
        <div className="my-2" />
        <AlertDialogFooter>
          <ActionContainer asChild>
            <MainButton
              onClick={isClaiming ? handleClaim : undefined}
              className="w-full"
            >
              {isClaiming
                ? `Claim ${numberToShortWords(claimableTAPS)} TAPS`
                : "Got it"}
            </MainButton>
          </ActionContainer>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
