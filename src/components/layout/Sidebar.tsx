import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Upload, 
  Package, 
  AlertTriangle, 
  FileText,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    name: 'Upload Files',
    href: '/upload',
    icon: Upload,
  },
  {
    name: 'Data Viewer',
    href: '/data-viewer',
    icon: Eye,
  },
  {
    name: 'Inventory Analysis',
    href: '/inventory',
    icon: Package,
  },
  {
    name: 'OSR Command Center',
    href: '/osr',
    icon: AlertTriangle,
  },
  {
    name: 'Reports & Export',
    href: '/reports',
    icon: FileText,
  },
  {
    name: 'Component Demo',
    href: '/demo',
    icon: BarChart3,
  },
];

interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  return (
    <div className={cn(
      "pb-12 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Navigation Items */}
      <div className="py-4">
        <div className="px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors relative group',
                    isActive 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-muted-foreground'
                  )
                }
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isCollapsed ? "" : "mr-3"
                )} />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};