'use client';

import React from 'react';
import { ArrowLeft, Bell, ChevronDown, LayoutGrid, Menu } from 'lucide-react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import styles from '../styles/layout.module.css';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function Header({ title = 'Assignments' }: HeaderProps) {
  const { 
    activeStep, 
    activeView, 
    setView, 
    currentAssignment, 
    setCurrentAssignment,
    userName,
    userAvatar 
  } = useAssignmentStore();

  const handleBackClick = () => {
    if (activeView === 'create' || activeView === 'settings') {
      setView('list');
      setCurrentAssignment(null);
    } else {
      setView('home');
      setCurrentAssignment(null);
    }
  };

  // Determine dynamic title display based on current active workflow step
  let displayTitle = title;
  if (activeView === 'home') {
    displayTitle = 'Home';
  } else if (activeView === 'toolkit') {
    displayTitle = "AI Teacher's Toolkit";
  } else if (activeView === 'settings') {
    displayTitle = 'Settings';
  } else if (activeView === 'list') {
    displayTitle = 'Assignment'; // singular matching desktop mockup
  } else if (activeView === 'create') {
    if (activeStep === 1) {
      displayTitle = 'Create Assignment';
    } else if (activeStep === 2) {
      displayTitle = 'Generating Assessment...';
    } else if (activeStep === 3 && currentAssignment) {
      displayTitle = currentAssignment.title;
    }
  }

  return (
    <>
      {/* 1. Desktop Premium Header Viewport (Visible on Large Screens) */}
      <header className={styles.headerDesktop}>
        <div className={styles.headerLeft}>
          {/* Back navigational arrow visible when not on home screen */}
          {activeView !== 'home' && (
            <button 
              className={styles.backBtn} 
              onClick={handleBackClick}
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          
          {/* Dynamic grid Layout icon matching Figma desktop */}
          <div className={styles.gridIconWrapper}>
            <LayoutGrid size={18} style={{ color: 'var(--text-secondary)' }} />
          </div>
          
          <h1 className={styles.pageTitle}>{displayTitle}</h1>
        </div>

        <div className={styles.headerRight}>
          {/* Notifications Alert Bell */}
          <button className={styles.bellButton} aria-label="View notifications list">
            <Bell size={18} />
            <span className={styles.notificationDot} />
          </button>

          {/* User profile identifier */}
          <div className={styles.userBadge}>
            <img
              src={userAvatar}
              alt={`${userName} profile avatar`}
              className={styles.avatar}
            />
            <span className={styles.userName}>{userName}</span>
            <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>
      </header>

      {/* 2. Mobile Calibrated Header Viewport (Visible on Small Screens) */}
      <header className={styles.headerMobile}>
        {/* Top Logo Bar */}
        <div className={styles.mobileTopBar}>
          <div className={styles.mobileLogo}>
            <div className={styles.logoIconMini} style={{ background: 'none', boxShadow: 'none' }}>
              <img src="/logo.png" alt="VedaAI Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
            </div>
            <span className={styles.logoTextMini}>
              Veda<span className={styles.logoTextOrange}>AI</span>
            </span>
          </div>

          <div className={styles.mobileTopRight}>
            <button className={styles.bellButtonMini} aria-label="Notifications">
              <Bell size={18} />
              <span className={styles.notificationDot} />
            </button>
            <img
              src={userAvatar}
              alt={`${userName} profile`}
              className={styles.avatarMini}
            />
            {/* Hamburger menu trigger */}
            <button className={styles.menuTriggerBtn} onClick={() => setView('settings')} aria-label="Open settings">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Title Bar rendered outside of the header card, on the page background */}
      <div className={styles.mobileTitleContainer}>
        <div className={styles.mobileTitleBar}>
          {activeView !== 'home' && (
            <button className={styles.backBtnCircle} onClick={handleBackClick} aria-label="Go back">
              <ArrowLeft size={18} />
            </button>
          )}
          <h2 className={styles.mobileCenteredTitle}>
            {activeView === 'list' ? 'Assignments' : displayTitle}
          </h2>
        </div>
      </div>
    </>
  );
}
