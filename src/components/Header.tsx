import React from 'react';
import { Menu, Search, Upload, HardDrive, ShieldCheck, Database } from 'lucide-react';
import { useReports } from '../context/ReportContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  activeTab,
  setActiveTab
}) => {
  const { filters, setFilters, storageStats } = useReports();
  const { isAdmin } = useAuth();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Medical Dashboard Overview';
      case 'admin': return 'Admin Control Center';
      case 'files': return 'Scanned Reports Repository';
      case 'upload': return 'Upload Outsource PDF';
      case 'analytics': return 'Hospital & Report Analytics';
      case 'storage': return 'Firebase Storage Status';
      default: return 'Outsource Database';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile Toggle & Page Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              {getTitle()}
              {activeTab === 'admin' && (
                <span className="text-[10px] uppercase font-extrabold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md">
                  Superadmin
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              KPJ Dato Onn, KPJ Puteri, KPJ Pasir Gudang, KPJ Johor, Columbia Asia Tebrau & HSA Reports
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Admin Panel Quick Access Button */}
          {isAdmin && activeTab !== 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-bold transition-all min-h-[40px] border border-slate-800 shadow-xs"
              title="Open Admin Dashboard"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Admin Panel</span>
            </button>
          )}

          {/* Total Storage Used Indicator */}
          <button
            onClick={() => setActiveTab('storage')}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all min-h-[40px]
              ${storageStats.isNearLimit 
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' 
                : 'bg-indigo-50/70 text-indigo-900 border-indigo-100 hover:bg-indigo-100/60'}
            `}
            title="Total Storage Used"
          >
            <HardDrive className={`w-4 h-4 ${storageStats.isNearLimit ? 'text-amber-600' : 'text-indigo-600'}`} />
            <span className="hidden sm:inline font-bold">{storageStats.totalSizeFormatted}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100/80 text-indigo-800 font-bold">
              {storageStats.usagePercentage}%
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
