import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { MedicalReport, StorageStats, FilterState } from '../types';
import { FIREBASE_FREE_TIER_LIMIT_BYTES, formatBytes } from '../data/presetData';
import { generateSampleReports } from '../data/sampleGenerator';
import { useAuth } from './AuthContext';

interface ReportContextType {
  reports: MedicalReport[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  filteredReports: MedicalReport[];
  storageStats: StorageStats;
  addReport: (newReport: Omit<MedicalReport, 'id' | 'uploadDate' | 'userId'>, rawFile?: File | null) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  bulkDeleteReports: (ids: string[]) => Promise<void>;
  toggleCDROM: (id: string, hasCDROM: boolean) => Promise<void>;
  toggleClaimedStatus: (id: string, isClaimed: boolean) => Promise<void>;
  loadSampleDataset: (count?: number) => Promise<void>;
  clearAllReports: () => Promise<void>;
  previewingReport: MedicalReport | null;
  setPreviewingReport: React.Dispatch<React.SetStateAction<MedicalReport | null>>;
}

const defaultFilters: FilterState = {
  searchQuery: '',
  category: 'all',
  subCategoryFilter: 'all',
  hospital: 'all',
  hasCDROMFilter: 'all',
  isClaimedFilter: 'all',
  sortBy: 'uploadDate',
  sortOrder: 'desc',
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isDemoUser } = useAuth();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [previewingReport, setPreviewingReport] = useState<MedicalReport | null>(null);

  // Clean object for Firestore (removes undefined properties)
  const cleanForFirestore = <T,>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  };

  // Sync with Firestore or localStorage
  useEffect(() => {
    if (!currentUser) {
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Real Firebase Firestore subscription
    try {
      const colRef = collection(db, 'medical_reports');

      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const docsData: MedicalReport[] = [];
          snapshot.forEach((docSnap) => {
            docsData.push({
              id: docSnap.id,
              ...docSnap.data()
            } as MedicalReport);
          });
          
          if (docsData.length === 0) {
            const storageKey = isDemoUser ? 'outsource_db_reports_demo' : `outsource_db_reports_${currentUser.uid}`;
            const localData = localStorage.getItem(storageKey);
            let initialSamples: MedicalReport[] = [];
            if (localData) {
              try { initialSamples = JSON.parse(localData); } catch (e) { console.error(e); }
            }
            if (!initialSamples || initialSamples.length === 0) {
              initialSamples = generateSampleReports(30, currentUser.uid);
            }
            initialSamples.forEach(async (r) => {
              try { await setDoc(doc(db, 'medical_reports', r.id), cleanForFirestore(r)); } catch (e) { console.error(e); }
            });
            setReports(initialSamples);
          } else {
            setReports(docsData);
            const storageKey = isDemoUser ? 'outsource_db_reports_demo' : `outsource_db_reports_${currentUser.uid}`;
            try { localStorage.setItem(storageKey, JSON.stringify(docsData)); } catch (e) { console.error(e); }
          }
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.warn('Firestore subscription warning, falling back to local storage sync:', err);
          setError('Operating in resilient offline mode.');
          const storageKey = isDemoUser ? 'outsource_db_reports_demo' : `outsource_db_reports_${currentUser.uid}`;
          const localData = localStorage.getItem(storageKey);
          if (localData) {
            try {
              setReports(JSON.parse(localData));
            } catch {
              setReports([]);
            }
          } else {
            const initialSamples = generateSampleReports(30, currentUser.uid);
            setReports(initialSamples);
            localStorage.setItem(storageKey, JSON.stringify(initialSamples));
          }
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.error('Error connecting to Firestore:', e);
      setLoading(false);
    }
  }, [currentUser, isDemoUser]);

  // Save to local storage cache whenever reports change for resilient offline support
  useEffect(() => {
    if (currentUser && reports.length >= 0) {
      if (isDemoUser) {
        localStorage.setItem('outsource_db_reports_demo', JSON.stringify(reports));
      } else {
        localStorage.setItem(`outsource_db_reports_${currentUser.uid}`, JSON.stringify(reports));
      }
    }
  }, [reports, currentUser, isDemoUser]);

  // Compute Storage Statistics dynamically
  const storageStats = useMemo<StorageStats>(() => {
    const totalFiles = reports.length;
    const totalSizeBytes = reports.reduce((acc, r) => acc + (r.fileSize || 0), 0);
    const cdRomCount = reports.filter((r) => r.hasCDROM).length;
    const claimedCount = reports.filter((r) => r.isClaimed).length;
    
    const usagePercentage = Math.min(100, parseFloat(((totalSizeBytes / FIREBASE_FREE_TIER_LIMIT_BYTES) * 100).toFixed(2)));
    const remainingBytes = Math.max(0, FIREBASE_FREE_TIER_LIMIT_BYTES - totalSizeBytes);
    const isNearLimit = usagePercentage > 75;
    const cdRomPercentage = totalFiles > 0 ? Math.round((cdRomCount / totalFiles) * 100) : 0;
    const claimedPercentage = totalFiles > 0 ? Math.round((claimedCount / totalFiles) * 100) : 0;

    return {
      totalFiles,
      totalSizeBytes,
      totalSizeFormatted: formatBytes(totalSizeBytes),
      freeTierLimitBytes: FIREBASE_FREE_TIER_LIMIT_BYTES,
      usagePercentage,
      remainingBytes,
      isNearLimit,
      cdRomCount,
      cdRomPercentage,
      claimedCount,
      claimedPercentage
    };
  }, [reports]);

  // Filter and Sort reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const queryLower = filters.searchQuery.toLowerCase();
        const matchesName = report.fileName.toLowerCase().includes(queryLower);
        const matchesHospital = report.hospital.toLowerCase().includes(queryLower);
        const matchesCategory = report.category.toLowerCase().includes(queryLower);
        const matchesSubCategory = report.subCategory.toLowerCase().includes(queryLower);
        const matchesNotes = (report.notes || '').toLowerCase().includes(queryLower);

        if (!matchesName && !matchesHospital && !matchesCategory && !matchesSubCategory && !matchesNotes) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== 'all' && report.category !== filters.category) {
        return false;
      }

      // SubCategory specific report type filter (e.g., Echocardiogram, MRI, CT SCAN, OGDS)
      if (filters.subCategoryFilter && filters.subCategoryFilter !== 'all') {
        if (!report.subCategory.toLowerCase().includes(filters.subCategoryFilter.toLowerCase())) {
          return false;
        }
      }

      // Hospital filter
      if (filters.hospital !== 'all' && report.hospital !== filters.hospital) {
        return false;
      }

      // CD ROM filter
      if (filters.hasCDROMFilter === 'yes' && !report.hasCDROM) return false;
      if (filters.hasCDROMFilter === 'no' && report.hasCDROM) return false;

      // Patient Claimed status filter
      if (filters.isClaimedFilter === 'claimed' && !report.isClaimed) return false;
      if (filters.isClaimedFilter === 'unclaimed' && report.isClaimed) return false;

      return true;
    }).sort((a, b) => {
      let comp = 0;
      if (filters.sortBy === 'uploadDate') {
        comp = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      } else if (filters.sortBy === 'reportDate') {
        comp = new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime();
      } else if (filters.sortBy === 'fileName') {
        comp = a.fileName.localeCompare(b.fileName);
      } else if (filters.sortBy === 'fileSize') {
        comp = a.fileSize - b.fileSize;
      }

      return filters.sortOrder === 'desc' ? -comp : comp;
    });
  }, [reports, filters]);

  // Add new report with Firebase Storage support
  const addReport = async (
    newReportData: Omit<MedicalReport, 'id' | 'uploadDate' | 'userId'>,
    rawFile?: File | null
  ) => {
    if (!currentUser) return;

    let downloadUrl = newReportData.downloadUrl || '';
    let storagePath = newReportData.storagePath || '';

    // Upload file to Firebase Storage if rawFile exists and user is NOT demo user
    if (rawFile && !isDemoUser) {
      try {
        const cleanFileName = rawFile.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
        storagePath = `medical_reports/${currentUser.uid}/${Date.now()}_${cleanFileName}`;
        const storageRef = ref(storage, storagePath);
        
        const uploadSnapshot = await uploadBytes(storageRef, rawFile, {
          contentType: rawFile.type || 'application/pdf',
          customMetadata: {
            patientName: newReportData.patientName || '',
            hospital: newReportData.hospital || ''
          }
        });

        downloadUrl = await getDownloadURL(uploadSnapshot.ref);
      } catch (storageErr) {
        console.warn('Firebase Storage upload warning, continuing with metadata/dataUri:', storageErr);
      }
    }

    const reportToSave: MedicalReport = {
      ...newReportData,
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      uploadDate: new Date().toISOString(),
      userId: currentUser.uid,
      downloadUrl: downloadUrl || undefined,
      storagePath: storagePath || undefined
    };

    try {
      const colRef = collection(db, 'medical_reports');
      const docRef = await addDoc(colRef, cleanForFirestore({
        ...reportToSave,
        customHospital: reportToSave.customHospital || '',
        patientName: reportToSave.patientName || '',
        icNumber: reportToSave.icNumber || '',
        claimedDate: reportToSave.claimedDate || '',
        notes: reportToSave.notes || '',
        downloadUrl: downloadUrl || '',
        storagePath: storagePath || '',
        fileData: reportToSave.fileData || ''
      }));

      reportToSave.id = docRef.id;
      setReports((prev) => [reportToSave, ...prev.filter((r) => r.id !== reportToSave.id)]);
    } catch (err) {
      console.error('Error adding report to Firestore, saving locally:', err);
      setReports((prev) => [reportToSave, ...prev]);
    }
  };

  // Delete report
  const deleteReport = async (id: string) => {
    const reportToDelete = reports.find((r) => r.id === id);
    setReports((prev) => prev.filter((r) => r.id !== id));

    if (isDemoUser) return;

    if (reportToDelete?.storagePath) {
      try {
        const fileRef = ref(storage, reportToDelete.storagePath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('Firebase Storage file delete warning:', err);
      }
    }

    try {
      const docRef = doc(db, 'medical_reports', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore delete failed or item was offline-only:', err);
    }
  };

  // Bulk delete
  const bulkDeleteReports = async (ids: string[]) => {
    const idSet = new Set(ids);
    const reportsToDelete = reports.filter((r) => idSet.has(r.id));
    setReports((prev) => prev.filter((r) => !idSet.has(r.id)));

    if (isDemoUser) return;

    for (const report of reportsToDelete) {
      if (report.storagePath) {
        try {
          const fileRef = ref(storage, report.storagePath);
          await deleteObject(fileRef);
        } catch (err) {
          console.warn('Firebase Storage bulk delete warning:', err);
        }
      }
    }

    try {
      const batch = writeBatch(db);
      ids.forEach((id) => {
        const docRef = doc(db, 'medical_reports', id);
        batch.delete(docRef);
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore bulk delete warning:', err);
    }
  };

  // Toggle CD ROM checkbox directly
  const toggleCDROM = async (id: string, hasCDROM: boolean) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, hasCDROM } : r))
    );

    if (isDemoUser) return;

    try {
      const docRef = doc(db, 'medical_reports', id);
      await updateDoc(docRef, { hasCDROM });
    } catch (err) {
      console.warn('Firestore update CD ROM warning:', err);
    }
  };

  // Toggle patient claim remark status
  const toggleClaimedStatus = async (id: string, isClaimed: boolean) => {
    const claimedDate = isClaimed ? new Date().toISOString().split('T')[0] : undefined;
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isClaimed, claimedDate } : r))
    );

    if (isDemoUser) return;

    try {
      const docRef = doc(db, 'medical_reports', id);
      await updateDoc(docRef, { 
        isClaimed,
        claimedDate: claimedDate || ''
      });
    } catch (err) {
      console.warn('Firestore update claim status warning:', err);
    }
  };

  // Load Sample Dataset
  const loadSampleDataset = async (count: number = 30) => {
    if (!currentUser) return;
    const samples = generateSampleReports(count, currentUser.uid);

    if (isDemoUser) {
      setReports((prev) => [...samples, ...prev]);
      return;
    }

    try {
      // Add batch to firestore
      const colRef = collection(db, 'medical_reports');
      for (const sample of samples) {
        await addDoc(colRef, {
          fileName: sample.fileName,
          fileSize: sample.fileSize,
          fileType: sample.fileType,
          category: sample.category,
          subCategory: sample.subCategory,
          hospital: sample.hospital,
          reportDate: sample.reportDate,
          uploadDate: sample.uploadDate,
          hasCDROM: sample.hasCDROM,
          notes: sample.notes,
          userId: currentUser.uid,
          fileData: ''
        });
      }
    } catch (err) {
      console.warn('Firestore batch sample insert fallback:', err);
      setReports((prev) => [...samples, ...prev]);
    }
  };

  // Clear All
  const clearAllReports = async () => {
    setReports([]);
    if (isDemoUser) {
      localStorage.removeItem('outsource_db_reports_demo');
      return;
    }
    if (currentUser) {
      localStorage.removeItem(`outsource_db_reports_${currentUser.uid}`);
    }
  };

  return (
    <ReportContext.Provider
      value={{
        reports,
        loading,
        error,
        filters,
        setFilters,
        filteredReports,
        storageStats,
        addReport,
        deleteReport,
        bulkDeleteReports,
        toggleCDROM,
        toggleClaimedStatus,
        loadSampleDataset,
        clearAllReports,
        previewingReport,
        setPreviewingReport,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
};
