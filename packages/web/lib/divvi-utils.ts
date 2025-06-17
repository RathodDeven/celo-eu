import { getDataSuffix, submitReferral } from "@divvi/referral-sdk"
import { DIVVI_CONFIG } from "./config"
import type { Hex } from "viem"

/**
 * Get the Divvi referral data suffix
 */
export function getDivviDataSuffix(): string {
  return getDataSuffix({
    consumer: DIVVI_CONFIG.CONSUMER,
    providers: DIVVI_CONFIG.PROVIDERS,
  })
}

/**
 * Submit referral to Divvi after transaction confirmation
 */
export async function submitDivviReferral(
  txHash: Hex,
  chainId: number
): Promise<void> {
  try {
    await submitReferral({
      txHash,
      chainId,
    })
    console.log("Divvi referral submitted successfully")
  } catch (error) {
    console.error("Failed to submit Divvi referral:", error)
  }
}
