import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface QuestionContext {
  type: 'behavioral' | 'technical' | 'situational' | 'general';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  role: string;
  industry: string;
}

export interface CoachingInsight {
  type: 'structure' | 'content' | 'delivery' | 'timing' | 'confidence';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionableAdvice: string;
  example?: string;
  framework?: string;
}

export interface SmartCoachingResponse {
  insights: CoachingInsight[];
  questionContext: QuestionContext;
  personalizedTips: string[];
  suggestedFramework: string;
  estimatedDuration: string;
}

@Injectable()
export class IntelligentCoachingService {
  constructor(private prisma: PrismaService) {}

  async generateSmartCoaching(
    question: string,
    userProfile: any,
    speechMetrics?: any,
    currentAnswer?: string,
  ): Promise<SmartCoachingResponse> {
    // Analyze the question
    const questionContext = this.analyzeQuestion(question);

    // Generate insights based on context
    const insights = this.generateContextualInsights(
      questionContext,
      userProfile,
      speechMetrics,
      currentAnswer,
    );

    // Get personalized recommendations
    const personalizedTips = await this.generatePersonalizedTips(
      questionContext,
      userProfile,
    );

    // Suggest optimal framework
    const suggestedFramework = this.selectOptimalFramework(questionContext);

    // Estimate response duration
    const estimatedDuration = this.estimateOptimalDuration(questionContext);

    return {
      insights,
      questionContext,
      personalizedTips,
      suggestedFramework,
      estimatedDuration,
    };
  }

  private analyzeQuestion(question: string): QuestionContext {
    const lowerQuestion = question.toLowerCase();

    // Behavioral question indicators
    const behavioralKeywords = [
      'tell me about a time',
      'describe a situation',
      'give an example',
      'when did you',
      'how did you handle',
      'what would you do if',
    ];

    // Technical question indicators
    const technicalKeywords = [
      'how would you',
      'what is',
      'explain',
      'implement',
      'code',
      'algorithm',
      'database',
      'api',
      'system design',
      'optimize',
      'debug',
    ];

    // Situational question indicators
    const situationalKeywords = [
      'what if',
      'suppose',
      'imagine',
      'hypothetical',
      'scenario',
    ];

    let type: QuestionContext['type'] = 'general';
    let category = 'general';
    let difficulty: QuestionContext['difficulty'] = 'medium';

    // Determine question type
    if (behavioralKeywords.some((keyword) => lowerQuestion.includes(keyword))) {
      type = 'behavioral';
      category = this.categorizeBehavioralQuestion(lowerQuestion);
    } else if (
      technicalKeywords.some((keyword) => lowerQuestion.includes(keyword))
    ) {
      type = 'technical';
      category = this.categorizeTechnicalQuestion(lowerQuestion);
    } else if (
      situationalKeywords.some((keyword) => lowerQuestion.includes(keyword))
    ) {
      type = 'situational';
      category = 'problem-solving';
    }

    // Assess difficulty
    difficulty = this.assessQuestionDifficulty(lowerQuestion);

    return {
      type,
      category,
      difficulty,
      role: 'software-engineer', // TODO: Extract from user profile
      industry: 'technology',
    };
  }

  private categorizeBehavioralQuestion(question: string): string {
    if (question.includes('conflict') || question.includes('disagree'))
      return 'conflict-resolution';
    if (question.includes('lead') || question.includes('team'))
      return 'leadership';
    if (question.includes('challenge') || question.includes('difficult'))
      return 'problem-solving';
    if (question.includes('mistake') || question.includes('failure'))
      return 'learning-from-failure';
    if (question.includes('deadline') || question.includes('pressure'))
      return 'time-management';
    return 'general-behavioral';
  }

  private categorizeTechnicalQuestion(question: string): string {
    if (question.includes('react') || question.includes('frontend'))
      return 'frontend';
    if (question.includes('api') || question.includes('backend'))
      return 'backend';
    if (question.includes('database') || question.includes('sql'))
      return 'database';
    if (question.includes('system') || question.includes('architecture'))
      return 'system-design';
    if (question.includes('algorithm') || question.includes('complexity'))
      return 'algorithms';
    return 'general-technical';
  }

  private assessQuestionDifficulty(
    question: string,
  ): 'easy' | 'medium' | 'hard' {
    // Simple heuristics for difficulty assessment
    const complexTerms = [
      'architecture',
      'scalability',
      'optimization',
      'distributed',
      'microservices',
    ];
    const basicTerms = ['what is', 'define', 'basic', 'simple'];

    if (complexTerms.some((term) => question.includes(term))) return 'hard';
    if (basicTerms.some((term) => question.includes(term))) return 'easy';
    return 'medium';
  }

  private generateContextualInsights(
    context: QuestionContext,
    userProfile: any,
    speechMetrics?: any,
    currentAnswer?: string,
  ): CoachingInsight[] {
    const insights: CoachingInsight[] = [];

    // Structure guidance based on question type
    insights.push(this.generateStructureInsight(context));

    // Content guidance
    insights.push(this.generateContentInsight(context, userProfile));

    // Delivery feedback (if speech metrics available)
    if (speechMetrics) {
      const deliveryInsights = this.generateDeliveryInsights(speechMetrics);
      insights.push(...deliveryInsights);
    }

    // Timing guidance
    insights.push(this.generateTimingInsight(context, currentAnswer));

    return insights.sort(
      (a, b) =>
        this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority),
    );
  }

  private generateStructureInsight(context: QuestionContext): CoachingInsight {
    switch (context.type) {
      case 'behavioral':
        return {
          type: 'structure',
          priority: 'high',
          title: 'Use STAR Framework',
          message:
            'Structure your behavioral answer using the STAR method for maximum impact.',
          actionableAdvice:
            'Start with Situation, then Task, Action, and Result.',
          framework: 'STAR',
          example:
            'Situation: "At my previous company..." → Task: "I was responsible for..." → Action: "I decided to..." → Result: "This resulted in..."',
        };

      case 'technical':
        return {
          type: 'structure',
          priority: 'high',
          title: 'Structure Technical Response',
          message:
            'Break down your technical answer into clear, logical components.',
          actionableAdvice:
            'Start with understanding the problem, then explain your approach step by step.',
          framework: 'Problem-Solution-Example',
          example:
            'First clarify requirements → Explain your solution approach → Provide a specific example',
        };

      case 'situational':
        return {
          type: 'structure',
          priority: 'high',
          title: 'Think-Explain-Act Framework',
          message: 'Show your thought process for hypothetical scenarios.',
          actionableAdvice:
            'Think through the scenario, explain your reasoning, then describe your action plan.',
          framework: 'Think-Explain-Act',
        };

      default:
        return {
          type: 'structure',
          priority: 'medium',
          title: 'Clear Structure',
          message:
            'Organize your response with a clear beginning, middle, and end.',
          actionableAdvice:
            'Start with a brief overview, provide details, then conclude with key takeaways.',
        };
    }
  }

  private generateContentInsight(
    context: QuestionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userProfile: any,
  ): CoachingInsight {
    // This would use actual user profile data in production
    const mockExperiences = {
      frontend: 'your React e-commerce project',
      backend: 'your Node.js API development',
      leadership: 'your team lead experience',
      'problem-solving': 'your debugging and optimization work',
    };

    const relevantExperience =
      mockExperiences[context.category] || 'your relevant project experience';

    return {
      type: 'content',
      priority: 'high',
      title: 'Leverage Your Experience',
      message: `This question is perfect for discussing ${relevantExperience}.`,
      actionableAdvice: `Mention specific details, technologies used, and measurable outcomes.`,
      example: `"In ${relevantExperience}, I successfully..."`,
    };
  }

  private generateDeliveryInsights(speechMetrics: any): CoachingInsight[] {
    const insights: CoachingInsight[] = [];

    // Pace coaching
    if (speechMetrics.wordsPerMinute > 180) {
      insights.push({
        type: 'delivery',
        priority: 'high',
        title: 'Slow Down Your Pace',
        message: `You're speaking at ${speechMetrics.wordsPerMinute} WPM - too fast for optimal comprehension.`,
        actionableAdvice:
          'Take deliberate pauses between sentences. Aim for 140-160 WPM.',
      });
    } else if (speechMetrics.wordsPerMinute < 120) {
      insights.push({
        type: 'delivery',
        priority: 'medium',
        title: 'Increase Your Pace',
        message: `Your pace of ${speechMetrics.wordsPerMinute} WPM is slower than optimal.`,
        actionableAdvice:
          'Speak with more energy and confidence. Aim for 140-160 WPM.',
      });
    }

    // Confidence coaching
    if (speechMetrics.confidenceLevel < 60) {
      insights.push({
        type: 'confidence',
        priority: 'high',
        title: 'Project More Confidence',
        message:
          'Your speech patterns suggest hesitation. Interviewers notice confidence levels.',
        actionableAdvice:
          'Use definitive language, avoid hedge words like "maybe" or "I think".',
      });
    }

    // Clarity coaching
    if (speechMetrics.clarityScore < 70) {
      insights.push({
        type: 'delivery',
        priority: 'medium',
        title: 'Improve Speech Clarity',
        message: 'Focus on clearer articulation for better understanding.',
        actionableAdvice: 'Enunciate key words and avoid filler words.',
      });
    }

    return insights;
  }

  private generateTimingInsight(
    context: QuestionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentAnswer?: string,
  ): CoachingInsight {
    const optimalDurations = {
      behavioral: '2-3 minutes',
      technical: '3-4 minutes',
      situational: '2 minutes',
      general: '1-2 minutes',
    };

    return {
      type: 'timing',
      priority: 'medium',
      title: 'Optimal Response Length',
      message: `For ${context.type} questions, aim for ${optimalDurations[context.type]}.`,
      actionableAdvice: 'Be comprehensive but concise. Quality over quantity.',
    };
  }

  private async generatePersonalizedTips(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: QuestionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userProfile: any,
  ): Promise<string[]> {
    // In production, this would analyze user's past performance and generate personalized tips
    const genericTips = [
      'Start strong with confidence',
      'Use specific examples with metrics',
      'Conclude with lessons learned',
      'Maintain good eye contact',
      'Speak at a steady, measured pace',
    ];

    return genericTips.slice(0, 3);
  }

  private selectOptimalFramework(context: QuestionContext): string {
    const frameworks = {
      behavioral: 'STAR (Situation, Task, Action, Result)',
      technical: 'Problem-Solution-Example',
      situational: 'Think-Explain-Act',
      general: 'Introduction-Body-Conclusion',
    };

    return frameworks[context.type] || frameworks['general'];
  }

  private estimateOptimalDuration(context: QuestionContext): string {
    const durations = {
      behavioral: '2-3 minutes',
      technical: '3-4 minutes',
      situational: '1-2 minutes',
      general: '1-2 minutes',
    };

    return durations[context.type] || '1-2 minutes';
  }

  private getPriorityWeight(priority: 'high' | 'medium' | 'low'): number {
    return { high: 3, medium: 2, low: 1 }[priority];
  }

  // Real-time coaching during speech
  async generateLiveCoaching(
    speechMetrics: any,
    questionContext: QuestionContext,
    speakingDuration: number,
  ): Promise<CoachingInsight[]> {
    const liveInsights: CoachingInsight[] = [];

    // Real-time pace adjustment
    if (speechMetrics.currentWPM > 200) {
      liveInsights.push({
        type: 'delivery',
        priority: 'high',
        title: '⚡ Slow Down',
        message: `Current pace: ${speechMetrics.currentWPM} WPM`,
        actionableAdvice: 'Take a breath and slow down to 150 WPM',
      });
    }

    // Duration warning
    const maxDuration = questionContext.type === 'technical' ? 240 : 180; // seconds
    if (speakingDuration > maxDuration) {
      liveInsights.push({
        type: 'timing',
        priority: 'high',
        title: '⏰ Wrap Up Soon',
        message: `You've been speaking for ${Math.floor(speakingDuration / 60)} minutes`,
        actionableAdvice: 'Summarize your key points and conclude',
      });
    }

    // Confidence booster
    if (speechMetrics.confidenceLevel > 80 && speechMetrics.clarityScore > 75) {
      liveInsights.push({
        type: 'confidence',
        priority: 'low',
        title: '🎯 Great Delivery!',
        message: 'Excellent pace and clarity',
        actionableAdvice: 'Maintain this energy level',
      });
    }

    return liveInsights;
  }
}
