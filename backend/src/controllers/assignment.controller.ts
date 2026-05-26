import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import { addGenerationJob } from '../services/queue.service';
import { getCache, setCache, delCache, invalidateAssignmentsCache } from '../services/cache.service';
import { generatePDF } from '../services/pdf.service';

// Create a new assignment assessment paper and queue its generation
export async function createAssignment(req: Request, res: Response) {
  try {
    const { 
      title, 
      schoolName,
      subject, 
      gradeClass, 
      dueDate, 
      questionsConfig, 
      timeAllowed,
      additionalInstructions 
    } = req.body;

    // 1. Mandatory Input Fields Checks
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required and must be a valid string.' });
    }
    if (!schoolName || typeof schoolName !== 'string' || schoolName.trim() === '') {
      return res.status(400).json({ error: 'School Name is required and must be a valid string.' });
    }
    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      return res.status(400).json({ error: 'Subject is required and must be a valid string.' });
    }
    if (!gradeClass || typeof gradeClass !== 'string' || gradeClass.trim() === '') {
      return res.status(400).json({ error: 'Class/Grade is required and must be a valid string.' });
    }
    if (!dueDate) {
      return res.status(400).json({ error: 'Due Date is required.' });
    }

    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid Due Date format.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      return res.status(400).json({ error: 'Due Date cannot be in the past.' });
    }

    // 2. Questions Configuration Row Checks
    if (!questionsConfig || !Array.isArray(questionsConfig) || questionsConfig.length === 0) {
      return res.status(400).json({ 
        error: 'Questions configuration is required and must contain at least one question type.' 
      });
    }

    for (let i = 0; i < questionsConfig.length; i++) {
      const configItem = questionsConfig[i];
      if (!configItem.type || typeof configItem.type !== 'string' || configItem.type.trim() === '') {
        return res.status(400).json({ error: `Question type name is required at index ${i}.` });
      }
      
      const count = Number(configItem.count);
      const marks = Number(configItem.marks);

      if (isNaN(count) || count <= 0 || !Number.isInteger(count)) {
        return res.status(400).json({ 
          error: `Question count at index ${i} ('${configItem.type}') must be a positive integer greater than zero.` 
        });
      }

      if (isNaN(marks) || marks <= 0) {
        return res.status(400).json({ 
          error: `Marks per question at index ${i} ('${configItem.type}') must be a positive number greater than zero.` 
        });
      }
    }

    // 3. Write pending state to database
    const newAssignment = new Assignment({
      title: title.trim(),
      schoolName: schoolName.trim(),
      subject: subject.trim(),
      gradeClass: gradeClass.trim(),
      dueDate: parsedDate,
      questionsConfig: questionsConfig.map(item => ({
        type: item.type.trim(),
        count: Math.floor(Number(item.count)),
        marks: Number(item.marks)
      })),
      timeAllowed: timeAllowed ? String(timeAllowed).trim() : undefined,
      additionalInstructions: additionalInstructions ? additionalInstructions.trim() : '',
      status: 'pending',
      progress: 0
    });

    const savedAssignment = await newAssignment.save();

    // 4. Invalidate global list cache
    await invalidateAssignmentsCache();

    // 5. Queue background processing worker job
    await addGenerationJob(savedAssignment.id);

    return res.status(201).json(savedAssignment);

  } catch (err: any) {
    console.error('Controller error creating assignment:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Fetch all assignments
export async function getAssignments(req: Request, res: Response) {
  try {
    const cacheKey = 'assignments:all';
    const cached = await getCache<any[]>(cacheKey);
    if (cached) {
      console.log('Serving assignments list from cache');
      return res.status(200).json(cached);
    }

    const assignments = await Assignment.find().sort({ createdAt: -1 });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let updatedAny = false;
    for (const assignment of assignments) {
      if (assignment.dueDate < today && assignment.lifecycleStatus === 'ongoing') {
        assignment.lifecycleStatus = 'due';
        await assignment.save();
        updatedAny = true;
      }
    }

    // Cache the list of assignments for 60 seconds
    await setCache(cacheKey, assignments, 60);

    return res.status(200).json(assignments);
  } catch (err) {
    console.error('Controller error fetching assignments:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Fetch a single assignment by ID
export async function getAssignmentById(req: Request, res: Response) {
  try {
    const assignmentId = req.params.id;
    const cacheKey = `assignments:id:${assignmentId}`;
    
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log(`Serving assignment details [ID: ${assignmentId}] from cache`);
      return res.status(200).json(cached);
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (assignment.dueDate < today && assignment.lifecycleStatus === 'ongoing') {
      assignment.lifecycleStatus = 'due';
      await assignment.save();
      await delCache('assignments:all');
    }

    // Cache the specific assignment details for 60 seconds
    await setCache(cacheKey, assignment, 60);

    return res.status(200).json(assignment);
  } catch (err) {
    console.error('Controller error fetching assignment by ID:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Re-queue an assignment for regeneration
export async function regenerateAssignment(req: Request, res: Response) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Reset status parameters
    assignment.status = 'pending';
    assignment.progress = 0;
    assignment.result = undefined;
    assignment.pdfUrl = undefined;
    assignment.errorMsg = undefined;
    
    const updatedAssignment = await assignment.save();

    // Invalidate caches
    await invalidateAssignmentsCache(assignment.id);

    // Re-queue the generation job
    await addGenerationJob(updatedAssignment.id);

    return res.status(200).json(updatedAssignment);

  } catch (err) {
    console.error('Controller error triggering regeneration:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Delete a single assignment by ID
export async function deleteAssignment(req: Request, res: Response) {
  try {
    const assignmentId = req.params.id;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await Assignment.findByIdAndDelete(assignmentId);

    // Invalidate caches
    await invalidateAssignmentsCache(assignmentId);

    return res.status(200).json({ success: true, message: 'Assignment successfully deleted.' });
  } catch (err) {
    console.error('Controller error deleting assignment:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Dynamically generate and stream the PDF to the user's PC on the fly
export async function downloadAssignmentPDF(req: Request, res: Response) {
  try {
    const assignmentId = req.params.id;
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    if (assignment.status !== 'completed' || !assignment.result) {
      return res.status(400).json({ error: 'Assignment question paper is not fully generated yet.' });
    }

    const filename = `${assignment.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_question_paper.pdf`;

    // Set download headers to serve directly as attachment
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // Dynamically compile and stream direct into response stream
    await generatePDF(assignment.result, res);

  } catch (err) {
    console.error('Controller error downloading dynamic PDF:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

// Update assignment lifecycle status (ongoing | due | completed)
export async function updateAssignmentLifecycleStatus(req: Request, res: Response) {
  try {
    const assignmentId = req.params.id;
    const { status } = req.body;

    if (!status || !['ongoing', 'due', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Valid lifecycle status (ongoing, due, completed) is required.' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    assignment.lifecycleStatus = status;
    const updatedAssignment = await assignment.save();

    // Invalidate caches
    await invalidateAssignmentsCache(assignmentId);

    return res.status(200).json(updatedAssignment);
  } catch (err) {
    console.error('Controller error updating lifecycle status:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
