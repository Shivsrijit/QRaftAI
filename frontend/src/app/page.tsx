'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AssignmentForm from '../components/AssignmentForm';
import GenerationProgress from '../components/GenerationProgress';
import QuestionPaper from '../components/QuestionPaper';
import AssignmentsList from '../components/AssignmentsList';
import SettingsPanel from '../components/SettingsPanel';
import HomeView from '../components/HomeView';
import ToolkitView from '../components/ToolkitView';
import { useAssignmentStore } from '../store/useAssignmentStore';
import styles from '../styles/layout.module.css';

import { LayoutGrid, FileText, PieChart, Sparkles } from 'lucide-react';

export default function Page() {
  const { activeStep, activeView, setView, setCurrentAssignment, fetchAssignments, darkMode, initializeSettings } = useAssignmentStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize client settings from localStorage on mount to prevent SSR hydration mismatches
  useEffect(() => {
    initializeSettings();
  }, [initializeSettings]);

  // Synchronize document theme class with persistent settings state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [darkMode]);

  // Fetch past assignments list on start for metadata cache
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.appContainer}>
      {/* 1. Curved Left Sidebar (Responsive drawer open/close hooks) */}
      <Sidebar 
        activeTab="assignments" 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 2. Main Dashboard panel gutter */}
      <div className={styles.mainPanel}>
        
        {/* Header Navbar controls */}
        <Header 
          title="Assignments" 
          onMenuClick={toggleSidebar} 
        />

        {/* 3. Central responsive viewport content container */}
        <main className={styles.contentViewport}>
          {activeView === 'home' && <HomeView />}
          {activeView === 'toolkit' && <ToolkitView />}
          {activeView === 'list' && <AssignmentsList />}
          {activeView === 'settings' && <SettingsPanel />}
          {activeView === 'create' && (
            <>
              {activeStep === 1 && (
                <div className="animate-fade-in">
                  <AssignmentForm />
                </div>
              )}
              
              {activeStep === 2 && (
                <div className="animate-slide-up">
                  <GenerationProgress />
                </div>
              )}
              
              {activeStep === 3 && (
                <div className="animate-fade-in">
                  <QuestionPaper />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Responsive Mobile Bottom Pill Navigation */}
      <div className={styles.mobileBottomNav}>
        <button 
          className={`${styles.mobileNavItem} ${activeView === 'home' ? styles.mobileNavItemActive : ''}`}
          onClick={() => setView('home')}
        >
          <LayoutGrid size={20} />
          <span>Home</span>
        </button>
        <button 
          className={`${styles.mobileNavItem} ${activeView === 'list' || activeView === 'create' ? styles.mobileNavItemActive : ''}`}
          onClick={() => {
            setCurrentAssignment(null);
            setView('list');
          }}
        >
          <FileText size={20} />
          <span>Assignments</span>
        </button>
        <button 
          className={`${styles.mobileNavItem} ${activeView === 'list' && false ? styles.mobileNavItemActive : ''}`}
          onClick={() => {
            setCurrentAssignment(null);
            setView('list');
          }}
        >
          <PieChart size={20} />
          <span>Library</span>
        </button>
        <button 
          className={`${styles.mobileNavItem} ${activeView === 'toolkit' ? styles.mobileNavItemActive : ''}`}
          onClick={() => setView('toolkit')}
        >
          <Sparkles size={20} />
          <span>AI Toolkit</span>
        </button>
      </div>
    </div>
  );
}
