import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DemoNotice } from '../common/DemoNotice';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { RoleSimulatorModal } from '../common/RoleSimulatorModal';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ currentRoute, onNavigate, children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Universal Prototype Notice Banner */}
      <DemoNotice />

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content Column */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-100 overflow-y-auto pb-16 md:pb-0">
          <Header
            currentRoute={currentRoute}
            onNavigate={onNavigate}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto" id="main-content-viewport">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNav currentRoute={currentRoute} onNavigate={onNavigate} />

      {/* Global Modals */}
      <GlobalSearchModal onNavigate={onNavigate} />
      <RoleSimulatorModal />
    </div>
  );
};
