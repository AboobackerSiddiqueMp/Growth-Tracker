import { AppData, DailyLog, Topic, Goal, Resource, Achievement, WeeklyReview } from './types'

const STORAGE_KEY = 'learnlog_data'

const defaultData: AppData = {
  logs: [],
  topics: [],
  goals: [],
  resources: [],
  achievements: [
    {
      id: '1',
      title: 'First Step',
      description: 'Create your first daily log',
      icon: '🚀',
      condition: 'Create 1 log',
      unlocked: false,
      progress: 0,
    },
    {
      id: '2',
      title: '7-Day Streak',
      description: 'Maintain a 7-day learning streak',
      icon: '🔥',
      condition: 'Consecutive 7 days',
      unlocked: false,
      progress: 0,
    },
    {
      id: '3',
      title: 'Century',
      description: 'Log 100 hours of learning',
      icon: '💯',
      condition: '100 hours total',
      unlocked: false,
      progress: 0,
    },
    {
      id: '4',
      title: 'Polymath',
      description: 'Study 5 different topics',
      icon: '🧠',
      condition: '5 topics',
      unlocked: false,
      progress: 0,
    },
  ],
  weeklyReviews: [],
  streak: 0,
  lastLogDate: '',
}

export function getAppData(): AppData {
  if (typeof window === 'undefined') return defaultData

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : { ...defaultData }
  } catch {
    return { ...defaultData }
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    console.error('Failed to save app data')
  }
}

export function addLog(log: DailyLog): void {
  const data = getAppData()
  data.logs.push(log)
  updateStreak(data, log.date)
  syncTopicStats(data)
  updateAchievements(data)
  saveAppData(data)
}

export function updateLog(id: string, updates: Partial<DailyLog>): void {
  const data = getAppData()
  const index = data.logs.findIndex((l) => l.id === id)
  if (index !== -1) {
    data.logs[index] = { ...data.logs[index], ...updates }
    syncTopicStats(data)
    saveAppData(data)
  }
}

export function deleteLog(id: string): void {
  const data = getAppData()
  data.logs = data.logs.filter((l) => l.id !== id)
  syncTopicStats(data)
  saveAppData(data)
}

export function addTopic(topic: Topic): void {
  const data = getAppData()
  data.topics.push(topic)
  saveAppData(data)
}

export function addGoal(goal: Goal): void {
  const data = getAppData()
  data.goals.push(goal)
  saveAppData(data)
}

export function updateGoal(id: string, updates: Partial<Goal>): void {
  const data = getAppData()
  const index = data.goals.findIndex((g) => g.id === id)
  if (index !== -1) {
    data.goals[index] = { ...data.goals[index], ...updates }
    updateAchievements(data)
    saveAppData(data)
  }
}

export function addResource(resource: Resource): void {
  const data = getAppData()
  data.resources.push(resource)
  saveAppData(data)
}

export function addWeeklyReview(review: WeeklyReview): void {
  const data = getAppData()
  data.weeklyReviews.push(review)
  saveAppData(data)
}

function syncTopicStats(data: AppData): void {
  data.topics = data.topics.map((topic) => {
    const relatedLogs = data.logs.filter((log) =>
      log.topics.includes(topic.name)
    )
    return {
      ...topic,
      logsCount: relatedLogs.length,
      totalDuration: relatedLogs.reduce((sum, log) => sum + log.duration, 0),
    }
  })
}

function updateStreak(data: AppData, logDate: string): void {
  const today = new Date(logDate)
  const lastLog = data.lastLogDate ? new Date(data.lastLogDate) : null

  if (!lastLog) {
    data.streak = 1
    data.lastLogDate = logDate
    return
  }

  const daysDiff = Math.floor(
    (today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysDiff === 0) {
    return // Same day, no change
  } else if (daysDiff === 1) {
    data.streak += 1
    data.lastLogDate = logDate
  } else {
    data.streak = 1
    data.lastLogDate = logDate
  }
}

function updateAchievements(data: AppData): void {
  // First Step: Create your first daily log
  if (data.logs.length >= 1 && !data.achievements[0].unlocked) {
    data.achievements[0].unlocked = true
    data.achievements[0].unlockedAt = new Date().toISOString()
  }

  // 7-Day Streak
  if (data.streak >= 7 && !data.achievements[1].unlocked) {
    data.achievements[1].unlocked = true
    data.achievements[1].unlockedAt = new Date().toISOString()
  }
  data.achievements[1].progress = Math.min(data.streak, 7)

  // Century: 100 hours total
  const totalHours = data.logs.reduce((sum, log) => sum + log.duration, 0)
  if (totalHours >= 100 && !data.achievements[2].unlocked) {
    data.achievements[2].unlocked = true
    data.achievements[2].unlockedAt = new Date().toISOString()
  }
  data.achievements[2].progress = Math.min(totalHours, 100)

  // Polymath: 5 different topics
  if (data.topics.length >= 5 && !data.achievements[3].unlocked) {
    data.achievements[3].unlocked = true
    data.achievements[3].unlockedAt = new Date().toISOString()
  }
  data.achievements[3].progress = Math.min(data.topics.length, 5)
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
