import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Zap, Maximize2, Minimize2 } from 'lucide-react';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`dashboard-layout ${isFullscreen ? 'fullscreen-active' : ''}`}>
      {/* Sidebar - Hide if fullscreen is active */}
      {!isFullscreen && (
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      {/* Main Content Area */}
      <main className={`dashboard-main ${isFullscreen ? 'full-width' : ''}`}>
        {/* Floating Toggle Button for Fullscreen/VR look */}
        <button 
          className="fullscreen-toggle-btn" 
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Immersive Mode"}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}