import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env';
import { IAssessmentResult, IQuestionTypeConfig } from '../models/Assignment';

// Generate structured assessment using Google Gemini 2.5 Flash
export async function generateAssessment(
  subject: string,
  gradeClass: string,
  schoolName: string,
  configs: IQuestionTypeConfig[],
  timeAllowedInput?: string,
  additionalInstructions?: string
): Promise<IAssessmentResult> {
  // If no API Key is provided, throw a clear environment error
  if (!config.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not found in environment variables. Please add your Gemini API Key to backend/.env to enable live AI generation.');
  }

  // Initialize Gemini API Client
  const aiClient = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  console.log('Google Gemini AI Client initialized.');

  // Calculate Total Marks
  const maxMarks = configs.reduce((sum, item) => sum + (item.count * item.marks), 0);
  
  // Calculate recommended time or use input
  const totalQuestions = configs.reduce((sum, item) => sum + item.count, 0);
  const timeAllowed = timeAllowedInput || `${Math.max(15, totalQuestions * 3)} minutes`;

  const questionTypesPrompt = configs
    .map((c) => `- ${c.count} x ${c.type} (${c.marks} Marks each)`)
    .join('\n');

  const systemInstruction = `You are an expert CBSE/NCERT curriculum school teacher.
Your job is to generate a highly professional and structured Question Paper based on the requested subject, class grade, and question configurations.

Follow these strict rules:
1. Use exactly the school name provided: "${schoolName}". Do not invent a school name.
2. Match the exact Question Types, Question Counts, and Marks per question specified by the user. Do not omit any section.
3. Group questions into logical sections named "Section A", "Section B", "Section C", etc., based on the question type.
4. Each Section must contain:
   - name: "Section A", "Section B", etc.
   - title: A user-friendly title based on the question type (e.g., "Short Answer Questions", "Multiple Choice Questions").
   - instruction: Clear directions for the student (e.g., "Attempt all questions. Each question carries 2 marks.").
   - questions: A list of question items.
5. Each individual Question must contain:
   - text: The actual prompt/question. For Multiple Choice, include options (a, b, c, d) formatted on new lines.
   - difficulty: Assign realistic tags "Easy", "Moderate", or "Hard" distributed evenly.
   - marks: The exact marks configured for this type.
6. The content must be highly academic, challenging, and suitable for the requested grade.
7. Return ONLY valid JSON that matches the requested schema. No conversational filler, markdown formatting, or surrounding text.`;

  const userPrompt = `Generate a question paper for:
- Subject: ${subject}
- Class/Grade: ${gradeClass}
- Question Configurations:
${questionTypesPrompt}
- Total Marks: ${maxMarks}
- Time Allowed: ${timeAllowed}
${additionalInstructions ? `- Special Instructions: ${additionalInstructions}` : ''}

Strictly structure the output into the specified JSON format. Ensure all questions are complete, high-quality, and align with educational standards.`;

  try {
    console.log(`Invoking Gemini API for assessment creation: ${subject} - ${gradeClass}`);
    
    // We use gemini-2.5-flash as the modern fast standard model
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        // Define structured JSON Schema for response mapping
        responseSchema: {
          type: 'OBJECT',
          properties: {
            schoolName: { type: 'STRING' },
            subject: { type: 'STRING' },
            class: { type: 'STRING' },
            timeAllowed: { type: 'STRING' },
            maxMarks: { type: 'INTEGER' },
            sections: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  title: { type: 'STRING' },
                  instruction: { type: 'STRING' },
                  questions: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        text: { type: 'STRING' },
                        difficulty: { 
                          type: 'STRING', 
                          enum: ['Easy', 'Moderate', 'Hard'] 
                        },
                        marks: { type: 'INTEGER' }
                      },
                      required: ['text', 'difficulty', 'marks']
                    }
                  }
                },
                required: ['name', 'title', 'instruction', 'questions']
              }
            }
          },
          required: ['schoolName', 'subject', 'class', 'timeAllowed', 'maxMarks', 'sections']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini AI model');
    }

    const parsedResult: IAssessmentResult = JSON.parse(responseText);
    console.log('Gemini API returned valid structured JSON.');
    return parsedResult;

  } catch (error) {
    console.error('Gemini API Generation failed:', error);
    throw error;
  }
}
