// frontend/src/pages/courses/CoursesCatalog.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Users,
  TrendingUp,
  Award,
  Zap,
  BookOpen,
} from 'lucide-react';
import { useCourses } from '../../store';
import { CourseCard } from '../../components/courses/CourseCard';

export const CoursesCatalog: React.FC = () => {
  const navigate = useNavigate();
  const {
    courses,
    coursesLoading,
    // coursesError,
    fetchCourses,
    // clearCoursesError
  } = useCourses();

  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: '',
    isPremium: undefined
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses(filters);
  }, [fetchCourses, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  // Mock stats data - replace with actual API data
  const platformStats = [
    { icon: Users, label: "Active Students", value: "12,500+", color: "bg-gradient-to-r from-blue-500 to-blue-600" },
    { icon: BookOpen, label: "Live Courses", value: "180+", color: "bg-gradient-to-r from-green-500 to-green-600" },
    { icon: Award, label: "Certificates Issued", value: "9,200+", color: "bg-gradient-to-r from-purple-500 to-purple-600" },
    { icon: TrendingUp, label: "Job Success Rate", value: "94%", color: "bg-gradient-to-r from-orange-500 to-orange-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,20 Q50,40 100,20 L100,100 L0,100 Z" fill="white" opacity="0.1" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span className="text-white font-medium">AI-Powered Career Preparation</span>
            </div>

            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Master Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                Dream Career
              </span>
            </h1>

            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Industry-focused courses designed by experts. Learn the skills that matter,
              build projects that impress, and land the job you deserve.
            </p>

            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mb-8">
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search courses, technologies, career paths..."
                  className="w-full pl-14 pr-32 py-5 rounded-2xl text-lg bg-transparent border-0 focus:ring-0 placeholder-gray-500 text-gray-900"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['Frontend', 'Backend', 'Full Stack', 'Data Science', 'DevOps'].map((category) => (
                <button
                  key={category}
                  onClick={() => setFilters(prev => ({ ...prev, category: category.toUpperCase().replace(' ', '_') + '_DEVELOPMENT' }))}
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full hover:bg-white/30 transition-all duration-300 border border-white/20"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
              <div className={`inline-flex p-4 rounded-2xl ${stat.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore Courses</h2>
              <p className="text-gray-600">Find the perfect course to advance your career</p>
            </div>
            <div className="flex items-center space-x-3 text-gray-500">
              <Filter className="h-5 w-5" />
              <span className="font-medium">Filter & Sort</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              >
                <option value="">All Categories</option>
                <option value="FRONTEND_DEVELOPMENT">Frontend Development</option>
                <option value="BACKEND_DEVELOPMENT">Backend Development</option>
                <option value="FULLSTACK_DEVELOPMENT">Full Stack Development</option>
                <option value="DATA_SCIENCE">Data Science</option>
                <option value="TECHNICAL_INTERVIEWS">Technical Interviews</option>
              </select>
            </div>

            {/* Level Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Skill Level</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              >
                <option value="">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Duration</label>
              <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors">
                <option>Any Duration</option>
                <option>Under 5 hours</option>
                <option>5-20 hours</option>
                <option>20+ hours</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Price</label>
              <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors">
                <option>All Courses</option>
                <option>Free Courses</option>
                <option>Premium Courses</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Course Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {coursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-8 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={handleCourseClick}
              />
              // <div 
              //   key={course.id} 
              //   className="group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
              //   onClick={() => handleCourseClick(course.id)}
              // >
              //   {/* Course Image */}
              //   <div className="relative h-56 overflow-hidden">
              //     <img
              //       src={course.thumbnailUrl || getCourseDefaultThumbnail(course.category, course.title)}
              //       alt={course.title}
              //       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              //     />

              //     {/* Gradient Overlay */}
              //     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              //     {/* Badges */}
              //     <div className="absolute top-6 left-6 flex space-x-2">
              //       {course.isPremium && (
              //         <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center shadow-lg">
              //           <Zap className="h-3 w-3 mr-1" />
              //           PREMIUM
              //         </span>
              //       )}
              //       <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
              //         course.level === 'BEGINNER' 
              //           ? 'bg-green-500 text-white'
              //           : course.level === 'INTERMEDIATE'
              //           ? 'bg-yellow-500 text-white' 
              //           : 'bg-red-500 text-white'
              //       }`}>
              //         {course.level}
              //       </span>
              //     </div>

              //     {/* Play Button Overlay */}
              //     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              //       <div className="bg-white rounded-full p-6 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
              //         <Play className="h-8 w-8 text-blue-600" />
              //       </div>
              //     </div>

              //     {/* Price Badge */}
              //     <div className="absolute bottom-6 right-6">
              //       <div className="bg-white rounded-2xl px-4 py-2 shadow-lg">
              //         <span className="text-lg font-bold text-gray-900">
              //           {course.isPremium ? `$${course.price || 29}` : 'FREE'}
              //         </span>
              //       </div>
              //     </div>
              //   </div>

              //   {/* Course Content */}
              //   <div className="p-8">
              //     {/* Category and Rating */}
              //     <div className="flex items-center justify-between mb-4">
              //       <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              //         {course.category.replace('_', ' ')}
              //       </span>
              //       <div className="flex items-center space-x-1">
              //         <Star className="h-4 w-4 text-yellow-400 fill-current" />
              //         <span className="text-sm font-semibold text-gray-700">
              //           {course.stats?.averageRating || '4.8'}
              //         </span>
              //         <span className="text-xs text-gray-500">
              //           ({course?.reviews?.length || '124'})
              //         </span>
              //       </div>
              //     </div>

              //     {/* Title */}
              //     <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
              //       {course.title}
              //     </h3>

              //     {/* Description */}
              //     <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
              //       {course.description || course.description}
              //     </p>

              //     {/* Course Stats */}
              //     <div className="flex items-center justify-between text-sm mb-6">
              //       <div className="flex items-center space-x-4">
              //         <div className="flex items-center space-x-1 text-gray-500">
              //           <Clock className="h-4 w-4" />
              //           <span>{course.stats.totalDuration || 0}h</span>
              //         </div>
              //         <div className="flex items-center space-x-1 text-gray-500">
              //           <BookOpen className="h-4 w-4" />
              //           <span>{course.stats?.totalLessons || 0} lessons</span>
              //         </div>
              //         <div className="flex items-center space-x-1 text-gray-500">
              //           <Users className="h-4 w-4" />
              //           <span>{course.stats?.enrollmentCount || 0}</span>
              //         </div>
              //       </div>
              //     </div>

              //     {/* Action Button */}
              //     <button 
              //       onClick={(e) => {
              //         e.stopPropagation();
              //         handleCourseClick(course.id);
              //       }}
              //       className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
              //     >
              //       <span>{course.isEnrolled ? 'Continue Learning' : 'View Course'}</span>
              //       <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              //     </button>
              //   </div>
              // </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {courses.length === 0 && !coursesLoading && (
          <div className="text-center py-20">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 max-w-2xl mx-auto">
              <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No courses found</h3>
              <p className="text-gray-600 mb-8">Try adjusting your filters to discover more courses.</p>
              <button
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setFilters({ category: '', level: '', search: '', isPremium: false as any })}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
