import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Plus, 
  Search, 
  Trash2, 
  Film, 
  Image as ImageIcon, 
  Activity, 
  User, 
  Calendar, 
  ChevronRight, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  Camera, 
  X,
  Sparkles
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { EchoCase } from '../types';

// Let's create realistic looping clinical demo videos/GIFs as starting presets 
const PRESET_ECHO_CASES: EchoCase[] = [
  {
    id: 'preset-as',
    title: 'Severe calcific Aortic Stenosis with severe LV Hypertrophy',
    pathology: 'Aortic Stenosis',
    patientAge: 74,
    patientGender: 'Male',
    description: 'Transthoracic echocardiogram (PLAX view) showing severe calcification of the aortic valve leaflets with restricted opening (Aortic Valve Area estimated at 0.7 cm², peak pressure gradient 64 mmHg). Marked concentric LV hypertrophy is visible, consistent with severe pressure overload.',
    mediaUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=1200', // representative cardiology lab graphic
    mediaType: 'image',
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    userId: 'system'
  },
  {
    id: 'preset-mr',
    title: 'Severe Posterior Mitral Valve Prolapse with Eccentric MR Jet',
    pathology: 'Mitral Regurgitation',
    patientAge: 58,
    patientGender: 'Female',
    description: 'Transthoracic echocardiogram (AP4C view) with Color Doppler. Demonstrates severe mitral regurgitation caused by P2 segment prolapse/flail leaflet of the mitral valve. The regurgitant jet is highly eccentric, wrapping around the posterior wall of the left atrium.',
    mediaUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=1200', // representative ultrasound/cardiac graphic
    mediaType: 'image',
    uploadDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    userId: 'system'
  },
  {
    id: 'preset-hcm',
    title: 'Hypertrophic Obstructive Cardiomyopathy (HOCM) with SAM',
    pathology: 'HCM',
    patientAge: 32,
    patientGender: 'Male',
    description: 'Transthoracic echocardiogram showing asymmetric septal hypertrophy (IVS thickness 22mm) and Systolic Anterior Motion (SAM) of the mitral valve causing dynamic Left Ventricular Outflow Tract (LVOT) obstruction (peak gradient 82 mmHg at rest).',
    mediaUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200', // diagnostic clinic graphic
    mediaType: 'image',
    uploadDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    userId: 'system'
  }
];

export const EchoCases: React.FC = () => {
  const { currentUser, isDemoUser } = useAuth();
  const [cases, setCases] = useState<EchoCase[]>([]);
  const [confirmDeleteCase, setConfirmDeleteCase] = useState<EchoCase | null>(null);
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('deleted_echo_case_ids') || '[]');
    } catch {
      return [];
    }
  });

  const deletedIdsRef = useRef<string[]>(deletedIds);
  useEffect(() => {
    deletedIdsRef.current = deletedIds;
  }, [deletedIds]);

  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals / forms states
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // New Case Form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPathology, setNewPathology] = useState<string>('Aortic Stenosis');
  const [newOtherPathology, setNewOtherPathology] = useState<string>('');
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [newMrn, setNewMrn] = useState<string>('');
  const [newDoneBy, setNewDoneBy] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [mediaType, setMediaType] = useState<'gif' | 'image' | 'video'>('image');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active case for modal/full-view
  const [viewingCase, setViewingCase] = useState<EchoCase | null>(null);

  // Clean object for Firestore (removes undefined properties)
  const cleanForFirestore = <T,>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  };

  // Real-time listener for Firestore cases
  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const colRef = collection(db, 'echo_cases');
      
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        let loadedCases: EchoCase[] = [];
        snapshot.forEach((docSnap) => {
          loadedCases.push({
            id: docSnap.id,
            ...docSnap.data()
          } as EchoCase);
        });

        if (loadedCases.length === 0) {
          const localData = localStorage.getItem(isDemoUser ? 'echo_cases_demo' : `echo_cases_${currentUser.uid}`);
          let initialCases = PRESET_ECHO_CASES;
          if (localData) {
            try { initialCases = JSON.parse(localData); } catch (e) { console.error(e); }
          }
          initialCases.forEach(async (c) => {
            try { await setDoc(doc(db, 'echo_cases', c.id), cleanForFirestore(c)); } catch (e) { console.error(e); }
          });
          setCases(initialCases.filter(c => !deletedIdsRef.current.includes(c.id)));
        } else {
          // Merge presets if missing
          const presetIds = PRESET_ECHO_CASES.map(p => p.id);
          const hasPresets = loadedCases.some(c => presetIds.includes(c.id));
          const combined = hasPresets ? loadedCases : [...loadedCases, ...PRESET_ECHO_CASES];
          setCases(combined.filter(c => !deletedIdsRef.current.includes(c.id)));
          try {
            localStorage.setItem(isDemoUser ? 'echo_cases_demo' : `echo_cases_${currentUser.uid}`, JSON.stringify(combined));
          } catch (e) { console.error(e); }
        }
        setLoading(false);
      }, (err) => {
        console.warn('Echo Cases firestore error, falling back to local storage cache:', err);
        const localData = localStorage.getItem(isDemoUser ? 'echo_cases_demo' : `echo_cases_${currentUser.uid}`);
        if (localData) {
          try {
            const parsed = JSON.parse(localData) as EchoCase[];
            setCases(parsed.filter(c => !deletedIdsRef.current.includes(c.id)));
          } catch {
            setCases(PRESET_ECHO_CASES.filter(c => !deletedIdsRef.current.includes(c.id)));
          }
        } else {
          setCases(PRESET_ECHO_CASES.filter(c => !deletedIdsRef.current.includes(c.id)));
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [currentUser, isDemoUser]);

  // Sync to local storage for offline resilience
  useEffect(() => {
    if (currentUser) {
      const storageKey = isDemoUser ? 'echo_cases_demo' : `echo_cases_${currentUser.uid}`;
      localStorage.setItem(storageKey, JSON.stringify(cases));
    }
  }, [cases, currentUser, isDemoUser]);

  // Handle local file preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      
      // Auto detect media type from file extension
      const fileType = file.type;
      if (fileType.includes('gif')) {
        setMediaType('gif');
      } else if (fileType.includes('video') || fileType.includes('mp4')) {
        setMediaType('video');
      } else {
        setMediaType('image');
      }

      // Read as Data URI for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setMediaPreviewUrl(event.target?.result as string || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newTitle.trim()) {
      setErrorMessage('Please provide a case title.');
      return;
    }

    const actualPathology = newPathology === 'Other' ? (newOtherPathology.trim() || 'Other Pathology') : newPathology;
    
    // In production medical setups, we can use a standard fallback card illustration if no media is uploaded
    const defaultMediaUrl = mediaType === 'video' 
      ? 'https://www.w3schools.com/html/mov_bbb.mp4' // safe standard clip
      : 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200';

    const caseData: Omit<EchoCase, 'id'> = {
      title: newTitle.trim(),
      patientName: newPatientName.trim() || undefined,
      mrn: newMrn.trim() || undefined,
      doneBy: newDoneBy.trim() || undefined,
      pathology: actualPathology,
      otherPathology: newPathology === 'Other' ? newOtherPathology.trim() : undefined,
      description: newDescription.trim(),
      mediaUrl: mediaPreviewUrl || defaultMediaUrl,
      mediaType: mediaType,
      uploadDate: new Date().toISOString().split('T')[0],
      userId: currentUser?.uid || 'anonymous'
    };

    try {
      const colRef = collection(db, 'echo_cases');
      const cleaned = cleanForFirestore(caseData);
      await addDoc(colRef, cleaned);

      setSuccessMessage('Successfully saved echo case to cardiology database.');
      // Reset form fields
      setNewTitle('');
      setNewPatientName('');
      setNewMrn('');
      setNewDoneBy('');
      setNewOtherPathology('');
      setNewDescription('');
      setMediaPreviewUrl('');
      setMediaFile(null);
      setIsAdding(false);
    } catch (err) {
      console.error('Error adding echo case to Firestore, saving locally:', err);
      const localNewCase: EchoCase = {
        ...caseData,
        id: `case-demo-${Date.now()}`
      };
      setCases(prev => [localNewCase, ...prev]);
      setSuccessMessage('Saved echo case locally.');
      setNewTitle('');
      setNewPatientName('');
      setNewMrn('');
      setNewDoneBy('');
      setNewOtherPathology('');
      setNewDescription('');
      setMediaPreviewUrl('');
      setMediaFile(null);
      setIsAdding(false);
    }
  };

  const onRequestDelete = (caseItem: EchoCase, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // don't open details modal
    }
    setConfirmDeleteCase(caseItem);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteCase) return;
    const id = confirmDeleteCase.id;

    // 1. Track deleted ID in state, ref & local storage
    const nextDeletedIds = Array.from(new Set([...deletedIds, id]));
    setDeletedIds(nextDeletedIds);
    deletedIdsRef.current = nextDeletedIds;
    localStorage.setItem('deleted_echo_case_ids', JSON.stringify(nextDeletedIds));

    // 2. Remove immediately from UI state & localStorage cache
    setCases(prev => {
      const remaining = prev.filter(c => c.id !== id);
      const storageKey = isDemoUser ? 'echo_cases_demo' : `echo_cases_${currentUser?.uid || 'guest'}`;
      localStorage.setItem(storageKey, JSON.stringify(remaining));
      return remaining;
    });

    if (viewingCase?.id === id) {
      setViewingCase(null);
    }
    setConfirmDeleteCase(null);

    // 3. Attempt Firestore document deletion
    if (!id.startsWith('preset-') && !id.startsWith('case-demo-')) {
      try {
        const docRef = doc(db, 'echo_cases', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('Firestore delete warning (handled locally):', err);
      }
    }
  };

  // Filter cases based on search string and excluded deleted items
  const filteredCases = cases
    .filter(c => !deletedIds.includes(c.id))
    .filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.pathology.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.patientName && c.patientName.toLowerCase().includes(q)) ||
        (c.mrn && c.mrn.toLowerCase().includes(q)) ||
        (c.doneBy && c.doneBy.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-6">
      
      {/* Search and Action Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search interesting echo cases by pathology, valve lesion, diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-800 transition-all font-medium"
          />
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 min-h-[42px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Echo Case</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Adding Case Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 shrink-0" />
                <span>Save New Echocardiogram Case</span>
              </h3>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCase} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Case Title / Clinical Synopsis</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Severe posterior mitral valve prolapse (P2 segment flail) with eccentric MR jet"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Primary Pathology</label>
                  <select
                    value={newPathology}
                    onChange={(e) => setNewPathology(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold bg-white"
                  >
                    <option value="Aortic Stenosis">Aortic Stenosis (AS)</option>
                    <option value="Mitral Regurgitation">Mitral Regurgitation (MR)</option>
                    <option value="Mitral Stenosis">Mitral Stenosis (MS)</option>
                    <option value="Aortic Regurgitation">Aortic Regurgitation (AR)</option>
                    <option value="HCM">HCM / HOCM</option>
                    <option value="Pericardial Effusion">Pericardial Effusion</option>
                    <option value="Infective Endocarditis">Infective Endocarditis</option>
                    <option value="Normal">Normal Study</option>
                    <option value="Other">Other Pathology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">MRN</label>
                  <input
                    type="text"
                    placeholder="e.g. MRN-984210"
                    value={newMrn}
                    onChange={(e) => setNewMrn(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Conditional Other Pathology Box & Done By Who */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {newPathology === 'Other' && (
                  <div>
                    <label className="block text-xs font-bold text-amber-800 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <span>Specify Other Pathology</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Constrictive Pericarditis / Cardiac Amyloidosis"
                      value={newOtherPathology}
                      onChange={(e) => setNewOtherPathology(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-amber-300 bg-amber-50/50 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 font-bold"
                    />
                  </div>
                )}

                <div className={newPathology === 'Other' ? '' : 'sm:col-span-2'}>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Done By Who</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Shafiqq / Sonographer Sarah"
                    value={newDoneBy}
                    onChange={(e) => setNewDoneBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Echocardiography Findings &amp; Clinical Notes</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe key ultrasound measurements, doppler gradients, leaflet motion, chamber dimensions, and visual characteristics..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>

              {/* Media Upload Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Case Media (GIF, Photo or Video Format)</label>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    {mediaPreviewUrl ? (
                      <div className="max-w-[200px] max-h-[120px] overflow-hidden rounded-lg border border-slate-200">
                        {mediaType === 'video' ? (
                          <video src={mediaPreviewUrl} className="w-full object-cover" muted playsInline />
                        ) : (
                          <img src={mediaPreviewUrl} alt="Preview" className="w-full object-cover" />
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}
                    <p className="text-xs font-bold text-slate-700">
                      {mediaFile ? mediaFile.name : 'Click to Upload Echo Media (GIF / MP4 / JPEG)'}
                    </p>
                    <p className="text-[10px] text-slate-400">Supports loop animation GIFs, static diagrams, and clinical ultrasound videos</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold min-h-[44px]"
                >
                  Save Case to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Cases Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-3">Loading Echo Cases Database...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Heart className="w-8 h-8 text-rose-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No cases match search query</h3>
          <p className="text-xs text-slate-500">Try broad terms like "Mitral" or "Aortic" to explore presets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c) => {
            return (
              <div 
                key={c.id}
                onClick={() => setViewingCase(c)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group h-full"
              >
                {/* Media Container */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-100 flex items-center justify-center">
                  {c.mediaType === 'video' ? (
                    <div className="relative w-full h-full">
                      <video 
                        src={c.mediaUrl} 
                        className="w-full h-full object-cover" 
                        muted 
                        loop 
                        autoPlay 
                        playsInline 
                      />
                      <div className="absolute top-2 right-2 p-1 bg-slate-900/80 rounded text-white text-[10px] font-bold flex items-center gap-1">
                        <Film className="w-3 h-3" />
                        <span>VIDEO</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img 
                        src={c.mediaUrl} 
                        alt={c.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                      />
                      <div className="absolute top-2 right-2 p-1 bg-slate-900/80 rounded text-white text-[10px] font-bold flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>{c.mediaType.toUpperCase()}</span>
                      </div>
                    </div>
                  )}

                  {/* Pathology Badge Overlay */}
                  <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded bg-rose-600 border border-rose-500 text-white text-[10px] font-extrabold uppercase tracking-wide shadow-xs">
                    {c.pathology}
                  </span>
                </div>

                {/* Case Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-slate-800">{c.patientName || c.title}</span>
                      </div>
                      {c.mrn && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] shrink-0">
                          MRN: {c.mrn}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors leading-snug">
                      {c.title}
                    </h4>

                    {c.doneBy && (
                      <p className="text-[11px] font-medium text-slate-500">
                        Done by: <span className="font-bold text-slate-700">{c.doneBy}</span>
                      </p>
                    )}

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      {c.uploadDate}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => onRequestDelete(c, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Echocardiogram Case"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        <span>Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Case Detailed Modal View */}
      {viewingCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3 truncate">
                <div className="p-2 rounded-lg bg-rose-600/90 text-white shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm sm:text-base font-bold truncate text-white">
                    {viewingCase.title}
                  </h3>
                  <p className="text-xs text-rose-200/80 font-medium truncate">
                    Echocardiogram Case Study — {viewingCase.pathology}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setViewingCase(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Main Content */}
            <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
              
              {/* Media stage (left) */}
              <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 min-h-[300px] lg:min-h-[450px]">
                {viewingCase.mediaType === 'video' ? (
                  <video 
                    src={viewingCase.mediaUrl} 
                    className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg" 
                    controls 
                    muted 
                    loop 
                    autoPlay 
                  />
                ) : (
                  <img 
                    src={viewingCase.mediaUrl} 
                    alt={viewingCase.title} 
                    className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg" 
                  />
                )}
              </div>

              {/* Side bar (right) */}
              <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
                    Case Summary
                  </h4>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Pathology Category</span>
                    <span className="inline-block mt-1 px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                      {viewingCase.pathology}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Details</span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5">
                      {viewingCase.patientName || 'Anonymous / Unspecified'}
                    </span>
                    {viewingCase.mrn && (
                      <span className="text-xs text-slate-500 font-mono font-bold block mt-0.5">
                        MRN: {viewingCase.mrn}
                      </span>
                    )}
                  </div>

                  {viewingCase.doneBy && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Done By</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">
                        {viewingCase.doneBy}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Findings &amp; Remarks</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1 whitespace-pre-wrap">
                      {viewingCase.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Uploaded On</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">{viewingCase.uploadDate}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={(e) => onRequestDelete(viewingCase, e)}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Delete Case Study</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingCase(null)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Close Viewer</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDeleteCase && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Case Study?</h3>
                <p className="text-xs text-slate-500 font-medium">This action will remove it from your case database.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-0.5">
              <p className="text-xs font-bold text-slate-800 line-clamp-2">{confirmDeleteCase.title}</p>
              <p className="text-[11px] text-slate-500 font-medium">{confirmDeleteCase.pathology}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteCase(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all min-h-[42px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all min-h-[42px] cursor-pointer"
              >
                Delete Case
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
