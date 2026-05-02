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
import { getAppData, addResource } from '@/lib/storage'
import { AppData, Resource } from '@/lib/types'
import { Plus, ExternalLink, Star } from 'lucide-react'

export default function ResourcesPage() {
  const [data, setData] = useState<AppData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setData(getAppData())
    setIsLoading(false)
  }, [])


  
  const [form, setForm] = useState({
    title: '',
    description: '',
    url: '',
    type: 'course' as const,
    tags: '',
    rating: '5',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim() || !form.url.trim()) {
      alert('Please fill in required fields')
      return
    }

    const newResource: Resource = {
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      type: form.type,
      url: form.url,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t),
      rating: parseInt(form.rating),
      saved: true,
    }

    addResource(newResource)
    const appData = getAppData()
    setData(appData)

    setForm({
      title: '',
      description: '',
      url: '',
      type: 'course',
      tags: '',
      rating: '5',
    })
    setShowForm(false)
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    )
  }

  const resourcesByType = {
    course: data.resources.filter((r) => r.type === 'course'),
    book: data.resources.filter((r) => r.type === 'book'),
    article: data.resources.filter((r) => r.type === 'article'),
    video: data.resources.filter((r) => r.type === 'video'),
    tool: data.resources.filter((r) => r.type === 'tool'),
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar streak={data.streak} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="px-8 py-6 max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Resources</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Save and organize learning resources
              </p>
            </div>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-w-4xl mx-auto space-y-8">
          {/* Form */}
          {showForm && (
            <div className="p-6 rounded-lg bg-card border border-border space-y-4">
              <h2 className="text-xl font-semibold">Add New Resource</h2>
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
                    placeholder="Resource title"
                    className="bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">
                    URL
                  </label>
                  <Input
                    value={form.url}
                    onChange={(e) =>
                      setForm({ ...form, url: e.target.value })
                    }
                    placeholder="https://example.com"
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
                    placeholder="What&apos;s this resource about?"
                    rows={3}
                    className="bg-input border-border text-foreground resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Type
                    </label>
                    <Select value={form.type} onValueChange={(value: any) =>
                      setForm({ ...form, type: value })
                    }>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="book">Book</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="tool">Tool</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Rating
                    </label>
                    <Select value={form.rating} onValueChange={(value) =>
                      setForm({ ...form, rating: value })
                    }>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 ⭐</SelectItem>
                        <SelectItem value="2">2 ⭐</SelectItem>
                        <SelectItem value="3">3 ⭐</SelectItem>
                        <SelectItem value="4">4 ⭐</SelectItem>
                        <SelectItem value="5">5 ⭐</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Tags (comma-separated)
                  </label>
                  <Input
                    value={form.tags}
                    onChange={(e) =>
                      setForm({ ...form, tags: e.target.value })
                    }
                    placeholder="React, JavaScript, Tutorial"
                    className="bg-input border-border text-foreground"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Save Resource
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

          {/* Resources by Type */}
          {Object.entries(resourcesByType).map(([type, resources]) => {
            if (resources.length === 0) return null

            return (
              <div key={type}>
                <h2 className="text-lg font-semibold mb-3 capitalize">
                  {type}s ({resources.length})
                </h2>
                <div className="space-y-3">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="p-5 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {resource.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex text-accent">
                            {Array.from({ length: resource.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-current"
                              />
                            ))}
                          </div>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Open resource"
                          >
                            <ExternalLink className="w-5 h-5 text-accent" />
                          </a>
                        </div>
                      </div>

                      {resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {resource.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs rounded bg-accent/20 text-accent"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {data.resources.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No resources saved yet.</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Resource
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
