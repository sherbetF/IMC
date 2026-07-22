export type ReportCategory = 'Xray' | 'Cardio' | 'Gastro' | 'Neuro' | 'Other';

export interface CategoryInfo {
  id: ReportCategory;
  name: string;
  description: string;
  subCategories: string[];
  color: string;
  badgeBg: string;
}

export type HospitalType = 'Private' | 'Government' | 'Other';

export interface HospitalInfo {
  id: string;
  name: string;
  shortName: string;
  type: HospitalType;
  location?: string;
}

export interface MedicalReport {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string; // 'application/pdf'
  category: ReportCategory;
  subCategory: string; // e.g., 'MRI', 'CT SCAN', 'Doppler', 'Echocardiogram', 'OGDS'
  hospital: string; // e.g., 'KPJ DATO ONN', 'HOSPITAL SULTANAH AMINAH'
  customHospital?: string;
  reportDate: string; // YYYY-MM-DD
  uploadDate: string; // ISO string
  patientName?: string;
  icNumber?: string;
  hasCDROM: boolean; // Tick box if report came with CD ROM
  isClaimed?: boolean; // Remark if report has been claimed by patient
  claimedDate?: string; // YYYY-MM-DD or ISO string when claimed
  notes?: string;
  userId: string;
  fileData?: string; // base64 or object URL for offline/storage view
  downloadUrl?: string;
  storagePath?: string;
}

export interface StorageStats {
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  freeTierLimitBytes: number; // e.g., 5GB = 5,368,709,120 bytes
  usagePercentage: number;
  remainingBytes: number;
  isNearLimit: boolean;
  cdRomCount: number;
  cdRomPercentage: number;
  claimedCount: number;
  claimedPercentage: number;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  subCategoryFilter: string;
  hospital: string;
  hasCDROMFilter: 'all' | 'yes' | 'no';
  isClaimedFilter: 'all' | 'claimed' | 'unclaimed';
  sortBy: 'uploadDate' | 'reportDate' | 'fileName' | 'fileSize';
  sortOrder: 'asc' | 'desc';
}
