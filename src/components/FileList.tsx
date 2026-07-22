import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  Search, 
  CheckSquare, 
  Square, 
  Building2, 
  Clock,
  AlertCircle,
  Plus,
  Filter,
  RefreshCw,
  Tag,
  UserCheck,
  Heart,
  Brain,
  Scan,
  Microscope,
  Stethoscope,
  User,
  CreditCard
} from 'lucide-react';
import { useReports } from '../context/ReportContext';
import { HOSPITALS, MEDICAL_CATEGORIES, ALL_REPORT_TYPES, formatBytes } from '../data/presetData';

// Helper function to return icon corresponding to report category/type
const getReportTypeIcon = (category: string, subCategory: string) => {
  const cat = (category || '').toLowerCase();
  const sub = (subCategory || '').toLowerCase();

  if (cat.includes('cardio') || sub.includes('echo') || sub.includes('ecg') || sub.includes('cardio') || sub.includes('holter') || sub.includes('angiogram') || sub.includes('stress')) {
    return <Heart className="w-4 h-4 text-rose-600 shrink-0" title="Cardiology" />;
  }
  if (cat.includes('neuro') || sub.includes('brain') || sub.includes('eeg') || sub.includes('ncs') || sub.includes('neuro') || sub.includes('spine')) {
    return <Brain className="w-4 h-4 text-purple-600 shrink-0" title="Neurology" />;
  }
  if (cat.includes('xray') || cat.includes('x-ray') || sub.includes('xray') || sub.includes('x-ray') || sub.includes('ct') || sub.includes('mri') || sub.includes('usg') || sub.includes('ultrasound') || sub.includes('mammogram') || sub.includes('scan') || sub.includes('doppler')) {
    return <Scan className="w-4 h-4 text-blue-600 shrink-0" title="Radiology & Scan" />;
  }
  if (cat.includes('lab') || cat.includes('patho') || sub.includes('blood') || sub.includes('lab') || sub.includes('biopsy') || sub.includes('urine')) {
    return <Microscope className="w-4 h-4 text-emerald-600 shrink-0" title="Laboratory" />;
  }
  return <Stethoscope className="w-4 h-4 text-amber-600 shrink-0" title="General Medical" />;
};

const getReportTypeBadge = (category: string, subCategory: string) => {
  const cat = (category || '').toLowerCase();
  const sub = (subCategory || '').toLowerCase();

  let label = category || 'General';
  let colorStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  if (cat.includes('cardio') || sub.includes('echo') || sub.includes('ecg') || sub.includes('cardio')) {
    label = 'Cardiology';
    colorStyle = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (cat.includes('neuro') || sub.includes('brain') || sub.includes('eeg') || sub.includes('neuro')) {
    label = 'Neurology';
    colorStyle = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (cat.includes('xray') || cat.includes('x-ray') || sub.includes('xray') || sub.includes('ct') || sub.includes('mri') || sub.includes('usg') || sub.includes('scan')) {
    label = 'Radiology';
    colorStyle = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (cat.includes('lab') || cat.includes('patho') || sub.includes('blood')) {
    label = 'Lab Test';
    colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${colorStyle}`}>
      {getReportTypeIcon(category, subCategory)}
      <span>{label}</span>
    </div>
  );
};

export const FileList: React.FC<{ onNavigateUpload?: () => void }> = ({ onNavigateUpload }) => {
  const { 
    filteredReports, 
    filters, 
    setFilters, 
    deleteReport, 
    bulkDeleteReports, 
    toggleCDROM, 
    toggleClaimedStatus,
    setPreviewingReport,
    reports 
  } = useReports();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState<boolean>(false);

  // Toggle selection for bulk actions
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReports.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReports.map((r) => r.id));
    }
  };

  const handleDeleteOne = async (id: string) => {
    await deleteReport(id);
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setDeleteConfirmId(null);
  };

  const handleBulkDelete = async () => {
    await bulkDeleteReports(selectedIds);
    setSelectedIds([]);
    setShowBulkDeleteConfirm(false);
  };

  const resetAllFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      subCategoryFilter: 'all',
      hospital: 'all',
      hasCDROMFilter: 'all',
      isClaimedFilter: 'all',
      sortBy: 'uploadDate',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="space-y-5">
      
      {/* Top Filter & Search Control Panel */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        
        {/* Search Bar & Primary Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by hospital, IC / passport, patient name, test type (ECHO, MRI, CT SCAN, OGDS)..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-800 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Reset Filters button */}
            {(filters.searchQuery || filters.category !== 'all' || filters.subCategoryFilter !== 'all' || filters.hospital !== 'all' || filters.isClaimedFilter !== 'all' || filters.hasCDROMFilter !== 'all') && (
              <button
                onClick={resetAllFilters}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[42px]"
                title="Reset all search filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}

            {/* Bulk delete action trigger */}
            {selectedIds.length > 0 && (
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 min-h-[42px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete ({selectedIds.length})</span>
              </button>
            )}

            {onNavigateUpload && (
              <button
                onClick={onNavigateUpload}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 min-h-[42px]"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Dropdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
          
          {/* Main Category Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
            >
              <option value="all">All Departments</option>
              {MEDICAL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Specific Test Type Filter (ECHO, MRI, CT SCAN, OGDS, etc.) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Specific Test Type</label>
            <select
              value={filters.subCategoryFilter || 'all'}
              onChange={(e) => setFilters((prev) => ({ ...prev, subCategoryFilter: e.target.value }))}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
            >
              <option value="all">All Test Types</option>
              <option value="MRI">MRI Scan</option>
              <option value="CT SCAN">CT Scan</option>
              <option value="Echocardiogram">Echocardiogram (ECHO)</option>
              <option value="OGDS">OGDS (Gastroscopy)</option>
              <option value="Colonoscopy">Colonoscopy</option>
              <option value="EUS">EUS (Endoscopic Ultrasound)</option>
              <option value="ERCP">ERCP</option>
              <option value="Invasive Angiogram">Invasive Angiogram</option>
              <option value="CT Angiogram">CT Angiogram</option>
              <option value="Holter">Holter Monitor</option>
              <option value="Stress Test">Exercise Stress Test</option>
              <option value="EEG">EEG (Neuro)</option>
              <option value="NCS">NCS (Nerve Conduction)</option>
              <option value="Doppler">Doppler Ultrasound</option>
              <option value="USG">Ultrasound (USG)</option>
            </select>
          </div>

          {/* Hospital Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hospital / Facility</label>
            <select
              value={filters.hospital}
              onChange={(e) => setFilters((prev) => ({ ...prev, hospital: e.target.value }))}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 min-h-[38px]"
            >
              <option value="all">All Hospitals</option>
              {HOSPITALS.map((h) => (
                <option key={h.id} value={h.shortName}>{h.shortName}</option>
              ))}
            </select>
          </div>

          {/* Patient Claim Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Patient Status</label>
            <select
              value={filters.isClaimedFilter || 'all'}
              onChange={(e) => setFilters((prev) => ({ ...prev, isClaimedFilter: e.target.value as any }))}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 min-h-[38px]"
            >
              <option value="all">All Claim Statuses</option>
              <option value="claimed">Claimed by Patient</option>
              <option value="unclaimed">Unclaimed / Pending Pickup</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sort Order</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setFilters((prev) => ({ ...prev, sortBy: sb as any, sortOrder: so as any }));
              }}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 min-h-[38px]"
            >
              <option value="uploadDate-desc">Newest Upload First</option>
              <option value="uploadDate-asc">Oldest Upload First</option>
              <option value="reportDate-desc">Report Date (Recent)</option>
              <option value="fileSize-desc">File Size (Largest)</option>
              <option value="fileName-asc">File Name (A-Z)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Reports Count & Selection Stats Bar */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
        <span>Showing <strong className="text-slate-900 font-bold">{filteredReports.length}</strong> of {reports.length} PDF reports</span>
        {selectedIds.length > 0 && (
          <span className="text-blue-700 font-bold">{selectedIds.length} item(s) selected</span>
        )}
      </div>

      {/* Main Master List View Table */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-futuristic">No medical reports found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {reports.length === 0 
              ? "Your outsource database is currently empty. Upload your scanned PDF files to populate the system."
              : "No reports match your current filter selections. Try resetting your search filters."}
          </p>
          {onNavigateUpload && (
            <button
              onClick={onNavigateUpload}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition-all inline-flex items-center gap-1.5 min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>Upload PDF Reports Now</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[1300px] text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 pl-3.5 pr-2 w-10 min-w-[40px]">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredReports.length}
                      onChange={toggleSelectAll}
                      className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </th>
                  <th className="px-3.5 py-3 min-w-[180px] whitespace-nowrap">Patient Name</th>
                  <th className="px-3.5 py-3 min-w-[140px] whitespace-nowrap">IC / Passport</th>
                  <th className="px-3.5 py-3 min-w-[160px] whitespace-nowrap">Hospital</th>
                  <th className="px-3.5 py-3 min-w-[180px] whitespace-nowrap">Scan / Report Type</th>
                  <th className="px-3.5 py-3 min-w-[120px] whitespace-nowrap">Report Date</th>
                  <th className="px-3.5 py-3 min-w-[190px] whitespace-nowrap">Size &amp; Status</th>
                  <th className="px-3 py-3 text-center min-w-[100px] whitespace-nowrap">CD ROM</th>
                  <th className="px-3.5 py-3 pr-4 text-right min-w-[130px] whitespace-nowrap sticky right-0 bg-slate-50 z-20 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.08)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredReports.map((report) => {
                  const isSelected = selectedIds.includes(report.id);

                  return (
                    <tr 
                      key={report.id}
                      className={`transition-colors border-b border-slate-100 ${
                        report.isClaimed 
                          ? 'bg-yellow-100/90 hover:bg-yellow-200/90 text-amber-950 font-medium border-l-4 border-l-yellow-500' 
                          : isSelected 
                            ? 'bg-indigo-50/50 hover:bg-indigo-50/80' 
                            : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-2.5 pl-3.5 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(report.id)}
                          className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                      </td>

                      {/* Patient Name */}
                      <td className="px-3.5 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getReportTypeIcon(report.category, report.subCategory)}
                          <span>{report.patientName || 'Ahmad Rizal'}</span>
                        </div>
                      </td>

                      {/* IC Number / Passport */}
                      <td className="px-3.5 py-2.5 font-mono text-slate-700 font-semibold whitespace-nowrap">
                        {report.icNumber || '880315015432'}
                      </td>

                      {/* Hospital */}
                      <td className="px-3.5 py-2.5 font-semibold text-slate-800 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {report.hospital}
                        </span>
                      </td>

                      {/* File Type Only (No File Name) */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <button 
                          type="button"
                          onClick={() => setPreviewingReport(report)}
                          className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer flex items-center gap-2 group text-left"
                          title="Click to view report"
                        >
                          <span className="text-xs text-indigo-800 font-bold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/80 group-hover:bg-indigo-100 transition-colors">
                            {report.subCategory}
                          </span>
                        </button>
                      </td>

                      {/* Report Date */}
                      <td className="px-3.5 py-2.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {report.reportDate}
                      </td>

                      {/* File Size & CLAIMED Popup right next to file size */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-600 font-mono font-medium">
                            {formatBytes(report.fileSize)}
                          </span>
                          {report.isClaimed && (
                            <span className="px-2 py-0.5 rounded bg-yellow-300 text-amber-950 text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 border border-yellow-400 shadow-2xs">
                              <UserCheck className="w-3 h-3 text-amber-900" />
                              CLAIMED
                            </span>
                          )}
                        </div>
                      </td>

                      {/* CD ROM Interactive Box */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleCDROM(report.id, !report.hasCDROM)}
                          className={`
                            inline-flex items-center justify-center p-1.5 rounded-lg border transition-all
                            ${report.hasCDROM 
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'}
                          `}
                          title={report.hasCDROM ? 'Report has CD ROM attached' : 'No CD ROM'}
                        >
                          {report.hasCDROM ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Actions - Sticky right to prevent clipping */}
                      <td className={`px-3.5 py-2.5 pr-4 text-right whitespace-nowrap sticky right-0 z-10 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.08)] ${
                        report.isClaimed ? 'bg-yellow-100' : isSelected ? 'bg-indigo-50' : 'bg-white'
                      }`}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => toggleClaimedStatus(report.id, !report.isClaimed)}
                            className={`
                              p-1.5 rounded-lg border transition-all shadow-2xs flex items-center justify-center min-h-[34px] min-w-[34px]
                              ${report.isClaimed 
                                ? 'bg-yellow-300 text-amber-950 border-yellow-400 hover:bg-yellow-400' 
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-amber-700 hover:bg-amber-50'}
                            `}
                            title={report.isClaimed ? "Claimed by patient (Click to unmark)" : "Mark as claimed by patient"}
                          >
                            <UserCheck className={`w-4 h-4 ${report.isClaimed ? 'text-amber-950 font-bold' : 'text-slate-500'}`} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(report.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center border border-slate-200"
                            title="Delete File"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredReports.map((report) => {
              return (
                <div 
                  key={report.id} 
                  className={`p-4 space-y-3 transition-colors ${
                    report.isClaimed 
                      ? 'bg-yellow-100/90 border-l-4 border-l-yellow-500 text-amber-950 font-medium' 
                      : 'bg-white'
                  }`}
                >
                  
                  <div className="flex items-center justify-between gap-2">
                    <div 
                      onClick={() => setPreviewingReport(report)}
                      className="font-bold text-slate-900 text-sm flex items-center gap-2 cursor-pointer"
                    >
                      {getReportTypeIcon(report.category, report.subCategory)}
                      <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                        {report.subCategory}
                      </span>
                    </div>

                    {getReportTypeBadge(report.category, report.subCategory)}
                  </div>

                  {/* Patient Info Card */}
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 text-xs space-y-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      {report.patientName || 'Ahmad Rizal Bin Hassan'}
                    </p>
                    <p className="text-slate-600 font-mono text-[11px] flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      IC / Passport: <span className="font-semibold text-slate-800">{report.icNumber || '880315015432'}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Hospital</span>
                      <span className="font-semibold text-slate-800">{report.hospital}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Date &amp; Size</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold">{report.reportDate} ({formatBytes(report.fileSize)})</span>
                        {report.isClaimed && (
                          <span className="px-1.5 py-0.5 rounded bg-yellow-300 text-amber-950 font-extrabold text-[10px] uppercase border border-yellow-400">
                            CLAIMED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Patient Claim & Actions (Eye icon removed) */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleClaimedStatus(report.id, !report.isClaimed)}
                      className={`
                        px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 min-h-[38px]
                        ${report.isClaimed 
                          ? 'bg-yellow-300 border-yellow-400 text-amber-950 hover:bg-yellow-400' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50'}
                      `}
                    >
                      <UserCheck className={`w-4 h-4 ${report.isClaimed ? 'text-amber-950' : 'text-slate-500'}`} />
                      <span>{report.isClaimed ? 'Claimed' : 'Mark Claimed'}</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(report.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                      title="Delete File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Delete Single Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-futuristic">Delete Medical Report?</h3>
              <p className="text-xs text-slate-500">
                This report document will be permanently removed from your outsource database.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 min-h-[42px]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOne(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold min-h-[42px]"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-futuristic">Delete {selectedIds.length} Reports?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete all selected medical report records from database?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 min-h-[42px]"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold min-h-[42px]"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
