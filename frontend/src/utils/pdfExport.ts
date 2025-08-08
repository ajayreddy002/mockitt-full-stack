/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import { format } from 'date-fns';

interface ResumeData {
  id: string;
  originalName: string;
  analysisScore: number;
  atsScore: number;
  skillsFound: string[];
  skillsGaps: string[];
  strengths: string[];
  improvements: string[];
  suggestions: {
    formatting: string[];
    content: string[];
    keywords: string[];
  };
  analyzedAt: string;
  provider: string;
}

export class MockittPDFExporter {
  private pdf: jsPDF;
  private yPosition: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;

  constructor() {
    this.pdf = new jsPDF('portrait', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  async exportResumeAnalysis(resumeData: ResumeData): Promise<void> {
    try {
      // ✅ FIXED: Validate input data
      if (!resumeData || typeof resumeData !== 'object') {
        throw new Error('Invalid resume data provided');
      }

      // Ensure required fields have fallback values
      const validatedData = {
        id: resumeData.id || 'unknown',
        originalName: resumeData.originalName || 'resume.pdf',
        analysisScore: Number(resumeData.analysisScore) || 0,
        atsScore: Number(resumeData.atsScore) || 0,
        skillsFound: Array.isArray(resumeData.skillsFound) ? resumeData.skillsFound : [],
        skillsGaps: Array.isArray(resumeData.skillsGaps) ? resumeData.skillsGaps : [],
        strengths: Array.isArray(resumeData.strengths) ? resumeData.strengths : [],
        improvements: Array.isArray(resumeData.improvements) ? resumeData.improvements : [],
        suggestions: {
          formatting: Array.isArray(resumeData.suggestions?.formatting) ? resumeData.suggestions.formatting : [],
          content: Array.isArray(resumeData.suggestions?.content) ? resumeData.suggestions.content : [],
          keywords: Array.isArray(resumeData.suggestions?.keywords) ? resumeData.suggestions.keywords : [],
        },
        analyzedAt: resumeData.analyzedAt || new Date().toISOString(),
        provider: resumeData.provider || 'AI Analysis',
      };

      // Add header with Mockitt branding
      this.addHeader();

      // Add sections with validated data
      this.addResumeInfo(validatedData);
      this.addScoresSection(validatedData);
      this.addSkillsSection(validatedData);
      this.addFeedbackSection(validatedData);
      this.addSuggestionsSection(validatedData);
      this.addFooter();

      // Generate filename with timestamp
      const filename = `Mockitt-Analysis-${validatedData.originalName.replace(/\.[^/.]+$/, '')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;

      // Download the PDF
      this.pdf.save(filename);

      console.log('PDF exported successfully!');
    } catch (error: any) {
      console.error('PDF export failed:', error);
      throw new Error(`Failed to export PDF: ${error.message}`);
    }
  }


  private addHeader(): void {
    // Mockitt logo area (you can add actual logo later)
    this.pdf.setFillColor(59, 130, 246); // Blue-500
    this.pdf.rect(this.margin, 10, 30, 15, 'F');

    // Mockitt text logo
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Mockitt', this.margin + 15, 20, { align: 'center' });

    // Title
    this.pdf.setTextColor(31, 41, 55); // Gray-800
    this.pdf.setFontSize(20);
    this.pdf.text('Resume Analysis Report', this.margin + 40, 20);

    // Date
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(107, 114, 128); // Gray-500
    this.pdf.text(`Generated on ${format(new Date(), 'MMMM dd, yyyy')}`, this.pageWidth - this.margin, 15, { align: 'right' });

    this.yPosition = 35;
    this.addLine();
  }

  private addResumeInfo(resumeData: ResumeData): void {
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(31, 41, 55);
    this.pdf.text('Resume Information', this.margin, this.yPosition);

    this.yPosition += 10;

    // Resume details
    const details = [
      ['File Name:', resumeData.originalName],
      ['Analysis Date:', format(new Date(resumeData.analyzedAt), 'PPP')],
      ['AI Provider:', resumeData.provider],
      ['Analysis ID:', resumeData.id.slice(-8).toUpperCase()],
    ];

    this.pdf.setFontSize(11);

    details.forEach(([label, value]) => {
      // Ensure both label and value are strings
      const labelStr = String(label);
      const valueStr = String(value);

      // Validate coordinates are numbers and within bounds
      if (isNaN(this.yPosition) || this.yPosition > this.pageHeight - 20) {
        this.pdf.addPage();
        this.yPosition = 20;
      }

      try {
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(labelStr, this.margin, this.yPosition);

        this.pdf.setFont('helvetica', 'normal');
        this.pdf.text(valueStr, this.margin + 40, this.yPosition);

        this.yPosition += 6;
      } catch (error) {
        console.error(`Error adding text: ${labelStr} - ${valueStr}`, error);
        // Skip this line and continue
        this.yPosition += 6;
      }
    });

    this.yPosition += 5;
  }

  private addScoresSection(resumeData: ResumeData): void {
    this.addSectionHeader('Performance Scores');

    // Overall Score
    this.addScoreBox('Overall Score', resumeData.analysisScore, this.margin, this.yPosition, 80);

    // ATS Score
    this.addScoreBox('ATS Compatibility', resumeData.atsScore, this.margin + 90, this.yPosition, 80);

    this.yPosition += 35;
  }

  private addScoreBox(title: string, score: number, x: number, y: number, width: number): void {
    // Score box background
    const color = score >= 80 ? [16, 185, 129] : score >= 60 ? [245, 158, 11] : [239, 68, 68];
    this.pdf.setFillColor(color[0], color[1], color[2]);
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.rect(x, y, width, 25, 'FD');

    // Title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, x + width / 2, y + 8, { align: 'center' });

    // Score
    this.pdf.setFontSize(18);
    this.pdf.text(`${score}%`, x + width / 2, y + 20, { align: 'center' });
  }

  private addSkillsSection(resumeData: ResumeData): void {
    this.addSectionHeader('Skills Analysis');

    // Skills Found
    if (resumeData.skillsFound.length > 0) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(22, 163, 74); // Green-600
      this.pdf.text('✓ Skills Found:', this.margin, this.yPosition);
      this.yPosition += 7;

      this.addSkillsList(resumeData.skillsFound, [22, 163, 74, 0.1]);
    }

    // Skills Gaps
    if (resumeData.skillsGaps.length > 0) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(234, 88, 12); // Orange-600
      this.pdf.text('⚠ Skills to Add:', this.margin, this.yPosition);
      this.yPosition += 7;

      this.addSkillsList(resumeData.skillsGaps, [234, 88, 12, 0.1]);
    }
  }

  private addSkillsList(skills: string[], bgColor: number[]): void {
    if (!Array.isArray(skills) || skills.length === 0) {
      return;
    }

    let x = this.margin;
    let y = this.yPosition;
    const skillHeight = 6;
    const skillMargin = 3;

    skills.forEach((skill) => {
      // ✅ FIXED: Ensure skill is a valid string
      const skillStr = String(skill || '').trim();

      if (!skillStr) {
        return; // Skip empty skills
      }

      try {
        this.pdf.setFontSize(9);
        const skillWidth = this.pdf.getTextWidth(skillStr) + 6;

        // Check if skill fits on current line
        if (x + skillWidth > this.pageWidth - this.margin) {
          x = this.margin;
          y += skillHeight + skillMargin;
        }

        // Check page bounds
        if (y > this.pageHeight - 20) {
          this.pdf.addPage();
          y = 20;
        }

        // Draw skill box
        this.pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        this.pdf.rect(x, y - 4, skillWidth, skillHeight, 'F');

        // Draw skill text
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(bgColor[0], bgColor[1], bgColor[2]);
        this.pdf.text(skillStr, x + 3, y);

        x += skillWidth + skillMargin;
      } catch (error) {
        console.error(`Error adding skill: ${skillStr}`, error);
        // Continue with next skill
      }
    });

    this.yPosition = y + 10;
  }


  private addFeedbackSection(resumeData: ResumeData): void {
    // Check if we need a new page
    if (this.yPosition > this.pageHeight - 80) {
      this.pdf.addPage();
      this.yPosition = 20;
    }

    this.addSectionHeader('Strengths & Areas for Improvement');

    // Strengths
    if (resumeData.strengths.length > 0) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(22, 163, 74);
      this.pdf.text('Strengths:', this.margin, this.yPosition);
      this.yPosition += 8;

      resumeData.strengths.forEach((strength) => {
        this.addBulletPoint(strength, [22, 163, 74]);
      });
    }

    this.yPosition += 5;

    // Improvements
    if (resumeData.improvements.length > 0) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(234, 88, 12);
      this.pdf.text('Areas for Improvement:', this.margin, this.yPosition);
      this.yPosition += 8;

      resumeData.improvements.forEach((improvement) => {
        this.addBulletPoint(improvement, [234, 88, 12]);
      });
    }
  }

  private addSuggestionsSection(resumeData: ResumeData): void {
    // Check if we need a new page
    if (this.yPosition > this.pageHeight - 60) {
      this.pdf.addPage();
      this.yPosition = 20;
    }

    this.addSectionHeader('Actionable Suggestions');

    const suggestionCategories = [
      { title: 'Formatting Suggestions', items: resumeData.suggestions.formatting, color: [59, 130, 246] },
      { title: 'Content Improvements', items: resumeData.suggestions.content, color: [139, 92, 246] },
      { title: 'Keywords to Add', items: resumeData.suggestions.keywords, color: [236, 72, 153] },
    ];

    suggestionCategories.forEach((category) => {
      if (category.items.length > 0) {
        this.pdf.setFontSize(11);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(category.color[0], category.color[1], category.color[2]);
        this.pdf.text(category.title, this.margin, this.yPosition);
        this.yPosition += 7;

        category.items.forEach((item) => {
          this.addBulletPoint(item, category.color);
        });

        this.yPosition += 3;
      }
    });
  }

  private addBulletPoint(text: string, color: number[]): void {
    // ✅ FIXED: Ensure text is a valid string
    const textStr = String(text || '');

    if (!textStr.trim()) {
      return; // Skip empty text
    }

    // Check page bounds
    if (this.yPosition > this.pageHeight - 20) {
      this.pdf.addPage();
      this.yPosition = 20;
    }

    try {
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(color[0], color[1], color[2]);
      this.pdf.text('•', this.margin + 5, this.yPosition);

      this.pdf.setTextColor(75, 85, 99); // Gray-600

      // ✅ FIXED: Proper handling of long text with splitTextToSize
      const maxWidth = this.pageWidth - this.margin - 20;
      const lines = this.pdf.splitTextToSize(textStr, maxWidth);

      // Draw each line separately
      lines.forEach((line: string, index: number) => {
        const yPos = this.yPosition + (index * 5);
        if (yPos <= this.pageHeight - 15) {
          this.pdf.text(line, this.margin + 10, yPos);
        }
      });

      this.yPosition += lines.length * 5;
    } catch (error) {
      console.error(`Error adding bullet point: ${textStr}`, error);
      this.yPosition += 5; // Skip and continue
    }
  }


  private addSectionHeader(title: string): void {
    this.yPosition += 5;
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(31, 41, 55);
    this.pdf.text(title, this.margin, this.yPosition);
    this.yPosition += 10;
  }

  private addLine(): void {
    this.pdf.setDrawColor(229, 231, 235); // Gray-200
    this.pdf.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition);
    this.yPosition += 5;
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 15;

    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(107, 114, 128);

    this.pdf.text('Generated by Mockitt - AI-Powered Career Platform', this.margin, footerY);
    this.pdf.text(`Page 1 of ${this.pdf.getNumberOfPages()}`, this.pageWidth - this.margin, footerY, { align: 'right' });

    // Add website URL
    this.pdf.setTextColor(59, 130, 246);
    this.pdf.text('mockitt.com', this.pageWidth / 2, footerY, { align: 'center' });
  }
}

// Export function for easy use
export const exportResumeAnalysisToPDF = async (resumeData: ResumeData): Promise<void> => {
  const exporter = new MockittPDFExporter();
  await exporter.exportResumeAnalysis(resumeData);
};
