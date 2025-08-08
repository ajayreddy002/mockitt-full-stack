/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Play, Square, RotateCcw } from 'lucide-react';

interface InterviewAnswerRecorderProps {
  sessionId: string;
  questionId: string;
  question: string;
  settings: {
    recordVideo: boolean;
    recordAudio: boolean;
    timePerQuestion: number;
  };
  onAnswerSaved: (responseData: any) => void;
}

export const InterviewAnswerRecorder: React.FC<InterviewAnswerRecorderProps> = ({
  sessionId,
  questionId,
  question,
  settings,
  onAnswerSaved
}) => {
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(settings.recordAudio);
  const [videoEnabled, setVideoEnabled] = useState(settings.recordVideo);

  // Transcription and response
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [answerMode, setAnswerMode] = useState<'record' | 'text'>('record');

  // Recording references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start recording
  const startRecording = async () => {
    try {
      const constraints = {
        audio: audioEnabled,
        video: videoEnabled
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current && videoEnabled) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;
      mediaRecorder.start();
      
      setIsRecording(true);
      startTimer();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Recording permission denied. Please enable microphone/camera access.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();

      // Stop all tracks
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  };

  // Handle recording completion
  const handleRecordingStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
    // Here you would typically:
    // 1. Upload the audio blob to your backend
    // 2. Get transcription from speech-to-text service
    // 3. Trigger AI analysis

    const responseData = {
      sessionId,
      questionId,
      question,
      audioBlob,
      transcription: currentTranscription,
      duration: recordingTime,
      answerType: 'audio'
    };

    onAnswerSaved(responseData);
  };

  // Timer functions
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Reset recording
  const resetRecording = () => {
    stopRecording();
    setRecordingTime(0);
    setCurrentTranscription('');
    audioChunksRef.current = [];
  };

  // Save written answer
  const saveWrittenAnswer = () => {
    if (writtenAnswer.trim()) {
      const responseData = {
        sessionId,
        questionId,
        question,
        transcription: writtenAnswer,
        duration: 0,
        answerType: 'text'
      };

      onAnswerSaved(responseData);
    }
  };

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      stopTimer();
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Your Answer</h3>
        
        {/* Answer Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setAnswerMode('record')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              answerMode === 'record'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎤 Record
          </button>
          <button
            onClick={() => setAnswerMode('text')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              answerMode === 'text'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✍️ Type
          </button>
        </div>
      </div>

      {answerMode === 'record' ? (
        <div className="space-y-6">
          {/* Video Preview */}
          {videoEnabled && (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                muted
                playsInline
              />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <p className="text-white text-lg">Click start to begin recording</p>
                </div>
              )}
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-6">
            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              disabled={isRecording}
              className={`p-3 rounded-full transition-all ${
                audioEnabled
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </button>

            {/* Video Toggle */}
            <button
              onClick={() => setVideoEnabled(!videoEnabled)}
              disabled={isRecording}
              className={`p-3 rounded-full transition-all ${
                videoEnabled
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </button>

            {/* Main Recording Button */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg"
              >
                <Play className="h-8 w-8" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors shadow-lg"
              >
                <Square className="h-8 w-8" />
              </button>
            )}

            {/* Reset Button */}
            <button
              onClick={resetRecording}
              disabled={isRecording}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="h-6 w-6" />
            </button>
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 font-medium">Recording: {formatTime(recordingTime)}</span>
              </div>
            </div>
          )}

          {/* Live Transcription */}
          {currentTranscription && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Live Transcription:</h4>
              <p className="text-blue-800 text-sm">{currentTranscription}</p>
            </div>
          )}
        </div>
      ) : (
        // Text Answer Mode
        <div className="space-y-4">
          <textarea
            value={writtenAnswer}
            onChange={(e) => setWrittenAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {writtenAnswer.length} characters • {writtenAnswer.split(' ').length} words
            </p>
            
            <button
              onClick={saveWrittenAnswer}
              disabled={!writtenAnswer.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium"
            >
              Save Answer
            </button>
          </div>
        </div>
      )}

      {/* Recommended Time */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Recommended time:</span>
          <span className="font-medium text-gray-900">
            {Math.floor(settings.timePerQuestion / 60)} minutes
          </span>
        </div>
      </div>
    </div>
  );
};
