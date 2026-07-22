import React from 'react';
import { HardDrive, AlertTriangle, ShieldCheck, Database, Disc, FileText, Server } from 'lucide-react';
import { useReports } from '../context/ReportContext';

export const StorageMeterWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { storageStats, reports, loadSampleDataset, clearAllReports } = useReports();

  if (compact) {
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm">
            <HardDrive className={`w-5 h-5 ${storageStats.isNearLimit ? 'text-amber-500' : 'text-blue-600'}`} />
            <span>Total Storage Used</span>
          </div>
          <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
            {storageStats.usagePercentage}%
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              storageStats.isNearLimit ? 'bg-amber-500' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.max(2, storageStats.usagePercentage)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>{storageStats.totalSizeFormatted} used</span>
          <span>5 GB Free Tier Limit</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3.5">
          <div className={`p-3 rounded-xl ${storageStats.isNearLimit ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>
            <HardDrive className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Firebase Storage Allocation &amp; Database Status
            </h3>
            <p className="text-xs text-slate-500">
              Monitoring Firebase Firestore database and file storage allocation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {storageStats.isNearLimit ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Near Free Limit (&gt;75%)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Optimal Storage Status
            </span>
          )}
        </div>
      </div>

      {/* Main Storage Meter */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{storageStats.totalSizeFormatted}</span>
            <span className="text-xs font-semibold text-slate-500">of 5,000 MB (5 GB)</span>
          </div>
          <span className="text-sm font-extrabold text-indigo-700">
            {storageStats.usagePercentage}% Used
          </span>
        </div>

        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200 mb-3">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              storageStats.isNearLimit ? 'bg-amber-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.max(1, storageStats.usagePercentage)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Total PDF Files</span>
            <span className="text-lg font-bold text-slate-800">{storageStats.totalFiles}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Average File Size</span>
            <span className="text-lg font-bold text-slate-800">
              {storageStats.totalFiles > 0 
                ? (storageStats.totalSizeBytes / storageStats.totalFiles / 1024).toFixed(0) + ' KB'
                : '0 KB'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">CD ROM Archives</span>
            <span className="text-lg font-bold text-blue-700">{storageStats.cdRomCount} ({storageStats.cdRomPercentage}%)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Remaining Space</span>
            <span className="text-lg font-bold text-emerald-700">
              {(storageStats.remainingBytes / (1024 * 1024 * 1024)).toFixed(2)} GB
            </span>
          </div>
        </div>
      </div>

      {/* Dataset Utility Tools */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Server className="w-4 h-4 text-slate-400" />
          <span>Firebase Firestore &amp; Storage Engine Enabled</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {reports.length < 15 && (
            <button
              onClick={() => loadSampleDataset(30)}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-all flex items-center gap-1.5 min-h-[40px]"
            >
              <Database className="w-4 h-4" />
              <span>Load 30 Sample Reports</span>
            </button>
          )}

          {reports.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all stored reports from database?')) {
                  clearAllReports();
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 text-xs font-semibold border border-slate-200 transition-all min-h-[40px]"
            >
              Clear Records
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
