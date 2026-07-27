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

// Import New Sub-section Components
import { EchoCalculator } from './components/EchoCalculator';
import { EchoCases } from './components/EchoCases';
import { PulmonaryHypertensionCalculator } from './components/PulmonaryHypertensionCalculator';
import { RvFacCalculator } from './components/RvFacCalculator';
import { AorticStenosisCalculator } from './components/AorticStenosisCalculator';
import { AorticRegurgitationCalculator } from './components/AorticRegurgitationCalculator';
import { MitralStenosisCalculator } from './components/MitralStenosisCalculator';
import { HolterScheduler } from './components/HolterScheduler';
import { TemporaryMedicalRecord } from './components/TemporaryMedicalRecord';
import { StockTakeHub } from './components/StockTakeHub';

import { 
  Database, 
  Heart, 
  CalendarDays, 
  LogOut, 
  ArrowRight, 
  Activity, 
  ChevronRight,
  Sparkles,
  Stethoscope,
  HeartPulse,
  Package,
  Syringe,
  Lock
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, loading, logout, isDemoUser, isGuest } = useAuth();
  const { previewingReport, setPreviewingReport } = useReports();
  
  // Subsection state: portal selection vs active module
  const [currentSubsection, setCurrentSubsection] = useState<'portal' | 'outsource_database' | 'echocardiogram' | 'holter_schedule' | 'medical_records' | 'stock_take'>('portal');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Loading Outsource Medical Suite...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || (currentUser.isAnonymous && !isGuest)) {
    return <LoginPage />;
  }

  // Guest restriction: if guest attempts to navigate to non-stock_take subsection, redirect to stock_take
  if (isGuest && currentSubsection !== 'portal' && currentSubsection !== 'stock_take') {
    setCurrentSubsection('stock_take');
  }

  // PORTAL SELECTION PAGE
  if (currentSubsection === 'portal') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 sm:p-12">
        
        {/* Portal Header */}
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 font-futuristic flex items-center gap-2">
                <span>Clinical Workspace</span>
                {isGuest && (
                  <span className="text-[10px] uppercase font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-md">
                    Guest Mode
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 font-medium">Cardiology Department Services Portal</p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 text-xs font-bold transition-all min-h-[40px]"
            title="Log Out of Session"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Portal Welcome / Main Selector Grid */}
        <div className="max-w-4xl w-full mx-auto my-auto py-12 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isGuest ? 'Welcome Guest Visitor' : 'Welcome Back Gaissss'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-futuristic">
              Select Department Sub-Section
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              {isGuest 
                ? 'In Guest Mode, you can view the Stock Take Hub. Other subsections require authorized staff login.' 
                : 'Access database archives, diagnostic decision calculators, patient schedules, and interesting case study repositories.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            
            {/* Card 1: Outsource Database */}
            <div 
              onClick={() => {
                if (isGuest) return;
                setCurrentSubsection('outsource_database');
                setActiveTab('dashboard');
              }}
              className={`group bg-white rounded-2xl border p-6 flex flex-col justify-between space-y-6 transition-all shadow-2xs ${
                isGuest 
                  ? 'opacity-40 grayscale cursor-not-allowed border-slate-200' 
                  : 'border-slate-200 hover:shadow-xl hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center transition-colors group-hover:bg-indigo-600 group-hover:text-white shrink-0 shadow-xs">
                  <Database className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                    <span>Outsource Database</span>
                    {isGuest && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Manage and audit scanned medical report files from major clinics including KPJ Dato Onn, KPJ Johor, HSA, and Columbia Asia.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                {isGuest ? (
                  <span className="text-slate-400 font-semibold text-[11px]">Staff Only (Locked)</span>
                ) : (
                  <>
                    <span>Enter Archive</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </div>

            {/* Card 2: Stock Take (Venepuncture Hub) - AVAILABLE IN GUEST MODE */}
            <div 
              onClick={() => {
                setCurrentSubsection('stock_take');
                setActiveTab('stock_inventory');
              }}
              className="group bg-white rounded-2xl border border-violet-200 p-6 flex flex-col justify-between space-y-6 hover:shadow-xl hover:border-violet-400 hover:-translate-y-0.5 transition-all cursor-pointer shadow-2xs relative ring-2 ring-violet-500/20"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-violet-100 border border-violet-200 text-violet-700 flex items-center justify-center transition-colors group-hover:bg-violet-600 group-hover:text-white shrink-0 shadow-xs">
                  <Syringe className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-violet-600 transition-colors">
                      Stock Take Hub
                    </h3>
                    {isGuest && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                        Viewable
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Venepuncture supplies inventory, item registration, low-stock threshold alerts, issuance log audits, and total RM valuation.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-violet-600">
                <span>{isGuest ? 'View Inventory' : 'Manage Supplies'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 3: Echocardiogram */}
            <div 
              onClick={() => {
                if (isGuest) return;
                setCurrentSubsection('echocardiogram');
                setActiveTab('echo_calculator');
              }}
              className={`group bg-white rounded-2xl border p-6 flex flex-col justify-between space-y-6 transition-all shadow-2xs ${
                isGuest 
                  ? 'opacity-40 grayscale cursor-not-allowed border-slate-200' 
                  : 'border-slate-200 hover:shadow-xl hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center transition-colors group-hover:bg-rose-600 group-hover:text-white shrink-0 shadow-xs">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-rose-600 transition-colors flex items-center justify-between">
                    <span>Echocardiogram Suite</span>
                    {isGuest && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Execute Diastolic Dysfunction 2025 flowchart algorithms and store interesting case studies with high-quality looping GIFs and MP4s.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-rose-600">
                {isGuest ? (
                  <span className="text-slate-400 font-semibold text-[11px]">Staff Only (Locked)</span>
                ) : (
                  <>
                    <span>Open Suite</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </div>

            {/* Card 4: Cardioscan Holter Schedule */}
            <div 
              onClick={() => {
                if (isGuest) return;
                setCurrentSubsection('holter_schedule');
                setActiveTab('holter_schedule');
              }}
              className={`group bg-white rounded-2xl border p-6 flex flex-col justify-between space-y-6 transition-all shadow-2xs ${
                isGuest 
                  ? 'opacity-40 grayscale cursor-not-allowed border-slate-200' 
                  : 'border-slate-200 hover:shadow-xl hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white shrink-0 shadow-xs">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>Holter Schedule</span>
                    {isGuest && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Log and monitor Cardioscan Holter device allocations. Track hookup dates, automatic return deadlines, and download statuses.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                {isGuest ? (
                  <span className="text-slate-400 font-semibold text-[11px]">Staff Only (Locked)</span>
                ) : (
                  <>
                    <span>Manage Schedule</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </div>

            {/* Card 5: Temporary Medical Record */}
            <div 
              onClick={() => {
                if (isGuest) return;
                setCurrentSubsection('medical_records');
                setActiveTab('medical_records');
              }}
              className={`group bg-white rounded-2xl border p-6 flex flex-col justify-between space-y-6 transition-all shadow-2xs ${
                isGuest 
                  ? 'opacity-40 grayscale cursor-not-allowed border-slate-200' 
                  : 'border-slate-200 hover:shadow-xl hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center transition-colors group-hover:bg-teal-600 group-hover:text-white shrink-0 shadow-xs">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-teal-600 transition-colors flex items-center justify-between">
                    <span>Temporary Medical Record</span>
                    {isGuest && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Triage patients into Red, Yellow, Green zones with immutable clerking entries, bed assignments, and chronological progress note audits.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-teal-600">
                {isGuest ? (
                  <span className="text-slate-400 font-semibold text-[11px]">Staff Only (Locked)</span>
                ) : (
                  <>
                    <span>Open Registry</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Portal Footer */}
        <div className="max-w-7xl w-full mx-auto text-center text-[11px] text-slate-400 font-medium pt-5 border-t border-slate-200/50">
          Medical Cardiology Workspace Services. All credentials and local sessions are securely authorized.
        </div>

      </div>
    );
  }

  // SINGLE-SUBSECTION RENDER STAGES
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
        currentSubsection={currentSubsection}
        setCurrentSubsection={(sub) => {
          setCurrentSubsection(sub);
          // Auto select default tabs for smooth transition
          if (sub === 'outsource_database') setActiveTab('dashboard');
          if (sub === 'stock_take') setActiveTab('stock_inventory');
          if (sub === 'echocardiogram') setActiveTab('echo_calculator');
          if (sub === 'holter_schedule') setActiveTab('holter_schedule');
          if (sub === 'medical_records') setActiveTab('medical_records');
        }}
      />

      {/* Main White & Light Gray Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header */}
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentSubsection={currentSubsection}
          setCurrentSubsection={(sub) => {
            setCurrentSubsection(sub);
            if (sub === 'outsource_database') setActiveTab('dashboard');
            if (sub === 'stock_take') setActiveTab('stock_inventory');
            if (sub === 'echocardiogram') setActiveTab('echo_calculator');
            if (sub === 'holter_schedule') setActiveTab('holter_schedule');
            if (sub === 'medical_records') setActiveTab('medical_records');
          }}
        />

        {/* Page Content Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {/* Outsource Database Subsection */}
          {currentSubsection === 'outsource_database' && (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  setActiveTab={setActiveTab} 
                  setCurrentSubsection={(sub) => {
                    setCurrentSubsection(sub);
                    if (sub === 'outsource_database') setActiveTab('dashboard');
                    if (sub === 'echocardiogram') setActiveTab('echo_calculator');
                    if (sub === 'holter_schedule') setActiveTab('holter_schedule');
                    if (sub === 'medical_records') setActiveTab('medical_records');
                  }} 
                />
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
            </>
          )}

          {/* Echocardiogram Calculator & Cases Subsection */}
          {currentSubsection === 'echocardiogram' && (
            <div className="space-y-6">
              {/* Echo Suite Navigation Tabs Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
                <button
                  onClick={() => setActiveTab('echo_calculator')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[38px] ${
                    activeTab === 'echo_calculator'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Diastolic Function</span>
                </button>

                <button
                  onClick={() => setActiveTab('echo_ph')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[38px] ${
                    activeTab === 'echo_ph'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Pulmonary Pressure (PASP)</span>
                </button>

                <button
                  onClick={() => setActiveTab('echo_rv_fac')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[38px] ${
                    activeTab === 'echo_rv_fac'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>RV FAC Calculator</span>
                </button>

                <button
                  onClick={() => setActiveTab('echo_as')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[38px] ${
                    activeTab === 'echo_as'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Aortic Stenosis</span>
                </button>

                <button
                  onClick={() => setActiveTab('echo_ar_pht')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[38px] ${
                    activeTab === 'echo_ar_pht'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>AR Pressure Half Time</span>
                </button>

                <button
                  onClick={() => setActiveTab('echo_ms')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[38px] ${
                    activeTab === 'echo_ms'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Mitral Stenosis</span>
                </button>

                <button
                  onClick={() => setActiveTab('echo_cases')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[38px] ${
                    activeTab === 'echo_cases'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Echo Cases</span>
                </button>
              </div>

              {/* Active Tab View */}
              {activeTab === 'echo_calculator' && <EchoCalculator />}
              {activeTab === 'echo_ph' && <PulmonaryHypertensionCalculator />}
              {activeTab === 'echo_rv_fac' && <RvFacCalculator />}
              {activeTab === 'echo_as' && <AorticStenosisCalculator />}
              {activeTab === 'echo_ar_pht' && <AorticRegurgitationCalculator />}
              {activeTab === 'echo_ms' && <MitralStenosisCalculator />}
              {activeTab === 'echo_cases' && <EchoCases />}
            </div>
          )}

          {/* Cardioscan Holter Schedule Subsection */}
          {currentSubsection === 'holter_schedule' && (
            <>
              {activeTab === 'holter_schedule' && (
                <HolterScheduler />
              )}
            </>
          )}

          {/* Temporary Medical Record Subsection */}
          {currentSubsection === 'medical_records' && (
            <TemporaryMedicalRecord activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {/* Stock Take Subsection (Venepuncture Hub) */}
          {currentSubsection === 'stock_take' && (
            <StockTakeHub activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

        </main>
      </div>

      {/* PDF Viewer Preview Modal (Only for Outsource Database) */}
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
