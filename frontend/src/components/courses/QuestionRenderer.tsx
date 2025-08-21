/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

interface QuestionRendererProps {
  question: {
    id: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'SHORT_ANSWER';
    options?: string[];
    points: number;
  };
  answer: any;
  onAnswerChange: (answer: any) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answer,
  onAnswerChange,
}) => {
  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question.options?.map((option, index) => (
        <label
          key={index}
          className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <input
            type="radio"
            name={question.id}
            value={option}
            checked={answer === option}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="ml-3 text-gray-900">{option}</span>
        </label>
      ))}
    </div>
  );

  const renderMultipleSelect = () => (
    <div className="space-y-3">
      {question.options?.map((option, index) => (
        <label
          key={index}
          className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <input
            type="checkbox"
            value={option}
            checked={Array.isArray(answer) && answer.includes(option)}
            onChange={(e) => {
              const currentAnswers = Array.isArray(answer) ? answer : [];
              if (e.target.checked) {
                onAnswerChange([...currentAnswers, option]);
              } else {
                onAnswerChange(currentAnswers.filter((a: string) => a !== option));
              }
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-3 text-gray-900">{option}</span>
        </label>
      ))}
    </div>
  );

  const renderTrueFalse = () => (
    <div className="space-y-3">
      {['True', 'False'].map((option) => (
        <label
          key={option}
          className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <input
            type="radio"
            name={question.id}
            value={option}
            checked={answer === option}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="ml-3 text-gray-900">{option}</span>
        </label>
      ))}
    </div>
  );

  const renderShortAnswer = () => (
    <textarea
      value={answer || ''}
      onChange={(e) => onAnswerChange(e.target.value)}
      placeholder="Enter your answer here..."
      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      rows={4}
    />
  );

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {question.text}
        </h2>
        <div className="flex items-center text-sm text-gray-600">
          <span>Points: {question.points}</span>
          <span className="mx-2">•</span>
          <span className="capitalize">{question.type.replace('_', ' ').toLowerCase()}</span>
        </div>
      </div>

      {/* Answer Input */}
      <div>
        {question.type === 'MULTIPLE_CHOICE' && renderMultipleChoice()}
        {question.type === 'MULTIPLE_SELECT' && renderMultipleSelect()}
        {question.type === 'TRUE_FALSE' && renderTrueFalse()}
        {question.type === 'SHORT_ANSWER' && renderShortAnswer()}
      </div>
    </div>
  );
};
