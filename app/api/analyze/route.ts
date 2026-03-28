import { NextResponse } from "next/server"
import { Pool } from "pg"
import { BACKEND_API_URL } from "@/lib/api-config"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const county = formData.get("county") as string
    const year = formData.get("year") as string
    const file = formData.get("file") as File
    const method = formData.get("method") as string

    // 1. Forward to Python service
    const pyForm = new FormData()
    pyForm.append("county", county!)
    pyForm.append("year", year!)
    pyForm.append("file", file)
    pyForm.append("method", method || "hybrid")

    const res = await fetch(`${BACKEND_API_URL}/analyze_pdf`, {
      method: "POST",
      body: pyForm,
    })

    const data = await res.json()

    if (data.status === "success" || !data.error) {
      // 2. Save results to database
      const client = await pool.connect()
      try {
        // Find upload_id by county, year AND filename (forwarded as data.filename or from the file object)
        // Note: The file's name might have been changed in the upload process, but here we're receiving the raw file.
        // We'll try to find the upload by county and year primarily.
        const uploadRes = await client.query(
          "SELECT id FROM uploads WHERE county = $1 AND year = $2 ORDER BY created_at DESC LIMIT 1",
          [county, year]
        )
        const upload_id = uploadRes.rows[0]?.id

        const interpreted = data.interpreted_data || data
        const raw_verified = data.raw_verified_data || null

        const finalCounty = interpreted.county || county;
        const finalYear = interpreted.year || year;

        await client.query(
          `INSERT INTO analysis_results (
            upload_id, county, year, revenue, expenditure, 
            intelligence, summary_text, raw_extracted,
            total_allocation, risk_level, risk_score
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT DO NOTHING`,
          [
            upload_id,
            finalCounty,
            finalYear,
            JSON.stringify(interpreted.key_metrics || {}),
            JSON.stringify(interpreted.sectoral_allocations || {}),
            JSON.stringify(interpreted.intelligence || {}),
            interpreted.summary_text,
            JSON.stringify(raw_verified),
            interpreted.key_metrics?.total_budget || 0,
            interpreted.intelligence?.verdict || 'Unknown',
            interpreted.intelligence?.risk_score || 0
          ]
        )

        // Update upload status
        if (upload_id) {
          await client.query(
            "UPDATE uploads SET upload_status = 'completed' WHERE id = $1",
            [upload_id]
          )
        }
      } finally {
        client.release()
      }
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("Analysis API error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
