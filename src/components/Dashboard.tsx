import React, { useState } from 'react';
import { 
  FileText, 
  HardDrive, 
  Disc, 
  Building2, 
  Upload, 
  ArrowRight, 
  Eye, 
  Plus,
  Stethoscope,
  CheckCircle2,
  Clock,
  Search,
  Activity,
  Layers,
  Award,
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { useReports } from '../context/ReportContext';
import { HOSPITALS, MEDICAL_CATEGORIES, formatBytes } from '../data/presetData';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { reports, storageStats, setPreviewingReport, toggleClaimedStatus, setFilters } = useReports();

  const totalReports = reports.length;
  const claimedCount = reports.filter((r) => r.isClaimed).length;
  const unclaimedCount = totalReports - claimedCount;
  const claimedPercentage = totalReports > 0 ? Math.round((claimedCount / totalReports) * 100) : 0;

  // 1. Hospital Comparison Chart Data
  const hospitalChartData = HOSPITALS.map((h) => {
    const count = reports.filter((r) => r.hospital === h.shortName).length;
    const percentage = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
    return {
      name: h.shortName,
      fullName: h.name,
      count,
      percentage
    };
  }).sort((a, b) => b.count - a.count);

  // Colors for Hospital chart bars
  const hospitalColors = ['#4F46E5', '#6366F1', '#818CF8', '#7C3AED', '#8B5CF6', '#A855F7', '#C084FC'];

  // 2. Most Report By Type Data
  const typeMap: { [type: string]: number } = {};
  reports.forEach((r) => {
    const typeName = r.subCategory || 'General Scan';
    typeMap[typeName] = (typeMap[typeName] || 0) + 1;
  });

  const sortedTypes = Object.entries(typeMap)
    .map(([typeName, count]) => ({
      type: typeName,
      count,
      percentage: totalReports > 0 ? Math.round((count / totalReports) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  const topReportType = sortedTypes[0] || { type: 'None', count: 0, percentage: 0 };

  const recentUploads = [...reports]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 5);

  const handleHospitalClick = (hospitalShortName: string) => {
    setFilters((prev) => ({ ...prev, hospital: hospitalShortName }));
    setActiveTab('files');
  };

  const handleTypeClick = (typeName: string) => {
    setFilters((prev) => ({ ...prev, subCategoryFilter: typeName }));
    setActiveTab('files');
  };

  return (
    <div className="space-y-6">
      
      {/* Metric Cards Banner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: TOTAL REPORT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TOTAL REPORT</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 font-futuristic">{totalReports}</span>
            <span className="text-xs font-bold text-indigo-600">PDF Scans</span>
          </div>
          <p className="text-[11px] text-slate-500">Archived outsource medical files</p>
        </div>

        {/* Card 2: CLAIMED BY PATIENT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CLAIMED BY PATIENT</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 font-futuristic">{claimedCount}</span>
            <span className="text-xs font-bold text-emerald-600">{claimedPercentage}% Claimed</span>
          </div>
          <p className="text-[11px] text-slate-500">{unclaimedCount} pending patient collection</p>
        </div>

        {/* Card 3: MOST REPORT TYPE FIGURE */}
        <div 
          onClick={() => topReportType.type !== 'None' && handleTypeClick(topReportType.type)}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-indigo-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TOP REPORT TYPE</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 truncate">
            <span className="text-2xl font-extrabold text-slate-900 font-futuristic truncate">{topReportType.type}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-bold text-indigo-600">{topReportType.count} Reports ({topReportType.percentage}%)</span>
            <span className="text-[10px] text-slate-400">#1 Scan Type</span>
          </div>
        </div>

        {/* Card 4: TOTAL STORAGE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">FIREBASE STORAGE &amp; CD ROM</span>
            <div className={`p-2.5 rounded-xl ${storageStats.isNearLimit ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-700'}`}>
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 font-futuristic">{storageStats.totalSizeFormatted}</span>
            <span className="text-xs font-bold text-rose-600">{storageStats.cdRomCount} CDs</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${storageStats.isNearLimit ? 'bg-amber-500' : 'bg-blue-600'}`}
              style={{ width: `${Math.max(3, storageStats.usagePercentage)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Main Analytics Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRAPH: Compare Total Report Between Hospital (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-futuristic">Hospital Report Comparison</h3>
                <p className="text-[11px] text-slate-400">Total reports uploaded per healthcare facility</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hospitalChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-bold border-b border-slate-700 pb-1">{data.fullName}</p>
                          <p className="text-blue-300 font-semibold">{data.count} Total Reports ({data.percentage}% of overall)</p>
                          <p className="text-[10px] text-slate-400">Click bar to view files</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]}
                  onClick={(entry) => handleHospitalClick(entry.name)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {hospitalChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={hospitalColors[index % hospitalColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hospital quick stat list below graph */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
            {hospitalChartData.slice(0, 4).map((h) => (
              <div 
                key={h.name}
                onClick={() => handleHospitalClick(h.name)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 cursor-pointer transition-all"
              >
                <p className="text-[10px] text-slate-500 font-bold truncate">{h.name}</p>
                <p className="text-base font-extrabold text-slate-900 font-futuristic">{h.count} <span className="text-[10px] font-normal text-slate-500">PDFs</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* FIGURE: Most Report By Type (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-futuristic">Most Report By Type</h3>
                <p className="text-[11px] text-slate-400">Rankings of test &amp; procedure scans</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('files')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Featured #1 Figure Highlight Card */}
          {topReportType.type !== 'None' && (
            <div 
              onClick={() => handleTypeClick(topReportType.type)}
              className="p-4 rounded-xl bg-gradient-to-r from-indigo-900 to-blue-900 text-white shadow-md cursor-pointer hover:shadow-lg transition-all space-y-2 relative overflow-hidden group"
            >
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xs pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-bold uppercase tracking-wider">
                  #1 Highest Volume Test
                </span>
                <span className="text-xs text-indigo-200 font-bold">{topReportType.percentage}% of all scans</span>
              </div>
              <div className="relative z-10">
                <h4 className="text-xl font-extrabold tracking-tight group-hover:text-indigo-200 transition-colors font-futuristic">
                  {topReportType.type}
                </h4>
                <p className="text-xs text-indigo-100 font-medium">
                  {topReportType.count} archived PDF reports in database
                </p>
              </div>
            </div>
          )}

          {/* Leaderboard Figure List */}
          <div className="space-y-2.5 pt-1">
            {sortedTypes.slice(0, 5).map((item, idx) => (
              <div 
                key={item.type}
                onClick={() => handleTypeClick(item.type)}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <div className="flex items-center space-x-2">
                    <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-extrabold ${
                      idx === 0 ? 'bg-indigo-600 text-white' : idx === 1 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="group-hover:text-indigo-600 transition-colors">{item.type}</span>
                  </div>
                  <span className="font-mono text-slate-900">{item.count} reports ({item.percentage}%)</span>
                </div>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-blue-600' : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.max(4, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Scanned Uploads Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm font-futuristic">Recent Outsource Scans</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('upload')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs min-h-[38px]"
            >
              <Plus className="w-4 h-4" />
              <span>Upload PDF Scan</span>
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all min-h-[38px]"
            >
              Master File Index
            </button>
          </div>
        </div>

        {recentUploads.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No medical reports uploaded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {recentUploads.map((report) => (
              <div key={report.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors px-2 rounded-xl">
                <div 
                  onClick={() => setPreviewingReport(report)}
                  className="flex items-center space-x-3 cursor-pointer truncate flex-1 min-w-0"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate hover:text-blue-600 transition-colors">{report.fileName}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {report.hospital} • <span className="font-semibold text-slate-700">{report.subCategory}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {/* Claim Status Badge Button */}
                  <button
                    type="button"
                    onClick={() => toggleClaimedStatus(report.id, !report.isClaimed)}
                    className={`
                      px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 min-h-[32px]
                      ${report.isClaimed 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'}
                    `}
                    title={report.isClaimed ? "Claimed by patient (Click to unmark)" : "Pending pickup (Click to mark as claimed)"}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${report.isClaimed ? 'text-emerald-600' : 'text-amber-500'}`} />
                    <span className="hidden sm:inline">{report.isClaimed ? 'Claimed' : 'Unclaimed'}</span>
                  </button>

                  <span className="text-[11px] text-slate-400 font-mono hidden md:inline">{formatBytes(report.fileSize)}</span>

                  <button
                    onClick={() => setPreviewingReport(report)}
                    className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    title="View PDF"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
