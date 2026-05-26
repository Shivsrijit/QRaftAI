'use client';
import React, { useState, useEffect } from 'react';
import { UploadCloud, Plus, Trash2, CalendarPlus, FileText, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAssignmentStore, IQuestionTypeConfig } from '../store/useAssignmentStore';
import styles from '../styles/form.module.css';

export default function AssignmentForm() {
  const { createAssignment, isLoading, error: apiError, schoolName } = useAssignmentStore();

  // Basic assignment parameters state
  const [title, setTitle] = useState('Quiz on Electricity');
  const [subject, setSubject] = useState('Science');
  const [gradeClass, setGradeClass] = useState('8th Grade');
  const [dueDate, setDueDate] = useState('2026-06-20');
  const [timeHours, setTimeHours] = useState(1);
  const [timeMinutes, setTimeMinutes] = useState(30);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  
  // Drag and drop uploaded file state
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Dynamic question type configurations state (prefilled matching the Figma visual sample)
  const [questionsConfig, setQuestionsConfig] = useState<IQuestionTypeConfig[]>([
    { type: 'Multiple Choice Questions', count: 4, marks: 1 },
    { type: 'Short Questions', count: 3, marks: 2 },
    { type: 'Diagram/Graph-Based Questions', count: 5, marks: 5 }
  ]);

  // Client validation error messages state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Real-time client form validation
  useEffect(() => {
    if (!title.trim()) {
      setValidationError('Assignment title cannot be empty.');
      return;
    }
    if (!subject.trim()) {
      setValidationError('Subject name is required.');
      return;
    }
    if (!gradeClass.trim()) {
      setValidationError('Class/Grade name is required.');
      return;
    }
    if (!dueDate) {
      setValidationError('Please select a valid due date.');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dueDate);
    if (selectedDate < today) {
      setValidationError('Due Date cannot be in the past.');
      return;
    }
    
    for (let i = 0; i < questionsConfig.length; i++) {
      const c = questionsConfig[i];
      if (c.count <= 0) {
        setValidationError(`Number of questions in row ${i + 1} must be positive.`);
        return;
      }
      if (c.marks <= 0) {
        setValidationError(`Marks in row ${i + 1} must be positive.`);
        return;
      }
    }

    setValidationError(null);
  }, [title, subject, gradeClass, dueDate, questionsConfig]);

  // Available standard question types options
  const questionTypeOptions = [
    'Multiple Choice Questions',
    'Short Questions',
    'Diagram/Graph-Based Questions',
    'Long Answer Questions',
    'Case Study Questions',
    'Fill in the Blanks'
  ];

  // Counter change handler
  const handleCounterChange = (index: number, field: 'count' | 'marks', operation: 'add' | 'subtract') => {
    setQuestionsConfig((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const currentVal = item[field];
        const step = field === 'count' ? 1 : 1; // standard unit changes
        const newVal = operation === 'add' ? currentVal + step : Math.max(1, currentVal - step);
        return { ...item, [field]: newVal };
      })
    );
  };

  // Add configuration row
  const handleAddRow = () => {
    setQuestionsConfig((prev) => [
      ...prev,
      { type: 'Multiple Choice Questions', count: 3, marks: 1 }
    ]);
  };

  // Delete configuration row
  const handleDeleteRow = (index: number) => {
    if (questionsConfig.length <= 1) {
      setValidationError('You must have at least one question type configured.');
      return;
    }
    setQuestionsConfig((prev) => prev.filter((_, idx) => idx !== index));
    setValidationError(null);
  };

  // Select dropdown row type change
  const handleTypeChange = (index: number, newType: string) => {
    setQuestionsConfig((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, type: newType } : item))
    );
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFile({
        name: file.name,
        size: `${sizeInMB} MB`
      });
    }
  };

  // Manual file input selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFile({
        name: file.name,
        size: `${sizeInMB} MB`
      });
    }
  };

  // Submit assessment creator form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Strict Client Validations
    if (!title.trim()) {
      setValidationError('Assignment title cannot be empty.');
      return;
    }
    if (!schoolName.trim()) {
      setValidationError('School name is required.');
      return;
    }
    if (!subject.trim()) {
      setValidationError('Subject name is required.');
      return;
    }
    if (!gradeClass.trim()) {
      setValidationError('Class/Grade name is required.');
      return;
    }
    if (!dueDate) {
      setValidationError('Please select a valid due date.');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dueDate);
    if (selectedDate < today) {
      setValidationError('Due Date cannot be in the past.');
      return;
    }
    
    // Config values check
    for (const c of questionsConfig) {
      if (c.count <= 0 || c.marks <= 0) {
        setValidationError('Question count and marks must be positive numbers greater than zero.');
        return;
      }
    }

    try {
      let combinedTime = '';
      if (timeHours > 0 && timeMinutes > 0) {
        combinedTime = `${timeHours} ${timeHours === 1 ? 'hour' : 'hours'} ${timeMinutes} ${timeMinutes === 1 ? 'minute' : 'minutes'}`;
      } else if (timeHours > 0) {
        combinedTime = `${timeHours} ${timeHours === 1 ? 'hour' : 'hours'}`;
      } else if (timeMinutes > 0) {
        combinedTime = `${timeMinutes} ${timeMinutes === 1 ? 'minute' : 'minutes'}`;
      } else {
        combinedTime = '45 minutes';
      }

      await createAssignment({
        title,
        schoolName,
        subject,
        gradeClass,
        dueDate,
        questionsConfig,
        timeAllowed: combinedTime,
        additionalInstructions: additionalInstructions + (uploadedFile ? `\n[Reference uploaded document file: ${uploadedFile.name}]` : '')
      });
    } catch (err: any) {
      console.error('Submission failed:', err);
    }
  };

  return (
    <div className={styles.container}>
      {/* Title Header with Green Dot matching Mockup */}
      <div className={styles.dashboardHeader}>
        <div className={styles.titleWithDotRow}>
          <span className={styles.greenStatusDot} />
          <h2 className={styles.dashboardTitle}>Create Assignment</h2>
        </div>
        <p className={styles.dashboardSubtitle}>Set up a new assignment for your students</p>
      </div>

      {/* Modern Two-Segment Stepper Progress Bar matching figma designs */}
      <div className={styles.stepperProgress}>
        <div className={`${styles.progressSegment} ${styles.progressSegmentActive}`} />
        <div className={styles.progressSegment} />
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Assignment Details</h2>
          <p className={styles.cardSubtitle}>Basic information about your assignment</p>
        </div>

        {/* Show validation errors or API errors */}
        {(validationError || apiError) && (
          <div className={styles.errorMsg}>
            <X size={16} />
            <span>{validationError || apiError}</span>
          </div>
        )}

        {/* 1. Dashed Drag and Drop File Upload Area sits at the very top below card header */}
        <div 
          className={`${styles.uploadArea} ${isDragging ? styles.uploadDragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            style={{ display: 'none' }}
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileChange}
          />
          
          {uploadedFile ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div className={styles.uploadIcon} style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                <FileText size={24} />
              </div>
              <span className={styles.uploadTitle}>{uploadedFile.name}</span>
              <span className={styles.uploadSubtitle}>{uploadedFile.size}</span>
              <button 
                type="button" 
                className={styles.browseBtn} 
                style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedFile(null);
                }}
              >
                Remove File
              </button>
            </div>
          ) : (
            <>
              <div className={styles.uploadIcon}>
                <UploadCloud size={22} />
              </div>
              <span className={styles.uploadTitle}>Choose a file or drag & drop it here</span>
              <span className={styles.uploadSubtitle}>JPEG, PNG, upto 10MB</span>
              <label htmlFor="file-upload" className={styles.browseBtn}>
                Browse Files
              </label>
            </>
          )}
        </div>

        {/* Upload Description Label below the dashed area */}
        <p className={styles.uploadDescription}>
          Upload images of your preferred document/image
        </p>

        {/* 2. All form input fields pushed below the upload area */}

        {/* Row 1: Title & Time Allowed Selector */}
        <div className={styles.formGridTwo}>
          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
            <label className={styles.label}>Assignment Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Physics exam"
            />
          </div>
          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
            <label className={styles.label}>Time Allowed</label>
            <div className={styles.timePickerContainer}>
              <div className={styles.timePickerSubgroup}>
                <select
                  className={styles.timeSelect}
                  value={timeHours}
                  onChange={(e) => setTimeHours(Number(e.target.value))}
                >
                  {Array.from({ length: 6 }, (_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                <span className={styles.timePickerLabel}>hrs</span>
              </div>

              <div className={styles.timePickerSubgroup}>
                <select
                  className={styles.timeSelect}
                  value={timeMinutes}
                  onChange={(e) => setTimeMinutes(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((mins) => (
                    <option key={mins} value={mins}>
                      {mins}
                    </option>
                  ))}
                </select>
                <span className={styles.timePickerLabel}>mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Subject, Class / Grade & Due Date */}
        <div className={styles.formGridThree}>
          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
            <label className={styles.label}>Subject</label>
            <input 
              type="text" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Science"
            />
          </div>
          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
            <label className={styles.label}>Class / Grade</label>
            <input 
              type="text" 
              value={gradeClass} 
              onChange={(e) => setGradeClass(e.target.value)}
              placeholder="e.g. 8th Grade"
            />
          </div>
          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
            <label className={styles.label}>Due Date</label>
            <div className={styles.dateInputContainer}>
              <CalendarPlus size={18} className={styles.calendarIcon} />
              <input
                type="date"
                className={styles.dateInput}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Row Configurations */}
        <div className={styles.formGroup} style={{ marginTop: '30px' }}>
          <label className={styles.label}>Question Types Configurations</label>
          
          {/* Table/Row Headers matching figma */}
          <div className={styles.questionConfigHeader}>
            <span className={styles.headerLabel}>Question Type</span>
            <span className={styles.headerLabel} style={{ textAlign: 'center' }}>No. of Questions</span>
            <span className={styles.headerLabel} style={{ textAlign: 'center' }}>Marks</span>
          </div>

          {/* Counter items lists */}
          {questionsConfig.map((item, index) => (
            <div key={index} className={styles.questionRow}>
              {/* Selection dropdown */}
              <select
                className={styles.selectInput}
                value={item.type}
                onChange={(e) => handleTypeChange(index, e.target.value)}
              >
                {questionTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {/* Row deleter button in between */}
              <button
                type="button"
                className={styles.deleteRowBtn}
                onClick={() => handleDeleteRow(index)}
                title="Delete question type configuration"
              >
                <X size={16} />
              </button>

              {/* Questions count numeric counter */}
              <div className={styles.counterControlGroup}>
                <span className={styles.counterControlLabel}>No. of Questions</span>
                <div className={styles.counterControl}>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    onClick={() => handleCounterChange(index, 'count', 'subtract')}
                    disabled={item.count <= 1}
                  >
                    —
                  </button>
                  <span className={styles.counterValue}>{item.count}</span>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    onClick={() => handleCounterChange(index, 'count', 'add')}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Questions score numeric counter */}
              <div className={styles.counterControlGroup}>
                <span className={styles.counterControlLabel}>Marks</span>
                <div className={styles.counterControl}>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    onClick={() => handleCounterChange(index, 'marks', 'subtract')}
                    disabled={item.marks <= 1}
                  >
                    —
                  </button>
                  <span className={styles.counterValue}>{item.marks}</span>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    onClick={() => handleCounterChange(index, 'marks', 'add')}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Row controller */}
          <div>
            <button type="button" className={styles.addRowBtn} onClick={handleAddRow}>
              <div className={styles.plusIconCircle}>
                <Plus size={16} />
              </div>
              <span>Add Question Type</span>
            </button>
          </div>
        </div>

        {/* Additional Instructions Description area */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Additional Instructions (Optional)</label>
          <textarea
            className={styles.textareaInput}
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder="e.g. Focus on electric currents, chemical effects of current, CBSE Grade 8 syllabus standards..."
          />
        </div>

        {/* Stepper triggers */}
        <div className={styles.stepperActions}>
          <button type="button" className={styles.prevBtn} disabled>
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>
          
          <button 
            type="submit" 
            className={styles.nextBtn} 
            disabled={isLoading || !!validationError}
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
