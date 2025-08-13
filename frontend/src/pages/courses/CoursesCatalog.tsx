import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Users, BookOpen, Filter } from 'lucide-react';
import { useCourses } from '../../store';

export const CoursesCatalog: React.FC = () => {
  const navigate = useNavigate();
  const {
    courses,
    coursesLoading,
    coursesError,
    fetchCourses,
    clearCoursesError
  } = useCourses();

  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: '',
    isPremium: false
  });

  // ✅ Fetch courses on component mount and filter changes
  useEffect(() => {
    fetchCourses(filters);
  }, [fetchCourses, filters]);

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Loading state
  if (coursesLoading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (coursesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Courses
          </h3>
          <p className="text-red-600 mb-4">{coursesError}</p>
          <button
            onClick={() => {
              clearCoursesError();
              fetchCourses(filters);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        {courses.length > 0 && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Industry-Focused Courses
            </h1>
            <p className="text-lg text-gray-600">
              Learn job-ready skills through curated courses developed with industry input
            </p>
          </div>
        )}
        {/* Filters */}
        {courses.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-4 flex-wrap">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700">Filters:</span>
              </div>

              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <select
                value={filters.category}
                onChange={(e) => handleFilterChange({ category: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="FRONTEND_DEVELOPMENT">Frontend Development</option>
                <option value="BACKEND_DEVELOPMENT">Backend Development</option>
                <option value="FULLSTACK_DEVELOPMENT">Full Stack Development</option>
                <option value="DATA_SCIENCE">Data Science</option>
                <option value="TECHNICAL_INTERVIEWS">Technical Interviews</option>
              </select>

              <select
                value={filters.level}
                onChange={(e) => handleFilterChange({ level: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>
        )}

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCourseClick(course.id)}
            >
              {/* Course Thumbnail */}
              <div className="relative h-48">
                <img
                  src={course.thumbnailUrl || '/default-course-thumbnail.jpg'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {course.isPremium && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                      PREMIUM
                    </span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${course.level === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                    course.level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {course.level}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.stats.totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{Math.floor(course.stats.totalDuration / 60)}h</span>
                    </div>
                  </div>
                </div>

                {/* Rating and Enrollment */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">
                        {course.stats.averageRating || 'New'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{course.stats.enrollmentCount}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course.id);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View Course
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {courses.length === 0 && !coursesLoading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more courses.</p>
          </div>
        )}
      </div>
    </div>
  );
};
