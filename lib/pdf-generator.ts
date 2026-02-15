import jsPDF from "jspdf"

// Premium PDF Integrity Report Generator
export const generateIntegrityReport = (result: any) => {
    if (!result) return
    const doc = new jsPDF()
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPos = 0

    const COLORS = {
        slate950: [2, 6, 23],
        slate900: [15, 23, 42],
        slate800: [30, 41, 59],
        slate500: [100, 116, 139],
        indigo600: [79, 70, 229],
        indigo400: [129, 140, 248],
        emerald600: [5, 150, 105],
        emerald500: [16, 185, 129],
        emerald50: [240, 253, 244],
        white: [255, 255, 255],
        red600: [220, 38, 38]
    }

    const formatValue = (key: string, value: any) => {
        if (value === null || value === undefined || value === 0) return "Not Found"
        if (key.toLowerCase().includes("pct") || key.toLowerCase().includes("rate") || key.toLowerCase().includes("performance")) return `${value}%`
        if (typeof value === "number" && value > 1000) return `KSh ${value.toLocaleString()}`
        return String(value)
    }

    // --- PAGE 1: HEADER & SCORECARD ---
    // Full width dark header
    doc.setFillColor(COLORS.slate950[0], COLORS.slate950[1], COLORS.slate950[2])
    doc.rect(0, 0, pageWidth, 70, "F")

    // Logo Icon (BarChart Simulation)
    doc.setFillColor(COLORS.indigo600[0], COLORS.indigo600[1], COLORS.indigo600[2])
    doc.roundedRect(margin, 20, 8, 8, 2, 2, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("BudgetAI", margin + 12, 26)

    doc.setFontSize(28)
    doc.text("INTEGRITY AUDIT REPORT", margin, 45)

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
    doc.text(`${(result.county).toUpperCase()} JURISDICTION // FINANCIAL YEAR ${result.year}`, margin, 55)
    doc.setTextColor(COLORS.indigo400[0], COLORS.indigo400[1], COLORS.indigo400[2])
    doc.text(`PIPELINE PROTOCOL: ${result.method?.toUpperCase() || "NEURAL ANALYSIS"}`, margin, 60)

    yPos = 85

    // Risk Assessment Block
    if (result.intelligence?.transparency_risk_score !== undefined) {
        const score = result.intelligence.transparency_risk_score
        const isHighRisk = score > 60
        const color = isHighRisk ? COLORS.red600 : COLORS.emerald600

        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
        doc.text("FISCAL RISK VERDICT", margin, yPos)

        yPos += 5
        doc.setDrawColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2])
        doc.setLineWidth(0.1)
        doc.line(margin, yPos, pageWidth - margin, yPos)

        yPos += 15
        doc.setFontSize(48)
        doc.setTextColor(color[0], color[1], color[2])
        doc.text(String(score), margin, yPos)
        const scoreWidth = doc.getTextWidth(String(score))

        doc.setFontSize(14)
        doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
        doc.text("/100", margin + scoreWidth + 2, yPos - 2)

        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(isHighRisk ? "CRITICAL OBSERVATION" : "STABLE AUDIT PASS", margin + scoreWidth + 40, yPos - 12)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.text(isHighRisk ? "Automated risk engines detected structural anomalies in reported vs verified data." : "Reported figures align with verified institutional landmarks.", margin + scoreWidth + 40, yPos - 5)

        yPos += 20
    }

    // --- IMMUTABLE BENCHMARKS ---
    if (result.raw_verified_data) {
        doc.setFillColor(COLORS.emerald50[0], COLORS.emerald50[1], COLORS.emerald50[2])
        doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 45, 4, 4, "F")
        doc.setDrawColor(COLORS.emerald500[0], COLORS.emerald500[1], COLORS.emerald500[2])
        doc.setLineWidth(1)
        doc.line(margin, yPos, margin, yPos + 45)

        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.setTextColor(COLORS.emerald600[0], COLORS.emerald600[1], COLORS.emerald600[2])
        doc.text("IMMUTABLE DATA LANDMARKS (OSR VERIFICATION)", margin + 8, yPos + 12)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(7)
        doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
        doc.text(`VERIFIED SOURCE: ${result.raw_verified_data.source?.toUpperCase() || "TREASURY CBIRR"}`, margin + 8, yPos + 17)

        const osr = result.raw_verified_data
        const colW = (pageWidth - 2 * margin - 16) / 3

        const drawMiniMetric = (label: string, value: string, x: number, y: number) => {
            doc.setFont("helvetica", "bold")
            doc.setFontSize(7)
            doc.setTextColor(COLORS.emerald600[0], COLORS.emerald600[1], COLORS.emerald600[2])
            doc.text(label, x, y)
            doc.setFontSize(12)
            doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2])
            doc.text(value, x, y + 8)
        }

        drawMiniMetric("OSR REVENUE TARGET", formatValue("osr_target", osr.osr_target), margin + 8, yPos + 30)
        drawMiniMetric("ACTUAL OSR COLLECTED", formatValue("osr_actual", osr.osr_actual), margin + 8 + colW, yPos + 30)
        drawMiniMetric("OSR PERFORMANCE", `${osr.osr_performance || "0"}%`, margin + 8 + (2 * colW), yPos + 30)

        yPos += 60
    }

    // --- KEY METRIC CARDS ---
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
    doc.text("NEURAL EXTRACTION TELEMETRY", margin, yPos)
    yPos += 12

    const metrics = result.key_metrics || {}
    const metricEntries = Object.entries(metrics)
    const cardH = 22
    const cardW = (pageWidth - 2 * margin - 5) / 2

    metricEntries.forEach(([key, value], index) => {
        const col = index % 2
        const rowI = Math.floor(index / 2)
        const x = margin + (col * (cardW + 5))
        const localY = yPos + (rowI * (cardH + 5))

        // Check page overflow
        if (localY + cardH > pageHeight - 30) {
            doc.addPage()
            yPos = 30
            // Reset localY for new page but keep track of proper row placement
            // This is simplified, for true high accuracy we'd reset a counter
        }

        doc.setFillColor(248, 250, 252) // Gray 50
        doc.roundedRect(x, localY, cardW, cardH, 2, 2, "F")
        doc.setDrawColor(226, 232, 240) // Gray 200
        doc.roundedRect(x, localY, cardW, cardH, 2, 2, "D")

        doc.setFont("helvetica", "bold")
        doc.setFontSize(6)
        doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
        doc.text(`MTRC_${key.slice(0, 3).toUpperCase()}_04X`, x + 5, localY + 6)

        doc.setFontSize(7)
        doc.text(key.replaceAll("_", " ").toUpperCase(), x + 5, localY + 11)

        doc.setFontSize(11)
        doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2])
        doc.text(formatValue(key, value), x + 5, localY + 18)
    })

    // Advance yPos to end of cards
    yPos += (Math.ceil(metricEntries.length / 2) * (cardH + 5)) + 15

    // --- PAGE 2: SUMMARY ---
    if (yPos > pageHeight - 60) {
        doc.addPage()
        yPos = 30
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(COLORS.indigo600[0], COLORS.indigo600[1], COLORS.indigo600[2])
    doc.text("SENIOR AUDIT EXECUTIVE NARRATIVE", margin, yPos)
    yPos += 8

    doc.setDrawColor(COLORS.indigo600[0], COLORS.indigo600[1], COLORS.indigo600[2])
    doc.setLineWidth(1)
    doc.line(margin, yPos, margin + 20, yPos)
    yPos += 10

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2])

    const rawSummary = result.summary_text || ""
    const cleanLines = rawSummary.split('\n').map((line: string) => {
        if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
            return "  • " + line.trim().substring(1).trim()
        }
        return line.replace(/[#*]/g, "").trim()
    }).filter((line: string) => line.length > 0)

    cleanLines.forEach((line: string) => {
        const wrappedLines = doc.splitTextToSize(line, pageWidth - (2 * margin))
        wrappedLines.forEach((wrapped: string) => {
            if (yPos > pageHeight - 30) {
                doc.addPage()
                yPos = 30
            }
            doc.text(wrapped, margin, yPos)
            yPos += 6
        })
        yPos += 4
    })

    // --- FOOTERS ---
    const totalPages = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setDrawColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2])
        doc.setLineWidth(0.1)
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20)

        doc.setFontSize(7)
        doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
        doc.text(`BUDGETAI INTEGRITY ENGINE // GENERATED ${new Date().toLocaleString()}`, margin, pageHeight - 14)
        doc.text(`PAG_ID: ${i} / ${totalPages}`, pageWidth - margin - 20, pageHeight - 14)
    }

    doc.save(`${result.county}_Integrity_Report_${result.year}.pdf`)
}

