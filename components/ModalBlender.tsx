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

export default function ModalBlender({
  trigger,
}: {
  trigger?: React.ReactNode
}) {
  const { toast } = useToast()
  const { user, signIn, isConnected } = useWorldAuth()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">
            Smash those fruits while away
          </h2>
        </AlertDialogHeader>

        <AlertDialogDescription className="mb-4">
          <p>
            Setup the blender to automatically smash fruits while you are not
            active in the game. Come back to claim your earned TAPS.
          </p>
        </AlertDialogDescription>
        <div className="my-2" />
        <AlertDialogFooter>
          <Button>Setup Blender</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
