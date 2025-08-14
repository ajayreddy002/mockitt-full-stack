// frontend/src/utils/courseUtils.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getCourseDefaultThumbnail = (category: string, _title?: string) => {
  const categoryThumbnails = {
    'FRONTEND_DEVELOPMENT': '/course-thumbnails/frontend-development.jpeg',
    'BACKEND_DEVELOPMENT': '/course-thumbnails/backend-development.png', 
    'FULLSTACK_DEVELOPMENT': '/course-thumbnails/fullstack-development.png',
    'DATA_SCIENCE': '/course-thumbnails/data-science.png',
    'TECHNICAL_INTERVIEWS': '/course-thumbnails/technical-interviews.png',
    'DEVOPS': '/course-thumbnails/devops.png',
    'MOBILE_DEVELOPMENT': '/course-thumbnails/mobile-development.png',
    'SYSTEM_DESIGN': '/course-thumbnails/system-design.png',
    'BEHAVIORAL_SKILLS': '/course-thumbnails/behavioral-skills.png'
  };

  // Fallback to placeholder service if image doesn't exist
  const defaultThumbnail = categoryThumbnails[category as keyof typeof categoryThumbnails];
  
  if (defaultThumbnail) {
    return defaultThumbnail;
  }

  
  // Return a data URL for a gradient placeholder
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="400" height="240" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#grad)"/>
      <text x="200" y="120" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${category.replace('_', ' ')}
      </text>
    </svg>
  `)}`;
};

export const formatCourseCategory = (category: string) => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getCourseIcon = (category: string) => {
  const icons = {
    'FRONTEND_DEVELOPMENT': '🎨',
    'BACKEND_DEVELOPMENT': '⚙️',
    'FULLSTACK_DEVELOPMENT': '🚀',
    'DATA_SCIENCE': '📊',
    'TECHNICAL_INTERVIEWS': '💼',
  };
  return icons[category as keyof typeof icons] || '📚';
};
