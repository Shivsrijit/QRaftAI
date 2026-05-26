import PDFDocument from 'pdfkit';
import { IAssessmentResult } from '../models/Assignment';

const LEFT_MARGIN  = 50;
const RIGHT_MARGIN = 50;
const BADGE_WIDTH  = 140;

export async function generatePDF(result: IAssessmentResult, writeStream: NodeJS.WritableStream): Promise<void> {
  const doc = new PDFDocument({ margin: LEFT_MARGIN, size: 'A4', autoFirstPage: true });
  doc.pipe(writeStream);

  // Configure color palette for PDF document
  const primaryColor   = '#1e293b';
  const secondaryColor = '#475569';
  const lightSlate     = '#cbd5e1';
  const borderGray     = '#e2e8f0';

  // Helper functions for page positioning and rules
  const pageWidth    = () => doc.page.width;
  const contentWidth = () => pageWidth() - LEFT_MARGIN - RIGHT_MARGIN;
  const Q_TEXT_WIDTH = () => contentWidth() - BADGE_WIDTH - 8;

  const drawPageBorder = () => {
    doc.save();
    doc.rect(30, 30, pageWidth() - 60, doc.page.height - 60).lineWidth(1).stroke(lightSlate);
    doc.rect(34, 34, pageWidth() - 68, doc.page.height - 68).lineWidth(0.5).stroke(lightSlate);
    doc.restore();
  };

  const hRule = (color = secondaryColor, weight = 1) => {
    doc.moveTo(LEFT_MARGIN, doc.y)
       .lineTo(pageWidth() - RIGHT_MARGIN, doc.y)
       .lineWidth(weight)
       .stroke(color);
    doc.moveDown(0.5);
  };

  const ensureSpace = (needed: number) => {
    if (doc.y + needed > doc.page.height - 60) doc.addPage();
  };

  // Draw borders on page addition
  drawPageBorder();
  doc.on('pageAdded', drawPageBorder);

  // School and Exam Heading Section
  doc.fillColor(primaryColor).fontSize(18).font('Helvetica-Bold')
     .text(result.schoolName.toUpperCase(), LEFT_MARGIN, doc.y, { align: 'center', width: contentWidth() });
  doc.moveDown(0.3);

  doc.fontSize(13).font('Helvetica-Bold')
     .text(`Subject: ${result.subject}`, LEFT_MARGIN, doc.y, { align: 'center', width: contentWidth() });
  doc.moveDown(0.25);

  doc.fontSize(11).font('Helvetica')
     .text(`Class: ${result.class}`, LEFT_MARGIN, doc.y, { align: 'center', width: contentWidth() });
  doc.moveDown(0.8);

  // Time Allowed and Max Marks Row
  const statsY = doc.y;

  doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor)
     .text(`Time Allowed: ${result.timeAllowed}`, LEFT_MARGIN, statsY, {
       width: contentWidth() / 2, align: 'left', lineBreak: false,
     });

  doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor)
     .text(`Maximum Marks: ${result.maxMarks}`, LEFT_MARGIN + contentWidth() / 2, statsY, {
       width: contentWidth() / 2, align: 'right', lineBreak: false,
     });

  doc.y = statsY + 20;
  doc.moveDown(0.4);
  hRule(secondaryColor, 1);

  // Instructions Section
  doc.fontSize(9.5).font('Helvetica-Oblique').fillColor(secondaryColor)
     .text('All questions are compulsory unless stated otherwise.', LEFT_MARGIN, doc.y, {
       align: 'center', width: contentWidth(),
     });
  doc.moveDown(0.8);

  // Student Information Lines
  const infoY = doc.y;
  const col   = contentWidth() / 3;

  doc.fillColor(primaryColor).font('Helvetica').fontSize(10)
     .text('Name: ___________________________', LEFT_MARGIN, infoY, { width: col, lineBreak: false });

  doc.text('Roll Number: ___________________', LEFT_MARGIN + col, infoY, {
    width: col, align: 'center', lineBreak: false,
  });

  doc.text('Section: _________', LEFT_MARGIN + col * 2, infoY, {
    width: col, align: 'right', lineBreak: false,
  });

  doc.y = infoY + 20;
  doc.moveDown(1);
  hRule(borderGray, 0.5);
  doc.moveDown(0.5);

  // Sections and Questions rendering
  let qNum = 1;

  for (const section of result.sections) {
    ensureSpace(90);

    // Section name — centered, underlined
    doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold')
       .text(section.name, LEFT_MARGIN, doc.y, {
         align: 'center', width: contentWidth(), underline: true,
       });
    doc.moveDown(0.3);

    // Section title
    doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor)
       .text(section.title, LEFT_MARGIN, doc.y, { align: 'center', width: contentWidth() });
    doc.moveDown(0.2);

    // Section instruction
    doc.fontSize(9).font('Helvetica-Oblique').fillColor(secondaryColor)
       .text(section.instruction, LEFT_MARGIN, doc.y, { align: 'center', width: contentWidth() });
    doc.moveDown(0.8);

    for (const q of section.questions) {
      const qText = `${qNum}.  ${q.text}`;
      const difficultyLabel = q.difficulty === 'Easy' ? 'KL1 - Easy' : q.difficulty === 'Moderate' ? 'KL2 - Medium' : 'KL3 - Hard';
      const badge = `[${difficultyLabel}]  [${q.marks} Mark${q.marks > 1 ? 's' : ''}]`;

      // Measure heights before rendering
      doc.font('Helvetica').fontSize(9.5);
      const qHeight = doc.heightOfString(qText, { width: Q_TEXT_WIDTH(), lineGap: 3 });

      doc.font('Helvetica-Bold').fontSize(8.5);
      const bHeight = doc.heightOfString(badge, { width: BADGE_WIDTH, lineGap: 3 });

      const rowHeight = Math.max(qHeight, bHeight);
      ensureSpace(rowHeight + 16);

      const rowY = doc.y;

      // Question text — LEFT column
      doc.fillColor(primaryColor).font('Helvetica').fontSize(9.5)
         .text(qText, LEFT_MARGIN, rowY, { width: Q_TEXT_WIDTH(), lineGap: 3, lineBreak: true });

      // Badge — RIGHT column, pinned to same rowY
      doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(8.5)
         .text(badge, LEFT_MARGIN + Q_TEXT_WIDTH() + 8, rowY, {
           width: BADGE_WIDTH, align: 'right', lineBreak: true,
         });

      // Advance Y past the tallest block
      doc.y = rowY + rowHeight + 12;
      qNum++;
    }

    doc.moveDown(1);
  }

  // Knowledge Level Legend Footer
  ensureSpace(60);
  doc.moveDown(2);
  hRule(borderGray, 0.5);
  doc.moveDown(0.3);
  
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primaryColor)
     .text('Knowledge Level (KL) Legend:', LEFT_MARGIN, doc.y);
  doc.moveDown(0.2);
  
  doc.fontSize(8).font('Helvetica-Oblique').fillColor(secondaryColor)
     .text('KL1: Remembering & Understanding  |  KL2: Applying  |  KL3: Analyzing, Evaluating & Creating', LEFT_MARGIN, doc.y, {
       width: contentWidth(),
       align: 'left'
     });

  doc.end();
}