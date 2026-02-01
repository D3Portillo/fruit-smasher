import type { Address } from "viem"

import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js"
import { generateUUID } from "@/lib/utils"

export const MINI_APP_RECIPIENT = "0x05a700132Fb88D4F565453153E6b05F2049fCb45"

export const executeWorldPayment = async ({
  initiatorAddress,
  paymentDescription,
  amount,
  token,
}: {
  initiatorAddress: Address
  paymentDescription: string
  amount: number
  token: "WLD" | "USDCE"
}) => {
  if (!MiniKit.isInstalled()) return null

  const uuid = generateUUID()
  const paymentToken = token === "WLD" ? Tokens.WLD : Tokens.USDC

  const payload: PayCommandInput = {
    reference: uuid,
    to: MINI_APP_RECIPIENT,
    tokens: [
      {
        symbol: paymentToken,
        token_amount: tokenToDecimals(amount, paymentToken).toString(),
      },
    ],
    description: paymentDescription,
  }

  const { finalPayload } = await MiniKit.commandsAsync.pay(payload)

  if (finalPayload.status == "success") {
    const req = await fetch(`/api/confirm-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        address: initiatorAddress,
      },
      body: JSON.stringify(finalPayload),
    })

    const result = await req.json()
    if (result.success) return finalPayload
  }

  return null
}
