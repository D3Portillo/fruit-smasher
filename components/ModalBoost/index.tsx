"use client"

import { Fragment, useState } from "react"

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
import MainButton from "@/components/MainButton"

import { useWorldAuth } from "@radish-la/world-auth"
import { useTapMultiplier } from "@/lib/atoms/game"
import { useTapPopSound } from "@/lib/sounds"
import { executeWorldPayment } from "@/actions/payments"
import { calculatePriceForNextMultiplier } from "./internals"

const BASE_PURCHAGE_MULTIPLIER = 0.1 // 0.1x extra taps per second (TPS)
export const MAX_MULTIPLIER = 2.5 // Maximum multiplier cap

export default function ModalBoost({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const { toast } = useToast()
  const { signIn, address } = useWorldAuth()
  const { multiplier, setMultiplier } = useTapMultiplier()
  const { withTapSound } = useTapPopSound()

  const isMaxedOut = multiplier >= MAX_MULTIPLIER
  const NEXT = multiplier + BASE_PURCHAGE_MULTIPLIER
  const PRICE = calculatePriceForNextMultiplier(NEXT)

  async function handleUpgrade() {
    if (!address) return signIn()
    if (isMaxedOut) return

    const result = await executeWorldPayment({
      amount: PRICE,
      initiatorAddress: address,
      paymentDescription: `Upgradem ultiplier to ${NEXT.toFixed(1)}`,
      token: "WLD",
    })

    if (result?.status === "success") {
      setMultiplier(NEXT)
      toast.success({
        title: `Upgraded to x${NEXT.toFixed(1)} ✨`,
      })

      // Close modal after successful upgrade
      setIsOpen(false)
    }
  }

  const ActionContainer = isMaxedOut ? AlertDialogClose : Fragment

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger onClick={withTapSound()} asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">Damage Boost</h2>
        </AlertDialogHeader>

        <AlertDialogDescription className="mb-4">
          {isMaxedOut ? (
            <p>
              <strong>MaxLevel Reached (2.5) 🚀.</strong> You have upgraded DPT
              to the maximum level.
            </p>
          ) : (
            <p>
              You can upgrade your Damage Per Tap (DPT) to increase the damage
              dealt to fruits in a single tap.
            </p>
          )}

          {isMaxedOut ? null : (
            <p className="mt-2 font-semibold text-black">
              Next level: x{NEXT.toFixed(1)} ✨
            </p>
          )}
        </AlertDialogDescription>
        <div className="my-2" />
        <AlertDialogFooter>
          <ActionContainer>
            <MainButton onClick={handleUpgrade}>
              {isMaxedOut ? "Got it" : `Upgrade (${PRICE} WLD)`}
            </MainButton>
          </ActionContainer>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
