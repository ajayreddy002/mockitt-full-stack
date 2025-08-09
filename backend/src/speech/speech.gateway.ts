import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SpeechAnalysisService } from './speech-analysis.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/speech-analysis',
})
export class SpeechGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SpeechGateway.name);

  constructor(private speechAnalysisService: SpeechAnalysisService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('audio-chunk')
  async handleAudioChunk(
    @MessageBody()
    data: {
      audioData: string;
      sessionId: string;
      timestamp: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Process audio chunk with speech-to-text
      const transcription =
        await this.speechAnalysisService.transcribeAudioChunk(data.audioData);

      if (transcription) {
        // Send transcription update to client
        client.emit('transcription-update', { text: transcription });

        // Perform real-time speech analysis
        const analysis = await this.speechAnalysisService.analyzeTranscription(
          transcription,
          data.sessionId,
        );

        // Send analysis results to client
        client.emit('speech-analysis', analysis);
      }
    } catch (error) {
      this.logger.error(`Audio processing failed: ${error.message}`);
      client.emit('analysis-error', { message: 'Speech analysis failed' });
    }
  }

  @SubscribeMessage('start-session')
  async handleStartSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Initialize session for real-time analysis
    await this.speechAnalysisService.initializeSession(data.sessionId);
    client.emit('session-started', { sessionId: data.sessionId });
  }

  @SubscribeMessage('end-session')
  async handleEndSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Finalize session analysis
    const finalAnalysis = await this.speechAnalysisService.finalizeSession(
      data.sessionId,
    );
    client.emit('session-ended', { analysis: finalAnalysis });
  }
}
