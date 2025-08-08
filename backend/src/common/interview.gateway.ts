import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AiService } from '../ai/ai.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class InterviewGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(InterviewGateway.name);

  constructor(private aiService: AiService) {}

  afterInit() {
    this.logger.log('Interview WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join-session')
  handleJoinSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`session-${data.sessionId}`);
    client.emit('joined-session', {
      sessionId: data.sessionId,
      status: 'connected',
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Client ${client.id} joined session ${data.sessionId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('real-time-transcription')
  async handleRealTimeTranscription(
    @MessageBody()
    data: {
      sessionId: string;
      transcription: string;
      context: {
        currentQuestion: string;
        targetRole: string;
        industry: string;
      };
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.debug(
        `Real-time transcription for session ${data.sessionId}`,
      );

      // Get real-time AI analysis
      const analysis = await this.aiService.analyzeResponseRealTime({
        spokenText: data.transcription,
        currentQuestion: data.context.currentQuestion,
        targetRole: data.context.targetRole,
        industry: data.context.industry,
      });

      // Send real-time coaching back to client
      client.emit('real-time-analysis', {
        ...analysis,
        sessionId: data.sessionId,
      });

      // Optionally broadcast to all clients in the session
      this.server.to(`session-${data.sessionId}`).emit('session-activity', {
        type: 'analysis-complete',
        sessionId: data.sessionId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Real-time analysis failed: ${error.message}`);
      client.emit('analysis-error', {
        message: 'Analysis failed. Please try again.',
        sessionId: data.sessionId,
      });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('request-coaching-tips')
  async handleCoachingTips(
    @MessageBody()
    data: {
      sessionId: string;
      currentResponse: string;
      context: any;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.debug(
        `Coaching tips requested for session ${data.sessionId}`,
      );

      const tips = await this.aiService.generateInstantCoachingTips({
        currentResponse: data.currentResponse,
        context: data.context,
      });

      client.emit('coaching-tips', {
        ...tips,
        sessionId: data.sessionId,
      });
    } catch (error) {
      this.logger.error(`Coaching tips generation failed: ${error.message}`);
      client.emit('coaching-error', {
        message: 'Tips generation failed. Please try again.',
        sessionId: data.sessionId,
      });
    }
  }

  @SubscribeMessage('leave-session')
  handleLeaveSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`session-${data.sessionId}`);
    this.logger.log(`Client ${client.id} left session ${data.sessionId}`);
  }
}
