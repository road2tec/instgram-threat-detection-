import './StatCard.css'

function StatCard({ title, value, icon: Icon, color = 'primary', isUpdated = false }) {
  return (
    <div className={`stat-card stat-card-${color} ${isUpdated ? 'stat-card-updated' : ''}`}>
      <div className="stat-card-content">
        <div className="stat-card-header">
          <span className="stat-card-title">{title}</span>
          {Icon && <Icon size={24} className="stat-card-icon" />}
        </div>
        <div className="stat-card-value">
          {value}
          {isUpdated && <div className="update-indicator" />}
        </div>
      </div>
    </div>
  )
}

export default StatCard
