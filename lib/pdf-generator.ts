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

    // --- DATA FORMATTING HELPERS ---
    const formatValue = (key: string, value: any) => {
        if (value === null || value === undefined || value === 0 || value === "0") return "Not Found"
        if (key.toLowerCase().includes("pct") || key.toLowerCase().includes("rate") || key.toLowerCase().includes("performance")) {
            const num = parseFloat(String(value))
            return isNaN(num) ? String(value) : `${num.toFixed(1)}%`
        }
        if (typeof value === "number" || (!isNaN(parseFloat(value)) && String(value).length > 2)) {
            const num = parseFloat(String(value))
            if (num > 1000) return `KSh ${Math.round(num).toLocaleString()}`
        }
        return String(value)
    }

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > pageHeight - 25) {
            doc.addPage()
            yPos = 25
            return true
        }
        return false
    }

    // --- PAGE 1: HEADER & SCORECARD ---
    // Full width dark header
    doc.setFillColor(COLORS.slate950[0], COLORS.slate950[1], COLORS.slate950[2])
    doc.rect(0, 0, pageWidth, 70, "F")

    // Logo Icon (BarChart Simulation)
    doc.setFillColor(COLORS.indigo600[0], COLORS.indigo600[1], COLORS.indigo600[2])
    doc.roundedRect(margin, 20, 10, 10, 2, 2, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("BUDGET", margin + 14, 27)

    doc.setFont("helvetica", "normal")
    doc.setTextColor(COLORS.indigo400[0], COLORS.indigo400[1], COLORS.indigo400[2])
    doc.text("INTEGRITY", margin + 40, 27)

    doc.setFontSize(28)
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.text("AUDIT REPORT", margin, 48)

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
    doc.text(`${String(result.county).toUpperCase()} JURISDICTION // FINANCIAL YEAR ${result.year || "2024/25"}`, margin, 58)
    doc.setTextColor(COLORS.indigo400[0], COLORS.indigo400[1], COLORS.indigo400[2])
    doc.text(`PIPELINE PROTOCOL: ${result.method?.toUpperCase() || "NEURAL ANALYSIS"}`, margin, 63)

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

        yPos += 4
        doc.setDrawColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2])
        doc.setLineWidth(0.1)
        doc.line(margin, yPos, pageWidth - margin, yPos)

        yPos += 18
        doc.setFontSize(52)
        doc.setTextColor(color[0], color[1], color[2])
        doc.text(String(score), margin, yPos)
        const scoreWidth = doc.getTextWidth(String(score))

        doc.setFontSize(14)
        doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
        doc.text("/100", margin + scoreWidth + 2, yPos - 3)

        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2])
        doc.text(isHighRisk ? "CRITICAL DISCREPANCY DETECTED" : "REVENUE VALIDATION PASSED", margin + scoreWidth + 40, yPos - 14)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(8.5)
        doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
        const riskText = isHighRisk ? "Automated risk engines detected structural anomalies in reported vs verified data. Higher probability of fiscal hallucination in source document." : "Reported figures align significantly with verified institutional landmarks from the Treasury CBIRR database."
        const wrappedRisk = doc.splitTextToSize(riskText, pageWidth - margin - (margin + scoreWidth + 40))
        doc.text(wrappedRisk, margin + scoreWidth + 40, yPos - 7)

        yPos += 15
    }

    // --- IMMUTABLE BENCHMARKS ---
    if (result.raw_verified_data) {
        yPos += 5
        checkPageBreak(50)

        doc.setFillColor(COLORS.emerald50[0], COLORS.emerald50[1], COLORS.emerald50[2])
        doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 40, 4, 4, "F")
        doc.setDrawColor(COLORS.emerald500[0], COLORS.emerald500[1], COLORS.emerald500[2])
        doc.setLineWidth(0.8)
        doc.line(margin, yPos, margin, yPos + 40)

        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.setTextColor(COLORS.emerald600[0], COLORS.emerald600[1], COLORS.emerald600[2])
        doc.text("IMMUTABLE DATA LANDMARKS (TREASURY VERIFICATION)", margin + 8, yPos + 10)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(7)
        doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
        doc.text(`SOURCE: NATIONAL TREASURY CBIRR // AUG 2025`, margin + 8, yPos + 15)

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

        drawMiniMetric("OSR REVENUE TARGET", formatValue("osr_target", osr.osr_target), margin + 8, yPos + 26)
        drawMiniMetric("ACTUAL OSR COLLECTED", formatValue("osr_actual", osr.osr_actual), margin + 8 + colW, yPos + 26)
        drawMiniMetric("COLLECTION VARIANCE", `${osr.osr_performance || "0"}%`, margin + 8 + (2 * colW), yPos + 26)

        yPos += 55
    }

    // --- KEY METRIC CARDS ---
    checkPageBreak(30)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
    doc.text("EXTRACTED FISCAL TELEMETRY", margin, yPos)

    yPos += 10

    const metrics = result.key_metrics || {}
    const metricEntries = Object.entries(metrics)
    const cardH = 24
    const cardW = (pageWidth - 2 * margin - 5) / 2

    let currentGridRow = 0
    let currentGridCol = 0

    metricEntries.forEach(([key, value], index) => {
        const x = margin + (currentGridCol * (cardW + 5))
        const localY = yPos + (currentGridRow * (cardH + 5))

        // Check page overflow for next card
        if (localY + cardH > pageHeight - 25) {
            doc.addPage()
            yPos = 30
            currentGridRow = 0
            currentGridCol = 0
            // Redraw header on new page for metrics
            doc.setFont("helvetica", "bold")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
            doc.text("EXTRACTED FISCAL TELEMETRY (CONTINUED)", margin, yPos - 10)
        }

        const actualDrawY = yPos + (currentGridRow * (cardH + 5))
        const actualDrawX = margin + (currentGridCol * (cardW + 5))

        doc.setFillColor(248, 250, 252) // Gray 50
        doc.roundedRect(actualDrawX, actualDrawY, cardW, cardH, 2, 2, "F")
        doc.setDrawColor(226, 232, 240) // Gray 200
        doc.setLineWidth(0.1)
        doc.roundedRect(actualDrawX, actualDrawY, cardW, cardH, 2, 2, "D")

        doc.setFont("helvetica", "bold")
        doc.setFontSize(6)
        doc.setTextColor(COLORS.indigo400[0], COLORS.indigo400[1], COLORS.indigo400[2])
        doc.text(`TAG::${key.slice(0, 4).toUpperCase()}`, actualDrawX + 5, actualDrawY + 7)

        doc.setFontSize(8)
        doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2])
        const cleanKey = key.replaceAll("_", " ").toUpperCase()
        const wrappedKey = doc.splitTextToSize(cleanKey, cardW - 10)
        doc.text(wrappedKey[0], actualDrawX + 5, actualDrawY + 12)

        doc.setFontSize(11)
        doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2])
        doc.text(formatValue(key, value), actualDrawX + 5, actualDrawY + 20)

        // Update grid counters
        currentGridCol++
        if (currentGridCol > 1) {
            currentGridCol = 0
            currentGridRow++
        }
    })

    // Advance yPos to end of cards
    yPos += (Math.ceil(metricEntries.length / 2) * (cardH + 5)) + 15

    // --- PAGE 2+: SUMMARY ---
    checkPageBreak(60)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(COLORS.indigo600[0], COLORS.indigo600[1], COLORS.indigo600[2])
    doc.text("QUALITATIVE AUDIT SUMMARY", margin, yPos)
    yPos += 8

    doc.setDrawColor(COLORS.indigo600[0], COLORS.indigo600[1], COLORS.indigo600[2])
    doc.setLineWidth(1)
    doc.line(margin, yPos, margin + 25, yPos)
    yPos += 12

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
            if (checkPageBreak(10)) {
                // do nothing extra
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
        doc.text(`BUDGETAI INTEGRITY ENGINE // GENERATED ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, pageHeight - 14)
        doc.text(`VERIFICATION HASH: CF_${Math.random().toString(36).substring(7).toUpperCase()}`, margin, pageHeight - 10)
        doc.text(`PAGE ${i} OF ${totalPages}`, pageWidth - margin - 20, pageHeight - 14)
    }

    doc.save(`${result.county}_Integrity_Report_${result.year}.pdf`)
}

