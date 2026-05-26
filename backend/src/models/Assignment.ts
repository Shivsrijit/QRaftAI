import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
}

export interface ISection {
  name: string;      // "Section A"
  title: string;     // "Short Answer Questions"
  instruction: string; // "Attempt all questions. Each question carries 2 marks"
  questions: IQuestion[];
}

export interface IAssessmentResult {
  schoolName: string;
  subject: string;
  class: string;
  timeAllowed: string;
  maxMarks: number;
  sections: ISection[];
}

export interface IQuestionTypeConfig {
  type: string;  // e.g. "Multiple Choice Questions", "Short Questions"
  count: number;
  marks: number;
}

export interface IAssignment extends Document {
  title: string;
  schoolName: string;
  subject: string;
  gradeClass: string;
  dueDate: Date;
  questionsConfig: IQuestionTypeConfig[];
  timeAllowed?: string;
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lifecycleStatus: 'ongoing' | 'due' | 'completed';
  progress: number; // 0 to 100
  errorMsg?: string;
  result?: IAssessmentResult;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], required: true },
  marks: { type: Number, required: true }
});

const SectionSchema = new Schema<ISection>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema]
});

const AssessmentResultSchema = new Schema<IAssessmentResult>({
  schoolName: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: String, required: true },
  timeAllowed: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  sections: [SectionSchema]
});

const QuestionTypeConfigSchema = new Schema<IQuestionTypeConfig>({
  type: { type: String, required: true },
  count: { type: Number, required: true },
  marks: { type: Number, required: true }
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    gradeClass: { type: String, required: true },
    dueDate: { type: Date, required: true },
    questionsConfig: [QuestionTypeConfigSchema],
    timeAllowed: { type: String },
    additionalInstructions: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'], 
      default: 'pending' 
    },
    lifecycleStatus: {
      type: String,
      enum: ['ongoing', 'due', 'completed'],
      default: 'ongoing'
    },
    progress: { type: Number, default: 0 },
    errorMsg: { type: String },
    result: { type: AssessmentResultSchema },
    pdfUrl: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
