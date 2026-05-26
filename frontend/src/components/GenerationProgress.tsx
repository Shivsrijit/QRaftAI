'use client';

import React from 'react';
import { Loader2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import styles from '../styles/form.module.css'; // sharing stepper actions structure

export default function GenerationProgress() {
  const { currentAssignment, setStep, regenerateAssignment } = useAssignmentStore();

  if (!currentAssignment) {
    return (
      <div className={styles.formCard} style={{ textAlign: 'center', padding: '60px' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary)', margin: '0 auto 20px' }} />
        <p className={styles.cardSubtitle}>Loading generation state...</p>
      </div>
    );
  }
  const { progress, status, errorMsg, _id } = currentAssignment;
  const isFailed = status === 'failed';

  // Determine user friendly stage description based on progress percent
  let statusStage = 'Submitting assignment specifications...';
  if (progress >= 10 && progress < 30) {
    statusStage = 'Initializing execution pipelines...';
  } else if (progress >= 30 && progress < 60) {
    statusStage = 'Invoking Google Gemini AI for question creation...';
  } else if (progress >= 60 && progress < 85) {
    statusStage = 'Parsing academic response schemas...';
  } else if (progress >= 85 && progress < 100) {
    statusStage = 'Formatting paper layouts to server A4 PDF...';
  } else if (progress === 100) {
    statusStage = 'Assignment finalized successfully!';
  }

  const handleRetry = () => {
    regenerateAssignment(_id);
  };

  const handleGoBack = () => {
    setStep(1);
  };

  return (
    <div className={styles.formCard} style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* Steps horizontal bar indicator */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ 
            width: isFailed ? '100%' : `${progress}%`,
            backgroundColor: isFailed ? '#ef4444' : 'var(--primary)' 
          }} 
        />
      </div>

      {isFailed ? (
        /* Failed Error Card Layout */
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', marginBottom: '20px' }}>
            <AlertCircle size={32} />
          </div>
          <h3 className={styles.cardTitle} style={{ color: '#ef4444' }}>Generation Failed</h3>
          <p className={styles.cardSubtitle} style={{ maxWidth: '460px', margin: '10px auto 25px' }}>
            {errorMsg || 'An unknown network error occurred while running background queue processes.'}
          </p>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button type="button" className={styles.prevBtn} onClick={handleGoBack}>
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
            
            <button 
              type="button" 
              className={styles.nextBtn} 
              style={{ backgroundColor: '#ef4444' }}
              onClick={handleRetry}
            >
              <RefreshCw size={16} />
              <span>Retry Generation</span>
            </button>
          </div>
        </div>
      ) : (
        /* In Progress Loading Card Layout */
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
          {/* Rotating Spinner */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
            <Loader2 className="animate-spin" size={72} style={{ color: 'var(--primary)', opacity: 0.15 }} />
            <Loader2 className="animate-spin" size={54} style={{ color: 'var(--primary)', position: 'absolute' }} />
            <span style={{ position: 'absolute', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {progress}%
            </span>
          </div>

          <h3 className={styles.cardTitle}>VedaAI is building your paper</h3>
          <p className={styles.cardSubtitle} style={{ maxWidth: '400px', margin: '10px auto 0' }}>
            {statusStage}
          </p>

          <div className="animate-pulse" style={{ marginTop: '20px', fontSize: '0.813rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            WebSocket Live Streaming Active
          </div>
        </div>
      )}
    </div>
  );
}
