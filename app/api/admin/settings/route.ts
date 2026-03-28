import { NextResponse } from "next/server"
import { Pool } from "pg"

export const dynamic = "force-dynamic"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export async function GET() {
    try {
        const client = await pool.connect()
        const result = await client.query("SELECT * FROM system_settings")
        client.release()

        const settings: Record<string, any> = {}
        result.rows.forEach(row => {
            settings[row.key] = row.value
        })

        return NextResponse.json({ success: true, settings })
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { key, value } = await req.json()
        const client = await pool.connect()

        await client.query(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET value = $2, updated_at = NOW()
    `, [key, value])

        client.release()
        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
