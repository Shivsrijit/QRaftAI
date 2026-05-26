'use client';

import React from 'react';
import { LayoutGrid, Presentation, FileText, Book, PieChart, Settings, Sparkles } from 'lucide-react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import styles from '../styles/sidebar.module.css';

interface SidebarProps {
  activeTab?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab = 'assignments', isOpen = false, onClose }: SidebarProps) {
  const { 
    setView, 
    setStep, 
    setCurrentAssignment, 
    activeView, 
    assignments,
    schoolName,
    schoolAddress,
    schoolLogo
  } = useAssignmentStore();

  const handleCreateNew = () => {
    setCurrentAssignment(null);
    setView('create');
    setStep(1);
    if (onClose) onClose();
  };

  const handleGoToList = () => {
    setCurrentAssignment(null);
    setView('list');
    if (onClose) onClose();
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.logoContainer} onClick={handleGoToList} style={{ cursor: 'pointer' }}>
        <div className={styles.logoIcon} style={{ background: 'none', boxShadow: 'none' }}>
          <img src="/logo.png" alt="VedaAI Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px' }} />
        </div>
        <span className={styles.logoText}>
          VedaAI
        </span>
      </div>

      <button 
        type="button" 
        className={styles.sidebarCreateBtn} 
        onClick={handleCreateNew}
      >
        <Sparkles size={20} fill="currentColor" />
        <span>Create Assignment</span>
      </button>

      {/* Navigation menu list */}
      <ul className={styles.navMenu}>
        <li className={styles.navItem}>
          <a 
            href="#" 
            className={`${styles.navLink} ${activeView === 'home' ? styles.navLinkActive : ''}`} 
            onClick={(e) => {
              e.preventDefault();
              setView('home');
              if (onClose) onClose();
            }}
          >
            <div className={styles.navLinkLeft}>
              <LayoutGrid size={18} />
              <span>Home</span>
            </div>
          </a>
        </li>
        <li className={styles.navItem}>
          <a href="#" className={styles.navLink} onClick={(e) => e.preventDefault()}>
            <div className={styles.navLinkLeft}>
              <Presentation size={18} />
              <span>My Groups</span>
            </div>
          </a>
        </li>
        <li className={styles.navItem}>
          <a 
            href="#" 
            className={`${styles.navLink} ${activeView === 'list' || activeView === 'create' ? styles.navLinkActive : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleGoToList();
            }}
          >
            <div className={styles.navLinkLeft}>
              <FileText size={18} />
              <span>Assignments</span>
            </div>
            <span className={styles.badge}>{assignments.length || 10}</span>
          </a>
        </li>
        <li className={styles.navItem}>
          <a 
            href="#" 
            className={`${styles.navLink} ${activeView === 'toolkit' ? styles.navLinkActive : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setView('toolkit');
              if (onClose) onClose();
            }}
          >
            <div className={styles.navLinkLeft}>
              <Book size={18} />
              <span>AI Teacher's Toolkit</span>
            </div>
          </a>
        </li>
        <li className={styles.navItem}>
          <a href="#" className={styles.navLink} onClick={(e) => e.preventDefault()}>
            <div className={styles.navLinkLeft}>
              <PieChart size={18} />
              <span>My Library</span>
            </div>
          </a>
        </li>
      </ul>

      {/* Settings separator and profile card at the bottom */}
      <div className={styles.settingsDivider}>
        <a 
          href="#" 
          className={`${styles.navLink} ${activeView === 'settings' ? styles.navLinkActive : ''}`} 
          style={{ marginBottom: '15px' }}
          onClick={(e) => {
            e.preventDefault();
            setView('settings');
            if (onClose) onClose();
          }}
        >
          <div className={styles.navLinkLeft}>
            <Settings size={18} />
            <span>Settings</span>
          </div>
        </a>
      </div>

      <div className={styles.profileCard}>
        <img
          src={schoolLogo}
          alt={`${schoolName} Logo`}
          className={styles.profileAvatar}
        />
        <div className={styles.profileInfo}>
          <span className={styles.schoolName}>{schoolName}</span>
          <span className={styles.schoolLocation}>{schoolAddress}</span>
        </div>
      </div>
    </aside>
  );
}
