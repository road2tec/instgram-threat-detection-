import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function ThreatsTimelineChart({ stats }) {
  const [timelineData, setTimelineData] = useState([])

  useEffect(() => {
    if (stats) {
      const now = new Date()
      const currentTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })

      // Get threat counts
      const phishingCount = stats.by_prediction?.phishing || 0
      const malwareCount = stats.by_prediction?.malware || 0
      const ddosCount = stats.by_prediction?.ddos || 0
      const totalThreats = phishingCount + malwareCount + ddosCount

      // Add new data point
      setTimelineData(prevData => {
        const newPoint = {
          time: currentTime,
          timestamp: now.getTime(),
          phishing: phishingCount,
          malware: malwareCount,
          ddos: ddosCount,
          total: totalThreats,
          normal: stats.by_prediction?.normal || 0
        }

        // Keep only last 20 data points for better visualization
        const updatedData = [...prevData, newPoint].slice(-20)

        // Only add if there's actually a change in the data
        if (prevData.length === 0 ||
            prevData[prevData.length - 1]?.total !== totalThreats ||
            prevData[prevData.length - 1]?.normal !== newPoint.normal) {
          return updatedData
        }

        return prevData
      })
    }
  }, [stats])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">
            <strong>Time: {label}</strong>
          </p>
          {payload.map((entry) => (
            <p key={entry.dataKey} className="tooltip-value">
              <span
                className="tooltip-color-indicator"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (!timelineData || timelineData.length === 0) {
    return (
      <div className="chart-empty">
        <p>Collecting timeline data...</p>
        <p className="chart-empty-subtitle">
          Chart will populate as new posts are generated
        </p>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={timelineData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
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
          <Legend />
          <Line
            type="monotone"
            dataKey="phishing"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Phishing"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="malware"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Malware"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="ddos"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="DDoS"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="normal"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Normal"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ThreatsTimelineChart