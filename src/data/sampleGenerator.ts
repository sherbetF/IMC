import { MedicalReport, ReportCategory } from '../types';
import { HOSPITALS, MEDICAL_CATEGORIES } from './presetData';

// Generate sample medical report metadata to simulate user's 800+ scanned outsource report collection
export function generateSampleReports(count: number = 40, userId: string = 'admin'): MedicalReport[] {
  const reports: MedicalReport[] = [];
  
  const sampleTitles: Record<ReportCategory, { sub: string; name: string }[]> = {
    Xray: [
      { sub: 'MRI (Magnetic Resonance)', name: 'MRI Lumbar Spine Scan' },
      { sub: 'MRI (Magnetic Resonance)', name: 'MRI Brain & Brainstem Protocol' },
      { sub: 'MRI (Magnetic Resonance)', name: 'MRI Right Knee Joint' },
      { sub: 'CT SCAN (Computed Tomography)', name: 'CT Abdomen & Pelvis with Contrast' },
      { sub: 'CT SCAN (Computed Tomography)', name: 'CT Brain Non-Contrast' },
      { sub: 'CT SCAN (Computed Tomography)', name: 'CT Thorax High Resolution HRCT' },
      { sub: 'Doppler Ultrasound', name: 'Carotid Duplex Doppler Study' },
      { sub: 'Doppler Ultrasound', name: 'Lower Limb Venous Doppler Scan' },
      { sub: 'USG (Ultrasound)', name: 'Ultrasound Hepatobiliary System & Kidneys' },
      { sub: 'Plain X-Ray', name: 'Chest X-Ray PA View' }
    ],
    Cardio: [
      { sub: 'Invasive Angiogram', name: 'Coronary Angiogram Diagnostic Report' },
      { sub: 'CT Angiogram', name: 'Coronary CT Angiography (CCTA)' },
      { sub: 'Echocardiogram (ECHO)', name: '2D Transthoracic Echocardiogram' },
      { sub: 'Holter Monitor', name: '24-Hour Ambulatory ECG Holter Monitoring' },
      { sub: 'Exercise Stress Test (TMT)', name: 'Treadmill Stress Test Report' },
      { sub: 'ECG / EKG', name: '12-Lead Resting Electrocardiogram' }
    ],
    Gastro: [
      { sub: 'OGDS (Gastroscopy)', name: 'Diagnostic OGDS & Gastric Biopsy' },
      { sub: 'Colonoscopy', name: 'Total Colonoscopy & Polypectomy' },
      { sub: 'EUS (Endoscopic Ultrasound)', name: 'Endoscopic Ultrasound Pancreatico-Biliary' },
      { sub: 'ERCP', name: 'ERCP Sphincterotomy & Stenting' },
      { sub: 'Liver Fibroscan', name: 'Transient Elastography Fibroscan' }
    ],
    Neuro: [
      { sub: 'EEG (Electroencephalogram)', name: 'Routine Video EEG Monitoring' },
      { sub: 'NCS (Nerve Conduction Study)', name: 'Nerve Conduction Velocity Upper Limbs' },
      { sub: 'EMG (Electromyography)', name: 'Needle EMG Upper & Lower Extremities' }
    ],
    Other: [
      { sub: 'Histopathology / Biopsy', name: 'Histopathology Biopsy Report' },
      { sub: 'Laboratory Report', name: 'Full Blood Count & Renal Profile' },
      { sub: 'Discharge Summary', name: 'Outsource Hospital Admission Summary' }
    ]
  };

  const samplePatients = [
    { name: 'Ahmad Rizal Bin Hassan', ic: '880315015432' },
    { name: 'Siti Nurhaliza Binti Ibrahim', ic: '920724016112' },
    { name: 'Tan Wei Ming', ic: '851102015987' },
    { name: 'Kavitha A/P Subramaniam', ic: '900518015334' },
    { name: 'Muhammad Hafiz Bin Razak', ic: '951230016223' },
    { name: 'Chong Mei Ling', ic: '890115015118' },
    { name: 'Faridah Binti Ahmad', ic: '780905015886' },
    { name: 'Lim Jian Wei', ic: '930411015667' },
    { name: 'Suresh Kumar A/L Ramasamy', ic: '870822015443' },
    { name: 'Nurul Ain Binti Ismail', ic: '960214015778' },
    { name: 'Goh Boon Huat', ic: '810630015229' },
    { name: 'Anuradha A/P Muthu', ic: '941019015990' },
  ];

  const now = new Date();

  for (let i = 0; i < count; i++) {
    const categoryKeys: ReportCategory[] = ['Xray', 'Cardio', 'Gastro', 'Neuro', 'Other'];
    // Weighted selection matching radiology/cardio/gastro distribution
    const category = categoryKeys[i % categoryKeys.length];
    const categoryTitles = sampleTitles[category];
    const titleObj = categoryTitles[i % categoryTitles.length];

    const hospitalObj = HOSPITALS[i % (HOSPITALS.length - 1)]; // exclude 'OTHER' for defaults
    const patientObj = samplePatients[i % samplePatients.length];

    // Random report date in last 3 years
    const daysAgo = Math.floor(Math.random() * 900);
    const reportDateObj = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const reportDate = reportDateObj.toISOString().split('T')[0];

    // Upload date slightly after report date
    const uploadDateObj = new Date(reportDateObj.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000);
    const uploadDate = uploadDateObj.toISOString();

    // Size around 200 KB to 1.8 MB (as described: "200 kb + each")
    const fileSize = Math.floor((220 + Math.random() * 1200) * 1024);

    // Around 40% reports come with CD ROM
    const hasCDROM = (i % 3 === 0) || (i % 7 === 0);

    // Around 35% reports claimed by patient
    const isClaimed = (i % 3 === 1);
    const claimedDate = isClaimed ? new Date(reportDateObj.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined;

    // Report name contains patient's name and IC number as requested!
    const cleanPatientName = patientObj.name.replace(/ /g, '_');
    const typeAbbr = titleObj.sub.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
    const hospitalAbbr = hospitalObj.shortName.replace(/ /g, '_');
    const fileName = `${cleanPatientName}_${patientObj.ic}_${typeAbbr}_${hospitalAbbr}_${reportDate.replace(/-/g, '')}.pdf`;

    reports.push({
      id: `sample-${i + 1}-${Date.now().toString(36)}`,
      fileName,
      fileSize,
      fileType: 'application/pdf',
      category,
      subCategory: titleObj.sub,
      hospital: hospitalObj.shortName,
      patientName: patientObj.name,
      icNumber: patientObj.ic,
      reportDate,
      uploadDate,
      hasCDROM,
      isClaimed,
      claimedDate,
      notes: `Outsource scan for patient ${patientObj.name} (IC: ${patientObj.ic}) conducted at ${hospitalObj.name}. Verified scan results on file.`,
      userId
    });
  }

  return reports;
}

// Generate sample PDF Blob URL or Data URI for inline previewing
export function generateSamplePdfDataUri(title: string, hospital: string, category: string, date: string): string {
  // SVG based inline viewer image wrapped as data URI for clean universal preview on iOS and desktop
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" style="background:#f8fafc; font-family: system-ui, -apple-system, sans-serif;">
    <rect width="600" height="850" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="0" y="0" width="600" height="120" fill="#0B132B"/>
    <text x="40" y="50" fill="#ffffff" font-size="22" font-weight="bold">OUTSOURCE MEDICAL REPORT</text>
    <text x="40" y="85" fill="#94a3b8" font-size="14">${hospital.toUpperCase()} — SCANNED REPORT</text>
    <rect x="400" y="30" width="160" height="40" rx="6" fill="#1e293b"/>
    <text x="480" y="55" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">CONFIDENTIAL</text>

    <!-- Header Details -->
    <rect x="40" y="150" width="520" height="110" rx="8" fill="#f1f5f9" stroke="#e2e8f0"/>
    <text x="60" y="180" fill="#64748b" font-size="12" font-weight="bold">DOCUMENT TITLE:</text>
    <text x="180" y="180" fill="#0f172a" font-size="14" font-weight="bold">${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>

    <text x="60" y="210" fill="#64748b" font-size="12" font-weight="bold">CATEGORY / TYPE:</text>
    <text x="180" y="210" fill="#0f172a" font-size="13">${category}</text>

    <text x="60" y="240" fill="#64748b" font-size="12" font-weight="bold">REPORT DATE:</text>
    <text x="180" y="240" fill="#0f172a" font-size="13">${date}</text>

    <!-- Diagnostic Findings Box -->
    <rect x="40" y="280" width="520" height="380" rx="8" fill="#ffffff" stroke="#e2e8f0"/>
    <rect x="40" y="280" width="520" height="36" rx="8" fill="#f8fafc"/>
    <text x="60" y="304" fill="#334155" font-size="13" font-weight="bold">EXAMINATION FINDINGS &amp; IMPRESSION SUMMARY</text>

    <text x="60" y="340" fill="#334155" font-size="13" font-weight="bold">Clinical History &amp; Indication:</text>
    <text x="60" y="360" fill="#475569" font-size="12">Patient referred for outsource diagnostic evaluation at ${hospital}.</text>

    <text x="60" y="395" fill="#334155" font-size="13" font-weight="bold">Technique &amp; Protocol:</text>
    <text x="60" y="415" fill="#475569" font-size="12">Multi-planar high resolution acquisition scanned and archived to Outsource Database.</text>

    <text x="60" y="450" fill="#334155" font-size="13" font-weight="bold">Key Diagnostic Impressions:</text>
    <text x="60" y="475" fill="#475569" font-size="12">1. Scanned original physical report verified from ${hospital}.</text>
    <text x="60" y="500" fill="#475569" font-size="12">2. All imaging slices and radiologist commentary captured in PDF format.</text>
    <text x="60" y="525" fill="#475569" font-size="12">3. Recommended clinical correlation with primary attending physician.</text>

    <!-- Official Stamp Footer -->
    <circle cx="100" cy="740" r="35" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,2"/>
    <text x="100" y="744" fill="#0284c7" font-size="10" font-weight="bold" text-anchor="middle">VERIFIED SCAN</text>
    
    <text x="160" y="730" fill="#64748b" font-size="11">Outsource Cloud Storage System</text>
    <text x="160" y="750" fill="#94a3b8" font-size="10">Digitized Record ID: ${Math.random().toString(36).substring(2, 9).toUpperCase()}</text>

    <line x1="40" y1="800" x2="560" y2="800" stroke="#e2e8f0" stroke-width="1"/>
    <text x="300" y="825" fill="#94a3b8" font-size="10" text-anchor="middle">Page 1 of 1 — Confidential Medical Document</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
