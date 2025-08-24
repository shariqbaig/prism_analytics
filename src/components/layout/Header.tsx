import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, onToggleSidebar }) => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <div className="mr-4 flex items-center">
          {/* Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="mr-4 bg-background border border-border rounded p-1.5 hover:bg-accent transition-colors shadow-sm"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
          
          <a className="mr-6 flex items-center space-x-2" href="/">
            <img 
              src="/prism-logo.svg" 
              alt="PRISM Analytics" 
              className="h-7 w-7"
            />
            <span className="font-bold text-foreground">PRISM Analytics</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2">
          <div className="hidden md:block" />
          <nav className="flex items-center">
            <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px] sm:max-w-none">
              Developed by Mirza Haider Baig
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
};