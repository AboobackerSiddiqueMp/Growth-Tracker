'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getAppData, addTopic } from '@/lib/storage'
import { AppData, Topic } from '@/lib/types'
import { Plus, Trash2 } from 'lucide-react'

const COLORS = [
  '#00e676',
  '#00bcd4',
  '#2196f3',
  '#3f51b5',
  '#9c27b0',
  '#f44336',
  '#ff6f00',
  '#ffb300',
]

export default function TopicsPage() {
  const [data, setData] = useState<AppData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: COLORS[0],
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

    if (!form.name.trim()) {
      alert('Please enter a topic name')
      return
    }

    const newTopic: Topic = {
      id: Date.now().toString(),
      name: form.name,
      description: form.description,
      color: form.color,
      logsCount: 0,
      totalDuration: 0,
      createdAt: new Date().toISOString(),
    }

    addTopic(newTopic)
    const appData = getAppData()
    setData(appData)

    setForm({
      name: '',
      description: '',
      color: COLORS[0],
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
              <h1 className="text-3xl font-bold">Topics</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Organize your learning into topics
              </p>
            </div>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Topic
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-w-4xl mx-auto space-y-6">
          {/* Form */}
          {showForm && (
            <div className="p-6 rounded-lg bg-card border border-border space-y-4">
              <h2 className="text-xl font-semibold">Create New Topic</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Topic Name
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g., React, Data Structures"
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
                    placeholder="What is this topic about?"
                    rows={3}
                    className="bg-input border-border text-foreground resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-3">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setForm({ ...form, color })}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          form.color === color
                            ? 'border-foreground scale-110'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Create Topic
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

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.topics.length === 0 ? (
              <div className="col-span-full p-12 text-center">
                <p className="text-muted-foreground mb-4">No topics yet.</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Topic
                </Button>
              </div>
            ) : (
              data.topics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-5 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: topic.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {topic.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-border">
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">
                        <span className="text-foreground font-semibold">
                          {topic.logsCount}
                        </span>{' '}
                        logs
                      </span>
                      <span className="text-muted-foreground">
                        <span className="text-accent font-semibold">
                          {topic.totalDuration}h
                        </span>
                      </span>
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
