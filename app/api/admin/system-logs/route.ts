import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// This is a temporary storage for terminal logs. 
// In a real production environment, this would be served from a log aggregator or a real-time TTY bridge.
let terminalLogs: Record<string, string[]> = {
    npm: [
        "✓ Compiled in 15.6s (3532 modules)",
        "GET /api/documents 200 in 6679ms",
        "POST /api/upload 200 in 10007ms",
        "🌟 Forwarding Gemini Analysis for Kilifi to Python service...",
        "✅ Saved new Gemini analysis for Kilifi",
        "POST /api/analyze/gemini 200 in 99471ms",
        "GET /api/admin/dashboard 200 in 23436ms",
        "GET /api/admin/settings 200 in 14329ms",
        "GET /api/admin/explorer?table=analysis_results 200 in 6489ms"
    ],
    python: [
        "✅ Database initialized",
        "INFO:apscheduler.scheduler:Added job 'Daily Hot Take Extraction'",
        "INFO:apscheduler.scheduler:Scheduler started",
        "✅ Hot Take Scheduler started",
        "🚀 Starting Budget Analyzer API...",
        "🌟 Starting Gemini Analysis for Kilifi",
        "📂 Found PDF at resolved path: /public/uploads/CGBIRR_Kilifi.pdf",
        "INFO: 127.0.0.1 - 'POST /analyze/gemini HTTP/1.1' 200 OK",
        "WARNING: WatchFiles detected changes in 'db.py'. Reloading..."
    ]
}

export async function GET() {
    return NextResponse.json({ success: true, logs: terminalLogs })
}

export async function POST(req: Request) {
    const { service, line } = await req.json()
    if (service === 'npm' || service === 'python') {
        terminalLogs[service].push(`[${new Date().toLocaleTimeString()}] ${line}`)
        if (terminalLogs[service].length > 100) terminalLogs[service].shift()
    }
    return NextResponse.json({ success: true })
}
