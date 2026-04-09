import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Activity, Brain, Globe, Users, CheckCircle, 
  ArrowRight, BarChart3, Clock, Lock, Zap, Eye, Search, AlertTriangle, ShieldCheck,
  Cpu, Database, Layout, Smartphone, TrendingUp, Key, Fingerprint, MousePointer2,
  Twitter, Github, Linkedin, Mail
} from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleInvestigate = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/dashboard?search=${search}`);
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <Shield size={28} />
            <span>CyberMonitor IG</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how" className="nav-link">Process</a>
            <a href="#benefits" className="nav-link">Benefits</a>
            <Link to="/login" className="nav-link">Sign In</Link>
            <Link to="/register" className="btn-primary">Launch Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge pulse">
            <Zap size={14} />
            <span>AI-Driven Cyber Intelligence System</span>
          </div>
          <h1 className="hero-title">
            The World's Most <span className="hero-highlight">Intelligent</span><br />
            Instagram Threat Monitor
          </h1>
          <p className="hero-description">
            Protect social ecosystems with real-time AI detection of Phishing, DDoS coordination, and Malware distribution. Advanced forensic intelligence at your fingertips.
          </p>

          <div className="hero-actions">
            <form className="hero-search-wrapper" onSubmit={handleInvestigate}>
              <input 
                 type="text" 
                 className="hero-search-input" 
                 placeholder="Enter Instagram Profile or suspicious post text..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="hero-search-btn">
                <Search size={22} />
                Investigate
              </button>
            </form>
            <p className="hero-subline">Trusted by security researchers for academic-grade cyber analytics.</p>
          </div>

          <div className="dashboard-preview-grid">
            <div className="preview-card">
               <div className="preview-header">
                  <span className="p-badge danger">THREAT IDENTIFIED</span>
                  <div className="p-icon"><AlertTriangle size={20} color="#dc2626" /></div>
               </div>
               <p className="p-text">"Urgent: Check this bit.ly/123-leak to see your private photos leaked! #phishing"</p>
               <div className="p-footer">
                  <span className="p-tag"><Brain size={14} /> ML Category: Phishing</span>
                  <span className="p-tag">Confidence: 98.4%</span>
               </div>
            </div>

            <div className="preview-card">
               <div className="preview-header">
                  <span className="p-badge safe">SAFE ACTIVITY</span>
                  <div className="p-icon"><ShieldCheck size={20} color="#16a34a" /></div>
               </div>
               <p className="p-text">"Just finished an amazing cybersecurity workshop. Knowledge is power! 🛡️"</p>
               <div className="p-footer">
                  <span className="p-tag"><Brain size={14} /> Category: Normal</span>
                  <span className="p-tag">Confidence: 96.2%</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Core Features Grid */}
      <section id="features" className="section-lp white-bg">
        <div className="section-title-wrap">
          <h2>Core Intelligence Features</h2>
          <p>Everything you need for comprehensive Instagram forensics.</p>
        </div>

        <div className="features-grid">
          <div className="f-card">
            <div className="f-icon"><Cpu size={28} /></div>
            <h3>ML Prediction Engine</h3>
            <p>Advanced Random Forest classifiers trained on thousands of cyber incidents for ultra-precise categorization.</p>
          </div>
          <div className="f-card">
            <div className="f-icon"><Database size={28} /></div>
            <h3>Apify Deep Scraping</h3>
            <p>Real-time Instagram data extraction using high-performance Apify scrapers for real-time meta data monitoring.</p>
          </div>
          <div className="f-card">
            <div className="f-icon"><TrendingUp size={28} /></div>
            <h3>Threat Analytics</h3>
            <p>Comprehensive severity distribution charts and category analytics to visualize potential risks instantly.</p>
          </div>
        </div>
      </section>

      {/* 2. How it works (Process) */}
      <section id="how" className="section-lp">
        <div className="section-title-wrap">
          <h2>How It Works</h2>
          <p>A sophisticated 3-step pipeline from input to intelligence.</p>
        </div>

        <div className="steps-container">
          <div className="step-item">
            <div className="step-num">01</div>
            <h4>Input Intelligence</h4>
            <p>Users provide an Instagram handle, profile URL, or a suspicious post text for analysis.</p>
          </div>
          <div className="step-item">
            <div className="step-num">02</div>
            <h4>AI Processing</h4>
            <p>The system scrapes metadata via Apify and passes content through our ML classifier for threat detection.</p>
          </div>
          <div className="step-item">
            <div className="step-num">03</div>
            <h4>Threat Reporting</h4>
            <p>Immediate generation of a high-fidelity report showing threat type, severity, and security confidence.</p>
          </div>
        </div>
      </section>

      {/* 3. Benefits Section */}
      <section id="benefits" className="section-lp white-bg">
        <div className="section-title-wrap">
          <h2>Platform Benefits</h2>
          <p>Designed for organizations, researchers, and security-conscious individuals.</p>
        </div>

        <div className="benefits-grid">
           <div className="b-card">
             <div className="b-icon"><CheckCircle size={22} /></div>
             <div>
               <h4>Proactive Security</h4>
               <p>Identify DDoS coordination and Phishing attempts before they trigger an account breach.</p>
             </div>
           </div>
           <div className="b-card">
             <div className="b-icon"><CheckCircle size={22} /></div>
             <div>
               <h4>Unified Forensic Hub</h4>
               <p>A single place to monitor local simulations and perform real-world profile investigations.</p>
             </div>
           </div>
           <div className="b-card">
             <div className="b-icon"><CheckCircle size={22} /></div>
             <div>
               <h4>High Accuracy ML</h4>
               <p>Minimize false positives with our hybrid keyword and machine learning classification approach.</p>
             </div>
           </div>
           <div className="b-card">
             <div className="b-icon"><CheckCircle size={22} /></div>
             <div>
               <h4>Public Safety Advocacy</h4>
               <p>Empowering the public to recognize cyber threats on social media platforms effectively.</p>
             </div>
           </div>
        </div>
      </section>

      {/* Detailed Footer */}
      <footer className="lp-footer">
        <div className="footer-container">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <Shield size={32} />
              <span>CyberMonitor IG</span>
            </div>
            <p>
              Advancing social media safety through artificial intelligence and real-time threat detection.
              A comprehensive toolkit for the modern cybersecurity investigator.
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
              <Link to="/dashboard" className="footer-link">Live Dashboard</Link>
              <Link to="/incidents" className="footer-link">Incidents Feed</Link>
              <Link to="/analytics" className="footer-link">Threat Analytics</Link>
              <Link to="/settings" className="footer-link">Node Settings</Link>
            </div>
          </div>

          <div className="footer-col">
            <h4>Intelligence</h4>
            <div className="footer-links-wrap">
              <a href="#" className="footer-link">ML Model Registry</a>
              <a href="#" className="footer-link">Apify Scrapers</a>
              <a href="#" className="footer-link">Threat Categories</a>
              <a href="#" className="footer-link">Security Benchmarks</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <div className="footer-links-wrap">
              <Link to="/login" className="footer-link">Researcher Login</Link>
              <Link to="/register" className="footer-link">Create Account</Link>
              <a href="#" className="footer-link">Documentation</a>
              <a href="#" className="footer-link">Privacy Policy</a>
            </div>
          </div>
        </div>

        <div className="footer-divider">
          <p>© 2024 Instagram Cyber-Threat Monitoring System. All rights reserved.</p>
          <div className="project-tag">Final Degree Project Submission</div>
        </div>
      </footer>
    </div>
  );
}