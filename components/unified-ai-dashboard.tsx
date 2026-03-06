"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Legend
} from "recharts"
import { Activity, RefreshCw, BarChart3, TrendingUp, AlertCircle, Info } from "lucide-react"
import { motion } from "framer-motion"

interface DashboardData {
    hot_insight: {
        topic: string
        description: string
        deep_dive: string[]
        keywords: string[]
        priority: number
    }
    daily_audit: {
        county_1: {
            name: string;
            budgeted: number;
            actual: number;
            compliance?: { wage_bill: number; development: number; audit_score: number };
            priorities?: { health: number; education: number; agriculture: number };
        }
        county_2: {
            name: string;
            budgeted: number;
            actual: number;
            compliance?: { wage_bill: number; development: number; audit_score: number };
            priorities?: { health: number; education: number; agriculture: number };
        }
        insight: string
    }
    economic_ticker: string[]
}

export function UnifiedAIDashboard({
    onTickerUpdate,
    onDataUpdate
}: {
    onTickerUpdate?: (headlines: string[]) => void,
    onDataUpdate?: (data: DashboardData) => void
}) {
    const [data, setData] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/trending-merits")
            const result = await response.json()
            if (result.success && result.merits.length > 0) {
                const syncData = result.merits[0] // Get latest daily sync
                const parsedData = {
                    hot_insight: {
                        topic: syncData.topic_name,
                        description: syncData.description,
                        deep_dive: syncData.raw_gemini_response?.hot_insight?.deep_dive || [],
                        keywords: syncData.keywords || [],
                        priority: syncData.priority_score
                    },
                    daily_audit: syncData.daily_audit,
                    economic_ticker: syncData.economic_ticker
                }
                setData(parsedData)
                if (onTickerUpdate) onTickerUpdate(syncData.economic_ticker)
                if (onDataUpdate) onDataUpdate(parsedData)
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        try {
            setIsRefreshing(true)
            const response = await fetch("/api/trending-merits/trigger", { method: "POST" })
            if (response.ok) await fetchData()
        } catch (error) {
            console.error("Error refreshing dashboard:", error)
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[450px]">
                <Skeleton className="lg:col-span-1 rounded-xl" />
                <Skeleton className="lg:col-span-2 rounded-xl" />
            </div>
        )
    }

    const chartData = data ? [
        {
            name: data.daily_audit.county_1.name,
            Budgeted: data.daily_audit.county_1.budgeted,
            Actual: data.daily_audit.county_1.actual,
        },
        {
            name: data.daily_audit.county_2.name,
            Budgeted: data.daily_audit.county_2.budgeted,
            Actual: data.daily_audit.county_2.actual,
        }
    ] : []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-accent" />
                    AI Daily Sync
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="h-8 bg-accent/5"
                >
                    <RefreshCw className={`h-3 w-3 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh Analysis
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Hot Insights */}
                <Card className="lg:col-span-1 border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="pb-3 border-b border-white/5">
                        <Badge className="w-fit mb-2 bg-accent/10 text-accent border-accent/20">Hot Insights</Badge>
                        <CardTitle className="text-xl font-plus-jakarta tracking-tight">{data?.hot_insight.topic}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2 leading-relaxed">{data?.hot_insight.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="space-y-3">
                            {data?.hot_insight.deep_dive.map((point, idx) => (
                                <div key={idx} className="flex gap-3 text-sm animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0 shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" />
                                    <p className="text-muted-foreground leading-snug">{point}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {data?.hot_insight.keywords.map((kw, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px] bg-accent/5">#{kw}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Center Panel: Daily Audit Comparison */}
                <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-2 border-b border-border/10 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-accent" />
                                Daily Audit: Revenue Performance
                            </CardTitle>
                            <CardDescription>
                                Comparing budgeted vs actual OSR for {data?.daily_audit.county_1.name} & {data?.daily_audit.county_2.name}
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="h-6 text-[10px] uppercase tracking-tighter border-accent/30 text-accent">
                            Gap Analysis
                        </Badge>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barGap={12}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "var(--font-geist-mono)", fontWeight: 400 }}
                                        tickFormatter={(val) => `${val}B`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "hsl(var(--accent))", opacity: 0.1 }}
                                        contentStyle={{
                                            backgroundColor: "rgba(10, 10, 10, 0.95)",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "12px",
                                            backdropFilter: "blur(4px)"
                                        }}
                                        formatter={(value: any) => [`${value}B`, "Amount"]}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="Budgeted" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Fiscal Violation Radar (Idea 1) */}
                        {data?.daily_audit.county_1.compliance && (
                            <div className="mt-8 pt-6 border-t border-border/10">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fiscal Compliance Radar: {data.daily_audit.county_1.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 w-8 bg-emerald-500/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-full animate-pulse" />
                                        </div>
                                        <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter">Live Audit Status</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    {/* Wage Bill Check */}
                                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3 hover:bg-white/[0.04] transition-colors group">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Wage Bill</p>
                                            <div className="h-4 w-4 rounded-full bg-slate-800 flex items-center justify-center">
                                                <TrendingUp className="h-2.5 w-2.5 text-slate-500" />
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-2xl font-black ${data.daily_audit.county_1.compliance.wage_bill > 35 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {data.daily_audit.county_1.compliance.wage_bill}%
                                            </span>
                                            <span className="text-[9px] text-slate-600 font-bold uppercase">/ 35% Limit</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-1.5 w-1.5 rounded-full ${data.daily_audit.county_1.compliance.wage_bill > 35 ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
                                            <p className="text-[9px] text-slate-400 font-medium">
                                                {data.daily_audit.county_1.compliance.wage_bill > 35 ? 'OVER CEILING' : 'COMPLIANT'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Development Allocation Check */}
                                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3 hover:bg-white/[0.04] transition-colors group">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Development</p>
                                            <div className="h-4 w-4 rounded-full bg-slate-800 flex items-center justify-center">
                                                <BarChart3 className="h-2.5 w-2.5 text-slate-500" />
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-2xl font-black ${data.daily_audit.county_1.compliance.development < 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                {data.daily_audit.county_1.compliance.development}%
                                            </span>
                                            <span className="text-[9px] text-slate-600 font-bold uppercase">/ 30% Floor</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-1.5 w-1.5 rounded-full ${data.daily_audit.county_1.compliance.development < 30 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                            <p className="text-[9px] text-slate-400 font-medium">
                                                {data.daily_audit.county_1.compliance.development < 30 ? 'BELOW TARGET' : 'HEALTHY ALLOCATION'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Audit Health Score */}
                                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3 hover:bg-white/[0.04] transition-colors group">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Audit Score</p>
                                            <div className="h-4 w-4 rounded-full bg-slate-800 flex items-center justify-center">
                                                <AlertCircle className="h-2.5 w-2.5 text-slate-500" />
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-2xl font-black ${data.daily_audit.county_1.compliance.audit_score < 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {data.daily_audit.county_1.compliance.audit_score}
                                            </span>
                                            <span className="text-[9px] text-slate-600 font-bold uppercase">/ 100 Health</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-1.5 w-1.5 rounded-full ${data.daily_audit.county_1.compliance.audit_score < 60 ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
                                            <p className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                                                {data.daily_audit.county_1.compliance.audit_score < 60 ? 'FISCAL RISK DETECTED' : 'LOW RISK PROFILE'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/10 flex gap-3">
                            <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground italic">
                                {data?.daily_audit.insight}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
