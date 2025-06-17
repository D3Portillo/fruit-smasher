"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const vibrate = (pattern?: number | number[]) => {
  // Default to a short 50ms vibration if no pattern provided
  const defaultPattern = 50

  // Check if vibration is supported
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern || defaultPattern)
    return true
  }

  return false // Vibration not supported
}

export const VIBRATES = {
  tap: () => vibrate(50), // Quick tap
  doubleTap: () => vibrate([50, 50, 50]), // Double buzz
  success: () => vibrate([100, 50, 100]), // Success feel
  error: () => vibrate(200), // Long error buzz
  heartbeat: () => vibrate([100, 100, 100, 100]), // Heartbeat pattern
}

export function useOnRouterBack({
  onRouterBack,
  isActive,
}: {
  onRouterBack: (e: PopStateEvent) => void
  isActive: boolean
}) {
  useEffect(() => {
    const handleRouteChange = (e: PopStateEvent) =>
      isActive ? onRouterBack(e) : null

    window.addEventListener("popstate", handleRouteChange as any)
    return () => {
      window.removeEventListener("popstate", handleRouteChange as any)
    }
  }, [onRouterBack, isActive])
}

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
