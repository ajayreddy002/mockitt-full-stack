export interface NavigationItem {
  name: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  description?: string;
  badge?: string;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  name: string;
  path?: string;
  current: boolean;
}

export type RoutePermission = 'public' | 'authenticated' | 'admin' | 'mentor';

export interface RouteMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  requiresAuth: boolean;
  permissions?: RoutePermission[];
  layout?: 'dashboard' | 'auth' | 'landing';
}
