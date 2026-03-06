"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { NATIONAL_BUDGET_2025 } from "@/lib/dashboard-constants"

import { TrendingUp, Scale } from "lucide-react"

interface Props {
    trendingData?: {
        name: string;
        priorities?: {
            health: number;
            education: number;
            agriculture: number;
        }
    }
}

export function SectoralAllocationChart({ trendingData }: Props) {
    const data = NATIONAL_BUDGET_2025.sectoral_allocation;

    const benchmarkData = [
        { subject: 'Health', County: trendingData?.priorities?.health || 12, National: 3.22 },
        { subject: 'Education', County: trendingData?.priorities?.education || 22, National: 16.37 },
        { subject: 'Agri', County: trendingData?.priorities?.agriculture || 8, National: 1.11 },
    ];

    return (
        <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg">Budget Share</CardTitle>
                <CardDescription>National Sectoral Allocation {NATIONAL_BUDGET_2025.fiscal_year}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="amount"
                                nameKey="sector"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#06b6d4', '#10b981', '#6366f1', '#f59e0b', '#f43f5e', '#8b5cf6'][index % 6]} stroke="rgba(0,0,0,0.5)" />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `Ksh ${(value / 1e9).toFixed(1)}B`}
                                contentStyle={{
                                    backgroundColor: "rgba(10, 10, 10, 0.8)",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "12px",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2">
                    {data.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: ['#06b6d4', '#10b981', '#6366f1', '#f59e0b', '#f43f5e', '#8b5cf6'][idx % 6], color: ['#06b6d4', '#10b981', '#6366f1', '#f59e0b', '#f43f5e', '#8b5cf6'][idx % 6] }} />
                                <span className="text-slate-300 font-medium">{item.sector}</span>
                            </div>
                            <span className="font-semibold">{item.percentage}%</span>
                        </div>
                    ))}
                </div>

                {/* Integrated Priority Benchmark */}
                <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Scale className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                {trendingData?.name || "County"} vs National
                            </span>
                        </div>
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-blue-500/30 text-blue-400 uppercase">Gap Analysis</Badge>
                    </div>

                    <div className="space-y-4">
                        {benchmarkData.map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-slate-400">{item.subject}</span>
                                    <div className="flex gap-2">
                                        <span className="text-accent font-bold">{item.County}%</span>
                                        <span className="text-slate-600">vs</span>
                                        <span className="text-slate-500">{item.National}%</span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full bg-accent relative group-hover:brightness-110 transition-all"
                                        style={{ width: `${(item.County / (item.County + item.National)) * 100}%` }}
                                    />
                                    <div
                                        className="h-full bg-slate-700 opacity-40"
                                        style={{ width: `${(item.National / (item.County + item.National)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={`p-2.5 rounded-lg border text-[10px] leading-relaxed ${(trendingData?.priorities?.health || 12) < 15 ? 'bg-red-500/5 border-red-500/10 text-red-400/80' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/80'
                        }`}>
                        <div className="flex gap-2">
                            <TrendingUp className="h-3 w-3 shrink-0" />
                            <p>
                                {trendingData?.name || 'Selected county'} shows a **{Math.abs(15 - (trendingData?.priorities?.health || 12))}% variance** in health spend compared to national standards.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

import { Badge } from "@/components/ui/badge"
