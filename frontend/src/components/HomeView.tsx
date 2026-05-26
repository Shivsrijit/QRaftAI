'use client';

import React from 'react';
import { Sparkles, ClipboardList, Wand2, Settings, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import styles from '../styles/home.module.css';

export default function HomeView() {
  const { 
    setView, 
    setStep, 
    setCurrentAssignment, 
    assignments, 
    userName 
  } = useAssignmentStore();

  const handleCreateNew = () => {
    setCurrentAssignment(null);
    setView('create');
    setStep(1);
  };

  return (
    <div className={styles.homeContainer}>
      {/* Premium Teacher Greeting Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h2 className={styles.greeting}>
            Hii, <span className={styles.greetingOrange}>{userName || 'Teacher'}</span>!
          </h2>
          <p className={styles.subheading}>
            Welcome back to VedaAI. Streamline your classroom administration, dynamically compile syllabus-compliant question papers, and download formatted assessments in seconds.
          </p>
        </div>
        <div className={styles.decorativeCircle} />
      </section>

      {/* Academic Stats strip */}
      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <ClipboardList size={22} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statValue}>{assignments.length}</span>
            <span className={styles.statLabel}>Saved Assignments</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <GraduationCap size={22} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statValue}>
              {Array.from(new Set(assignments.map(a => a.gradeClass).filter(Boolean))).length}
            </span>
            <span className={styles.statLabel}>Target Classes</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
            <BookOpen size={22} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statValue}>
              {Array.from(new Set(assignments.map(a => a.subject).filter(Boolean))).length}
            </span>
            <span className={styles.statLabel}>Active Subjects</span>
          </div>
        </div>
      </section>

      <h3 className={styles.sectionTitle}>Quick Operations</h3>

      {/* Primary Actions Grid */}
      <section className={styles.actionsGrid}>
        {/* Create Assignment Paper */}
        <div className={styles.actionCard} onClick={handleCreateNew}>
          <div className={styles.actionIcon}>
            <Sparkles size={24} />
          </div>
          <div className={styles.actionContent}>
            <h4 className={styles.actionTitle}>Create Assignment</h4>
            <p className={styles.actionDesc}>
              Configure question types, marks, difficulty, and compile tailored papers using Gemini.
            </p>
          </div>
          <ArrowRight className={styles.actionArrow} size={18} />
        </div>

        {/* View Saved Papers */}
        <div className={styles.actionCard} onClick={() => setView('list')}>
          <div className={styles.actionIcon}>
            <ClipboardList size={24} />
          </div>
          <div className={styles.actionContent}>
            <h4 className={styles.actionTitle}>View Saved Papers</h4>
            <p className={styles.actionDesc}>
              Browse, monitor lifecycle status dropdowns, regenerate, or download saved assessment PDFs.
            </p>
          </div>
          <ArrowRight className={styles.actionArrow} size={18} />
        </div>

        {/* AI Toolkit Guidelines */}
        <div className={styles.actionCard} onClick={() => setView('toolkit')}>
          <div className={styles.actionIcon}>
            <Wand2 size={24} />
          </div>
          <div className={styles.actionContent}>
            <h4 className={styles.actionTitle}>AI Toolkit Guidelines</h4>
            <p className={styles.actionDesc}>
              Learn how to define parameters, direct AI prompts, check queue progress, and format layouts.
            </p>
          </div>
          <ArrowRight className={styles.actionArrow} size={18} />
        </div>

        {/* Configure settings */}
        <div className={styles.actionCard} onClick={() => setView('settings')}>
          <div className={styles.actionIcon}>
            <Settings size={24} />
          </div>
          <div className={styles.actionContent}>
            <h4 className={styles.actionTitle}>Change Settings</h4>
            <p className={styles.actionDesc}>
              Edit your name, school information, profile picture, address, and manage light/dark theme.
            </p>
          </div>
          <ArrowRight className={styles.actionArrow} size={18} />
        </div>
      </section>
    </div>
  );
}
