'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MoreVertical, BookOpen, Calendar, Trash2, ExternalLink, Plus } from 'lucide-react';
import { useAssignmentStore, IAssignment } from '../store/useAssignmentStore';
import styles from '../styles/list.module.css';

export default function AssignmentsList() {
  const { 
    assignments, 
    fetchAssignments, 
    setCurrentAssignment, 
    setView, 
    setStep, 
    deleteAssignment,
    connectWebSocket,
    updateAssignmentStatus,
    isLoading 
  } = useAssignmentStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const menuRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);

  // Synchronize responsive layout trigger
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 991);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load assignments list on mount
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Click outside to close active three-dot menus and filter popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateNew = () => {
    setCurrentAssignment(null);
    setView('create');
    setStep(1);
  };

  const handleViewDetails = (assignment: IAssignment) => {
    setCurrentAssignment(assignment);
    setView('create');
    if (assignment.status === 'completed') {
      setStep(3); // Jump straight to exam layout page
    } else {
      setStep(2); // Jump to active queue progress loader
      if (assignment.status === 'pending' || assignment.status === 'processing') {
        connectWebSocket(assignment._id); // reconnect ws subscription
      }
    }
    setActiveMenuId(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the assignment "${title}"?`)) {
      try {
        await deleteAssignment(id);
        setActiveMenuId(null);
      } catch (err) {
        console.error('Delete action failed:', err);
      }
    }
  };

  // Helper to format timestamps to standard academic DD-MM-YYYY format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  // Get unique subjects to populate subjects filter dropdown
  const uniqueSubjects = Array.from(
    new Set(assignments.map((asm) => asm.subject).filter(Boolean))
  );

  // Filter list items based on search query, subject selector, and status selector
  const filteredAssignments = assignments.filter((asm) => {
    const matchesSearch = 
      asm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asm.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === '' || asm.subject === filterSubject;
    const matchesStatus = 
      filterStatus === '' || 
      (asm.status === 'completed' && (asm.lifecycleStatus || 'ongoing') === filterStatus);
    return matchesSearch && matchesSubject && matchesStatus;
  });

  return (
    <div className={styles.container}>
      {/* Title Header with Green Dot matching Mockup */}
      <div className={styles.dashboardHeader}>
        <div className={styles.titleWithDotRow}>
          <span className={styles.greenStatusDot} />
          <h2 className={styles.dashboardTitle}>Assignments</h2>
        </div>
        <p className={styles.dashboardSubtitle}>Manage and create assignments for your classes.</p>
      </div>

      {/* Search and Filters row matching mockup unified capsule design */}
      <div className={styles.filterSearchCapsule}>
        <div className={styles.filterMenuContainer} ref={filterRef}>
          <button
            type="button"
            className={`${styles.filterBtnCapsule} ${filterSubject || filterStatus ? styles.filterBtnCapsuleActive : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={16} className={styles.filterFunnelIcon} />
            <span>{isMobile ? 'Filter' : 'Filter By'}</span>
            {(filterSubject || filterStatus) && (
              <span className={styles.activeFilterCount}>
                {(filterSubject ? 1 : 0) + (filterStatus ? 1 : 0)}
              </span>
            )}
          </button>

          {isFilterOpen && (
            <div className={styles.filterPopover}>
              <div className={styles.popoverSection}>
                <label className={styles.popoverLabel}>Subject</label>
                <select
                  className={styles.popoverSelect}
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.popoverSection} style={{ marginTop: '12px' }}>
                <label className={styles.popoverLabel}>Status</label>
                <select
                  className={styles.popoverSelect}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="due">Due</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {(filterSubject || filterStatus) && (
                <button
                  type="button"
                  className={styles.clearFiltersBtn}
                  onClick={() => {
                    setFilterSubject('');
                    setFilterStatus('');
                    setIsFilterOpen(false);
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className={styles.searchCapsuleWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={isMobile ? 'Search Name' : 'Search Assignment'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading && assignments.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.spinner} />
          <p>Loading your assignments...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className={styles.emptyStateContainer}>
          {/* Centered Graphic Illustration SVG */}
          <svg className={styles.emptyGraphic} viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background circular shade */}
            <circle cx="140" cy="120" r="70" fill="var(--bg-main)" opacity="0.6" />
            
            {/* Curved loop path on the left */}
            <path d="M70 110 C 60 90, 75 75, 95 65 C 105 75, 90 95, 78 85" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" fill="none" />
            
            {/* Document shape */}
            <rect x="105" y="45" width="70" height="95" rx="8" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="2" />
            
            {/* Document lines */}
            <rect x="117" y="60" width="28" height="4" rx="2" fill="var(--text-primary)" />
            <rect x="117" y="72" width="46" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.5" />
            <rect x="117" y="82" width="46" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.5" />
            <rect x="117" y="92" width="46" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.5" />
            <rect x="117" y="102" width="30" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.5" />
            
            {/* Small card on top right of document */}
            <rect x="165" y="40" width="32" height="16" rx="4" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="1.5" />
            <circle cx="173" cy="48" r="2" fill="var(--primary)" />
            <rect x="180" y="46" width="10" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.5" />

            {/* Sparkle/Star bottom left */}
            <path d="M92 120 Q92 125 87 125 Q92 125 92 130 Q92 125 97 125 Q92 125 92 120" fill="var(--primary)" />
            
            {/* Circular dot on the right */}
            <circle cx="196" cy="110" r="4" fill="#2563eb" />
            
            {/* Magnifying Glass */}
            {/* Handle */}
            <line x1="172" y1="140" x2="195" y2="163" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
            <line x1="172" y1="140" x2="195" y2="163" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />
            <line x1="188" y1="156" x2="195" y2="163" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            {/* Frame */}
            <circle cx="150" cy="118" r="28" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="3" />
            {/* Red bold X cross */}
            <path d="M141 109 L159 127 M159 109 L141 127" stroke="#ef4444" strokeWidth="5.5" strokeLinecap="round" />
          </svg>

          <h3 className={styles.emptyTitle}>No assignments yet</h3>
          
          <p className={styles.emptyDescription}>
            Create your first assignment to start collecting and grading student submissions. 
            You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>

          <button 
            type="button" 
            className={styles.createFirstBtn}
            onClick={handleCreateNew}
          >
            <Plus size={18} />
            <span>Create Your First Assignment</span>
          </button>
        </div>
      ) : (
        /* Main card grids matching Figma */
        <div className={styles.cardGrid}>
          {filteredAssignments.map((asm) => (
            <div 
              key={asm._id} 
              className={styles.card}
              onClick={() => handleViewDetails(asm)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.titleWrapper}>
                  <h3 className={styles.cardTitle}>{asm.title}</h3>
                  <span className={styles.cardSubject}>{asm.subject} - {asm.gradeClass}</span>
                </div>
                
                {/* 3-dot options container */}
                <div className={styles.menuContainer}>
                  <button
                    className={styles.menuTrigger}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === asm._id ? null : asm._id);
                    }}
                    aria-label="Assignment actions menu"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {activeMenuId === asm._id && (
                    <div className={styles.dropdownMenu} ref={menuRef}>
                      <button 
                        type="button" 
                        className={styles.menuItem} 
                        onClick={() => handleViewDetails(asm)}
                      >
                        <span>View Assignment</span>
                      </button>
                      
                      <button 
                        type="button" 
                        className={`${styles.menuItem} ${styles.menuItemDelete}`}
                        onClick={(e) => handleDelete(e, asm._id, asm.title)}
                      >
                        <span className={styles.deleteText}>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Middle preview metadata tags */}
              <div className={styles.cardBody}>
                {asm.status !== 'completed' ? (
                  <span className={`${styles.statusBadge} ${styles[`statusBadge_${asm.status}`]}`}>
                    {asm.status}
                  </span>
                ) : (
                  <select
                    className={`${styles.lifecycleSelect} ${styles[`lifecycleSelect_${asm.lifecycleStatus || 'ongoing'}`]}`}
                    value={asm.lifecycleStatus || 'ongoing'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={async (e) => {
                      e.stopPropagation();
                      const newStatus = e.target.value as 'ongoing' | 'due' | 'completed';
                      await updateAssignmentStatus(asm._id, newStatus);
                    }}
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="due">Due</option>
                    <option value="completed">Completed</option>
                  </select>
                )}
                {asm.result && (
                  <span className={styles.marksBadge}>
                    {asm.result.maxMarks} Marks
                  </span>
                )}
              </div>

              {/* Bottom stats row matching image */}
              <div className={styles.cardFooter}>
                <div className={styles.dateStat}>
                  <span className={styles.dateLabel}>Assigned on:</span>
                  <span className={styles.dateValue}>{formatDate(asm.createdAt)}</span>
                </div>
                <div className={styles.dateStat}>
                  <span className={styles.dateLabel}>Due:</span>
                  <span className={styles.dateValue}>{formatDate(asm.dueDate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Center Bottom Creation Callout */}
      <div className={styles.floatingActionArea}>
        <button 
          className={styles.createBtnFloating} 
          onClick={handleCreateNew}
        >
          <Plus size={18} />
          <span>Create Assignment</span>
        </button>
      </div>
    </div>
  );
}
