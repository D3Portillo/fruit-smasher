"use client"

import { Fragment } from "react"

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
import { useTapMultiplier } from "@/lib/atoms/game"
import { executeWorldPayment } from "@/actions/payments"

const BASE_PURCHAGE_MULTIPLIER = 0.1 // 0.1x extra taps per second (TPS)
export const MAX_MULTIPLIER = 2.5 // Maximum multiplier cap
const PRICE_PER_UPGRADE = 1 // 1 WLD per upgrade

export default function ModalBoost({ trigger }: { trigger?: React.ReactNode }) {
  const { toast } = useToast()
  const { signIn, address } = useWorldAuth()
  const { multiplier, setMultiplier } = useTapMultiplier()

  const isMaxedOut = multiplier >= MAX_MULTIPLIER
  const NEXT = multiplier + BASE_PURCHAGE_MULTIPLIER

  async function handleUpgrade() {
    if (!address) return signIn()
    if (isMaxedOut) return

    const result = await executeWorldPayment({
      amount: PRICE_PER_UPGRADE,
      initiatorAddress: address,
      paymentDescription: `Upgradem ultiplier to ${NEXT.toFixed(1)}`,
      token: "WLD",
    })

    if (result?.status === "success") {
      setMultiplier(NEXT)
      toast.success({
        title: `Upgraded to x${NEXT.toFixed(1)} ✨`,
      })
    }
  }

  const ActionContainer = isMaxedOut ? AlertDialogClose : Fragment

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">Damage Boost</h2>
        </AlertDialogHeader>

        <AlertDialogDescription className="mb-4">
          {isMaxedOut ? (
            <p>
              <strong>MaxLevel Reached (2.5) 🚀.</strong> You have upgraded the
              TPS to the maximum you can deal with fruit monsters.
            </p>
          ) : (
            <p>
              You can upgrade your Taps per second (TPS) to increase the total
              damage per tap you deal with fruits.
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
            <Button className="w-full" onClick={handleUpgrade}>
              {isMaxedOut ? "Got it" : `Upgrade (${PRICE_PER_UPGRADE} WLD)`}
            </Button>
          </ActionContainer>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
