"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, ArrowRight, Globe, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { KenyaMap } from "@/components/landing-page/kenya-map"
import { LiveTicker } from "@/components/landing-page/live-ticker"
import { InsightCarousel } from "@/components/landing-page/insight-carousel"
import { CountySpotlight } from "@/components/landing-page/county-cards"
import { WhyItMatters } from "@/components/landing-page/why-it-matters"
import BlurFade from "@/components/magicui/blur-fade"
import RetroGrid from "@/components/magicui/retro-grid"
import Marquee from "@/components/magicui/marquee"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const scrollSpeed = useRef(0)
  const animationFrameId = useRef<number | null>(null)
  const [liveNodes, setLiveNodes] = useState<any[]>([])

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const res = await fetch("/api/landing-data")
        const data = await res.json()
        if (data.success) {
          setLiveNodes(data.live_nodes)
        }
      } catch (err) {
        console.error("Landing fetch error:", err)
      }
    }
    fetchLandingData()
  }, [])

  useEffect(() => {
    setIsVisible(true)

    const handleMouseMove = (e: MouseEvent) => {
      const h = window.innerHeight
      const y = e.clientY
      const zone = h * 0.15 // 15% trigger zone

      if (y < zone) {
        // Top zone: speed proportional to closeness to top
        scrollSpeed.current = -1 * (1 - y / zone) * 15
      } else if (y > h - zone) {
        // Bottom zone: speed proportional to closeness to bottom
        scrollSpeed.current = (1 - (h - y) / zone) * 15
      } else {
        scrollSpeed.current = 0
      }
    }

    const scrollLoop = () => {
      if (Math.abs(scrollSpeed.current) > 0.1) {
        window.scrollBy({ top: scrollSpeed.current, behavior: "auto" as any }) // using auto for instant updates in loop
      }
      animationFrameId.current = requestAnimationFrame(scrollLoop)
    }

    window.addEventListener("mousemove", handleMouseMove)
    animationFrameId.current = requestAnimationFrame(scrollLoop)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight font-plus-jakarta">
                Budget<span className="text-indigo-400">AI</span> <span className="text-slate-500 text-sm font-medium ml-1">v2.1</span>
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#impact" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Impact
              </Link>
              <Link href="#data" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Data
              </Link>
              <Link href="#why" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Why BudgetAI
              </Link>
              <div className="h-4 w-[1px] bg-slate-800" />
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/5" asChild>
                <Link href="/dashboard">Sign In</Link>
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-900/20 px-6" asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-0 overflow-hidden min-h-[92vh] flex flex-col justify-center">
        {/* Focal Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <RetroGrid className="opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto mb-20">
            <BlurFade delay={0.1} yOffset={20}>
              <Badge variant="outline" className="mb-8 px-5 py-2 border-indigo-500/30 text-indigo-300 bg-indigo-500/5 backdrop-blur-md text-xs font-bold uppercase tracking-widest">
                <Globe className="h-3.5 w-3.5 mr-2 animate-pulse" />
                Empowering National Fiscal Transparency
              </Badge>
            </BlurFade>

            <BlurFade delay={0.25} yOffset={20}>
              <h1 className="text-6xl md:text-[5.5rem] font-extrabold mb-10 tracking-tighter leading-[0.95] font-plus-jakarta">
                The Pulse of the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 animate-gradient">Fiscal Frontier</span>
              </h1>
            </BlurFade>

            <BlurFade delay={0.4} yOffset={20}>
              <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                Harnessing AI to decode complex government reports into an <span className="text-white font-medium">unfiltered, real-time map</span> of public spending.
              </p>
            </BlurFade>

            <BlurFade delay={0.55} yOffset={20}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
                <Button size="xl" className="h-16 px-12 text-xl bg-indigo-600 hover:bg-indigo-500 text-white group shadow-2xl shadow-indigo-900/40 transition-all duration-300 border-0 font-plus-jakarta rounded-2xl" asChild>
                  <Link href="/subscribe">
                    Analyze Budgets
                    <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" className="h-16 px-12 text-xl border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 text-white backdrop-blur-xl hover:border-slate-500 transition-all duration-300 rounded-2xl">
                  Evidence Portal
                </Button>
              </div>
            </BlurFade>
          </div>

          <BlurFade delay={0.8} yOffset={40} blur="15px">
            {/* Interactive Map Section */}
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] -z-10 rounded-full" />
              <KenyaMap />
            </div>
          </BlurFade>
        </div>

        {/* Live Ticker */}
        <div className="mt-20 border-t border-white/5 bg-slate-950/20 backdrop-blur-sm">
          <LiveTicker />
        </div>
      </section>

      {/* Command Center: Live Data Stream */}
      <section className="py-32 relative overflow-hidden bg-slate-950">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative space-y-8">
              <BlurFade delay={0.2} inView>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
                  Neural Extraction Engine
                </Badge>
                <h2 className="text-5xl md:text-6xl font-bold tracking-tighter leading-[1.1] font-plus-jakarta">
                  Streaming <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 italic">Audit Intelligence</span>
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-transparent rounded-full" />
                <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
                  Our neural extractors process thousands of fiscal nodes per second, documenting the granular flow between national treasury and local execution.
                </p>

                <div className="flex items-center gap-12 pt-4">
                  <div className="space-y-1">
                    <p className="text-3xl font-bold font-mono tabular-nums text-white">47</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Active Counties</p>
                  </div>
                  <div className="h-10 w-[1px] bg-slate-800" />
                  <div className="space-y-1">
                    <p className="text-3xl font-bold font-mono tabular-nums text-emerald-400">99.8%</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sync Precision</p>
                  </div>
                </div>
              </BlurFade>
            </div>

            <div className="h-[500px] relative overflow-hidden flex gap-6 p-4 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] shadow-2xl">
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950 to-transparent z-10" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-10" />

              <Marquee vertical className="[--duration:25s] flex-1" pauseOnHover>
                {(liveNodes.length > 0 ? liveNodes.slice(0, 5) : [
                  { county: "Nairobi", val: "12.4B", trend: "+4.2%", status: "Balanced", color: "blue" },
                  { county: "Mombasa", val: "8.1B", trend: "-1.5%", status: "Critical", color: "red" },
                  { county: "Kisumu", val: "6.7B", trend: "+0.8%", status: "Stable", color: "emerald" },
                  { county: "Nakuru", val: "9.2B", trend: "+2.1%", status: "Stable", color: "blue" },
                  { county: "Turkana", val: "7.4B", trend: "+12.4%", status: "Surplus", color: "emerald" },
                ]).map((node, i) => (
                  <div key={i} className="group bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-indigo-500/40 transition-all duration-300 p-5 rounded-2xl w-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-slate-500">ID_{(node.county || "KNY").slice(0, 3).toUpperCase()}_021</div>
                      <div className={`h-1.5 w-1.5 rounded-full bg-${node.color}-500 shadow-[0_0_8px_rgba(var(--${node.color}-500),0.5)]`} />
                    </div>
                    <h4 className="text-lg font-bold font-plus-jakarta">{node.county}</h4>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Total Allocation</p>
                        <span className="text-2xl font-bold font-mono tabular-nums">KSh {node.val}</span>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-mono ${(node.trend || '+0%').startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{node.trend}</p>
                        <Badge variant="outline" className="text-[9px] h-4 mt-1 border-white/10 uppercase tracking-tighter px-1.5">{node.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </Marquee>

              <Marquee vertical reverse className="[--duration:30s] flex-1" pauseOnHover>
                {(liveNodes.length > 5 ? liveNodes.slice(5) : [
                  { county: "Kiambu", val: "11.2B", trend: "+2.4%", status: "Stable", color: "blue" },
                  { county: "Machakos", val: "8.9B", trend: "+1.1%", status: "Balanced", color: "blue" },
                  { county: "Kakamega", val: "7.8B", trend: "+5.6%", status: "Growth", color: "emerald" },
                  { county: "Kilifi", val: "6.4B", trend: "-3.2%", status: "Alert", color: "orange" },
                  { county: "Laikipia", val: "5.1B", trend: "+0.4%", status: "Stable", color: "blue" },
                ]).map((node, i) => (
                  <div key={i} className="group bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-cyan-500/40 transition-all duration-300 p-5 rounded-2xl w-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-slate-500">REF_{(node.county || "KNY").slice(0, 3).toUpperCase()}_X</div>
                      <div className={`h-1.5 w-1.5 rounded-full animate-pulse bg-${node.color}-500 shadow-[0_0_8px_rgba(var(--${node.color}-500),0.5)]`} />
                    </div>
                    <h4 className="text-lg font-bold font-plus-jakarta">{node.county}</h4>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Budget Utilization</p>
                        <span className="text-2xl font-bold font-mono tabular-nums">KSh {node.val}</span>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-mono ${(node.trend || '+0%').startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{node.trend}</p>
                        <Badge variant="outline" className="text-[9px] h-4 mt-1 border-white/10 uppercase tracking-tighter px-1.5">{node.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
        </div>
      </section>

      {/* Insight Carousel Section */}
      <section id="impact" className="py-32 relative bg-slate-950">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="container mx-auto px-6 mb-16 text-center">
          <BlurFade inView>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight font-plus-jakarta">Evidence-Led Narrative</h3>
            <p className="text-slate-400 mt-4">Stories of fiscal impact across the 47 counties</p>
          </BlurFade>
        </div>
        <InsightCarousel />
      </section>

      {/* County Spotlight Section */}
      <section id="data" className="py-24 bg-slate-950/20">
        <CountySpotlight />
      </section>

      {/* Why It Matters / Trade-off Section */}
      <section id="why" className="py-24 border-t border-slate-900">
        <WhyItMatters />
      </section>

      {/* CTA Section */}
      <section className="py-40 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-600/20 via-slate-950 to-slate-950 -z-10" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />

        <div className="container mx-auto px-6 text-center">
          <BlurFade inView>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tighter font-plus-jakarta">
              Ready to JOIN THE <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">TRANSPARENCY REVOLUTION?</span>
            </h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Join the movement towards data-driven governance. Get instant access to county budget insights today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="xl" className="h-16 px-12 text-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] rounded-2xl font-plus-jakarta" asChild>
                <Link href="/subscribe">Start Analysis Free</Link>
              </Button>
              <Button variant="outline" size="xl" className="h-16 px-12 text-xl border-slate-800 text-slate-300 hover:text-white hover:bg-white/5 backdrop-blur-md rounded-2xl">
                Contact Strategy
              </Button>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 lg:gap-24">
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold font-plus-jakarta tracking-tight">BudgetAI <span className="text-indigo-400">2.1</span></span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed font-light">
                Kenya's most advanced fiscal transparency engine. Turning government data into public power with neural intelligence.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-12 lg:col-span-1">
              <div>
                <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Ecosystem</h4>
                <ul className="space-y-4 text-sm text-slate-500">
                  <li><Link href="#" className="hover:text-indigo-400 transition-colors">Real-time Map</Link></li>
                  <li><Link href="#" className="hover:text-indigo-400 transition-colors">County Audit Logs</Link></li>
                  <li><Link href="#" className="hover:text-indigo-400 transition-colors">Neural Analysis</Link></li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-12 lg:col-span-1">
              <div>
                <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Resources</h4>
                <ul className="space-y-4 text-sm text-slate-500">
                  <li><Link href="#" className="hover:text-indigo-400 transition-colors">Documentation</Link></li>
                  <li><Link href="#" className="hover:text-indigo-400 transition-colors">Open Data Portal</Link></li>
                  <li><Link href="#" className="hover:text-indigo-400 transition-colors">Integrity Protocol</Link></li>
                </ul>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Intelligence Sync</h4>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-slate-500 font-mono mb-2 uppercase tracking-tighter">System Health</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">All Extractors Operational</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] gap-6">
            <p>© 2026 BudgetAI 2.1. Built for the citizens of Kenya.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-white transition-colors">Security</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Ethics</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
