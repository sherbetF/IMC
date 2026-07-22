import React from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Hospital, 
  Calendar, 
  HardDrive, 
  Disc, 
  CheckCircle2, 
  Printer, 
  Share2, 
  ExternalLink 
} from 'lucide-react';
import { MedicalReport } from '../types';
import { MEDICAL_CATEGORIES, formatBytes } from '../data/presetData';
import { generateSamplePdfDataUri } from '../data/sampleGenerator';

interface PdfPreviewModalProps {
  report: MedicalReport | null;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  const categoryInfo = MEDICAL_CATEGORIES.find((c) => c.id === report.category);

  // Use Firebase Storage downloadUrl if present, or fileData, or sample fallback
  const pdfSrc = report.downloadUrl || report.fileData || generateSamplePdfDataUri(
    report.fileName,
    report.hospital,
    `${report.category} (${report.subCategory})`,
    report.reportDate
  );

  const handleDownload = () => {
    if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank');
      return;
    }
    const link = document.createElement('a');
    link.href = pdfSrc;
    link.download = report.fileName.endsWith('.pdf') ? report.fileName : `${report.fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] transition-all">
        
        {/* Modal Top Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3 truncate pr-4">
            <div className="p-2 rounded-lg bg-indigo-600/90 text-white shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold truncate text-white">
                {report.fileName}
              </h3>
              <p className="text-xs text-indigo-200/80 font-medium truncate">
                {report.hospital} — {report.subCategory}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 min-h-[38px]"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Left Preview Stage */}
          <div className="flex-1 bg-slate-100 p-4 overflow-auto flex items-center justify-center min-h-[350px] md:min-h-[500px]">
            {pdfSrc.startsWith('data:image/svg+xml') ? (
              <img 
                src={pdfSrc} 
                alt="Medical Report Preview" 
                className="max-w-full max-h-[70vh] object-contain shadow-lg rounded-lg border border-slate-300"
              />
            ) : pdfSrc.startsWith('data:application/pdf') ? (
              <iframe
                src={pdfSrc}
                title="PDF Preview"
                className="w-full h-full min-h-[480px] rounded-lg border border-slate-300 shadow-sm"
              />
            ) : (
              <img 
                src={pdfSrc} 
                alt="Medical Report Document" 
                className="max-w-full max-h-[70vh] object-contain shadow-lg rounded-lg border border-slate-300"
              />
            )}
          </div>

          {/* Right Metadata Drawer */}
          <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
            
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
                Report Metadata
              </h4>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className={`inline-block mt-1 px-2.5 py-1 rounded-md font-bold text-xs ${categoryInfo?.badgeBg || 'bg-slate-100 text-slate-800'}`}>
                  {report.category} — {report.subCategory}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Facility / Hospital</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">{report.hospital}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Report Date</span>
                  <span className="font-semibold text-slate-800">{report.reportDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">File Size</span>
                  <span className="font-semibold text-slate-800">{formatBytes(report.fileSize)}</span>
                </div>
              </div>

              {/* CD ROM Status Badge */}
              <div className="pt-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">CD ROM Archive</span>
                {report.hasCDROM ? (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold flex items-center gap-2">
                    <Disc className="w-4 h-4 text-blue-600 animate-spin-slow shrink-0" />
                    <span>Includes Physical CD ROM Disc</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-medium">
                    No CD ROM accompanied
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={handleDownload}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all min-h-[42px]"
              >
                <Download className="w-4 h-4" />
                <span>Save PDF File</span>
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: report.fileName,
                      text: `Medical report from ${report.hospital}`
                    }).catch(() => {});
                  } else {
                    handleDownload();
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all min-h-[40px]"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Document</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
