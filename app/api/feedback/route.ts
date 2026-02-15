
import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export async function POST(req: Request) {
    try {
        const { email, rating, category, comment, analysisId } = await req.json()
        const client = await pool.connect()

        await client.query(`
      INSERT INTO user_feedback (user_email, rating, category, comment, analysis_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [email, rating, category, comment, analysisId])

        client.release()
        return NextResponse.json({ success: true, message: "Feedback submitted successfully." })
    } catch (err: any) {
        console.error("Feedback Submission Error:", err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        // Simple auth check could be added here, but for now we fetch all for admin
        const client = await pool.connect()
        const result = await client.query("SELECT * FROM user_feedback ORDER BY created_at DESC")
        client.release()
        return NextResponse.json({ success: true, feedback: result.rows })
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
