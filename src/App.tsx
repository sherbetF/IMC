import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReportProvider, useReports } from './context/ReportContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { FileList } from './components/FileList';
import { UploadArea } from './components/UploadArea';
import { AnalyticsView } from './components/AnalyticsView';
import { StorageMeterWidget } from './components/StorageMeterWidget';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { AdminDashboard } from './components/AdminDashboard';

const MainAppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const { previewingReport, setPreviewingReport } = useReports();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Loading Outsource Database...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col lg:flex-row font-sans antialiased">
      
      {/* Dark Navy Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main White & Light Gray Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header */}
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Page Content Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard setActiveTab={setActiveTab} />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard setActiveTab={setActiveTab} />
          )}

          {activeTab === 'files' && (
            <FileList onNavigateUpload={() => setActiveTab('upload')} />
          )}

          {activeTab === 'upload' && (
            <UploadArea onSuccess={() => setActiveTab('files')} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'storage' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <StorageMeterWidget compact={false} />
            </div>
          )}
        </main>
      </div>

      {/* PDF Viewer Preview Modal */}
      <PdfPreviewModal
        report={previewingReport}
        onClose={() => setPreviewingReport(null)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ReportProvider>
        <MainAppContent />
      </ReportProvider>
    </AuthProvider>
  );
}
