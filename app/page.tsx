'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { StatCard } from '@/components/stat-card'
import { ActivityHeatmap } from '@/components/activity-heatmap'
import { Button } from '@/components/ui/button'
import { getAppData } from '@/lib/storage'
import { AppData } from '@/lib/types'
import {
  BarChart3,
  BookMarked,
  CheckCircle2,
  Flame,
  Target,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Zap,
  Clock,
} from 'lucide-react'

function DashboardContent() {
  const [data, setData] = useState<AppData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const appData = getAppData()
    setData(appData)
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

  const totalHours = data.logs.reduce((sum, log) => sum + log.duration, 0)
  const thisWeekHours = data.logs
    .filter((log) => {
      const logDate = new Date(log.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return logDate >= weekAgo
    })
    .reduce((sum, log) => sum + log.duration, 0)

  const completedGoals = data.goals.filter((g) => g.status === 'completed').length
  const activeGoals = data.goals.filter((g) => g.status === 'active').length
  const unlockedAchievements = data.achievements.filter((a) => a.unlocked).length
  const isEmpty = data.logs.length === 0

  // Today's log check
  const todayStr = new Date().toISOString().split('T')[0]
  const loggedToday = data.logs.some((log) => log.date === todayStr)

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar streak={data.streak} />

      <main className="flex-1 overflow-auto" suppressHydrationWarning>
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-8 py-6 max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back! 👋</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {loggedToday && (
                  <span className="ml-2 text-accent font-semibold">✓ Logged today</span>
                )}
              </p>
            </div>
            <Link href="/daily-log">
              <Button className={`${loggedToday ? 'bg-muted text-foreground' : 'bg-accent hover:bg-accent/90 text-accent-foreground'}`}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {loggedToday ? 'Add Another Log' : 'Log Today'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-w-7xl mx-auto">

          {/* Empty / Get Started */}
          {isEmpty && (
            <div className="p-8 rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold mb-2">Start Your Learning Journey</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Track what you learn every day. Log sessions, set goals, and watch your progress grow over time.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/daily-log">
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Create First Log
                  </Button>
                </Link>
                <Link href="/topics">
                  <Button variant="outline">
                    <BookMarked className="w-4 h-4 mr-2" />
                    Add a Topic
                  </Button>
                </Link>
                <Link href="/goals">
                  <Button variant="outline">
                    <Target className="w-4 h-4 mr-2" />
                    Set a Goal
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Hours Learned"
                value={totalHours.toFixed(1)}
                icon={<TrendingUp className="w-5 h-5 text-accent" />}
                subtext={`across ${data.logs.length} log${data.logs.length !== 1 ? 's' : ''}`}
                variant="accent"
              />
              <StatCard
                label="This Week"
                value={thisWeekHours.toFixed(1)}
                icon={<Clock className="w-5 h-5 text-muted-foreground" />}
                subtext="hours in the last 7 days"
              />
              <StatCard
                label="Goals Completed"
                value={completedGoals}
                icon={<Target className="w-5 h-5 text-muted-foreground" />}
                subtext={activeGoals > 0 ? `${activeGoals} still active` : 'No active goals'}
              />
              <StatCard
                label="Achievements"
                value={`${unlockedAchievements}/${data.achievements.length}`}
                icon={<Flame className="w-5 h-5 text-muted-foreground" />}
                subtext="unlocked"
              />
            </div>
          </div>

          {/* Streak Banner */}
          {data.streak > 0 && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 flex items-center gap-4">
              <div className="text-4xl">🔥</div>
              <div>
                <p className="font-bold text-lg">{data.streak}-Day Learning Streak!</p>
                <p className="text-sm text-muted-foreground">Keep it going — log something today to maintain your streak.</p>
              </div>
              {!loggedToday && (
                <Link href="/daily-log" className="ml-auto">
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Log Now
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Activity Heatmap */}
          {!isEmpty && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Activity</h2>
              <ActivityHeatmap logs={data.logs} className="w-full" />
            </div>
          )}

          {/* Recent Logs + Top Topics */}
          {!isEmpty && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Logs */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Logs</h2>
                  <Link
                    href="/daily-log"
                    className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {data.logs.slice(-5).reverse().map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{log.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-accent font-bold">{log.duration}h</span>
                          <p className="text-xs text-muted-foreground capitalize">{log.mood} mood</p>
                        </div>
                      </div>
                      {log.description && (
                        <p className="text-sm text-foreground/80 line-clamp-1 mb-2">{log.description}</p>
                      )}
                      {log.topics.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {log.topics.map((topic) => (
                            <span
                              key={topic}
                              className="px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Topics */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Top Topics</h2>
                  <Link href="/topics" className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
                    All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {data.topics.length === 0 ? (
                    <div className="text-center py-8">
                      <BookMarked className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">No topics yet</p>
                      <Link href="/topics">
                        <Button variant="outline" size="sm">Create a Topic</Button>
                      </Link>
                    </div>
                  ) : (
                    data.topics.slice(0, 5).map((topic) => (
                      <div
                        key={topic.id}
                        className="p-3 rounded-lg bg-card border border-border"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: topic.color }} />
                          <h3 className="font-semibold text-sm flex-1 truncate">{topic.name}</h3>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>{topic.logsCount} log{topic.logsCount !== 1 ? 's' : ''}</span>
                          <span className="text-accent font-semibold">{topic.totalDuration}h</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all"
                            style={{
                              width: `${Math.min(
                                (topic.totalDuration / Math.max(totalHours, 1)) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Links when empty */}
          {!isEmpty && activeGoals > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.goals.filter((g) => g.status === 'active').slice(0, 4).map((goal) => {
                  const daysLeft = Math.ceil(
                    (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  )
                  return (
                    <div key={goal.id} className="p-4 rounded-lg bg-card border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm truncate flex-1 mr-2">{goal.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          daysLeft <= 7 ? 'bg-red-500/20 text-red-400' : 'bg-accent/20 text-accent'
                        }`}>
                          {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${goal.progress}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{goal.progress}% complete</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return <DashboardContent />
}
