import React from 'react';
import { Volume2, Lightbulb, Tag } from 'lucide-react';
import { type InterviewQuestion } from '../../types/interview';

interface QuestionDisplayProps {
  question: InterviewQuestion;
  questionNumber: number;
  totalQuestions: number;
  showHints: boolean;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionNumber,
  totalQuestions,
  showHints
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'behavioral': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'situational': return 'bg-indigo-100 text-indigo-800';
      case 'company-specific': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const speakQuestion = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(question.question);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Question {questionNumber} of {totalQuestions}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
            {question.type}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
        </div>
        
        <button
          onClick={speakQuestion}
          className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Listen to question"
        >
          <Volume2 className="h-4 w-4 mr-2" />
          Listen
        </button>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Expected Duration */}
      <div className="flex items-center text-sm text-gray-600 mb-6">
        <span className="bg-gray-100 px-3 py-1 rounded-full">
          Suggested time: {Math.floor(question.expectedDuration / 60)} minutes
        </span>
      </div>

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 mb-6">
          <Tag className="h-4 w-4 text-gray-400" />
          {question.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Hints Section */}
      {showHints && question.hints && question.hints.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center mb-3">
            <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Helpful Hints</h3>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <ul className="space-y-2">
              {question.hints.map((hint, index) => (
                <li key={index} className="flex items-start text-sm text-yellow-800">
                  <span className="text-yellow-500 mr-2 flex-shrink-0">•</span>
                  {hint}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
