import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = {
  normal: '#10b981',
  phishing: '#f59e0b',
  malware: '#ef4444',
  ddos: '#8b5cf6',
  unknown: '#6b7280'
}

function ThreatDistributionChart({ data }) {
  // Transform the data for the pie chart
  const chartData = Object.entries(data || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
    color: COLORS[key] || COLORS.unknown
  })).filter(item => item.value > 0)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">
            <span
              className="tooltip-color-indicator"
              style={{ backgroundColor: data.payload.color }}
            />
            {data.name}: {data.value}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }) => (
    <ul className="chart-legend">
      {payload.map((entry) => (
        <li key={entry.value} className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: entry.color }}
          />
          <span className="legend-text">{entry.value}</span>
          <span className="legend-count">
            {chartData.find(item => item.name === entry.value)?.value || 0}
          </span>
        </li>
      ))}
    </ul>
  )

  if (!chartData || chartData.length === 0) {
    return (
      <div className="chart-empty">
        <p>No data available for threat distribution</p>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ThreatDistributionChart