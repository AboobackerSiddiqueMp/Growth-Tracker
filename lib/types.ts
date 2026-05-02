export type DailyLog = {
  id: string
  date: string
  title: string
  description: string
  duration: number
  topics: string[]
  mood: 'great' | 'good' | 'okay' | 'poor'
  learningType: 'video' | 'reading' | 'coding' | 'discussion' | 'other'
}

export type Topic = {
  id: string
  name: string
  color: string
  description: string
  logsCount: number
  totalDuration: number
  createdAt: string
}

export type Goal = {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'paused'
  targetDate: string
  progress: number
  createdAt: string
  completedAt?: string
}

export type Resource = {
  id: string
  title: string
  type: 'book' | 'course' | 'article' | 'video' | 'tool'
  url: string
  description: string
  tags: string[]
  rating: number
  saved: boolean
}

export type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  condition: string
  unlockedAt?: string
  unlocked: boolean
  progress?: number
}

export type WeeklyReview = {
  id: string
  week: string
  totalHours: number
  topicsStudied: string[]
  goalsProgress: number
  highlights: string
  improvements: string
  nextWeekGoals: string
}

export type AppData = {
  logs: DailyLog[]
  topics: Topic[]
  goals: Goal[]
  resources: Resource[]
  achievements: Achievement[]
  weeklyReviews: WeeklyReview[]
  streak: number
  lastLogDate: string
}
