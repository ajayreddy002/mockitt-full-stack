import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId: string) {
    // Parallel queries for better performance[25]
    const [resumeCount, interviewCount, courseCount] = await Promise.all([
      this.prisma.resume.count({ where: { userId } }),
      this.prisma.interviewSession.count({ where: { userId } }),
      // this.prisma.courseEnrollment.count({
      //   where: { userId, completed: true },
      // }),
      0, // Placeholder for course count
      this.prisma.user.findUnique({ where: { id: userId } }),
    ]);

    // Calculate career readiness based on activities
    // const careerReadiness = Math.min(
    //   100,
    //   resumeCount * 15 + interviewCount * 20 + courseCount * 25 + 25,
    // );
    const careerReadiness = Math.min(
      100,
      resumeCount * 15 + interviewCount * 20 + courseCount * 25 + 25,
    );

    return {
      resumesAnalyzed: resumeCount,
      mockInterviews: interviewCount,
      coursesCompleted: courseCount,
      careerReadiness: Math.round(careerReadiness),
      resumeAnalysisChange: this.calculatePercentageChange(
        resumeCount,
        'resume',
        userId,
      ),
      interviewChange: this.calculatePercentageChange(
        interviewCount,
        'interview',
        userId,
      ),
      coursesChange: this.calculatePercentageChange(
        courseCount,
        'course',
        userId,
      ),
      readinessChange: '+5%', // Calculate based on historical data
    };
  }

  async getRecentActivity(userId: string, limit: number = 10) {
    // Get recent activities from multiple sources
    const [recentSessions, recentResumes, recentCourses] = await Promise.all([
      this.prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          type: true,
          createdAt: true,
          status: true,
        },
      }),
      this.prisma.resume.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          fileName: true,
          createdAt: true,
          analysisScore: true,
        },
      }),
      [
        {
          title: 'Placeholder Course',
          id: '1',
          updatedAt: new Date(),
          course: { title: 'Sample Course' },
        },
      ], // Placeholder for recent courses
      // this.prisma.courseEnrollment.findMany({
      //   where: { userId },
      //   orderBy: { updatedAt: 'desc' },
      //   take: 3,
      //   include: { course: { select: { title: true } } },
      // }),
    ]);

    const activities = [
      ...recentSessions.map((session) => ({
        id: session.id,
        action: `Completed ${session.type.replace('_', ' ').toLowerCase()} interview`,
        time: this.formatRelativeTime(session.createdAt),
        icon: 'CheckCircle',
        iconColor: 'text-green-500',
        type: 'session' as const,
      })),
      ...recentResumes.map((resume) => ({
        id: resume.id,
        action: `Analyzed resume: ${resume.fileName}`,
        time: this.formatRelativeTime(resume.createdAt),
        icon: 'FileText',
        iconColor: 'text-blue-500',
        type: 'resume' as const,
      })),
      ...recentCourses.map((course) => ({
        id: course.id,
        action: `Enrolled in course: ${course.course.title}`,
        time: this.formatRelativeTime(course.updatedAt),
        icon: 'BookOpen',
        iconColor: 'text-purple-500',
        type: 'course' as const,
      })),
    ];

    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit);
  }

  async getUserProgress(userId: string) {
    const totalTasks = 20; // Configurable based on user level
    const completedTasks = await this.calculateCompletedTasks(userId);
    const weeklyGoal = 5;
    const currentStreak = await this.calculateCurrentStreak(userId);

    const achievements = await this.getUserAchievements(userId);

    return {
      completedTasks,
      totalTasks,
      weeklyGoal,
      currentStreak,
      achievements,
    };
  }

  private async calculateCompletedTasks(userId: string): Promise<number> {
    const [resumes, interviews, courses] = await Promise.all([
      this.prisma.resume.count({ where: { userId } }),
      this.prisma.interviewSession.count({
        where: { userId, status: 'COMPLETED' },
      }),
      // this.prisma.courseEnrollment.count({
      //   where: { userId, completed: true },
      // }),
      0, // Placeholder for course count
    ]);

    return resumes + interviews + courses;
  }

  private async calculateCurrentStreak(userId: string): Promise<number> {
    // Calculate consecutive days of activity
    const activities = await this.prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    let streak = 0;
    let currentDate = new Date();

    for (const activity of activities) {
      const activityDate = new Date(activity.createdAt);
      const daysDiff = Math.floor(
        (currentDate.getTime() - activityDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = activityDate;
      } else {
        break;
      }
    }

    return streak;
  }

  private async getUserAchievements(userId: string) {
    // Define achievements based on user activities
    const achievements = [];

    const interviewCount = await this.prisma.interviewSession.count({
      where: { userId },
    });
    if (interviewCount >= 1) {
      achievements.push({
        id: 'first_interview',
        title: 'First Interview',
        description: 'Completed your first mock interview',
        earnedAt: new Date(),
        icon: '🎯',
      });
    }

    if (interviewCount >= 10) {
      achievements.push({
        id: 'interview_master',
        title: 'Interview Master',
        description: 'Completed 10 mock interviews',
        earnedAt: new Date(),
        icon: '🏆',
      });
    }

    return achievements;
  }

  private calculatePercentageChange(
    current: number,
    type: string,
    userId: string,
    previous: number = 0,
  ): string {
    if (previous === 0) {
      return current > 0 ? '+100%' : '+0%';
    }

    const percentageChange = Math.round(
      ((current - previous) / previous) * 100,
    );

    if (percentageChange > 0) {
      return `+${percentageChange}%`;
    } else if (percentageChange < 0) {
      return `${percentageChange}%`;
    } else {
      return '0%';
    }
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }
}
