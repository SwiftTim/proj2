import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const county = formData.get("county") as string;
    const year = formData.get("year") as string;
    const files = formData.getAll("files") as File[];

    if (!county || !year || files.length === 0) {
      return NextResponse.json({ success: false, error: "Missing county, year, or files" }, { status: 400 });
    }

    // On Vercel, we can't write to the filesystem (read-only).
    // Instead, store file metadata in the database only.
    // The full file is forwarded straight to the Render Python service during analysis.
    const savedFileNames: string[] = [];

    for (const file of files) {
      const timestamp = Date.now();
      const safeCounty = county.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const uniqueName = `${timestamp}-${safeCounty}-${file.name}`;
      savedFileNames.push(uniqueName);
    }

    // Save metadata to database only
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO uploads (county, year, filenames, upload_status, created_at) VALUES ($1, $2, $3, 'pending', NOW())`,
        [county, year, JSON.stringify(savedFileNames)]
      );
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, uploaded: savedFileNames });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
