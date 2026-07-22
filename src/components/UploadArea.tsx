import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckSquare, 
  Square, 
  Hospital, 
  Tag, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Disc, 
  Camera,
  FolderOpen
} from 'lucide-react';
import { useReports } from '../context/ReportContext';
import { HOSPITALS, MEDICAL_CATEGORIES, formatBytes } from '../data/presetData';
import { ReportCategory } from '../types';

export const UploadArea: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { addReport } = useReports();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [patientName, setPatientName] = useState<string>('Ahmad Rizal Bin Hassan');
  const [icNumber, setIcNumber] = useState<string>('880315015432');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [category, setCategory] = useState<ReportCategory>('Xray');
  const [subCategory, setSubCategory] = useState<string>('MRI (Magnetic Resonance)');
  const [hospital, setHospital] = useState<string>('KPJ DATO ONN');
  const [customHospital, setCustomHospital] = useState<string>('');
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hasCDROM, setHasCDROM] = useState<boolean>(false);
  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  const [fileDataUri, setFileDataUri] = useState<string>('');

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Category subcategory helper
  const selectedCatObj = MEDICAL_CATEGORIES.find((c) => c.id === category) || MEDICAL_CATEGORIES[0];

  const handleCategoryChange = (cat: ReportCategory) => {
    setCategory(cat);
    const catObj = MEDICAL_CATEGORIES.find((c) => c.id === cat);
    if (catObj && catObj.subCategories.length > 0) {
      setSubCategory(catObj.subCategories[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setFileSize(file.size);
    setErrorMessage(null);
    // Auto generate standardized filename
    const cleanName = patientName.trim().replace(/ /g, '_');
    const cleanIc = icNumber.trim();
    setFileName(`${cleanName || 'Patient'}_${cleanIc || 'IC'}_${subCategory.split(' ')[0]}_${hospital.replace(/ /g, '_')}.pdf`);

    // Read as Data URI for PDF preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileDataUri(e.target?.result as string || '');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedFile) {
      setErrorMessage('Please select or upload a PDF file first before submitting.');
      return;
    }

    if (!fileName.trim()) {
      setErrorMessage('Please provide a file name for the report.');
      return;
    }

    setSubmitting(true);
    setSuccessMessage(null);

    const finalHospitalName = hospital === 'OTHER' && customHospital.trim() ? customHospital.trim() : hospital;
    const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    try {
      await addReport({
        fileName: finalFileName,
        fileSize: fileSize || selectedFile.size || 250000,
        fileType: selectedFile.type || 'application/pdf',
        category,
        subCategory,
        hospital: finalHospitalName,
        customHospital: hospital === 'OTHER' ? customHospital : undefined,
        patientName: patientName.trim(),
        icNumber: icNumber.trim(),
        reportDate,
        hasCDROM,
        isClaimed,
        claimedDate: isClaimed ? new Date().toISOString().split('T')[0] : undefined,
        fileData: fileDataUri
      }, selectedFile);

      setSuccessMessage(`Successfully uploaded report to Firebase Storage: "${finalFileName}" (${formatBytes(fileSize)})`);
      
      // Reset form
      setSelectedFile(null);
      setFileName('');
      setFileSize(0);
      setHasCDROM(false);
      setIsClaimed(false);
      setFileDataUri('');

      if (onSuccess) {
        setTimeout(onSuccess, 1200);
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setErrorMessage('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Upload className="w-6 h-6 text-blue-600" />
          <span>Upload Outsource Medical Report</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Scan and archive PDF reports from KPJ Dato Onn, KPJ Puteri, KPJ Pasir Gudang, KPJ Johor, Columbia Asia Tebrau, HSA &amp; others.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* File Drag and Drop Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50/80' 
            : selectedFile 
              ? 'border-emerald-300 bg-emerald-50/40' 
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {selectedFile ? (
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
              <FileText className="w-8 h-8" />
            </div>
          ) : (
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <FolderOpen className="w-8 h-8" />
            </div>
          )}

          <div>
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                <p className="text-xs text-emerald-700 font-semibold">{formatBytes(selectedFile.size)} selected</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Tap or Drag PDF file here to upload
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supports scanned PDF reports (approx. 200 KB + each)
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all flex items-center gap-1.5 min-h-[38px]">
              <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
              Browse Device Files
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all flex items-center gap-1.5 min-h-[38px]">
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              Scan with iOS / Camera
            </span>
          </div>
        </div>
      </div>

      {/* Upload Metadata Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Patient Name & IC Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Patient Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => {
                const newName = e.target.value;
                setPatientName(newName);
                const cleanName = newName.trim().replace(/ /g, '_');
                const cleanIc = icNumber.trim();
                setFileName(`${cleanName || 'Patient'}_${cleanIc || 'IC'}_${subCategory.split(' ')[0]}_${hospital.replace(/ /g, '_')}.pdf`);
              }}
              placeholder="e.g. Ahmad Rizal Bin Hassan"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Patient IC Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={icNumber}
              onChange={(e) => {
                const newIc = e.target.value;
                setIcNumber(newIc);
                const cleanName = patientName.trim().replace(/ /g, '_');
                const cleanIc = newIc.trim();
                setFileName(`${cleanName || 'Patient'}_${cleanIc || 'IC'}_${subCategory.split(' ')[0]}_${hospital.replace(/ /g, '_')}.pdf`);
              }}
              placeholder="e.g. 880315015432"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono font-medium min-h-[44px]"
            />
          </div>
        </div>

        {/* Document Title / File Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Generated Report File Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="e.g. Ahmad_Rizal_880315015432_MRI_KPJ_DATO_ONN.pdf"
            className="w-full px-3.5 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono font-medium bg-slate-50"
          />
          <p className="text-[11px] text-slate-500 mt-1">Includes Patient Name and IC Number in compliance with medical archive standards.</p>
        </div>

        {/* Medical Category & Sub-Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Report Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as ReportCategory)}
              className="w-full px-3 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 font-semibold bg-white min-h-[44px]"
            >
              {MEDICAL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Sub-Category / Test Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full px-3 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 font-medium bg-white min-h-[44px]"
            >
              {selectedCatObj.subCategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hospital Selection Presets */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Hospital / Medical Facility <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {HOSPITALS.map((h) => {
              const isSelected = hospital === h.shortName;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHospital(h.shortName)}
                  className={`
                    px-3 py-2 rounded-xl text-xs font-bold border transition-all min-h-[40px]
                    ${isSelected 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}
                  `}
                >
                  {h.shortName}
                </button>
              );
            })}
          </div>

          {hospital === 'OTHER' && (
            <input
              type="text"
              required
              value={customHospital}
              onChange={(e) => setCustomHospital(e.target.value)}
              placeholder="Enter custom hospital / clinic name"
              className="w-full mt-2 px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
            />
          )}
        </div>

        {/* Report Date & CD ROM / Patient Claim Toggles */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Report / Scan Date
            </label>
            <input
              type="date"
              required
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CD ROM Tick Box */}
            <div
              onClick={() => setHasCDROM(!hasCDROM)}
              className={`
                p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between min-h-[48px]
                ${hasCDROM 
                  ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}
              `}
            >
              <div className="flex items-center space-x-3">
                <Disc className={`w-5 h-5 ${hasCDROM ? 'text-blue-600 animate-spin-slow' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold block">CD ROM Included</span>
                  <span className="text-[10px] text-slate-500">Physical disc on file</span>
                </div>
              </div>

              {hasCDROM ? (
                <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-slate-400 shrink-0" />
              )}
            </div>

            {/* Patient Claim Remark Toggle */}
            <div
              onClick={() => setIsClaimed(!isClaimed)}
              className={`
                p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between min-h-[48px]
                ${isClaimed 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}
              `}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle2 className={`w-5 h-5 ${isClaimed ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold block">Claimed by Patient</span>
                  <span className="text-[10px] text-slate-500">{isClaimed ? 'Marked as collected' : 'Pending patient pickup'}</span>
                </div>
              </div>

              {isClaimed ? (
                <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-slate-400 shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={submitting || !selectedFile || !fileName.trim()}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
          >
            {submitting ? (
              <span>Saving Report to Cloud...</span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Save Medical PDF to Database</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
