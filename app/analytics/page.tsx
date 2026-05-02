'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { StatCard } from '@/components/stat-card'
import { ActivityHeatmap } from '@/components/activity-heatmap'
import { getAppData } from '@/lib/storage'
import { AppData } from '@/lib/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { BookMarked, Clock, TrendingUp, Zap, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MOOD_LABELS: Record<string, string> = {
  '4.0': '😄 Great',
  '3.5': '😊 Good–Great',
  '3.0': '😊 Good',
  '2.5': '😐 Okay–Good',
  '2.0': '😐 Okay',
  '1.5': '😞 Poor–Okay',
  '1.0': '😞 Poor',
}

function moodLabel(val: string) {
  const n = parseFloat(val)
  if (n >= 3.7) return '😄 Great'
  if (n >= 2.7) return '😊 Good'
  if (n >= 1.7) return '😐 Okay'
  return '😞 Poor'
}

export default function AnalyticsPage() {
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
  const totalLogs = data.logs.length
  const avgPerLog = totalLogs > 0 ? (totalHours / totalLogs).toFixed(1) : '0'
  const averageMood = (
    data.logs.reduce((sum, log) => {
      const moodValue: Record<string, number> = { great: 4, good: 3, okay: 2, poor: 1 }
      return sum + moodValue[log.mood]
    }, 0) / Math.max(totalLogs, 1)
  ).toFixed(1)

  const learningTypeData = data.logs.reduce(
    (acc, log) => {
      const existing = acc.find((item) => item.name === log.learningType)
      if (existing) {
        existing.value += 1
        existing.hours += log.duration
      } else {
        acc.push({ name: log.learningType, value: 1, hours: log.duration })
      }
      return acc
    },
    [] as Array<{ name: string; value: number; hours: number }>
  )

  const topicData = data.topics
    .map((topic) => ({ name: topic.name, hours: topic.totalDuration, logs: topic.logsCount }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 8)

  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split('T')[0]
    const dayLogs = data.logs.filter((log) => log.date === dateStr)
    const hours = dayLogs.reduce((sum, log) => sum + log.duration, 0)
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: parseFloat(hours.toFixed(1)),
      logs: dayLogs.length,
    }
  })

  const COLORS = ['#00e676', '#00bcd4', '#2196f3', '#9c27b0', '#ff6f00']
  const CHART_GREEN = '#00e676'
  const CHART_GRID = '#2a2a2a'
  const CHART_AXIS = '#888'

  const isEmpty = totalLogs === 0

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '13px',
    },
    cursor: { fill: 'rgba(255,255,255,0.05)' },
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar streak={data.streak} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="px-8 py-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              A breakdown of your learning habits and progress
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-w-7xl mx-auto">

          {/* Empty state */}
          {isEmpty && (
            <div className="p-12 rounded-xl border-2 border-dashed border-border text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No data yet</h2>
              <p className="text-muted-foreground mb-6">
                Start logging your learning sessions to see analytics here.
              </p>
              <Link href="/daily-log">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Create First Log
                </Button>
              </Link>
            </div>
          )}

          {/* Summary Stats */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Hours Learned"
                value={totalHours.toFixed(1)}
                icon={<Clock className="w-5 h-5 text-accent" />}
                subtext="hours logged overall"
                variant="accent"
              />
              <StatCard
                label="Total Sessions"
                value={totalLogs}
                icon={<BookMarked className="w-5 h-5 text-muted-foreground" />}
                subtext="daily log entries"
              />
              <StatCard
                label="Avg Session Length"
                value={`${avgPerLog}h`}
                icon={<TrendingUp className="w-5 h-5 text-muted-foreground" />}
                subtext="hours per log entry"
              />
              <StatCard
                label="Average Mood"
                value={moodLabel(averageMood)}
                icon={<Zap className="w-5 h-5 text-muted-foreground" />}
                subtext={`score: ${averageMood} / 4.0`}
              />
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Last 7 Days — Hours Learned</h2>
              <p className="text-sm text-muted-foreground">How many hours you studied each day this week</p>
            </div>
            {isEmpty ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Log some sessions to see your weekly chart
              </div>
            ) : (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                    <XAxis
                      dataKey="day"
                      stroke={CHART_AXIS}
                      tick={{ fontSize: 12, fill: CHART_AXIS }}
                    />
                    <YAxis
                      stroke={CHART_AXIS}
                      tick={{ fontSize: 12, fill: CHART_AXIS }}
                      label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: CHART_AXIS }}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(val: number) => [`${val}h`, 'Hours learned']}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.date ?? label}
                    />
                    <Bar dataKey="hours" fill={CHART_GREEN} radius={[6, 6, 0, 0]} name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Learning Methods Pie */}
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">How You Learn</h2>
                <p className="text-sm text-muted-foreground">Breakdown by learning method (video, reading, coding, etc.)</p>
              </div>
              {learningTypeData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No learning method data yet
                </div>
              ) : (
                <>
                  <div className="w-full h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={learningTypeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {learningTypeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          {...tooltipStyle}
                          formatter={(val: number, name, { payload }) => [
                            `${val} session${val !== 1 ? 's' : ''} · ${payload.hours.toFixed(1)}h`,
                            payload.name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {learningTypeData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="capitalize text-muted-foreground">{item.name}</span>
                        <span className="font-semibold">{item.hours.toFixed(1)}h</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Hours by Topic */}
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Hours by Topic</h2>
                <p className="text-sm text-muted-foreground">Which topics you've spent the most time on</p>
              </div>
              {topicData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-center text-muted-foreground text-sm">
                  <div>
                    <p>No topics logged yet.</p>
                    <Link href="/topics" className="text-accent underline mt-1 block">Create topics →</Link>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topicData}
                      layout="vertical"
                      margin={{ left: 10, right: 30, top: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                      <XAxis
                        type="number"
                        stroke={CHART_AXIS}
                        tick={{ fontSize: 11, fill: CHART_AXIS }}
                        label={{ value: 'Hours', position: 'insideBottom', offset: -2, fontSize: 11, fill: CHART_AXIS }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke={CHART_AXIS}
                        tick={{ fontSize: 11, fill: CHART_AXIS }}
                        width={90}
                      />
                      <Tooltip
                        {...tooltipStyle}
                        formatter={(val: number) => [`${val}h`, 'Hours studied']}
                      />
                      <Bar dataKey="hours" fill={CHART_GREEN} radius={[0, 6, 6, 0]} name="Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Activity Heatmap */}
          {!isEmpty && (
            <div>
              <div className="mb-3">
                <h2 className="text-lg font-semibold">Activity Heatmap</h2>
                <p className="text-sm text-muted-foreground">Your learning activity over the past year — darker = more hours</p>
              </div>
              <ActivityHeatmap logs={data.logs} />
            </div>
          )}

          {/* Mood breakdown */}
          {!isEmpty && (
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Mood Breakdown</h2>
                <p className="text-sm text-muted-foreground">How you felt across all your learning sessions</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['great', 'good', 'okay', 'poor'] as const).map((mood) => {
                  const count = data.logs.filter((l) => l.mood === mood).length
                  const pct = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0
                  const emoji = { great: '😄', good: '😊', okay: '😐', poor: '😞' }[mood]
                  return (
                    <div key={mood} className="p-4 rounded-lg bg-background border border-border text-center">
                      <div className="text-3xl mb-1">{emoji}</div>
                      <p className="capitalize font-semibold text-sm">{mood}</p>
                      <p className="text-2xl font-bold text-accent">{pct}%</p>
                      <p className="text-xs text-muted-foreground">{count} session{count !== 1 ? 's' : ''}</p>
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
