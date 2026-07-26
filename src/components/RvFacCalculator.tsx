import React, { useState } from 'react';
import { Activity, RefreshCw, AlertTriangle, ShieldCheck, Heart, Stethoscope, CheckCircle2 } from 'lucide-react';

export const RvFacCalculator: React.FC = () => {
  // Primary RV FAC Area Inputs
  const [rveda, setRveda] = useState<number | ''>(''); // RV End-Diastolic Area (cm²)
  const [rvesa, setRvesa] = useState<number | ''>(''); // RV End-Systolic Area (cm²)

  // Optional RV Function Markers
  const [tapse, setTapse] = useState<number | ''>(''); // TAPSE (mm)
  const [rvSPrime, setRvSPrime] = useState<number | ''>(''); // RV S' Velocity (cm/s)

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
        if (currentRow === 2 && currentCol < 1) targetCol = currentCol + 1;
      }

      const maxColInTargetRow = targetRow === 2 ? 1 : 0;
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

  // Calculations
  const calcFac = (): number => {
    const numEda = typeof rveda === 'number' ? rveda : 0;
    const numEsa = typeof rvesa === 'number' ? rvesa : 0;
    if (numEda <= 0 || numEsa >= numEda) return 0;
    const facVal = ((numEda - numEsa) / numEda) * 100;
    return Math.round(facVal * 10) / 10;
  };

  const fac = calcFac();

  // RV FAC Severity Grading (ASE 2015 Guidelines: Normal FAC >= 35%)
  const getFacStatus = (): { grade: string; color: string; badgeBg: string; textClass: string; desc: string } => {
    if (rveda === '' || rvesa === '') {
      return {
        grade: 'Awaiting Parameter Input',
        color: 'border-slate-300 bg-slate-50',
        badgeBg: 'bg-slate-600 text-white',
        textClass: 'text-slate-900',
        desc: 'Enter RV End-Diastolic Area (RVEDA) and RV End-Systolic Area (RVESA) to calculate RV FAC.'
      };
    }

    if (fac >= 35) {
      return {
        grade: 'Normal RV Systolic Function',
        color: 'border-emerald-300 bg-emerald-50',
        badgeBg: 'bg-emerald-600 text-white',
        textClass: 'text-emerald-950',
        desc: 'RV Fractional Area Change is ≥ 35%, indicating preserved Right Ventricular global systolic function.'
      };
    } else if (fac >= 25 && fac < 35) {
      return {
        grade: 'Mild RV Systolic Dysfunction',
        color: 'border-amber-300 bg-amber-50',
        badgeBg: 'bg-amber-500 text-white',
        textClass: 'text-amber-950',
        desc: 'RV Fractional Area Change is between 25% and 34%, indicating mildly reduced Right Ventricular function.'
      };
    } else if (fac >= 18 && fac < 25) {
      return {
        grade: 'Moderate RV Systolic Dysfunction',
        color: 'border-orange-400 bg-orange-50',
        badgeBg: 'bg-orange-600 text-white',
        textClass: 'text-orange-950',
        desc: 'RV Fractional Area Change is between 18% and 24%, indicating moderately impaired Right Ventricular contraction.'
      };
    } else {
      return {
        grade: 'Severe RV Systolic Dysfunction',
        color: 'border-rose-400 bg-rose-50',
        badgeBg: 'bg-rose-600 text-white',
        textClass: 'text-rose-950',
        desc: 'RV Fractional Area Change is < 18%, indicating severely impaired Right Ventricular contractility.'
      };
    }
  };

  const status = getFacStatus();

  const handleReset = () => {
    setRveda('');
    setRvesa('');
    setTapse('');
    setRvSPrime('');
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>ASE Guidelines</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight font-futuristic text-white">
              RV Fractional Area Change (RV FAC) Calculator
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl leading-relaxed">
              Calculate Right Ventricular Fractional Area Change (FAC) from 2D apical 4-chamber view to evaluate RV global systolic function.
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
        
        {/* Left Input Panel (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-600" />
              <span>Apical 4-Chamber RV Area Planimetry</span>
            </h3>
          </div>

          <div className="space-y-4">
            {/* RVEDA */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800 uppercase">
                  RV End-Diastolic Area (RVEDA)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {rveda} cm²
                </span>
              </div>
              <input
                type="number"
                step="0.5"
                min="1"
                value={rveda}
                data-echo-row="0"
                data-echo-col="0"
                onKeyDown={(e) => handleKeyDown(e, 0, 0)}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onChange={(e) => setRveda(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-500">
                Traced from apical 4-chamber view at end-diastole (maximum RV size)
              </p>
            </div>

            {/* RVESA */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800 uppercase">
                  RV End-Systolic Area (RVESA)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {rvesa} cm²
                </span>
              </div>
              <input
                type="number"
                step="0.5"
                min="0"
                value={rvesa}
                data-echo-row="1"
                data-echo-col="0"
                onKeyDown={(e) => handleKeyDown(e, 1, 0)}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onChange={(e) => setRvesa(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-500">
                Traced from apical 4-chamber view at end-systole (minimum RV size)
              </p>
            </div>

            {/* Secondary RV Function Parameters */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-3">
              <span className="text-xs font-extrabold text-emerald-950 uppercase block border-b border-emerald-200 pb-1.5">
                Optional Secondary RV Function Parameters
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">TAPSE (mm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 18"
                    value={tapse}
                    data-echo-row="2"
                    data-echo-col="0"
                    onKeyDown={(e) => handleKeyDown(e, 2, 0)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    onChange={(e) => setTapse(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500">Normal: ≥ 17 mm</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">RV S' Velocity (cm/s)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 11.5"
                    value={rvSPrime}
                    data-echo-row="2"
                    data-echo-col="1"
                    onKeyDown={(e) => handleKeyDown(e, 2, 1)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    onChange={(e) => setRvSPrime(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500">Normal: ≥ 9.5 cm/s</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Output Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Main Calculation Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block border-b border-slate-800 pb-2">
              Calculated RV FAC %
            </span>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">RV FAC</p>
                <p className="text-4xl font-black font-mono text-emerald-400 mt-1">
                  {fac}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">Cutoff Limit</p>
                <p className="text-lg font-bold font-mono text-slate-300 mt-1">
                  ≥ 35% <span className="text-xs font-normal text-slate-400">Normal</span>
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 font-mono">
              Formula: ((RVEDA - RVESA) / RVEDA) × 100 = (({rveda} - {rvesa}) / {rveda}) × 100 = {fac}%
            </p>
          </div>

          {/* Classification Result Box */}
          <div className={`p-6 rounded-2xl border shadow-md space-y-4 ${status.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                RV Function Grade
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${status.badgeBg}`}>
                {status.grade}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className={`text-2xl font-black font-futuristic ${status.textClass}`}>
                {fac}% RV FAC
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {status.desc}
              </p>
            </div>

            {/* Additional Parameters Summary */}
            <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs">
              <p className="font-bold text-slate-900">Multi-Parametric RV Assessment:</p>
              <div className="grid grid-cols-2 gap-2 font-medium">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">TAPSE:</span>
                  <span className={`font-bold font-mono ${tapse !== '' && Number(tapse) < 17 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {tapse !== '' ? `${tapse} mm ${Number(tapse) < 17 ? '(Abnormal)' : '(Normal)'}` : 'Not measured'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">RV S' Velocity:</span>
                  <span className={`font-bold font-mono ${rvSPrime !== '' && Number(rvSPrime) < 9.5 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {rvSPrime !== '' ? `${rvSPrime} cm/s ${Number(rvSPrime) < 9.5 ? '(Abnormal)' : '(Normal)'}` : 'Not measured'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
