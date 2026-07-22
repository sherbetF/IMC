import { CategoryInfo, HospitalInfo, ReportCategory } from '../types';

export const MEDICAL_CATEGORIES: CategoryInfo[] = [
  {
    id: 'Xray',
    name: 'X-Ray & Radiology',
    description: 'MRI, CT Scan, Ultrasound, Doppler & Plain X-Rays',
    subCategories: [
      'MRI (Magnetic Resonance)',
      'CT SCAN (Computed Tomography)',
      'Doppler Ultrasound',
      'USG (Ultrasound)',
      'Plain X-Ray',
      'Mammogram',
      'Bone Densitometry (DEXA)'
    ],
    color: '#0284C7', // Sky blue
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    id: 'Cardio',
    name: 'Cardiology',
    description: 'Angiograms, Echocardiograms, Holter & Stress Tests',
    subCategories: [
      'Invasive Angiogram',
      'CT Angiogram',
      'Echocardiogram (ECHO)',
      'Holter Monitor',
      'Exercise Stress Test (TMT)',
      'ECG / EKG',
      'Cardiac MRI'
    ],
    color: '#E11D48', // Rose red
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  {
    id: 'Gastro',
    name: 'Gastroenterology',
    description: 'OGDS, Colonoscopy, Endoscopic Procedures & EUS',
    subCategories: [
      'OGDS (Gastroscopy)',
      'Colonoscopy',
      'EUS (Endoscopic Ultrasound)',
      'ERCP',
      'Capsule Endoscopy',
      'Liver Fibroscan'
    ],
    color: '#D97706', // Amber
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    id: 'Neuro',
    name: 'Neurology',
    description: 'EEG, NCS, EMG & Neuro-physiological Diagnostics',
    subCategories: [
      'EEG (Electroencephalogram)',
      'NCS (Nerve Conduction Study)',
      'EMG (Electromyography)',
      'Evoked Potentials (VEP/SEP)'
    ],
    color: '#7C3AED', // Violet
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    id: 'Other',
    name: 'General & Others',
    description: 'Histopathology, Lab Reports & Discharge Summaries',
    subCategories: [
      'Histopathology / Biopsy',
      'Laboratory Report',
      'Discharge Summary',
      'Operative Report',
      'Medical Certificate / Referral'
    ],
    color: '#4B5563', // Slate
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200'
  }
];

// Flattened list of all explicit report types across categories
export const ALL_REPORT_TYPES = MEDICAL_CATEGORIES.flatMap((c) => c.subCategories);

export const HOSPITALS: HospitalInfo[] = [
  {
    id: 'KPJ_DATO_ONN',
    name: 'KPJ Dato Onn Specialist Hospital',
    shortName: 'KPJ DATO ONN',
    type: 'Private',
    location: 'Bandar Dato Onn, Johor Bahru'
  },
  {
    id: 'KPJ_PUTERI',
    name: 'KPJ Puteri Specialist Hospital',
    shortName: 'KPJ PUTERI',
    type: 'Private',
    location: 'Larkin, Johor Bahru'
  },
  {
    id: 'KPJ_PASIR_GUDANG',
    name: 'KPJ Pasir Gudang Specialist Hospital',
    shortName: 'KPJ PASIR GUDANG',
    type: 'Private',
    location: 'Pasir Gudang, Johor'
  },
  {
    id: 'KPJ_JOHOR',
    name: 'KPJ Johor Specialist Hospital',
    shortName: 'KPJ JOHOR',
    type: 'Private',
    location: 'Abdul Samad, Johor Bahru'
  },
  {
    id: 'COLUMBIA_ASIA_TEBRAU',
    name: 'Columbia Asia Hospital - Tebrau',
    shortName: 'COLUMBIA ASIA TEBRAU',
    type: 'Private',
    location: 'Tebrau, Johor Bahru'
  },
  {
    id: 'HOSPITAL_SULTANAH_AMINAH',
    name: 'Hospital Sultanah Aminah (HSA)',
    shortName: 'HOSPITAL SULTANAH AMINAH',
    type: 'Government',
    location: 'Johor Bahru'
  },
  {
    id: 'HOSPITAL_PASIR_GUDANG',
    name: 'Hospital Pasir Gudang',
    shortName: 'HOSPITAL PASIR GUDANG',
    type: 'Government',
    location: 'Pasir Gudang, Johor'
  },
  {
    id: 'OTHER',
    name: 'Other Facility / Hospital',
    shortName: 'OTHER HOSPITAL',
    type: 'Other',
    location: 'Custom Location'
  }
];

// Firebase Storage Free Tier limit benchmark: 5,000,000,000 bytes (~5 GB) or 1GB for Firestore data
export const FIREBASE_FREE_TIER_LIMIT_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
