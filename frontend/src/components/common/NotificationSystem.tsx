import React, { useEffect, useState, type JSX } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUI } from '../../store';

export const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useUI();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (!notifications.length) return null;

  return (
    <>
      {/* Overlay to ensure proper stacking */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <div className="flex flex-col space-y-2 items-end justify-start p-4 h-full">
          <div className="w-full max-w-sm space-y-2">
            {notifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                index={index}
                onRemove={removeNotification}
                getIcon={getIcon}
                getColorClasses={getColorClasses}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const NotificationItem: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notification: any;
  index: number;
  onRemove: (id: string) => void;
  getIcon: (type: string) => JSX.Element;
  getColorClasses: (type: string) => string;
}> = ({ notification, index, onRemove, getIcon, getColorClasses }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  return (
    <div
      className={`w-full pointer-events-auto transform transition-all duration-300 ease-out ${
        isVisible && !isRemoving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      } ${getColorClasses(notification.type)} border rounded-lg shadow-lg`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon(notification.type)}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">
              {notification.title}
            </p>
            <p className="mt-1 text-sm opacity-90">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleRemove}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
