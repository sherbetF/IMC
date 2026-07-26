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

// Echocardiogram Cases Interfaces
export interface EchoCase {
  id: string;
  title: string;
  patientName?: string;
  mrn?: string;
  doneBy?: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';
  pathology: string; // e.g. "Severe Aortic Stenosis", "Mitral Regurgitation", "Amyloidosis"
  otherPathology?: string;
  description: string;
  mediaUrl?: string; // image, gif or video URL / base64 DataURI
  mediaType: 'gif' | 'image' | 'video';
  uploadDate: string;
  userId: string;
}

// Cardioscan Holter Schedule Interfaces
export type HolterStatus = 'Scheduled' | 'Hooked Up' | 'Returned' | 'Downloaded' | 'Reported';

export interface HolterSchedule {
  id: string;
  patientName: string;
  patientPhone?: string;
  deviceId: string; // e.g., "HOL-104", "HOL-205"
  hookupDate: string; // YYYY-MM-DD
  durationDays: number; // e.g., 1, 2, 3, 7, 14 days
  returnDate: string; // YYYY-MM-DD
  indication: string; // e.g., "Palpitations", "Syncope", "Atrial Fibrillation"
  status: HolterStatus;
  notes?: string;
  userId: string;
  createdAt: string;
}

// Temporary Medical Record Interfaces
export type PatientZone = 'Red Zone' | 'Yellow Zone' | 'Green Zone' | 'White Tag' | 'Transfered';

export interface ClerkingAmendment {
  id: string;
  note: string;
  bedNumber: string;
  amendedAt: string;
  amendedBy: string;
}

export interface ClerkingNote {
  id: string;
  patientId: string;
  progressNote: string;
  bedNumber: string;
  createdAt: string;
  createdBy: string; // medical personal name from login
  status: 'active' | 'error';
  amendments: ClerkingAmendment[];
}

export interface PatientProfile {
  id: string;
  name: string;
  idType: 'ic' | 'passport';
  idValue: string;
  gender: 'Male' | 'Female';
  country?: string; // only if idType is 'passport'
  currentZone: PatientZone;
  bedNumber: string;
  registeredAt: string;
  userId: string;
  createdByEmail: string;
}

// Stock Take (Venepuncture Hub) Interfaces
export type StockItemCategory = 
  | 'Blood Collection Tubes'
  | 'Needles & Butterflies'
  | 'Syringes & Lancets'
  | 'Swabs & Disinfectants'
  | 'Dressings & Tourniquets'
  | 'PPE & Consumables'
  | 'Equipment & Devices'
  | 'Other Supplies';

export interface StockBatch {
  id: string;
  batchNumber?: string; // e.g. "LOT-2026A" or "B2026-001"
  quantity: number;
  expiryDate: string; // YYYY-MM-DD
  receivedDate?: string;
  notes?: string;
}

export interface StockItem {
  id: string;
  name: string; // e.g., "EDTA K2 3ml Vacuum Tube"
  type: StockItemCategory;
  indentFrom: string; // Indent supplier e.g. "HSA Store Utama", "KPJ Central Store"
  currentStock: number;
  imcStock?: number; // Stock quantity in IMC Store
  ppdStock?: number; // Stock quantity in PPD Store
  unit: string; // e.g. "pcs", "boxes", "packs", "bottles"
  pictureUrl?: string; // base64 or URL
  pricePerUnit: number; // Price in RM
  locationStored: string; // e.g. "Cabinet A - Shelf 2"
  warningThreshold: number; // Low stock trigger threshold
  expiryDate?: string; // Earliest active batch expiryDate e.g. "2027-12-31" YYYY-MM-DD
  batches?: StockBatch[]; // Multiple expiration date batches for the same item
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type StockActionType = 'ADD' | 'REMOVE' | 'TRANSFER';

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  action: StockActionType; // 'ADD' or 'REMOVE'
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  destinationOrSource: string; // "Where stock goes / sent to who" (for REMOVE) or "Indent Origin" (for ADD)
  staffName: string; // Person who added or removed stock
  notes?: string;
  timestamp: string;
}

