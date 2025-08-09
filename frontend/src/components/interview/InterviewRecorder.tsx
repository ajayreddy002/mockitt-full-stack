import React, { useState, useRef, useEffect } from 'react';
import { Video, Mic, Square, Play } from 'lucide-react';
import { useInterview, useUI } from '../../store';

interface InterviewRecorderProps {
  sessionId: string;
  questionId: string;
  settings: {
    recordVideo: boolean;
    recordAudio: boolean;
  };
  onTranscriptionUpdate?: (transcription: string) => void;
}

export const InterviewRecorder: React.FC<InterviewRecorderProps> = ({
  sessionId,
  questionId,
  settings,
  // onTranscriptionUpdate
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  
  const { recordResponse } = useInterview();
  const { addNotification } = useUI();

  useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeCamera = async () => {
    try {
      const constraints = {
        video: settings.recordVideo,
        audio: settings.recordAudio,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      addNotification({
        type: 'error',
        title: 'Camera Access Denied',
        message: 'Please allow camera and microphone access to record your interview responses.'
      });
    }
  };

  const startRecording = () => {
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setRecordedBlob(blob);
      const responseData = {
        audioUrl: URL.createObjectURL(blob),
        videoUrl: settings.recordVideo ? URL.createObjectURL(blob) : undefined,
        duration: recordingDuration,
        sessionId,
        questionId,
        question: '',
      }
      // Save response to store
      recordResponse(responseData);

      addNotification({
        type: 'success',
        title: 'Response Recorded',
        message: 'Your answer has been recorded successfully!'
      });
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);

    // Start duration timer
    const startTime = Date.now();
    const timer = setInterval(() => {
      if (!isRecording) {
        clearInterval(timer);
        return;
      }
      setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

   
  // const handleSpeechResult = (transcription: string) => {
  //   if (onTranscriptionUpdate) {
  //     onTranscriptionUpdate(transcription);
  //   }
  // };

  if (!hasPermission) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Camera Access Required</h3>
          <p className="text-gray-600 mb-4">
            Please allow camera and microphone access to record your responses.
          </p>
          <button
            onClick={initializeCamera}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enable Camera
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="space-y-4">
        {/* Video Preview */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-64 object-cover"
          />
          
          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center bg-red-600 text-white px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium">REC {formatDuration(recordingDuration)}</span>
            </div>
          )}

          {/* Settings Indicators */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            {settings.recordVideo && (
              <div className="bg-black bg-opacity-50 p-2 rounded-full">
                <Video className="h-4 w-4 text-white" />
              </div>
            )}
            {settings.recordAudio && (
              <div className="bg-black bg-opacity-50 p-2 rounded-full">
                <Mic className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop Recording
            </button>
          )}
        </div>

        {/* Recording Status */}
        {recordedBlob && (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800 font-medium">
              ✓ Response recorded ({formatDuration(recordingDuration)})
            </div>
            <p className="text-green-600 text-sm mt-1">
              Your answer has been saved. You can re-record if needed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
