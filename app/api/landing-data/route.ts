import { NextResponse } from "next/server"
import { Pool } from "pg"

export const dynamic = "force-dynamic"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export async function GET() {
    try {
        const client = await pool.connect()

        // 1. Get the latest trending merits (Hot Takes, Tickers)
        const trendingRes = await client.query("SELECT * FROM trending_merits ORDER BY date DESC LIMIT 1")
        const trending = trendingRes.rows[0] || null

        // 2. Get latest analysis results for the marquee
        const analysisRes = await client.query(`
      SELECT county, total_allocation as val, '+0.0%' as trend, risk_level as status, 'blue' as color
      FROM analysis_results 
      ORDER BY created_at DESC 
      LIMIT 10
    `)

        client.release()

        return NextResponse.json({
            success: true,
            trending: {
                hot_takes: trending?.description || "Awaiting daily fiscal sync...",
                ticker: trending?.economic_ticker || [],
                daily_audit: trending?.daily_audit || []
            },
            live_nodes: analysisRes.rows.map((row: any) => ({
                ...row,
                val: row.val ? (parseInt(row.val) / 1000000000).toFixed(1) + "B" : "0.0B",
                trend: "+1.2%", // Mock trend for animation
                status: row.status === 'high' ? 'Critical' : 'Stable',
                color: row.status === 'high' ? 'red' : 'emerald'
            }))
        })
    } catch (err: any) {
        console.error("Landing Data API Error:", err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
