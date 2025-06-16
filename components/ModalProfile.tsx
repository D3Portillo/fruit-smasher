"use client"

import type { MonsterTypes } from "@/lib/game"

import { useState } from "react"
import Image, { type StaticImageData } from "next/image"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  TopBar,
  useToast,
} from "@worldcoin/mini-apps-ui-kit-react"
import { XMark } from "@/components/icons"

import { useWorldAuth } from "@radish-la/world-auth"
import { useToggleRouteOnActive } from "@/lib/window"

import asset_fresa from "@/assets/fresa.png"
import asset_pineapple from "@/assets/pineapple.png"
import asset_watermelon from "@/assets/watermelon.png"
import asset_orange from "@/assets/orange.png"

export const MONSTER_ASSETS = {
  fresa: asset_fresa,
  pineapple: asset_pineapple,
  watermelon: asset_watermelon,
  orange: asset_orange,
} satisfies Record<MonsterTypes, StaticImageData>

export default function ModalProfile({
  trigger,
}: {
  trigger: JSX.Element | null
}) {
  const TITLE = "Manage Profile"
  const [open, setOpen] = useState(false)
  const { signOut } = useWorldAuth()

  useToggleRouteOnActive({
    slug: "quests",
    isActive: open,
    onRouterBack: (e) => {
      e.preventDefault()
      setOpen(false)
    },
  })

  function handleLogout() {
    signOut()
    setOpen(false)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} height="full">
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}

      <DrawerContent>
        <VisuallyHidden>
          <DrawerTitle>{TITLE}</DrawerTitle>
        </VisuallyHidden>
        <TopBar
          title={TITLE}
          startAdornment={
            <DrawerClose asChild>
              <Button variant="tertiary" size="icon">
                <XMark />
              </Button>
            </DrawerClose>
          }
        />

        <div className="no-scrollbar flex flex-col gap-4 mt-4 px-6 w-full overflow-auto grow">
          {Object.entries(MONSTER_ASSETS).map(([monsterType, image]) => {
            return (
              <div className="border-3 border-black rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <figure className="rounded-2xl overflow-hidden flex items-center justify-center p-4 size-24 border-3 border-black bg-white">
                    <Image placeholder="blur" src={image} alt="" />
                  </figure>
                  <div className="text-lg font-semibold capitalize">
                    {monsterType}s Terminated
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="px-6 mt-4 shrink-0 pb-6">
          <Button onClick={handleLogout} className="w-full">
            Disconnect
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
