import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Disc, 
  RefreshCw, 
  Copy, 
  Check, 
  Activity, 
  Database, 
  Lock, 
  Clock, 
  FileCheck,
  Building2,
  Server,
  Layers,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { useAuth, ADMIN_UID } from '../context/AuthContext';
import { useReports } from '../context/ReportContext';
import { formatBytes, MEDICAL_CATEGORIES, HOSPITALS } from '../data/presetData';
import { MedicalReport } from '../types';

export const AdminDashboard: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { currentUser, isDemoUser } = useAuth();
  const { 
    reports, 
    storageStats, 
    deleteReport, 
    bulkDeleteReports, 
    toggleCDROM, 
    toggleClaimed, 
    setPreviewingReport,
    resetToDefaultReports
  } = useReports();

  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [claimedFilter, setClaimedFilter] = useState<'all' | 'claimed' | 'unclaimed'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedUid, setCopiedUid] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const displayAdminUid = ADMIN_UID;

  // Filtered reports list for admin
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchQuery = !query || 
        report.fileName.toLowerCase().includes(query) ||
        (report.patientName && report.patientName.toLowerCase().includes(query)) ||
        (report.icNumber && report.icNumber.toLowerCase().includes(query)) ||
        report.hospital.toLowerCase().includes(query) ||
        report.subCategory.toLowerCase().includes(query);

      // Hospital
      const matchHospital = hospitalFilter === 'all' || report.hospital === hospitalFilter;

      // Claimed
      const matchClaimed = 
        claimedFilter === 'all' || 
        (claimedFilter === 'claimed' && report.isClaimed) || 
        (claimedFilter === 'unclaimed' && !report.isClaimed);

      // Category
      const matchCategory = categoryFilter === 'all' || report.category === categoryFilter;

      return matchQuery && matchHospital && matchClaimed && matchCategory;
    });
  }, [reports, searchQuery, hospitalFilter, claimedFilter, categoryFilter]);

  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredReports.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Copy Admin UID
  const handleCopyUid = () => {
    navigator.clipboard.writeText(displayAdminUid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  // Bulk actions
  const handleBulkClaim = async (claimStatus: boolean) => {
    setIsActionLoading(true);
    try {
      for (const id of selectedIds) {
        await toggleClaimed(id, claimStatus);
      }
      triggerSuccess(`Updated claim status for ${selectedIds.length} reports.`);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsActionLoading(true);
    try {
      await bulkDeleteReports(selectedIds);
      triggerSuccess(`Successfully deleted ${selectedIds.length} reports.`);
      setSelectedIds([]);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const triggerSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Export CSV of filtered or selected reports
  const handleExportCSV = () => {
    const listToExport = selectedIds.length > 0 
      ? reports.filter((r) => selectedIds.includes(r.id))
      : filteredReports;

    if (listToExport.length === 0) return;

    const headers = ['ID', 'Patient Name', 'IC Number', 'File Name', 'Category', 'SubCategory', 'Hospital', 'File Size (Bytes)', 'Report Date', 'Upload Date', 'CD ROM', 'Claimed Status', 'Claimed Date'];
    const rows = listToExport.map((r) => [
      `"${r.id}"`,
      `"${r.patientName || 'N/A'}"`,
      `"${r.icNumber || 'N/A'}"`,
      `"${r.fileName}"`,
      `"${r.category}"`,
      `"${r.subCategory}"`,
      `"${r.hospital}"`,
      r.fileSize,
      `"${r.reportDate}"`,
      `"${r.uploadDate}"`,
      r.hasCDROM ? 'YES' : 'NO',
      r.isClaimed ? 'CLAIMED' : 'UNCLAIMED',
      `"${r.claimedDate || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OutsourceDB_Admin_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerSuccess(`Exported ${listToExport.length} reports to CSV.`);
  };

  // Audit Log items simulation based on current database status
  const auditLogs = [
    {
      id: '1',
      timestamp: 'Just now',
      action: 'Admin Panel Authenticated',
      details: `User UID: ${displayAdminUid}`,
      type: 'security'
    },
    {
      id: '2',
      timestamp: 'Active Session',
      action: 'Firebase Storage Status OK',
      details: `${storageStats.totalFiles} files registered (${storageStats.totalSizeFormatted})`,
      type: 'storage'
    },
    {
      id: '3',
      timestamp: 'Database Connected',
      action: 'Firestore Multi-Hospital Collection Sync',
      details: `KPJ Dato Onn, Puteri, Pasir Gudang, HSA & Columbia Asia`,
      type: 'db'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-emerald-100 border border-emerald-700 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{actionSuccessMsg}</p>
        </div>
      )}

      {/* Admin Hero Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                System Administrator Control Panel
              </span>
              {isDemoUser && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-semibold">
                  Demo Admin Mode
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-futuristic">
              Outsource DB Admin Center
            </h1>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Global system monitoring, Firebase Storage inspection, patient scan verification, and multi-hospital report administration.
            </p>

            {/* Admin UID Badge */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center space-x-2 bg-slate-950/80 border border-indigo-800/80 rounded-xl px-3 py-1.5 text-xs font-mono text-indigo-200">
                <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-400">Admin UID:</span>
                <span className="font-bold text-white select-all">{displayAdminUid}</span>
                <button
                  type="button"
                  onClick={handleCopyUid}
                  className="ml-1 text-indigo-400 hover:text-white transition-colors p-1 rounded-md hover:bg-indigo-900/50"
                  title="Copy Admin UID"
                >
                  {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="inline-flex items-center space-x-1.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs px-3 py-1.5 rounded-xl font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Active Superadmin Privilege</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('upload')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Upload New PDF Scan</span>
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2"
            >
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>Storage Usage Meter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Scans</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{storageStats.totalFiles}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Total Volume:</span>
            <span className="font-bold text-slate-700">{storageStats.totalSizeFormatted}</span>
          </div>
        </div>

        {/* Card 2: Firebase Storage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Firebase Storage</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-black text-slate-900 tracking-tight">{storageStats.usagePercentage}%</p>
            <span className="text-xs text-slate-500 font-medium">of 5GB Free Tier</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${storageStats.isNearLimit ? 'bg-amber-500' : 'bg-indigo-600'}`}
              style={{ width: `${Math.max(4, storageStats.usagePercentage)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Claimed Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Claimed Scans</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 tracking-tight">{storageStats.claimedCount}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Claim Rate:</span>
            <span className="font-bold text-emerald-700">{storageStats.claimedPercentage}%</span>
          </div>
        </div>

        {/* Card 4: CD-ROM Media */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CD-ROM Media</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Disc className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 tracking-tight">{storageStats.cdRomCount}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>CD Ratio:</span>
            <span className="font-bold text-purple-700">{storageStats.cdRomPercentage}%</span>
          </div>
        </div>

      </div>

      {/* Admin Privilege & User Info Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Admin Identity & Authentication</h2>
              <p className="text-xs text-slate-500">Full administrative access parameters in Outsource DB</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            ADMIN VERIFIED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
            <span className="text-slate-400 font-medium">Designated Admin UID:</span>
            <p className="font-mono font-bold text-slate-800 text-sm break-all">{displayAdminUid}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
            <span className="text-slate-400 font-medium">Logged-in User Email:</span>
            <p className="font-semibold text-slate-800 text-sm">{currentUser?.email || 'Admin User'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
            <span className="text-slate-400 font-medium">Backend Sync:</span>
            <p className="font-semibold text-indigo-700 text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Firebase Firestore + Storage</span>
            </p>
          </div>
        </div>
      </div>

      {/* Report Records Administration Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Top Header & Controls */}
        <div className="p-5 border-b border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Global Medical Records Management</span>
              </h2>
              <p className="text-xs text-slate-500">
                Viewing {filteredReports.length} of {reports.length} total medical scans
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                title="Export Filtered CSV"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, IC, file, hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>

            {/* Hospital Filter */}
            <select
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Hospitals</option>
              {HOSPITALS.map((h) => (
                <option key={h.id} value={h.name}>{h.name}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Categories</option>
              {MEDICAL_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Claimed Filter */}
            <select
              value={claimedFilter}
              onChange={(e) => setClaimedFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Claim Statuses</option>
              <option value="claimed">Claimed Only</option>
              <option value="unclaimed">Unclaimed Only</option>
            </select>

          </div>

          {/* Batch Actions Toolbar */}
          {selectedIds.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {selectedIds.length}
                </span>
                <span className="text-xs font-bold text-indigo-900">reports selected</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkClaim(true)}
                  disabled={isActionLoading}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Claimed</span>
                </button>

                <button
                  onClick={() => handleBulkClaim(false)}
                  disabled={isActionLoading}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Mark Unclaimed</span>
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isActionLoading}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredReports.length > 0 && selectedIds.length === filteredReports.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-3.5">Patient Details</th>
                <th className="p-3.5">Report File & Hospital</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">CD-ROM</th>
                <th className="p-3.5">Claim Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-sm">No medical scans match your current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const isSelected = selectedIds.includes(report.id);
                  const cat = MEDICAL_CATEGORIES.find((c) => c.id === report.category);

                  return (
                    <tr 
                      key={report.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-indigo-50/40' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(report.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Patient Details */}
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{report.patientName || 'Unspecified Patient'}</p>
                        <p className="text-[11px] font-mono text-slate-500">
                          {report.icNumber ? `IC: ${report.icNumber}` : 'No IC recorded'}
                        </p>
                      </td>

                      {/* Report File & Hospital */}
                      <td className="p-3.5 max-w-[220px]">
                        <p className="font-semibold text-slate-800 truncate" title={report.fileName}>
                          {report.fileName}
                        </p>
                        <div className="flex items-center space-x-1.5 text-[11px] text-indigo-700 font-medium">
                          <Building2 className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">{report.hospital}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${cat?.badgeBg || 'bg-slate-100 text-slate-700'}`}>
                          {report.category} - {report.subCategory}
                        </span>
                      </td>

                      {/* CD-ROM */}
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => toggleCDROM(report.id, !report.hasCDROM)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-all ${
                            report.hasCDROM 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                          title="Toggle CD-ROM Status"
                        >
                          <Disc className="w-3 h-3" />
                          <span>{report.hasCDROM ? 'YES' : 'NO'}</span>
                        </button>
                      </td>

                      {/* Claim Status */}
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => toggleClaimed(report.id, !report.isClaimed)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-all ${
                            report.isClaimed 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                          title="Toggle Claimed Status"
                        >
                          {report.isClaimed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Claimed</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Unclaimed</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => setPreviewingReport(report)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Preview Medical PDF Scan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete report "${report.fileName}"?`)) {
                              await deleteReport(report.id);
                              triggerSuccess('Report deleted.');
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          <span>Admin Audit & System Logs</span>
        </h3>

        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start justify-between text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">{log.action}</p>
                <p className="text-slate-500">{log.details}</p>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 bg-slate-200/60 rounded-full">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Delete Modal Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Confirm Bulk Delete</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently remove <span className="font-bold text-slate-900">{selectedIds.length}</span> selected medical reports and their associated Firebase Storage files?
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isActionLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
              >
                {isActionLoading ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
