import { NextResponse } from "next/server"
import { Pool } from "pg"

export const dynamic = "force-dynamic"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

const ALLOWED_TABLES = [
    "uploads",
    "analysis_results",
    "document_metadata",
    "sectoral_allocations",
    "project_performance",
    "compliance_checks",
    "county_comparisons",
    "user_roles",
    "audit_logs",
    "acronyms",
    "generated_reports",
    "trending_merits",
    "system_settings"
]

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const table = searchParams.get("table")

        if (!table || !ALLOWED_TABLES.includes(table)) {
            return NextResponse.json({ success: false, error: "Invalid or unauthorized table access." }, { status: 400 })
        }

        const client = await pool.connect()

        // Fetch last 50 records from the selected table
        const result = await client.query(`SELECT * FROM ${table} ORDER BY 1 DESC LIMIT 50`)

        // Get table info (columns)
        const schemaInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table])

        client.release()

        return NextResponse.json({
            success: true,
            table,
            rows: result.rows,
            schema: schemaInfo.rows
        })
    } catch (err: any) {
        console.error(`Explorer API Error (${req.url}):`, err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
