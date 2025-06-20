"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Helper function to toggle the route based on the active state.
 * This is useful for modals or drawers so we have a history state
 * and can go back to the previous state.
 */
export function useToggleRouteOnActive({
  slug,
  isActive,
  onRouterBack,
}: {
  slug: string
  isActive: boolean
  onRouterBack?: (e: PopStateEvent) => void
}) {
  const router = useRouter()

  useEffect(() => {
    if (isActive) {
      router.push(location.pathname + `#${slug}`, {
        scroll: false,
      })
    } else {
      router.replace(location.pathname, {
        scroll: false,
      })
    }

    const handleRouteChange = (e: PopStateEvent) => onRouterBack?.(e)
    window.addEventListener("popstate", handleRouteChange as any)
    return () => {
      window.removeEventListener("popstate", handleRouteChange as any)
    }
  }, [isActive, slug])
}

export const getHardwareType = () => {
  const isAndroid =
    typeof window !== "undefined" &&
    ["android", "Android"].some((v) => window[v as any])

  // Optimistically set for iOS
  return {
    isIOS: !isAndroid,
    isAndroid,
  }
}

export const useHardwareType = () => getHardwareType()

export const isAnyModalOpen = () =>
  Boolean(document.querySelector("[data-scroll-locked]"))
