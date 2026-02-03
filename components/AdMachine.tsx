"use client"

import { cn } from "@/lib/utils"
import { useEffect } from "react"

type Sizes = "728x90"
const KEYS: Record<Sizes, string> = {
  "728x90": "54ed9b07e39b90b4da062565c772a4d3",
}

const AD_CONTAINER_ID = "ad-machine"
export default function AdMachine({
  size = "728x90",
  className,
}: {
  size?: Sizes
  className?: string
}) {
  const KEY = KEYS[size]
  const [WIDTH, HEIGHT] = size.split("x").map(Number)

  useEffect(() => {
    const container = document.getElementById(AD_CONTAINER_ID)
    if (!container) return

    // Initial ad setup + unique container
    const ad = document.createElement("div")
    ad.style = "width:100%;height:100%;"
    ad.id = "amx-" + Date.now()

    // Set options with unique container
    ;(window as any).atOptions = {
      key: KEY,
      format: "js",
      height: HEIGHT,
      width: WIDTH,
      params: {},
    }

    // Load the script (or re-execute if already loaded)
    const script = document.createElement("script")
    script.src = `https://www.highperformanceformat.com/${KEY}/invoke.js`
    script.onerror = (error) => {
      console.debug({ error })
      container.classList.add("hidden")
    }

    // Render ad
    ad.replaceChildren(script)
    container.replaceChildren(ad)

    const observer = new MutationObserver(() => {
      const img = container.querySelector("img")
      if (img) {
        // Ad found - show container
        container.classList.remove("hidden")
        observer.disconnect() // Stop observing once ad is found
      }
    })

    observer.observe(container, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [KEY])

  return (
    <div
      style={{
        aspectRatio: `${WIDTH} / ${HEIGHT}`,
        width: "100%",
      }}
      id={AD_CONTAINER_ID}
      className={cn(
        "hidden AdMachine overflow-hidden [&_img]:!w-full bg-black/3 animate-in fade-in",
        className,
      )}
    />
  )
}
