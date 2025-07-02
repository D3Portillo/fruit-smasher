"use client"

import type { PropsWithChildren } from "react"
import { Eruda } from "./eruda-provider"
import { useWorldUser } from "@radish-la/world-auth"

const DEV_ADDRESS = "0x4c46f6d2314a41915324af999685ac447cbb79d9" as const
export const ErudaProvider = ({ children }: PropsWithChildren) => {
  const user = useWorldUser()

  if (
    process.env.NODE_ENV === "production" &&
    user?.walletAddress !== DEV_ADDRESS
  ) {
    // Do not render Eruda in production unless the user is the developer
    // This is a security measure to prevent exposing developer tools in production
    return children
  }

  return <Eruda>{children}</Eruda>
}
