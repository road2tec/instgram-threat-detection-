import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, AlertTriangle, Shield, Clock, RefreshCw, Zap } from 'lucide-react'
import { incidentService } from '../services/api'
import IncidentCard from '../components/IncidentCard'
import './IncidentsList.css'

function IncidentsList() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const fetchIncidents = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const data = await incidentService.getIncidents()
      setIncidents(data.data || [])
      setLastRefreshed(new Date())
      setError(null)
    } catch (err) {
      setError('Failed to fetch incidents.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Live Sync Effect: Poll every 8 seconds for new simulator data
  useEffect(() => {
    fetchIncidents()
    const pollInterval = setInterval(() => {
      fetchIncidents(false); // Background refresh
    }, 8000)
    return () => clearInterval(pollInterval)
  }, [])

  const filteredIncidents = incidents.filter(i => {
    const term = (i.text || i.description || '').toLowerCase()
    const matchesSearch = term.includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (i.category || i.predicted_label || '').toLowerCase() === filter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  return (
    <div className="incidents-container">
      <div className="incidents-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Forensic Feeding Engine</h1>
            <div className="live-status-badge pulse">
               <Zap size={14} /> LIVE: CLOUD NODE SYNC ACTIVE
            </div>
            <p className="page-description">
              Real-time monitoring of social media cyber-incidents across global clusters.
            </p>
          </div>
          <div className="refresh-status">
             <Clock size={14} /> Last Scan: {lastRefreshed.toLocaleTimeString()}
          </div>
        </div>

        <div className="incidents-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search forensic text signatures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <Filter size={18} className="filter-icon" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="phishing">Phishing</option>
              <option value="ddos">DDoS Attack</option>
              <option value="malware">Malware</option>
              <option value="normal">Safe Activity</option>
            </select>
          </div>
        </div>
      </div>

      {loading && incidents.length === 0 ? (
        <div className="loading-state">
           <RefreshCw className="spin" size={32} />
           <p>Calibrating Forensic Terminal...</p>
        </div>
      ) : error ? (
        <div className="error-banner">
          <AlertTriangle size={20} />
          {error}
        </div>
      ) : (
        <div className="incidents-layout">
          <div className="incidents-grid">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))
            ) : (
              <div className="empty-state">
                <Shield size={48} />
                <p>No incidents matching your current investigative filter.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default IncidentsList
