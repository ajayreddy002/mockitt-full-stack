import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useResumes, useUI } from '../../store';
import 'react-circular-progressbar/dist/styles.css';

interface ResumeUploadProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUploadComplete: (resumeData: any) => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadComplete }) => {
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const { uploadResume } = useResumes();
  const { addNotification } = useUI();

  // ✅ FIXED: Wrap handleUpload in useCallback with proper dependencies
  const handleUpload = useCallback(async (file: File) => {
    try {
      const result = await uploadResume(file, autoAnalyze);
      addNotification({
        type: 'success',
        title: 'Upload Complete',
        message: `${file.name} has been uploaded successfully!`,
      });
      onUploadComplete(result);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: `Failed to upload ${file.name}. Please try again.`,
      });
    }
  }, [uploadResume, autoAnalyze, addNotification, onUploadComplete]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      handleUpload(file);
    });
  }, [handleUpload]); // Now handleUpload has stable reference

  // Auto-Analysis Toggle
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  return (
    <div className="space-y-6">
      {/* Auto-Analysis Toggle */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center">
          <input
            id="auto-analyze"
            type="checkbox"
            checked={autoAnalyze}
            onChange={(e) => setAutoAnalyze(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="auto-analyze" className="ml-3 block text-sm font-medium text-gray-700">
            Auto-analyze resumes after upload
          </label>
        </div>
        <div className="text-xs text-gray-500">
          {autoAnalyze ? 'Analysis will start immediately' : 'Manual analysis required'}
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-lg text-blue-600">Drop your resume files here...</p>
        ) : (
          <div>
            <p className="text-lg text-gray-600 mb-2">
              Drag & drop your resume files here, or{' '}
              <span className="text-blue-600 font-medium">browse</span>
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, DOCX files up to 10MB each
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
