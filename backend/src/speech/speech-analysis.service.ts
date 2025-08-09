import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SpeechAnalysisService {
  private readonly logger = new Logger(SpeechAnalysisService.name);
  private readonly googleCloudKey: string;
  private sessionTranscriptions = new Map<string, string[]>();

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.googleCloudKey = this.configService.get('GOOGLE_CLOUD_API_KEY');
  }

  async transcribeAudioChunk(base64Audio: string): Promise<string> {
    try {
      // Use Google Speech-to-Text API for real-time transcription[52]
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${this.googleCloudKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS',
              sampleRateHertz: 16000,
              languageCode: 'en-US',
              enableAutomaticPunctuation: true,
              model: 'latest_long',
            },
            audio: {
              content: base64Audio,
            },
          }),
        },
      );

      const result = await response.json();
      return result.results?.[0]?.alternatives?.[0]?.transcript || '';
    } catch (error) {
      this.logger.error(`Transcription failed: ${error.message}`);
      return '';
    }
  }

  async analyzeTranscription(transcription: string, sessionId: string) {
    // Add to session transcript
    if (!this.sessionTranscriptions.has(sessionId)) {
      this.sessionTranscriptions.set(sessionId, []);
    }
    this.sessionTranscriptions.get(sessionId)!.push(transcription);

    const fullTranscript = this.sessionTranscriptions.get(sessionId)!.join(' ');

    // Analyze speech patterns
    const analysis = this.performSpeechAnalysis(fullTranscript);

    // Generate AI coaching suggestions
    const suggestions = await this.generateCoachingSuggestions(transcription);

    return {
      ...analysis,
      suggestions,
      timestamp: new Date().toISOString(),
    };
  }

  private performSpeechAnalysis(transcript: string) {
    const words = transcript.split(' ').filter((word) => word.length > 0);
    const wordCount = words.length;

    // Calculate speaking pace (assuming 1 word per 0.6 seconds average)
    const estimatedDuration = wordCount * 0.6; // seconds
    const wordsPerMinute = Math.round((wordCount / estimatedDuration) * 60);

    // Detect filler words[23]
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
    const fillerCount = fillerWords.reduce((count, filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      return count + (transcript.match(regex) || []).length;
    }, 0);

    // Calculate metrics
    const pace = Math.min(
      100,
      Math.max(0, 100 - Math.abs(wordsPerMinute - 150) * 2),
    );
    const clarity = Math.max(0, 100 - (fillerCount / wordCount) * 200);
    const confidence = Math.max(50, pace - fillerCount * 10);

    return {
      pace: Math.round(pace),
      clarity: Math.round(clarity),
      confidence: Math.round(confidence),
      fillerWords: fillerCount,
      wordsPerMinute,
    };
  }

  private async generateCoachingSuggestions(
    transcription: string,
  ): Promise<string[]> {
    // Use your existing AI service to generate coaching tips
    const suggestions = [];

    if (transcription.includes('um') || transcription.includes('uh')) {
      suggestions.push(
        'Try to reduce filler words for more confident delivery',
      );
    }

    if (transcription.split(' ').length < 10) {
      suggestions.push('Provide more detailed examples in your response');
    }

    return suggestions;
  }

  async initializeSession(sessionId: string) {
    this.sessionTranscriptions.set(sessionId, []);
  }

  async finalizeSession(sessionId: string) {
    const transcript =
      this.sessionTranscriptions.get(sessionId)?.join(' ') || '';
    const finalAnalysis = this.performSpeechAnalysis(transcript);

    // Store final results in database
    await this.prisma.speechAnalysisResult.create({
      data: {
        sessionId,
        fullTranscript: transcript,
        metrics: finalAnalysis,
        createdAt: new Date(),
      },
    });

    // Clean up session data
    this.sessionTranscriptions.delete(sessionId);

    return finalAnalysis;
  }
}
