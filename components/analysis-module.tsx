"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Download, TrendingUp, CircleCheck, FileText, Search, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GPUAnalysisButton } from "./gpu-analysis-button"
import { DoclingAnalysisButton } from "./docling-analysis-button"
import { GoogleAnalysisButton } from "./google-analysis-button"
import { Input } from "@/components/ui/input"
import { generateIntegrityReport } from "@/lib/pdf-generator"
import { FeedbackModal } from "@/components/feedback-modal"

interface AnalysisScorecardProps {
  userEmail?: string
}

export function AnalysisScorecard({ userEmail }: AnalysisScorecardProps) {
  const [county, setCounty] = useState("")
  const [year, setYear] = useState("")
  const [documents, setDocuments] = useState<any[]>([])
  const [result, setResult] = useState<any | null>(null)
  const [countySearch, setCountySearch] = useState("")
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<number | undefined>(undefined)

  // --- Fetch uploaded documents from your DB ---
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("/api/documents")
        const data = await res.json()
        if (data.success) {
          setDocuments(data.documents)
        }
      } catch (err) {
        console.error("Failed to fetch documents:", err)
      }
    }
    fetchDocuments()
  }, [])

  // Dynamic Filters: Only show options that have uploaded data
  const availableCounties = Array.from(new Set(documents.map(d => d.county))).sort()
  const filteredCounties = availableCounties.filter(c =>
    c.toLowerCase().includes(countySearch.toLowerCase())
  )

  const availableYears = Array.from(new Set(
    documents.filter(d => d.county === county).map(d => d.year)
  )).sort().reverse() // Newest first

  // Derived state for current doc
  const currentDoc = documents.find((d) => d.county === county && d.year === year)

  // Auto-load existing analysis if available
  useEffect(() => {
    // Only auto-load if we don't already have a valid result for THIS county/year
    // or if the county/year changed.
    const isSameContext = result && result.county === county && result.year === year;

    if (currentDoc && currentDoc.analysis_id) {
      if (!isSameContext || (result && result.method !== "Stored Audit Report" && result.method !== "Google Gemini (Long Context)" && result.method !== "Docling Colab")) {
        if (!isSameContext) {
          setResult({
            county: currentDoc.county,
            year: currentDoc.year,
            summary_text: currentDoc.summary_text,
            key_metrics: currentDoc.key_metrics,
            intelligence: currentDoc.intelligence,
            raw_verified_data: currentDoc.raw_verified_data,
            method: "Stored Audit Report",
            id: currentDoc.analysis_id
          })
        }
      }
    } else if (!isSameContext) {
      setResult(null)
    }
  }, [county, year, documents]) // Reverting removal of countySearch from deps

  // --- Helper to format numbers legibly ---
  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === 0) return "Not Found"
    if (key.toLowerCase().includes("pct") || key.toLowerCase().includes("rate") || key.toLowerCase().includes("performance")) return `${value}%`
    if (typeof value === "number" && value > 1000) return `Ksh ${value.toLocaleString()}`
    return String(value)
  }

  // --- Handle Unified Results ---
  const handleGPUResults = (data: any) => {
    if (!data) return

    const interpreted = data.interpreted_data || data
    const summary = interpreted.summary_text || data.summary_text || interpreted.executive_summary || "No summary generated."

    const keyMetrics = interpreted.key_metrics || {
      ...(data.extraction?.revenue || {}),
      ...(data.extraction?.expenditure || {}),
      ...(data.extraction?.debt || {}),
      ...(data.extraction?.health_fif || {}),
      ...(data.key_metrics || {})
    }

    const intel = interpreted.intelligence || data.intelligence || {
      ...(data.analysis?.risk_assessment || {}),
      transparency_risk_score: data.analysis?.risk_assessment?.score || 0,
      flags: data.analysis?.risk_assessment?.flags || []
    }

    setResult({
      ...interpreted,
      county: interpreted.county || county,
      year: year,
      method: data.method || interpreted.method || "Analysis Engine",
      summary_text: summary,
      key_metrics: keyMetrics,
      intelligence: intel,
      raw_verified_data: data.raw_verified_data || interpreted.raw_verified_data,
      processing_time_sec: data.processing_time_sec || interpreted.processing_time_sec
    })

    if (interpreted.id || data.id) {
      setCurrentAnalysisId(interpreted.id || data.id)
      setShowFeedbackModal(true)
    }

    fetch("/api/documents")
      .then(res => res.json())
      .then(data => { if (data.success) setDocuments(data.documents) })
  }

  const downloadSummary = () => {
    if (!result) return
    generateIntegrityReport(result)
  }

  return (
    <Card className="max-w-4xl mx-auto border-slate-800 bg-slate-950/50 backdrop-blur-xl shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-800/50 bg-slate-900/20">
        <CardTitle className="text-white text-2xl font-bold flex items-center">
          <TrendingUp className="mr-3 h-6 w-6 text-blue-500" />
          Budget Performance Analyzer
        </CardTitle>
        <CardDescription className="text-slate-400">
          Run high-precision AI diagnostics on official county budget reports.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">County Name</label>
            <Select value={county} onValueChange={(val) => { setCounty(val); setYear("") }}>
              <SelectTrigger className="bg-slate-900/80 border-slate-800 text-white h-12">
                <SelectValue placeholder="Select County" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-white shadow-2xl min-w-[240px]">
                <div className="p-2 border-b border-slate-800 flex items-center gap-2 sticky top-0 bg-slate-950 z-20">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search available counties..."
                    value={countySearch}
                    onChange={(e) => setCountySearch(e.target.value)}
                    className="h-9 text-sm bg-slate-900 border-slate-800 text-white focus-visible:ring-blue-500"
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1 py-1">
                  {filteredCounties.length > 0 ? (
                    filteredCounties.map((c) => (
                      <SelectItem
                        key={c}
                        value={c}
                        className="hover:bg-blue-600/20 focus:bg-blue-600/20 cursor-pointer rounded-md my-0.5 transition-colors border border-transparent hover:border-blue-500/30"
                      >
                        <span className="font-semibold">{c}</span>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-slate-500 text-center uppercase font-bold">No uploaded documents found</div>
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Period</label>
            <Select value={year} onValueChange={setYear} disabled={!county}>
              <SelectTrigger className="bg-slate-900/80 border-slate-800 text-white h-12">
                <SelectValue placeholder={county ? "Financial Year" : "Select County first"} />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white shadow-2xl">
                {availableYears.map((y) => (
                  <SelectItem key={y} value={y} className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 bg-slate-900/30 p-10 rounded-3xl border-2 border-dashed border-slate-800 transition-all hover:bg-slate-900/40">
          {currentDoc ? (
            <div className="flex flex-col items-center gap-6">
              {result?.method === "Stored Audit Report" && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-full flex items-center gap-3 animate-pulse">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Analysis Database Hit: Ready</span>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-4">
                <GPUAnalysisButton pdfId={currentDoc.filenames[0]} county={county} year={year} onAnalysisComplete={handleGPUResults} />
                <DoclingAnalysisButton pdfId={currentDoc.filenames[0]} county={county} year={year} onAnalysisComplete={handleGPUResults} />
                <GoogleAnalysisButton pdfId={currentDoc.filenames[0]} county={county} year={year} onAnalysisComplete={handleGPUResults} />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-slate-800/50 p-4 rounded-full w-fit mx-auto mb-4 border border-slate-700">
                <FileText className="h-8 w-8 text-slate-500 opacity-50" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Awaiting Selection</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[250px] mx-auto">Upload and select a county report to proceed with AI analysis.</p>
            </div>
          )}
        </div>

        {/* --- Results Display: Deep Space Audit Theme --- */}
        {result && (
          <div className="space-y-0 -mx-8 -mb-8 bg-slate-950/40 text-slate-300 border-t border-slate-800">
            {/* Header: PDF Banner Style */}
            <div className="bg-[#0f172a] text-white p-10">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-indigo-600 h-6 w-6 rounded-md flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">BudgetAI Integrity Suite</span>
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight uppercase">Budget Integrity Report</h3>
                  <p className="text-slate-400 text-sm font-medium">
                    {result.county.toUpperCase()} COUNTY | FINANCIAL YEAR {year}
                  </p>
                  <p className="text-indigo-400 text-[10px] font-bold tracking-widest mt-1 uppercase">
                    PIPELINE: {result.method?.toUpperCase() || "NEURAL ANALYSIS"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-10 space-y-12">
              {/* Risk Assessment: Score on Left, Description on Right */}
              {result.intelligence?.transparency_risk_score !== undefined && (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Fiscal Risk Assessment</p>
                  <div className="h-px bg-slate-200 w-full" />
                  <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-7xl font-black ${result.intelligence.transparency_risk_score > 60 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {result.intelligence.transparency_risk_score}
                      </span>
                      <span className="text-slate-400 font-bold text-2xl">/100</span>
                    </div>
                    <div className="flex-1 space-y-1 border-l-2 border-slate-800 pl-8">
                      <p className="font-bold text-lg text-slate-300">
                        {result.intelligence.transparency_risk_score > 60 ? 'CRITICAL OBSERVATION' : 'STABLE AUDIT PASS'}
                      </p>
                      <p className="text-sm text-slate-400 leading-relaxed font-semibold">
                        {result.intelligence.transparency_risk_score > 60
                          ? "Automated risk engines detected structural anomalies in reported vs verified data. Immediate manual review recommended."
                          : "Reported figures align with verified institutional landmarks. No significant structural variance detected."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Benchmarks: Emerald Pillar Box */}
              {result.raw_verified_data && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Immutable Data Landmarks (OSR Verification)</span>
                        <span className="text-[11px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Source: {result.raw_verified_data.source || "Official Audit Report"}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">OSR Revenue Target</p>
                        <p className="text-xl font-black text-blue-400">KSh {result.raw_verified_data.osr_target || "0"}</p>
                      </div>
                      <div className="space-y-1 border-l border-slate-800 pl-8">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">Actual OSR Collected</p>
                        <p className="text-xl font-black text-blue-400">KSh {result.raw_verified_data.osr_actual || "0"}</p>
                      </div>
                      <div className="space-y-1 border-l border-slate-800 pl-8">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">OSR Performance</p>
                        <p className="text-xl font-black text-blue-400">{result.raw_verified_data.osr_performance || "0"}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Metric Grid: White Cards with Technical IDs */}
              <div className="space-y-6">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-left">Neural Extraction Telemetry</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {result.key_metrics && Object.entries(result.key_metrics).map(([key, value]) => (
                    <div key={key} className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg text-left hover:bg-slate-900 transition-all border-l-4 border-l-slate-700">
                      <p className="text-[10px] text-slate-500 uppercase font-black mb-1 leading-tight">{key.replaceAll("_", " ")}</p>
                      <p className="text-lg font-black text-white tracking-tight">{formatValue(key, value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary: Narrative with Indigo Accent */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-black text-indigo-700 text-lg uppercase tracking-tight">Senior Audit Executive Narrative</h4>
                  <div className="h-1.5 bg-indigo-700 w-16" />
                </div>
                <div className="text-base text-emerald-400 leading-relaxed font-semibold whitespace-pre-line text-left">
                  {result.summary_text}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center pt-10 border-t border-slate-800">
                <Button onClick={downloadSummary} className="bg-white text-black hover:bg-slate-100 px-12 h-14 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform">
                  <Download className="h-4 w-4 mr-3" /> Export Integrity Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {userEmail && (
        <FeedbackModal
          open={showFeedbackModal}
          onOpenChange={setShowFeedbackModal}
          userEmail={userEmail}
          analysisId={currentAnalysisId}
        />
      )}
    </Card>
  )
}
