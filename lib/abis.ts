import { parseAbi } from "viem"

export const ABI_DISPENSER = parseAbi([
  "function claim(uint256 amount, uint256 deadline, bytes calldata signature) external",
  "function nonces(address) public view returns (uint256)",
  "function claimed(address) view returns (uint256)",
])
