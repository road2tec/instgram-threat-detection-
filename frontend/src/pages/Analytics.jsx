import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Search, RefreshCw, Instagram, Shield, AlertTriangle, Users, BookOpen, Fingerprint, Activity, Terminal, Database, Lock, CheckCircle, Wifi, Info, ListFilter, ShieldCheck, Eye, Quote, Radar, MonitorPlay, Zap, ArrowUpRight, History, Clock, Globe } from 'lucide-react'
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
  const [liveEvents, setLiveEvents] = useState([])
  const [analyzedCount, setAnalyzedCount] = useState(0)

  // LIVE MONITORING STATES
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
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
      }, 60000); // 60s interval to allow deep-scans to complete and prevent overlapping
    } else {
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
    }
    return () => {
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
    }
  }, [isMonitoring, profileData?.username]);

  const performSilentSync = async (username) => {
    if (isSyncing) return;
    try {
      setIsSyncing(true);
      const result = await analysisService.getLiveStream(username);
      if (result.success && result.events && result.events.length > 0) {
        setLiveEvents(prev => [...result.events, ...prev].slice(0, 10));
        
        // Update profile counts if follower change detected
        const followerChange = result.events.find(e => e.type === 'follower_change');
        if (followerChange) {
          setProfileData(prev => ({
            ...prev,
            followersCount: prev.followersCount + followerChange.value
          }));
          setFollowerUpdateCount(followerChange.value);
          setTimeout(() => setFollowerUpdateCount(0), 3000);
        }
      } else if (result.success && result.status === 'preserving_baseline') {
        // Just log a silent heartbeat if needed
        console.log("[LIVE] Baseline preserved, no changes.");
      }
    } catch (e) { 
      console.error("Live Sync Failed", e); 
    } finally {
      setIsSyncing(false);
    }
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
    setLiveEvents([]);
    setAnalyzedCount(0);
    
    try {
      const result = await analysisService.analyzeProfile(target);
      if (result.success) {
        setProfileData(result.profile);
        const allPosts = result.data || [];
        setScanResults(allPosts);
        
        // Start staggered analysis simulation
        if (allPosts.length > 0) {
          let count = 0;
          const analysisInterval = setInterval(() => {
            count++;
            setAnalyzedCount(count);
            if (count >= allPosts.length) {
              clearInterval(analysisInterval);
            }
          }, 400); // Faster reveal for better UX
        } else {
          setAnalyzedCount(0);
        }

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

  const handleMonitor = async () => {
    try {
      await analysisService.monitorProfile(profileData.username);
      setIsMonitoring(true);
      setLiveEvents([{
        type: 'info',
        message: 'Surveillance Mode Engaged',
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.error(err);
    }
  };

  const getForensicVerdict = () => {
    if (trustScore < 40) return { label: 'CRITICAL: FRAUDULENT ENTITY', class: 'danger', icon: <AlertTriangle size={24} /> };
    if (threatCount > 4) return { label: 'WARNING: MULTIPLE THREATS', class: 'warning', icon: <Activity size={24} /> };
    if (trustScore < 80) return { label: 'SUSPICIOUS: ABNORMAL PARAMS', class: 'neutral', icon: <Info size={24} /> };
    return { label: 'STATUS: CLEAN | AUTHENTIC', class: 'safe', icon: <ShieldCheck size={24} /> };
  }

  return (
    <div className="analytics-container page-transition">
      <div className="analytics-refined-hub">
        {/* SUBTLE HEADER SECTION */}
        <header className="refined-header">
           <div className="refined-badge">
             <Radar size={14} className="pulse-slow" /> 
             NETWORK_SCANNER_v2.0
           </div>
           <h1 className="refined-title">Forensic Intelligence</h1>
           <p className="refined-subtitle">Uncover hidden signatures and platform anomalies with AI-driven analysis.</p>
        </header>

        {/* CENTERED SEARCH ENGINE */}
        <section className="refined-search-section">
           <form className="refined-search-bar" onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }}>
              <Instagram size={20} className="refined-search-icon" />
              <input 
                type="text" 
                placeholder="Enter handle or profile URL..." 
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                disabled={analyzing}
              />
              <button type="submit" disabled={analyzing} className="refined-submit-btn">
                 {analyzing ? <RefreshCw className="spin" size={18} /> : <Search size={18} />}
                 <span>{analyzing ? 'SCANNING...' : 'ANALYZE'}</span>
              </button>
           </form>
        </section>

        {/* DYNAMIC RESULTS HUB */}
        <main className="refined-results-area">
          {analyzing && (
            <div className="refined-scanner-overlay">
               <div className="scan-ripple"></div>
               <Activity size={40} className="scan-pulse-icon" />
               <div className="scan-meta-log">
                 <span>{scanProgress}% COMPLETE</span>
                 <p>Establishing secure socket tunnel to global nodes...</p>
               </div>
            </div>
          )}

          {profileData && (
            <>
              <div className="refined-profile-grid">
                {/* MAIN PROFILE INFO */}
                <div className="refined-card profile-main-card">
                  <div className="refined-profile-top">
                    <div className="refined-avatar-frame">
                      <Fingerprint size={40} />
                    </div>
                    <div className="refined-profile-info">
                      <h2>{profileData.fullName}</h2>
                      <span className="refined-handle">@{profileData.username}</span>
                      <button className="monitor-btn glass" onClick={handleMonitor}>
                        <Radar size={14} /> LIVE MONITOR
                      </button>
                    </div>
                    <div className="refined-trust-indicator">
                      <div className="refined-gauge-circle" style={{ '--score': `${trustScore}%`, '--color': trustScore < 50 ? '#f43f5e' : '#10b981' }}>
                        <span className="score-val">{trustScore}%</span>
                      </div>
                      <span className="gauge-label">TRUST INDEX</span>
                    </div>
                  </div>
                  
                  <div className="refined-profile-stats">
                    <div className="stat-pill">
                      <strong>{(profileData.followersCount || 0).toLocaleString()}</strong> 
                      <span>Followers</span>
                      {followerUpdateCount !== 0 && (
                        <span className={`follower-delta ${followerUpdateCount > 0 ? 'plus' : 'minus'}`}>
                          {followerUpdateCount > 0 ? `+${followerUpdateCount}` : followerUpdateCount}
                        </span>
                      )}
                    </div>
                    <div className="stat-pill">
                      <strong>{(profileData.followsCount || 0).toLocaleString()}</strong> 
                      <span>Following</span>
                    </div>
                    <div className="stat-pill">
                      <strong>{(profileData.postsCount || scanResults.length || 0).toLocaleString()}</strong> 
                      <span>Posts</span>
                    </div>
                    <div className="stat-pill purple">
                      <strong>{analyzedCount} / {(profileData.postsCount || scanResults.length || 0).toLocaleString()}</strong> 
                      <span>Analyzed</span>
                    </div>
                    <div className="stat-pill danger">
                      <strong>{threatCount}</strong> 
                      <span>Threats</span>
                    </div>
                  </div>
                </div>

                {/* LIVE EVENT MONITOR */}
                <div className="refined-card live-events-card">
                  <div className="card-header-v3">
                    <Wifi size={16} className={isMonitoring ? 'text-safe pulse-slow' : ''} /> 
                    LIVE MONITOR LOG
                    <span className="live-status-pill real">REAL-TIME</span>
                    {isMonitoring && (
                      <span className={`live-status-pill ${isSyncing ? 'syncing' : 'active'}`}>
                        {isSyncing ? 'SYNCING...' : 'ACTIVE'}
                      </span>
                    )}
                  </div>
                  <div className="live-events-list">
                    {liveEvents.length > 0 ? (
                      liveEvents.map((event, i) => (
                        <div key={i} className="live-event-item">
                          <span className="event-time">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          <span className="event-msg">{event.message}</span>
                        </div>
                      ))
                    ) : (
                      <div className="live-empty">
                        <Activity size={32} />
                        <p>{isMonitoring ? 'Waiting for network events...' : 'Activate Live Monitor to begin surveillance'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ANALYTICS PREVIEW */}
                <div className="refined-card charts-preview-card">
                  <div className="card-header-v3"><TrendingUp size={16} /> THREAT DISTRIBUTION</div>
                  <div className="mini-charts-grid">
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={severityData}>
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{display: 'none'}} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {severityData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="refined-verdict-box">
                    {getForensicVerdict().icon}
                    <span>{getForensicVerdict().label}</span>
                  </div>
                </div>

                {/* FORENSIC INSIGHTS LIST */}
                <div className="refined-card insights-list-card">
                  <div className="card-header-v3"><Shield size={16} /> FORENSIC REASONING</div>
                  <div className="refined-insights-scroll">
                    {forensicInsights.map((insight, idx) => (
                      <div key={idx} className={`refined-insight-item ${insight.type}`}>
                        <div className="indicator-dot"></div>
                        {insight.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FULL INTELLIGENCE STREAM */}
              {scanResults.length > 0 && (
                <div className="intelligence-stream-section glass pulse-in">
                  <div className="card-header-v3">
                    <Globe size={18} /> 
                    FULL INTELLIGENCE STREAM 
                    <div className="analysis-progress-meta">
                      <span>{analyzedCount} / {scanResults.length} ANALYZED</span>
                      <div className="progress-bar-mini">
                        <div className="progress-fill" style={{ width: `${(analyzedCount / scanResults.length) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="intel-posts-grid">
                    {scanResults.map((post, idx) => {
                      const isAnalyzed = idx < analyzedCount;
                      return (
                        <div key={idx} className={`intel-post-item ${isAnalyzed ? post.predicted_label : 'analyzing'}`}>
                          {!isAnalyzed ? (
                            <div className="post-analyzing-overlay">
                              <RefreshCw size={24} className="spin" />
                              <span>ANALYZING SIGNATURES...</span>
                            </div>
                          ) : (
                            <>
                              <div className="post-verdict-badge">
                                {post.predicted_label === 'normal' ? <ShieldCheck size={12} /> : <AlertTriangle size={12} />}
                                {post.predicted_label.toUpperCase()}
                              </div>
                              <p className="post-body">{post.text}</p>
                              <div className="post-meta-row">
                                <span className="meta-tag">{(post.confidence * 100).toFixed(1)}% MATCH</span>
                                <span className={`meta-tag sev ${post.severity}`}>{post.severity.toUpperCase()}</span>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* HISTORY ARCHIVE */}
          {!analyzing && !profileData && (
            <div className="refined-history-section">
              <div className="section-title"><History size={16} /> RECENT INVESTIGATIONS</div>
              <div className="refined-history-grid">
                {investigationHistory.slice(0, 4).map((h, i) => (
                  <div key={i} className="refined-history-item" onClick={() => handleAnalyze(h.username)}>
                    <span className="h-user">@{h.username}</span>
                    <span className="h-date">{new Date(h.timestamp).toLocaleDateString()}</span>
                    <span className={`h-score-tag ${h.trust_score < 50 ? 'danger' : 'safe'}`}>{h.trust_score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
