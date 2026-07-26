import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Trash2, 
  Heart, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Smartphone, 
  Info,
  CalendarDays,
  FileCheck2,
  Disc,
  ArrowRight
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { HolterSchedule, HolterStatus } from '../types';

// Standard demo schedules to populate the registry on first load
const PRESET_HOLTER_SCHEDULES: HolterSchedule[] = [
  {
    id: 'preset-h1',
    patientName: 'Teoh Kah Seng',
    patientPhone: '+6012-7654321',
    deviceId: 'HOL-101',
    hookupDate: new Date().toISOString().split('T')[0], // Hooked up today
    durationDays: 3,
    returnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    indication: 'Palpitations & suspected paroxysmal Atrial Fibrillation',
    status: 'Hooked Up',
    notes: 'Teoh is compliant, instructed on event button usage.',
    userId: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'preset-h2',
    patientName: 'Fatimah Binti Ismail',
    patientPhone: '+6019-8765432',
    deviceId: 'HOL-102',
    hookupDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    durationDays: 2,
    returnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    indication: 'Recurrent presyncope / lightheadedness',
    status: 'Returned',
    notes: 'Device returned on time. Pending download to Cardioscan analyzer.',
    userId: 'system',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'preset-h3',
    patientName: 'Subramaniam A/L Govindasamy',
    patientPhone: '+6017-1234567',
    deviceId: 'HOL-105',
    hookupDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    durationDays: 7,
    returnDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    indication: 'Cryptogenic Stroke workup',
    status: 'Reported',
    notes: 'Report completed by cardiologist. Showed normal sinus rhythm, zero runs of AF.',
    userId: 'system',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'preset-h4',
    patientName: 'William Robert Miller',
    patientPhone: '+6011-23456789',
    deviceId: 'HOL-103',
    hookupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // scheduled in 2 days
    durationDays: 1,
    returnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    indication: 'Evaluation of beta-blocker efficacy',
    status: 'Scheduled',
    notes: 'Confirmed for 9:00 AM hookup appointment.',
    userId: 'system',
    createdAt: new Date().toISOString()
  }
];

export const HolterScheduler: React.FC = () => {
  const { currentUser, isDemoUser } = useAuth();
  
  // States
  const [schedules, setSchedules] = useState<HolterSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form states
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form inputs
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('HOL-101');
  const [hookupDate, setHookupDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [durationDays, setDurationDays] = useState<number>(3);
  const [indication, setIndication] = useState<string>('Palpitations');
  const [notes, setNotes] = useState<string>('');

  // Auto calculate return date based on hookup date and duration
  const returnDate = hookupDate
    ? new Date(new Date(hookupDate).getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : '';

  // Clean object for Firestore (removes undefined properties)
  const cleanForFirestore = <T,>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  };

  // Listen to firestore schedules
  useEffect(() => {
    if (!currentUser) return;
    
    setLoading(true);

    try {
      const colRef = collection(db, 'holter_schedules');

      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const docsData: HolterSchedule[] = [];
        snapshot.forEach((docSnap) => {
          docsData.push({
            id: docSnap.id,
            ...docSnap.data()
          } as HolterSchedule);
        });

        if (docsData.length === 0) {
          const localData = localStorage.getItem(isDemoUser ? 'holter_schedules_demo' : `holter_schedules_${currentUser.uid}`);
          let initialSchedules = PRESET_HOLTER_SCHEDULES;
          if (localData) {
            try { initialSchedules = JSON.parse(localData); } catch (e) { console.error(e); }
          }
          initialSchedules.forEach(async (s) => {
            try { await setDoc(doc(db, 'holter_schedules', s.id), cleanForFirestore(s)); } catch (e) { console.error(e); }
          });
          setSchedules(initialSchedules);
        } else {
          // Merge preset schedules if needed
          const presetIds = PRESET_HOLTER_SCHEDULES.map(p => p.id);
          const hasPresets = docsData.some(d => presetIds.includes(d.id));
          const combined = hasPresets ? docsData : [...docsData, ...PRESET_HOLTER_SCHEDULES];
          setSchedules(combined);
          try {
            localStorage.setItem(isDemoUser ? 'holter_schedules_demo' : `holter_schedules_${currentUser.uid}`, JSON.stringify(combined));
          } catch (e) { console.error(e); }
        }
        setLoading(false);
      }, (err) => {
        console.warn('Holter schedules firestore warning, loading offline cache:', err);
        const localData = localStorage.getItem(isDemoUser ? 'holter_schedules_demo' : `holter_schedules_${currentUser.uid}`);
        if (localData) {
          setSchedules(JSON.parse(localData));
        } else {
          setSchedules(PRESET_HOLTER_SCHEDULES);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [currentUser, isDemoUser]);

  // Sync caches
  useEffect(() => {
    if (currentUser && schedules.length > 0) {
      const storageKey = isDemoUser ? 'holter_schedules_demo' : `holter_schedules_${currentUser.uid}`;
      localStorage.setItem(storageKey, JSON.stringify(schedules));
    }
  }, [schedules, currentUser, isDemoUser]);

  // Handle Book Schedule Submit
  const handleBookSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!patientName.trim() || !deviceId.trim()) {
      setErrorMessage('Patient Name and Device ID are required.');
      return;
    }

    const newSchedule: Omit<HolterSchedule, 'id'> = {
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim() || undefined,
      deviceId,
      hookupDate,
      durationDays,
      returnDate,
      indication,
      status: 'Scheduled',
      notes: notes.trim() || undefined,
      userId: currentUser?.uid || 'anonymous',
      createdAt: new Date().toISOString()
    };

    try {
      const colRef = collection(db, 'holter_schedules');
      const cleaned = cleanForFirestore(newSchedule);
      await addDoc(colRef, cleaned);

      setSuccessMessage(`Successfully booked Holter scheduling session for ${patientName}`);
      setPatientName('');
      setPatientPhone('');
      setNotes('');
      setIsAdding(false);
    } catch (err) {
      console.error('Error booking Holter schedule to Firestore, saving locally:', err);
      const localNew: HolterSchedule = {
        ...newSchedule,
        id: `holter-demo-${Date.now()}`
      };
      setSchedules(prev => [localNew, ...prev]);
      setSuccessMessage(`Booked Holter session locally for ${patientName}`);
      setPatientName('');
      setPatientPhone('');
      setNotes('');
      setIsAdding(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: HolterStatus) => {
    try {
      if (isDemoUser) {
        setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      } else {
        const docRef = doc(db, 'holter_schedules', id);
        await updateDoc(docRef, { status: newStatus });
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Delete this cardioscan holter schedule record?')) return;
    try {
      if (isDemoUser) {
        setSchedules(prev => prev.filter(s => s.id !== id));
      } else {
        const docRef = doc(db, 'holter_schedules', id);
        await deleteDoc(docRef);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Search
  const filteredSchedules = schedules.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = s.patientName.toLowerCase().includes(q) || s.deviceId.toLowerCase().includes(q) || s.indication.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Device stats helper
  const holterRecordersList = [
    { id: 'HOL-101', name: 'Cardioscan Rec-101', type: '3-Channel standard' },
    { id: 'HOL-102', name: 'Cardioscan Rec-102', type: '3-Channel standard' },
    { id: 'HOL-103', name: 'Cardioscan Patch-103', type: '7-Day Patch Rec' },
    { id: 'HOL-104', name: 'Cardioscan Patch-104', type: '7-Day Patch Rec' },
    { id: 'HOL-105', name: 'Cardioscan Rec-105', type: '12-Lead diagnostic' },
  ];

  const getDeviceStatus = (devId: string) => {
    const activeUse = schedules.find(s => s.deviceId === devId && (s.status === 'Hooked Up' || s.status === 'Scheduled'));
    if (activeUse) {
      return activeUse.status === 'Hooked Up' ? { label: 'In Use', style: 'bg-rose-50 text-rose-700 border-rose-100' } : { label: 'Reserved', style: 'bg-amber-50 text-amber-700 border-amber-100' };
    }
    return { label: 'Available', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  };

  const getStatusBadgeStyle = (status: HolterStatus) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Hooked Up':
        return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
      case 'Returned':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Downloaded':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Reported':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Device Fleet Monitor */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-indigo-600" />
          <span>Holter Recorders Live Fleet Tracker</span>
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {holterRecordersList.map((rec) => {
            const state = getDeviceStatus(rec.id);
            return (
              <div key={rec.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between space-y-1 text-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rec.id}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border uppercase ${state.style}`}>
                      {state.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-1">{rec.name}</p>
                </div>
                <span className="text-[9px] text-slate-400 block pt-1 border-t border-slate-100/50">{rec.type}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Form Overlay / Inline */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              <span>Book New Holter Hookup Session</span>
            </h4>
            <button 
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleBookSchedule} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Teoh Kah Seng"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-slate-900 font-semibold min-h-[40px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Contact Number</label>
                <input
                  type="text"
                  placeholder="e.g. +6012-7654321"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium min-h-[40px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Assign Device ID</label>
                <select
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold bg-white"
                >
                  <option value="HOL-101">HOL-101 (3-Ch)</option>
                  <option value="HOL-102">HOL-102 (3-Ch)</option>
                  <option value="HOL-103">HOL-103 (7-Day Patch)</option>
                  <option value="HOL-104">HOL-104 (7-Day Patch)</option>
                  <option value="HOL-105">HOL-105 (12-Lead)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Hookup Appointment Date</label>
                <input
                  type="date"
                  required
                  value={hookupDate}
                  onChange={(e) => setHookupDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-slate-900 min-h-[40px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Scan Duration</label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold bg-white"
                >
                  <option value={1}>24 Hours (1 Day)</option>
                  <option value={2}>48 Hours (2 Days)</option>
                  <option value={3}>72 Hours (3 Days)</option>
                  <option value={7}>7 Days (Patch)</option>
                  <option value={14}>14 Days (Patch)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-950 font-bold">
              <span>Appointment Calculation Details:</span>
              <div className="flex items-center gap-2">
                <span>Hookup: <span className="text-indigo-700">{hookupDate}</span></span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Return Date: <span className="text-rose-700 font-extrabold">{returnDate}</span></span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Clinical Indication / Diagnosis</label>
              <input
                type="text"
                required
                placeholder="e.g. Unexplained palpitations, syncopal episodes, diagnostic stroke assessment..."
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-slate-900 min-h-[40px]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Operator/Hookup Notes</label>
              <textarea
                rows={2}
                placeholder="Any skin prep instructions, diaries given, patient special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 min-h-[42px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold min-h-[42px]"
              >
                Book Hookup Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Scheduler Query Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search holter schedule registry by patient name, assigned device, indication..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 bg-slate-50 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-[180px] px-2.5 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
          >
            <option value="all">All Lifecycles</option>
            <option value="Scheduled">Scheduled Hookups</option>
            <option value="Hooked Up">Active Wearers</option>
            <option value="Returned">Returned Recorders</option>
            <option value="Downloaded">Downloaded Data</option>
            <option value="Reported">Fully Reported</option>
          </select>

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all min-h-[38px] shrink-0"
            >
              Book Schedule
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Grid of Schedules */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-3">Loading Cardioscan Holter Schedules...</p>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Calendar className="w-8 h-8 text-indigo-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No scheduled sessions found</h3>
          <p className="text-xs text-slate-500">Create a booking appointment or adjust filters to view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchedules.map((item) => {
            return (
              <div 
                key={item.id}
                className={`bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  {/* Top line with Device ID and Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                      Assigned: <strong className="font-extrabold">{item.deviceId}</strong>
                    </span>
                    
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border tracking-wide ${getStatusBadgeStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Patient particulars */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                      <User className="w-4 h-5 text-blue-600" />
                      <span>{item.patientName}</span>
                    </h4>
                    {item.patientPhone && (
                      <p className="text-xs text-slate-500 font-mono pl-5">{item.patientPhone}</p>
                    )}
                  </div>

                  {/* Date details */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Hookup Appointment</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.hookupDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Due Return ({item.durationDays} Days)</span>
                      <span className="font-bold text-rose-800 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-rose-400" />
                        {item.returnDate}
                      </span>
                    </div>
                  </div>

                  {/* Clinical Indications */}
                  <div className="text-xs space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Clinical Indication</span>
                    <p className="font-semibold text-slate-800 pl-1">{item.indication}</p>
                  </div>

                  {item.notes && (
                    <div className="text-[11px] bg-slate-50/50 p-2.5 rounded-lg border border-slate-200/40 text-slate-600 font-medium italic">
                      Note: {item.notes}
                    </div>
                  )}
                </div>

                {/* Footer status transitions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  {/* Status update selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Set Lifecycle:</span>
                    <select
                      value={item.status}
                      onChange={(e) => handleUpdateStatus(item.id, e.target.value as HolterStatus)}
                      className="px-2 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-bold text-xs"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Hooked Up">Hooked Up</option>
                      <option value="Returned">Returned</option>
                      <option value="Downloaded">Downloaded</option>
                      <option value="Reported">Reported</option>
                    </select>
                  </div>

                  {item.userId === currentUser?.uid && (
                    <button
                      onClick={() => handleDeleteSchedule(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Remove Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
