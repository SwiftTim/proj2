import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export async function POST(req: Request) {
    try {
        const { pdfId, county, year } = await req.json()

        console.log(`📄 Forwarding Docling Analysis for ${county} (PDF: ${pdfId}) to Python service...`)

        // 1. Call Python service
        const response = await fetch('http://127.0.0.1:8000/analyze/docling', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pdf_id: pdfId,
                county: county
            })
        })

        if (!response.ok) {
            let errorMsg = "Python service error"
            try {
                const errorData = await response.json()
                errorMsg = errorData.detail || errorMsg
            } catch (e) { }
            console.error(`❌ Python service returned ${response.status}: ${errorMsg}`)
            return NextResponse.json({ success: false, error: errorMsg }, { status: response.status })
        }

        const data = await response.json()
        const result = data.data
        const interpreted = result.interpreted_data || {}

        // 2. Save to database
        const client = await pool.connect()
        try {
            // Find upload_id by filename AND county/year for maximum precision
            const uploadRes = await client.query(
                "SELECT id FROM uploads WHERE filenames @> $1 AND county = $2 AND year = $3 LIMIT 1",
                [JSON.stringify([pdfId]), county, year]
            )

            let upload_id = uploadRes.rows[0]?.id

            if (!upload_id) {
                console.warn(`⚠️ Could not find precise upload record for [${pdfId}, ${county}, ${year}]. Falling back to filename only...`)
                const fallbackRes = await client.query(
                    "SELECT id FROM uploads WHERE filenames @> $1 LIMIT 1",
                    [JSON.stringify([pdfId])]
                )
                upload_id = fallbackRes.rows[0]?.id
            }

            const keyMetrics = interpreted.key_metrics || {}
            const intelligence = interpreted.intelligence || {}
            const summary_text = interpreted.summary_text || "No summary provided."
            const raw_extracted = result.raw_verified_data || result.metadata || {}

            const finalCounty = interpreted.county || county;
            const finalYear = interpreted.year || year;

            // Check if analysis already exists
            const existingAnalysis = await client.query(
                "SELECT id FROM analysis_results WHERE upload_id = $1 AND county = $2 LIMIT 1",
                [upload_id, finalCounty]
            )

            if (existingAnalysis.rows.length > 0) {
                // Update
                const updateRes = await client.query(
                    `UPDATE analysis_results SET 
              revenue = $1, expenditure = $2, intelligence = $3, summary_text = $4, raw_extracted = $5, county = $6, year = $7, created_at = CURRENT_TIMESTAMP
             WHERE id = $8 RETURNING id`,
                    [
                        JSON.stringify(keyMetrics),
                        JSON.stringify(interpreted.sectoral_allocations || {}),
                        JSON.stringify(intelligence),
                        summary_text,
                        JSON.stringify(raw_extracted),
                        finalCounty,
                        finalYear,
                        existingAnalysis.rows[0].id
                    ]
                )
                result.id = updateRes.rows[0].id
                console.log(`Updated Docling analysis for ${county}`)
            } else {
                // Insert
                const insertRes = await client.query(
                    `INSERT INTO analysis_results (
              upload_id, county, year, revenue, expenditure, 
              intelligence, summary_text, raw_extracted
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                    [
                        upload_id,
                        finalCounty,
                        finalYear,
                        JSON.stringify(keyMetrics),
                        JSON.stringify(interpreted.sectoral_allocations || {}),
                        JSON.stringify(intelligence),
                        summary_text,
                        JSON.stringify(raw_extracted)
                    ]
                )
                result.id = insertRes.rows[0].id
                console.log(`✅ Saved new Docling analysis for ${county}`)
            }
        } finally {
            client.release()
        }

        return NextResponse.json({ success: true, data: result })
    } catch (err: any) {
        console.error("Docling Analysis API error:", err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
