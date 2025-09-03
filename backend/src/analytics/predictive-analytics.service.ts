import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PredictiveInsights {
  // Current Status
  currentPerformance: {
    overallScore: number;
    confidenceLevel: number;
    clarityScore: number;
    speakingPace: number;
  };

  // Predictions
  predictions: {
    nextSessionScore: number;
    weeklyImprovement: number;
    targetAchievementDate: string;
    interviewReadiness: number;
  };
  userState: 'new_user' | 'insufficient_data' | 'ready_for_predictions';
  // Trends
  trends: {
    improvementVelocity: 'accelerating' | 'steady' | 'slowing' | 'declining';
    strongestSkill: string;
    improvementArea: string;
    consistencyScore: number;
  };

  // Recommendations
  recommendations: {
    focusAreas: string[];
    practiceFrequency: string;
    nextMilestone: string;
    confidenceBooster: string;
  };
}

@Injectable()
export class PredictiveAnalyticsService {
  constructor(private prisma: PrismaService) {}

  // async generatePredictiveInsights(
  //   userId: string,
  // ): Promise<PredictiveInsights> {
  //   // Get user's speech analysis history (last 30 days)
  //   const speechHistory = await this.prisma.speechAnalysis.findMany({
  //     where: {
  //       userId,
  //       createdAt: {
  //         gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
  //       },
  //     },
  //     orderBy: { createdAt: 'asc' },
  //     include: {
  //       session: {
  //         select: {
  //           id: true,
  //           createdAt: true,
  //         },
  //       },
  //     },
  //   });

  //   if (speechHistory.length < 2) {
  //     return this.getDefaultInsights();
  //   }

  //   // Calculate current performance
  //   const currentPerformance = this.calculateCurrentPerformance(speechHistory);

  //   // Generate predictions
  //   const predictions = this.generatePredictions(speechHistory);

  //   // Analyze trends
  //   const trends = this.analyzeTrends(speechHistory);

  //   // Generate recommendations
  //   const recommendations = this.generateRecommendations(speechHistory, trends);

  //   return {
  //     currentPerformance,
  //     predictions,
  //     trends,
  //     recommendations,
  //   };
  // }
  async generatePredictiveInsights(
    userId: string,
  ): Promise<PredictiveInsights> {
    const speechHistory = await this.prisma.speechAnalysis.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        session: {
          select: { id: true, createdAt: true },
        },
      },
    });

    // ✅ FIXED: Better user state detection
    if (speechHistory.length === 0) {
      return this.getNewUserInsights();
    }

    if (speechHistory.length < 3) {
      return this.getInsufficientDataInsights(speechHistory);
    }

    // Only generate full predictions for users with sufficient data
    return this.getFullPredictiveInsights(speechHistory);
  }

  // ✅ NEW: For completely new users
  private getNewUserInsights(): PredictiveInsights {
    return {
      currentPerformance: {
        overallScore: 0,
        confidenceLevel: 0,
        clarityScore: 0,
        speakingPace: 0,
      },
      predictions: {
        nextSessionScore: null, // ← No prediction for new users
        weeklyImprovement: null, // ← No improvement data yet
        targetAchievementDate:
          'Take your first interview to get personalized predictions',
        interviewReadiness: 0,
      },
      trends: {
        improvementVelocity: 'steady',
        strongestSkill: 'Take interviews to discover your strengths',
        improvementArea: 'Complete sessions to identify areas for growth',
        consistencyScore: 0,
      },
      recommendations: {
        focusAreas: ['Take your first mock interview to get started'],
        practiceFrequency: 'Start with 1-2 interviews this week',
        nextMilestone: 'Complete your first interview session',
        confidenceBooster:
          "Remember: everyone starts somewhere. You've got this!",
      },
      userState: 'new_user',
    };
  }

  // ✅ NEW: For users with 1-2 interviews (insufficient for good predictions)
  private getInsufficientDataInsights(history: any[]): PredictiveInsights {
    const latest = history[history.length - 1];

    return {
      currentPerformance: {
        overallScore: latest?.overallScore || 0,
        confidenceLevel: latest?.metrics?.confidenceLevel || 0,
        clarityScore: latest?.metrics?.clarityScore || 0,
        speakingPace: latest?.metrics?.wordsPerMinute || 0,
      },
      predictions: {
        nextSessionScore: null, // ← Still not enough data
        weeklyImprovement: null,
        targetAchievementDate: `Take ${3 - history.length} more interview${3 - history.length > 1 ? 's' : ''} for accurate predictions`,
        interviewReadiness: Math.round((latest?.overallScore || 0) * 0.8), // Conservative estimate
      },
      trends: {
        improvementVelocity: 'steady',
        strongestSkill:
          history.length > 0
            ? this.identifyTopSkill(latest)
            : 'Complete more sessions',
        improvementArea:
          history.length > 0
            ? this.identifyWeakSkill(latest)
            : 'Complete more sessions',
        consistencyScore: 0,
      },
      recommendations: {
        focusAreas: this.getEarlyRecommendations(latest),
        practiceFrequency: '2-3 sessions this week to build momentum',
        nextMilestone: `${3 - history.length} more sessions for detailed analytics`,
        confidenceBooster:
          'Great start! Keep practicing to unlock detailed insights.',
      },
      userState: 'insufficient_data',
    };
  }

  // ✅ EXISTING: For users with sufficient data (3+ interviews)
  private getFullPredictiveInsights(history: any[]): PredictiveInsights {
    // Your existing full implementation
    const currentPerformance = this.calculateCurrentPerformance(history);
    const predictions = this.generatePredictions(history);
    const trends = this.analyzeTrends(history);
    const recommendations = this.generateRecommendations(history, trends);

    return {
      currentPerformance,
      predictions,
      trends,
      recommendations,
      userState: 'ready_for_predictions',
    };
  }

  // ✅ Helper methods for early-stage users
  private identifyTopSkill(analysis: any): string {
    const metrics = analysis.metrics;
    const skills = {
      'Speaking Confidence': metrics.confidenceLevel || 0,
      'Speech Clarity': metrics.clarityScore || 0,
      'Pace Control': this.scorePaceControl(metrics.wordsPerMinute || 120),
    };

    return Object.entries(skills).reduce((a, b) =>
      skills[a[0]] > skills[b[0]] ? a : b,
    )[0];
  }

  private identifyWeakSkill(analysis: any): string {
    const metrics = analysis.metrics;
    const skills = {
      'Speaking Confidence': metrics.confidenceLevel || 0,
      'Speech Clarity': metrics.clarityScore || 0,
      'Pace Control': this.scorePaceControl(metrics.wordsPerMinute || 120),
    };

    return Object.entries(skills).reduce((a, b) =>
      skills[a[0]] < skills[b[0]] ? a : b,
    )[0];
  }

  private getEarlyRecommendations(latest: any): string[] {
    if (!latest) return ['Take your first mock interview'];

    const recommendations = [];
    const metrics = latest.metrics;

    if (metrics.confidenceLevel < 60)
      recommendations.push('Build Speaking Confidence');
    if (metrics.clarityScore < 70)
      recommendations.push('Improve Speech Clarity');
    if (metrics.wordsPerMinute < 120 || metrics.wordsPerMinute > 180) {
      recommendations.push('Practice Speaking Pace');
    }

    return recommendations.length > 0
      ? recommendations
      : ['Continue practicing regularly'];
  }

  private calculateCurrentPerformance(history: any[]) {
    const recent = history.slice(-3); // Last 3 sessions

    return {
      overallScore: Math.round(
        recent.reduce((sum, h) => sum + h.overallScore, 0) / recent.length,
      ),
      confidenceLevel: Math.round(
        recent.reduce((sum, h) => sum + h.metrics.confidenceLevel, 0) /
          recent.length,
      ),
      clarityScore: Math.round(
        recent.reduce((sum, h) => sum + h.metrics.clarityScore, 0) /
          recent.length,
      ),
      speakingPace: Math.round(
        recent.reduce((sum, h) => sum + h.metrics.wordsPerMinute, 0) /
          recent.length,
      ),
    };
  }

  private generatePredictions(history: any[]) {
    const scores = history.map((h) => h.overallScore);
    const confidenceScores = history.map((h) => h.metrics.confidenceLevel);
    console.log('confidenceScores for prediction:', confidenceScores);
    // Simple linear regression for next session prediction
    const nextSessionScore = this.predictNextScore(scores);

    // Weekly improvement calculation
    const weeklyImprovement = this.calculateWeeklyImprovement(history);

    // Target achievement prediction
    const targetAchievementDate = this.predictTargetAchievement(history);

    // Interview readiness score
    const interviewReadiness = this.calculateInterviewReadiness(history);

    return {
      nextSessionScore: Math.max(0, Math.min(100, nextSessionScore)),
      weeklyImprovement,
      targetAchievementDate,
      interviewReadiness,
    };
  }

  private predictNextScore(scores: number[]): number {
    if (scores.length < 3) return scores[scores.length - 1] + 2;

    // Simple trend-based prediction
    const recent5 = scores.slice(-5);
    const trend =
      recent5.reduce((sum, score, index) => {
        return sum + score * (index + 1);
      }, 0) / recent5.reduce((sum, _, index) => sum + (index + 1), 0);

    const latestScore = scores[scores.length - 1];
    const improvement = trend - latestScore;

    return Math.round(latestScore + improvement * 1.2); // Slight optimistic bias
  }

  private calculateWeeklyImprovement(history: any[]): number {
    if (history.length < 4) return 0;

    const thisWeek = history.filter(
      (h) =>
        new Date(h.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    );
    const lastWeek = history.filter((h) => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      return (
        new Date(h.createdAt) > twoWeeksAgo && new Date(h.createdAt) <= weekAgo
      );
    });

    if (thisWeek.length === 0 || lastWeek.length === 0) return 0;

    const thisWeekAvg =
      thisWeek.reduce((sum, h) => sum + h.overallScore, 0) / thisWeek.length;
    const lastWeekAvg =
      lastWeek.reduce((sum, h) => sum + h.overallScore, 0) / lastWeek.length;

    return Math.round(thisWeekAvg - lastWeekAvg);
  }

  private predictTargetAchievement(history: any[]): string {
    const currentAvg =
      history.slice(-3).reduce((sum, h) => sum + h.overallScore, 0) / 3;
    const target = 85; // Target interview readiness score

    if (currentAvg >= target) {
      return 'Target achieved!';
    }

    const improvement = this.calculateWeeklyImprovement(history) || 3;
    const sessionsNeeded = Math.ceil((target - currentAvg) / (improvement / 3)); // Assuming 3 sessions per week

    const daysNeeded = Math.ceil((sessionsNeeded / 3) * 7);
    const targetDate = new Date(Date.now() + daysNeeded * 24 * 60 * 60 * 1000);

    return targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private calculateInterviewReadiness(history: any[]): number {
    const recent = history.slice(-5);
    if (recent.length === 0) return 0;

    const avgScore =
      recent.reduce((sum, h) => sum + h.overallScore, 0) / recent.length;
    const consistency = this.calculateConsistency(
      recent.map((h) => h.overallScore),
    );
    const improvement = this.calculateWeeklyImprovement(history);

    // Weighted readiness calculation
    let readiness = avgScore * 0.6; // 60% current performance
    readiness += consistency * 0.3; // 30% consistency
    readiness += Math.max(0, improvement) * 0.1; // 10% improvement trend

    return Math.round(Math.max(0, Math.min(100, readiness)));
  }

  private analyzeTrends(history: any[]) {
    const scores = history.map((h) => h.overallScore);
    const confidenceScores = history.map((h) => h.metrics.confidenceLevel);
    const clarityScores = history.map((h) => h.metrics.clarityScore);
    const paceScores = history.map((h) => h.metrics.wordsPerMinute);

    // Calculate improvement velocity
    const improvementVelocity = this.calculateImprovementVelocity(scores);

    // Find strongest skill
    const skillScores = {
      Confidence: confidenceScores[confidenceScores.length - 1] || 0,
      Clarity: clarityScores[clarityScores.length - 1] || 0,
      'Pace Control': this.scorePaceControl(
        paceScores[paceScores.length - 1] || 120,
      ),
    };

    const strongestSkill = Object.entries(skillScores).reduce((a, b) =>
      skillScores[a[0]] > skillScores[b[0]] ? a : b,
    )[0];

    // Find improvement area
    const improvementArea = Object.entries(skillScores).reduce((a, b) =>
      skillScores[a[0]] < skillScores[b[0]] ? a : b,
    )[0];

    // Calculate consistency
    const consistencyScore = this.calculateConsistency(scores);

    return {
      improvementVelocity,
      strongestSkill,
      improvementArea,
      consistencyScore,
    };
  }

  private calculateImprovementVelocity(
    scores: number[],
  ): 'accelerating' | 'steady' | 'slowing' | 'declining' {
    if (scores.length < 6) return 'steady';

    const recent3 = scores.slice(-3);
    const previous3 = scores.slice(-6, -3);

    const recentImprovement = recent3[2] - recent3[0];
    const previousImprovement = previous3[2] - previous3[0];

    if (recentImprovement > previousImprovement + 3) return 'accelerating';
    if (recentImprovement < previousImprovement - 3) return 'slowing';
    if (recentImprovement < -2) return 'declining';
    return 'steady';
  }

  private scorePaceControl(wpm: number): number {
    // Optimal range: 140-160 WPM
    if (wpm >= 140 && wpm <= 160) return 100;
    if (wpm >= 120 && wpm < 140) return 85;
    if (wpm > 160 && wpm <= 180) return 85;
    if (wpm >= 100 && wpm < 120) return 70;
    if (wpm > 180 && wpm <= 200) return 70;
    return 50;
  }

  private calculateConsistency(scores: number[]): number {
    if (scores.length < 3) return 50;

    const mean = scores.reduce((a, b) => a + b) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    // Scale to 0-100 where 100 is perfect consistency
    return Math.round(Math.max(0, Math.min(100, 100 - standardDeviation * 2)));
  }

  private generateRecommendations(history: any[], trends: any) {
    const focusAreas = [];
    let practiceFrequency = '3-4 times per week';
    let nextMilestone = 'Reach 80% consistency';
    let confidenceBooster = 'Practice power poses before sessions';

    // Focus areas based on performance
    const latest = history[history.length - 1];
    if (latest.metrics.confidenceLevel < 70) {
      focusAreas.push('Build Speaking Confidence');
      confidenceBooster = 'Record yourself speaking for 2 minutes daily';
    }
    if (latest.metrics.clarityScore < 75) {
      focusAreas.push('Improve Speech Clarity');
    }
    if (
      latest.metrics.wordsPerMinute < 120 ||
      latest.metrics.wordsPerMinute > 180
    ) {
      focusAreas.push('Optimize Speaking Pace');
    }

    // Adjust practice frequency based on improvement velocity
    if (trends.improvementVelocity === 'accelerating') {
      practiceFrequency = "4-5 times per week (you're on a roll!)";
      nextMilestone = 'Target 90%+ interview readiness';
    } else if (trends.improvementVelocity === 'slowing') {
      practiceFrequency = '2-3 shorter, focused sessions';
      nextMilestone = 'Regain momentum with small wins';
    }

    // Default focus areas if none identified
    if (focusAreas.length === 0) {
      focusAreas.push('Maintain Current Excellence');
    }

    return {
      focusAreas,
      practiceFrequency,
      nextMilestone,
      confidenceBooster,
    };
  }

  // private getDefaultInsights(): PredictiveInsights {
  //   return {
  //     currentPerformance: {
  //       overallScore: 0,
  //       confidenceLevel: 0,
  //       clarityScore: 0,
  //       speakingPace: 0,
  //     },
  //     predictions: {
  //       nextSessionScore: 65,
  //       weeklyImprovement: 0,
  //       targetAchievementDate: 'Complete 3 sessions to get predictions',
  //       interviewReadiness: 0,
  //     },
  //     trends: {
  //       improvementVelocity: 'steady',
  //       strongestSkill: 'To be determined',
  //       improvementArea: 'To be determined',
  //       consistencyScore: 0,
  //     },
  //     recommendations: {
  //       focusAreas: ['Complete your first interview session'],
  //       practiceFrequency: '3-4 times per week',
  //       nextMilestone: 'Complete your first analysis',
  //       confidenceBooster: 'Take your time and speak naturally',
  //     },
  //   };
  // }
}
