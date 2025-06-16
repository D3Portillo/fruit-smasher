"use client"

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
  const [tapsEarned, setTapsEarned] = useTapsEarned()
  const { toast } = useToast()
  const { user, signIn, isConnected } = useWorldAuth()

  return (
    <AlertDialog>
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
        </AlertDialogDescription>
        <div className="my-2" />
        <AlertDialogFooter>
          <Button>
            {tapsEarned > 0
              ? `Claim ${numberToShortWords(tapsEarned)} TAPS`
              : "Got it"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
