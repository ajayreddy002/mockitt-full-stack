// frontend/src/components/courses/CourseCard.tsx
import React from 'react';
import { Star, Clock, Users, BookOpen, Play, Zap, ChevronRight } from 'lucide-react';
import { getCourseDefaultThumbnail } from '../../utils/courseUtils';

interface CourseCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  course: any;
  onClick: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <div 
      className="group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
      onClick={() => onClick(course.id)}
    >
      {/* Course Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={course.thumbnailUrl || getCourseDefaultThumbnail(course.category, course.title)}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-6 left-6 flex space-x-2">
          {course.isPremium && (
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center shadow-lg">
              <Zap className="h-3 w-3 mr-1" />
              PREMIUM
            </span>
          )}
          <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
            course.level === 'BEGINNER' 
              ? 'bg-green-500 text-white'
              : course.level === 'INTERMEDIATE'
              ? 'bg-yellow-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {course.level}
          </span>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white rounded-full p-6 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
            <Play className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-6 right-6">
          <div className="bg-white rounded-2xl px-4 py-2 shadow-lg">
            <span className="text-lg font-bold text-gray-900">
              {course.isPremium ? `$${course.price || 29}` : 'FREE'}
            </span>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-8">
        {/* Category and Rating */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {course.category.replace('_', ' ')}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-gray-700">
              {course.stats?.averageRating || '4.8'}
            </span>
            <span className="text-xs text-gray-500">
              ({course.stats?.reviewCount || '124'})
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
          {course.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
          {course.shortDescription || course.description}
        </p>

        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{course.estimatedHours || 0}h</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <BookOpen className="h-4 w-4" />
              <span>{course.stats?.totalLessons || 0} lessons</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <Users className="h-4 w-4" />
              <span>{course.stats?.enrollmentCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick(course.id);
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
        >
          <span>{course.enrolled ? 'Continue Learning' : 'View Course'}</span>
          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};
