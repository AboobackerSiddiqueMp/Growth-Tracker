'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  Home,
  LogOut,
  Target,
  BookMarked,
  Calendar,
  Trophy,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/daily-log', label: 'Daily Log', icon: CheckCircle2 },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/topics', label: 'Topics', icon: BookMarked },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/weekly-review', label: 'Weekly Review', icon: CheckCircle2 },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
]

interface SidebarProps {
  streak: number
}

export function Sidebar({ streak }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-foreground"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2">
            <Flame className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-bold text-sidebar-foreground">
              LearnLog
            </h1>
          </div>

          {/* Streak Badge */}
          <div className="mb-8 p-4 bg-sidebar-primary/10 rounded-lg border border-sidebar-accent">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-sidebar-foreground">
                Current Streak
              </span>
            </div>
            <div className="text-3xl font-bold text-accent">{streak}</div>
            <p className="text-xs text-sidebar-foreground/60">days of learning</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="pt-6 border-t border-sidebar-border">
            <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground">
              <LogOut className="w-5 h-5" />
              <span>Help & Support</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content Offset */}
      <div className="hidden md:block w-64" />
    </>
  )
}
