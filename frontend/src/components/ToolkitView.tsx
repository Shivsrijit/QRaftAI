'use client';

import React from 'react';
import { Sparkles, FileText, ClipboardList, Download, ArrowLeft, Wand2, ShieldCheck, Printer } from 'lucide-react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import styles from '../styles/home.module.css';

export default function ToolkitView() {
  const { setView } = useAssignmentStore();

  return (
    <div className={styles.homeContainer}>
      {/* Intro Banner */}
      <section className={styles.heroSection} style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.01) 100%)' }}>
        <div className={styles.heroContent}>
          <h2 className={styles.greeting} style={{ color: 'var(--text-primary)' }}>
            AI Toolkit <span style={{ color: '#6366f1' }}>Guidelines</span>
          </h2>
          <p className={styles.subheading}>
            Learn how to use VedaAI to generate, view, lifecycle-manage, print-preview, and dynamically compile premium assessment documents.
          </p>
        </div>
        <div className={styles.decorativeCircle} style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0) 70%)' }} />
      </section>

      {/* Step by step guidelines grid */}
      <h3 className={styles.sectionTitle}>Syllabus Paper Compilation Workflow</h3>
      
      <section className={styles.actionsGrid}>
        {/* Step 1 */}
        <div className={styles.actionCard} style={{ height: 'auto', cursor: 'default' }}>
          <div className={styles.actionIcon} style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>1</span>
          </div>
          <div className={styles.actionContent} style={{ marginTop: '15px' }}>
            <h4 className={styles.actionTitle}>1. Set Parameters</h4>
            <p className={styles.actionDesc} style={{ marginBottom: '10px' }}>
              Select your exam title, subject, target grade class, and due date. 
            </p>
            <p className={styles.actionDesc}>
              Use the 'Time Allowed' Hours & Minutes picker to specify precise durations (e.g. 1 hr 45 mins).
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className={styles.actionCard} style={{ height: 'auto', cursor: 'default' }}>
          <div className={styles.actionIcon} style={{ backgroundColor: 'rgba(255, 94, 26, 0.1)', color: 'var(--primary)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>2</span>
          </div>
          <div className={styles.actionContent} style={{ marginTop: '15px' }}>
            <h4 className={styles.actionTitle}>2. Configure Questions</h4>
            <p className={styles.actionDesc} style={{ marginBottom: '10px' }}>
              Add multiple rows of question types (e.g., Short Questions, MCQs).
            </p>
            <p className={styles.actionDesc}>
              Use the inline counter triggers to select desired question counts and marks per question. Optionally, upload reference PDFs or curriculum guidelines.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className={styles.actionCard} style={{ height: 'auto', cursor: 'default' }}>
          <div className={styles.actionIcon} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>3</span>
          </div>
          <div className={styles.actionContent} style={{ marginTop: '15px' }}>
            <h4 className={styles.actionTitle}>3. Monitor Generation</h4>
            <p className={styles.actionDesc} style={{ marginBottom: '10px' }}>
              Click Next to queue the AI paper generator.
            </p>
            <p className={styles.actionDesc}>
              Gemini will compile authentic, syllabus-compliant questions. You can track completion percentages in real-time through WebSocket-streamed progress counters.
            </p>
          </div>
        </div>
      </section>

      <h3 className={styles.sectionTitle} style={{ marginTop: '20px' }}>Managing, Formatting, and Printing</h3>

      <section className={styles.actionsGrid}>
        {/* Guideline: Status Controls */}
        <div className={styles.actionCard} style={{ height: 'auto', cursor: 'default' }}>
          <div className={styles.actionIcon} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <ShieldCheck size={22} />
          </div>
          <div className={styles.actionContent} style={{ marginTop: '15px' }}>
            <h4 className={styles.actionTitle}>Interactive Status Updates</h4>
            <p className={styles.actionDesc}>
              On the Assignments list dashboard, choose from the custom status dropdowns (Ongoing, Due, Completed). 
            </p>
            <p className={styles.actionDesc} style={{ marginTop: '8px' }}>
              The system automatically flags past-due assignments as "Due", but you retain full manual override control to mark papers "Completed" or "Ongoing" at any time.
            </p>
          </div>
        </div>

        {/* Guideline: Print Layout */}
        <div className={styles.actionCard} style={{ height: 'auto', cursor: 'default' }}>
          <div className={styles.actionIcon} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Printer size={22} />
          </div>
          <div className={styles.actionContent} style={{ marginTop: '15px' }}>
            <h4 className={styles.actionTitle}>Polished Print Previews</h4>
            <p className={styles.actionDesc}>
              Open a completed paper and click 'Print Preview'.
            </p>
            <p className={styles.actionDesc} style={{ marginTop: '8px' }}>
              The layout is calibrated to format beautifully as a standardized academic A4 question paper, removing all site interfaces, sidebars, and control buttons automatically during printing.
            </p>
          </div>
        </div>

        {/* Guideline: PDF Download */}
        <div className={styles.actionCard} style={{ height: 'auto', cursor: 'default' }}>
          <div className={styles.actionIcon} style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
            <Download size={22} />
          </div>
          <div className={styles.actionContent} style={{ marginTop: '15px' }}>
            <h4 className={styles.actionTitle}>Dynamic PDF Downloads</h4>
            <p className={styles.actionDesc}>
              Click 'Download as PDF' on any generated assignment.
            </p>
            <p className={styles.actionDesc} style={{ marginTop: '8px' }}>
              VedaAI compiles the assessment details, school header graphics, instructions, and questions into a PDF document, streaming it directly into your local downloads folder.
            </p>
          </div>
        </div>
      </section>

      {/* Floating back button to return to dashboard */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
        <button
          type="button"
          onClick={() => setView('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '9999px',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}
          className="no-print"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
}
