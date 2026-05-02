'use client'

import { DailyLog } from '@/lib/types'

interface ActivityHeatmapProps {
  logs: DailyLog[]
  className?: string
}

export function ActivityHeatmap({ logs, className = '' }: ActivityHeatmapProps) {
  // Get the last 52 weeks
  const weeks = []
  const today = new Date()
  
  for (let i = 51; i >= 0; i--) {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - i * 7)
    weeks.push(weekStart)
  }

  const getLogsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return logs.filter((log) => log.date === dateStr)
  }

  const getIntensity = (logs: DailyLog[]) => {
    if (logs.length === 0) return 0
    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0)
    if (totalDuration >= 4) return 4
    if (totalDuration >= 3) return 3
    if (totalDuration >= 2) return 2
    return 1
  }

  const getColor = (intensity: number) => {
    const colors = [
      'bg-card border-border',
      'bg-accent/30 border-accent/50',
      'bg-accent/50 border-accent/70',
      'bg-accent/70 border-accent',
      'bg-accent border-accent',
    ]
    return colors[intensity]
  }

  return (
    <div className={`p-6 bg-card rounded-lg border border-border ${className}`}>
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Activity Heatmap
      </h3>
      <div className="flex flex-col gap-2">
        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mb-4 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded ${getColor(i)}`}
            />
          ))}
          <span>More</span>
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-1 overflow-x-auto">
          {weeks.map((weekStart, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const date = new Date(weekStart)
                date.setDate(weekStart.getDate() + dayIndex)
                const dayLogs = getLogsForDate(date)
                const intensity = getIntensity(dayLogs)

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded border ${getColor(intensity)} transition-opacity hover:opacity-70 cursor-pointer`}
                    title={`${date.toDateString()}: ${dayLogs.length} log${dayLogs.length !== 1 ? 's' : ''}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
