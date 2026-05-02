'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { getAppData } from '@/lib/storage'
import { AppData } from '@/lib/types'
import { Trophy, Lock } from 'lucide-react'

export default function AchievementsPage() {
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


  const unlockedAchievements = data.achievements.filter((a) => a.unlocked)
  const lockedAchievements = data.achievements.filter((a) => !a.unlocked)

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar streak={data.streak} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="px-8 py-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">Achievements</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Unlock achievements as you progress in your learning journey
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Unlocked
              </p>
              <p className="text-3xl font-bold text-accent">
                {unlockedAchievements.length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Locked
              </p>
              <p className="text-3xl font-bold text-foreground">
                {lockedAchievements.length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Completion
              </p>
              <p className="text-3xl font-bold text-accent">
                {Math.round(
                  (unlockedAchievements.length / data.achievements.length) * 100
                )}
                %
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Total Logs
              </p>
              <p className="text-3xl font-bold text-foreground">
                {data.logs.length}
              </p>
            </div>
          </div>

          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-semibold">
                  Unlocked ({unlockedAchievements.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-6 rounded-lg bg-card border-2 border-accent/50 hover:border-accent transition-colors"
                  >
                    <div className="text-5xl mb-3">{achievement.icon}</div>
                    <h3 className="text-lg font-semibold mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {achievement.description}
                    </p>
                    <div className="text-xs text-accent font-semibold">
                      {achievement.unlockedAt
                        ? `Unlocked: ${new Date(
                          achievement.unlockedAt
                        ).toLocaleDateString()}`
                        : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-6 h-6 text-muted-foreground" />
                <h2 className="text-2xl font-semibold text-muted-foreground">
                  Locked ({lockedAchievements.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement) => {
                  const progressPercent = achievement.progress
                    ? Math.min((achievement.progress / getMaxProgress(achievement)) * 100, 100)
                    : 0

                  return (
                    <div
                      key={achievement.id}
                      className="p-6 rounded-lg bg-card border border-border opacity-60 hover:opacity-80 transition-opacity"
                    >
                      <div className="text-5xl mb-3 grayscale">
                        {achievement.icon}
                      </div>
                      <h3 className="text-lg font-semibold mb-1">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.description}
                      </p>
                      <div className="text-xs text-muted-foreground mb-2">
                        {achievement.condition}
                      </div>

                      {achievement.progress !== undefined && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              Progress
                            </span>
                            <span className="text-xs font-bold text-accent">
                              {achievement.progress}/
                              {getMaxProgress(achievement)}
                            </span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2 border border-border overflow-hidden">
                            <div
                              className="h-full bg-accent/50 transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Achievement Details */}
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">How to Unlock Achievements</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="text-accent font-bold">🚀</span>
                <div>
                  <p className="font-semibold">First Step</p>
                  <p className="text-muted-foreground">
                    Create your first daily log
                  </p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-accent font-bold">🔥</span>
                <div>
                  <p className="font-semibold">7-Day Streak</p>
                  <p className="text-muted-foreground">
                    Log learning for 7 consecutive days
                  </p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-accent font-bold">💯</span>
                <div>
                  <p className="font-semibold">Century</p>
                  <p className="text-muted-foreground">
                    Accumulate 100 hours of learning
                  </p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-accent font-bold">🧠</span>
                <div>
                  <p className="font-semibold">Polymath</p>
                  <p className="text-muted-foreground">
                    Study 5 different topics
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

function getMaxProgress(achievement: any): number {
  if (achievement.id === '1') return 1 // First Step
  if (achievement.id === '2') return 7 // 7-Day Streak
  if (achievement.id === '3') return 100 // Century
  if (achievement.id === '4') return 5 // Polymath
  return 100
}
