import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, ExternalLink, Calendar, Tag, AlertTriangle, 
  Shield, Brain, Clock, ChevronRight, FileText, Database, Share2
} from 'lucide-react'
import { incidentService } from '../services/api'
import './IncidentDetail.css'

function IncidentDetail() {
  const { id } = useParams()
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchIncident()
  }, [id])

  const fetchIncident = async () => {
    try {
      setLoading(true)
      const response = await incidentService.getIncidentById(id)
      setIncident(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch incident details.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) return <div className="loading-container"><div className="spinner"></div><p>Generating Forensic Report...</p></div>

  if (error || !incident) {
    return (
      <div className="error-container">
        <AlertTriangle size={48} color="#dc2626" />
        <h1>Investigation Data Not Found</h1>
        <p>The requested incident record does not exist in the secure cache.</p>
        <Link to="/incidents" className="back-btn"><ArrowLeft size={16} /> Return to Feed</Link>
      </div>
    )
  }

  const prediction = incident.predicted_label || incident.prediction || 'normal';
  const isThreat = prediction !== 'normal' && prediction !== 'unknown';

  return (
    <div className="report-page">
      <div className="report-nav">
        <Link to="/incidents" className="report-back">
          <ArrowLeft size={18} />
          Terminal Feed
        </Link>
        <div className="report-breadcrumb">
          <span>Incidents</span> <ChevronRight size={14} /> <span>Case #{id.substring(0, 8)}</span>
        </div>
      </div>

      <div className="report-layout">
        {/* Main Content Area */}
        <div className="report-main">
          <div className="report-header-card">
            <div className={`report-status-badge ${isThreat ? 'threat' : 'safe'}`}>
               <Shield size={16} />
               {isThreat ? 'MALICIOUS ACTIVITY DETECTED' : 'BENIGN SOCIAL ACTIVITY'}
            </div>
            <h1 className="report-title">{incident.title || 'Investigative Case Analysis'}</h1>
            <div className="report-summary-stats">
              <div className="r-stat">
                <Clock size={16} />
                <span>IDENTIFIED: {formatDate(incident.timestamp || incident.published_date)}</span>
              </div>
              <div className="r-stat">
                <Database size={16} />
                <span>SOURCE: {incident.source || 'Scraper Engine v2.1'}</span>
              </div>
            </div>
          </div>

          <div className="report-card content-card">
            <div className="card-lbl"><FileText size={16} /> CASE DESCRIPTION</div>
            <div className="report-text-content">
              {incident.description || incident.text || 'No additional description available for this case.'}
            </div>
          </div>

          {incident.url && (
            <div className="report-card">
               <div className="card-lbl"><Share2 size={16} /> EXTERNAL SOURCE</div>
               <a href={incident.url} target="_blank" rel="noreferrer" className="source-link">
                  Open Original Instagram Reference <ExternalLink size={16} />
               </a>
            </div>
          )}
        </div>

        {/* Sidebar Diagnostics */}
        <div className="report-sidebar">
          <div className="report-card diagnostics-card">
             <div className="card-lbl"><Brain size={16} /> ML DIAGNOSTICS</div>
             
             <div className="diag-item">
                <span className="diag-lbl">CLASSIFICATION</span>
                <span className={`diag-val cat-${prediction.toLowerCase()}`}>{prediction.toUpperCase()}</span>
             </div>

             <div className="diag-item">
                <span className="diag-lbl">SEVERITY LEVEL</span>
                <span className={`diag-val sev-${incident.severity || 'low'}`}>{incident.severity?.toUpperCase() || 'LOW'}</span>
             </div>

             <div className="diag-confidence">
                <div className="conf-header">
                   <span>ALGORITHMIC CONFIDENCE</span>
                   <span>{Math.round((incident.confidence || 0.95) * 100)}%</span>
                </div>
                <div className="conf-bar-bg">
                   <div className="conf-bar-fill" style={{ width: `${(incident.confidence || 0.95) * 100}%` }}></div>
                </div>
             </div>
          </div>

          <div className="report-card tags-card">
             <div className="card-lbl">SECURITY TAGS</div>
             <div className="report-tags">
                <span className="r-tag">#{prediction.toLowerCase()}</span>
                {incident.tags?.map((t, i) => (
                  <span key={i} className="r-tag">#{t}</span>
                )) || <span className="r-tag">#monitored</span>}
             </div>
          </div>

          <div className="disclaimer-note">
             <Shield size={12} />
             This report is generated by a neural-based threat classification system for investigative purposes only.
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncidentDetail
