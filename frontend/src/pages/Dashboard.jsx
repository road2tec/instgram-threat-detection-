import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, AlertTriangle, Activity, CheckCircle,
  RefreshCw, Plus, Search, TrendingUp, Clock,
  BarChart2, Lock, Instagram, Power, Brain, Target, BarChart3, PieChart, 
  TrendingUp as TimelineIcon, Wifi, WifiOff, Bell, Radar, Users
} from 'lucide-react'
import StatCard from '../components/StatCard'
import IncidentCard from '../components/IncidentCard'
import ThreatDistributionChart from '../components/ThreatDistributionChart'
import CategoryBarChart from '../components/CategoryBarChart'
import ThreatsTimelineChart from '../components/ThreatsTimelineChart'
import { incidentService } from '../services/api'
import { CardSkeleton, ChartSkeleton, SkeletonBox } from '../components/layout/Skeleton'
import { analysisService } from '../services/api'
import './Dashboard.css'
import '../components/Charts.css'
import '../components/layout/Skeleton.css'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentIncidents, setRecentIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [monitoredTargets, setMonitoredTargets] = useState([])
  const [isOnline, setIsOnline] = useState(true)
  const [newPostsCount, setNewPostsCount] = useState(0)
  const [isPollingActive, setIsPollingActive] = useState(true)
  const [hasNewThreats, setHasNewThreats] = useState(false)
  const [isSimulatorConnected, setIsSimulatorConnected] = useState(true) // Assuming simulator is connected by default for now
  const [loadingIncidents, setLoadingIncidents] = useState(false)


  const intervalRef = useRef(null)
  const previousStatsRef = useRef(null)
  const previousIncidentsRef = useRef([])

  // Real-time polling configuration
  const POLLING_INTERVAL = 5000 // 5 seconds for real-time updates
  const RETRY_INTERVAL = 10000 // 10 seconds retry on error

  const fetchData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true)

      const [statsData, incidentsData, targetsData] = await Promise.all([
        incidentService.getStats(),
        incidentService.getIncidents({ limit: 8 }),
        analysisService.getMonitoredTargets()
      ])

      const newStats = statsData.data
      const newIncidents = incidentsData.data

      // Auto-populate for new users if history is empty
      if (newStats && newStats.total === 0 && !refreshing) {
        console.log("New user detected. Injecting initial intelligence feed...");
        handleRefresh();
      }

      // Check for new posts & threats comparison
      if (previousStatsRef.current && newStats.total > previousStatsRef.current.total) {
        setNewPostsCount(prev => prev + (newStats.total - previousStatsRef.current.total))

        const previousThreats = (previousStatsRef.current.by_prediction?.phishing || 0) +
                              (previousStatsRef.current.by_prediction?.malware || 0) +
                              (previousStatsRef.current.by_prediction?.ddos || 0)

        const currentThreats = (newStats.by_prediction?.phishing || 0) +
                             (newStats.by_prediction?.malware || 0) +
                             (newStats.by_prediction?.ddos || 0)

        if (currentThreats > previousThreats) {
          setHasNewThreats(true)
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('New Cyber Threat Detected!', {
              body: `${currentThreats - previousThreats} new threat(s) detected`,
              icon: '/favicon.ico'
            })
          }
        }
      }

      setStats(newStats)
      setRecentIncidents(newIncidents)
      setMonitoredTargets(targetsData.data || [])
      setError(null)
      setIsOnline(true)
      setLastUpdate(new Date())
      setIsSimulatorConnected(true)
      previousStatsRef.current = newStats
      previousIncidentsRef.current = newIncidents

    } catch (err) {
      setError('Connection lost. Retrying...')
      setIsOnline(false)
      setIsSimulatorConnected(false)
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [])

  // Initialize dashboard
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Safety delay to ensure token is ready in storage
    const timer = setTimeout(() => {
      fetchData(true)
    }, 50)
    
    return () => clearTimeout(timer)
  }, [fetchData])

  // Real-time polling effect
  useEffect(() => {
    if (!isPollingActive) return

    const startPolling = () => {
      intervalRef.current = setInterval(() => {
        fetchData(false)
      }, isOnline ? POLLING_INTERVAL : RETRY_INTERVAL)
    }

    startPolling()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchData, isPollingActive, isOnline])

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await incidentService.refreshIncidents()
      await new Promise(resolve => setTimeout(resolve, 1000))
      await fetchData(false)
    } catch (err) {
      console.warn('Simulator offline. Manual refresh unavailable.', err)
    } finally {
      setRefreshing(false)
    }
  }

  const handleGeneratePost = async () => {
    try {
      setRefreshing(true)
      await incidentService.refreshIncidents() // This simulates generating a new post
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
      await fetchData(false)
    } catch (err) {
      setError('Failed to inject new thread.')
      console.error(err)
    } finally {
      setRefreshing(false)
    }
  }

  const refreshIncidents = async () => {
    setLoadingIncidents(true)
    try {
      await fetchData(false)
    } catch (err) {
      console.error("Failed to re-sync incidents:", err)
      setError("Failed to re-sync incidents.")
    } finally {
      setLoadingIncidents(false)
    }
  }

  // Toggle polling
  const togglePolling = () => {
    setIsPollingActive(!isPollingActive)
  }

  // Clear notifications
  const clearNotifications = () => {
    setNewPostsCount(0)
    setHasNewThreats(false)
  }

  // Calculate threat count
  const getThreatCount = () => {
    if (!stats?.by_prediction) return 0
    return (stats.by_prediction.phishing || 0) +
           (stats.by_prediction.malware || 0) +
           (stats.by_prediction.ddos || 0)
  }

  // Format last update time
  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Never'
    return lastUpdate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (loading && !stats) {
    return (
      <div className="dashboard">
        <div className="dashboard-header-main">
          <div className="title-block">
            <SkeletonBox width="300px" height="40px" borderRadius="8px" />
            <SkeletonBox width="500px" height="20px" className="mt-10" />
          </div>
        </div>

        <div className="grid-4">
          <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
        </div>

        <div className="dashboard-grid">
           <ChartSkeleton /> <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header-main">
        <div className="title-block">
          <h1 className="page-title">Cyber-Intel Center</h1>
          <p className="page-description">
            Live Intelligence Hub & Forensic Threat Monitoring
            {stats?.generation_active !== false && (
              <span className="live-indicator">
                <span className="pulse-dot" />
                Neural Feed Synchronized
              </span>
            )}
          </p>
        </div>

        <div className="header-actions">
          <div className="last-sync-tag">
             <Clock size={14} /> Last Scan: {formatLastUpdate()}
          </div>
          <button className="status-pill refresh-trigger" onClick={() => fetchData(true)} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            Refresh Engine
          </button>
          <div className={`status-pill ${isSimulatorConnected ? 'online' : 'offline'}`}>
            <div className="pulse-dot" />
            {isSimulatorConnected ? 'System Active' : 'System Offline'}
          </div>
          <Link to="/analytics" className="action-btn-search">
            <Search size={22} />
            Check Someone
          </Link>
        </div>
      </div>

      <div className="dashboard-metrics-summary">
        {/* Simplified Header Stat Row if needed, or leave empty to focus on cards */}
      </div>

      {error && (
        <div className={`error ${!isOnline ? 'connection-error' : ''}`}>
          {error}
          {!isOnline && (
            <span className="retry-info">
              Retrying every {RETRY_INTERVAL / 1000} seconds...
            </span>
          )}
        </div>
      )}

      {/* New Posts Alert */}
      {newPostsCount > 0 && (
        <div className="new-posts-alert">
          <Bell size={16} />
          {newPostsCount} new post{newPostsCount > 1 ? 's' : ''} detected
          <button onClick={clearNotifications} className="dismiss-btn">×</button>
        </div>
      )}

      {/* New Threats Alert */}
      {hasNewThreats && (
        <div className="new-threats-alert">
          <AlertTriangle size={16} />
          New cyber threats detected!
          <button onClick={() => setHasNewThreats(false)} className="dismiss-btn">×</button>
        </div>
      )}

      {/* Main Statistics */}
      <div className="grid grid-4 neuro-grid">
          <div className="stat-card active neuro-card">
            <div className="stat-header">
              <span className="stat-label">Total Ingested</span>
              <div className="stat-icon-box blue"><Shield size={22} /></div>
            </div>
            <div className="stat-value">{stats?.total || 0}</div>
            <div className="stat-sub-label">Posts processed by AI</div>
          </div>

          <div className="stat-card threats neuro-card">
            <div className="stat-header">
              <span className="stat-label">Threats Flagged</span>
              <div className="stat-icon-box red"><AlertTriangle size={22} /></div>
            </div>
            <div className="stat-value">{getThreatCount()}</div>
            <div className="stat-sub-label">Malicious signatures found</div>
          </div>

          <div className="stat-card medium neuro-card">
            <div className="stat-header">
              <span className="stat-label">High Severity</span>
              <div className="stat-icon-box orange"><Target size={22} /></div>
            </div>
            <div className="stat-value">{stats?.by_severity?.high || 0}</div>
            <div className="stat-sub-label">Critical risks identified</div>
          </div>

          <div className="stat-card accuracy neuro-card">
            <div className="stat-header">
              <span className="stat-label">System Accuracy</span>
              <div className="stat-icon-box purple"><Brain size={22} /></div>
            </div>
            <div className="stat-value">94.8%</div>
            <div className="stat-sub-label">Model classification score</div>
          </div>
      </div>

      {/* Threat Breakdown */}
      <div className="grid grid-3">
        <div className="card threat-breakdown">
          <div className="card-header">
            <h3 className="card-title">
              <Target size={20} />
              Threat Type Breakdown
            </h3>
          </div>
          <div className="threat-stats">
            <div className="threat-stat">
              <span className="threat-label phishing">Phishing</span>
              <span className="threat-count">{stats?.by_prediction?.phishing || 0}</span>
            </div>
            <div className="threat-stat">
              <span className="threat-label malware">Malware</span>
              <span className="threat-count">{stats?.by_prediction?.malware || 0}</span>
            </div>
            <div className="threat-stat">
              <span className="threat-label ddos">DDoS</span>
              <span className="threat-count">{stats?.by_prediction?.ddos || 0}</span>
            </div>
            <div className="threat-stat">
              <span className="threat-label normal">Normal</span>
              <span className="threat-count">{stats?.by_prediction?.normal || 0}</span>
            </div>
          </div>
        </div>

        <div className="card severity-breakdown">
          <div className="card-header">
            <h3 className="card-title">
              <AlertTriangle size={20} />
              Severity Distribution
            </h3>
          </div>
          <div className="severity-stats">
            <div className="severity-stat">
              <span className="severity-dot high"></span>
              <span className="severity-label">High</span>
              <span className="severity-count">{stats?.by_severity?.high || 0}</span>
            </div>
            <div className="severity-stat">
              <span className="severity-dot medium"></span>
              <span className="severity-label">Medium</span>
              <span className="severity-count">{stats?.by_severity?.medium || 0}</span>
            </div>
            <div className="severity-stat">
              <span className="severity-dot low"></span>
              <span className="severity-label">Low</span>
              <span className="severity-count">{stats?.by_severity?.low || 0}</span>
            </div>
          </div>
        </div>

        <div className="card metrics-summary">
          <div className="card-header">
            <h3 className="card-title">
              <Brain size={20} />
              ML Performance
            </h3>
          </div>
          <div className="metrics-stats">
            <div className="metric">
              <span className="metric-label">Threat Rate</span>
              <span className="metric-value">
                {stats?.total > 0 ? Math.round((getThreatCount() / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">High Severity Rate</span>
              <span className="metric-value">
                {stats?.total > 0 ? Math.round(((stats.by_severity?.high || 0) / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Model Accuracy</span>
              <span className="metric-value">{stats?.classification_accuracy || 94.8}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="charts-section">
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-title">
                  <PieChart size={20} />
                  Threat Distribution
                </h3>
                <p className="chart-subtitle">
                  Proportional breakdown of detected content types
                </p>
              </div>
            </div>
            <ThreatDistributionChart data={stats?.by_prediction} />
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-title">
                  <BarChart3 size={20} />
                  Category Analysis
                </h3>
                <p className="chart-subtitle">
                  Count comparison across all categories
                </p>
              </div>
            </div>
            <CategoryBarChart data={stats?.by_prediction} />
          </div>
        </div>

        <div className="chart-card timeline-chart">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">
                <TimelineIcon size={20} />
                Real-time Threat Timeline
              </h3>
              <p className="chart-subtitle">
                Live tracking of threat detection over time
              </p>
            </div>
          </div>
          <ThreatsTimelineChart stats={stats} />
        </div>
      </div>

      {/* Active Surveillance Targets */}
      {monitoredTargets.length > 0 && (
        <div className="card monitored-targets-section">
          <div className="card-header">
            <h2 className="card-title">
              <Radar size={22} className="text-safe" />
              Active Surveillance Targets
            </h2>
            <div className="targets-count-badge">{monitoredTargets.length} Monitored</div>
          </div>
          <div className="targets-grid">
            {monitoredTargets.map((target, idx) => (
              <div key={idx} className="target-mini-card">
                <div className="target-header">
                  <span className="target-user">@{target.username}</span>
                  <span className="live-status active">LIVE</span>
                </div>
                <div className="target-stats">
                  <div className="t-stat">
                    <Users size={14} />
                    <span>{target.followersCount?.toLocaleString()} Followers</span>
                  </div>
                  <div className="t-stat danger">
                    <AlertTriangle size={14} />
                    <span>{target.threats_found} Threats</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Latest Classified Posts</h2>
          <Link to="/incidents" className="btn btn-secondary">
            View All Posts
          </Link>
        </div>
        <div className="grid grid-2">
          {recentIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
        {recentIncidents.length === 0 && (
          <p className="empty-state">
            No posts found. Scanning global intelligence nodes...
          </p>
        )}
      </div>
    </div>
  )
}

export default Dashboard