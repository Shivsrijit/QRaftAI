'use client';

import React from 'react';
import { Download, RefreshCw, FilePlus, Printer, Sparkles } from 'lucide-react';
import { useAssignmentStore, API_BASE_URL } from '../store/useAssignmentStore';
import styles from '../styles/paper.module.css';

export default function QuestionPaper() {
  const { currentAssignment, setStep, regenerateAssignment, userName } = useAssignmentStore();

  if (!currentAssignment || !currentAssignment.result) {
    return (
      <div className={styles.examSheet} style={{ textAlign: 'center', padding: '60px' }}>
        <p className={styles.sectionInstruction}>No generated results found. Please configure and create first.</p>
      </div>
    );
  }

  const { result, _id } = currentAssignment;
 
   const handleDownloadPDF = async () => {
     if (!_id) {
       alert('Assignment details are incomplete.');
       return;
     }

     const fullUrl = `${API_BASE_URL}/assignments/${_id}/download?t=${Date.now()}`;
     const filename = `${currentAssignment.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_question_paper.pdf`;

     if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
       try {
         const handle = await (window as any).showSaveFilePicker({
           suggestedName: filename,
           types: [{
             description: 'PDF Document',
             accept: { 'application/pdf': ['.pdf'] },
           }],
         });
         
         const response = await fetch(fullUrl);
         if (!response.ok) throw new Error('Failed to fetch PDF data');
         const blob = await response.blob();
         
         const writable = await handle.createWritable();
         await writable.write(blob);
         await writable.close();
       } catch (err: any) {
         if (err.name === 'AbortError') {
           // User cancelled the file location picker, graceful exit
           return;
         }
         console.warn('showSaveFilePicker failed or cancelled, falling back to standard download:', err);
         fallbackDownload(fullUrl, filename);
       }
     } else {
       fallbackDownload(fullUrl, filename);
     }
   };

   const fallbackDownload = (url: string, filename: string) => {
     const link = document.createElement('a');
     link.href = url;
     link.download = filename;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   };

  const handlePrint = () => {
    window.print();
  };

  const handleRegenerate = () => {
    if (window.confirm('Are you sure you want to regenerate this question paper? This will rebuild questions using AI.')) {
      regenerateAssignment(_id);
    }
  };

  const handleCreateNew = () => {
    setStep(1); // Set step back to Form inputs
  };

  return (
    <div className={styles.paperContainer}>
      {/* 1. Dark AI Response Banner */}
      <div className={`${styles.aiBanner} no-print`}>
        <div className={styles.aiBannerText}>
          <p className={styles.aiBannerTitle}>
            Certainly, <span className={styles.aiBannerHighlight}>{userName}</span>! Here is the customized Question Paper for your CBSE Class 8 Science/NCERT standard curriculum.
          </p>
        </div>
        
        <div className={styles.bannerActions}>
          <button 
            type="button" 
            className={styles.downloadPdfBtn}
            onClick={handleDownloadPDF}
            title="Download formatted A4 PDF from server"
          >
            <Download size={16} />
            <span>Download as PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Structured A4 School Exam Sheet */}
      <article className={styles.examSheet}>
        {/* Exam Heading Centered */}
        <header className={styles.examHeader}>
          <h2 className={styles.schoolName}>{result.schoolName}</h2>
          <h3 className={styles.examSubject}>Subject: {result.subject}</h3>
          <span className={styles.examClass}>Class: {result.class}</span>
        </header>

        {/* Stats row Allowed Time and Max Marks */}
        <div className={styles.statsRow}>
          <span>Time Allowed: {result.timeAllowed}</span>
          <span>Maximum Marks: {result.maxMarks}</span>
        </div>

        {/* Mandatory Note */}
        <p className={styles.instructionsNote}>All questions are compulsory unless stated otherwise.</p>

        {/* Underlined Interactive Student Data Fields */}
        <div className={styles.studentInfoSection}>
          <div className={styles.infoLine}>
            <span className={styles.infoLabel}>Name:</span>
            <input type="text" className={styles.infoUnderline} placeholder="" />
          </div>
          <div className={styles.infoLine}>
            <span className={styles.infoLabel}>Roll Number:</span>
            <input type="text" className={styles.infoUnderline} placeholder="" />
          </div>
          <div className={styles.infoLine}>
            <span className={styles.infoLabel}>Section:</span>
            <input type="text" className={styles.infoUnderline} placeholder="" />
          </div>
        </div>

        {/* Sections Listing */}
        {result.sections.map((section, sIdx) => (
          <section key={sIdx} className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionName}>{section.name}</h4>
              <h5 className={styles.sectionTitle}>{section.title}</h5>
              <span className={styles.sectionInstruction}>{section.instruction}</span>
            </div>

            {/* Questions Lists */}
            <div className={styles.questionsList}>
              {section.questions.map((q, qIdx) => (
                <div key={qIdx} className={styles.questionItem}>
                  <div className={styles.questionTextContainer}>
                    <span className={styles.questionNumber}>{qIdx + 1}.</span>
                    <span className={styles.questionText}>{q.text}</span>
                  </div>
                  
                  {/* Right Tags container */}
                  <div className={styles.questionTags}>
                    <span className={`badge ${
                      q.difficulty === 'Easy' 
                        ? 'badge-easy' 
                        : q.difficulty === 'Moderate' 
                          ? 'badge-moderate' 
                          : 'badge-hard'
                    }`}>
                    {q.difficulty === 'Easy' ? 'KL1 - Easy' : q.difficulty === 'Moderate' ? 'KL2 - Medium' : 'KL3 - Hard'}
                    </span>
                    <span className={styles.marksTag}>
                      {q.marks} Mark{q.marks > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Dynamic Knowledge Level Legend */}
        <div style={{ marginTop: '40px', paddingTop: '15px', borderTop: '1px dashed var(--border-color)', pageBreakInside: 'avoid' }}>
          <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Knowledge Level (KL) Legend:
          </h5>
          <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong>KL1</strong>: Remembering & Understanding &nbsp;|&nbsp; 
            <strong>KL2</strong>: Applying &nbsp;|&nbsp; 
            <strong>KL3</strong>: Analyzing, Evaluating & Creating
          </p>
        </div>
      </article>

      {/* 3. Floating Bottom Dashboard Actions bar */}
      <footer className={`${styles.actionBar} no-print`}>
        <button 
          type="button" 
          className={styles.secondaryActionBtn}
          onClick={handleCreateNew}
        >
          <FilePlus size={16} />
          <span>Create New Assignment</span>
        </button>

        <button 
          type="button" 
          className={styles.primaryActionBtn}
          onClick={handleRegenerate}
        >
          <RefreshCw size={16} />
          <span>Regenerate Paper</span>
        </button>
      </footer>
    </div>
  );
}
