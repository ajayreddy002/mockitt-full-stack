import React from 'react';
import { TrendingUp, Award, Target } from 'lucide-react';

interface ScoreProgressProps {
  currentScore: number;
  previousScore?: number;
  currentAtsScore: number;
  previousAtsScore?: number;
}

export const ScoreProgress: React.FC<ScoreProgressProps> = ({
  currentScore,
  previousScore,
  currentAtsScore,
  previousAtsScore
}) => {
  const scoreImprovement = previousScore ? currentScore - previousScore : 0;
  const atsImprovement = previousAtsScore ? currentAtsScore - previousAtsScore : 0;

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return 'text-green-600';
    if (improvement < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Progress Overview</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Overall Score</p>
            <p className="text-2xl font-bold text-gray-900">{currentScore}%</p>
            {previousScore && (
              <p className={`text-sm ${getImprovementColor(scoreImprovement)}`}>
                {scoreImprovement > 0 ? '+' : ''}{scoreImprovement.toFixed(1)} from last version
              </p>
            )}
          </div>
        </div>

        {/* ATS Score */}
        <div className="text-center">
          <div className="bg-green-50 rounded-lg p-4">
            <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">ATS Compatibility</p>
            <p className="text-2xl font-bold text-gray-900">{currentAtsScore}%</p>
            {previousAtsScore && (
              <p className={`text-sm ${getImprovementColor(atsImprovement)}`}>
                {atsImprovement > 0 ? '+' : ''}{atsImprovement.toFixed(1)} from last version
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="mt-6 flex flex-wrap gap-2">
        {currentScore >= 90 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            🏆 Excellent Score
          </span>
        )}
        {currentScore >= 80 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ⭐ Great Progress
          </span>
        )}
        {scoreImprovement >= 10 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            📈 Big Improvement
          </span>
        )}
      </div>
    </div>
  );
};
