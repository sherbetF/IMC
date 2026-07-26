import React, { useState } from 'react';
import { Activity, RefreshCw, AlertTriangle, ShieldCheck, Heart, Stethoscope } from 'lucide-react';

export const MitralStenosisCalculator: React.FC = () => {
  // Doppler Inputs
  const [pht, setPht] = useState<number | ''>(''); // Pressure Half Time in ms
  const [meanGrad, setMeanGrad] = useState<number | ''>(''); // Mitral Mean Gradient in mmHg
  const [heartRate, setHeartRate] = useState<number | ''>(''); // Heart Rate in bpm
  const [planimetryMva, setPlanimetryMva] = useState<number | ''>(''); // Planimetry MVA in cm²

  // Optional Continuity Equation Inputs
  const [lvotDiam, setLvotDiam] = useState<number | ''>('');
  const [lvotVti, setLvotVti] = useState<number | ''>('');
  const [mvVti, setMvVti] = useState<number | ''>('');

  // Numeric values
  const numPht = typeof pht === 'number' ? pht : 0;
  const numMeanGrad = typeof meanGrad === 'number' ? meanGrad : 0;
  const numHeartRate = typeof heartRate === 'number' ? heartRate : 0;
  const numLvotDiam = typeof lvotDiam === 'number' ? lvotDiam : 0;
  const numLvotVti = typeof lvotVti === 'number' ? lvotVti : 0;
  const numMvVti = typeof mvVti === 'number' ? mvVti : 0;

  // Calculations
  const mvaPht = numPht > 0 ? Math.round((220 / numPht) * 100) / 100 : 0;
  const lvotArea = numLvotDiam > 0 ? Math.round(0.7854 * Math.pow(numLvotDiam, 2) * 100) / 100 : 0;
  const mvaCont = numMvVti > 0 ? Math.round(((lvotArea * numLvotVti) / numMvVti) * 100) / 100 : 0;

  // Primary MVA value for grading (prefer PHT or Planimetry if available)
  const primaryMva = mvaPht;

  // Arrow key navigation handler
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
        const maxColInRow = currentRow === 0 ? 2 : (currentRow === 1 ? 0 : 2);
        if (currentCol < maxColInRow) targetCol = currentCol + 1;
      }

      const maxColInTargetRow = targetRow === 0 ? 2 : (targetRow === 1 ? 0 : 2);
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

  // ASE/EACVI Mitral Stenosis Severity Classification
  const getMsSeverity = (): { grade: string; color: string; badgeBg: string; textClass: string; desc: string } => {
    if (numPht === 0 && numMeanGrad === 0 && planimetryMva === '' && numMvVti === 0) {
      return {
        grade: 'Awaiting Parameter Input',
        color: 'border-slate-300 bg-slate-50',
        badgeBg: 'bg-slate-600 text-white',
        textClass: 'text-slate-900',
        desc: 'Enter Mitral Doppler parameters (PHT / Mean Gradient) or Planimetry MVA above to grade MS severity.'
      };
    }

    if ((primaryMva > 0 && primaryMva <= 1.0) || numPht >= 220 || numMeanGrad > 10) {
      return {
        grade: 'Severe Mitral Stenosis',
        color: 'border-rose-500 bg-rose-50',
        badgeBg: 'bg-rose-700 text-white',
        textClass: 'text-rose-950',
        desc: 'Mitral Valve Area ≤ 1.0 cm², PHT ≥ 220 ms, or Mean Gradient > 10 mmHg indicates Severe Mitral Stenosis. Evaluate for PMBC / intervention.'
      };
    } else if ((primaryMva > 1.0 && primaryMva <= 1.5) || (numPht >= 130 && numPht < 220) || (numMeanGrad >= 5 && numMeanGrad <= 10)) {
      return {
        grade: 'Moderate Mitral Stenosis',
        color: 'border-amber-400 bg-amber-50',
        badgeBg: 'bg-amber-500 text-white',
        textClass: 'text-amber-950',
        desc: 'Mitral Valve Area 1.0 – 1.5 cm², PHT 130 – 220 ms, or Mean Gradient 5 – 10 mmHg indicates Moderate Mitral Stenosis.'
      };
    } else {
      return {
        grade: 'Mild Mitral Stenosis',
        color: 'border-emerald-300 bg-emerald-50',
        badgeBg: 'bg-emerald-600 text-white',
        textClass: 'text-emerald-950',
        desc: 'Mitral Valve Area > 1.5 cm², PHT < 130 ms, and Mean Gradient < 5 mmHg indicates Mild Mitral Stenosis.'
      };
    }
  };

  const status = getMsSeverity();

  const handleReset = () => {
    setPht('');
    setMeanGrad('');
    setHeartRate('');
    setPlanimetryMva('');
    setLvotDiam('');
    setLvotVti('');
    setMvVti('');
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>ASE / EACVI Guidelines</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight font-futuristic text-white">
              Mitral Stenosis (MS) Severity Suite
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl leading-relaxed">
              Calculate Mitral Valve Area (MVA) from Pressure Half-Time (PHT = 220/PHT) and Continuity Equation, and evaluate hemodynamics and valve morphology.
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
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              <span>Mitral Doppler &amp; Pressure Hemodynamics</span>
            </h3>
          </div>

          <div className="space-y-4">
            {/* PHT & Mean Gradient */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase">Pressure Half Time (PHT ms)</label>
                <input
                  type="number"
                  value={pht}
                  data-echo-row="0"
                  data-echo-col="0"
                  onKeyDown={(e) => handleKeyDown(e, 0, 0)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setPht(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[10px] text-slate-500">Severe if ≥ 220 ms</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase">Mean Gradient (mmHg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={meanGrad}
                  data-echo-row="0"
                  data-echo-col="1"
                  onKeyDown={(e) => handleKeyDown(e, 0, 1)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setMeanGrad(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[10px] text-slate-500">Severe if &gt; 10 mmHg</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={heartRate}
                  data-echo-row="0"
                  data-echo-col="2"
                  onKeyDown={(e) => handleKeyDown(e, 0, 2)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setHeartRate(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[10px] text-slate-500">Gradients depend on HR</p>
              </div>
            </div>

            {/* Direct Planimetry MVA */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <label className="block text-xs font-bold text-slate-800 uppercase">Optional 2D/3D Direct Planimetry MVA (cm²)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 1.3"
                value={planimetryMva}
                data-echo-row="1"
                data-echo-col="0"
                onKeyDown={(e) => handleKeyDown(e, 1, 0)}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onChange={(e) => setPlanimetryMva(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white"
              />
              <p className="text-[10px] text-slate-500">Gold standard direct SAX trace at leaflet tips</p>
            </div>

            {/* Continuity Method Inputs */}
            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
              <span className="text-xs font-extrabold text-purple-950 uppercase block border-b border-purple-200 pb-1">
                Optional Continuity Equation MVA = (LVOT Area × LVOT VTI) / MV VTI
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">LVOT Diam (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={lvotDiam}
                    data-echo-row="2"
                    data-echo-col="0"
                    onKeyDown={(e) => handleKeyDown(e, 2, 0)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    onChange={(e) => setLvotDiam(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">LVOT VTI (cm)</label>
                  <input
                    type="number"
                    value={lvotVti}
                    data-echo-row="2"
                    data-echo-col="1"
                    onKeyDown={(e) => handleKeyDown(e, 2, 1)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    onChange={(e) => setLvotVti(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">MV VTI (cm)</label>
                  <input
                    type="number"
                    value={mvVti}
                    data-echo-row="2"
                    data-echo-col="2"
                    onKeyDown={(e) => handleKeyDown(e, 2, 2)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    onChange={(e) => setMvVti(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Outputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Main Calculation Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest block border-b border-slate-800 pb-2">
              Calculated Mitral Valve Area (MVA)
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">MVA (PHT Method)</p>
                <p className="text-3xl font-black font-mono text-purple-400 mt-1">
                  {mvaPht} <span className="text-xs font-normal text-slate-400">cm²</span>
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-medium">MVA (Continuity)</p>
                <p className="text-3xl font-black font-mono text-white mt-1">
                  {mvaCont} <span className="text-xs font-normal text-slate-400">cm²</span>
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 font-mono">
              PHT Formula: MVA = 220 / PHT = 220 / {pht} = {mvaPht} cm²
            </p>
          </div>

          {/* Classification Box */}
          <div className={`p-6 rounded-2xl border shadow-md space-y-4 ${status.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                MS Severity Grading
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${status.badgeBg}`}>
                {status.grade}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className={`text-2xl font-black font-futuristic ${status.textClass}`}>
                MVA {primaryMva} cm²
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {status.desc}
              </p>
            </div>

            {/* Additional Info */}
            <div className="pt-3 border-t border-slate-200/80 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-bold">Mean Gradient:</span>
                <span className="font-mono font-bold text-slate-900">{meanGrad} mmHg (at HR {heartRate} bpm)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-bold">Planimetry MVA:</span>
                <span className="font-mono font-bold text-slate-900">{planimetryMva !== '' ? `${planimetryMva} cm²` : 'Not provided'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
