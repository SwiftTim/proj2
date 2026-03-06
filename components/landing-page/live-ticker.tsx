import React, { useState, useEffect } from "react"
import { COUNTY_FACTS } from "@/lib/county-facts"

const getAlertColor = (health: string) => {
  switch (health?.toLowerCase()) {
    case "critical": return "text-red-500"
    case "warning": return "text-amber-500"
    case "leader": return "text-emerald-500"
    case "stable": return "text-emerald-500"
    case "improving": return "text-purple-500"
    default: return "text-slate-400"
  }
}

export function LiveTicker() {
  const [alerts, setAlerts] = useState<any[]>([])

  // Function to localize alerts
  const refreshAlerts = async () => {
    try {
      const res = await fetch("/api/landing-data")
      const data = await res.json()
      if (data.success && data.trending?.ticker?.length > 0) {
        const tickerAlerts = data.trending.ticker.map((t: any) => ({
          type: (t.type || "INFO").toUpperCase(),
          message: t.text,
          color: getAlertColor(t.health || "stable")
        }))
        setAlerts(tickerAlerts)
        return
      }
    } catch (err) {
      console.error("Ticker fetch error:", err)
    }

    // Fallback to randomized local facts
    const shuffled = [...COUNTY_FACTS].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 10).map(c => ({
      type: c.fiscalHealth.toUpperCase(),
      message: `${c.name}: ${c.aiInsight}`,
      color: getAlertColor(c.fiscalHealth)
    }))
    setAlerts(selected)
  }

  useEffect(() => {
    refreshAlerts() // Initial load
    const interval = setInterval(refreshAlerts, 60000) // Refresh every 1 min
    return () => clearInterval(interval)
  }, [])

  if (alerts.length === 0) return null

  return (
    <div className="w-full bg-black/80 backdrop-blur-md border-y border-slate-800 py-3 overflow-hidden whitespace-nowrap">
      <div className="flex animate-marquee">
        {[...alerts, ...alerts].map((alert, index) => (
          <div key={index} className="flex items-center mx-8 text-sm font-medium">
            <span className={`mr-2 font-bold ${alert.color}`}>[{alert.type}]</span>
            <span className="text-slate-300">{alert.message}</span>
            <span className="mx-4 text-slate-700">•</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
