import React from 'react';
import { BarChart3, Building2, Disc, FileText, Download, PieChart, ShieldCheck, HardDrive } from 'lucide-react';
import { useReports } from '../context/ReportContext';
import { HOSPITALS, MEDICAL_CATEGORIES, formatBytes } from '../data/presetData';

export const AnalyticsView: React.FC = () => {
  const { reports, storageStats } = useReports();

  // Export metadata to CSV feature
  const exportToCSV = () => {
    if (reports.length === 0) return;

    const headers = ['File Name', 'Category', 'SubCategory', 'Hospital', 'Report Date', 'Size (Bytes)', 'Has CD ROM', 'Notes'];
    const rows = reports.map((r) => [
      `"${r.fileName.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.subCategory}"`,
      `"${r.hospital}"`,
      `"${r.reportDate}"`,
      r.fileSize,
      r.hasCDROM ? 'YES' : 'NO',
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Outsource_Database_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Outsource Hospital &amp; Medical Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown across KPJ Dato Onn, KPJ Puteri, KPJ Pasir Gudang, KPJ Johor, Columbia Asia Tebrau, HSA &amp; others.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          disabled={reports.length === 0}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 min-h-[42px]"
        >
          <Download className="w-4 h-4" />
          <span>Export Database CSV</span>
        </button>
      </div>

      {/* Hospital Breakdown Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Private Hospitals */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Private Specialist Hospitals</span>
            </h3>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
              Private Sector
            </span>
          </div>

          <div className="space-y-3.5">
            {HOSPITALS.filter((h) => h.type === 'Private').map((h) => {
              const count = reports.filter((r) => r.hospital === h.shortName).length;
              const cdCount = reports.filter((r) => r.hospital === h.shortName && r.hasCDROM).length;
              const percentage = reports.length > 0 ? Math.round((count / reports.length) * 100) : 0;

              return (
                <div key={h.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                    <span>{h.name}</span>
                    <span className="font-mono text-blue-700">{count} PDFs ({percentage}%)</span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, percentage)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Short Name: {h.shortName}</span>
                    <span className="text-slate-700 font-semibold">{cdCount} CD ROMs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Government Hospitals */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Government Hospitals</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Public Sector
            </span>
          </div>

          <div className="space-y-3.5">
            {HOSPITALS.filter((h) => h.type === 'Government' || h.type === 'Other').map((h) => {
              const count = reports.filter((r) => r.hospital === h.shortName).length;
              const cdCount = reports.filter((r) => r.hospital === h.shortName && r.hasCDROM).length;
              const percentage = reports.length > 0 ? Math.round((count / reports.length) * 100) : 0;

              return (
                <div key={h.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                    <span>{h.name}</span>
                    <span className="font-mono text-emerald-700">{count} PDFs ({percentage}%)</span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, percentage)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Short Name: {h.shortName}</span>
                    <span className="text-slate-700 font-semibold">{cdCount} CD ROMs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Category Deep-Dive Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Medical Modality Matrix</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {MEDICAL_CATEGORIES.map((cat) => {
            const catReports = reports.filter((r) => r.category === cat.id);
            const sizeBytes = catReports.reduce((acc, r) => acc + r.fileSize, 0);

            return (
              <div key={cat.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">{cat.name}</span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {catReports.length} <span className="text-xs font-medium text-slate-500">PDFs</span>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">
                  Storage: {formatBytes(sizeBytes)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
