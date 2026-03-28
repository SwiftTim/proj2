import { NextResponse } from "next/server";
import { Pool } from "pg";

// App Router: Set max function duration
export const maxDuration = 60;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  try {
    // Accepts JSON body with just filenames (no file bytes — files go directly to Render)
    const { county, year, filenames } = await req.json();

    if (!county || !year || !filenames || filenames.length === 0) {
      return NextResponse.json({ success: false, error: "Missing county, year, or filenames" }, { status: 400 });
    }

    // Save metadata to Neon database
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO uploads (county, year, filenames, upload_status, created_at) VALUES ($1, $2, $3, 'pending', NOW())`,
        [county, year, JSON.stringify(filenames)]
      );
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, uploaded: filenames });
  } catch (err: any) {
    console.error("Upload metadata error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
