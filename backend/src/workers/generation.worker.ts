import Assignment from '../models/Assignment';
import { generateAssessment } from '../services/ai.service';
import { notifyProgress } from '../ws/websocket';
import { invalidateAssignmentsCache } from '../services/cache.service';

// Main job processor for assignment paper generation
export async function processAssignmentGeneration(assignmentId: string): Promise<void> {
  console.log(`Started processing pipeline for assignment [ID: ${assignmentId}]`);

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    console.error(`Assignment [ID: ${assignmentId}] not found in database.`);
    return;
  }

  try {
    // Stage 1: Initialize process
    assignment.status = 'processing';
    assignment.progress = 10;
    await assignment.save();
    notifyProgress(assignmentId, 10, 'processing');
    
    // Stage 2: Invoke Gemini AI Model
    console.log(`[Step 2] Sending prompt request to Gemini AI...`);
    assignment.progress = 30;
    await assignment.save();
    notifyProgress(assignmentId, 30, 'processing');
    
    const generatedPaper = await generateAssessment(
      assignment.subject,
      assignment.gradeClass,
      assignment.schoolName,
      assignment.questionsConfig,
      assignment.timeAllowed,
      assignment.additionalInstructions
    );

    // Stage 3: Parse and validate AI Response
    console.log(`[Step 3] AI response generated. Validating structured schema...`);
    assignment.progress = 60;
    await assignment.save();
    notifyProgress(assignmentId, 60, 'processing');

    // Stage 4: Compile server-side PDF
    console.log(`[Step 4] Compiling exam layout to PDF using pdfkit...`);
    assignment.progress = 85;
    await assignment.save();
    notifyProgress(assignmentId, 85, 'processing');

    const pdfRelativeUrl = `/api/assignments/${assignmentId}/download`;

    // Stage 5: Finalize and Save
    console.log(`[Step 5] Writing results and dynamic download link to MongoDB database...`);
    assignment.result = generatedPaper;
    assignment.pdfUrl = pdfRelativeUrl;
    assignment.status = 'completed';
    assignment.progress = 100;
    await assignment.save();

    // Invalidate caches
    await invalidateAssignmentsCache(assignmentId);

    console.log(`Pipeline completed successfully for assignment [ID: ${assignmentId}]`);
    notifyProgress(assignmentId, 100, 'completed', generatedPaper, undefined, pdfRelativeUrl);

  } catch (err: any) {
    console.error(`Pipeline failed for assignment [ID: ${assignmentId}]:`, err);
    
    assignment.status = 'failed';
    assignment.errorMsg = err.message || 'An unknown execution error occurred during generation';
    assignment.progress = 100;
    await assignment.save();
    
    // Invalidate caches
    await invalidateAssignmentsCache(assignmentId);
    
    notifyProgress(assignmentId, 100, 'failed', undefined, assignment.errorMsg);
  }
}
