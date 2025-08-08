import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export interface AIProvider {
  name: string;
  available: boolean;
  cost: 'free' | 'paid';
  model: string;
}

export interface ResumeAnalysisResult {
  overallScore: number;
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
  provider: string;
  analysisDate: Date;
}

@Injectable()
export class AIProviderService {
  private readonly logger = new Logger(AIProviderService.name);
  private readonly gemini: GoogleGenerativeAI | null;
  private readonly openai: OpenAI | null;

  constructor(private configService: ConfigService) {
    // Initialize Gemini (Primary - Free)
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.gemini = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

    // Initialize OpenAI (Fallback - Paid)
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

    this.logger.log(
      `AI Providers initialized: Gemini=${!!this.gemini}, OpenAI=${!!this.openai}`,
    );
  }

  async analyzeResume(
    extractedText: string,
    targetRole?: string,
    targetIndustry?: string,
  ): Promise<ResumeAnalysisResult> {
    // Try Gemini first (free)
    if (this.gemini) {
      try {
        this.logger.log('Attempting analysis with Gemini AI...');
        return await this.analyzeWithGemini(
          extractedText,
          targetRole,
          targetIndustry,
        );
      } catch (error) {
        this.logger.warn(`Gemini analysis failed: ${error.message}`);
        // Continue to OpenAI fallback
      }
    }

    // Fallback to OpenAI
    if (this.openai) {
      try {
        this.logger.log('Attempting analysis with OpenAI...');
        return await this.analyzeWithOpenAI(
          extractedText,
          targetRole,
          targetIndustry,
        );
      } catch (error) {
        this.logger.error(`OpenAI analysis failed: ${error.message}`);
        throw new Error('All AI providers failed. Please try again later.');
      }
    }

    // If no providers available, return sample analysis
    this.logger.warn('No AI providers available, returning sample analysis');
    return this.getSampleAnalysis();
  }

  private async analyzeWithGemini(
    text: string,
    targetRole?: string,
    targetIndustry?: string,
  ): Promise<ResumeAnalysisResult> {
    const model = this.gemini!.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const prompt = this.buildAnalysisPrompt(text, targetRole, targetIndustry);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    // Parse JSON response
    const cleanedText = this.extractJSON(analysisText);
    const analysis = JSON.parse(cleanedText);

    return {
      ...this.formatAnalysisResult(analysis),
      provider: 'Gemini',
      analysisDate: new Date(),
    };
  }

  private async analyzeWithOpenAI(
    text: string,
    targetRole?: string,
    targetIndustry?: string,
  ): Promise<ResumeAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(text, targetRole, targetIndustry);

    const response = await this.openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert resume analyst. Provide analysis in valid JSON format only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const analysisText = response.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(analysisText);

    return {
      ...this.formatAnalysisResult(analysis),
      provider: 'OpenAI',
      analysisDate: new Date(),
    };
  }

  private buildAnalysisPrompt(
    resumeText: string,
    targetRole?: string,
    targetIndustry?: string,
  ): string {
    return `
Please analyze this resume and provide a comprehensive assessment in JSON format:

RESUME CONTENT:
${resumeText}

${targetRole ? `TARGET ROLE: ${targetRole}` : ''}
${targetIndustry ? `TARGET INDUSTRY: ${targetIndustry}` : ''}

Provide your analysis in this EXACT JSON structure:
{
  "overallScore": 85,
  "atsScore": 78,
  "skillsFound": ["JavaScript", "React", "Leadership"],
  "skillsGaps": ["TypeScript", "Cloud Computing"],
  "strengths": ["Clear achievements", "Strong technical background"],
  "improvements": ["Add more quantified results", "Improve summary"],
  "suggestions": {
    "formatting": ["Use consistent bullet points", "Improve spacing"],
    "content": ["Add more metrics", "Include certifications"],
    "keywords": ["Agile methodology", "Cross-functional"]
  }
}

Analysis Guidelines:
- overallScore: 0-100 based on overall quality
- atsScore: 0-100 for Applicant Tracking System compatibility
- skillsFound: Technical and soft skills identified
- skillsGaps: Important missing skills for the role
- strengths: What the resume does well
- improvements: Specific areas to enhance
- suggestions: Actionable improvements by category

Be specific, constructive, and actionable in your feedback.
Return ONLY the JSON object, no additional text.
    `.trim();
  }

  private extractJSON(text: string): string {
    // Remove any markdown code blocks
    const cleaned = text.replace(/``````\n?/g, '');

    // Find JSON object boundaries
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}') + 1;

    if (start === -1 || end === 0) {
      throw new Error('No valid JSON found in response');
    }

    return cleaned.substring(start, end);
  }

  private formatAnalysisResult(
    rawAnalysis: any,
  ): Omit<ResumeAnalysisResult, 'provider' | 'analysisDate'> {
    return {
      overallScore: Math.min(
        100,
        Math.max(0, Number(rawAnalysis.overallScore) || 0),
      ),
      atsScore: Math.min(100, Math.max(0, Number(rawAnalysis.atsScore) || 0)),
      skillsFound: Array.isArray(rawAnalysis.skillsFound)
        ? rawAnalysis.skillsFound.slice(0, 20)
        : [],
      skillsGaps: Array.isArray(rawAnalysis.skillsGaps)
        ? rawAnalysis.skillsGaps.slice(0, 15)
        : [],
      strengths: Array.isArray(rawAnalysis.strengths)
        ? rawAnalysis.strengths.slice(0, 10)
        : [],
      improvements: Array.isArray(rawAnalysis.improvements)
        ? rawAnalysis.improvements.slice(0, 10)
        : [],
      suggestions: {
        formatting: Array.isArray(rawAnalysis.suggestions?.formatting)
          ? rawAnalysis.suggestions.formatting.slice(0, 5)
          : [],
        content: Array.isArray(rawAnalysis.suggestions?.content)
          ? rawAnalysis.suggestions.content.slice(0, 8)
          : [],
        keywords: Array.isArray(rawAnalysis.suggestions?.keywords)
          ? rawAnalysis.suggestions.keywords.slice(0, 10)
          : [],
      },
    };
  }

  private getSampleAnalysis(): ResumeAnalysisResult {
    return {
      overallScore: 75,
      atsScore: 68,
      skillsFound: ['JavaScript', 'React', 'Node.js', 'Git', 'Problem Solving'],
      skillsGaps: ['TypeScript', 'AWS', 'Docker', 'Kubernetes', 'Testing'],
      strengths: [
        'Clear work experience progression',
        'Quantified achievements in previous roles',
        'Good mix of technical and soft skills',
        'Professional summary is well-written',
      ],
      improvements: [
        'Add more specific metrics and numbers',
        'Include relevant industry certifications',
        'Strengthen the technical skills section',
        'Add more recent project examples',
      ],
      suggestions: {
        formatting: [
          'Use consistent bullet point style throughout',
          'Ensure proper spacing between sections',
          'Use a clean, ATS-friendly font like Arial or Calibri',
        ],
        content: [
          'Add percentage improvements or dollar amounts to achievements',
          'Include relevant coursework or certifications',
          'Mention specific technologies used in each role',
          'Add a brief project portfolio section',
        ],
        keywords: [
          'Agile development',
          'Cross-functional collaboration',
          'Performance optimization',
          'Scalable solutions',
          'Code review',
        ],
      },
      provider: 'Sample Data',
      analysisDate: new Date(),
    };
  }

  getAvailableProviders(): AIProvider[] {
    return [
      {
        name: 'Google Gemini',
        available: !!this.gemini,
        cost: 'free',
        model: 'gemini-1.5-flash',
      },
      {
        name: 'OpenAI',
        available: !!this.openai,
        cost: 'paid',
        model: 'gpt-4o-mini',
      },
    ];
  }
}
