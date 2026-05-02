'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { getAppData, addLog, updateLog, deleteLog } from '@/lib/storage'
import { AppData, DailyLog } from '@/lib/types'
import { Trash2, Plus, ArrowLeft } from 'lucide-react'

export default function DailyLogPage() {
  const router = useRouter()
  const [data, setData] = useState<AppData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    duration: '1',
    topics: [] as string[],
    mood: 'good' as const,
    learningType: 'video' as const,
  })


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

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim()) {
      alert('Please enter a title')
      return
    }

    const topics = form.topics

    if (editingId) {
      updateLog(editingId, {
        title: form.title,
        description: form.description,
        duration: parseFloat(form.duration),
        topics,
        mood: form.mood,
        learningType: form.learningType,
      })
    } else {
      const newLog: DailyLog = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        title: form.title,
        description: form.description,
        duration: parseFloat(form.duration),
        topics,
        mood: form.mood,
        learningType: form.learningType,
      }
      addLog(newLog)
    }

    // Refresh data
    const appData = getAppData()
    setData(appData)

    // Reset form
    setForm({
      title: '',
      description: '',
      duration: '1',
      topics: [],
      mood: 'good',
      learningType: 'video',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this log?')) {
      deleteLog(id)
      const appData = getAppData()
      setData(appData)
    }
  }

  const handleEdit = (log: DailyLog) => {
    setForm({
      title: log.title,
      description: log.description,
      duration: log.duration.toString(),
      topics: log.topics,
      mood: log.mood,
      learningType: log.learningType,
    })
    setEditingId(log.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar streak={data.streak} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="px-8 py-6 max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Daily Logs</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Track your daily learning progress
                </p>
              </div>
            </div>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Log
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-w-4xl mx-auto space-y-6">
          {/* Form */}
          {showForm && (
            <div className="p-6 rounded-lg bg-card border border-border space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  {editingId ? 'Edit Log' : 'Create New Log'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setForm({
                      title: '',
                      description: '',
                      duration: '1',
                      topics: [],
                      mood: 'good',
                      learningType: 'video',
                    })
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Title
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g., React Hooks Deep Dive"
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
                    placeholder="What did you learn today?"
                    rows={4}
                    className="bg-input border-border text-foreground resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Duration (hours)
                    </label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={form.duration}
                      onChange={(e) =>
                        setForm({ ...form, duration: e.target.value })
                      }
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Topics
                    </label>
                    {data.topics.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {data.topics.map((topic) => {
                          const selected = form.topics.includes(topic.name)
                          return (
                            <button
                              key={topic.id}
                              type="button"
                              onClick={() => {
                                const next = selected
                                  ? form.topics.filter((t) => t !== topic.name)
                                  : [...form.topics, topic.name]
                                setForm({ ...form, topics: next })
                              }}
                              className={`px-3 py-1 rounded-full text-sm font-medium border-2 transition-all ${
                                selected
                                  ? 'bg-accent text-accent-foreground border-accent'
                                  : 'bg-transparent text-muted-foreground border-border hover:border-accent/50'
                              }`}
                              style={selected ? { backgroundColor: topic.color, borderColor: topic.color, color: '#000' } : { borderColor: topic.color, color: topic.color }}
                            >
                              {topic.name}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No topics created yet.{' '}
                        <a href="/topics" className="text-accent underline">Create a topic</a> first.
                      </p>
                    )}
                    {form.topics.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Selected: {form.topics.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Mood
                    </label>
                    <Select value={form.mood} onValueChange={(value: any) =>
                      setForm({ ...form, mood: value })
                    }>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="great">Great</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="okay">Okay</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Learning Type
                    </label>
                    <Select value={form.learningType} onValueChange={(value: any) =>
                      setForm({ ...form, learningType: value })
                    }>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="coding">Coding</SelectItem>
                        <SelectItem value="discussion">Discussion</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {editingId ? 'Update Log' : 'Create Log'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                      setForm({
                        title: '',
                        description: '',
                        duration: '1',
                        topics: [],
                        mood: 'good',
                        learningType: 'video',
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Logs List */}
          <div className="space-y-3">
            {data.logs.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No logs yet.</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Log
                </Button>
              </div>
            ) : (
              data.logs
                .slice()
                .reverse()
                .map((log) => (
                  <div
                    key={log.id}
                    className="p-5 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{log.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent">
                          {log.duration}h
                        </p>
                      </div>
                    </div>

                    <p className="text-foreground/80 mb-3">{log.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {log.topics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 text-xs rounded bg-accent/20 text-accent"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">
                          Mood:{' '}
                          <span className="text-foreground capitalize">
                            {log.mood}
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          Type:{' '}
                          <span className="text-foreground capitalize">
                            {log.learningType}
                          </span>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(log)}
                          className="text-accent hover:bg-accent/10"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(log.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
