/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useInterview, useUI } from '../../store';

interface SpeechMetrics {
  pace: number;
  clarity: number;
  confidence: number;
  fillerWords: number;
  volume: number;
  suggestions: string[];
}

export const RealTimeSpeechAnalyzer: React.FC = () => {
  const { generateRealTimeAnalysis, currentSession } = useInterview();
  const { addNotification } = useUI();

  // State management
  const [liveMetrics, setLiveMetrics] = useState<SpeechMetrics>({
    pace: 0,
    clarity: 0,
    confidence: 0,
    fillerWords: 0,
    volume: 0,
    suggestions: []
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [lastProcessedTranscription, setLastProcessedTranscription] = useState('');

  // Audio processing refs
  // const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);

  // ✅ Initialize Web Speech API for real-time transcription
  const initializeSpeechRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript + interimTranscript;
        setCurrentTranscription(fullTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      return true;
    }
    return false;
  }, []);

  // ✅ Start real-time analysis with both audio recording and speech recognition
  const startAnalysis = async () => {
    try {
      // Initialize speech recognition
      const speechSupported = initializeSpeechRecognition();
      if (!speechSupported) {
        addNotification({
          type: 'error',
          title: 'Speech Recognition Not Supported',
          message: 'Your browser does not support speech recognition.'
        });
        return;
      }

      // Get audio stream for volume analysis
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Set up audio context for volume monitoring
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      source.connect(analyzerRef.current);

      // Start speech recognition
      recognitionRef.current?.start();

      setIsAnalyzing(true);
      monitorAudioVolume();

      addNotification({
        type: 'success',
        title: 'Real-Time Analysis Started',
        message: 'AI is now providing live coaching feedback!'
      });

    } catch (error) {
      console.error('Failed to start real-time analysis:', error);
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: 'Could not start real-time speech analysis. Please check microphone permissions.'
      });
    }
  };

  // ✅ Stop analysis
  const stopAnalysis = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsAnalyzing(false);
    setCurrentTranscription('');
    setLastProcessedTranscription('');
  };

  // ✅ Monitor audio volume levels
  const monitorAudioVolume = () => {
    if (!analyzerRef.current || !isAnalyzing) return;

    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkVolume = () => {
      if (!isAnalyzing) return;

      analyzerRef.current!.getByteFrequencyData(dataArray);
      
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const average = sum / bufferLength;
      const volume = Math.round((average / 255) * 100);

      setLiveMetrics(prev => ({ ...prev, volume }));
      
      requestAnimationFrame(checkVolume);
    };

    checkVolume();
  };

  // ✅ Process transcription with backend AI analysis
  const processTranscription = useCallback(async (transcription: string) => {
    if (!transcription || transcription.length < 20 || !currentSession) return;

    try {
      const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
      
      // Call your backend AI analysis
      const analysis = await generateRealTimeAnalysis(transcription, currentQuestion.id);
      
      if (analysis && analysis.data) {
        setLiveMetrics(prev => ({
          ...prev,
          pace: analysis.data.pace || prev.pace,
          clarity: analysis.data.clarity || prev.clarity,
          confidence: analysis.data.confidence || prev.confidence,
          fillerWords: analysis.data.fillerWords || prev.fillerWords,
          suggestions: analysis.data.suggestions || []
        }));

        // Show coaching tips
        // if (analysis.data.suggestions && analysis.data.suggestions.length > 0) {
        //   addNotification({
        //     type: 'info',
        //     title: '💡 AI Coaching Tip',
        //     message: analysis.data.suggestions[0]
        //   });
        // }
      }
    } catch (error) {
      console.error('Real-time analysis failed:', error);
    }
  }, [generateRealTimeAnalysis, currentSession]);

  // ✅ Process transcription updates
  useEffect(() => {
    if (currentTranscription !== lastProcessedTranscription && currentTranscription.length > 0) {
      processTranscription(currentTranscription);
      setLastProcessedTranscription(currentTranscription);
    }
  }, [currentTranscription, lastProcessedTranscription, processTranscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          🎯 Live AI Speech Coaching
          {isAnalyzing && (
            <div className="ml-3 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="ml-2 text-sm text-red-600 font-medium">LIVE</span>
            </div>
          )}
        </h3>
        
        <button
          onClick={isAnalyzing ? stopAnalysis : startAnalysis}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isAnalyzing
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isAnalyzing ? 'Stop Analysis' : 'Start Analysis'}
        </button>
      </div>

      {/* Real-time metrics display */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <MetricCard title="Pace" value={liveMetrics.pace} unit="%" color="blue" />
        <MetricCard title="Clarity" value={liveMetrics.clarity} unit="%" color="green" />
        <MetricCard title="Confidence" value={liveMetrics.confidence} unit="%" color="purple" />
        <MetricCard title="Volume" value={liveMetrics.volume} unit="%" color="orange" />
        <MetricCard title="Fillers" value={liveMetrics.fillerWords} unit="" color="red" />
      </div>

      {/* Live transcription */}
      {currentTranscription && (
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">🎤 Live Transcription:</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{currentTranscription}</p>
        </div>
      )}

      {/* Instant AI suggestions */}
      {liveMetrics.suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
          <h4 className="font-medium text-green-900 mb-2 flex items-center">💡 AI Coaching Tip:</h4>
          <p className="text-green-800 text-sm">{liveMetrics.suggestions[0]}</p>
        </div>
      )}
    </div>
  );
};

// Metric display component
const MetricCard: React.FC<{
  title: string;
  value: number;
  unit: string;
  color: string;
}> = ({ title, value, unit, color }) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      red: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={`rounded-lg p-3 border ${getColorClasses(color)}`}>
      <div className="text-xs font-medium opacity-75 mb-1">{title}</div>
      <div className="text-lg font-bold">{value}{unit}</div>
    </div>
  );
};
