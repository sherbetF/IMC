import React, { useState } from 'react';
import { Activity, RefreshCw, AlertTriangle, ShieldCheck, Info, CheckCircle2, Heart, Stethoscope, ChevronRight } from 'lucide-react';

export const PulmonaryHypertensionCalculator: React.FC = () => {
  // Inputs: Peak TR Velocity in cm/s (e.g., 310 cm/s = 3.1 m/s)
  const [trVelocityCm, setTrVelocityCm] = useState<number | ''>('');

  // IVC Assessment for automated RAP calculation
  const [ivcDilated, setIvcDilated] = useState<boolean>(false); // false: ≤ 2.1 cm (Not Dilated), true: > 2.1 cm (Dilated)
  const [ivcCollapse, setIvcCollapse] = useState<boolean>(true); // true: > 50% collapse, false: < 50% collapse
  const [customRapActive, setCustomRapActive] = useState<boolean>(false);
  const [customRap, setCustomRap] = useState<number | ''>('');

  // Secondary ECHO Signs categories (ESC/ERS 2022 Guidelines)
  const [signVentricular, setSignVentricular] = useState<boolean>(true); // RV/LV basal ratio > 1.0 or LV Systolic Flattening
  const [signPa, setSignPa] = useState<boolean>(true); // RVOT AccT < 105ms or PA > 25mm
  const [signIvcRa, setSignIvcRa] = useState<boolean>(false); // IVC > 21mm or RA Area > 18cm²

  // Numeric equivalents
  const numTrVelocityCm = typeof trVelocityCm === 'number' ? trVelocityCm : 0;
  const numCustomRap = typeof customRap === 'number' ? customRap : 0;

  // TR Velocity in m/s for Bernoulli formula
  const trVelocityM = numTrVelocityCm / 100;

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentRow: number, currentCol: number) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let targetRow = currentRow;
      let targetCol = currentCol;

      if (e.key === 'ArrowUp') {
        if (currentRow > 0) targetRow = currentRow - 1;
      } else if (e.key === 'ArrowDown') {
        if (currentRow < 1) targetRow = currentRow + 1;
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

  // Auto calculate RAP based on ASE guidelines:
  // Not Dilated (≤2.1cm) + >50% collapse = 3 mmHg
  // Dilated (>2.1cm) + <50% collapse = 15 mmHg
  // Otherwise (Dilated + >50% OR Not Dilated + <50%) = 8 mmHg
  const getAutoRap = (): { value: number; label: string; detail: string } => {
    if (!ivcDilated && ivcCollapse) {
      return {
        value: 3,
        label: '3 mmHg (Normal)',
        detail: 'IVC ≤ 2.1 cm & > 50% collapse'
      };
    } else if (ivcDilated && !ivcCollapse) {
      return {
        value: 15,
        label: '15 mmHg (High)',
        detail: 'IVC > 2.1 cm & < 50% collapse'
      };
    } else {
      return {
        value: 8,
        label: '8 mmHg (Intermediate)',
        detail: ivcDilated ? 'IVC > 2.1 cm with > 50% collapse' : 'IVC ≤ 2.1 cm with < 50% collapse'
      };
    }
  };

  const autoRap = getAutoRap();
  const rap = customRapActive ? (typeof customRap === 'number' ? customRap : 0) : autoRap.value;
  const pasp = Math.round((4 * Math.pow(trVelocityM, 2) + rap) * 10) / 10;

  // Secondary Signs Count (Number of POSITIVE Categories out of 3)
  const secondaryCategoriesCount = (signVentricular ? 1 : 0) + (signPa ? 1 : 0) + (signIvcRa ? 1 : 0);

  // ESC/ERS 2022 ECHO PH Probability Logic
  const getPhProbability = (): { probability: 'Low' | 'Intermediate' | 'High' | 'Awaiting Input'; color: string; badgeBg: string; textClass: string; desc: string } => {
    if (numTrVelocityCm === 0) {
      return {
        probability: 'Awaiting Input',
        color: 'border-slate-300 bg-slate-50',
        badgeBg: 'bg-slate-600 text-white',
        textClass: 'text-slate-900',
        desc: 'Enter Peak TR Velocity (cm/s) to calculate PASP and evaluate Pulmonary Hypertension probability.'
      };
    }

    if (trVelocityM <= 2.8) {
      if (secondaryCategoriesCount >= 2) {
        return {
          probability: 'Intermediate',
          color: 'border-amber-400 bg-amber-50',
          badgeBg: 'bg-amber-500 text-white',
          textClass: 'text-amber-900',
          desc: 'Peak TRV ≤ 280 cm/s (2.8 m/s) but WITH ≥ 2 positive secondary ECHO sign categories. Intermediate probability of Pulmonary Hypertension.'
        };
      }
      return {
        probability: 'Low',
        color: 'border-emerald-300 bg-emerald-50',
        badgeBg: 'bg-emerald-600 text-white',
        textClass: 'text-emerald-950',
        desc: 'Peak TRV ≤ 280 cm/s (2.8 m/s) without sufficient secondary signs. Low echocardiographic probability of Pulmonary Hypertension.'
      };
    } else if (trVelocityM > 2.8 && trVelocityM <= 3.4) {
      if (secondaryCategoriesCount >= 2) {
        return {
          probability: 'High',
          color: 'border-rose-400 bg-rose-50',
          badgeBg: 'bg-rose-600 text-white',
          textClass: 'text-rose-950',
          desc: 'Peak TRV 281 – 340 cm/s (2.9 – 3.4 m/s) WITH ≥ 2 positive secondary ECHO sign categories. High probability of Pulmonary Hypertension.'
        };
      }
      return {
        probability: 'Intermediate',
        color: 'border-amber-400 bg-amber-50',
        badgeBg: 'bg-amber-500 text-white',
        textClass: 'text-amber-900',
        desc: 'Peak TRV 281 – 340 cm/s (2.9 – 3.4 m/s) without secondary signs. Intermediate echocardiographic probability of Pulmonary Hypertension.'
      };
    } else {
      // TRV > 3.4 m/s (340 cm/s)
      return {
        probability: 'High',
        color: 'border-rose-500 bg-rose-100/80',
        badgeBg: 'bg-rose-700 text-white',
        textClass: 'text-rose-950',
        desc: 'Peak TRV > 340 cm/s (> 3.4 m/s). High echocardiographic probability of Pulmonary Hypertension regardless of secondary signs.'
      };
    }
  };

  const result = getPhProbability();

  const handleReset = () => {
    setTrVelocityCm('');
    setIvcDilated(false);
    setIvcCollapse(true);
    setCustomRapActive(false);
    setCustomRap('');
    setSignVentricular(false);
    setSignPa(false);
    setSignIvcRa(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>ESC / ERS 2022 Guidelines</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight font-futuristic text-white">
              Pulmonary Artery Systolic Pressure
            </h2>
            <p className="text-xs sm:text-sm text-sky-200/80 max-w-2xl leading-relaxed">
              Estimate PASP (Pulmonary Artery Systolic Pressure) and evaluate Echocardiographic Probability of Pulmonary Hypertension based on Peak TR Velocity (cm/s) and IVC collapsibility.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="self-start sm:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all min-h-[40px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Calculator</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Inputs / Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-sky-600" />
              <span>Primary ECHO Hemodynamic Inputs</span>
            </h3>
          </div>

          <div className="space-y-4">
            {/* Peak TR Velocity in cm/s */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800 uppercase">
                  Peak Tricuspid Regurgitation Velocity (TRV)
                </label>
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {trVelocityCm} cm/s ({trVelocityM.toFixed(2)} m/s)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="700"
                  value={trVelocityCm}
                  data-echo-row="0"
                  data-echo-col="0"
                  onKeyDown={(e) => handleKeyDown(e, 0, 0)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setTrVelocityCm(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-xs font-bold text-slate-600 font-mono shrink-0">cm/s</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Normal: ≤ 280 cm/s | Elevated: 281–340 cm/s | High Risk: &gt; 340 cm/s
              </p>
            </div>

            {/* RAP / IVC Assessment - Dilated & Collapsibility Selectors */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <label className="text-xs font-bold text-slate-800 uppercase">
                  Right Atrial Pressure (RAP) / IVC Assessment
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                    RAP = {rap} mmHg
                  </span>
                </div>
              </div>

              {/* Selector 1: IVC Diameter */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">1. IVC Diameter:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIvcDilated(false)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      !ivcDilated
                        ? 'bg-sky-600 text-white border-sky-700 font-bold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs block font-bold">Not Dilated (≤ 2.1 cm)</span>
                    <span className="text-[10px] opacity-90 block">Normal IVC size</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIvcDilated(true)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      ivcDilated
                        ? 'bg-sky-600 text-white border-sky-700 font-bold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs block font-bold">Dilated (&gt; 2.1 cm)</span>
                    <span className="text-[10px] opacity-90 block">Enlarged IVC size</span>
                  </button>
                </div>
              </div>

              {/* Selector 2: IVC Collapsibility */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">2. IVC Collapsibility (Inspiratory):</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIvcCollapse(true)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      ivcCollapse
                        ? 'bg-sky-600 text-white border-sky-700 font-bold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs block font-bold">&gt; 50% collapse</span>
                    <span className="text-[10px] opacity-90 block">Normal inspiratory collapse</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIvcCollapse(false)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      !ivcCollapse
                        ? 'bg-sky-600 text-white border-sky-700 font-bold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs block font-bold">&lt; 50% collapse</span>
                    <span className="text-[10px] opacity-90 block">Impaired inspiratory collapse</span>
                  </button>
                </div>
              </div>

              {/* Auto Calculated Result Summary */}
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-sky-900 uppercase block">Calculated RAP Result</span>
                  <span className="font-bold text-sky-950">{autoRap.label}</span>
                  <span className="text-[11px] text-slate-600 block">{autoRap.detail}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomRapActive(!customRapActive)}
                  className="text-[10px] font-bold text-sky-700 underline hover:text-sky-900"
                >
                  {customRapActive ? 'Use Auto RAP' : 'Custom RAP'}
                </button>
              </div>

              {customRapActive && (
                <div className="pt-1">
                  <label className="text-xs font-bold text-slate-700">Custom RAP (mmHg):</label>
                  <input
                    type="number"
                    value={customRap}
                    data-echo-row="1"
                    data-echo-col="0"
                    onKeyDown={(e) => handleKeyDown(e, 1, 0)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    onChange={(e) => setCustomRap(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full mt-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              )}
            </div>

            {/* Secondary Signs Checklist */}
            <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100 space-y-3">
              <div className="flex justify-between items-center border-b border-sky-200/60 pb-2">
                <span className="text-xs font-extrabold text-sky-950 uppercase">
                  Secondary ECHO Signs of PH (Select Positive Categories)
                </span>
                <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                  {secondaryCategoriesCount} / 3 Positive
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-800">
                <label className="flex items-start gap-2.5 cursor-pointer p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={signVentricular}
                    onChange={(e) => setSignVentricular(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Category A: Ventricular Sign</span>
                    <span className="text-[11px] text-slate-500">RV / LV basal diameter ratio &gt; 1.0 OR LV Systolic Flattening (D-shaped LV)</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={signPa}
                    onChange={(e) => setSignPa(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Category B: Pulmonary Artery Sign</span>
                    <span className="text-[11px] text-slate-500">RVOT AccT &lt; 105 ms / Mid-systolic notch OR PA Diameter &gt; 25 mm</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={signIvcRa}
                    onChange={(e) => setSignIvcRa(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Category C: IVC / Right Atrium Sign</span>
                    <span className="text-[11px] text-slate-500">IVC &gt; 21 mm with decreased collapse OR Right Atrial Area &gt; 18 cm²</span>
                  </div>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Right Output Results (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* PASP Output Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-widest block border-b border-slate-800 pb-2">
              Calculated Hemodynamics
            </span>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Estimated PASP</p>
                <p className="text-3xl font-black font-mono text-white mt-1">
                  {pasp} <span className="text-sm font-normal text-slate-400">mmHg</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">TR Pressure Gradient</p>
                <p className="text-xl font-bold font-mono text-sky-300 mt-1">
                  {Math.round(4 * Math.pow(trVelocityM, 2) * 10) / 10} <span className="text-xs font-normal text-slate-400">mmHg</span>
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 font-mono leading-relaxed">
              Formula: PASP = 4 × (TRV in m/s)² + RAP<br />
              = 4 × ({trVelocityCm} cm/s / 100)² + {rap} = {pasp} mmHg
            </p>
          </div>

          {/* Guidelines Probability Outcome Card */}
          <div className={`p-6 rounded-2xl border shadow-md space-y-4 ${result.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                ECHO PH Probability
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs ${result.badgeBg}`}>
                {result.probability} Probability
              </span>
            </div>

            <div className="space-y-2">
              <h4 className={`text-2xl font-black font-futuristic ${result.textClass}`}>
                {result.probability} Probability of PH
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {result.desc}
              </p>
            </div>

            {/* Recommendations */}
            <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs">
              <p className="font-bold text-slate-900">ESC/ERS Clinical Guidance:</p>
              {result.probability === 'High' && (
                <p className="text-rose-900 font-medium bg-rose-100/80 p-2.5 rounded-xl border border-rose-200">
                  ⚠️ High probability: Right Heart Catheterization (RHC) recommended for confirmed diagnosis, especially in patients with symptoms or risk factors.
                </p>
              )}
              {result.probability === 'Intermediate' && (
                <p className="text-amber-900 font-medium bg-amber-100/80 p-2.5 rounded-xl border border-amber-200">
                  ⚠️ Intermediate probability: Consider further clinical workup, CPET, V/Q scan, or follow-up Echocardiogram based on clinical suspicion.
                </p>
              )}
              {result.probability === 'Low' && (
                <p className="text-emerald-900 font-medium bg-emerald-100/80 p-2.5 rounded-xl border border-emerald-200">
                  ✅ Low probability: Pulmonary hypertension unlikely from Echo criteria alone unless clinical risk factors persist.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

