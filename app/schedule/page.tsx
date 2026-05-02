'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { getAppData } from '@/lib/storage'
import { AppData } from '@/lib/types'
import { Calendar, Clock, TrendingUp } from 'lucide-react'

export default function SchedulePage() {
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


  // Calculate current week stats
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    return date
  })

  const weekStats = weekDays.map((date) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayLogs = data.logs.filter((log) => log.date === dateStr)
    const totalHours = dayLogs.reduce((sum, log) => sum + log.duration, 0)

    return {
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: date.getDate(),
      hours: totalHours,
      logs: dayLogs,
      isToday: dateStr === new Date().toISOString().split('T')[0],
    }
  })

  // Calculate month stats
  const currentMonth = new Date()
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const daysInMonth = lastDay.getDate()

  const monthDays = Array.from({ length: daysInMonth }).map((_, i) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
    const dateStr = date.toISOString().split('T')[0]
    const dayLogs = data.logs.filter((log) => log.date === dateStr)
    const totalHours = dayLogs.reduce((sum, log) => sum + log.duration, 0)

    return {
      date,
      day: i + 1,
      hours: totalHours,
      logsCount: dayLogs.length,
    }
  })

  const totalMonthHours = monthDays.reduce((sum, day) => sum + day.hours, 0)
  const logsInMonth = data.logs.filter((log) => {
    const logDate = new Date(log.date)
    return (
      logDate.getFullYear() === currentMonth.getFullYear() &&
      logDate.getMonth() === currentMonth.getMonth()
    )
  }).length

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar streak={data.streak} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="px-8 py-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">Schedule</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View your learning schedule and calendar
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Week Overview */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold">This Week</h2>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekStats.map((day) => (
                <div
                  key={day.date.toISOString()}
                  className={`p-4 rounded-lg border text-center transition-colors ${
                    day.isToday
                      ? 'bg-accent/20 border-accent'
                      : 'bg-background border-border hover:border-accent/50'
                  }`}
                >
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    {day.dayName}
                  </p>
                  <p className="text-lg font-bold text-foreground mb-2">
                    {day.dateNum}
                  </p>
                  <div className="text-2xl font-bold text-accent mb-1">
                    {day.hours.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {day.logs.length} log{day.logs.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Total</p>
                <p className="text-3xl font-bold text-accent">
                  {weekStats.reduce((sum, day) => sum + day.hours, 0).toFixed(1)}h
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent/50" />
            </div>
          </div>

          {/* Month Overview */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">
                  {currentMonth.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total This Month</p>
                <p className="text-2xl font-bold text-accent">
                  {totalMonthHours.toFixed(1)}h
                </p>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center text-xs font-semibold text-muted-foreground">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDay.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2 aspect-square" />
              ))}

              {/* Month days */}
              {monthDays.map((day) => {
                const intensity =
                  day.hours >= 4 ? 4 : day.hours >= 2 ? 3 : day.hours > 0 ? 2 : day.hours === 0 ? 0 : 1

                const colors = [
                  'bg-background border-border',
                  'bg-accent/30 border-accent/50',
                  'bg-accent/50 border-accent/70',
                  'bg-accent/70 border-accent',
                  'bg-accent border-accent',
                ]

                return (
                  <div
                    key={day.day}
                    className={`p-2 rounded border text-center text-sm font-semibold ${colors[intensity]} transition-opacity hover:opacity-80 cursor-pointer`}
                    title={`${day.day} - ${day.hours.toFixed(1)}h (${day.logsCount} logs)`}
                  >
                    <div className="text-xs">{day.day}</div>
                    {day.hours > 0 && (
                      <div className="text-xs text-foreground/70">
                        {day.hours.toFixed(1)}h
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Days Active</p>
                <p className="text-2xl font-bold text-foreground">
                  {monthDays.filter((d) => d.hours > 0).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold text-accent">
                  {logsInMonth}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Per Day</p>
                <p className="text-2xl font-bold text-foreground">
                  {(totalMonthHours / daysInMonth).toFixed(1)}h
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming Goals */}
          {data.goals.filter((g) => g.status === 'active').length > 0 && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
              <div className="space-y-3">
                {data.goals
                  .filter((g) => g.status === 'active')
                  .map((goal) => {
                    const daysUntilDue = Math.ceil(
                      (new Date(goal.targetDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )

                    return (
                      <div
                        key={goal.id}
                        className="p-4 rounded-lg bg-background border border-border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{goal.title}</h3>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              daysUntilDue <= 7
                                ? 'bg-destructive/20 text-destructive'
                                : 'bg-accent/20 text-accent'
                            }`}
                          >
                            {daysUntilDue > 0 ? `${daysUntilDue}d left` : 'Due today'}
                          </span>
                        </div>
                        <div className="w-full bg-background rounded-full h-2 border border-border overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
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
