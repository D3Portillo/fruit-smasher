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

export default function ModalTaps({ trigger }: { trigger?: React.ReactNode }) {
  const { toast } = useToast()
  const { user, signIn, isConnected } = useWorldAuth()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">Claim your TAPS</h2>
        </AlertDialogHeader>

        <AlertDialogDescription className="mb-4">
          <p>
            TAPS is a token that represents the total number of times a person
            in Worldchain has clicked in the screen to kill a monster.
          </p>
        </AlertDialogDescription>
        <div className="my-2" />
        <AlertDialogFooter>
          <Button>Claim TAPS</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
