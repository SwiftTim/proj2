"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    ShieldCheck,
    Users,
    User,
    Database,
    Terminal,
    Settings,
    ChevronRight,
    LogOut,
    ArrowLeft,
    Activity,
    AlertTriangle,
    FileText,
    Save,
    Trash2,
    RefreshCw,
    Eye,
    Star,
    MessageSquare,
    Zap
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileSettingsModal } from "@/components/profile-settings-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSuccessNotification, useErrorNotification } from "@/components/toast-notifications"
import Link from "next/link"

// --- Data Interfaces ---
interface DashboardData {
    stats: {
        users: string | number;
        uploads: string | number;
        analysis: string | number;
        failures: string | number;
    };
    logs: any[];
    users: any[];
    documents: any[];
    reports: any[];
    engines: any[];
    explorer: {
        trending_merits: any;
        analysis_results: any[];
        uploads: any[];
    };
}

export default function AdminPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [activeTab, setActiveTab] = useState("overview")
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [dbData, setDbData] = useState<DashboardData | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [totalBudget, setTotalBudget] = useState("4291900000000")
    const [equitableShare, setEquitableShare] = useState("415000000000")

    // Explorer States
    const [selectedTable, setSelectedTable] = useState("uploads")
    const [tableData, setTableData] = useState<any>(null)
    const [isTableLoading, setIsTableLoading] = useState(false)
    const [sysLogs, setSysLogs] = useState<{ npm: string[], python: string[] }>({ npm: [], python: [] })
    const [showProfileModal, setShowProfileModal] = useState(false)

    const showSuccess = useSuccessNotification()
    const showError = useErrorNotification()

    const fetchTableData = async (tableName: string) => {
        setIsTableLoading(true)
        setSelectedTable(tableName)
        try {
            const res = await fetch(`/api/admin/explorer?table=${tableName}`)
            const data = await res.json()
            if (data.success) {
                setTableData(data.rows)
            }
        } catch (err) {
            console.error("Explorer fetch error:", err)
        } finally {
            setIsTableLoading(false)
        }
    }

    const handleSaveSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: "NATIONAL_BUDGET_2025",
                    value: {
                        total_budget: parseInt(totalBudget),
                        county_equitable_share_total: parseInt(equitableShare),
                    }
                })
            })
            if (res.ok) {
                showSuccess("Settings Synchronized", "Global budget constants have been updated across the platform.")
            }
        } catch (err) {
            showError("Save Failed", "Could not commit changes to system_settings table.")
        }
    }

    const fetchAdminData = async () => {
        setIsRefreshing(true)
        try {
            const [dashRes, settingsRes, logRes] = await Promise.all([
                fetch("/api/admin/dashboard"),
                fetch("/api/admin/settings"),
                fetch("/api/admin/system-logs")
            ])

            const dashData = await dashRes.json()
            const settingsData = await settingsRes.json()
            const logData = await logRes.json()

            if (dashData.success) setDbData(dashData)
            if (logData.success) setSysLogs(logData.logs)

            if (settingsData.success && settingsData.settings.NATIONAL_BUDGET_2025) {
                const cfg = settingsData.settings.NATIONAL_BUDGET_2025
                setTotalBudget(cfg.total_budget.toString())
                setEquitableShare(cfg.county_equitable_share_total.toString())
            }

            if (!dashData.success) {
                showError("Connection Failed", "Could not synchronize with the backend database.")
            }
        } catch (err) {
            console.error("Dashboard refresh error:", err)
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        const savedUser = localStorage.getItem("auth_user")
        if (!savedUser) {
            router.push("/")
            return
        }

        const parsedUser = JSON.parse(savedUser)
        if (parsedUser.role !== "admin") {
            router.push("/dashboard")
            return
        }

        setUser(parsedUser)
        setIsAuthorized(true)
        fetchAdminData()
    }, [router])

    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            {/* Admin Sidebar Layout */}
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 min-h-screen border-r border-slate-800 bg-slate-950/50 flex flex-col pt-8">
                    <div className="px-6 mb-8 flex items-center gap-3">
                        <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black tracking-widest uppercase">Command Center</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">BudgetAI SuperAdmin</p>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {[
                            { id: "overview", label: "System Health", icon: Activity },
                            { id: "users", label: "User Management", icon: Users },
                            { id: "vault", label: "Document Vault", icon: FileText },
                            { id: "reports", label: "Audit Reports", icon: ShieldCheck },
                            { id: "data", label: "Data Explorer", icon: Database },
                            { id: "logs", label: "Live System Logs", icon: Zap },
                            { id: "feedback", label: "User Feedback", icon: MessageSquare },
                            { id: "config", label: "Global Constants", icon: Settings },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === item.id
                                    ? "bg-purple-600/10 text-purple-400 border border-purple-600/20"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                    }`}
                            >
                                <item.icon className={`h-4 w-4 ${activeTab === item.id ? "text-purple-400" : "text-slate-600"}`} />
                                {item.label}
                                {activeTab === item.id && <ChevronRight className="h-3 w-3 ml-auto" />}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 mt-auto border-t border-slate-800 space-y-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowProfileModal(true)}
                            className="w-full justify-start text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            User Settings
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="w-full justify-start text-xs font-bold text-slate-500 hover:text-white">
                            <Link href="/dashboard">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                            localStorage.removeItem("auth_user")
                            router.push("/")
                        }} className="w-full justify-start text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-900/10 mt-2">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out / Exit
                        </Button>
                    </div>
                </aside>

                {/* Main Workspace */}
                <main className="flex-1 p-10 max-w-7xl">
                    <header className="mb-10 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">
                                {activeTab.replace("-", " ")}
                            </h2>
                            <div className="h-1 w-20 bg-purple-600 mt-2 rounded-full" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">Current Session as</p>
                                <p className="text-xs font-bold text-slate-300">{user.email}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center">
                                <User className="h-5 w-5 text-purple-400" />
                            </div>
                        </div>
                    </header>

                    <Tabs value={activeTab} className="space-y-6">
                        <TabsContent value="overview">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: "Active Connections", value: dbData?.stats.users || "0", icon: Users, color: "text-blue-400" },
                                    { label: "Process Count", value: dbData?.stats.uploads || "0", icon: RefreshCw, color: "text-emerald-400" },
                                    { label: "System Failures", value: dbData?.stats.failures || "0", icon: AlertTriangle, color: "text-red-500" },
                                    { label: "Audit Records", value: dbData?.stats.analysis || "0", icon: Database, color: "text-indigo-400" },
                                ].map((stat, i) => (
                                    <Card key={i} className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                                        <CardHeader className="p-4 pb-0">
                                            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-2">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                                                <stat.icon className={`h-4 w-4 ${stat.color} opacity-50`} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardHeader className="border-b border-slate-800">
                                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Processing Engine Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        {(dbData?.engines || [
                                            { name: "OCRFlux (GPU)", status: "Operational", uptime: "99.9%", delay: "0.4s" },
                                            { name: "Docling Engine", status: "Operational", uptime: "98.5%", delay: "1.2s" },
                                            { name: "Gemini 2.5 Bridge", status: "Operational", uptime: "100%", delay: "0.1s" },
                                            { name: "PostgreSQL Data Sink", status: "Operational", uptime: "99.2%", delay: "4.5ms" },
                                        ]).map((engine: any) => (
                                            <div key={engine.name} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-2 w-2 rounded-full ${engine.status === 'Operational' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                                                    <span className="text-xs font-bold text-slate-300">{engine.name}</span>
                                                </div>
                                                <div className="flex items-center gap-8 text-[10px] font-mono text-slate-500">
                                                    <span>{engine.uptime} UPTIME</span>
                                                    <span className="w-12 text-right">{engine.delay}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardHeader className="border-b border-slate-800 flex flex-row items-center justify-between">
                                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Recent System Activity</CardTitle>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={fetchAdminData} disabled={isRefreshing}>
                                            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-slate-800">
                                            {dbData?.logs && dbData.logs.length > 0 ? dbData.logs.slice(0, 5).map((log) => (
                                                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase text-purple-400 tracking-tight">{log.event}</p>
                                                        <p className="text-[9px] text-slate-500 font-medium truncate max-w-[200px]">{log.details}</p>
                                                    </div>
                                                    <span className="text-[9px] font-mono text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                            )) : (
                                                <div className="p-10 text-center text-xs text-slate-600 italic">No recent activity found.</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="users">
                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 gap-4">
                                    <div>
                                        <CardTitle className="text-lg font-bold">Identity Master</CardTitle>
                                        <CardDescription className="text-xs font-medium">Manage and audit system roles</CardDescription>
                                    </div>
                                    <Button className="bg-purple-600 hover:bg-purple-700 h-9 font-bold text-xs uppercase tracking-widest px-6">Invite User</Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Role</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Last Login</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {dbData?.users && dbData.users.length > 0 ? dbData.users.map((u) => (
                                                <tr key={u.id} className="text-xs hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-slate-300">
                                                        {u.name || "Unnamed User"}
                                                        <p className="text-[10px] text-slate-500 font-medium">{u.email}</p>
                                                    </td>
                                                    <td className="px-6 py-4 capitalize font-mono text-[10px]">
                                                        <Badge variant="outline" className={`border-slate-700 ${u.role === 'admin' ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' : 'text-slate-400'}`}>
                                                            {u.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 capitalize text-[10px]">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`h-1.5 w-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                            {u.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 font-mono text-[10px]">{new Date(u.lastLogin).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-purple-400 h-8 font-bold text-[10px]"
                                                                onClick={() => {
                                                                    setActiveTab("logs")
                                                                    showSuccess("User Audit Filtered", `Viewing system actions for ${u.email}`)
                                                                }}
                                                            >
                                                                View Audit
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-900/10"><Trash2 className="h-3 w-3" /></Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-600 italic">No users found in user_roles table.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="vault">
                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800">
                                    <div>
                                        <CardTitle className="text-lg font-bold">Document Vault</CardTitle>
                                        <CardDescription className="text-xs font-medium">Review and manage raw PDF uploads</CardDescription>
                                    </div>
                                    <Button size="sm" variant="outline" className="h-9 border-slate-700 font-bold" onClick={fetchAdminData}>
                                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> Sync Vault
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4">County / File</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Analyzed</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {dbData?.documents && dbData.documents.length > 0 ? dbData.documents.map((doc) => (
                                                <tr key={doc.id} className="text-xs hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-200">{doc.county}</p>
                                                        <p className="text-[10px] text-slate-500">{doc.filename || 'PDF Archive'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className={doc.upload_status === 'completed' ? 'text-emerald-400 border-emerald-400/20' : 'text-amber-400 border-amber-400/20'}>
                                                            {doc.upload_status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="ghost" size="sm" className="text-purple-400 h-8 font-bold">Inspect</Button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={4} className="p-10 text-center text-slate-600 italic">No documents found in vault.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="reports" className="space-y-6">
                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800">
                                    <div>
                                        <CardTitle className="text-lg font-bold">Generated Documents</CardTitle>
                                        <CardDescription className="text-xs font-medium">Downloadable PDF/Word exports</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4">Report Type</th>
                                                <th className="px-6 py-4">County</th>
                                                <th className="px-6 py-4">Format</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {dbData?.reports && dbData.reports.length > 0 ? dbData.reports.map((rep) => (
                                                <tr key={rep.id} className="text-xs hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-slate-300">{rep.report_type}</td>
                                                    <td className="px-6 py-4">{rep.county}</td>
                                                    <td className="px-6 py-4 uppercase font-mono text-[10px] text-slate-500">{rep.format}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="outline" size="sm" className="h-7 text-[9px] border-slate-700">Download</Button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={4} className="p-10 text-center text-slate-600 italic">No exported reports found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800">
                                    <div>
                                        <CardTitle className="text-lg font-bold">Analysis Results Stream</CardTitle>
                                        <CardDescription className="text-xs font-medium">Live AI processing outputs and risk scores</CardDescription>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-xs text-purple-400 font-bold" onClick={() => setActiveTab("data")}>
                                        Explore All Raw Data →
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4">County</th>
                                                <th className="px-6 py-4">Risk Score</th>
                                                <th className="px-6 py-4">Fiscal Year</th>
                                                <th className="px-6 py-4 text-right">Intelligence</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {dbData?.explorer?.analysis_results && dbData.explorer.analysis_results.length > 0 ? dbData.explorer.analysis_results.map((res: any) => (
                                                <tr key={res.id} className="text-xs hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-slate-300">{res.county}</td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className={`font-mono ${res.risk_score > 70 ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                                                            res.risk_score > 40 ? 'text-amber-400 border-amber-500/30' : 'text-emerald-400 border-emerald-500/30'
                                                            }`}>
                                                            {res.risk_score}%
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-slate-500">{res.year || "2024/25"}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-purple-400 h-8 font-bold text-[10px]"
                                                            onClick={() => {
                                                                fetchTableData("analysis_results")
                                                                setActiveTab("data")
                                                            }}
                                                        >
                                                            View JSON
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={4} className="p-10 text-center text-slate-600 italic">No analysis results stream recorded.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="logs">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
                                {/* NPM Terminal */}
                                <Card className="bg-black border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                                    <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                                <div className="h-2.5 w-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                                                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-500 ml-2 uppercase tracking-widest">shell: npm_run_dev</span>
                                        </div>
                                        <Badge variant="outline" className="h-4 text-[9px] border-emerald-500/30 text-emerald-500">LIVE</Badge>
                                    </div>
                                    <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar bg-black/60">
                                        {sysLogs.npm.map((line, i) => (
                                            <div key={i} className="flex gap-4 group">
                                                <span className="text-slate-800 shrink-0 select-none">{(i + 1).toString().padStart(3, '0')}</span>
                                                <span className={`break-all ${line.includes('Compiled') ? 'text-emerald-400' : line.includes('Error') ? 'text-red-400' : 'text-slate-400'}`}>
                                                    {line}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-2 text-slate-700 animate-pulse mt-1">
                                            <span className="h-1 w-3 bg-slate-700" />
                                        </div>
                                    </div>
                                </Card>

                                {/* Python Terminal */}
                                <Card className="bg-black border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                                    <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                                <div className="h-2.5 w-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                                                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-500 ml-2 uppercase tracking-widest">shell: python_fastapi</span>
                                        </div>
                                        <Badge variant="outline" className="h-4 text-[9px] border-emerald-500/30 text-emerald-500">LIVE</Badge>
                                    </div>
                                    <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar bg-black/60">
                                        {sysLogs.python.map((line, i) => (
                                            <div key={i} className="flex gap-4 group">
                                                <span className="text-slate-800 shrink-0 select-none">{(i + 1).toString().padStart(3, '0')}</span>
                                                <span className={`break-all ${line.includes('OK') ? 'text-blue-400' : line.includes('Starting') ? 'text-purple-400' : 'text-slate-400'}`}>
                                                    {line}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-2 text-slate-700 animate-pulse mt-1">
                                            <span className="h-1 w-3 bg-slate-700" />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* User Feedback Feed */}
                        <TabsContent value="feedback" className="space-y-6">
                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800">
                                    <div>
                                        <CardTitle className="text-lg font-bold">Experience Feed</CardTitle>
                                        <CardDescription className="text-xs font-medium">Citizen-led insights on neural extraction performance</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="text-indigo-400 border-indigo-500/30">
                                        {dbData?.feedback?.length || 0} Submissions
                                    </Badge>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Rating</th>
                                                <th className="px-6 py-4">Category</th>
                                                <th className="px-6 py-4">Comment</th>
                                                <th className="px-6 py-4 text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {dbData?.feedback && dbData.feedback.length > 0 ? dbData.feedback.map((f: any) => (
                                                <tr key={f.id} className="text-xs hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-slate-400">{f.user_email}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <Star key={s} className={`h-3 w-3 ${f.rating >= s ? "fill-amber-400 text-amber-400" : "text-slate-700"}`} />
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-tighter ${f.category === 'accuracy' ? 'text-blue-400 border-blue-500/30' :
                                                            f.category === 'quality' ? 'text-emerald-400 border-emerald-500/30' : 'text-purple-400 border-purple-500/30'
                                                            }`}>
                                                            {f.category}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300 italic max-w-xs truncate" title={f.comment}>
                                                        "{f.comment || "No comment provided."}"
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-slate-500 font-mono">
                                                        {new Date(f.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={5} className="p-10 text-center text-slate-600 italic">No feedback entries recorded in the mission log.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="data">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1 space-y-2 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-4 sticky top-0 bg-[#020617] py-2">Master Tables</h4>
                                    {[
                                        "uploads", "analysis_results", "document_metadata",
                                        "sectoral_allocations", "project_performance", "compliance_checks",
                                        "county_comparisons", "user_roles", "audit_logs",
                                        "acronyms", "generated_reports", "trending_merits", "system_settings"
                                    ].map(table => (
                                        <button
                                            key={table}
                                            onClick={() => fetchTableData(table)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all group ${selectedTable === table
                                                ? 'bg-purple-600/20 border-purple-600'
                                                : 'border-slate-800 bg-slate-900/30 hover:bg-slate-900 hover:border-purple-600/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${selectedTable === table ? 'bg-purple-600 border-purple-400' : 'bg-slate-800 border-slate-700'
                                                    }`}>
                                                    <Database className={`h-4 w-4 ${selectedTable === table ? 'text-white' : 'text-slate-400'}`} />
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-tight ${selectedTable === table ? 'text-purple-400' : 'text-slate-300'
                                                    }`}>{table}</span>
                                            </div>
                                            <Eye className={`h-4 w-4 transition-colors ${selectedTable === table ? 'text-purple-400' : 'text-slate-700 group-hover:text-purple-400'
                                                }`} />
                                        </button>
                                    ))}
                                </div>
                                <div className="lg:col-span-2">
                                    <Card className="bg-slate-900/50 border-slate-800 h-[600px] flex flex-col">
                                        <CardHeader className="border-b border-slate-800 shrink-0">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-xs font-black uppercase text-slate-400">
                                                    Live Data Explorer ({selectedTable})
                                                </CardTitle>
                                                {isTableLoading && <RefreshCw className="h-3 w-3 animate-spin text-purple-400" />}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 flex-1 overflow-hidden">
                                            <div className="rounded-lg bg-black/40 border border-slate-800 p-6 font-mono text-[10px] text-emerald-500 shadow-inner h-full overflow-auto custom-scrollbar">
                                                <pre className="whitespace-pre-wrap">
                                                    {tableData ? JSON.stringify(tableData, null, 2) : "// Select a table to preview raw backend records."}
                                                </pre>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="config">
                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardHeader className="border-b border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-lg font-bold">Global JSON Constants</CardTitle>
                                            <CardDescription className="text-xs font-medium">Modify application macro-figures (NATIONAL_BUDGET_2025)</CardDescription>
                                        </div>
                                        <Button
                                            className="bg-emerald-600 hover:bg-emerald-700 h-9 font-bold text-xs uppercase tracking-widest px-6 flex gap-2"
                                            onClick={handleSaveSettings}
                                        >
                                            <Save className="h-3.5 w-3.5" /> Commit Changes
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 space-y-10">
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total National Budget (KES)</Label>
                                            <Input
                                                className="bg-slate-950 border-slate-800 text-lg font-black text-white"
                                                value={totalBudget}
                                                onChange={(e) => setTotalBudget(e.target.value)}
                                            />
                                            <p className="text-[10px] text-slate-600 italic">Value is reflected in dashboard headers.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">County Equitable Share (Total)</Label>
                                            <Input
                                                className="bg-slate-950 border-slate-800 text-lg font-black text-white"
                                                value={equitableShare}
                                                onChange={(e) => setEquitableShare(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-black">Sectoral Allocation Map</Label>
                                            <Button variant="ghost" size="sm" className="h-7 text-[9px] uppercase text-purple-400">+ Add Sector</Button>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { s: "Education", v: "16.37%" },
                                                { s: "Infrastructure & ICT", v: "11.67%" },
                                                { s: "National Security", v: "10.82%" },
                                                { s: "Health", v: "3.22%" },
                                            ].map((item) => (
                                                <div key={item.s} className="flex gap-4 items-center">
                                                    <div className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-300">{item.s}</div>
                                                    <div className="w-24 px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-500 font-black text-center">{item.v}</div>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-600 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
            <ProfileSettingsModal
                open={showProfileModal}
                onOpenChange={setShowProfileModal}
                currentUser={user}
                onUpdateSuccess={(updatedUser) => setUser(updatedUser)}
            />
        </div>
    )
}
