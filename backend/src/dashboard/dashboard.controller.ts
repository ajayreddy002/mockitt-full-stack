import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get user dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats retrieved successfully',
  })
  async getDashboardStats(@Request() req) {
    const userId = req.user.id;
    return {
      success: true,
      data: await this.dashboardService.getUserStats(userId),
    };
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get user recent activity' })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
  })
  async getRecentActivity(@Request() req) {
    const userId = req.user.id;
    return {
      success: true,
      data: await this.dashboardService.getRecentActivity(userId, 10),
    };
  }

  @Get('user-progress')
  @ApiOperation({ summary: 'Get user progress and achievements' })
  @ApiResponse({
    status: 200,
    description: 'User progress retrieved successfully',
  })
  async getUserProgress(@Request() req) {
    const userId = req.user.id;
    return {
      success: true,
      data: await this.dashboardService.getUserProgress(userId),
    };
  }
}
