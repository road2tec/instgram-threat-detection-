import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function CategoryBarChart({ data }) {
  // Transform the data for the bar chart
  const chartData = Object.entries(data || {}).map(([key, value]) => ({
    category: key.charAt(0).toUpperCase() + key.slice(1),
    count: value,
    fill: getColorForCategory(key)
  }))

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
          <p className="tooltip-label">
            <strong>{label}</strong>
          </p>
          <p className="tooltip-value">
            <span
              className="tooltip-color-indicator"
              style={{ backgroundColor: data.payload.fill }}
            />
            Count: {data.value}
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
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            maxBarSize={80}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CategoryBarChart