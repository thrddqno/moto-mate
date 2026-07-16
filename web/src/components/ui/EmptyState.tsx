interface EmptyStateProps {
  icon: string
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="empty-state card">
      <div className="hero-mark" aria-hidden="true">
        {icon}
      </div>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  )
}
