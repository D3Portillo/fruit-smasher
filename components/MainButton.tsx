"use client"

import type { PropsWithChildren } from "react"
import type { ButtonProps } from "@worldcoin/mini-apps-ui-kit-react/Button"

import { cn } from "@/lib/utils"
import { useTapPopSound } from "@/lib/sounds"
import { Button } from "@worldcoin/mini-apps-ui-kit-react"

export default function MainButton({
  children,
  variant,
  className,
  onClick,
  size,
}: PropsWithChildren<{
  className?: string
  onClick?: () => void
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}>) {
  const { withTapSound } = useTapPopSound()

  return (
    <Button
      onClick={withTapSound(onClick)}
      className={cn("w-full", className)}
      variant={variant}
      size={size}
    >
      {children}
    </Button>
  )
}
