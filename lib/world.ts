import { createPublicClient, http } from "viem"
import { worldchain } from "viem/chains"

export { worldchain }

export const worldClient = createPublicClient({
  chain: worldchain,
  transport: http(),
})
