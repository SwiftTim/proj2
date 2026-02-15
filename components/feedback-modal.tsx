
"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, MessageSquare, Sparkles, Send } from "lucide-react"
import { useSuccessNotification, useErrorNotification } from "@/components/toast-notifications"

interface FeedbackModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userEmail: string
    analysisId?: number
}

export function FeedbackModal({ open, onOpenChange, userEmail, analysisId }: FeedbackModalProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState("")
    const [category, setCategory] = useState("quality")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const showSuccess = useSuccessNotification()
    const showError = useErrorNotification()

    const handleSubmit = async () => {
        if (rating === 0) {
            showError("Rating Required", "Please provide a star rating before submitting.")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userEmail,
                    rating,
                    category,
                    comment,
                    analysisId
                })
            })

            const data = await res.json()
            if (data.success) {
                showSuccess("Feedback Received", "Your insights help us train better fiscal models.")
                onOpenChange(false)
                // Reset form
                setRating(0)
                setComment("")
            } else {
                showError("Submission Failed", data.error)
            }
        } catch (err) {
            showError("Connection Error", "Could not reach the feedback server.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-100">
                <DialogHeader>
                    <div className="mx-auto bg-indigo-500/10 p-3 rounded-2xl mb-4 w-fit">
                        <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold tracking-tight">Intelligence Feedback</DialogTitle>
                    <DialogDescription className="text-center text-slate-400">
                        Analysis complete. Help us improve the accuracy of our neural extraction engine.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex flex-col items-center gap-3">
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">How accurate was the extraction?</Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-all duration-200 transform hover:scale-125"
                                >
                                    <Star
                                        className={`h-8 w-8 ${(hoverRating || rating) >= star ? "fill-amber-400 text-amber-400" : "text-slate-700"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">What can we improve?</Label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                            <Textarea
                                placeholder="e.g., The pending bills figure was slightly off, or the table extraction failed on page 12..."
                                className="min-h-[100px] pl-10 bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-700 focus:border-indigo-500/50"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 justify-center">
                        {["quality", "speed", "accuracy"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all ${category === cat ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white/5 text-slate-500 border border-transparent"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 text-slate-500 hover:text-slate-300">
                        Skip for now
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-900/20"
                    >
                        {isSubmitting ? "Syncing..." : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Submit Insight
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
