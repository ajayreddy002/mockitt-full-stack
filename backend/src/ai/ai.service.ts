import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RealTimeAnalysisDto,
  InstantCoachingDto,
  QuestionGenerationDto,
  FollowUpDto,
  SpeechAnalysisDto,
} from './dto';
import { InterviewResponse } from '@prisma/client';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly geminiApiKey: string;
  private readonly openaiApiKey: string;
  private readonly baseUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  constructor(private configService: ConfigService) {
    this.geminiApiKey = this.configService.get('GEMINI_API_KEY');
    this.openaiApiKey = this.configService.get('OPENAI_API_KEY');

    if (!this.geminiApiKey && !this.openaiApiKey) {
      throw new Error(
        'At least one AI API key must be configured (GEMINI_API_KEY or OPENAI_API_KEY)',
      );
    }
  }

  async analyzeResponseRealTime(data: RealTimeAnalysisDto) {
    const prompt = this.buildRealTimeAnalysisPrompt(data);

    try {
      this.logger.debug(
        `Analyzing real-time response for role: ${data.targetRole}`,
      );

      const response = await this.callGeminiAPI(prompt, {
        temperature: 0.3,
        maxOutputTokens: 1024,
      });

      const analysis = this.parseAnalysisResponse(response);

      return {
        success: true,
        data: analysis,
        timestamp: new Date().toISOString(),
        provider: 'gemini',
      };
    } catch (error) {
      this.logger.error(`Real-time analysis failed: ${error.message}`);

      // Fallback analysis if AI fails
      const fallbackAnalysis = this.getFallbackAnalysis(data.spokenText);
      return {
        success: true,
        data: fallbackAnalysis,
        timestamp: new Date().toISOString(),
        provider: 'fallback',
      };
    }
  }

  async generateInstantCoachingTips(data: InstantCoachingDto) {
    const prompt = this.buildCoachingPrompt(data);

    try {
      this.logger.debug(
        `Generating coaching tips for: ${data.context?.targetRole || 'general'}`,
      );

      const response = await this.callGeminiAPI(prompt, {
        temperature: 0.7,
        maxOutputTokens: 300,
      });

      const tips = this.parseCoachingTips(response);

      return {
        success: true,
        tips,
        timestamp: new Date().toISOString(),
        provider: 'gemini',
      };
    } catch (error) {
      this.logger.error(`Coaching tips generation failed: ${error.message}`);

      const fallbackTips = this.getFallbackTips(data.context);
      return {
        success: true,
        tips: fallbackTips,
        timestamp: new Date().toISOString(),
        provider: 'fallback',
      };
    }
  }

  async generatePersonalizedQuestions(data: QuestionGenerationDto) {
    const prompt = this.buildQuestionGenerationPrompt(data);

    try {
      this.logger.debug(
        `Generating questions for ${data.targetRole} in ${data.targetIndustry}`,
      );

      const response = await this.callGeminiAPI(prompt, {
        temperature: 0.7,
        maxOutputTokens: 2048,
      });

      const questions = this.parseGeneratedQuestions(response, data);

      return {
        success: true,
        questions,
        count: questions.length,
        timestamp: new Date().toISOString(),
        provider: 'gemini',
      };
    } catch (error) {
      this.logger.error(`Question generation failed: ${error.message}`);

      const fallbackQuestions = this.getFallbackQuestions(data);
      return {
        success: true,
        questions: fallbackQuestions,
        count: fallbackQuestions.length,
        timestamp: new Date().toISOString(),
        provider: 'fallback',
      };
    }
  }

  async generateSmartFollowUp(data: FollowUpDto) {
    const prompt = this.buildFollowUpPrompt(data);

    try {
      this.logger.debug(`Generating follow-up question`);

      const response = await this.callGeminiAPI(prompt, {
        temperature: 0.8,
        maxOutputTokens: 200,
      });

      const followUpQuestion = this.parseFollowUpQuestion(response);

      return {
        success: true,
        followUpQuestion,
        timestamp: new Date().toISOString(),
        provider: 'gemini',
      };
    } catch (error) {
      this.logger.error(`Follow-up generation failed: ${error.message}`);

      return {
        success: true,
        followUpQuestion: 'Can you elaborate on that with a specific example?',
        timestamp: new Date().toISOString(),
        provider: 'fallback',
      };
    }
  }

  async analyzeSpeechPatterns(data: SpeechAnalysisDto) {
    try {
      this.logger.debug(`Analyzing speech patterns`);

      const analysis = this.performSpeechAnalysis(data);

      return {
        success: true,
        analysis,
        timestamp: new Date().toISOString(),
        provider: 'internal',
      };
    } catch (error) {
      this.logger.error(`Speech analysis failed: ${error.message}`);
      throw new InternalServerErrorException('Speech analysis failed');
    }
  }

  // Private helper methods
  private async callGeminiAPI(
    prompt: string,
    config: {
      temperature?: number;
      maxOutputTokens?: number;
    } = {},
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: config.temperature || 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: config.maxOutputTokens || 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Gemini API error: ${response.status} - ${response.statusText}`,
        );
      }

      const data: GeminiResponse = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No text received from Gemini API');
      }

      return text;
    } catch (error) {
      this.logger.error(`Gemini API call failed: ${error.message}`);
      throw error;
    }
  }

  private buildRealTimeAnalysisPrompt(data: RealTimeAnalysisDto): string {
    return `Analyze this interview response for real-time coaching.
  
  Question: "${data.currentQuestion}"
  Response: "${data.spokenText}"
  Target Role: ${data.targetRole}
  Industry: ${data.industry}
  
  IMPORTANT: Return ONLY a valid JSON object without any markdown formatting or code blocks.
  
  Provide analysis as a clean JSON object:
  {
    "confidence": 85,
    "clarity": 90,
    "pace": 75,
    "keywordRelevance": 80,
    "suggestions": ["immediate tip 1", "immediate tip 2"],
    "strengths": ["what they did well"],
    "improvementAreas": ["what to improve"]
  }`;
  }

  private buildCoachingPrompt(data: InstantCoachingDto): string {
    return `You are an expert interview coach providing real-time guidance.

Current Response: "${data.currentResponse}"
Target Role: ${data.context?.targetRole || 'General'}
Industry: ${data.context?.industry || 'Technology'}

Provide 3 immediate, actionable coaching tips:
1. Focus on specific improvements for their current answer
2. Suggest relevant examples or metrics they should mention  
3. Recommend how to structure the remainder of their response

Return only a JSON array of 3 short, actionable tips:
["tip1", "tip2", "tip3"]`;
  }

  private buildQuestionGenerationPrompt(data: QuestionGenerationDto): string {
    return `Generate ${data.count} personalized interview questions for a ${data.targetRole} position in the ${data.targetIndustry} industry.

Requirements:
- Include a mix of: ${data.questionTypes.join(', ')}
- Difficulty level: ${data.difficulty}
- Make questions relevant to the specific role and industry
- Include helpful hints for each question
- Provide expected answer duration in seconds

Return as JSON array with this structure for each question:
{
  "question": "The interview question text",
  "type": "behavioral|technical|situational|company-specific",
  "difficulty": "${data.difficulty}",
  "expectedDuration": 120,
  "hints": ["hint 1", "hint 2", "hint 3"],
  "tags": ["tag1", "tag2", "tag3"],
  "followUpQuestions": ["optional follow-up question"]
}

Return ONLY a valid JSON array of ${data.count} questions.`;
  }

  private buildFollowUpPrompt(data: FollowUpDto): string {
    return `As an expert interviewer, generate a thoughtful follow-up question.

Original Question: "${data.originalQuestion}"
Candidate's Response: "${data.userResponse}"
Role: ${data.context?.targetRole || 'General'}
Industry: ${data.context?.industry || 'Technology'}

Generate ONE follow-up question that:
1. Probes deeper into their experience
2. Asks for specific metrics or examples
3. Explores their problem-solving process
4. Is relevant to the role

Return only the follow-up question, no additional text.`;
  }

  private parseAnalysisResponse(analysisText: string): any {
    try {
      const cleanedText = analysisText
        .replace(/```json\n?/g, '') // Remove ```
        .replace(/```\n?/g, '') // Remove ```
        .replace(/^`+|`+$/g, '') // Remove any leading/trailing backticks
        .trim(); // Remove whitespace
      const parsed = JSON.parse(cleanedText);

      return {
        confidence: Math.max(0, Math.min(100, parsed.confidence || 75)),
        clarity: Math.max(0, Math.min(100, parsed.clarity || 75)),
        pace: Math.max(0, Math.min(100, parsed.pace || 75)),
        keywordRelevance: Math.max(
          0,
          Math.min(100, parsed.keywordRelevance || 70),
        ),
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions
          : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvementAreas: Array.isArray(parsed.improvementAreas)
          ? parsed.improvementAreas
          : [],
      };
    } catch (error) {
      this.logger.warn(`Failed to parse analysis response: ${error.message}`);
      return this.getFallbackAnalysis('');
    }
  }

  private parseCoachingTips(tipsText: string): string[] {
    try {
      const cleanedText = this.cleanAIResponse(tipsText);
      const parsed = JSON.parse(cleanedText);

      if (Array.isArray(parsed)) {
        return parsed.slice(0, 3).map((tip) => String(tip));
      }

      return this.getFallbackTips({});
    } catch (error) {
      this.logger.warn(`Failed to parse coaching tips: ${error.message}`);
      return this.getFallbackTips({});
    }
  }

  private parseGeneratedQuestions(
    questionsText: string,
    context: QuestionGenerationDto,
  ): any[] {
    try {
      const cleanedText = this.cleanAIResponse(questionsText);
      const parsed = JSON.parse(cleanedText);

      if (Array.isArray(parsed)) {
        return parsed.map((q: any, index: number) => ({
          id: `ai-${Date.now()}-${index}`,
          question: q.question || 'Sample interview question',
          type: q.type || 'behavioral',
          difficulty: q.difficulty || context.difficulty,
          expectedDuration: q.expectedDuration || 120,
          hints: Array.isArray(q.hints) ? q.hints : [],
          tags: Array.isArray(q.tags) ? q.tags : [],
          followUpQuestions: Array.isArray(q.followUpQuestions)
            ? q.followUpQuestions
            : [],
          role: context.targetRole,
          industry: context.targetIndustry,
        }));
      }

      return this.getFallbackQuestions(context);
    } catch (error) {
      this.logger.warn(`Failed to parse generated questions: ${error.message}`);
      return this.getFallbackQuestions(context);
    }
  }

  private parseFollowUpQuestion(responseText: string): string {
    return (
      responseText.replace(/``````\n?/g, '').trim() ||
      'Can you provide a specific example of how you handled that challenge?'
    );
  }

  private performSpeechAnalysis(data: SpeechAnalysisDto) {
    const wordCount = data.transcription.split(' ').length;
    const duration = data.duration || 60; // fallback to 1 minute
    const wordsPerMinute = Math.round((wordCount / duration) * 60);

    // Detect filler words
    const fillerWords = [
      'um',
      'uh',
      'like',
      'you know',
      'so',
      'well',
      'actually',
      'basically',
    ];
    const fillerWordCount = fillerWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return count + (data.transcription.match(regex) || []).length;
    }, 0);

    // Calculate pace score (ideal is 140-160 WPM)
    let pace = 100;
    if (wordsPerMinute < 120)
      pace = Math.max(60, 100 - (120 - wordsPerMinute) * 2);
    else if (wordsPerMinute > 180)
      pace = Math.max(60, 100 - (wordsPerMinute - 180) * 2);

    // Calculate clarity (inverse of filler word density)
    const fillerDensity = wordCount > 0 ? fillerWordCount / wordCount : 0;
    const clarity = Math.max(50, 100 - fillerDensity * 200);

    // Generate suggestions
    const suggestions = [];
    if (wordsPerMinute < 120)
      suggestions.push(
        'Try speaking a bit faster - aim for 140-160 words per minute',
      );
    if (wordsPerMinute > 180)
      suggestions.push("Slow down slightly - you're speaking very fast");
    if (fillerWordCount > 3)
      suggestions.push(
        "Reduce filler words like 'um' and 'uh' for more confident delivery",
      );
    if (clarity < 70)
      suggestions.push('Practice speaking more clearly and deliberately');

    return {
      wordsPerMinute,
      pace,
      fillerWordCount,
      clarity,
      confidence: Math.max(50, pace - fillerWordCount * 5),
      suggestions,
      wordCount,
      duration,
    };
  }

  // Fallback methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getFallbackAnalysis(spokenText: string): any {
    return {
      confidence: 75,
      clarity: 78,
      pace: 72,
      keywordRelevance: 70,
      suggestions: [
        'Provide more specific examples from your experience',
        'Use quantifiable results to strengthen your answer',
        'Structure your response using the STAR method',
      ],
      strengths: ['Clear communication', 'Professional tone'],
      improvementAreas: ['Add specific metrics', 'Include more details'],
    };
  }

  private getFallbackTips(context: any): string[] {
    return [
      `Mention specific achievements related to ${context.targetRole || 'your target role'}`,
      'Use the STAR method to structure your response',
      'Include quantifiable results and metrics',
    ];
  }

  private getFallbackQuestions(context: QuestionGenerationDto): any[] {
    const baseQuestions = [
      {
        id: 'fallback-1',
        question: `Tell me about yourself and why you're interested in a ${context.targetRole} position.`,
        type: 'behavioral',
        difficulty: context.difficulty,
        expectedDuration: 120,
        hints: [
          'Start with your professional background',
          'Connect your experience to this specific role',
          'End with your career goals',
        ],
        tags: ['introduction', 'motivation', 'career-goals'],
        followUpQuestions: [
          'What specific skills make you a good fit for this role?',
        ],
        role: context.targetRole,
        industry: context.targetIndustry,
      },
      {
        id: 'fallback-2',
        question: `Describe a challenging project you worked on in ${context.targetIndustry}. How did you handle it?`,
        type: 'situational',
        difficulty: context.difficulty,
        expectedDuration: 180,
        hints: [
          'Use the STAR method (Situation, Task, Action, Result)',
          'Focus on your problem-solving process',
          'Highlight specific skills you used',
        ],
        tags: ['problem-solving', 'industry-specific', 'challenges'],
        followUpQuestions: [
          'What would you do differently if faced with a similar situation?',
        ],
        role: context.targetRole,
        industry: context.targetIndustry,
      },
    ];

    return baseQuestions.slice(0, context.count);
  }
  private analyzeResponseQuality(responses: InterviewResponse[]): {
    averageScore: number;
    consistencyScore: number;
    progressionTrend: 'improving' | 'declining' | 'stable';
    technicalDepth: number;
    communicationClarity: number;
  } {
    if (responses.length === 0) {
      return {
        averageScore: 0,
        consistencyScore: 0,
        progressionTrend: 'stable',
        technicalDepth: 0,
        communicationClarity: 0,
      };
    }

    // Calculate average confidence score from AI analysis
    const validScores = responses
      .filter((r: any) => r.analysis?.confidence)
      .map((r: any) => r.analysis.confidence);

    const averageScore =
      validScores.length > 0
        ? validScores.reduce((sum, score) => sum + score, 0) /
          validScores.length
        : 0;

    // Calculate consistency (lower standard deviation = more consistent)
    const variance =
      validScores.length > 1
        ? validScores.reduce(
            (sum, score) => sum + Math.pow(score - averageScore, 2),
            0,
          ) /
          (validScores.length - 1)
        : 0;
    const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));

    // Determine progression trend
    let progressionTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (validScores.length >= 3) {
      const firstHalf = validScores.slice(
        0,
        Math.floor(validScores.length / 2),
      );
      const secondHalf = validScores.slice(Math.floor(validScores.length / 2));

      const firstHalfAvg =
        firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
      const secondHalfAvg =
        secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

      if (secondHalfAvg > firstHalfAvg + 5) progressionTrend = 'improving';
      else if (secondHalfAvg < firstHalfAvg - 5) progressionTrend = 'declining';
    }

    // Analyze technical depth from transcriptions
    const technicalKeywords = [
      'algorithm',
      'database',
      'architecture',
      'framework',
      'implementation',
      'optimization',
      'scalability',
    ];
    let technicalMentions = 0;
    let totalWords = 0;

    responses.forEach((response) => {
      if (response.transcription) {
        const words = response.transcription.toLowerCase().split(' ');
        totalWords += words.length;
        technicalMentions += technicalKeywords.filter((keyword) =>
          words.some((word) => word.includes(keyword)),
        ).length;
      }
    });

    const technicalDepth =
      totalWords > 0
        ? Math.min(100, (technicalMentions / totalWords) * 1000)
        : 0;

    // Analyze communication clarity from speech patterns
    let totalFillerWords = 0;
    let totalResponseWords = 0;

    responses.forEach((response: any) => {
      if (response.analysis?.fillerWordCount) {
        totalFillerWords += response.analysis.fillerWordCount;
      }
      if (response.transcription) {
        totalResponseWords += response.transcription.split(' ').length;
      }
    });

    const communicationClarity =
      totalResponseWords > 0
        ? Math.max(0, 100 - (totalFillerWords / totalResponseWords) * 100)
        : 0;

    return {
      averageScore: Math.round(averageScore),
      consistencyScore: Math.round(consistencyScore),
      progressionTrend,
      technicalDepth: Math.round(technicalDepth),
      communicationClarity: Math.round(communicationClarity),
    };
  }
  private parseAdaptiveQuestion(text: string): {
    question: string;
    difficulty: string;
    followUpTriggers: string[];
    expectedDuration: number;
    type: string;
    hints: string[];
  } {
    try {
      // Clean the response text
      const cleanedText = this.cleanAIResponse(text);

      // Try to parse as JSON first
      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (jsonError) {
        // If JSON parsing fails, extract information manually
        parsed = this.extractQuestionFromText(cleanedText);
      }

      return {
        question:
          parsed.question ||
          'Can you elaborate on your experience with this technology?',
        difficulty: parsed.difficulty || 'medium',
        followUpTriggers: Array.isArray(parsed.followUpTriggers)
          ? parsed.followUpTriggers
          : [
              'incomplete answer',
              'needs clarification',
              'technical depth required',
            ],
        expectedDuration: parsed.expectedDuration || 120,
        type: parsed.type || 'follow-up',
        hints: Array.isArray(parsed.hints)
          ? parsed.hints
          : [
              'Provide specific examples',
              'Explain your thought process',
              'Mention relevant technologies',
            ],
      };
    } catch (error) {
      this.logger.warn(`Failed to parse adaptive question: ${error.message}`);

      // Return a fallback adaptive question
      return {
        question:
          'Based on your previous response, can you provide more specific details about your approach?',
        difficulty: 'medium',
        followUpTriggers: ['needs_detail', 'clarification_required'],
        expectedDuration: 90,
        type: 'clarification',
        hints: [
          'Use the STAR method (Situation, Task, Action, Result)',
          'Include specific metrics or outcomes',
          'Explain your decision-making process',
        ],
      };
    }
  }

  // Helper method for manual text extraction
  private extractQuestionFromText(text: string): any {
    const lines = text.split('\n').filter((line) => line.trim());

    return {
      question:
        lines
          .find((line) => line.toLowerCase().includes('question'))
          ?.replace(/question:?/i, '')
          .trim() ||
        lines[0] ||
        'Can you tell me more about that?',
      difficulty: text.toLowerCase().includes('advanced')
        ? 'hard'
        : text.toLowerCase().includes('basic')
          ? 'easy'
          : 'medium',
      type: text.toLowerCase().includes('technical')
        ? 'technical'
        : text.toLowerCase().includes('behavioral')
          ? 'behavioral'
          : 'follow-up',
    };
  }
  async generateAdaptiveQuestion(data: {
    previousResponses: InterviewResponse[];
    targetRole: string;
    difficulty: string;
    weakAreas: string[];
  }) {
    const prompt = `Based on previous responses, generate a follow-up question that:
    1. Addresses weak areas: ${data.weakAreas.join(', ')}
    2. Matches difficulty progression for ${data.targetRole}
    3. Builds on previous answers for deeper assessment
    
    Previous response quality: ${this.analyzeResponseQuality(data.previousResponses)}
    
    Return a single, targeted question with context.`;

    const response = await this.callGeminiAPI(prompt);
    return this.parseAdaptiveQuestion(response);
  }
  private cleanAIResponse(text: string): string {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid response text');
    }

    return text
      .replace(/```json\n?/gi, '') // Remove ```
      .replace(/```\w*\n?/g, '') // Remove any code fence with language
      .replace(/^`+|`+$/g, '') // Remove leading/trailing backticks
      .trim(); // Remove whitespace
  }
}
