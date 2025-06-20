"use client"

import { FaBlender } from "react-icons/fa"
import { useBlender } from "@/lib/atoms/blender"
import { numberToShortWords } from "@/lib/numbers"
import ModalBlender from "./ModalBlender"

export default function TriggerBlenderSetup() {
  const { availableTaps, isSetup } = useBlender()

  return (
    <div className="w-32 flex justify-start">
      <ModalBlender
        trigger={
          <button className="p-2 text-left relative text-white">
            <div className="absolute top-2.5 left-1 text-2xl rotate-12">🫐</div>
            <FaBlender className="text-4xl" />
            <strong className="block text-center pl-1 mx-auto">
              {isSetup
                ? availableTaps > 0
                  ? numberToShortWords(availableTaps)
                  : "N/A"
                : "OFF"}
            </strong>
          </button>
        }
      />
    </div>
  )
}
