
"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, Save, Shield } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useSuccessNotification, useErrorNotification } from "@/components/toast-notifications"

interface ProfileSettingsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentUser: { name: string; email: string; role: string }
    onUpdateSuccess: (user: { name: string; email: string; role: string }) => void
}

export function ProfileSettingsModal({ open, onOpenChange, currentUser, onUpdateSuccess }: ProfileSettingsModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [form, setForm] = useState({ name: currentUser.name, email: currentUser.email, password: "", confirmPassword: "" })

    const showSuccess = useSuccessNotification()
    const showError = useErrorNotification()

    useEffect(() => {
        setForm({ name: currentUser.name, email: currentUser.email, password: "", confirmPassword: "" })
    }, [currentUser, open])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (form.password && form.password !== form.confirmPassword) {
            showError("Password Mismatch", "Passwords do not match.")
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    name: form.name,
                    password: form.password || undefined
                })
            })

            const data = await res.json()
            if (data.success) {
                localStorage.setItem("auth_user", JSON.stringify(data.user))
                onUpdateSuccess(data.user)
                onOpenChange(false)
                showSuccess("Profile Updated", "Your account settings have been successfully synchronized.")
            } else {
                showError("Update Failed", data.error || "Could not update profile data.")
            }
        } catch (error) {
            showError("Connection error", "Could not connect to authentication service.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-400" />
                        Account Infrastructure Settings
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Modify your identity parameters and security credentials
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleUpdate} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="profile-name" className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Public Username</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-600" />
                            <Input
                                id="profile-name"
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-700"
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile-email" className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Core Identifier (Email)</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-600" />
                            <Input
                                id="profile-email"
                                value={form.email}
                                className="pl-10 bg-slate-900 border-slate-800 text-slate-500"
                                disabled={true}
                            />
                        </div>
                        <p className="text-[9px] text-slate-600 italic">Primary identifier cannot be modified manually.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="profile-pass" className="text-[10px] uppercase font-bold tracking-widest text-slate-500">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-600" />
                                <Input
                                    id="profile-pass"
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                                    className="pl-10 bg-slate-900 border-slate-800 text-white"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile-confirm" className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Confirm Key</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-600" />
                                <Input
                                    id="profile-confirm"
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="pl-10 bg-slate-900 border-slate-800 text-white"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                        <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 mb-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] uppercase font-bold text-purple-400">Assigned Role</span>
                                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono tracking-widest uppercase">{currentUser.role}</span>
                            </div>
                            <p className="text-[9px] text-slate-500">Your role governs access to national archives and neural extraction modules.</p>
                        </div>

                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 font-bold" disabled={isLoading}>
                            {isLoading ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Synchronize Profile
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="w-full text-slate-500 hover:text-white" disabled={isLoading}>
                            Abort Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
