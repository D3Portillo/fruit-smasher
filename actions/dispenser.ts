"use server"

import { type Address, encodePacked, keccak256, parseEther } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { ABI_DISPENSER } from "@/lib/abis"
import { worldClient, worldchain } from "@/lib/world"

const account = privateKeyToAccount(
  process.env.OFFCHAIN_SIGNER_PK as `0x${string}`
)

const ADDRESS_DISPENSER = "0x0"

export async function getDispenserPayload(address: Address) {
  const [points, nonce] = await Promise.all([
    Promise.resolve(1000), // Replace with actual points logic
    worldClient.readContract({
      abi: ABI_DISPENSER,
      functionName: "nonces",
      address: ADDRESS_DISPENSER,
      args: [address],
    }),
  ])

  const amount = parseEther(`${points}`)
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
