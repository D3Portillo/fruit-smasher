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

export default function ModalBoost({ trigger }: { trigger?: React.ReactNode }) {
  const { toast } = useToast()
  const { user, signIn, isConnected } = useWorldAuth()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">Boost your TPS</h2>
        </AlertDialogHeader>

        <AlertDialogDescription className="mb-4">
          <p>
            Upgrade your Taps per second (TPS) to increase the total damage per
            tap you deal with monsters.
          </p>

          <p className="mt-2 font-semibold text-black">Next level: x1.1 ✨</p>
        </AlertDialogDescription>
        <div className="my-2" />
        <AlertDialogFooter>
          <Button>Upgrade (1 WLD)</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
