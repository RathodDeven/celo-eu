import { NextRequest, NextResponse } from "next/server"
import { challengeStore } from "@/lib/challengeStore"

export async function GET(request: NextRequest) {
  const challenges = Array.from(challengeStore.entries()).map(
    ([address, challenge]) => ({
      address,
      timestamp: challenge.timestamp,
      age: Date.now() - challenge.timestamp,
      message: challenge.message.substring(0, 100) + "...",
    })
  )

  return NextResponse.json({
    totalChallenges: challengeStore.size,
    isGlobalStore: !!globalThis.challengeStore,
    nodeEnv: process.env.NODE_ENV,
    challenges,
    currentTime: Date.now(),
  })
}
