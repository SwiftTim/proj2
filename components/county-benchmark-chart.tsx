"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts"
import { TrendingUp, Scale } from "lucide-react"

interface Props {
    data?: {
        county_name: string;
        priorities: {
            health: number;
            education: number;
            agriculture: number;
        }
    }
}

export function CountyBenchmarkChart({ data }: Props) {
    // Mock data if none provided (for initial load)
    const chartData = [
        {
            subject: 'Health',
            County: data?.priorities.health || 12,
            National: 18,
        },
        {
            subject: 'Education',
            County: data?.priorities.education || 22,
            National: 25,
        },
        {
            subject: 'Agriculture',
            County: data?.priorities.agriculture || 8,
            National: 10,
        },
    ];

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/10">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Scale className="h-5 w-5 text-blue-400" />
                    Priority Benchmarking
                </CardTitle>
                <CardDescription>
                    {data?.county_name || "Trending County"} vs. National Average
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            barGap={8}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted/20" />
                            <XAxis
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                                unit="%"
                            />
                            <YAxis
                                type="category"
                                dataKey="subject"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 600 }}
                            />
                            <Tooltip
                                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                                contentStyle={{
                                    backgroundColor: "rgba(10, 10, 10, 0.9)",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "12px",
                                }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                            <Bar dataKey="County" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                            <Bar dataKey="National" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6 space-y-3">
                    <div className={`p-3 rounded-lg border flex gap-3 ${(data?.priorities.health || 12) < 18 ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
                        }`}>
                        <TrendingUp className={`h-4 w-4 shrink-0 mt-0.5 ${(data?.priorities.health || 12) < 18 ? 'text-red-400' : 'text-emerald-400'
                            }`} />
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Gap Analysis: Health</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {(data?.priorities.health || 12) < 18
                                    ? `${data?.county_name || 'County'} is spending ${18 - (data?.priorities.health || 12)}% less on health than the national average. Potential service delivery risk.`
                                    : `${data?.county_name || 'County'} exceeds the national average for health spending by ${(data?.priorities.health || 12) - 18}%.`}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
