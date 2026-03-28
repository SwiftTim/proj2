import { NextResponse } from "next/server"
import { BACKEND_API_URL } from "@/lib/api-config"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const days = searchParams.get("days") || "7"

    try {
        const response = await fetch(`${BACKEND_API_URL}/api/trending-merits?days=${days}`)
        const data = await response.json()
        return NextResponse.json(data)
    } catch (err: any) {
        console.error("Trending merits API error:", err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
