import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Search, RefreshCw, Instagram, Shield, AlertTriangle, Users, BookOpen, Fingerprint, Activity, Terminal, Database, Lock, CheckCircle, Wifi, Info, ListFilter, ShieldCheck, Eye, Quote, Radar, MonitorPlay, Zap, ArrowUpRight, History, Clock } from 'lucide-react'
import { analysisService, incidentService } from '../services/api'
import { ChartSkeleton, SkeletonBox } from '../components/layout/Skeleton'
import IncidentCard from '../components/IncidentCard'
import './Analytics.css'
import '../components/layout/Skeleton.css'

const COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#16a34a',
  malware: '#3b82f6',
  vulnerability: '#8b5cf6',
  phishing: '#ec4899',
  ddos: '#f59e0b',
  data_breach: '#ef4444',
  apt: '#6366f1',
  network: '#14b8a6',
  normal: '#16a34a'
}

export default function Analytics() {
  const [searchParams] = useSearchParams();
  const [searchUsername, setSearchUsername] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [severityData, setSeverityData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [profileData, setProfileData] = useState(null)
  const [scanResults, setScanResults] = useState([])
  const [threatCount, setThreatCount] = useState(0)
  const [trustScore, setTrustScore] = useState(100)
  const [forensicInsights, setForensicInsights] = useState([])
  const [flaggedPosts, setFlaggedPosts] = useState([])
  const [investigationHistory, setInvestigationHistory] = useState([])

  // LIVE MONITORING STATES
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [followerUpdateCount, setFollowerUpdateCount] = useState(0); 
  const monitoringIntervalRef = useRef(null);

  // Initialize analytics data
  useEffect(() => {
    fetchAnalytics();
    fetchHistory();
    
    const urlUsername = searchParams.get('username');
    if (urlUsername) {
      setSearchUsername(urlUsername);
      handleAnalyze(urlUsername);
    }

    return () => {
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
    }
  }, []);

  // Polling logic for Live Monitoring
  useEffect(() => {
    if (isMonitoring && profileData?.username) {
      monitoringIntervalRef.current = setInterval(() => {
        performSilentSync(profileData.username);
      }, 30000); 
    } else {
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
    }
    return () => {
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
    }
  }, [isMonitoring, profileData?.username]);

  const performSilentSync = async (username) => {
    try {
      const result = await analysisService.analyzeProfile(username);
      if (result.success && result.profile) {
        if (result.profile.followersCount > profileData.followersCount) {
          setFollowerUpdateCount(result.profile.followersCount - profileData.followersCount);
          setTimeout(() => setFollowerUpdateCount(0), 10000);
        }
        setProfileData(result.profile);
      }
    } catch (e) { console.error("Silent Sync Failed", e); }
  }

  // Simulate progress when analyzing
  useEffect(() => {
    let interval;
    if (analyzing) {
      setScanProgress(5);
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 95) return prev;
          prev += Math.floor(Math.random() * 8) + 2;
          return prev > 95 ? 95 : prev;
        });
      }, 1200);
    } else {
      setScanProgress(0);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  const calculateForensics = (profile, posts, threatCount) => {
    let score = 100;
    const insights = [];
    
    if (threatCount > 0) {
      const penalty = (threatCount * 5); 
      score -= penalty;
      insights.push({ label: `${threatCount} suspicious patterns flagged in automated scan.`, type: 'danger' });
    } else {
      insights.push({ label: "Autonomous content scan found 0 malicious signatures.", type: 'safe' });
    }
    
    const followers = profile.followersCount || 0;
    const following = profile.followsCount || 0;
    if (followers > 10000) {
      score += 25; 
      insights.push({ label: "Authority profile detected (>10K followers). Professional/Business status validated.", type: 'safe' });
    }
    if (following > (followers * 4) && following > 800) {
      score -= 20;
      insights.push({ label: "Unusual following-to-follower ratio detected. Common sign of automated reach-out.", type: 'warning' });
    }
    
    if (!profile.profilePicUrl || profile.profilePicUrl === "" || profile.profilePicUrl.includes('placeholder')) {
      score -= 40;
      insights.push({ label: "Identity marker missing: Profile avatar is unpopulated.", type: 'danger' });
    }
    if (!profile.biography || profile.biography?.trim() === "") {
      score -= 20;
      insights.push({ label: "Identity marker missing: Biography parameters are empty.", type: 'warning' });
    }
    
    return { score: Math.max(0, Math.min(100, score)), insights };
  }

  const handleAnalyze = async (username) => {
    const target = (username || searchUsername).trim();
    if(!target) return;
    
    setAnalyzing(true);
    setError(null);
    setProfileData(null);
    setScanResults([]);
    setThreatCount(0);
    setTrustScore(100);
    setForensicInsights([]);
    setFlaggedPosts([]);
    setIsMonitoring(false);
    
    try {
      const result = await analysisService.analyzeProfile(target);
      if (result.success) {
        setProfileData(result.profile);
        const allPosts = result.data || [];
        setScanResults(allPosts);
        
        const threats = allPosts.filter(p => p.predicted_label !== 'normal');
        setThreatCount(threats.length);
        setFlaggedPosts(threats);
        
        const forensicData = calculateForensics(result.profile, allPosts, threats.length);
        setTrustScore(forensicData.score);
        setForensicInsights(forensicData.insights);
        
        // SAVE TO HISTORY AUTOMATICALLY
        await analysisService.saveHistory({
          profile: result.profile,
          posts: allPosts,
          trust_score: forensicData.score,
          insights: forensicData.insights
        });
        
        fetchAnalytics();
        fetchHistory();
      } else {
        setError(result.message || 'Scraper Node Timeout. Try again.');
      }
    } catch (err) {
      setError(`Platform Error: ${err.message || 'Node connection lost'}`);
    } finally {
      setAnalyzing(false);
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const statsResponse = await incidentService.getStats();
      const s = statsResponse.data;
      if (!s) return;
      setSeverityData(Object.entries(s.by_severity || {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value, color: COLORS[name.toLowerCase()] || '#94a3b8'
      })));
      setCategoryData(Object.entries(s.by_prediction || {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value, color: COLORS[name.toLowerCase()] || '#94a3b8'
      })));
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const fetchHistory = async () => {
    try {
      const histData = await analysisService.getHistory();
      if (histData.success) {
        setInvestigationHistory(histData.data);
      }
    } catch (e) { console.error(e) }
  }

  const getForensicVerdict = () => {
    if (trustScore < 40) return { label: 'CRITICAL: LIKELY FAKE/FRAUDULENT ENTITY', class: 'danger', icon: <AlertTriangle size={24} /> };
    if (threatCount > 4) return { label: 'WARNING: MULTIPLE SUSPICIOUS SIGNATURES DETECTED', class: 'warning', icon: <Activity size={24} /> };
    if (trustScore < 80) return { label: 'SUSPICIOUS: ABNORMAL ACCOUNT PARAMETERS', class: 'neutral', icon: <Info size={24} /> };
    return { label: 'STATUS: CLEAN PROFILE | HIGH AUTHENTICITY', class: 'safe', icon: <ShieldCheck size={24} /> };
  }

  return (
    <div className="analytics-container">
      {/* Premium Investigative Hero Section */}
      <div className="analysis-hero-premium">
        <div className="hero-pattern-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge"><Radar size={14} /> LIVE THREAT SCANNER ACTIVE</div>
          <h1 className="hero-title">Start Intelligence Scan</h1>
          <p className="hero-hint">Identify Fake Entities and Malware signatures in real-time.</p>
          
          <form className="premium-search-container" onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }}>
            <div className="search-input-wrapper">
              <Instagram size={22} className="ig-icon-fixed" />
              <input 
                type="text" 
                placeholder="Enter Instagram Profile URL or Username..." 
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                disabled={analyzing}
              />
            </div>
            <button type="submit" disabled={analyzing} className={`premium-analyze-btn ${analyzing ? 'is-scanning' : ''}`}>
              {analyzing ? <RefreshCw className="spin" size={20} /> : <Search size={20} />}
              <span>{analyzing ? 'SCANNING NODE...' : 'ANALYZE NOW'}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="analytics-main-layout">
        <div className="analytics-content-scroller">
          {analyzing && (
            <div className="scan-protocol-overlay">
               <div className="protocol-card">
                  <Activity size={32} className="pulse-icon" />
                  <h3>AUTHORIZED SCAN IN PROGRESS</h3>
                  <div className="progress-container"><div className="progress-fill" style={{ width: `${scanProgress}%` }} /></div>
                  <div className="protocol-steps">
                     <div className={`step ${scanProgress > 10 ? 'done' : ''}`}><Shield size={14} /> Node Authorization</div>
                     <div className={`step ${scanProgress > 40 ? 'done' : ''}`}><Database size={14} /> Dataset Fetching</div>
                     <div className={`step ${scanProgress > 70 ? 'done' : ''}`}><Lock size={14} /> Cyber-Threat Classification</div>
                  </div>
                  <p className="protocol-wait">Establishing secure proxy connection to Instagram servers...</p>
               </div>
            </div>
          )}

          {error && <div className="error-banner"><AlertTriangle /> {error}</div>}

          {profileData && (
            <div className="profile-intel-card pulse-in">
               <div className="forensic-header-group">
                  <div className={`forensic-verdict-banner ${getForensicVerdict().class}`}>
                    {getForensicVerdict().icon}
                    <span>{getForensicVerdict().label}</span>
                  </div>
                  
                  <button 
                    className={`monitoring-toggle ${isMonitoring ? 'active' : ''}`}
                    onClick={() => setIsMonitoring(!isMonitoring)}
                  >
                    {isMonitoring ? <Zap size={16} className="zap-pulse" /> : <MonitorPlay size={16} />}
                    {isMonitoring ? 'LIVE MONITORING ON' : 'START LIVE MONITORING'}
                  </button>
               </div>

               <div className="intel-header">
                  <div className="intel-avatar"><Users size={32} /></div>
                  <div className="intel-info">
                     <h2>{profileData.fullName || 'Forensic Intelligence Node'}</h2>
                     <span className="intel-handle">@{profileData.username}</span>
                  </div>
                  <div className="authenticity-metric">
                     <div className="gauge-label"><Fingerprint size={16} /> Trust Score</div>
                     <div className="gauge-value" style={{ color: trustScore < 50 ? '#dc2626' : '#16a34a' }}>{trustScore}%</div>
                     <div className="gauge-bar"><div className="gauge-fill" style={{ width: `${trustScore}%`, background: trustScore < 50 ? '#dc2626' : '#16a34a' }} /></div>
                  </div>
               </div>

               <div className="bio-box active">
                  <div className="bio-label"><Quote size={12} /> BIOGRAPHY INTEL</div>
                  <p className="intel-bio">{profileData.biography || 'Biological signature captured via forensic node.'}</p>
               </div>
               
               <div className="intel-stats">
                  <div className={`i-stat ${followerUpdateCount > 0 ? 'highlight-sync' : ''}`}>
                    <strong>{profileData.followersCount?.toLocaleString()}</strong>
                    <span>
                      FOLLOWERS 
                      {followerUpdateCount > 0 && <span className="delta-stat">+{followerUpdateCount} <ArrowUpRight size={10} /></span>}
                    </span>
                  </div>
                  <div className="i-stat"><strong>{profileData.followsCount?.toLocaleString()}</strong><span>FOLLOWING</span></div>
                  <div className="i-stat threat"><strong>{scanResults.length}</strong><span>POSTS ANALYZED</span></div>
                  <div className={`i-stat ${threatCount > 0 ? 'danger-blink' : ''}`}>
                     <strong>{threatCount}</strong>
                     <span>THREATS FOUND</span>
                  </div>
               </div>
               
               <div className="forensic-insights-box">
                  <div className="insights-header"><ListFilter size={14} /> Forensic Insights & Reasoning</div>
                  <div className="insights-list">
                     {forensicInsights.map((insight, idx) => (
                        <div key={idx} className={`insight-item ${insight.type}`}>
                           {insight.type === 'safe' ? <CheckCircle size={14} /> : <Info size={14} />}
                           {insight.label}
                        </div>
                     ))}
                     
                     {flaggedPosts.length > 0 && (
                        <div className="flagged-elements-section">
                           <div className="elements-title"><Eye size={12} /> Elements Triggering AI Detection:</div>
                           <div className="elements-scroll-premium">
                              <div className="incidents-grid-mini">
                                 {flaggedPosts.map((post, pIdx) => (
                                    <IncidentCard key={pIdx} incident={post} />
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          )}

          <div className="analytics-grid">
            <div className="card">
              <div className="card-header"><h2 className="card-title"><TrendingUp size={20} /> Severity Analytics</h2></div>
              <div className="chart-container">
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={severityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                        {severityData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h2 className="card-title"><Fingerprint size={20} /> Categorical Threat Map</h2></div>
              <div className="chart-container">
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name }) => name}>
                        {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* INVESTIGATION HISTORY SIDEBAR */}
        <div className="history-sidebar">
           <div className="history-header">
              <History size={18} />
              <span>PAST INVESTIGATIONS</span>
           </div>
           <div className="history-list">
              {investigationHistory.length > 0 ? (
                investigationHistory.map((item, idx) => (
                  <div key={idx} className="history-item" onClick={() => handleAnalyze(item.username)}>
                    <div className="h-top">
                       <span className="h-username">@{item.username}</span>
                       <span className={`h-score ${item.trust_score < 50 ? 'danger' : 'safe'}`}>
                          {item.trust_score}%
                       </span>
                    </div>
                    <div className="h-meta">
                       <Clock size={10} /> {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                    <div className="h-stats">
                       <span>{item.threats_found} Threats</span> | <span>{item.total_posts} Posts</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="history-empty">No past intelligence reports found in archive.</div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
