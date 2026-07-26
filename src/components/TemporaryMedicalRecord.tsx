import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Activity, 
  Bed, 
  UserPlus, 
  Search, 
  Filter, 
  FileText, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Edit3, 
  Trash2, 
  Clock, 
  Globe, 
  CornerDownRight, 
  ArrowLeftRight, 
  ChevronRight, 
  ArrowLeft,
  BookOpen,
  User,
  HeartPulse,
  Plus,
  X,
  Maximize2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { PatientZone, PatientProfile, ClerkingNote, ClerkingAmendment } from '../types';

// Preset patients to populate the record system when empty or in demo mode
const PRESET_PATIENTS: PatientProfile[] = [
  {
    id: 'preset-p1',
    name: 'Adam Haris Bin Ibrahim',
    idType: 'ic',
    idValue: '890514-01-5231',
    gender: 'Male',
    currentZone: 'Red Zone',
    bedNumber: 'Red-01',
    registeredAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    userId: 'system',
    createdByEmail: 'doctor@outsourcedb.med'
  },
  {
    id: 'preset-p2',
    name: 'Sarah Jane Miller',
    idType: 'passport',
    idValue: 'L3892710',
    gender: 'Female',
    country: 'United Kingdom',
    currentZone: 'Yellow Zone',
    bedNumber: 'Yellow-04',
    registeredAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5 hours ago
    userId: 'system',
    createdByEmail: 'doctor@outsourcedb.med'
  },
  {
    id: 'preset-p3',
    name: 'Tan Mei Yee',
    idType: 'ic',
    idValue: '940822-01-5642',
    gender: 'Female',
    currentZone: 'Green Zone',
    bedNumber: 'Green-09',
    registeredAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), // 8 hours ago
    userId: 'system',
    createdByEmail: 'doctor@outsourcedb.med'
  },
  {
    id: 'preset-p4',
    name: 'Robert Henderson',
    idType: 'passport',
    idValue: 'A9274811',
    gender: 'Male',
    country: 'United States',
    currentZone: 'Transfered',
    bedNumber: 'Discharged-T01',
    registeredAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
    userId: 'system',
    createdByEmail: 'doctor@outsourcedb.med'
  }
];

const PRESET_CLERKING_NOTES: ClerkingNote[] = [
  {
    id: 'preset-n1',
    patientId: 'preset-p1',
    progressNote: 'Patient presented with severe crushing retrosternal chest pain radiating to the left shoulder, associated with diaphoresis and nausea. ECG shows ST-segment elevation in V1-V4 (Anterior STEMI). Administered dual antiplatelet therapy (DAPT): Aspirin 300mg and Clopidogrel 300mg. Initiated oxygen therapy and continuous cardiac monitoring. Cardiology team activated for immediate primary PCI transfer.',
    bedNumber: 'Red-01',
    createdAt: new Date(Date.now() - 2.8 * 3600 * 1000).toISOString(),
    createdBy: 'doctor@outsourcedb.med',
    status: 'active',
    amendments: []
  },
  {
    id: 'preset-n2',
    patientId: 'preset-p2',
    progressNote: 'Presented with high-grade fever (39.1°C), productive cough, and progressive shortness of breath for 3 days. Chest X-Ray confirms dense consolidation in the right lower lobe. SpO2 is 95% on room air. Formulated diagnosis of Community-Acquired Pneumonia (CAP). Started IV Ceftriaxone 1g OD and Oral Azithromycin 500mg OD. Blood cultures and sputum microscopy sent. Monitor temperature and SpO2 closely.',
    bedNumber: 'Yellow-04',
    createdAt: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
    createdBy: 'doctor@outsourcedb.med',
    status: 'active',
    amendments: []
  },
  {
    id: 'preset-n3',
    patientId: 'preset-p3',
    progressNote: 'Presented with minor laceration on the left lateral forearm from a glass break incident. Cleaned, explored, and irrigated with normal saline. No major tendon, nerve, or vascular involvement. Wound sutured with 4-0 Ethilon (5 simple interrupted sutures). Tetanus toxoid booster 0.5ml IM given. Advised on daily dressing changes, dry wound hygiene, and suture removal in 7 days.',
    bedNumber: 'Green-09',
    createdAt: new Date(Date.now() - 7.5 * 3600 * 1000).toISOString(),
    createdBy: 'doctor@outsourcedb.med',
    status: 'active',
    amendments: []
  },
  {
    id: 'preset-n4',
    patientId: 'preset-p4',
    progressNote: '81-year-old gentleman who sustained a mechanical fall at home. Left hip pain with complete inability to bear weight. X-ray confirmed displaced left neck of femur (NOF) fracture. Patient is medically stable but requires urgent surgical intervention. Case discussed with orthopedic registrar. Arranged official patient transfer to Tertiary Hospital Orthopedic ward via dedicated medical ambulance.',
    bedNumber: 'Discharged-T01',
    createdAt: new Date(Date.now() - 23 * 3600 * 1000).toISOString(),
    createdBy: 'doctor@outsourcedb.med',
    status: 'active',
    amendments: [
      {
        id: 'preset-am1',
        note: 'Orthopedic bed at Tertiary Hospital was officially confirmed at 11:30 AM. Ambulance dispatch scheduled for 1:00 PM.',
        bedNumber: 'Discharged-T01',
        amendedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
        amendedBy: 'doctor@outsourcedb.med'
      }
    ]
  }
];

interface TemporaryMedicalRecordProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const TemporaryMedicalRecord: React.FC<TemporaryMedicalRecordProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, isDemoUser } = useAuth();
  
  // Tab control: 'dashboard' | 'directory' | 'register'
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'directory' | 'register'>('dashboard');
  
  // Records State
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [clerkingNotes, setClerkingNotes] = useState<ClerkingNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Selection and search states
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');

  // Popup Modal State for viewing & editing big clinical notes
  const [activeModalNote, setActiveModalNote] = useState<ClerkingNote | null>(null);

  // Form states - Patient registration
  const [regName, setRegName] = useState<string>('');
  const [regIdType, setRegIdType] = useState<'ic' | 'passport'>('ic');
  const [regIdValue, setRegIdValue] = useState<string>('');
  const [regGender, setRegGender] = useState<'Male' | 'Female'>('Male');
  const [regCountry, setRegCountry] = useState<string>('');
  const [regZone, setRegZone] = useState<PatientZone>('Green Zone');
  const [regBedNumber, setRegBedNumber] = useState<string>('');
  const [regError, setRegError] = useState<string>('');

  // Form states - New Clerking Note
  const [noteProgress, setNoteProgress] = useState<string>('');
  const [noteBedNumber, setNoteBedNumber] = useState<string>('');
  const [noteError, setNoteError] = useState<string>('');

  // Form states - Amendment
  const [amendText, setAmendText] = useState<string>('');
  const [amendBedNumber, setAmendBedNumber] = useState<string>('');

  // Sync activeTab prop with internal subTab
  useEffect(() => {
    if (activeTab === 'patients_directory') {
      setSelectedPatient(null);
      setActiveSubTab('directory');
    } else if (activeTab === 'register_patient') {
      setSelectedPatient(null);
      setActiveSubTab('register');
    } else if (activeTab === 'medical_records') {
      setSelectedPatient(null);
      setActiveSubTab('dashboard');
    }
  }, [activeTab]);

  const handleSubTabChange = (sub: 'dashboard' | 'directory' | 'register') => {
    setSelectedPatient(null);
    setActiveSubTab(sub);
    if (setActiveTab) {
      if (sub === 'dashboard') setActiveTab('medical_records');
      if (sub === 'directory') setActiveTab('patients_directory');
      if (sub === 'register') setActiveTab('register_patient');
    }
  };

  // Error handling according to firebase guidelines
  const handleFirestoreError = (error: unknown, operationType: 'create' | 'update' | 'get' | 'list', path: string) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: currentUser?.uid,
        email: currentUser?.email,
        emailVerified: currentUser?.emailVerified
      },
      operationType,
      path
    };
    console.error('Firestore Error details:', JSON.stringify(errInfo));
  };

  // ---------------------------------------------------------
  // Fetch / Sync Patient Profiles and Clerking Notes
  // ---------------------------------------------------------
  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    if (isDemoUser) {
      const cachedPatients = localStorage.getItem('temp_med_patients_demo');
      const cachedNotes = localStorage.getItem('temp_med_notes_demo');
      
      if (cachedPatients) {
        try { setPatients(JSON.parse(cachedPatients)); } catch (e) { setPatients(PRESET_PATIENTS); }
      } else {
        setPatients(PRESET_PATIENTS);
        localStorage.setItem('temp_med_patients_demo', JSON.stringify(PRESET_PATIENTS));
      }

      if (cachedNotes) {
        try { setClerkingNotes(JSON.parse(cachedNotes)); } catch (e) { setClerkingNotes(PRESET_CLERKING_NOTES); }
      } else {
        setClerkingNotes(PRESET_CLERKING_NOTES);
        localStorage.setItem('temp_med_notes_demo', JSON.stringify(PRESET_CLERKING_NOTES));
      }

      setLoading(false);
      return;
    }

    try {
      const patientsRef = collection(db, 'patient_profiles');
      const notesRef = collection(db, 'clerking_notes');

      const unsubscribePatients = onSnapshot(patientsRef, (snapshot) => {
        if (snapshot.empty) {
          setPatients(PRESET_PATIENTS);
        } else {
          const list: PatientProfile[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as PatientProfile));
          setPatients(list);
        }
        setLoading(false);
      }, (err) => {
        handleFirestoreError(err, 'list', 'patient_profiles');
        setPatients(PRESET_PATIENTS);
        setLoading(false);
      });

      const unsubscribeNotes = onSnapshot(notesRef, (snapshot) => {
        if (snapshot.empty) {
          setClerkingNotes(PRESET_CLERKING_NOTES);
        } else {
          const list: ClerkingNote[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ClerkingNote));
          setClerkingNotes(list);
        }
      }, (err) => {
        handleFirestoreError(err, 'list', 'clerking_notes');
        setClerkingNotes(PRESET_CLERKING_NOTES);
      });

      return () => {
        unsubscribePatients();
        unsubscribeNotes();
      };

    } catch (e) {
      console.error('Error starting snapshot listeners:', e);
      setLoading(false);
    }
  }, [currentUser, isDemoUser]);

  // Sync state changes to offline local storage
  useEffect(() => {
    if (!currentUser) return;
    const keyPatients = isDemoUser ? 'temp_med_patients_demo' : `temp_med_patients_${currentUser.uid}`;
    const keyNotes = isDemoUser ? 'temp_med_notes_demo' : `temp_med_notes_${currentUser.uid}`;
    
    if (patients.length > 0) {
      localStorage.setItem(keyPatients, JSON.stringify(patients));
    }
    if (clerkingNotes.length > 0) {
      localStorage.setItem(keyNotes, JSON.stringify(clerkingNotes));
    }
  }, [patients, clerkingNotes, currentUser, isDemoUser]);

  // Keep selected patient profile reference in sync
  useEffect(() => {
    if (selectedPatient) {
      const updated = patients.find(p => p.id === selectedPatient.id);
      if (updated) {
        setSelectedPatient(updated);
      }
    }
  }, [patients]);

  // Auto-fill Gender by IC Number logic (logic stays applied quietly)
  useEffect(() => {
    if (regIdType === 'ic' && regIdValue) {
      const sanitized = regIdValue.replace(/[^0-9]/g, '');
      if (sanitized.length > 0) {
        const lastDigit = parseInt(sanitized[sanitized.length - 1], 10);
        if (!isNaN(lastDigit)) {
          const autoGender = lastDigit % 2 === 0 ? 'Female' : 'Male';
          setRegGender(autoGender);
        }
      }
    }
  }, [regIdValue, regIdType]);

  // Dashboard Metrics & Calculations
  const getZoneCounts = () => {
    const counts = {
      'Red Zone': 0,
      'Yellow Zone': 0,
      'Green Zone': 0,
      'White Tag': 0,
      'Transfered': 0
    };
    patients.forEach(p => {
      if (p.currentZone in counts) {
        counts[p.currentZone]++;
      }
    });
    return counts;
  };

  const zoneCounts = getZoneCounts();
  const totalActivePatients = patients.length;

  const zoneDetails = [
    { name: 'Red Zone', count: zoneCounts['Red Zone'], color: 'text-rose-600 bg-rose-50 border-rose-200', desc: 'Critical / Resuscitation' },
    { name: 'Yellow Zone', count: zoneCounts['Yellow Zone'], color: 'text-amber-600 bg-amber-50 border-amber-200', desc: 'Semi-Critical / Urgent' },
    { name: 'Green Zone', count: zoneCounts['Green Zone'], color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: 'Non-Critical / Ambulatory' },
    { name: 'White Tag', count: zoneCounts['White Tag'], color: 'text-slate-600 bg-slate-100 border-slate-300', desc: 'Triage / Low Priority / Observation' },
    { name: 'Transfered', count: zoneCounts['Transfered'], color: 'text-blue-600 bg-blue-50 border-blue-200', desc: 'Transferred to Hospital Ward' },
  ];

  // Actions: Add Patient
  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Please provide a patient name.');
      return;
    }
    if (!regIdValue.trim()) {
      setRegError('Please provide an IC number or Passport.');
      return;
    }
    if (regIdType === 'passport' && !regCountry.trim()) {
      setRegError('Please state the passport country of origin.');
      return;
    }

    const uniqueId = `patient-${Date.now()}`;
    const userEmail = currentUser?.email || 'doctor@outsourcedb.med';

    const newPatient: Omit<PatientProfile, 'id'> = {
      name: regName.trim(),
      idType: regIdType,
      idValue: regIdValue.trim(),
      gender: regGender,
      country: regIdType === 'passport' ? regCountry.trim() : undefined,
      currentZone: regZone,
      bedNumber: regBedNumber.trim() || 'No Bed Assigned',
      registeredAt: new Date().toISOString(),
      userId: currentUser?.uid || 'guest-user',
      createdByEmail: userEmail
    };

    if (isDemoUser) {
      const fullPatient = { id: uniqueId, ...newPatient } as PatientProfile;
      const nextPatients = [fullPatient, ...patients];
      setPatients(nextPatients);
      localStorage.setItem('temp_med_patients_demo', JSON.stringify(nextPatients));
      
      setSelectedPatient(fullPatient);
      handleSubTabChange('directory');
      resetRegForm();
    } else {
      try {
        await addDoc(collection(db, 'patient_profiles'), newPatient);
        handleSubTabChange('directory');
        resetRegForm();
      } catch (err) {
        handleFirestoreError(err, 'create', 'patient_profiles');
        setRegError('Failed to register patient in database. Please check your network.');
      }
    }
  };

  const resetRegForm = () => {
    setRegName('');
    setRegIdType('ic');
    setRegIdValue('');
    setRegGender('Male');
    setRegCountry('');
    setRegZone('Green Zone');
    setRegBedNumber('');
    setRegError('');
  };

  // Actions: Transfer Zone
  const handleTransferZone = async (patientId: string, targetZone: PatientZone) => {
    if (isDemoUser) {
      const updatedList = patients.map(p => {
        if (p.id === patientId) {
          return { ...p, currentZone: targetZone };
        }
        return p;
      });
      setPatients(updatedList);
      localStorage.setItem('temp_med_patients_demo', JSON.stringify(updatedList));
    } else {
      try {
        const pDoc = doc(db, 'patient_profiles', patientId);
        await updateDoc(pDoc, { currentZone: targetZone });
      } catch (err) {
        handleFirestoreError(err, 'update', `patient_profiles/${patientId}`);
      }
    }
  };

  // Actions: Add Clerking Note
  const handleAddClerkingNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoteError('');

    if (!selectedPatient) return;
    if (!noteProgress.trim()) {
      setNoteError('Please write clinical notes before submitting.');
      return;
    }

    const userEmail = currentUser?.email || 'doctor@outsourcedb.med';
    const noteId = `note-${Date.now()}`;

    const newNote: Omit<ClerkingNote, 'id'> = {
      patientId: selectedPatient.id,
      progressNote: noteProgress.trim(),
      bedNumber: noteBedNumber.trim() || selectedPatient.bedNumber,
      createdAt: new Date().toISOString(),
      createdBy: userEmail,
      status: 'active',
      amendments: []
    };

    if (isDemoUser) {
      const fullNote = { id: noteId, ...newNote } as ClerkingNote;
      const nextNotes = [fullNote, ...clerkingNotes];
      setClerkingNotes(nextNotes);
      localStorage.setItem('temp_med_notes_demo', JSON.stringify(nextNotes));
      setNoteProgress('');
      setNoteBedNumber('');
    } else {
      try {
        await addDoc(collection(db, 'clerking_notes'), newNote);
        setNoteProgress('');
        setNoteBedNumber('');
      } catch (err) {
        handleFirestoreError(err, 'create', 'clerking_notes');
        setNoteError('Error adding clerking note to Firestore.');
      }
    }
  };

  // Actions: Amend Note
  const handleAmendNote = async (noteId: string) => {
    if (!amendText.trim()) return;
    const userEmail = currentUser?.email || 'doctor@outsourcedb.med';

    const newAmendment: ClerkingAmendment = {
      id: `amend-${Date.now()}`,
      note: amendText.trim(),
      bedNumber: amendBedNumber.trim(),
      amendedAt: new Date().toISOString(),
      amendedBy: userEmail
    };

    const noteToUpdate = clerkingNotes.find(n => n.id === noteId);
    if (!noteToUpdate) return;

    const updatedAmendments = [...(noteToUpdate.amendments || []), newAmendment];

    if (isDemoUser) {
      const nextNotes = clerkingNotes.map(n => {
        if (n.id === noteId) {
          return { ...n, amendments: updatedAmendments };
        }
        return n;
      });
      setClerkingNotes(nextNotes);
      localStorage.setItem('temp_med_notes_demo', JSON.stringify(nextNotes));
      setAmendText('');
      setAmendBedNumber('');
    } else {
      try {
        const nDoc = doc(db, 'clerking_notes', noteId);
        await updateDoc(nDoc, { amendments: updatedAmendments });
        setAmendText('');
        setAmendBedNumber('');
      } catch (err) {
        handleFirestoreError(err, 'update', `clerking_notes/${noteId}`);
      }
    }
  };

  // Actions: Mark Note as Error
  const handleMarkAsError = async (noteId: string) => {
    const confirmError = window.confirm(
      'Are you sure you want to mark this clerking page as an ERROR?\n\nThis is a permanent medical record entry. It cannot be deleted, but it will be flagged as containing an error.'
    );
    if (!confirmError) return;

    if (isDemoUser) {
      const nextNotes = clerkingNotes.map(n => {
        if (n.id === noteId) {
          return { ...n, status: 'error' as const };
        }
        return n;
      });
      setClerkingNotes(nextNotes);
      localStorage.setItem('temp_med_notes_demo', JSON.stringify(nextNotes));
    } else {
      try {
        const nDoc = doc(db, 'clerking_notes', noteId);
        await updateDoc(nDoc, { status: 'error' });
      } catch (err) {
        handleFirestoreError(err, 'update', `clerking_notes/${noteId}`);
      }
    }
  };

  // Filters
  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.idValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.bedNumber && p.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesZone = zoneFilter === 'all' || p.currentZone === zoneFilter;
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;

    return matchesSearch && matchesZone && matchesGender;
  });

  return (
    <div className="space-y-6">
      
      {/* SECTION BANNER AND STATS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
            <HeartPulse className="w-6 h-6 animate-pulse text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Temporary Medical Records (TMR)
              <span className="text-[10px] uppercase font-black bg-teal-100 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
                Active Ward Suite
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Zero-deletion patient registry with immutable clerking audits & multi-zone medical triage.
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubTabChange('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer border ${
              activeSubTab === 'dashboard' && !selectedPatient
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
             TMR Dashboard
          </button>
          <button
            type="button"
            onClick={() => handleSubTabChange('directory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer border ${
              activeSubTab === 'directory' && !selectedPatient
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            Patients Directory ({patients.length})
          </button>
          <button
            type="button"
            onClick={() => handleSubTabChange('register')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer border flex items-center gap-1.5 ${
              activeSubTab === 'register' && !selectedPatient
                ? 'bg-teal-600 text-white border-teal-600' 
                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Loading Hospital Database...</p>
        </div>
      ) : (
        <>
          {/* ============================================================================== */}
          {/* STAGE A: PATIENT PROFILE DETAIL SCREEN (IF ACTIVE)                             */}
          {/* ============================================================================== */}
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Back Button and Quick Info */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 bg-white rounded-xl border border-slate-200/80 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Clinical Directory</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">Transfer Zone Triage:</span>
                  <select
                    value={selectedPatient.currentZone}
                    onChange={(e) => handleTransferZone(selectedPatient.id, e.target.value as PatientZone)}
                    className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Red Zone">Red Zone (Critical)</option>
                    <option value="Yellow Zone">Yellow Zone (Urgent)</option>
                    <option value="Green Zone">Green Zone (Non-Critical)</option>
                    <option value="White Tag">White Tag (Observation)</option>
                    <option value="Transfered">Transfered (To Ward)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Profile Card Summary Panel */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                    <div className="border-b border-slate-100 pb-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          selectedPatient.currentZone === 'Red Zone' ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' :
                          selectedPatient.currentZone === 'Yellow Zone' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          selectedPatient.currentZone === 'Green Zone' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          selectedPatient.currentZone === 'White Tag' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                          'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {selectedPatient.currentZone}
                        </span>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Bed className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className="text-xs font-extrabold text-slate-700">{selectedPatient.bedNumber}</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-black text-slate-800 mt-2">{selectedPatient.name}</h3>
                      <p className="text-xs text-slate-500 font-medium font-mono mt-0.5">
                        {selectedPatient.idType === 'ic' ? 'MyKad ID' : 'Passport No'}: {selectedPatient.idValue}
                      </p>
                    </div>

                    <div className="space-y-3.5 text-xs font-medium text-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Biological Sex:</span>
                        <span className="font-bold text-slate-800">{selectedPatient.gender}</span>
                      </div>
                      {selectedPatient.idType === 'passport' && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Country of Origin:</span>
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-teal-600" />
                            {selectedPatient.country || 'N/A'}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Bed Number:</span>
                        <span className="font-extrabold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                          {selectedPatient.bedNumber}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Registered On:</span>
                        <span className="font-bold text-slate-800">
                          {new Date(selectedPatient.registeredAt).toLocaleDateString()} at {new Date(selectedPatient.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                        <span className="text-slate-400">Registered By Staff:</span>
                        <span className="font-bold text-teal-700 truncate max-w-[150px]" title={selectedPatient.createdByEmail}>
                          {selectedPatient.createdByEmail}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clerking Notes & Case Timeline */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Form to add New Clerking note - Expanded Horizontal Layout */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                      <PlusCircle className="w-4.5 h-4.5 text-teal-600" />
                      <span>Add Clinical Clerking Entry</span>
                    </h4>

                    <form onSubmit={handleAddClerkingNote} className="space-y-4">
                      {/* Top Horizontal Row for Bed & Clinician info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Bed Number (At Note Time)</label>
                          <input
                            type="text"
                            value={noteBedNumber}
                            onChange={(e) => setNoteBedNumber(e.target.value)}
                            placeholder={`Default: ${selectedPatient.bedNumber}`}
                            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 min-h-[42px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase block">Authorized Clinician</span>
                          <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold truncate min-h-[42px] flex items-center">
                            {currentUser?.email || 'doctor@outsourcedb.med'}
                          </div>
                        </div>
                      </div>

                      {/* Main Full-Width Big Progress Note Textarea */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Clinician Progress Note</label>
                        <textarea
                          value={noteProgress}
                          onChange={(e) => setNoteProgress(e.target.value)}
                          rows={6}
                          placeholder="Type details of assessment, presenting symptoms, initial treatment administered, and current ward plan..."
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 rounded-xl p-3.5 text-xs text-slate-800 placeholder-slate-400 font-sans leading-relaxed"
                        />
                      </div>

                      {noteError && (
                        <p className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-100 p-2.5 rounded-xl">{noteError}</p>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 min-h-[42px] cursor-pointer"
                        >
                          <Plus className="w-4.5 h-4.5" />
                          <span>Commit Clerking Page</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Render Clinical Clerking Pages Timeline (Minimized Card Views) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <BookOpen className="w-4.5 h-4.5 text-teal-600" />
                        <span>Timeline of TMR Clinical Records</span>
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Click entry row to view full notes & edit
                      </span>
                    </div>

                    {clerkingNotes.filter(n => n.patientId === selectedPatient.id).length === 0 ? (
                      <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
                        No medical record entries or progress notes committed yet for this patient.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {clerkingNotes
                          .filter(n => n.patientId === selectedPatient.id)
                          .map((note) => {
                            const isError = note.status === 'error';
                            const hasAmendments = note.amendments && note.amendments.length > 0;

                            return (
                              <div 
                                key={note.id} 
                                onClick={() => {
                                  setActiveModalNote(note);
                                  setAmendText('');
                                  setAmendBedNumber(note.bedNumber);
                                }}
                                className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
                                  isError 
                                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300' 
                                    : 'bg-white border-slate-200/80 hover:border-teal-400 hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                      isError ? 'bg-rose-100 text-rose-600' : 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors'
                                    }`}>
                                      <FileText className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-black text-slate-800 font-mono">
                                          ENTRY #{note.id.substring(0, 8).toUpperCase()}
                                        </span>
                                        {isError ? (
                                          <span className="text-[9px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full uppercase">
                                            Error Flagged
                                          </span>
                                        ) : (
                                          <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                                            Verified Note
                                          </span>
                                        )}
                                        {hasAmendments && (
                                          <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
                                            {note.amendments.length} Amendment{note.amendments.length > 1 ? 's' : ''}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-slate-400 block mt-0.5">
                                        {new Date(note.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} • By {note.createdBy}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                      Bed: {note.bedNumber || 'N/A'}
                                    </span>
                                    <div className="text-xs font-bold text-teal-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                                      <span>Open Notes</span>
                                      <Maximize2 className="w-3.5 h-3.5" />
                                    </div>
                                  </div>
                                </div>

                                {/* Truncated note preview snippet */}
                                <p className={`text-xs text-slate-600 mt-2.5 line-clamp-1 font-serif ${isError ? 'line-through text-slate-400' : ''}`}>
                                  {note.progressNote}
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          ) : (
            <>
              {/* ============================================================================== */}
              {/* STAGE B1: OVERVIEW DASHBOARD TAB                                               */}
              {/* ============================================================================== */}
              {activeSubTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Category cards layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {zoneDetails.map((z) => (
                      <div 
                        key={z.name}
                        onClick={() => {
                          setZoneFilter(z.name);
                          handleSubTabChange('directory');
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer hover:shadow-md transition-all group ${z.color}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black uppercase tracking-wider opacity-80">{z.name}</span>
                          <div className="p-1 rounded-md bg-white/60 text-slate-800 group-hover:bg-white transition-colors">
                            <Activity className="w-4 h-4 text-slate-700" />
                          </div>
                        </div>
                        <p className="text-3xl font-black tracking-tight mt-2">{z.count}</p>
                        <p className="text-[10px] opacity-80 mt-1 line-clamp-1">{z.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Charts and summary metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Visual graph / representation */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Activity className="w-4.5 h-4.5 text-teal-600" />
                          <span>Triage Patient Flow Distribution</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Live distribution graph of patients currently checked into each hospital zone.
                        </p>
                      </div>

                      {/* Manual bar chart */}
                      <div className="space-y-4 my-6">
                        {zoneDetails.map((z) => {
                          const percentage = totalActivePatients > 0 ? (z.count / totalActivePatients) * 100 : 0;
                          return (
                            <div key={z.name} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700">{z.name}</span>
                                <span className="font-mono font-bold text-slate-500">{z.count} Patients ({percentage.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/40">
                                <div 
                                  className={`h-full transition-all duration-500 rounded-full ${
                                    z.name === 'Red Zone' ? 'bg-rose-500' :
                                    z.name === 'Yellow Zone' ? 'bg-amber-500' :
                                    z.name === 'Green Zone' ? 'bg-emerald-500' :
                                    z.name === 'White Tag' ? 'bg-slate-400' :
                                    'bg-blue-500'
                                  }`}
                                  style={{ width: `${Math.max(2, percentage)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 text-center">
                        TMR provides instantaneous updates as clinical staff transfer patients across hospital suites.
                      </div>
                    </div>

                    {/* Quick Stats Summary Card */}
                    <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                          <Users className="w-4.5 h-4.5 text-teal-600" />
                          <span>Patient Demographics</span>
                        </h3>
                        
                        <div className="space-y-4 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Total Registered Patients:</span>
                            <span className="text-sm font-black text-slate-800">{patients.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Malaysian Citizens (MyKad):</span>
                            <span className="text-sm font-black text-slate-800">
                              {patients.filter(p => p.idType === 'ic').length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Foreign Passports:</span>
                            <span className="text-sm font-black text-slate-800">
                              {patients.filter(p => p.idType === 'passport').length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Male Patients:</span>
                            <span className="text-sm font-black text-blue-600">
                              {patients.filter(p => p.gender === 'Male').length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Female Patients:</span>
                            <span className="text-sm font-black text-rose-600">
                              {patients.filter(p => p.gender === 'Female').length}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-teal-50 border border-teal-100 rounded-2xl flex items-start gap-2 text-xs text-teal-800">
                        <AlertTriangle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Traditional Clinical Integrity</p>
                          <p className="text-[11px] text-teal-700/90 mt-0.5">
                            Under strict record acts, no clinical entries can be deleted. Staff may only update status or commit structured amendments.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Recent Activity arrivals */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-3.5 mb-3.5">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4.5 h-4.5 text-teal-600" />
                        <span>Recent Triage Admissions</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSubTabChange('directory')}
                        className="text-xs text-teal-600 font-bold hover:underline cursor-pointer"
                      >
                        View Full Directory &rarr;
                      </button>
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-400 font-bold border-b border-slate-100 uppercase text-[10px]">
                            <th className="py-2.5">Date Registered</th>
                            <th className="py-2.5">Patient Name</th>
                            <th className="py-2.5">ID Value</th>
                            <th className="py-2.5">Gender</th>
                            <th className="py-2.5">Zone</th>
                            <th className="py-2.5">Bed Number</th>
                            <th className="py-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {patients.slice(0, 5).map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 text-slate-400 font-medium">
                                {new Date(p.registeredAt).toLocaleDateString()} {new Date(p.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-3 font-bold text-slate-800">{p.name}</td>
                              <td className="py-3 font-mono text-slate-500 uppercase">{p.idValue} ({p.idType.toUpperCase()})</td>
                              <td className="py-3 text-slate-600">{p.gender}</td>
                              <td className="py-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  p.currentZone === 'Red Zone' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                  p.currentZone === 'Yellow Zone' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                  p.currentZone === 'Green Zone' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                  p.currentZone === 'White Tag' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                  'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                  {p.currentZone}
                                </span>
                              </td>
                              <td className="py-3 font-bold text-slate-700">{p.bedNumber}</td>
                              <td className="py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedPatient(p)}
                                  className="text-xs font-bold text-teal-600 hover:text-teal-800 cursor-pointer"
                                >
                                  Open File &rarr;
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ============================================================================== */}
              {/* STAGE B2: CLINICAL PATIENT DIRECTORY TAB                                       */}
              {/* ============================================================================== */}
              {activeSubTab === 'directory' && (
                <div className="space-y-6">
                  
                  {/* Filter and search controls panel */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      
                      {/* Search Bar */}
                      <div className="relative w-full md:max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search patient records by Name, IC/Passport, Bed..."
                          className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-teal-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 min-h-[40px]"
                        />
                      </div>

                      {/* Advanced filters */}
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                          <Filter className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold">Filters:</span>
                        </div>

                        <select
                          value={zoneFilter}
                          onChange={(e) => setZoneFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-600 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-teal-500 min-h-[40px]"
                        >
                          <option value="all">All Triage Zones</option>
                          <option value="Red Zone">Red Zone (Critical)</option>
                          <option value="Yellow Zone">Yellow Zone (Urgent)</option>
                          <option value="Green Zone">Green Zone (Standard)</option>
                          <option value="White Tag">White Tag (Observation)</option>
                          <option value="Transfered">Transfered (Ward)</option>
                        </select>

                        <select
                          value={genderFilter}
                          onChange={(e) => setGenderFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-600 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-teal-500 min-h-[40px]"
                        >
                          <option value="all">All Genders</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>

                        {(zoneFilter !== 'all' || genderFilter !== 'all' || searchQuery !== '') && (
                          <button
                            type="button"
                            onClick={() => { setZoneFilter('all'); setGenderFilter('all'); setSearchQuery(''); }}
                            className="text-xs text-rose-600 font-bold hover:underline px-2 cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Main Directory List of Patient records */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 flex-wrap gap-2">
                      <h3 className="text-sm font-black text-slate-800">
                        Patients Database Registry ({filteredPatients.length} profiles found)
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleSubTabChange('register')}
                        className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-3 py-1.5 rounded-xl border border-teal-100 flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register Patient</span>
                      </button>
                    </div>

                    {filteredPatients.length === 0 ? (
                      <div className="text-center p-12 text-slate-400 text-xs">
                        No registered patient records match the search query or active filter settings.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-slate-400 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wide">
                              <th className="py-2.5">Admitted On</th>
                              <th className="py-2.5">Patient Name</th>
                              <th className="py-2.5">ID Value / Nationality</th>
                              <th className="py-2.5">Gender</th>
                              <th className="py-2.5">Triage Zone</th>
                              <th className="py-2.5">Bed Number</th>
                              <th className="py-2.5 text-right">Medical Case Study</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {filteredPatients.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="py-3.5 text-slate-400 font-medium whitespace-nowrap">
                                  {new Date(p.registeredAt).toLocaleDateString()} {new Date(p.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-3.5">
                                  <div className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                                    {p.name}
                                  </div>
                                </td>
                                <td className="py-3.5 whitespace-nowrap">
                                  <span className="font-mono text-slate-600 font-bold">{p.idValue}</span>
                                  <span className="text-[10px] uppercase font-black text-slate-400 block mt-0.5">
                                    {p.idType === 'ic' ? 'Malaysian MyKad' : `Passport • ${p.country || 'N/A'}`}
                                  </span>
                                </td>
                                <td className="py-3.5 font-bold text-slate-500">{p.gender}</td>
                                <td className="py-3.5">
                                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                    p.currentZone === 'Red Zone' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                    p.currentZone === 'Yellow Zone' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    p.currentZone === 'Green Zone' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    p.currentZone === 'White Tag' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                    'bg-blue-50 text-blue-700 border-blue-100'
                                  }`}>
                                    {p.currentZone}
                                  </span>
                                </td>
                                <td className="py-3.5">
                                  <span className="font-extrabold text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md">
                                    {p.bedNumber}
                                  </span>
                                </td>
                                <td className="py-3.5 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPatient(p)}
                                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center gap-1 ml-auto cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Clerking File &rarr;</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ============================================================================== */}
              {/* STAGE B3: PATIENT REGISTRATION FORM TAB                                        */}
              {/* ============================================================================== */}
              {activeSubTab === 'register' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 max-w-2xl mx-auto shadow-xs">
                  <div className="border-b border-slate-100 pb-4 mb-6">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <UserPlus className="w-5.5 h-5.5 text-teal-600" />
                      <span>Register Clinical Ward Profile</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Register patients under temporary hospital custody. Genders are populated from ID details.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterPatient} className="space-y-5">
                    
                    {/* Patient Full Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Patient Full Name (as per ID)</label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g., Muhammad Danish Bin Ahmad"
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 min-h-[42px]"
                      />
                    </div>

                    {/* ID Type Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Identity Type</label>
                        <select
                          value={regIdType}
                          onChange={(e) => {
                            const val = e.target.value as 'ic' | 'passport';
                            setRegIdType(val);
                            if (val === 'ic') {
                              setRegCountry('');
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 min-h-[42px] font-bold cursor-pointer"
                        >
                          <option value="ic">Malaysian Identification (MyKad IC)</option>
                          <option value="passport">Foreign Passport No</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">
                          {regIdType === 'ic' ? 'MyKad IC Number' : 'Passport Number'}
                        </label>
                        <input
                          type="text"
                          value={regIdValue}
                          onChange={(e) => setRegIdValue(e.target.value)}
                          placeholder={regIdType === 'ic' ? 'e.g., 940822-01-5642' : 'e.g., L3892710'}
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 min-h-[42px] font-mono"
                        />
                      </div>
                    </div>

                    {/* Gender and Country Panel */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Gender Row */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">
                          Gender
                        </label>
                        {regIdType === 'ic' ? (
                          <div className="w-full bg-slate-100 border border-slate-200 text-xs text-slate-700 font-bold rounded-xl px-3.5 py-2.5 min-h-[42px] flex items-center justify-between">
                            <span>{regGender}</span>
                          </div>
                        ) : (
                          <select
                            value={regGender}
                            onChange={(e) => setRegGender(e.target.value as 'Male' | 'Female')}
                            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 min-h-[42px] font-bold cursor-pointer"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        )}
                      </div>

                      {/* Country of Passport */}
                      {regIdType === 'passport' && (
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Country of Origin (Passport)</label>
                          <input
                            type="text"
                            value={regCountry}
                            onChange={(e) => setRegCountry(e.target.value)}
                            placeholder="e.g., United Kingdom, Japan"
                            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 min-h-[42px]"
                          />
                        </div>
                      )}

                    </div>

                    {/* Zone and Bed */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Initial Triage Admission Zone</label>
                        <select
                          value={regZone}
                          onChange={(e) => setRegZone(e.target.value as PatientZone)}
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 min-h-[42px] font-bold cursor-pointer"
                        >
                          <option value="Red Zone">Red Zone (Resuscitation)</option>
                          <option value="Yellow Zone">Yellow Zone (Urgent)</option>
                          <option value="Green Zone">Green Zone (Ambulatory)</option>
                          <option value="White Tag">White Tag (Observation)</option>
                          <option value="Transfered">Transfered (Ward)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Bed Number</label>
                        <input
                          type="text"
                          value={regBedNumber}
                          onChange={(e) => setRegBedNumber(e.target.value)}
                          placeholder="e.g., Red-01, Yellow-04, Out-A"
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 min-h-[42px]"
                        />
                      </div>
                    </div>

                    {regError && (
                      <p className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                        {regError}
                      </p>
                    )}

                    {/* Submit Actions */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={resetRegForm}
                        className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 min-h-[42px] cursor-pointer"
                      >
                        Reset Form
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs min-h-[42px] cursor-pointer"
                      >
                        Commit Registration
                      </button>
                    </div>

                  </form>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ============================================================================== */}
      {/* POPUP MODAL: FULL CLINICAL NOTE VIEW & EDIT AMENDMENT DIALOG                    */}
      {/* ============================================================================== */}
      {activeModalNote && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
                    <span>TMR Clinical Record Entry</span>
                    <span className="text-[10px] font-mono font-normal bg-teal-900/80 text-teal-300 border border-teal-700/60 px-2 py-0.5 rounded-md">
                      {activeModalNote.id.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedPatient.name} ({selectedPatient.idValue}) • Bed: {activeModalNote.bedNumber}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setActiveModalNote(null); setAmendText(''); setAmendBedNumber(''); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto grow">
              
              {/* Warning if error status */}
              {activeModalNote.status === 'error' && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>CRITICAL AUDIT NOTICE: Clinician marked this record page as an error. Contents below are retained for legal zero-deletion requirements but should be disregarded.</span>
                </div>
              )}

              {/* Note Metadata Banner */}
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex-wrap gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Committed Timestamp</span>
                  <span className="font-bold text-slate-800">
                    {new Date(activeModalNote.createdAt).toLocaleString([], { dateStyle: 'full', timeStyle: 'medium' })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold sm:text-right">Signed Off Clinician</span>
                  <span className="font-bold text-teal-700">
                    {activeModalNote.createdBy}
                  </span>
                </div>
              </div>

              {/* Complete Progress Note text */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Clinician Progress Notes</label>
                <div className={`p-5 rounded-2xl border bg-slate-50/50 text-slate-800 text-sm font-serif leading-relaxed whitespace-pre-wrap ${
                  activeModalNote.status === 'error' ? 'line-through text-slate-400 bg-rose-50/20 border-rose-100' : 'border-slate-200/80'
                }`}>
                  {activeModalNote.progressNote}
                </div>
              </div>

              {/* AMENDMENTS AUDIT LIST */}
              {activeModalNote.amendments && activeModalNote.amendments.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-extrabold uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                    <CornerDownRight className="w-4 h-4" />
                    <span>Amendment History ({activeModalNote.amendments.length})</span>
                  </span>
                  <div className="space-y-3">
                    {activeModalNote.amendments.map((amend, idx) => (
                      <div key={amend.id || idx} className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-indigo-600">
                          <span>Amendment #{idx + 1}</span>
                          <span className="text-slate-400 text-[11px] font-normal">
                            {new Date(amend.amendedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-serif leading-relaxed italic">
                          "{amend.note}"
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-indigo-100/40">
                          <span>Bed: <strong className="text-slate-700">{amend.bedNumber || activeModalNote.bedNumber}</strong></span>
                          <span>Amended by: <strong className="text-indigo-700 font-bold">{amend.amendedBy}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ADD AMENDMENT OR EDIT SECTION */}
              {activeModalNote.status !== 'error' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 text-teal-700">
                      <Edit3 className="w-4 h-4" />
                      <span>Append Clinical Amendment / Edit Record</span>
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        await handleMarkAsError(activeModalNote.id);
                        setActiveModalNote(null);
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Flag/Mark Entry as Error</span>
                    </button>
                  </h4>

                  <div className="space-y-3">
                    <textarea
                      value={amendText}
                      onChange={(e) => setAmendText(e.target.value)}
                      rows={3}
                      placeholder="Type clinician amendment note details (e.g. updated blood pressure, secondary diagnosis, medication response)..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-500 font-sans"
                    />
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Updated Bed:</span>
                        <input
                          type="text"
                          value={amendBedNumber || activeModalNote.bedNumber}
                          onChange={(e) => setAmendBedNumber(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 w-28 font-bold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await handleAmendNote(activeModalNote.id);
                          const updated = clerkingNotes.find(n => n.id === activeModalNote.id);
                          if (updated) {
                            setActiveModalNote(updated);
                          } else {
                            setActiveModalNote(null);
                          }
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer min-h-[38px]"
                      >
                        Commit Amendment
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 font-medium">TMR Official Medical Audit Log System</span>
              <button
                type="button"
                onClick={() => { setActiveModalNote(null); setAmendText(''); setAmendBedNumber(''); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close File
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
