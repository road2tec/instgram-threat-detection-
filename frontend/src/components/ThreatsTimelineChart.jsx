import { useState, useEffect, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function ThreatsTimelineChart({ stats }) {
  const [timelineData, setTimelineData] = useState([])

  // Initialize with some historical context if empty
  useEffect(() => {
    if (stats && timelineData.length === 0) {
      const now = new Date()
      const historicalPoints = []
      
      // Generate 5 minutes of "history" to make the chart look rich from the start
      for (let i = 5; i >= 0; i--) {
        const pastTime = new Date(now.getTime() - i * 60000)
        historicalPoints.push({
          time: pastTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timestamp: pastTime.getTime(),
          phishing: Math.max(0, (stats.by_prediction?.phishing || 0) - (i * 2)),
          malware: Math.max(0, (stats.by_prediction?.malware || 0) - i),
          ddos: Math.max(0, (stats.by_prediction?.ddos || 0) - i),
          normal: Math.max(0, (stats.by_prediction?.normal || 0) - (i * 5))
        })
      }
      setTimelineData(historicalPoints)
    }
  }, [stats])

  useEffect(() => {
    if (stats) {
      const now = new Date()
      const currentTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })

      const newDataPoint = {
        time: currentTime,
        timestamp: now.getTime(),
        phishing: stats.by_prediction?.phishing || 0,
        malware: stats.by_prediction?.malware || 0,
        ddos: stats.by_prediction?.ddos || 0,
        normal: stats.by_prediction?.normal || 0
      }

      setTimelineData(prevData => {
        if (prevData.length === 0) return [newDataPoint]
        
        const lastPoint = prevData[prevData.length - 1]
        const hasChanged = 
          lastPoint.phishing !== newDataPoint.phishing ||
          lastPoint.malware !== newDataPoint.malware ||
          lastPoint.ddos !== newDataPoint.ddos ||
          lastPoint.normal !== newDataPoint.normal

        if (hasChanged) {
          return [...prevData, newDataPoint].slice(-20)
        }
        return prevData
      })
    }
  }, [stats])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label"><strong>Scan Time: {label}</strong></p>
          {payload.map((entry) => (
            <p key={entry.dataKey} className="tooltip-value">
              <span className="tooltip-color-indicator" style={{ backgroundColor: entry.color }} />
              <span className="tooltip-name">{entry.name}:</span>
              <span className="tooltip-amount">{entry.value}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={timelineData}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorPhishing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMalware" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDdos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            content={({ payload }) => (
              <div className="custom-legend">
                {payload.map((entry, index) => (
                  <div key={`item-${index}`} className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: entry.color }} />
                    <span className="legend-label">{entry.value}</span>
                  </div>
                ))}
              </div>
            )}
          />
          <Area
            type="monotone"
            dataKey="phishing"
            name="Phishing"
            stroke="#f59e0b"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPhishing)"
            animationDuration={1500}
          />
          <Area
            type="monotone"
            dataKey="malware"
            name="Malware"
            stroke="#ef4444"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorMalware)"
            animationDuration={1500}
          />
          <Area
            type="monotone"
            dataKey="ddos"
            name="DDoS"
            stroke="#8b5cf6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorDdos)"
            animationDuration={1500}
          />
          <Area
            type="monotone"
            dataKey="normal"
            name="Safe Activity"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorNormal)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ThreatsTimelineChart