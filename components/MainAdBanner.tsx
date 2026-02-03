"use client"

import { IoMdClose } from "react-icons/io"
import { atom, useAtom } from "jotai"
import { cn } from "@/lib/utils"

import AdMachine from "./AdMachine"

const atomBannerClosed = atom(false)
export default function MainAdBanner() {
  const [isClosed, setIsClosed] = useAtom(atomBannerClosed)

  return (
    <div
      className={cn(
        "px-5 relative pt-2",
        isClosed && "opacity-0 pointer-events-none",
      )}
    >
      <div
        className="border-2 border-black has-[.AdMachine.hidden]:opacity-0 opacity-100 transition-opacity duration-300"
        style={{
          aspectRatio: "728 / 90",
        }}
      >
        <a
          // Show ad link + close ad
          onClick={() => setIsClosed(true)}
          className="absolute -top-1 right-3 size-6 rounded-full bg-black text-white grid place-items-center"
          target="_blank"
          href="https://www.effectivegatecpm.com/anj8q4ah?key=58ca1924ed9faaf4d5c16edfae41e36b"
        >
          <IoMdClose />
        </a>
        <AdMachine className="bg-orange-300" size="728x90" />
      </div>
    </div>
  )
}
