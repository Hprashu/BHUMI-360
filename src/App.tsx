import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { ModulePlaceholder } from './components/common/ModulePlaceholder';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { Project360Page } from './pages/Project360Page';
import { ParcelsListPage } from './pages/ParcelsListPage';
import { Parcel360Page } from './pages/Parcel360Page';
import { GISCommandCenterPage } from './pages/GISCommandCenterPage';
import { AcquisitionWorkflowPage } from './pages/AcquisitionWorkflowPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditPage } from './pages/AuditPage';
import { CitizenPortalPage } from './pages/CitizenPortalPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdministrationPage } from './pages/AdministrationPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';

function AppContent() {
  const { isAuthenticated, can, currentRole } = useApp();

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash ? window.location.hash.replace('#', '') : '/dashboard';
  });

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setCurrentRoute(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Dedicated full-screen Login route
  if (currentRoute === '/login') {
    return (
      <LoginPage
        onNavigate={handleNavigate}
        onLoginSuccess={() => handleNavigate('/dashboard')}
      />
    );
  }

  const renderContent = () => {
    // Route matching with RBAC enforcement
    if (currentRoute === '/' || currentRoute === '/dashboard') {
      if (!can('dashboard.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="dashboard.view" />;
      }
      return <DashboardPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/projects') {
      if (!can('project.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="project.view" />;
      }
      return <ProjectsListPage onNavigate={handleNavigate} />;
    }

    if (currentRoute.startsWith('/projects/')) {
      if (!can('project.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="project.view" />;
      }
      const projectId = currentRoute.replace('/projects/', '');
      return <Project360Page projectId={projectId} onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/parcels') {
      if (!can('parcel.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="parcel.view" />;
      }
      return <ParcelsListPage onNavigate={handleNavigate} />;
    }

    if (currentRoute.startsWith('/parcels/')) {
      if (!can('parcel.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="parcel.view" />;
      }
      const parcelId = currentRoute.replace('/parcels/', '');
      return <Parcel360Page parcelId={parcelId} onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/gis') {
      if (!can('gis.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="gis.view" />;
      }
      return <GISCommandCenterPage onNavigate={handleNavigate} />;
    }

    if (currentRoute.startsWith('/acquisition')) {
      if (!can('project.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="project.view" />;
      }
      return <AcquisitionWorkflowPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/survey') {
      if (!can('survey.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="survey.view" />;
      }
      return <AcquisitionWorkflowPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/approvals') {
      if (!can('approval.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="approval.view" />;
      }
      return <AcquisitionWorkflowPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/compensation') {
      if (!can('compensation.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="compensation.view" />;
      }
      return <AcquisitionWorkflowPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/rr') {
      if (!can('rr.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="rr.view" />;
      }
      return <AcquisitionWorkflowPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/intelligence') {
      if (!can('dashboard.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="dashboard.view" />;
      }
      return <IntelligencePage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/notifications') {
      if (!can('notification.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="notification.view" />;
      }
      return <NotificationsPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/audit') {
      if (!can('audit.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="audit.view" />;
      }
      return <AuditPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/profile') {
      return <ProfilePage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/admin') {
      if (!can('user.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="user.view" />;
      }
      return <AdministrationPage />;
    }

    if (currentRoute === '/access-denied') {
      return <AccessDeniedPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/citizen') {
      return <CitizenPortalPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/settings') {
      return <SettingsPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/documents') {
      if (!can('document.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="document.view" />;
      }
      return (
        <ModulePlaceholder
          title="Digital Cadastral Document & Orthomosaic Vault"
          phaseNumber={2}
          description="Enterprise repository for drone orthomosaics, georeferenced GeoTIFFs, Field Measurement Books (FMB), and gazetted awards."
          features={[
            'DigiLocker C-DAC statutory signing adapter',
            'Full-text OCR search across vernacular revenue deeds',
            'Automated 30-year non-encumbrance certificate generation',
            'Drone high-resolution point cloud & orthomosaic viewer',
          ]}
          onNavigateAction={{ label: 'Inspect Parcel PCL-00421 Documents', route: '/parcels/PCL-00421' }}
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/analytics') {
      if (!can('analytics.view')) {
        return <AccessDeniedPage onNavigate={handleNavigate} requiredPermission="analytics.view" />;
      }
      return (
        <ModulePlaceholder
          title="Executive MIS & Corridor Analytics"
          phaseNumber={2}
          description="Predictive corridor delivery forecasting, budget burn analysis, and inter-state acquisition benchmarking."
          features={[
            'Linear infrastructure capital expenditure projections',
            'Village-level SLA bottleneck heatmaps',
            'Dispute litigation risk probability modeling',
            'Automated PM Gati Shakti progress feed exports',
          ]}
          onNavigateAction={{ label: 'Return to Executive Dashboard', route: '/dashboard' }}
          onNavigate={handleNavigate}
        />
      );
    }

    // Default fallback
    return <DashboardPage onNavigate={handleNavigate} />;
  };

  return (
    <AppShell currentRoute={currentRoute} onNavigate={handleNavigate}>
      {renderContent()}
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
