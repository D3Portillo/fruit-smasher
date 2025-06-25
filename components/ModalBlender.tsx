"use client"

import { useState } from "react"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@worldcoin/mini-apps-ui-kit-react"

import { useWorldAuth } from "@radish-la/world-auth"
import { useTapPopSound } from "@/lib/sounds"
import { useBlender } from "@/lib/atoms/blender"

import MainButton from "./MainButton"
import { executeWorldPayment } from "@/actions/payments"

export default function ModalBlender({
  trigger,
}: {
  trigger?: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  const { withTapSound } = useTapPopSound()
  const { setupBlender, isSetup, collect, availableTaps } = useBlender()
  const { address, signIn } = useWorldAuth()

  async function handleSetupBlender() {
    if (!address) return signIn()
    if (!isSetup) {
      const result = await executeWorldPayment({
        amount: 1, // 1 WLD to setup the blender
        initiatorAddress: address,
        paymentDescription: `Initialize fruit blender`,
        token: "WLD",
      })

      if (result?.status === "success") {
        setupBlender()
      }

      // Don't continue with conditional branching
      return
    }

    if (availableTaps > 0) return collect()
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger onClick={withTapSound()} asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">Fruit Blender 🍑</h2>
        </AlertDialogHeader>

        <AlertDialogDescription className="mb-4">
          <p>
            You can configure the blender to automatically smash fruits while
            not active in the tap game. Login anytime to claim your earned TAPS.
          </p>
        </AlertDialogDescription>
        <div className="my-2" />
        <AlertDialogFooter>
          <MainButton onClick={handleSetupBlender}>
            {address
              ? isSetup
                ? availableTaps > 0
                  ? `Collect ${availableTaps.toLocaleString("en-US")} TAPS`
                  : "Continue playing"
                : "Setup Blender"
              : "Connet Wallet"}
          </MainButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
