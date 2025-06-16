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
  Button,
  useToast,
} from "@worldcoin/mini-apps-ui-kit-react"

import { useWorldAuth } from "@radish-la/world-auth"
import { useTapsEarned } from "@/lib/atoms/game"
import { numberToShortWords } from "@/lib/numbers"

export default function ModalTaps({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [localStoredTaps] = useTapsEarned()
  const { toast } = useToast()
  const { signIn, address } = useWorldAuth()

  const { data: claimedTAPS = 0 } = useSWR(
    address && isOpen ? `claimed.fs.${address}` : null,
    // Only fetch when the modal is open and address is available
    async () => {
      // TODO: Check for the claimed balance from the Smart Contract
      return 0
    }
  )

  const claimableTAPS = Math.max(0, localStoredTaps - claimedTAPS)
  const isClaiming = claimableTAPS > 0
  const ActionContainer = isClaiming ? Fragment : AlertDialogClose

  function handleClaim() {
    if (!address) return signIn()
    toast.success({
      title: `Claimed ${numberToShortWords(claimableTAPS)} TAPS`,
    })
  }

  return (
    <AlertDialog onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
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
            <Button
              onClick={isClaiming ? handleClaim : undefined}
              className="w-full"
            >
              {isClaiming
                ? `Claim ${numberToShortWords(claimableTAPS)} TAPS`
                : "Got it"}
            </Button>
          </ActionContainer>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
