'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getAppData, addWeeklyReview } from '@/lib/storage'
import { AppData, WeeklyReview } from '@/lib/types'
import { Plus } from 'lucide-react'

export default function WeeklyReviewPage() {
  const [data, setData] = useState<AppData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    highlights: '',
    improvements: '',
    nextWeekGoals: '',
  })


  useEffect(() => {
    setData(getAppData())
    setIsLoading(false)
  }, [])

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.highlights.trim() && !form.improvements.trim()) {
      alert('Please enter at least some content')
      return
    }

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStr = `${weekStart.getFullYear()}-W${getWeekNumber(weekStart)}`

    // Calculate stats for this week
    const weekLogs = data!.logs.filter((log) => {
      const logDate = new Date(log.date)
      return logDate >= weekStart && logDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    })

    const totalHours = weekLogs.reduce((sum, log) => sum + log.duration, 0)
    const topicsStudied = [...new Set(weekLogs.flatMap((log) => log.topics))]
    const completedGoals = data!.goals.filter((g) => g.status === 'completed').length
    const progressPercentage = Math.round(
      (completedGoals / Math.max(data!.goals.length, 1)) * 100
    )

    const newReview: WeeklyReview = {
      id: Date.now().toString(),
      week: weekStr,
      totalHours,
      topicsStudied,
      goalsProgress: progressPercentage,
      highlights: form.highlights,
      improvements: form.improvements,
      nextWeekGoals: form.nextWeekGoals,
    }

    addWeeklyReview(newReview)
    const appData = getAppData()
    setData(appData)

    setForm({
      highlights: '',
      improvements: '',
      nextWeekGoals: '',
    })
    setShowForm(false)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar streak={data.streak} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="px-8 py-6 max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Weekly Review</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Reflect on your learning progress
              </p>
            </div>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Review
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-w-4xl mx-auto space-y-6">
          {/* Form */}
          {showForm && (
            <div className="p-6 rounded-lg bg-card border border-border space-y-4">
              <h2 className="text-2xl font-semibold">Create Weekly Review</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Highlights & Achievements
                  </label>
                  <Textarea
                    value={form.highlights}
                    onChange={(e) =>
                      setForm({ ...form, highlights: e.target.value })
                    }
                    placeholder="What went well this week? What did you accomplish?"
                    rows={4}
                    className="bg-input border-border text-foreground resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Areas for Improvement
                  </label>
                  <Textarea
                    value={form.improvements}
                    onChange={(e) =>
                      setForm({ ...form, improvements: e.target.value })
                    }
                    placeholder="What could you improve? What challenges did you face?"
                    rows={4}
                    className="bg-input border-border text-foreground resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Next Week&apos;s Goals
                  </label>
                  <Textarea
                    value={form.nextWeekGoals}
                    onChange={(e) =>
                      setForm({ ...form, nextWeekGoals: e.target.value })
                    }
                    placeholder="What do you want to focus on next week?"
                    rows={4}
                    className="bg-input border-border text-foreground resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Save Review
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {data.weeklyReviews.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No reviews yet.</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Review
                </Button>
              </div>
            ) : (
              data.weeklyReviews
                .slice()
                .reverse()
                .map((review) => (
                  <div
                    key={review.id}
                    className="p-6 rounded-lg bg-card border border-border"
                  >
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold mb-2">
                        Week {review.week}
                      </h2>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Hours
                          </p>
                          <p className="text-2xl font-bold text-accent">
                            {review.totalHours.toFixed(1)}h
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Topics
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {review.topicsStudied.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Goals Progress
                          </p>
                          <p className="text-2xl font-bold text-accent">
                            {review.goalsProgress}%
                          </p>
                        </div>
                      </div>

                      {review.topicsStudied.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-2">
                            Topics Studied
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {review.topicsStudied.map((topic) => (
                              <span
                                key={topic}
                                className="px-2 py-1 text-xs rounded bg-accent/20 text-accent"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border pt-4 space-y-4">
                      <div>
                        <h3 className="font-semibold text-sm text-accent mb-2">
                          Highlights
                        </h3>
                        <p className="text-foreground/80 whitespace-pre-wrap">
                          {review.highlights}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-accent mb-2">
                          Areas for Improvement
                        </h3>
                        <p className="text-foreground/80 whitespace-pre-wrap">
                          {review.improvements}
                        </p>
                      </div>

                      {review.nextWeekGoals && (
                        <div>
                          <h3 className="font-semibold text-sm text-accent mb-2">
                            Next Week&apos;s Goals
                          </h3>
                          <p className="text-foreground/80 whitespace-pre-wrap">
                            {review.nextWeekGoals}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
