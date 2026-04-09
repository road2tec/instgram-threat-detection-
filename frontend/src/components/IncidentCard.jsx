import { Link } from 'react-router-dom'
import { AlertTriangle, Clock, Shield, Brain, ChevronRight } from 'lucide-react'
import './IncidentCard.css'

function IncidentCard({ incident }) {
  const getSeverityClass = (severity) => {
    const classes = {
      critical: 'severity-critical',
      high: 'severity-critical', 
      medium: 'severity-medium',
      low: 'severity-low'
    }
    return classes[severity] || 'severity-medium'
  }

  const getPredictionIcon = (prediction) => {
    if (prediction === 'normal') return Shield
    return AlertTriangle
  }

  const getPredictionClass = (prediction) => {
    const classes = {
      normal: 'prediction-normal',
      phishing: 'prediction-phishing',
      malware: 'prediction-malware',
      ddos: 'prediction-ddos',
      unknown: 'prediction-unknown'
    }
    return classes[prediction] || 'prediction-unknown'
  }

  const formatDate = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    if (isNaN(date.getTime())) {
      return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  const prediction = (incident.predicted_label || incident.prediction || 'normal').toLowerCase();
  const isThreat = prediction !== 'normal' && prediction !== 'unknown';
  
  const PredictionIcon = getPredictionIcon(prediction)

  return (
    <div className={`incident-card ${isThreat ? 'threat-card' : 'normal-card'}`}>
      <div className="incident-card-inner">
        <div className="incident-card-header">
          <div className="badges-row">
            <span className={`severity-badge-mini ${getSeverityClass(incident.severity)}`}>
               {incident.severity || 'low'}
            </span>
            <span className={`prediction-badge-mini ${getPredictionClass(prediction)}`}>
               {prediction}
            </span>
          </div>
          <div className="timestamp-mini">
             <Clock size={12} /> {formatDate(incident.timestamp || incident.published_date)}
          </div>
        </div>

        <Link to={`/incidents/${incident.id}`} className="incident-card-title">
          {isThreat ? 'Cyber Threat Detected' : 'Benign Social Metadata'}
          <ChevronRight size={14} className="arrow-icon" />
        </Link>

        <p className="incident-body-text">
          {incident.text || incident.description || 'No descriptive payload identified.'}
        </p>

        <div className="forensic-footer">
          <div className="ml-stat">
             <Brain size={12} />
             <span>CONFIDENCE: {Math.round((incident.confidence || 0.95) * 100)}%</span>
          </div>
          <div className="category-tag">
             THREAT: <span className="cat-val">{prediction}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncidentCard
