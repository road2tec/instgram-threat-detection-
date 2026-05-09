import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function CategoryBarChart({ data }) {
  // Transform the data for the bar chart
  const chartData = Object.entries(data || {}).map(([key, value]) => ({
    key: key,
    category: key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    count: value,
    fill: getColorForCategory(key)
  })).sort((a, b) => b.count - a.count)

  function getColorForCategory(category) {
    const colors = {
      normal: '#10b981',
      phishing: '#f59e0b',
      malware: '#ef4444',
      ddos: '#8b5cf6',
      unknown: '#6b7280'
    }
    return colors[category] || colors.unknown
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label"><strong>{label}</strong></p>
          <p className="tooltip-value">
            <span className="tooltip-color-indicator" style={{ backgroundColor: data.payload.fill }} />
            <span className="tooltip-name">Count:</span>
            <span className="tooltip-amount">{data.value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="chart-empty">
        <p>No data available for category breakdown</p>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          barSize={50}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748b' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
            animationDuration={1500}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CategoryBarChart