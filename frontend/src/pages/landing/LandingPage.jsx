import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Activity, Brain, Globe, Users, CheckCircle, 
  ArrowRight, BarChart3, Clock, Lock, Zap, Eye, Search, AlertTriangle, ShieldCheck,
  Cpu, Database, Layout, Smartphone, TrendingUp, Key, Fingerprint, MousePointer2,
  Twitter, Github, Linkedin, Mail, ExternalLink, Play
} from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInvestigate = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/login?redirect=analytics&search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-brand">
            <Shield className="brand-shield" size={28} />
            <span>CyberMonitor IG</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Capabilities</a>
            <a href="#how" className="nav-link">Intelligence Pipeline</a>
            <a href="#stats" className="nav-link">Global Metrics</a>
            <Link to="/login" className="nav-link">Sign In</Link>
            <Link to="/register" className="btn-launch">Initialize Console</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <Zap size={14} />
            <span>v2.0: Neural-Network Threat Classification Active</span>
          </div>
          <h1 className="hero-title">
            Advanced <span className="hero-highlight">Social Intelligence</span><br />
            Monitoring System
          </h1>
          <p className="hero-description">
            Protect ecosystems with real-time AI forensic detection. Identify Phishing, DDoS coordination, and Malware distribution with academic-grade precision.
          </p>

          <div className="hero-actions">
            <form className="hero-search-wrapper" onSubmit={handleInvestigate}>
              <input 
                 type="text" 
                 className="hero-search-input" 
                 placeholder="Search @username or suspicious text..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="hero-search-btn">
                <Search size={20} />
                Scan Now
              </button>
            </form>
          </div>

          <div className="hero-stats" id="stats">
            <div className="stat-box">
              <span className="stat-value">1.4M+</span>
              <span className="stat-label">Posts Analyzed</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">94.2%</span>
              <span className="stat-label">ML Accuracy</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">50ms</span>
              <span className="stat-label">Scan Latency</span>
            </div>
          </div>

          {/* Dashboard Mockup Component */}
          <div className="dashboard-mockup">
             <div className="mockup-inner">
                <div className="mockup-header">
                   <div className="dot r"></div>
                   <div className="dot y"></div>
                   <div className="dot g"></div>
                </div>
                <div className="mockup-content">
                   <div className="preview-card">
                      <div className="p-badge danger">THREAT DETECTED</div>
                      <p className="p-text">"Urgent: System failure detected. Log in at secure-ig-verify.net to prevent permanent account suspension."</p>
                      <div className="p-footer">
                         <Activity size={14} /> <strong>Classifier:</strong> Phishing (98.4% Confidence)
                      </div>
                   </div>
                   <div className="preview-card">
                      <div className="p-badge success">VERIFIED SECURE</div>
                      <p className="p-text">"New security update published by Meta Engineering. Here's how to enable multi-factor authentication correctly."</p>
                      <div className="p-footer">
                         <ShieldCheck size={14} /> <strong>Classifier:</strong> Normal (99.1% Confidence)
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="features" className="section-lp">
        <div className="section-header">
          <h2>Forensic Capabilities</h2>
          <p>Built with enterprise-grade components for deep social media investigations.</p>
        </div>

        <div className="features-grid">
          <div className="f-card">
            <div className="f-icon"><Brain size={28} /></div>
            <h3>Neural Classification</h3>
            <p>Proprietary Random Forest models trained on millions of labeled cyber-threat tokens for near-perfect classification.</p>
          </div>
          <div className="f-card">
            <div className="f-icon"><Database size={28} /></div>
            <h3>Node Extraction</h3>
            <p>Utilizing high-performance Apify headless clusters to bypass rate limits and extract real-time metadata.</p>
          </div>
          <div className="f-card">
            <div className="f-icon"><TrendingUp size={28} /></div>
            <h3>Visual Analytics</h3>
            <p>Instantly visualize threat vectors with dynamic Recharts-powered severity and category distribution mapping.</p>
          </div>
          <div className="f-card">
            <div className="f-icon"><Shield size={28} /></div>
            <h3>DDoS Defense</h3>
            <p>Identify coordination patterns and botnet activities before they target critical infrastructure.</p>
          </div>
          <div className="f-card">
            <div className="f-icon"><Activity size={28} /></div>
            <h3>Live Intelligence</h3>
            <p>Continuous polling engines provide sub-second updates on emerging threats within monitored social clusters.</p>
          </div>
          <div className="f-card">
            <div className="f-icon"><Fingerprint size={28} /></div>
            <h3>Identity Audit</h3>
            <p>Comprehensive profile auditing including follower-to-following ratios and biography forensic scores.</p>
          </div>
        </div>
      </section>

      {/* Intelligence Pipeline Section */}
      <section id="how" className="section-lp grey-bg">
        <div className="section-header">
          <h2>Intelligence Pipeline</h2>
          <p>Our automated forensic workflow from ingestion to actionable report.</p>
        </div>

        <div className="steps-container">
          <div className="step-item">
            <div className="step-num">01</div>
            <h4>Ingestion</h4>
            <p>System ingests raw handles or text through the investigation console.</p>
          </div>
          <div className="step-item">
            <div className="step-num">02</div>
            <h4>Extraction</h4>
            <p>Real-time scraper nodes fetch deep metadata and historical activity.</p>
          </div>
          <div className="step-item">
            <div className="step-num">03</div>
            <h4>Inference</h4>
            <p>AI models categorize threats and generate a forensic trust score.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-lp cta-section">
         <div className="section-header">
            <h2>Ready to Start Investigating?</h2>
            <p>Join thousands of security researchers protecting the social web.</p>
            <div className="cta-actions">
               <Link to="/register" className="btn-launch">Get Started for Free</Link>
               <Link to="/login" className="btn-secondary-lp">Sign In to Dashboard</Link>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="footer-container">
          <div className="footer-brand-col">
            <div className="nav-brand">
              <Shield className="brand-shield" size={32} />
              <span>CyberMonitor IG</span>
            </div>
            <p>
              Advancing social media safety through artificial intelligence and real-time threat detection.
              The ultimate toolkit for the modern cybersecurity investigator.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-icon"><Twitter size={18} /></a>
              <a href="#" className="social-icon"><Github size={18} /></a>
              <a href="#" className="social-icon"><Linkedin size={18} /></a>
              <a href="#" className="social-icon"><Mail size={18} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Investigation</h4>
            <div className="footer-links-wrap">
              <Link to="/dashboard" className="footer-link">Live Console</Link>
              <Link to="/incidents" className="footer-link">Threat Feed</Link>
              <Link to="/analytics" className="footer-link">Analytics Hub</Link>
              <Link to="/settings" className="footer-link">Scraper Nodes</Link>
            </div>
          </div>

          <div className="footer-col">
            <h4>Intelligence</h4>
            <div className="footer-links-wrap">
              <a href="#" className="footer-link">Model Documentation</a>
              <a href="#" className="footer-link">API Reference</a>
              <a href="#" className="footer-link">Dataset Transparency</a>
              <a href="#" className="footer-link">Security Benchmarks</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <div className="footer-links-wrap">
              <Link to="/login" className="footer-link">Sign In</Link>
              <Link to="/register" className="footer-link">Create Account</Link>
              <a href="#" className="footer-link">Privacy Protocol</a>
              <a href="#" className="footer-link">System Status</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 Instagram Cyber-Threat Monitoring System. All rights reserved.</p>
          <div className="project-tag">Final Degree Project Submission</div>
        </div>
      </footer>
    </div>
  );
}