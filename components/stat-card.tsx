import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  subtext?: string
  variant?: 'default' | 'accent'
  className?: string
}

export function StatCard({
  label,
  value,
  icon,
  subtext,
  variant = 'default',
  className = '',
}: StatCardProps) {
  const isAccent = variant === 'accent'

  return (
    <div
      className={`p-6 rounded-lg border ${
        isAccent
          ? 'bg-accent/10 border-accent/30'
          : 'bg-card border-border'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3
              className={`text-3xl font-bold ${
                isAccent ? 'text-accent' : 'text-foreground'
              }`}
            >
              {value}
            </h3>
          </div>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-2">{subtext}</p>
          )}
        </div>
        {icon && (
          <div
            className={`p-3 rounded-lg ${
              isAccent ? 'bg-accent/20' : 'bg-muted'
            }`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
