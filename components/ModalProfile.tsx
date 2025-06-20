"use client"

import type { MonsterTypes } from "@/lib/game"

import { useState } from "react"
import Image, { type StaticImageData } from "next/image"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

import {
  AlertDialogClose,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  TopBar,
} from "@worldcoin/mini-apps-ui-kit-react"
import { XMark } from "@/components/icons"

import { beautifyAddress } from "@/lib/utils"
import { useWorldAuth } from "@radish-la/world-auth"
import { useToggleRouteOnActive } from "@/lib/window"
import { useTotalKilledMonsters } from "@/lib/atoms/game"
import { useTapPopSound } from "@/lib/sounds"

import { TbLogout } from "react-icons/tb"
import MainButton from "./MainButton"

import asset_fresa from "@/assets/fresa.svg"
import asset_pineapple from "@/assets/pineapple.svg"
import asset_watermelon from "@/assets/watermelon.svg"
import asset_orange from "@/assets/orange.svg"

export const MONSTER_ASSETS = {
  fresa: asset_fresa,
  pineapple: asset_pineapple,
  watermelon: asset_watermelon,
  orange: asset_orange,
} as Record<MonsterTypes, StaticImageData>

export default function ModalProfile({ trigger }: { trigger?: JSX.Element }) {
  const TITLE = "Manage Profile"
  const [open, setOpen] = useState(false)
  const { killedMonsters } = useTotalKilledMonsters()
  const { signOut, user, address } = useWorldAuth()
  const { withTapSound } = useTapPopSound()

  useToggleRouteOnActive({
    slug: "quests",
    isActive: open,
    onRouterBack: (e) => {
      e.preventDefault()
      setOpen(false)
    },
  })

  function handleTelegram() {
    window.open("https://t.me/+1Su2YALGyFJjNGU5", "_blank", "noopener")
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} height="full">
      {trigger && (
        <DrawerTrigger onClick={withTapSound()} asChild>
          {trigger}
        </DrawerTrigger>
      )}

      <DrawerContent>
        <VisuallyHidden>
          <DrawerTitle>{TITLE}</DrawerTitle>
        </VisuallyHidden>
        <TopBar
          title={TITLE}
          endAdornment={
            <DrawerClose asChild>
              <MainButton variant="tertiary" size="icon">
                <XMark />
              </MainButton>
            </DrawerClose>
          }
        />

        <div className="mx-6 my-3">
          <div className="border-3 bg-gradient-to-bl from-fs-purple/10 to-fs-purple/20 flex items-center gap-2 border-black rounded-2xl py-3 pl-3 pr-4">
            <figure
              style={{
                backgroundImage: `url(${
                  user?.profilePictureUrl || "/marble.png"
                })`,
              }}
              className="size-11 bg-black bg-cover border-3 border-black shadow-lg rounded-2xl"
            />
            <div className="flex-grow">
              <div className="text-xs">Connected Wallet</div>
              <div className="text-sm font-semibold">
                {address ? beautifyAddress(address, 7) : "Not connected"}
              </div>
            </div>

            <button onClick={signOut} className="text-2xl">
              <TbLogout />
            </button>
          </div>
        </div>

        <div className="flex items-center h-10 relative">
          <div className="h-[2px] bg-black w-full" />
          <strong className="absolute px-4 bg-white top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
            GAME STATS
          </strong>
        </div>

        <div className="no-scrollbar relative grid grid-cols-1 gap-4 px-6 w-full overflow-auto">
          <div className="w-full -mb-4 sticky z-1 bg-gradient-to-b from-white/100 to-white/0 h-4 top-0" />

          {Object.entries(MONSTER_ASSETS).map(([monsterType, image]) => {
            return (
              <div
                key={`total-for-${monsterType}`}
                className="border-3 flex items-center gap-2 border-black rounded-2xl py-3 pl-3 pr-5"
              >
                <figure className="rounded-xl shrink-0 overflow-hidden flex items-center justify-center size-11 drop-shadow p-1 bg-gradient-to-br from-fs-purple to-fs-green">
                  <Image src={image} alt="" />
                </figure>
                <div className="text-sm leading-none font-semibold capitalize">
                  {monsterType}s Smashed
                </div>

                <div className="flex-grow" />
                <p className="text-xl font-semibold">
                  {(
                    killedMonsters[monsterType as MonsterTypes] || 0
                  ).toLocaleString("en-US")}
                </p>
              </div>
            )
          })}

          <div className="w-full -mt-4 sticky z-1 bg-gradient-to-t from-white/100 to-white/0 h-4 bottom-0" />
        </div>

        <div className="flex items-center h-10 relative">
          <div className="h-[2px] bg-black w-full" />
          <strong className="absolute px-4 bg-white top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
            SOCIALS & MORE
          </strong>
        </div>

        <div className="flex-grow" />
        <div className="px-6 flex flex-col gap-4 mt-4 shrink-0 pb-6">
          <MainButton variant="secondary" onClick={handleTelegram}>
            Join Telegram
          </MainButton>
          <AlertDialogClose asChild>
            <MainButton>Return to game</MainButton>
          </AlertDialogClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
