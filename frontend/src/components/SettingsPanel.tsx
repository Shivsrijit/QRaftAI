'use client';

import React, { useState, useEffect } from 'react';
import { Save, School, User, Moon, Sun, CheckCircle } from 'lucide-react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import styles from '../styles/settings.module.css';

export default function SettingsPanel() {
  const { 
    schoolName, 
    schoolAddress, 
    schoolLogo, 
    userName, 
    userAvatar, 
    darkMode, 
    updateSettings, 
    toggleTheme,
    setView
  } = useAssignmentStore();

  const [sName, setSName] = useState(schoolName);
  const [sAddress, setSAddress] = useState(schoolAddress);
  const [sLogo, setSLogo] = useState(schoolLogo);
  const [uName, setUName] = useState(userName);
  const [uAvatar, setUAvatar] = useState(userAvatar);
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);
  
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Safeguard: Revert any unsaved DOM theme preview if the user unmounts/navigates away
  useEffect(() => {
    return () => {
      const persistedMode = useAssignmentStore.getState().darkMode;
      if (typeof window !== 'undefined') {
        if (persistedMode) {
          document.documentElement.classList.add('dark-theme');
        } else {
          document.documentElement.classList.remove('dark-theme');
        }
      }
    };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      schoolName: sName,
      schoolAddress: sAddress,
      schoolLogo: sLogo,
      userName: uName,
      userAvatar: uAvatar
    });
    
    // Save theme choice to store and localStorage permanently only on submit
    if (localDarkMode !== darkMode) {
      toggleTheme();
    }
    
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleToggleTheme = () => {
    const nextMode = !localDarkMode;
    setLocalDarkMode(nextMode);
    
    // Preview the theme change immediately in the browser DOM
    if (typeof window !== 'undefined') {
      if (nextMode) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    }
  };

  const handleCancel = () => {
    // Discard local preview changes and restore standard persistent theme state
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    }
    setView('list');
  };

  return (
    <div className={`${styles.settingsContainer} animate-fade-in`}>
      {showSavedToast && (
        <div className={styles.toast}>
          <CheckCircle size={18} />
          <span>Settings successfully saved and persisted!</span>
        </div>
      )}

      <form onSubmit={handleSave} className={styles.settingsForm}>
        {/* Section 1: School Profile Settings */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIcon}>
              <School size={20} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>School Profile</h3>
              <p className={styles.cardSubtitle}>Manage school identity and heading branding</p>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>School Logo URL</label>
              <div className={styles.inputWithPreview}>
                <img 
                  src={sLogo} 
                  alt="School Logo Preview" 
                  className={styles.logoPreview} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=100&auto=format&fit=crop';
                  }} 
                />
                <input 
                  type="text" 
                  value={sLogo} 
                  onChange={(e) => setSLogo(e.target.value)}
                  placeholder="Paste direct image link..."
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>School Name</label>
              <input 
                type="text" 
                value={sName} 
                onChange={(e) => setSName(e.target.value)}
                placeholder="e.g. Delhi Public School"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>School Address / Location</label>
              <input 
                type="text" 
                value={sAddress} 
                onChange={(e) => setSAddress(e.target.value)}
                placeholder="e.g. Bokaro Steel City"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: User Profile Settings */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIcon}>
              <User size={20} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>User Profile</h3>
              <p className={styles.cardSubtitle}>Customize your teacher account profile and avatars</p>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>User Avatar URL</label>
              <div className={styles.inputWithPreview}>
                <img 
                  src={uAvatar} 
                  alt="User Profile Preview" 
                  className={styles.avatarPreview} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop';
                  }} 
                />
                <input 
                  type="text" 
                  value={uAvatar} 
                  onChange={(e) => setUAvatar(e.target.value)}
                  placeholder="Paste direct avatar image link..."
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Teacher Name</label>
              <input 
                type="text" 
                value={uName} 
                onChange={(e) => setUName(e.target.value)}
                placeholder="e.g. Lakshya"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Visual Theme Customization Toggle */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIcon}>
              {localDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div>
              <h3 className={styles.cardTitle}>Appearance & Theme</h3>
              <p className={styles.cardSubtitle}>Toggle application dark and light modes</p>
            </div>
          </div>

          <div className={styles.cardBody} style={{ paddingBottom: '10px' }}>
            <div className={styles.themeToggleRow}>
              <div className={styles.themeToggleInfo}>
                <span className={styles.themeToggleLabel}>Dark Theme Mode</span>
                <span className={styles.themeToggleDesc}>Adjust colors to optimize display contrast for late night working sessions</span>
              </div>
              <button 
                type="button" 
                className={`${styles.toggleSwitch} ${localDarkMode ? styles.toggleActive : ''}`}
                onClick={handleToggleTheme}
                aria-label="Toggle between dark and light mode themes"
              >
                <div className={styles.toggleKnob} />
              </button>
            </div>
          </div>
        </div>

        {/* Form Action triggers */}
        <div className={styles.actionsRow}>
          <button 
            type="button" 
            className={styles.cancelBtn}
            onClick={handleCancel}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className={styles.saveBtn}
          >
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
