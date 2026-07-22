import React, { useState } from 'react';
import { 
  Database, 
  LayoutDashboard, 
  FileText, 
  Upload, 
  BarChart3, 
  HardDrive, 
  LogOut, 
  X, 
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth, ADMIN_UID } from '../context/AuthContext';
import { useReports } from '../context/ReportContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { currentUser, logout, isDemoUser, isAdmin } = useAuth();
  const { storageStats } = useReports();
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);

  const collapsed = isCollapsed ?? internalCollapsed;
  const toggleCollapse = onToggleCollapse ?? (() => setInternalCollapsed(!internalCollapsed));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin', label: 'Admin Panel', icon: ShieldCheck, isAdminOnly: true },
    { id: 'files', label: 'Medical Files', icon: FileText, count: storageStats.totalFiles },
    { id: 'upload', label: 'Upload PDF', icon: Upload },
    { id: 'analytics', label: 'Hospital Analytics', icon: BarChart3 },
    { id: 'storage', label: 'Firebase Storage', icon: HardDrive },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop for iOS & Android */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 bg-[#120E29] text-slate-100 flex flex-col justify-between transition-all duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-indigo-950/60
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'lg:w-20 w-72' : 'lg:w-64 w-72'}
      `}>
        {/* Top Header & Brand */}
        <div>
          <div className="p-3.5 border-b border-indigo-950/80">
            {collapsed ? (
              <div className="hidden lg:flex flex-col items-center gap-3 w-full py-1">
                <button
                  type="button"
                  onClick={toggleCollapse}
                  className="p-2 rounded-xl bg-indigo-950/80 text-indigo-300 hover:text-white hover:bg-indigo-600 transition-all shadow-xs"
                  title="Expand Sidebar"
                  aria-label="Expand Sidebar"
                >
                  <PanelLeftOpen className="w-5 h-5 text-indigo-400 hover:text-white" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/60 shrink-0" title="Outsource DB Medical Scans">
                  <Database className="w-5 h-5" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/60 shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 font-futuristic truncate">
                      Outsource DB
                    </h1>
                    <p className="text-[11px] text-indigo-300/80 font-medium truncate">Medical Scans Archive</p>
                  </div>
                </div>

                {/* Desktop Collapse Button */}
                <button
                  type="button"
                  onClick={toggleCollapse}
                  className="hidden lg:flex p-2 rounded-xl text-indigo-300/70 hover:text-white hover:bg-indigo-950 transition-colors"
                  title="Collapse Sidebar"
                  aria-label="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Mobile Header Layout */}
            <div className="flex lg:hidden items-center justify-between">
              <div className="flex items-center space-x-3 truncate">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-bold text-sm text-white">Outsource DB</h1>
                  <p className="text-[10px] text-indigo-300/80">Medical Scans</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={onClose} 
                className="p-2 rounded-lg text-indigo-300/70 hover:text-white hover:bg-indigo-900/50 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center rounded-xl font-medium text-sm transition-all duration-200 min-h-[44px]
                    ${collapsed ? 'lg:justify-center px-3 py-3' : 'justify-between px-3.5 py-3'}
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60 font-semibold' 
                      : 'text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-indigo-300/80'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && item.isAdminOnly && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase tracking-wide">
                      ADMIN
                    </span>
                  )}
                  {!collapsed && item.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-indigo-950 text-indigo-300 border border-indigo-900/50'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Storage Gauge & Sign Out */}
        <div className="p-3 space-y-3 border-t border-indigo-950/80 bg-indigo-950/30">
          {/* Storage Used Quick Gauge */}
          <div 
            onClick={() => handleNavClick('storage')}
            className={`
              p-3 rounded-xl bg-indigo-950/60 border border-indigo-900/60 cursor-pointer hover:border-indigo-700 transition-all group
              ${collapsed ? 'lg:p-2 lg:text-center' : ''}
            `}
            title={collapsed ? `Storage Used: ${storageStats.usagePercentage}% (${storageStats.totalSizeFormatted})` : undefined}
          >
            {collapsed ? (
              <div className="flex flex-col items-center justify-center space-y-1">
                <HardDrive className={`w-5 h-5 ${storageStats.isNearLimit ? 'text-amber-400 animate-pulse' : 'text-indigo-400'}`} />
                <span className="text-[10px] font-bold text-indigo-200">{storageStats.usagePercentage}%</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2 text-xs font-medium text-indigo-200">
                    <HardDrive className={`w-4 h-4 ${storageStats.isNearLimit ? 'text-amber-400 animate-pulse' : 'text-indigo-400'}`} />
                    <span>Storage Used</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-100">
                    {storageStats.usagePercentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-indigo-950 h-2 rounded-full overflow-hidden mb-1.5">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      storageStats.isNearLimit ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.max(3, storageStats.usagePercentage)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-indigo-300/70">
                  <span>{storageStats.totalSizeFormatted}</span>
                  <span>Limit: 5 GB</span>
                </div>
              </>
            )}
          </div>

          {/* User Profile & Sign-Out Button */}
          <div className={`pt-1 flex items-center ${collapsed ? 'lg:justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
                  {currentUser?.email ? currentUser.email[0].toUpperCase() : 'M'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate max-w-[110px]">
                    {currentUser?.email || 'Medical User'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {isDemoUser ? 'Demo Admin' : 'Firebase Auth'}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
