import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, Award } from 'lucide-react';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    shortDescription?: string;
    thumbnailUrl?: string;
    level: string;
    category: string;
    estimatedHours: number;
    price: number;
    isPremium: boolean;
    enrollmentCount: number;
    averageRating: number;
    totalLessons: number;
  };
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const {
    id,
    title,
    shortDescription,
    thumbnailUrl,
    level,
    category,
    estimatedHours,
    price,
    isPremium,
    enrollmentCount,
    averageRating,
    totalLessons,
  } = course;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Thumbnail */}
      <div className="relative">
        <img
          src={thumbnailUrl || '/placeholder-course.jpg'}
          alt={title}
          className="w-full h-48 object-cover"
        />
        {isPremium && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
            <Award className="w-3 h-3 mr-1" />
            Premium
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          {level}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-sm text-blue-600 font-medium">{category?.replace('_', ' ')}</span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>

        {shortDescription && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {shortDescription}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {estimatedHours}h
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {enrollmentCount}
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1 text-yellow-400" />
            {averageRating.toFixed(1)}
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900">
            {price === 0 ? 'Free' : `₹${price}`}
          </div>
          <Link
            to={`/courses/${id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
};
