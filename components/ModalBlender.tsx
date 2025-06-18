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
import { useTapPopSound } from "@/lib/sounds"

export default function ModalBlender({
  trigger,
}: {
  trigger?: React.ReactNode
}) {
  const { toast } = useToast()
  const { withTapSound } = useTapPopSound()
  const { user, signIn, isConnected } = useWorldAuth()

  function handleSetupBlender() {
    toast.error({
      title: "Feature not available yet",
    })
  }

  return (
    <AlertDialog>
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
          <Button onClick={handleSetupBlender}>Setup Blender</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
