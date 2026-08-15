import React, { useState } from 'react';
import { 
  Calculator, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ChevronRight,
  ChevronDown,
  Sparkles,
  Wrench,
  Info,
  Check,
  X,
  Layers,
  ArrowDown,
  Stethoscope,
  Heart,
  Zap,
  HelpCircle
} from 'lucide-react';

export const EchoCalculator: React.FC = () => {
  // --- Rhythm Mode: 'sinus' vs 'af' (Atrial Fibrillation) ---
  const [rhythmMode, setRhythmMode] = useState<'sinus' | 'af'>('sinus');
  const [isPathMappingOpen, setIsPathMappingOpen] = useState<boolean>(false);
  const [isFlowchartGraphOpen, setIsFlowchartGraphOpen] = useState<boolean>(false);

  // --- Primary Shared Echo Inputs ---
  const [septalEPrime, setSeptalEPrime] = useState<number | ''>(''); // cm/s
  const [lateralEPrime, setLateralEPrime] = useState<number | ''>(''); // cm/s
  const [peakE, setPeakE] = useState<number | ''>(''); // cm/s
  const [peakA, setPeakA] = useState<number | ''>(''); // cm/s
  const [trVelocity, setTrVelocity] = useState<number | ''>(''); // cm/s
  const [pasp, setPasp] = useState<number | ''>(''); // mmHg

  // Numeric equivalents for safe calculations
  const numSeptalEPrime = typeof septalEPrime === 'number' ? septalEPrime : 0;
  const numLateralEPrime = typeof lateralEPrime === 'number' ? lateralEPrime : 0;
  const numPeakE = typeof peakE === 'number' ? peakE : 0;
  const numPeakA = typeof peakA === 'number' ? peakA : 0;
  const numTrVelocity = typeof trVelocity === 'number' ? trVelocity : 0;
  const numTrVelocityM = numTrVelocity > 0 ? (numTrVelocity > 15 ? numTrVelocity / 100 : numTrVelocity) : 0;
  const numPasp = typeof pasp === 'number' ? pasp : 0;

  // --- AF Specific Inputs ---
  const [decelTime, setDecelTime] = useState<number | ''>(''); // DT in ms (positive if <= 160 ms)
  const [bmi, setBmi] = useState<number | ''>(''); // BMI in kg/m² (positive if > 30)

  // --- Secondary Markers (Purple Box for Sinus) ---
  const [pvSD, setPvSD] = useState<number | ''>(''); // Pulmonary Vein S/D ratio
  const [lars, setLars] = useState<number | ''>(''); // Left Atrial Reservoir Strain % (positive if < 18)
  const [lavi, setLavi] = useState<number | ''>(''); // LA Volume Index mL/m² (positive if > 34)
  const [ivrt, setIvrt] = useState<number | ''>(''); // Isovolumic Relaxation Time ms (positive if <= 70)

  // Direct overrides / toggles for secondary markers if numerical measurement unavailable
  const [overrideSecondaryPresent, setOverrideSecondaryPresent] = useState<boolean | null>(null);
  const [overrideAfSecondaryState, setOverrideAfSecondaryState] = useState<'none' | 'one_or_unreliable' | 'two_or_three' | null>(null);

  // Directional keyboard navigation handler for Echo Measurement input boxes
  const handleEchoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentRow: number, currentCol: number) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      // Unconditionally prevent browser default (which increments/decrements numeric input value on ArrowUp/ArrowDown)
      e.preventDefault();

      let targetRow = currentRow;
      let targetCol = currentCol;

      if (e.key === 'ArrowUp') {
        if (currentRow > 0) targetRow = currentRow - 1;
      } else if (e.key === 'ArrowDown') {
        if (currentRow < 4) targetRow = currentRow + 1;
      } else if (e.key === 'ArrowLeft') {
        if (currentCol > 0) targetCol = currentCol - 1;
      } else if (e.key === 'ArrowRight') {
        const maxColInCurrentRow = currentRow === 4 ? 3 : (currentRow === 2 || currentRow === 3 ? 0 : 1);
        if (currentCol < maxColInCurrentRow) targetCol = currentCol + 1;
      }

      // Clamp target column to the maximum available column in target row
      const maxColInTargetRow = targetRow === 4 ? 3 : (targetRow === 2 || targetRow === 3 ? 0 : 1);
      if (targetCol > maxColInTargetRow) {
        targetCol = maxColInTargetRow;
      }

      const targetElement = document.querySelector<HTMLInputElement>(
        `input[data-echo-row="${targetRow}"][data-echo-col="${targetCol}"]`
      );
      if (targetElement) {
        targetElement.focus();
        targetElement.select();
      }
    }
  };

  // --- Special Exclusions (Yellow Box) ---
  const [exclusions, setExclusions] = useState<{ [key: string]: boolean }>({
    mac: false,
    mr: false,
    ms: false,
    af: false,
    lvad: false,
    nonCardiacPH: false,
    htx: false,
    constriction: false
  });

  const toggleExclusion = (key: string) => {
    setExclusions(prev => {
      const nextState = { ...prev, [key]: !prev[key] };
      // If AF toggled on, auto offer/switch rhythm mode
      if (key === 'af' && nextState.af) {
        setRhythmMode('af');
      } else if (key === 'af' && !nextState.af) {
        setRhythmMode('sinus');
      }
      return nextState;
    });
  };

  const hasAnyExclusion = Object.values(exclusions).some(Boolean);

  // --- Shared Calculations ---
  const eARatio = numPeakA > 0 ? parseFloat((numPeakE / numPeakA).toFixed(2)) : 0;
  const hasBothEPrime = numSeptalEPrime > 0 && numLateralEPrime > 0;
  const averageEPrime = hasBothEPrime ? parseFloat(((numSeptalEPrime + numLateralEPrime) / 2).toFixed(1)) : 0;
  
  const eToEPrimeSeptal = numSeptalEPrime > 0 ? parseFloat((numPeakE / numSeptalEPrime).toFixed(1)) : 0;
  const eToEPrimeLateral = numLateralEPrime > 0 ? parseFloat((numPeakE / numLateralEPrime).toFixed(1)) : 0;
  const eToEPrimeAverage = (hasBothEPrime && averageEPrime > 0) ? parseFloat((numPeakE / averageEPrime).toFixed(1)) : 0;

  // ==========================================
  // 1. SINUS RHYTHM ALGORITHM EVALUATION
  // ==========================================
  const isReducedEPrime = (numSeptalEPrime > 0 && numSeptalEPrime <= 6) || (numLateralEPrime > 0 && numLateralEPrime <= 7) || (averageEPrime > 0 && averageEPrime <= 6.5);
  const isIncreasedEToEPrime = eToEPrimeSeptal >= 15 || eToEPrimeLateral >= 13 || eToEPrimeAverage >= 14;
  const isIncreasedTRorPASP = (numTrVelocityM > 2.8) || (numPasp >= 35);

  const sinusPrimaryCriteriaList = [
    {
      id: 1,
      title: "Reduced e' velocity",
      rule: "septal ≤ 6 OR lateral ≤ 7 OR average ≤ 6.5 cm/s",
      valueText: `Septal: ${septalEPrime}, Lat: ${lateralEPrime}, Avg: ${averageEPrime} cm/s`,
      isMet: isReducedEPrime
    },
    {
      id: 2,
      title: "Increased E/e' ratio",
      rule: "septal ≥ 15 OR lateral ≥ 13 OR average ≥ 14",
      valueText: `Septal: ${eToEPrimeSeptal}, Lat: ${eToEPrimeLateral}, Avg: ${eToEPrimeAverage}`,
      isMet: isIncreasedEToEPrime
    },
    {
      id: 3,
      title: "Increased TR velocity / PASP",
      rule: "TR velocity > 280 cm/s OR PASP ≥ 35 mmHg",
      valueText: `TR Vel: ${trVelocity} cm/s, PASP: ${pasp} mmHg`,
      isMet: isIncreasedTRorPASP
    }
  ];

  const sinusPrimaryCount = sinusPrimaryCriteriaList.filter(c => c.isMet).length;

  const isPvSDMetSinus = typeof pvSD === 'number' && pvSD > 0 && pvSD <= 0.67;
  const isLarsMetSinus = typeof lars === 'number' && lars > 0 && lars <= 18;
  const isLaviMetSinus = typeof lavi === 'number' && lavi > 34;
  const isIvrtMetSinus = typeof ivrt === 'number' && ivrt > 0 && ivrt <= 70;

  const sinusSecondaryCount = (isPvSDMetSinus ? 1 : 0) + (isLarsMetSinus ? 1 : 0) + (isLaviMetSinus ? 1 : 0) + (isIvrtMetSinus ? 1 : 0);
  const isSinusSecondaryAtLeastOne = overrideSecondaryPresent !== null 
    ? overrideSecondaryPresent 
    : sinusSecondaryCount >= 1;

  const runSinusAlgorithm = () => {
    let branch = '';
    let lapStatus: 'Normal LAP' | 'Increased LAP' | 'Indeterminate' = 'Normal LAP';
    let grade = '';
    let description = '';
    let activePathId = '';
    let requiresPurpleBox = false;

    if (sinusPrimaryCount === 0) {
      branch = 'All normal';
      lapStatus = 'Normal LAP';
      grade = 'Normal Diastolic Function';
      description = 'None of the 3 primary criteria for diastolic dysfunction are met. Left Atrial Pressure (LAP) is normal and Diastolic Function is normal.';
      activePathId = 'all_normal';
    } 
    else if (sinusPrimaryCount === 1 && isReducedEPrime && !isIncreasedEToEPrime && !isIncreasedTRorPASP) {
      branch = "Reduced e' only";
      if (eARatio <= 0.8) {
        lapStatus = 'Normal LAP';
        grade = 'Grade 1';
        description = "Only reduced e' is present and E/A ≤ 0.8. LAP is Normal, indicating Grade 1 Diastolic Dysfunction (Impaired Relaxation). If symptomatic, consider Diastolic Exercise Echo.";
        activePathId = 'reduced_e_ea_low';
      } else {
        requiresPurpleBox = true;
        activePathId = 'purple_box_route';
        if (!isSinusSecondaryAtLeastOne) {
          lapStatus = 'Normal LAP';
          grade = 'Grade 1';
          description = "Reduced e' with E/A > 0.8, but NO secondary LAP markers are present (Purple Box = None). Result: Normal LAP, Grade 1 Diastolic Dysfunction.";
        } else {
          lapStatus = 'Increased LAP';
          if (eARatio < 2.0) {
            grade = 'Grade 2 (Mild/Mod ↑ LAP)';
            description = "Reduced e' with E/A > 0.8 and ≥1 secondary LAP marker present. E/A < 2 indicates Increased LAP with Grade 2 Diastolic Dysfunction.";
          } else {
            grade = 'Grade 3 (Marked ↑ LAP)';
            description = "Reduced e' with E/A > 0.8 and ≥1 secondary LAP marker present. E/A ≥ 2 indicates Increased LAP with Grade 3 Diastolic Dysfunction (Restrictive filling).";
          }
        }
      }
    } 
    else if (sinusPrimaryCount === 3) {
      branch = '3 of the above';
      lapStatus = 'Increased LAP';
      activePathId = 'three_positive';
      if (eARatio < 2.0) {
        grade = 'Grade 2 (Mild/Mod ↑ LAP)';
        description = 'All 3 primary criteria are positive. Increased LAP with E/A < 2 confirms Grade 2 Diastolic Dysfunction.';
      } else {
        grade = 'Grade 3 (Marked ↑ LAP)';
        description = 'All 3 primary criteria are positive. Increased LAP with E/A ≥ 2 confirms Grade 3 Diastolic Dysfunction (Restrictive filling).';
      }
    } 
    else {
      branch = 'Increased TR/PASP / Increased E/e\' / Any 2 abnormal';
      requiresPurpleBox = true;
      activePathId = 'purple_box_route';

      if (!isSinusSecondaryAtLeastOne) {
        lapStatus = 'Normal LAP';
        grade = 'Grade 1';
        description = 'Primary criteria suggest elevated/indeterminate markers, but NO secondary LAP markers are present (Purple Box = None). Result: Normal LAP, Grade 1 Diastolic Dysfunction.';
      } else {
        lapStatus = 'Increased LAP';
        if (eARatio < 2.0) {
          grade = 'Grade 2 (Mild/Mod ↑ LAP)';
          description = 'Primary parameters + at least 1 secondary LAP marker present. E/A < 2 confirms Increased LAP with Grade 2 Diastolic Dysfunction.';
        } else {
          grade = 'Grade 3 (Marked ↑ LAP)';
          description = 'Primary parameters + at least 1 secondary LAP marker present. E/A ≥ 2 confirms Increased LAP with Grade 3 Diastolic Dysfunction (Restrictive filling).';
        }
      }
    }

    return {
      branch,
      lapStatus,
      grade,
      description,
      activePathId,
      requiresPurpleBox
    };
  };

  // ==========================================
  // 2. ATRIAL FIBRILLATION (AF) ALGORITHM EVALUATION
  // ==========================================
  // AF Primary Criteria (4 criteria):
  // 1. Mitral E velocity >= 100 cm/s
  // 2. Septal E/e' ratio > 11
  // 3. TR velocity > 2.8 m/s OR PASP > 35 mmHg
  // 4. DT <= 160 ms

  const isAfEvelMet = numPeakE >= 100;
  const isAfSeptalEToEPrimeMet = eToEPrimeSeptal > 11;
  const isAfTrPaspMet = numTrVelocityM > 2.8 || numPasp > 35;
  const isAfDtMet = typeof decelTime === 'number' && decelTime > 0 && decelTime <= 160;

  const afPrimaryCriteriaList = [
    {
      id: 1,
      title: "Mitral E velocity ≥ 100 cm/s",
      rule: "Mitral E ≥ 100 cm/s",
      valueText: `Peak E: ${peakE} cm/s`,
      isMet: isAfEvelMet
    },
    {
      id: 2,
      title: "Septal E/e' ratio > 11",
      rule: "Septal E/e' > 11",
      valueText: `Septal E/e': ${eToEPrimeSeptal}`,
      isMet: isAfSeptalEToEPrimeMet
    },
    {
      id: 3,
      title: "TR velocity > 280 cm/s OR PASP > 35 mmHg",
      rule: "TR > 280 cm/s or PASP > 35 mmHg",
      valueText: `TR Vel: ${trVelocity} cm/s, PASP: ${pasp} mmHg`,
      isMet: isAfTrPaspMet
    },
    {
      id: 4,
      title: "Deceleration Time (DT) ≤ 160 ms",
      rule: "DT ≤ 160 ms",
      valueText: `DT: ${decelTime !== '' ? decelTime + ' ms' : 'N/A'}`,
      isMet: isAfDtMet
    }
  ];

  const afPrimaryCount = afPrimaryCriteriaList.filter(c => c.isMet).length;

  // AF Purple Box (Secondary AF criteria - 3 criteria):
  // 1. LARS < 18%
  // 2. Pulm vein S/D ratio < 1
  // 3. BMI > 30 kg/m²
  const isAfLarsMet = typeof lars === 'number' && lars > 0 && lars < 18;
  const isAfPvSDMet = typeof pvSD === 'number' && pvSD > 0 && pvSD < 1;
  const isAfBmiMet = typeof bmi === 'number' && bmi > 30;

  const afSecondaryCalculatedCount = (isAfLarsMet ? 1 : 0) + (isAfPvSDMet ? 1 : 0) + (isAfBmiMet ? 1 : 0);

  const runAfAlgorithm = () => {
    let branch = '';
    let lapStatus: 'Normal LAP' | 'Elevated LAP' | 'Indeterminate' = 'Normal LAP';
    let grade = '';
    let description = '';
    let activePathId = '';
    let requiresAfPurpleBox = false;

    if (afPrimaryCount <= 1) {
      // None or 1 of above -> Normal LAP
      branch = 'None or 1 of above positive';
      lapStatus = 'Normal LAP';
      grade = 'Normal LAP in AF';
      description = '0 or 1 of the 4 AF primary criteria met. Indicates Normal Left Atrial Pressure in Atrial Fibrillation.';
      activePathId = 'af_low_criteria';
    } 
    else if (afPrimaryCount >= 3) {
      // 3 or more of above -> Elevated LAP
      branch = '3 or 4 of above positive';
      lapStatus = 'Elevated LAP';
      grade = 'Elevated LAP in AF';
      description = '3 or 4 of the 4 AF primary criteria met. High diagnostic confidence for Elevated Left Atrial Pressure in Atrial Fibrillation.';
      activePathId = 'af_high_criteria';
    } 
    else {
      // Exactly 2 of above -> Enters AF Purple Box
      branch = '2 of above positive (Intermediate AF)';
      requiresAfPurpleBox = true;
      activePathId = 'af_purple_box';

      // Determine effective secondary AF state
      let effectiveSecondaryState: 'none' | 'one_or_unreliable' | 'two_or_three' = 'none';

      if (overrideAfSecondaryState !== null) {
        effectiveSecondaryState = overrideAfSecondaryState;
      } else {
        if (afSecondaryCalculatedCount === 0) {
          effectiveSecondaryState = 'none';
        } else if (afSecondaryCalculatedCount === 1) {
          effectiveSecondaryState = 'one_or_unreliable';
        } else {
          effectiveSecondaryState = 'two_or_three';
        }
      }

      if (effectiveSecondaryState === 'none') {
        lapStatus = 'Normal LAP';
        grade = 'Normal LAP (AF)';
        description = 'Exactly 2 AF primary criteria met, but NONE of the AF secondary markers (LARS <18%, PV S/D <1, BMI >30) are present. Result: Normal LAP in AF.';
      } else if (effectiveSecondaryState === 'one_or_unreliable') {
        lapStatus = 'Indeterminate';
        grade = 'Indeterminate LAP';
        description = 'Exactly 2 AF primary criteria met, and only 1 AF secondary marker is present (or markers unreliable/not available). Result: Indeterminate LAP in AF.';
      } else {
        lapStatus = 'Elevated LAP';
        grade = 'Elevated LAP (AF)';
        description = 'Exactly 2 AF primary criteria met, plus 2/3 or 3/3 AF secondary markers present. Result: Elevated Left Atrial Pressure in AF.';
      }
    }

    return {
      branch,
      lapStatus,
      grade,
      description,
      activePathId,
      requiresAfPurpleBox
    };
  };

  const sinusResult = runSinusAlgorithm();
  const afResult = runAfAlgorithm();

  // Derived active path booleans for 2025 ASE Guideline Flowchart
  const isAllNormalActive = rhythmMode === 'af' ? afResult.activePathId === 'af_low_criteria' : sinusPrimaryCount === 0;
  const isReducedEPrimeOnlyActive = sinusPrimaryCount === 1 && isReducedEPrime;
  const isSubEA_08_Active = isReducedEPrimeOnlyActive && eARatio <= 0.8;
  const isSubEA_GT_08_Active = isReducedEPrimeOnlyActive && eARatio > 0.8;
  const isMiddleBranchActive = (sinusPrimaryCount === 1 && !isReducedEPrime) || sinusPrimaryCount === 2;
  const isPurpleBoxActive = isMiddleBranchActive || isSubEA_GT_08_Active || (rhythmMode === 'af' && afResult.requiresAfPurpleBox);
  const isPurpleBoxNoneActive = isPurpleBoxActive && !isSinusSecondaryAtLeastOne;
  const isPurpleBoxAtLeastOneActive = isPurpleBoxActive && isSinusSecondaryAtLeastOne;
  const isThreePositiveActive = sinusPrimaryCount === 3 || (rhythmMode === 'af' && afResult.activePathId === 'af_high_criteria');
  const isNormalLAPActive = isAllNormalActive || isSubEA_08_Active || isPurpleBoxNoneActive;
  const isIncreasedLAPActive = isThreePositiveActive || isPurpleBoxAtLeastOneActive;
  const isNormalDFActive = isAllNormalActive;
  const isGrade1Active = isSubEA_08_Active || isPurpleBoxNoneActive;
  const isGrade2Active = isIncreasedLAPActive && eARatio < 2;
  const isGrade3Active = isIncreasedLAPActive && eARatio >= 2;

  const handleReset = () => {
    setSeptalEPrime('');
    setLateralEPrime('');
    setPeakE('');
    setPeakA('');
    setTrVelocity('');
    setPasp('');
    setDecelTime('');
    setBmi('');
    setPvSD('');
    setLars('');
    setLavi('');
    setIvrt('');
    setOverrideSecondaryPresent(null);
    setOverrideAfSecondaryState(null);
    setRhythmMode('sinus');
    setExclusions({
      mac: false,
      mr: false,
      ms: false,
      af: false,
      lvad: false,
      nonCardiacPH: false,
      htx: false,
      constriction: false
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 rounded-2xl border border-indigo-900/50 text-white space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-xs font-bold text-amber-200">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>This site is under development</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-futuristic">
              LV Diastolic Function &amp; LAP Estimation
            </h2>
            <p className="text-xs text-indigo-200/80 max-w-2xl font-medium leading-relaxed">
              Updated 2025 algorithms for Left Ventricular diastolic grading and LAP estimation based on American Society of Echocardiography (ASE) guidelines
            </p>
          </div>

          {/* Controls Bar: Rhythm Switcher & Reset Button */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="bg-slate-950/80 p-1.5 rounded-2xl border border-indigo-500/30 flex items-center gap-1">
              <button
                onClick={() => setRhythmMode('sinus')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  rhythmMode === 'sinus'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Sinus Rhythm</span>
              </button>
              <button
                onClick={() => {
                  setRhythmMode('af');
                  setExclusions(prev => ({ ...prev, af: true }));
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  rhythmMode === 'af'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-amber-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Atrial Fibrillation (AF)</span>
              </button>
            </div>

            <button
              onClick={handleReset}
              title="Clear all inputs and reset"
              className="px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 hover:text-white transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-rose-300" />
              <span>RESET</span>
            </button>
          </div>
        </div>

        {/* Yellow Reminder Sentence */}
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Clinical Note: Standard diastolic grading may have altered accuracy in MAC, MR, MS, AF, LVAD, non-cardiac PH, HTX, or pericardial constriction.
          </span>
        </div>
      </div>

      {/* AF Active Mode Prompt / Notification */}
      {rhythmMode === 'af' && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-950 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-extrabold text-amber-950 text-sm">
                Atrial Fibrillation (AF) LAP Flowchart Protocol Active
              </p>
              <p className="text-amber-900/90 leading-relaxed font-medium">
                Using dedicated AF LAP criteria: Mitral E ≥ 100 cm/s, Septal E/e' &gt; 11, TR &gt; 2.8 m/s or PASP &gt; 35, and Deceleration Time (DT) ≤ 160 ms. Secondary AF markers include LARS &lt; 18%, PV S/D &lt; 1, and BMI &gt; 30.
              </p>
            </div>
          </div>
        </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Parameter Inputs */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>
                  {rhythmMode === 'af' ? 'AF Diagnostic Echo Measurements' : 'Sinus Rhythm Echo Measurements'}
                </span>
              </h3>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200/80 transition-all self-start sm:self-auto cursor-pointer active:scale-95 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
              <span>RESET</span>
            </button>
          </div>

          <div className="space-y-5">

            {/* Section 1: Mitral Inflow & TDI e' Velocities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Mitral Inflow */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                <span className="block text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-1.5 flex items-center justify-between">
                  <span>1. Mitral Inflow (PW Doppler)</span>
                  {rhythmMode === 'af' && <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">AF Mode</span>}
                </span>
                
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Peak E Velocity (cm/s)</label>
                  <input
                    type="number"
                    data-echo-row={0}
                    data-echo-col={0}
                    value={peakE}
                    onChange={(e) => setPeakE(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                    onKeyDown={(e) => handleEchoKeyDown(e, 0, 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {rhythmMode === 'af' && (
                    <p className="text-[10px] text-amber-700 font-bold">AF Criteria 1: Positive if ≥ 100 cm/s</p>
                  )}
                </div>

                {rhythmMode === 'sinus' ? (
                  <>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Peak A Velocity (cm/s)</label>
                      <input
                        type="number"
                        data-echo-row={1}
                        data-echo-col={0}
                        value={peakA}
                        onChange={(e) => setPeakA(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                        onKeyDown={(e) => handleEchoKeyDown(e, 1, 0)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="text-[11px] bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg flex items-center justify-between font-bold text-indigo-950">
                      <span>Calculated E/A Ratio:</span>
                      <span className="font-mono text-sm text-indigo-700">{eARatio}</span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 pt-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">
                      Deceleration Time (DT ms)
                    </label>
                    <input
                      type="number"
                      data-echo-row={1}
                      data-echo-col={0}
                      placeholder="e.g. 150"
                      value={decelTime}
                      onChange={(e) => setDecelTime(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      onKeyDown={(e) => handleEchoKeyDown(e, 1, 0)}
                      className="w-full px-3 py-2 text-sm border border-amber-300 rounded-lg font-mono font-bold text-slate-900 bg-amber-50/30 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <p className="text-[10px] text-amber-700 font-bold">AF Criteria 4: Positive if DT ≤ 160 ms</p>
                  </div>
                )}
              </div>

              {/* Tissue Doppler (e') */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                <span className="block text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-1.5">
                  2. Annular e' Velocity (TDI)
                </span>
                
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Septal e' (cm/s)</label>
                  <input
                    type="number"
                    data-echo-row={0}
                    data-echo-col={1}
                    value={septalEPrime}
                    onChange={(e) => setSeptalEPrime(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                    onKeyDown={(e) => handleEchoKeyDown(e, 0, 1)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    {rhythmMode === 'af' ? 'Calculates Septal E/e\'' : 'Reduced if ≤ 6 cm/s'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Lateral e' (cm/s)</label>
                  <input
                    type="number"
                    data-echo-row={1}
                    data-echo-col={1}
                    value={lateralEPrime}
                    onChange={(e) => setLateralEPrime(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                    onKeyDown={(e) => handleEchoKeyDown(e, 1, 1)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    {rhythmMode === 'af' ? 'Optional for average E/e\'' : 'Reduced if ≤ 7 cm/s'}
                  </p>
                </div>

                <div className="text-[11px] bg-indigo-50 border border-indigo-100 p-2 rounded-lg flex items-center justify-between font-bold text-indigo-950">
                  <span>Septal E/e':</span>
                  <span className={`font-mono text-sm ${rhythmMode === 'af' && eToEPrimeSeptal > 11 ? 'text-rose-600 font-extrabold' : 'text-indigo-700'}`}>
                    {eToEPrimeSeptal}
                  </span>
                </div>
              </div>

            </div>

            {/* Section 2: Calculated Ratios & TR/PASP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                <span className="block text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-1.5">
                  Calculated E/e' Summary
                </span>
                <div className="space-y-2 text-xs">
                  <div className={`flex justify-between items-center p-2 rounded-lg border font-bold ${
                    rhythmMode === 'af' && eToEPrimeSeptal > 11 
                      ? 'bg-rose-100/70 border-rose-300 text-rose-950' 
                      : 'bg-white border-slate-200/60'
                  }`}>
                    <span className="text-slate-600">Septal E/e':</span>
                    <span className="font-mono text-sm">{eToEPrimeSeptal}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200/60 font-semibold">
                    <span className="text-slate-600">Lateral E/e':</span>
                    <span className="font-mono">{eToEPrimeLateral}</span>
                  </div>
                  {hasBothEPrime && (
                    <div className="flex justify-between items-center bg-indigo-50/80 p-2 rounded-lg border border-indigo-100 font-bold">
                      <span className="text-indigo-950">Average E/e':</span>
                      <span className="font-mono text-indigo-700">{eToEPrimeAverage}</span>
                    </div>
                  )}
                </div>
                {rhythmMode === 'af' ? (
                  <p className="text-[10px] text-amber-700 font-bold">AF Criteria 2: Positive if Septal E/e' &gt; 11</p>
                ) : (
                  <p className="text-[10px] text-slate-400">Increased if Septal ≥ 15, Lat ≥ 13, or Avg ≥ 14</p>
                )}
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                <span className="block text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-1.5">
                  Peak TR Velocity &amp; PASP
                </span>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Peak TR Velocity (cm/s)</label>
                  <input
                    type="number"
                    step="1"
                    data-echo-row={2}
                    data-echo-col={0}
                    value={trVelocity}
                    onChange={(e) => setTrVelocity(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                    onKeyDown={(e) => handleEchoKeyDown(e, 2, 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">Increased if &gt; 280 cm/s</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">PASP (mmHg)</label>
                  <input
                    type="number"
                    data-echo-row={3}
                    data-echo-col={0}
                    value={pasp}
                    onChange={(e) => setPasp(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                    onKeyDown={(e) => handleEchoKeyDown(e, 3, 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">Increased if &gt; 35 mmHg</p>
                </div>
              </div>

            </div>

            {/* Section 3: Secondary LAP Markers (Purple Box - Sinus vs AF) */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              rhythmMode === 'af' ? 'border-purple-300 bg-purple-50/60' : 'border-purple-200 bg-purple-50/40'
            }`}>
              <div className="flex items-center justify-between border-b border-purple-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    P
                  </div>
                  <h4 className="font-extrabold text-purple-950 text-xs sm:text-sm uppercase tracking-wide">
                    {rhythmMode === 'af' ? 'AF Secondary LAP Markers (Purple Box)' : 'Secondary LAP Markers (Purple Box)'}
                  </h4>
                </div>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full">
                  {rhythmMode === 'af' ? '2/3 or 3/3 = Elevated LAP' : '≥ 1 present = Increased LAP'}
                </span>
              </div>

              <p className="text-xs text-purple-900/80 leading-relaxed font-medium">
                {rhythmMode === 'af'
                  ? 'Evaluated when exactly 2 AF primary criteria are met. Evaluates LARS < 18%, Pulmonary Vein S/D < 1, and BMI > 30 kg/m².'
                  : 'Used when intermediate criteria met (Reduced e\' with E/A > 0.8, Increased TR/PASP only, Increased E/e\' only, or 2 abnormal variables).'
                }
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* LARS */}
                <div className="p-3 bg-white rounded-xl border border-purple-100 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-purple-950">
                    <span>LA Strain (LARS)</span>
                    {(rhythmMode === 'af' ? isAfLarsMet : isLarsMetSinus) && (
                      <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">Positive (&lt; 18%)</span>
                    )}
                  </div>
                  <input
                    type="number"
                    data-echo-row={4}
                    data-echo-col={0}
                    placeholder="e.g. 15"
                    value={lars}
                    onChange={(e) => setLars(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    onKeyDown={(e) => handleEchoKeyDown(e, 4, 0)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">Positive if &lt; 18%</p>
                </div>

                {/* PV S/D */}
                <div className="p-3 bg-white rounded-xl border border-purple-100 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-purple-950">
                    <span>Pulm Vein S/D</span>
                    {(rhythmMode === 'af' ? isAfPvSDMet : isPvSDMetSinus) && (
                      <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                        {rhythmMode === 'af' ? 'Positive (< 1.0)' : 'Positive (≤ 0.67)'}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    data-echo-row={4}
                    data-echo-col={1}
                    placeholder="e.g. 0.8"
                    value={pvSD}
                    onChange={(e) => setPvSD(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    onKeyDown={(e) => handleEchoKeyDown(e, 4, 1)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    {rhythmMode === 'af' ? 'Positive if < 1.0' : 'Positive if ≤ 0.67'}
                  </p>
                </div>

                {/* BMI (AF mode) or LAVI (Sinus mode) */}
                {rhythmMode === 'af' ? (
                  <div className="p-3 bg-white rounded-xl border border-purple-100 space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-purple-950">
                      <span>Body Mass Index (BMI)</span>
                      {isAfBmiMet && (
                        <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">Positive (&gt; 30)</span>
                      )}
                    </div>
                    <input
                      type="number"
                      data-echo-row={4}
                      data-echo-col={2}
                      placeholder="e.g. 32"
                      value={bmi}
                      onChange={(e) => setBmi(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      onKeyDown={(e) => handleEchoKeyDown(e, 4, 2)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400">Positive if &gt; 30 kg/m²</p>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-purple-100 space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-purple-950">
                      <span>LA Volume Index (LAVi)</span>
                      {isLaviMetSinus && (
                        <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">Positive (&gt; 34)</span>
                      )}
                    </div>
                    <input
                      type="number"
                      data-echo-row={4}
                      data-echo-col={2}
                      placeholder="e.g. 36"
                      value={lavi}
                      onChange={(e) => setLavi(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      onKeyDown={(e) => handleEchoKeyDown(e, 4, 2)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400">Positive if &gt; 34 mL/m²</p>
                  </div>
                )}

                {/* IVRT */}
                <div className="p-3 bg-white rounded-xl border border-purple-100 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-purple-950">
                    <span>IVRT (ms)</span>
                    {isIvrtMetSinus && (
                      <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">Positive (≤ 70 ms)</span>
                    )}
                  </div>
                  <input
                    type="number"
                    data-echo-row={4}
                    data-echo-col={3}
                    placeholder="e.g. 65"
                    value={ivrt}
                    onChange={(e) => setIvrt(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    onKeyDown={(e) => handleEchoKeyDown(e, 4, 3)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">Positive if ≤ 70 ms</p>
                </div>

              </div>

              {/* Direct Overrides Removed */}
            </div>

            {/* Bottom Reset Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Done with patient assessment?
              </span>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl border border-rose-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                <span>RESET</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic Results & Interactive Flowchart Visualizer */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Main Calculation Result Box */}
          {rhythmMode === 'af' ? (
            /* AF RESULT BOX */
            <div className={`p-6 sm:p-7 rounded-2xl border shadow-md space-y-5 ${
              afResult.lapStatus === 'Elevated LAP'
                ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                : afResult.lapStatus === 'Indeterminate'
                ? 'bg-yellow-50/90 border-yellow-300 text-yellow-950'
                : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                    LAP Estimation in Atrial Fibrillation
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-extrabold font-futuristic mt-1 tracking-tight">
                    {afResult.lapStatus}
                  </h4>
                  <div className="inline-flex items-center gap-2 mt-3 px-3.5 py-1.5 rounded-xl border shadow-xs">
                    {afResult.lapStatus === 'Elevated LAP' ? (
                      <span className="bg-rose-600 text-white px-3.5 py-1 rounded-lg font-black text-sm sm:text-base tracking-wide">
                        Elevated LAP
                      </span>
                    ) : afResult.lapStatus === 'Indeterminate' ? (
                      <span className="bg-yellow-500 text-slate-950 px-3.5 py-1 rounded-lg font-black text-sm sm:text-base tracking-wide">
                        Indeterminate LAP
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white px-3.5 py-1 rounded-lg font-black text-sm sm:text-base tracking-wide">
                        Normal LAP
                      </span>
                    )}
                  </div>
                </div>

                <div className={`p-4 rounded-2xl shadow-sm border shrink-0 ${
                  afResult.lapStatus === 'Elevated LAP' 
                    ? 'bg-rose-600 text-white border-rose-700' 
                    : afResult.lapStatus === 'Indeterminate'
                    ? 'bg-yellow-500 text-slate-950 border-yellow-600'
                    : 'bg-emerald-600 text-white border-emerald-700'
                }`}>
                  {afResult.lapStatus === 'Elevated LAP' ? (
                    <ShieldAlert className="w-8 h-8" />
                  ) : afResult.lapStatus === 'Indeterminate' ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8" />
                  )}
                </div>
              </div>

              <p className="text-xs leading-relaxed font-medium text-slate-800 bg-white/80 p-3 rounded-xl border border-slate-200/60">
                {afResult.description}
              </p>

              {/* Bulleted Abnormal Parameters List */}
              <div className="pt-3 border-t border-slate-200/80 space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-600" />
                  <span>Abnormal Measurements &amp; Positive Criteria</span>
                </p>
                {(() => {
                  const afBullets: { title: string; detail: string }[] = [];
                  if (isAfEvelMet) afBullets.push({ title: "Mitral E velocity ≥ 100 cm/s", detail: `Peak E = ${peakE} cm/s` });
                  if (isAfSeptalEToEPrimeMet) afBullets.push({ title: "Septal E/e' ratio > 11", detail: `Septal E/e' = ${eToEPrimeSeptal}` });
                  if (isAfTrPaspMet) {
                    const parts = [];
                    if (trVelocity > 2.8) parts.push(`Peak TR = ${trVelocity} m/s (> 2.8)`);
                    if (pasp > 35) parts.push(`PASP = ${pasp} mmHg (> 35)`);
                    afBullets.push({ title: "Elevated TR velocity / PASP", detail: parts.join(', ') });
                  }
                  if (isAfDtMet) afBullets.push({ title: "Deceleration Time ≤ 160 ms", detail: `DT = ${decelTime} ms` });
                  if (isAfLarsMet) afBullets.push({ title: "Reduced LA Strain (LARS)", detail: `LARS = ${lars}% (< 18%)` });
                  if (isAfPvSDMet) afBullets.push({ title: "Reduced Pulm Vein S/D ratio", detail: `PV S/D = ${pvSD} (< 1.0)` });
                  if (isAfBmiMet) afBullets.push({ title: "Elevated Body Mass Index (BMI)", detail: `BMI = ${bmi} kg/m² (> 30)` });

                  return afBullets.length > 0 ? (
                    <ul className="space-y-1.5">
                      {afBullets.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-slate-200 text-xs">
                          <span className="text-rose-600 font-extrabold text-sm leading-none mt-0.5">•</span>
                          <div>
                            <span className="font-extrabold text-slate-900">{item.title}: </span>
                            <span className="font-mono text-slate-700 font-bold">{item.detail}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center gap-2 bg-white/90 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
                      <span className="text-emerald-600 font-extrabold text-sm">•</span>
                      <span>No abnormal parameters detected — all evaluated AF criteria are within normal limits.</span>
                    </div>
                  );
                })()}
              </div>

              {/* AF Criteria Match Summary */}
              <div className="pt-2 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  AF Primary Criteria Status ({afPrimaryCount} of 4 Positive)
                </p>
                <div className="space-y-1.5 text-[11px]">
                  {afPrimaryCriteriaList.map((crit) => (
                    <div 
                      key={crit.id} 
                      className={`flex items-center justify-between p-2 rounded-lg border font-medium ${
                        crit.isMet 
                          ? 'bg-rose-100/60 border-rose-300 text-rose-950 font-bold' 
                          : 'bg-white border-slate-200/60 text-slate-600'
                      }`}
                    >
                      <span>{crit.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                        crit.isMet ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {crit.isMet ? 'POSITIVE' : 'NORMAL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* SINUS RHYTHM RESULT BOX */
            <div className={`p-6 sm:p-7 rounded-2xl border shadow-md space-y-5 ${
              sinusResult.grade.includes('Grade 1')
                ? 'bg-yellow-50/90 border-yellow-300 text-yellow-950'
                : sinusResult.grade.includes('Grade 2')
                ? 'bg-orange-50/90 border-orange-300 text-orange-950'
                : sinusResult.grade.includes('Grade 3')
                ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                    Estimated LAP &amp; Diastolic Grade (Sinus Rhythm)
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-extrabold font-futuristic mt-1 tracking-tight">
                    {sinusResult.grade.includes('Grade') ? 'Diastolic Dysfunction' : 'Normal Diastolic Function'}
                  </h4>
                  <div className="inline-flex items-center gap-2 mt-3 px-3.5 py-1.5 rounded-xl border shadow-xs">
                    {sinusResult.grade.includes('Grade 1') ? (
                      <span className="bg-yellow-500 text-slate-950 px-3.5 py-1 rounded-lg font-black text-sm sm:text-base tracking-wide">
                        Grade 1
                      </span>
                    ) : sinusResult.grade.includes('Grade 2') ? (
                      <span className="bg-orange-500 text-white px-3.5 py-1 rounded-lg font-black text-sm sm:text-base tracking-wide">
                        Grade 2
                      </span>
                    ) : sinusResult.grade.includes('Grade 3') ? (
                      <span className="bg-rose-600 text-white px-3.5 py-1 rounded-lg font-black text-sm sm:text-base tracking-wide">
                        Grade 3
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white px-3.5 py-1 rounded-lg font-black text-sm sm:text-base tracking-wide">
                        Normal LAP &amp; Diastolic Function
                      </span>
                    )}
                  </div>
                </div>

                <div className={`p-4 rounded-2xl shadow-sm border shrink-0 ${
                  sinusResult.grade.includes('Grade 1')
                    ? 'bg-yellow-500 text-slate-950 border-yellow-600'
                    : sinusResult.grade.includes('Grade 2')
                    ? 'bg-orange-500 text-white border-orange-600'
                    : sinusResult.grade.includes('Grade 3')
                    ? 'bg-rose-600 text-white border-rose-700'
                    : 'bg-emerald-600 text-white border-emerald-700'
                }`}>
                  {sinusResult.grade.includes('Grade 1') ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : sinusResult.grade.includes('Grade 2') || sinusResult.grade.includes('Grade 3') ? (
                    <ShieldAlert className="w-8 h-8" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8" />
                  )}
                </div>
              </div>

              <p className="text-xs leading-relaxed font-medium text-slate-800 bg-white/80 p-3 rounded-xl border border-slate-200/60">
                {sinusResult.description}
              </p>

              {/* Bulleted Abnormal Parameters List */}
              <div className="pt-3 border-t border-slate-200/80 space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-600" />
                  <span>Abnormal Measurements &amp; Positive Criteria</span>
                </p>
                {(() => {
                  const sinusBullets: { title: string; detail: string }[] = [];
                  if (isReducedEPrime) {
                    const parts = [];
                    if (septalEPrime <= 6) parts.push(`Septal e' = ${septalEPrime} cm/s (≤ 6)`);
                    if (lateralEPrime <= 7) parts.push(`Lateral e' = ${lateralEPrime} cm/s (≤ 7)`);
                    if (averageEPrime <= 6.5) parts.push(`Average e' = ${averageEPrime} cm/s (≤ 6.5)`);
                    sinusBullets.push({ title: "Reduced e' velocity", detail: parts.join(', ') });
                  }
                  if (isIncreasedEToEPrime) {
                    const parts = [];
                    if (eToEPrimeSeptal >= 15) parts.push(`Septal E/e' = ${eToEPrimeSeptal} (≥ 15)`);
                    if (eToEPrimeLateral >= 13) parts.push(`Lateral E/e' = ${eToEPrimeLateral} (≥ 13)`);
                    if (eToEPrimeAverage >= 14) parts.push(`Average E/e' = ${eToEPrimeAverage} (≥ 14)`);
                    sinusBullets.push({ title: "Increased E/e' ratio", detail: parts.join(', ') });
                  }
                  if (isIncreasedTRorPASP) {
                    const parts = [];
                    if (trVelocity >= 2.8) parts.push(`Peak TR = ${trVelocity} m/s (≥ 2.8)`);
                    if (pasp >= 35) parts.push(`PASP = ${pasp} mmHg (≥ 35)`);
                    sinusBullets.push({ title: "Increased TR velocity / PASP", detail: parts.join(', ') });
                  }
                  if (isPvSDMetSinus) sinusBullets.push({ title: "Reduced Pulm Vein S/D ratio", detail: `PV S/D = ${pvSD} (≤ 0.67)` });
                  if (isLarsMetSinus) sinusBullets.push({ title: "Reduced LA Strain (LARS)", detail: `LARS = ${lars}% (≤ 18%)` });
                  if (isLaviMetSinus) sinusBullets.push({ title: "Increased LA Volume Index (LAVi)", detail: `LAVi = ${lavi} mL/m² (> 34)` });

                  return sinusBullets.length > 0 ? (
                    <ul className="space-y-1.5">
                      {sinusBullets.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-slate-200 text-xs">
                          <span className="text-amber-600 font-extrabold text-sm leading-none mt-0.5">•</span>
                          <div>
                            <span className="font-extrabold text-slate-900">{item.title}: </span>
                            <span className="font-mono text-slate-700 font-bold">{item.detail}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center gap-2 bg-white/90 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
                      <span className="text-emerald-600 font-extrabold text-sm">•</span>
                      <span>No abnormal parameters detected — all evaluated measurements are within normal limits.</span>
                    </div>
                  );
                })()}
              </div>

              {/* Criteria Match Summary */}
              <div className="pt-2 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Primary Criteria Status ({sinusPrimaryCount} of 3 Positive)
                </p>
                <div className="space-y-1.5 text-[11px]">
                  {sinusPrimaryCriteriaList.map((crit) => (
                    <div 
                      key={crit.id} 
                      className={`flex items-center justify-between p-2 rounded-lg border font-medium ${
                        crit.isMet 
                          ? 'bg-amber-100/70 border-amber-300 text-amber-950 font-bold' 
                          : 'bg-white border-slate-200/60 text-slate-600'
                      }`}
                    >
                      <span>{crit.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                        crit.isMet ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {crit.isMet ? 'POSITIVE' : 'NORMAL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* E/A Summary badge */}
              <div className="flex items-center justify-between p-2.5 bg-white/80 rounded-xl border border-slate-200 text-xs font-bold">
                <span className="text-slate-600">Current E/A Ratio:</span>
                <span className="font-mono text-indigo-700 text-sm">{eARatio}</span>
              </div>
            </div>
          )}

          {/* Interactive Flowchart Mapping Visualizer */}
          {rhythmMode === 'af' ? (
            /* AF FLOWCHART VISUALIZER */
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold uppercase tracking-wider text-xs flex items-center gap-2 text-amber-400">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>2025 AF Flowchart Path Mapping</span>
                </h4>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Active AF Path
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* AF Node 1: None or 1 of above */}
                <div className={`p-4 rounded-xl border transition-all ${
                  afResult.activePathId === 'af_low_criteria'
                    ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.4)] font-bold text-emerald-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Branch 1: None or 1 of above positive</span>
                    {afResult.activePathId === 'af_low_criteria' && (
                      <span className="text-[10px] bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full font-black animate-pulse">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    &le; 1 primary criterion positive &rarr; Normal LAP
                  </p>
                </div>

                {/* AF Node 2: 2 of above -> AF Purple Box */}
                <div className={`p-4 rounded-xl border transition-all ${
                  afResult.requiresAfPurpleBox
                    ? 'bg-purple-950/70 border-purple-500 ring-2 ring-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.4)] font-bold text-purple-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-purple-300">Branch 2: Exactly 2 of above positive (AF Purple Box)</span>
                    {afResult.requiresAfPurpleBox && (
                      <span className="text-[10px] bg-purple-500 text-white px-2.5 py-0.5 rounded-full font-black animate-pulse">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-xs text-purple-200/80 mt-1.5">
                    Evaluates AF Purple Box (LARS &lt;18%, PV S/D &lt;1, BMI &gt;30).
                    <br />
                    <span className="font-bold">Current status:</span> {
                      afResult.lapStatus === 'Normal LAP' 
                        ? 'None (0 met) &rarr; Normal LAP'
                        : afResult.lapStatus === 'Indeterminate'
                        ? '1 met / unreliable &rarr; Indeterminate'
                        : '2/3 or 3/3 met &rarr; Elevated LAP'
                    }
                  </p>
                </div>

                {/* AF Node 3: 3 or 4 of above */}
                <div className={`p-4 rounded-xl border transition-all ${
                  afResult.activePathId === 'af_high_criteria'
                    ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-400/80 shadow-[0_0_20px_rgba(244,63,94,0.4)] font-bold text-rose-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-rose-300">Branch 3: 3 or 4 of above positive</span>
                    {afResult.activePathId === 'af_high_criteria' && (
                      <span className="text-[10px] bg-rose-600 text-white px-2.5 py-0.5 rounded-full font-black animate-pulse">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">&ge; 3 primary criteria positive &rarr; Elevated LAP</p>
                </div>
              </div>
            </div>
          ) : (
            /* SINUS FLOWCHART VISUALIZER (Collapsible / Default Closed) */
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-slate-100">
              <button
                type="button"
                onClick={() => setIsPathMappingOpen(prev => !prev)}
                className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-900 hover:bg-slate-800/80 transition-colors text-left border-b border-slate-800/60 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold uppercase tracking-wider text-xs sm:text-sm text-indigo-300 flex items-center gap-2">
                      <span>2025 Flowchart Path Mapping</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono normal-case">
                        {isPathMappingOpen ? 'Click to minimize' : 'Click to expand'}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Detailed step-by-step breakdown of current rule branch and node activations.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold px-2.5 py-1 rounded-full uppercase shrink-0 hidden sm:inline-block">
                    Live Path: {sinusResult.activePathId.replace(/_/g, ' ')}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-slate-800 text-slate-400 transition-transform duration-200 ${isPathMappingOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {isPathMappingOpen && (
                <div className="p-5 space-y-3 text-xs border-t border-slate-800/80 bg-slate-950/50">
                  {/* Node 1: All Normal */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    sinusResult.activePathId === 'all_normal'
                      ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.4)] font-bold text-emerald-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Branch 1: All Normal</span>
                      {sinusResult.activePathId === 'all_normal' && (
                        <span className="text-[10px] bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full font-black animate-pulse">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">0 primary criteria positive &rarr; Normal LAP &rarr; Normal Diastolic Function</p>
                  </div>

                  {/* Node 2: Reduced e' only */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    sinusResult.activePathId === 'reduced_e_ea_low'
                      ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.4)] font-bold text-emerald-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Branch 2: Reduced e' only (E/A ≤ 0.8)</span>
                      {sinusResult.activePathId === 'reduced_e_ea_low' && (
                        <span className="text-[10px] bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full font-black animate-pulse">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">Reduced e' + E/A ≤ 0.8 &rarr; Normal LAP &rarr; Grade 1 (Impaired Relaxation)</p>
                  </div>

                  {/* Node 3: Purple Box Evaluation */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    sinusResult.requiresPurpleBox
                      ? 'bg-purple-950/70 border-purple-500 ring-2 ring-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.4)] font-bold text-purple-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-purple-300">Branch 3: Purple Box Route</span>
                      {sinusResult.requiresPurpleBox && (
                        <span className="text-[10px] bg-purple-500 text-white px-2.5 py-0.5 rounded-full font-black animate-pulse">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-purple-200/80 mt-1.5">
                      Evaluates PV S/D ≤0.67, LARS ≤18%, LAVi &gt;34, or IVRT ≤70.
                      <br />
                      <span className="font-bold">Current status:</span> {isSinusSecondaryAtLeastOne ? '≥ 1 Present (Increased LAP)' : 'None Present (Normal LAP & Grade 1)'}
                    </p>
                  </div>

                  {/* Node 4: 3 of the above */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    sinusResult.activePathId === 'three_positive'
                      ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-400/80 shadow-[0_0_20px_rgba(244,63,94,0.4)] font-bold text-rose-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-rose-300">Branch 4: 3 of the above Positive</span>
                      {sinusResult.activePathId === 'three_positive' && (
                        <span className="text-[10px] bg-rose-600 text-white px-2.5 py-0.5 rounded-full font-black animate-pulse">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">All 3 primary criteria positive &rarr; Increased LAP &rarr; Check E/A (&lt;2 vs &ge;2)</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* ============================================================================== */}
      {/* 2025 ASE DIASTOLIC DYSFUNCTION GUIDELINE LINE FLOWCHART GRAPH                  */}
      {/* ============================================================================== */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl text-slate-100 mt-10 overflow-hidden">
        
        {/* Header Button to Toggle Minimization */}
        <button
          type="button"
          onClick={() => setIsFlowchartGraphOpen(prev => !prev)}
          className="w-full p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-950 hover:bg-slate-900/80 transition-colors text-left border-b border-slate-800/80 cursor-pointer"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interactive Guideline Decision Tree</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-rose-500 tracking-tight font-futuristic flex flex-wrap items-center gap-3">
              <span>LV Diastolic Function Grading &amp; LAP Estimation Flowchart</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-sans font-medium normal-case">
                {isFlowchartGraphOpen ? 'Click to minimize' : 'Click to expand'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Curvilinear flow chart graph following 2025 ASE Guidelines. Active paths, connectors, and nodes glow continuously based on live patient inputs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Synced</span>
              </div>
              <span className="text-xs font-bold text-slate-400 px-2">
                Mode: <strong className="text-indigo-300 uppercase">{rhythmMode === 'af' ? 'Atrial Fibrillation' : 'Sinus Rhythm'}</strong>
              </span>
            </div>
            <div className={`p-2 rounded-xl bg-slate-800 text-slate-300 transition-transform duration-200 ${isFlowchartGraphOpen ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </button>

        {isFlowchartGraphOpen && (
          <div className="p-4 sm:p-8 space-y-6 overflow-x-auto bg-slate-950 border-t border-slate-800/50">
            {/* 1000px CANVAS WITH ABSOLUTE OVERLAY & CURVILINEAR CONNECTOR LINES */}
        <div className="relative w-[1000px] h-[830px] mx-auto select-none font-sans">
          
          {/* SVG LAYER FOR SMOOTH CURVED CONNECTING LINES & GLOWS */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1000 830" fill="none">
            <defs>
              {/* Glow Filters */}
              <filter id="glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-purple" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-rose" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-orange" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Arrow Markers */}
              <marker id="arrow-emerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10B981" />
              </marker>
              <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#A855F7" />
              </marker>
              <marker id="arrow-rose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#F43F5E" />
              </marker>
              <marker id="arrow-sky" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38BDF8" />
              </marker>
            </defs>

            {/* BASE CONNECTOR PATHS (Always visible subtle slate lines) */}
            {/* Top Box Outlet to 4 Main Columns */}
            <path d="M 380 160 C 380 190, 125 190, 125 220" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 380 160 C 380 190, 375 190, 375 220" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 380 160 C 380 190, 625 190, 625 220" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 380 160 C 380 190, 875 190, 875 220" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

            {/* Col 2 ("Reduced e' only") to Sub-cards */}
            <path d="M 375 285 C 375 305, 325 305, 325 325" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 375 285 C 375 305, 425 305, 425 325" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

            {/* Sub-card "E/A > 0.8" Right Edge to Purple Box Left Edge */}
            <path d="M 470 352.5 C 490 352.5, 490 352.5, 510 352.5" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

            {/* Col 3 ("Increased TR/PASP...") to Purple Box Top */}
            <path d="M 625 285 C 625 302, 625 302, 625 320" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

            {/* PURPLE BOX LEFT OUTLET ("None") -> NORMAL LAP BOX TOP CENTER */}
            <path d="M 510 440 C 470 440, 320 440, 280 510" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

            {/* PURPLE BOX RIGHT OUTLET (">= 1 present") -> INCREASED LAP BOX TOP CENTER */}
            <path d="M 740 440 C 760 440, 760 510, 720 510" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

            {/* Col 1 ("All normal") -> Normal LAP Box Top Left */}
            <path d="M 125 285 C 125 420, 210 420, 210 510" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

            {/* Sub-card "E/A <= 0.8" -> Normal LAP Box Top Center */}
            <path d="M 325 380 C 325 445, 320 445, 320 510" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

            {/* Col 4 ("3 of the above") -> Increased LAP Box Top Right */}
            <path d="M 875 285 C 875 420, 750 420, 750 510" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

            {/* Normal LAP Box to Normal DF and Grade 1 */}
            <path d="M 280 570 C 280 595, 205 595, 205 620" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 280 570 C 280 595, 345 595, 345 620" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

            {/* Grade 1 to Diastolic Exercise Echo */}
            <path d="M 345 680 L 345 730" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

            {/* Increased LAP Box to Grade 2 and Grade 3 */}
            <path d="M 720 570 C 720 595, 645 595, 645 620" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 720 570 C 720 595, 795 595, 795 620" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />


            {/* GLOWING ACTIVE PATH OVERLAYS (Dynamically rendered based on patient values) */}
            
            {/* Active Path: Col 1 All Normal */}
            {isAllNormalActive && (
              <>
                <path d="M 380 160 C 380 190, 125 190, 125 220" stroke="#10B981" strokeWidth="3.5" filter="url(#glow-emerald)" markerEnd="url(#arrow-emerald)" strokeLinecap="round" />
                <path d="M 125 285 C 125 420, 210 420, 210 510" stroke="#10B981" strokeWidth="3.5" filter="url(#glow-emerald)" markerEnd="url(#arrow-emerald)" strokeLinecap="round" />
                <path d="M 280 570 C 280 595, 205 595, 205 620" stroke="#38BDF8" strokeWidth="3.5" filter="url(#glow-emerald)" markerEnd="url(#arrow-sky)" strokeLinecap="round" />
              </>
            )}

            {/* Active Path: Col 2 Reduced e' only */}
            {isReducedEPrimeOnlyActive && (
              <path d="M 380 160 C 380 190, 375 190, 375 220" stroke="#10B981" strokeWidth="3.5" filter="url(#glow-emerald)" markerEnd="url(#arrow-emerald)" strokeLinecap="round" />
            )}

            {/* Active Path: Col 2 -> E/A <= 0.8 */}
            {isSubEA_08_Active && (
              <>
                <path d="M 375 285 C 375 305, 325 305, 325 325" stroke="#10B981" strokeWidth="3.5" filter="url(#glow-emerald)" markerEnd="url(#arrow-emerald)" strokeLinecap="round" />
                <path d="M 325 380 C 325 445, 320 445, 320 510" stroke="#10B981" strokeWidth="3.5" filter="url(#glow-emerald)" markerEnd="url(#arrow-emerald)" strokeLinecap="round" />
                <path d="M 280 570 C 280 595, 345 595, 345 620" stroke="#10B981" strokeWidth="3.5" filter="url(#glow-emerald)" markerEnd="url(#arrow-emerald)" strokeLinecap="round" />
                <path d="M 345 680 L 345 730" stroke="#38BDF8" strokeWidth="3.5" filter="url(#glow-emerald)" markerEnd="url(#arrow-sky)" strokeLinecap="round" />
              </>
            )}

            {/* Active Path: Col 2 -> E/A > 0.8 -> Purple Box */}
            {isSubEA_GT_08_Active && (
              <>
                <path d="M 375 285 C 375 305, 425 305, 425 325" stroke="#A855F7" strokeWidth="3.5" filter="url(#glow-purple)" markerEnd="url(#arrow-purple)" strokeLinecap="round" />
                <path d="M 470 352.5 C 490 352.5, 490 352.5, 510 352.5" stroke="#A855F7" strokeWidth="3.5" filter="url(#glow-purple)" markerEnd="url(#arrow-purple)" strokeLinecap="round" />
              </>
            )}

            {/* Active Path: Middle Branch -> Purple Box Top */}
            {isMiddleBranchActive && (
              <>
                <path d="M 380 160 C 380 190, 625 190, 625 220" stroke="#A855F7" strokeWidth="3.5" filter="url(#glow-purple)" markerEnd="url(#arrow-purple)" strokeLinecap="round" />
                <path d="M 625 285 C 625 302, 625 302, 625 320" stroke="#A855F7" strokeWidth="3.5" filter="url(#glow-purple)" markerEnd="url(#arrow-purple)" strokeLinecap="round" />
              </>
            )}

            {/* Active Path: Purple Box LEFT Outlet ("None") -> Normal LAP */}
            {isPurpleBoxNoneActive && (
              <>
                <path d="M 510 440 C 470 440, 320 440, 280 510" stroke="#10B981" strokeWidth="3.5" filter="url(#glow-emerald)" markerEnd="url(#arrow-emerald)" strokeLinecap="round" />
                <path d="M 280 570 C 280 595, 345 595, 345 620" stroke="#10B981" strokeWidth="3.5" filter="url(#glow-emerald)" markerEnd="url(#arrow-emerald)" strokeLinecap="round" />
                <path d="M 345 680 L 345 730" stroke="#38BDF8" strokeWidth="3.5" filter="url(#glow-emerald)" markerEnd="url(#arrow-sky)" strokeLinecap="round" />
              </>
            )}

            {/* Active Path: Purple Box RIGHT Outlet (">= 1 present") -> Increased LAP */}
            {isPurpleBoxAtLeastOneActive && (
              <path d="M 740 440 C 760 440, 760 510, 720 510" stroke="#F43F5E" strokeWidth="3.5" filter="url(#glow-rose)" markerEnd="url(#arrow-rose)" strokeLinecap="round" />
            )}

            {/* Active Path: Col 4 3 of the above -> Increased LAP */}
            {isThreePositiveActive && (
              <>
                <path d="M 380 160 C 380 190, 875 190, 875 220" stroke="#F43F5E" strokeWidth="3.5" filter="url(#glow-rose)" markerEnd="url(#arrow-rose)" strokeLinecap="round" />
                <path d="M 875 285 C 875 420, 750 420, 750 510" stroke="#F43F5E" strokeWidth="3.5" filter="url(#glow-rose)" markerEnd="url(#arrow-rose)" strokeLinecap="round" />
              </>
            )}

            {/* Active Path: Increased LAP -> Grade 2 */}
            {isGrade2Active && (
              <path d="M 720 570 C 720 595, 645 595, 645 620" stroke="#F97316" strokeWidth="3.5" filter="url(#glow-orange)" markerEnd="url(#arrow-rose)" strokeLinecap="round" />
            )}

            {/* Active Path: Increased LAP -> Grade 3 */}
            {isGrade3Active && (
              <path d="M 720 570 C 720 595, 795 595, 795 620" stroke="#E11D48" strokeWidth="3.5" filter="url(#glow-rose)" markerEnd="url(#arrow-rose)" strokeLinecap="round" />
            )}
          </svg>

          {/* HTML CARDS OVERLAY LAYER */}
          <div className="absolute inset-0 z-10">

            {/* TOP CARD: PRIMARY CRITERIA SUMMARY BOX */}
            <div className="absolute left-[20px] top-[15px] w-[720px] h-[145px] bg-emerald-950/30 border-2 border-emerald-500/50 rounded-2xl p-3.5 space-y-1.5 shadow-xl backdrop-blur-sm">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center justify-between border-b border-emerald-500/20 pb-1">
                <span className="text-rose-400 font-futuristic text-sm">LV Diastolic Function Grading &amp; LAP Estimation</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                  {sinusPrimaryCount} / 3 Positive
                </span>
              </h4>

              <div className="space-y-1 text-xs font-medium">
                <div className={`px-2.5 py-1 rounded-lg transition-all flex items-center justify-between ${
                  isReducedEPrime ? 'bg-rose-950/80 text-rose-200 border border-rose-500/60 font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)]' : 'bg-slate-900/80 text-slate-300 border border-slate-800'
                }`}>
                  <span>1. <strong>Reduced e' velocity:</strong> septal &le; 6 or lateral &le; 7 or average &le; 6.5 cm/s</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isReducedEPrime ? 'bg-rose-600 text-white' : 'bg-emerald-950 text-emerald-300'}`}>
                    {isReducedEPrime ? 'Positive' : 'Normal'}
                  </span>
                </div>

                <div className={`px-2.5 py-1 rounded-lg transition-all flex items-center justify-between ${
                  isIncreasedEToEPrime ? 'bg-rose-950/80 text-rose-200 border border-rose-500/60 font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)]' : 'bg-slate-900/80 text-slate-300 border border-slate-800'
                }`}>
                  <span>2. <strong>Increased E/e':</strong> septal &ge; 15 or lateral &ge; 13 or average &ge; 14</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isIncreasedEToEPrime ? 'bg-rose-600 text-white' : 'bg-emerald-950 text-emerald-300'}`}>
                    {isIncreasedEToEPrime ? 'Positive' : 'Normal'}
                  </span>
                </div>

                <div className={`px-2.5 py-1 rounded-lg transition-all flex items-center justify-between ${
                  isIncreasedTRorPASP ? 'bg-rose-950/80 text-rose-200 border border-rose-500/60 font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)]' : 'bg-slate-900/80 text-slate-300 border border-slate-800'
                }`}>
                  <span>3. <strong>Increased TR velocity &ge; 2.8 m/s</strong> or <strong>PASP &ge; 35 mmHg</strong></span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isIncreasedTRorPASP ? 'bg-rose-600 text-white' : 'bg-emerald-950 text-emerald-300'}`}>
                    {isIncreasedTRorPASP ? 'Positive' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>

            {/* EXCLUSIONS / CONFOUNDERS BOX */}
            <div className="absolute left-[750px] top-[15px] w-[230px] h-[145px] bg-amber-500/10 border-2 border-amber-500/50 p-3 rounded-2xl flex flex-col justify-between text-xs space-y-1">
              <div>
                <span className="font-extrabold uppercase text-[11px] text-amber-400 block border-b border-amber-500/20 pb-0.5">
                  Except in:
                </span>
                <ul className="text-[10.5px] text-amber-200/90 font-semibold space-y-0.5 mt-1 leading-tight">
                  <li>&bull; MAC, MR, MS&para;</li>
                  <li>&bull; Atrial Fibrillation</li>
                  <li>&bull; LVAD</li>
                  <li>&bull; Non-cardiac PH</li>
                  <li>&bull; HTX</li>
                  <li>&bull; Pericardial constriction</li>
                </ul>
              </div>
              <div className="text-[8.5px] text-amber-300/70 font-mono">
                &para;Mitral Pathology / Special Scenarios
              </div>
            </div>


            {/* ROW 1: 4 MAIN BRANCH COLUMNS */}
            
            {/* Col 1: All normal */}
            <div className={`absolute left-[30px] top-[220px] w-[190px] h-[65px] rounded-2xl border p-2.5 text-center transition-all ${
              isAllNormalActive
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] font-extrabold'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-60'
            }`}>
              <h5 className="font-extrabold text-xs">All normal</h5>
              <span className="text-[10px] text-slate-400 block mt-0.5">0 criteria positive</span>
            </div>

            {/* Col 2: Reduced e' only */}
            <div className={`absolute left-[280px] top-[220px] w-[190px] h-[65px] rounded-2xl border p-2.5 text-center transition-all ${
              isReducedEPrimeOnlyActive
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] font-extrabold'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-60'
            }`}>
              <h5 className="font-extrabold text-xs">Reduced e' only</h5>
              <span className="text-[10px] text-slate-400 block mt-0.5">Isolated low e' velocity</span>
            </div>

            {/* Col 3: Increased TR/PASP or E/e' or Any 2 */}
            <div className={`absolute left-[530px] top-[220px] w-[190px] h-[65px] rounded-2xl border p-2 text-center transition-all ${
              isMiddleBranchActive
                ? 'bg-purple-950/90 border-purple-400 text-purple-100 ring-2 ring-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] font-extrabold'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-60'
            }`}>
              <h5 className="font-extrabold text-[10.5px] leading-tight">
                Increased TR/PASP only OR Increased E/e' only OR Any 2 abnormal variables
              </h5>
            </div>

            {/* Col 4: 3 of the above */}
            <div className={`absolute left-[780px] top-[220px] w-[190px] h-[65px] rounded-2xl border p-2.5 text-center transition-all ${
              isThreePositiveActive
                ? 'bg-rose-950/90 border-rose-500 text-rose-100 ring-2 ring-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)] font-extrabold'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-60'
            }`}>
              <h5 className="font-extrabold text-xs">3 of the above</h5>
              <span className="text-[10px] text-slate-400 block mt-0.5">All 3 primary criteria positive</span>
            </div>


            {/* ROW 2: SUB-BRANCHES & SECONDARY PURPLE BOX */}

            {/* Sub-card 2A: E/A <= 0.8 */}
            <div className={`absolute left-[280px] top-[325px] w-[90px] h-[55px] rounded-xl border p-1.5 text-center transition-all ${
              isSubEA_08_Active
                ? 'bg-emerald-600 border-emerald-300 text-white font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-60'
            }`}>
              <span className="text-xs font-bold block">E/A &le; 0.8</span>
              <span className="text-[9px] text-slate-200 block mt-0.5">&rarr; Normal LAP</span>
            </div>

            {/* Sub-card 2B: E/A > 0.8 */}
            <div className={`absolute left-[380px] top-[325px] w-[90px] h-[55px] rounded-xl border p-1.5 text-center transition-all ${
              isSubEA_GT_08_Active
                ? 'bg-purple-600 border-purple-300 text-white font-extrabold shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-60'
            }`}>
              <span className="text-xs font-bold block">E/A &gt; 0.8</span>
              <span className="text-[9px] text-purple-100 block mt-0.5">&rarr; Purple Box</span>
            </div>


            {/* SECONDARY DIAGNOSTIC CRITERIA PURPLE BOX */}
            <div className={`absolute left-[510px] top-[320px] w-[230px] h-[145px] rounded-2xl border-2 p-3 text-center space-y-1.5 transition-all backdrop-blur-sm ${
              isPurpleBoxActive
                ? 'bg-purple-950/90 border-purple-400 text-purple-100 shadow-[0_0_30px_rgba(168,85,247,0.5)] ring-2 ring-purple-400'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-50'
            }`}>
              <span className="text-[9.5px] font-black uppercase tracking-widest text-purple-300 block border-b border-purple-400/30 pb-0.5">
                Secondary Diagnostic Criteria Box
              </span>

              <h5 className="text-[11px] font-bold text-white leading-tight">
                Pulmonary Vein S/D &le; 0.67 OR LARS &le; 18% OR LAVi &gt; 34 mL/m²
              </h5>

              <div className="text-[10px] font-semibold text-purple-200 border-t border-purple-400/20 pt-1">
                Alternatively: IVRT &le; 70 ms
              </div>

              <div className="text-[8.5px] text-purple-300/80 font-medium leading-tight">
                If none available or reliable use Supplemental methodsᵀ
              </div>
            </div>

            {/* PURPLE BOX CONNECTOR OUTLET BADGES */}
            {/* Left Outlet Badge: "None" */}
            <div className={`absolute left-[415px] top-[460px] px-2.5 py-1 rounded-full border text-[10px] font-black tracking-wide shadow-md transition-all ${
              isPurpleBoxNoneActive
                ? 'bg-emerald-600 border-emerald-300 text-white animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              &larr; None
            </div>

            {/* Right Outlet Badge: ">= 1 present" */}
            <div className={`absolute left-[690px] top-[460px] px-2.5 py-1 rounded-full border text-[10px] font-black tracking-wide shadow-md transition-all ${
              isPurpleBoxAtLeastOneActive
                ? 'bg-rose-600 border-rose-300 text-white animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              &ge; 1 present &rarr;
            </div>


            {/* ROW 3: LAP OUTCOME BOXES */}

            {/* NORMAL LAP BOX (Green) */}
            <div className={`absolute left-[170px] top-[510px] w-[220px] h-[60px] rounded-2xl border text-center p-2.5 transition-all ${
              isNormalLAPActive
                ? 'bg-emerald-600 border-emerald-300 text-white font-extrabold shadow-[0_0_30px_rgba(16,185,129,0.7)] ring-2 ring-emerald-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-50'
            }`}>
              <h4 className="text-base font-black tracking-tight">Normal LAP</h4>
              <span className="text-[10px] opacity-90 block">Normal Left Atrial Pressure</span>
            </div>

            {/* INCREASED LAP BOX (Red) */}
            <div className={`absolute left-[610px] top-[510px] w-[220px] h-[60px] rounded-2xl border text-center p-2.5 transition-all ${
              isIncreasedLAPActive
                ? 'bg-rose-600 border-rose-300 text-white font-extrabold shadow-[0_0_30px_rgba(244,63,94,0.7)] ring-2 ring-rose-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-50'
            }`}>
              <h4 className="text-base font-black tracking-tight">Increased LAP</h4>
              <span className="text-[10px] opacity-90 block">Elevated Left Atrial Pressure</span>
            </div>


            {/* ROW 4: FINAL DIASTOLIC FUNCTION OUTPUTS */}

            {/* Normal DF Box */}
            <div className={`absolute left-[150px] top-[620px] w-[110px] h-[60px] rounded-xl border text-center p-2 transition-all ${
              isNormalDFActive
                ? 'bg-sky-600 border-sky-300 text-white font-black shadow-[0_0_20px_rgba(56,189,248,0.6)] ring-2 ring-sky-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-50'
            }`}>
              <span className="text-xs font-black block">Normal DF</span>
              <span className="text-[9px] block text-sky-100">Normal Function</span>
            </div>

            {/* Grade 1 Box */}
            <div className={`absolute left-[290px] top-[620px] w-[110px] h-[60px] rounded-xl border text-center p-2 transition-all ${
              isGrade1Active
                ? 'bg-emerald-700 border-emerald-300 text-white font-black shadow-[0_0_20px_rgba(16,185,129,0.6)] ring-2 ring-emerald-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-50'
            }`}>
              <span className="text-xs font-black block">Grade 1</span>
              <span className="text-[9px] block text-emerald-100">Impaired Rel.</span>
            </div>

            {/* Diastolic Exercise Echo Banner (under Grade 1) */}
            <div className="absolute left-[220px] top-[730px] w-[250px] h-[50px] bg-sky-950/80 border border-sky-500/50 rounded-xl p-2 text-center text-[10.5px] text-sky-200 font-semibold shadow-lg">
              <span className="text-[9px] uppercase tracking-widest text-sky-400 font-bold block">If Symptomatic</span>
              <span>Diastolic Exercise Echo</span>
            </div>

            {/* Grade 2 Box */}
            <div className={`absolute left-[590px] top-[620px] w-[110px] h-[60px] rounded-xl border text-center p-2 transition-all ${
              isGrade2Active
                ? 'bg-orange-600 border-orange-300 text-white font-black shadow-[0_0_20px_rgba(249,115,22,0.6)] ring-2 ring-orange-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-50'
            }`}>
              <span className="text-[9.5px] font-mono block opacity-90">E/A &lt; 2</span>
              <span className="text-xs font-black block">Grade 2</span>
              <span className="text-[8.5px] block text-orange-100">Mild/Mod &uarr; LAP</span>
            </div>

            {/* Grade 3 Box */}
            <div className={`absolute left-[740px] top-[620px] w-[110px] h-[60px] rounded-xl border text-center p-2 transition-all ${
              isGrade3Active
                ? 'bg-rose-700 border-rose-300 text-white font-black shadow-[0_0_22px_rgba(225,29,72,0.7)] ring-2 ring-rose-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-50'
            }`}>
              <span className="text-[9.5px] font-mono block opacity-90">E/A &ge; 2</span>
              <span className="text-xs font-black block">Grade 3</span>
              <span className="text-[8.5px] block text-rose-100">Marked &uarr; LAP</span>
            </div>

          </div>
        </div>

        {/* FINAL DIAGNOSTIC SUMMARY FOOTER BANNER */}
        <div className={`w-full p-5 rounded-2xl border text-center transition-all shadow-xl space-y-2 mt-4 min-w-[1000px] ${
          isGrade3Active
            ? 'bg-rose-950/90 border-rose-500 text-rose-100 ring-2 ring-rose-500'
            : isGrade2Active
            ? 'bg-orange-950/90 border-orange-500 text-orange-100 ring-2 ring-orange-500'
            : isGrade1Active
            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500'
            : 'bg-sky-950/90 border-sky-500 text-sky-100 ring-2 ring-sky-500'
        }`}>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block">
            Live Guideline Result
          </span>
          <h4 className="text-xl sm:text-2xl font-black font-futuristic text-white">
            {sinusResult.grade}
          </h4>
          <p className="text-xs opacity-90 max-w-xl mx-auto font-medium">
            {sinusResult.description}
          </p>
        </div>
          </div>
        )}

      </div>
    </div>
  );
};
