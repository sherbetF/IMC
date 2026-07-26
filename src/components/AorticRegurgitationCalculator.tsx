import React, { useState } from 'react';
import { Activity, RefreshCw, AlertTriangle, ShieldCheck, Heart, Stethoscope, Info } from 'lucide-react';

export const AorticRegurgitationCalculator: React.FC = () => {
  // Primary AR Doppler Measurements
  const [pht, setPht] = useState<number | ''>(''); // Pressure Half Time in ms
  const [vc, setVc] = useState<number | ''>(''); // Vena Contracta width in cm
  const [eroa, setEroa] = useState<number | ''>(''); // Effective Regurgitant Orifice Area in cm²
  const [rvol, setRvol] = useState<number | ''>(''); // Regurgitant Volume in mL
  const [rf, setRf] = useState<number | ''>(''); // Regurgitant Fraction in %

  // Numeric equivalents
  const numPht = typeof pht === 'number' ? pht : 0;
  const numVc = typeof vc === 'number' ? vc : 0;
  const numEroa = typeof eroa === 'number' ? eroa : 0;
  const numRvol = typeof rvol === 'number' ? rvol : 0;
  const numRf = typeof rf === 'number' ? rf : 0;

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentRow: number, currentCol: number) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let targetRow = currentRow;
      let targetCol = currentCol;

      if (e.key === 'ArrowUp') {
        if (currentRow > 0) targetRow = currentRow - 1;
      } else if (e.key === 'ArrowDown') {
        if (currentRow < 2) targetRow = currentRow + 1;
      } else if (e.key === 'ArrowLeft') {
        if (currentCol > 0) targetCol = currentCol - 1;
      } else if (e.key === 'ArrowRight') {
        const maxColInRow = currentRow === 0 ? 0 : 1;
        if (currentCol < maxColInRow) targetCol = currentCol + 1;
      }

      const maxColInTargetRow = targetRow === 0 ? 0 : 1;
      if (targetCol > maxColInTargetRow) targetCol = maxColInTargetRow;

      const targetElement = document.querySelector<HTMLInputElement>(
        `input[data-echo-row="${targetRow}"][data-echo-col="${targetCol}"]`
      );
      if (targetElement) {
        targetElement.focus();
        targetElement.select();
      }
    }
  };

  // ASE / EACVI Guidelines AR Severity Classification based on PHT and multiparametric markers
  const getArSeverity = (): {
    grade: string;
    color: string;
    badgeBg: string;
    textClass: string;
    desc: string;
    phtCategory: string;
    guidelineAction: string;
  } => {
    if (numPht === 0 && numVc === 0 && numEroa === 0 && numRvol === 0 && numRf === 0) {
      return {
        grade: 'Awaiting Parameter Input',
        color: 'border-slate-300 bg-slate-50',
        badgeBg: 'bg-slate-600 text-white',
        textClass: 'text-slate-900',
        phtCategory: 'N/A',
        desc: 'Enter AR Pressure Half Time (PHT) or regurgitant Doppler parameters above to assess severity.',
        guidelineAction: 'Awaiting Doppler measurements.'
      };
    }

    if ((numPht > 0 && numPht < 200) || numVc >= 0.6 || numEroa >= 0.30 || numRvol >= 60 || numRf >= 50) {
      return {
        grade: 'Severe Aortic Regurgitation',
        color: 'border-rose-500 bg-rose-50',
        badgeBg: 'bg-rose-700 text-white',
        textClass: 'text-rose-950',
        phtCategory: (numPht > 0 && numPht < 200) ? 'Severe (PHT < 200 ms)' : 'PHT Non-severe',
        desc: 'Rapid pressure equalization between aorta and LV (PHT < 200 ms) or quantitative markers (VC ≥ 0.6 cm, EROA ≥ 0.30 cm², RVol ≥ 60 mL) indicate Severe AR.',
        guidelineAction: 'Refer for aortic valve intervention if symptomatic, LVEF ≤ 50%, or LVESD > 50 mm (or > 25 mm/m²).'
      };
    } else if ((numPht >= 200 && numPht <= 500) || (numVc >= 0.3 && numVc < 0.6) || (numEroa >= 0.10 && numEroa < 0.30) || (numRvol >= 30 && numRvol < 60)) {
      return {
        grade: 'Moderate Aortic Regurgitation',
        color: 'border-amber-400 bg-amber-50',
        badgeBg: 'bg-amber-500 text-white',
        textClass: 'text-amber-950',
        phtCategory: 'Moderate (PHT 200–500 ms)',
        desc: 'PHT between 200 ms and 500 ms (VC 0.3–0.59 cm, EROA 0.10–0.29 cm², RVol 30–59 mL) indicates Moderate AR.',
        guidelineAction: 'Clinical and echocardiographic follow-up every 6–12 months. Monitor LV end-systolic dimensions and LVEF.'
      };
    } else {
      return {
        grade: 'Mild Aortic Regurgitation',
        color: 'border-emerald-300 bg-emerald-50',
        badgeBg: 'bg-emerald-600 text-white',
        textClass: 'text-emerald-950',
        phtCategory: 'Mild (PHT > 500 ms)',
        desc: 'PHT > 500 ms with narrow Vena Contracta (< 0.3 cm) indicates Mild AR with slow diastolic pressure decay.',
        guidelineAction: 'Routine clinical and echocardiographic follow-up every 2–3 years.'
      };
    }
  };

  const status = getArSeverity();

  const handleReset = () => {
    setPht('');
    setVc('');
    setEroa('');
    setRvol('');
    setRf('');
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>ASE / EACVI Guidelines</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight font-futuristic text-white">
              Aortic Regurgitation Pressure half Time
            </h2>
            <p className="text-xs sm:text-sm text-rose-200/80 max-w-2xl leading-relaxed">
              Calculate AR Pressure Half-Time (PHT), Vena Contracta (VC), EROA, and evaluate Aortic Regurgitation severity and hemodynamics.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="self-start sm:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all min-h-[40px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Parameters</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-rose-600" />
              <span>CW Doppler &amp; Regurgitant Parameters</span>
            </h3>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              PHT = {pht} ms
            </span>
          </div>

          <div className="space-y-4">
            {/* Primary Input: Pressure Half Time (PHT ms) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800 uppercase">
                  Pressure Half Time (PHT ms)
                </label>
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {pht} ms
                </span>
              </div>
              <input
                type="number"
                step="10"
                min="50"
                max="1000"
                value={pht}
                data-echo-row="0"
                data-echo-col="0"
                onKeyDown={(e) => handleKeyDown(e, 0, 0)}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onChange={(e) => setPht(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-[11px] text-slate-500">
                Severe: &lt; 200 ms | Moderate: 200 – 500 ms | Mild: &gt; 500 ms (Arrow keys to navigate)
              </p>
            </div>

            {/* Vena Contracta & EROA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase">Vena Contracta Width (cm)</label>
                <input
                  type="number"
                  step="0.05"
                  value={vc}
                  data-echo-row="1"
                  data-echo-col="0"
                  onKeyDown={(e) => handleKeyDown(e, 1, 0)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setVc(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-500">Severe: ≥ 0.6 cm | Mild: &lt; 0.3 cm</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase">EROA (cm²)</label>
                <input
                  type="number"
                  step="0.05"
                  value={eroa}
                  data-echo-row="1"
                  data-echo-col="1"
                  onKeyDown={(e) => handleKeyDown(e, 1, 1)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setEroa(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-500">Severe: ≥ 0.30 cm² | Mild: &lt; 0.10 cm²</p>
              </div>
            </div>

            {/* Regurgitant Volume & Fraction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase">Regurgitant Volume (mL)</label>
                <input
                  type="number"
                  step="5"
                  value={rvol}
                  data-echo-row="2"
                  data-echo-col="0"
                  onKeyDown={(e) => handleKeyDown(e, 2, 0)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setRvol(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-500">Severe: ≥ 60 mL | Mild: &lt; 30 mL</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase">Regurgitant Fraction (%)</label>
                <input
                  type="number"
                  step="5"
                  value={rf}
                  data-echo-row="2"
                  data-echo-col="1"
                  onKeyDown={(e) => handleKeyDown(e, 2, 1)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setRf(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-500">Severe: ≥ 50% | Mild: &lt; 30%</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Outputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Pressure Half-Time Hemodynamics Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest block border-b border-slate-800 pb-2">
              Aortic Regurgitation PHT &amp; Hemodynamics
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">Pressure Half-Time (PHT)</p>
                <p className="text-3xl font-black font-mono text-white mt-1">
                  {pht} <span className="text-sm font-normal text-slate-400">ms</span>
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-medium">PHT Grade</p>
                <p className="text-lg font-bold font-mono text-rose-400 mt-1">
                  {status.phtCategory}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Vena Contracta (VC)</span>
                <span className="font-mono font-bold text-white">{vc} cm</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">EROA</span>
                <span className="font-mono font-bold text-white">{eroa} cm²</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 font-mono leading-relaxed">
              Diagnostic Principle: Shorter PHT (&lt; 200 ms) reflects rapid aortic-to-LV diastolic pressure equalization due to severe regurgitant volume.
            </p>
          </div>

          {/* Classification Box */}
          <div className={`p-6 rounded-2xl border shadow-md space-y-4 ${status.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                AR Severity Grading
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs ${status.badgeBg}`}>
                {status.grade}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className={`text-2xl font-black font-futuristic ${status.textClass}`}>
                PHT {pht} ms | VC {vc} cm
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {status.desc}
              </p>
            </div>

            {/* Guideline Action Step */}
            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-extrabold text-slate-900 uppercase block">Guideline Recommended Action:</span>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {status.guidelineAction}
              </p>
            </div>
          </div>

          {/* Guideline Cutoffs Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <h5 className="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-1.5">
              <Info className="w-4 h-4 text-rose-600" />
              <span>AR Severity Cutoffs (ASE / EACVI Guidelines)</span>
            </h5>
            <div className="space-y-2 text-[11px] text-slate-700 leading-normal">
              <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-900 block">Mild AR</span>
                <span>PHT &gt; 500 ms | VC &lt; 0.3 cm | EROA &lt; 0.10 cm² | RVol &lt; 30 mL</span>
              </div>
              <div className="p-2 rounded bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-900 block">Moderate AR</span>
                <span>PHT 200 – 500 ms | VC 0.3 – 0.59 cm | EROA 0.10 – 0.29 cm² | RVol 30 – 59 mL</span>
              </div>
              <div className="p-2 rounded bg-rose-50 border border-rose-200">
                <span className="font-bold text-rose-900 block">Severe AR</span>
                <span>PHT &lt; 200 ms | VC ≥ 0.6 cm | EROA ≥ 0.30 cm² | RVol ≥ 60 mL</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
