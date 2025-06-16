"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useAtom } from "jotai"
import { cn } from "@/lib/utils"

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

import { MiniKit } from "@worldcoin/minikit-js"
import { useAudioMachine } from "@/lib/sounds"
import { shuffleArray } from "@/lib/arrays"
import { useWorldAuth } from "@radish-la/world-auth"
import { useToggleRouteOnActive } from "@/lib/window"

export default function ModalProfile({
  trigger,
}: {
  trigger: JSX.Element | null
}) {
  const TITLE = "Manage Profile"
  const [open, setOpen] = useState(false)
  const [brokeItemIndex, setBrokeItemIndex] = useState(0)

  const { address, signIn } = useWorldAuth()

  const { toast } = useToast()

  useToggleRouteOnActive({
    slug: "quests",
    isActive: open,
    onRouterBack: (e) => {
      e.preventDefault()
      setOpen(false)
    },
  })

  return (
    <Drawer open={open} onOpenChange={setOpen} height="full">
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}

      <DrawerContent>
        <VisuallyHidden>
          <DrawerTitle>{TITLE}</DrawerTitle>
        </VisuallyHidden>
        <Fragment>
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

          <div className="no-scrollbar flex flex-col gap-6 py-4 px-6 w-full overflow-auto grow"></div>
        </Fragment>
      </DrawerContent>
    </Drawer>
  )
}
