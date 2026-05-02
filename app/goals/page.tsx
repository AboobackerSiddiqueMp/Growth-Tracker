'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAppData, addGoal, updateGoal } from '@/lib/storage'
import { AppData, Goal } from '@/lib/types'
import { Plus, CheckCircle2, Trash2 } from 'lucide-react'

export default function GoalsPage() {
  const [data, setData] = useState<AppData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetDate: '',
    status: 'active' as const,
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

    if (!form.title.trim() || !form.targetDate) {
      alert('Please fill in all fields')
      return
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      status: form.status,
      targetDate: form.targetDate,
      progress: 0,
      createdAt: new Date().toISOString(),
    }

    addGoal(newGoal)
    const appData = getAppData()
    setData(appData)

    setForm({
      title: '',
      description: '',
      targetDate: '',
      status: 'active',
    })
    setShowForm(false)
  }

  const handleStatusChange = (goalId: string, newStatus: Goal['status']) => {
    updateGoal(goalId, {
      status: newStatus,
      completedAt:
        newStatus === 'completed' ? new Date().toISOString() : undefined,
    })
    const appData = getAppData()
    setData(appData)
  }

  const activeGoals = data.goals.filter((g) => g.status === 'active')
  const completedGoals = data.goals.filter((g) => g.status === 'completed')
  const pausedGoals = data.goals.filter((g) => g.status === 'paused')

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar streak={data.streak} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="px-8 py-6 max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Goals</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Set and track your learning goals
              </p>
            </div>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-w-4xl mx-auto space-y-8">
          {/* Form */}
          {showForm && (
            <div className="p-6 rounded-lg bg-card border border-border space-y-4">
              <h2 className="text-xl font-semibold">Create New Goal</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Goal Title
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g., Complete React Course"
                    className="bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Description
                  </label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="What do you want to achieve?"
                    rows={3}
                    className="bg-input border-border text-foreground resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Target Date
                  </label>
                  <Input
                    type="date"
                    value={form.targetDate}
                    onChange={(e) =>
                      setForm({ ...form, targetDate: e.target.value })
                    }
                    className="bg-input border-border text-foreground"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Create Goal
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

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-accent">
                Active ({activeGoals.length})
              </h2>
              <div className="space-y-3">
                {activeGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-5 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Due:{' '}
                          {new Date(goal.targetDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Select
                        value={goal.status}
                        onValueChange={(value: any) =>
                          handleStatusChange(goal.id, value)
                        }
                      >
                        <SelectTrigger className="w-32 bg-input border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-foreground/80 mb-3">
                      {goal.description}
                    </p>
                    <div className="w-full bg-card rounded-full h-2 border border-border overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {goal.progress}% complete
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paused Goals */}
          {pausedGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
                Paused ({pausedGoals.length})
              </h2>
              <div className="space-y-3">
                {pausedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-5 rounded-lg bg-card border border-border opacity-60"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {goal.description}
                        </p>
                      </div>
                      <Select
                        value={goal.status}
                        onValueChange={(value: any) =>
                          handleStatusChange(goal.id, value)
                        }
                      >
                        <SelectTrigger className="w-32 bg-input border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                Completed ({completedGoals.length})
              </h2>
              <div className="space-y-3">
                {completedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-5 rounded-lg bg-card border border-accent/30 opacity-75"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold line-through">
                          {goal.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Completed:{' '}
                          {goal.completedAt
                            ? new Date(goal.completedAt).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.goals.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No goals yet.</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Goal
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
