"use server"

import { type Address, encodePacked, keccak256, parseEther } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { worldClient, worldchain } from "@/lib/world"

import { ABI_DISPENSER } from "@/lib/abis"
import { ADDRESS_DISPENSER } from "@/lib/constants"

const account = privateKeyToAccount(
  process.env.OFFCHAIN_SIGNER_PK as `0x${string}`
)

export async function getDispenserPayload(
  address: Address,
  { requestingAmount = 0 }
) {
  const nonce = await worldClient.readContract({
    abi: ABI_DISPENSER,
    functionName: "nonces",
    address: ADDRESS_DISPENSER,
    args: [address],
  })

  const amount = parseEther(`${requestingAmount}`)
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 5) // 5 minutes
  const encoded = encodePacked(
    [
      "string",
      "uint256",
      "address",
      "address",
      "uint256",
      "uint256",
      "uint256",
    ],
    [
      // Encoding the namespace
      "TAPSDispenser",
      BigInt(worldchain.id),
      ADDRESS_DISPENSER,
      address,
      nonce,
      amount,
      deadline,
    ]
  )

  const signature = await account.signMessage({
    message: { raw: keccak256(encoded) },
  })

  return { signature, amount, deadline }
}
