"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  FileText,
  BarChart3,
  Users,
  TrendingUp,
  Search,
  Filter,
  LogOut,
  ArrowLeft,
  Settings,
  FileBarChart,
  ArrowRightLeft,
} from "lucide-react"

import { DashboardStats } from "@/components/dashboard-stats"
import { BudgetChart } from "@/components/budget-chart"
import { DocumentList } from "@/components/document-list"
import { UploadModule } from "@/components/upload-module"
import { AnalysisScorecard } from "@/components/analysis-module"
import { ComparisonModule } from "@/components/comparison-module"
import { NationalBudgetHeader } from "@/components/national-budget-header"
import { CountyAllocationCarousel } from "@/components/county-allocation-carousel"
import { UnifiedAIDashboard } from "@/components/unified-ai-dashboard"
import { SectoralAllocationChart } from "@/components/sectoral-allocation-chart"
import { CountyBenchmarkChart } from "@/components/county-benchmark-chart"
import { EconomicTicker } from "@/components/economic-ticker"
import { AuthModal } from "@/components/auth-modal"
import { ProfileSettingsModal } from "@/components/profile-settings-modal"
import { ErrorBoundary } from "@/components/error-boundary"
import { DashboardSkeleton, DocumentListSkeleton } from "@/components/loading-skeleton"
import Link from "next/link"

interface User {
  name: string
  email: string
  role: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [headlines, setHeadlines] = useState<string[]>([])
  const [trendingData, setTrendingData] = useState<any>(null)

  useEffect(() => {
    const initializeDashboard = async () => {
      // Simulate loading time
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Check for existing auth
      const savedUser = localStorage.getItem("auth_user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }

      setIsLoading(false)
    }

    initializeDashboard()
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem("auth_user")
    setUser(null)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "researcher":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      case "journalist":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      case "government":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "admin":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      default:
        return "bg-chart-4/10 text-chart-4 border-chart-4/20"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header skeleton */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-accent rounded" />
                <div>
                  <div className="h-6 w-48 bg-muted rounded mb-1" />
                  <div className="h-4 w-64 bg-muted rounded" />
                </div>
              </div>
              <div className="h-8 w-24 bg-muted rounded" />
            </div>
          </div>
        </header>

        {/* Content skeleton */}
        <main className="container mx-auto px-4 py-8">
          <DashboardSkeleton />
        </main>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background pb-16">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4 justify-between md:justify-start">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/" aria-label="Go to Home page">
                    <ArrowLeft className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Home</span>
                  </Link>
                </Button>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-accent" aria-hidden="true" />
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-foreground font-plus-jakarta">BudgetAI Dashboard</h1>
                    <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">National Fiscal Transparency Engine</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 md:space-x-6 w-full md:w-auto mt-4 md:mt-0">
                <NationalBudgetHeader />
                <div className="hidden sm:block h-8 w-px bg-border mx-2" />
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{user.name}</p>
                      <div className="flex items-center gap-2">
                        {user.role === "admin" && (
                          <Button variant="ghost" size="sm" asChild className="h-6 px-2 text-[10px] bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border border-purple-500/20">
                            <Link href="/admin">
                              <Settings className="h-3 w-3 mr-1" />
                              Management
                            </Link>
                          </Button>
                        )}
                        <Badge className={getRoleBadgeColor(user.role)} variant="secondary">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowProfileModal(true)} className="h-9 w-9 p-0 rounded-full border border-border">
                      <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        <CountyAllocationCarousel />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full h-auto flex flex-wrap justify-center gap-2 bg-muted/50 p-2 rounded-xl lg:w-auto lg:inline-flex lg:flex-nowrap">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center space-x-2" disabled={!user}>
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Documents</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center space-x-2" disabled={!user}>
                <TrendingUp className="h-4 w-4" />
                <span>Deep Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center space-x-2" disabled={!user}>
                <ArrowRightLeft className="h-4 w-4" />
                <span>Benchmarking</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Budget Overview</h2>
                  <p className="text-sm md:text-base text-muted-foreground">Unified audit of national and county fiscal performance</p>
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                      placeholder="Search counties…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full md:w-64"
                      autoComplete="off"
                      aria-label="Search counties"
                    />
                  </div>
                </div>
              </div>

              <Suspense fallback={<DashboardSkeleton />}>
                <DashboardStats />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <UnifiedAIDashboard
                      onTickerUpdate={setHeadlines}
                      onDataUpdate={(data) => setTrendingData(data.daily_audit.county_1)}
                    />
                  </div>
                  <div className="lg:col-span-1 space-y-6">
                    <SectoralAllocationChart
                      trendingData={trendingData ? {
                        name: trendingData.name,
                        priorities: trendingData.priorities || { health: 12, education: 22, agriculture: 8 }
                      } : undefined}
                    />
                  </div>
                </div>
              </Suspense>
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              {user ? (
                <>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">Upload Budget Documents</h2>
                    <p className="text-muted-foreground">
                      Upload PDF budget documents for AI analysis and summarization
                    </p>
                  </div>
                  <ErrorBoundary>
                    <UploadModule />
                  </ErrorBoundary>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication Required</CardTitle>
                    <CardDescription>Please sign in to upload documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setShowAuthModal(true)}>
                      <Users className="h-4 w-4 mr-2" />
                      Sign In to Upload
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Document Library</h2>
                <p className="text-muted-foreground">Browse and analyze uploaded budget documents</p>
              </div>
              <Suspense fallback={<DocumentListSkeleton />}>
                <ErrorBoundary>
                  <DocumentList />
                </ErrorBoundary>
              </Suspense>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              {user ? (
                <>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">AI Analysis</h2>
                    <p className="text-muted-foreground">
                      Advanced insights and trends from budget data
                    </p>
                  </div>

                  <ErrorBoundary>
                    <AnalysisScorecard userEmail={user.email} />
                  </ErrorBoundary>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication Required</CardTitle>
                    <CardDescription>
                      Please sign in to access advanced analysis features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setShowAuthModal(true)}>
                      <Users className="h-4 w-4 mr-2" />
                      Sign In for Analysis
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              {user ? (
                <>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">County Comparison</h2>
                    <p className="text-muted-foreground">
                      Side-by-side financial performance benchmarking
                    </p>
                  </div>

                  <ErrorBoundary>
                    <ComparisonModule />
                  </ErrorBoundary>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication Required</CardTitle>
                    <CardDescription>
                      Please sign in to access comparison features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setShowAuthModal(true)}>
                      <Users className="h-4 w-4 mr-2" />
                      Sign In for Comparison
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

          </Tabs>
        </main>

        <EconomicTicker headlines={headlines} />

        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onAuthSuccess={setUser} />
        {user && (
          <ProfileSettingsModal
            open={showProfileModal}
            onOpenChange={setShowProfileModal}
            currentUser={user}
            onUpdateSuccess={(updatedUser) => setUser(updatedUser)}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}
