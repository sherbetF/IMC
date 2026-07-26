import React, { useState } from 'react';
import { Activity, RefreshCw, AlertTriangle, ShieldCheck, Heart, Stethoscope, ChevronRight, Info, HelpCircle, FileText } from 'lucide-react';

export const AorticStenosisCalculator: React.FC = () => {
  // Primary Measurements
  const [lvotDiam, setLvotDiam] = useState<number | ''>(''); // LVOT Diameter in cm
  const [lvotVti, setLvotVti] = useState<number | ''>(''); // LVOT VTI in cm
  const [avVti, setAvVti] = useState<number | ''>(''); // Aortic Valve VTI in cm
  const [avPeakVel, setAvPeakVel] = useState<number | ''>(''); // AV Peak Velocity in m/s
  const [avMeanGrad, setAvMeanGrad] = useState<number | ''>(''); // AV Mean Gradient in mmHg
  const [lvef, setLvef] = useState<number | ''>(''); // LVEF in %
  const [bsa, setBsa] = useState<number | ''>(''); // Body Surface Area in m²

  // Numeric values for calculations
  const numLvotDiam = typeof lvotDiam === 'number' ? lvotDiam : 0;
  const numLvotVti = typeof lvotVti === 'number' ? lvotVti : 0;
  const numAvVti = typeof avVti === 'number' ? avVti : 0;
  const numAvPeakVel = typeof avPeakVel === 'number' ? avPeakVel : 0;
  const numAvMeanGrad = typeof avMeanGrad === 'number' ? avMeanGrad : 0;
  const numLvef = typeof lvef === 'number' ? lvef : 0;
  const numBsa = typeof bsa === 'number' ? bsa : 0;

  // Continuity Equation & Hemodynamics
  const lvotArea = numLvotDiam > 0 ? Math.round(0.7854 * Math.pow(numLvotDiam, 2) * 100) / 100 : 0;
  const strokeVolume = numLvotDiam > 0 && numLvotVti > 0 ? Math.round(lvotArea * numLvotVti * 10) / 10 : 0; // mL
  const svi = numBsa > 0 ? Math.round((strokeVolume / numBsa) * 10) / 10 : 0; // mL/m²
  const isLowFlow = svi > 0 && svi <= 35; // Stroke Volume Index ≤ 35 mL/m² defines Low Flow

  const ava = numAvVti > 0 ? Math.round(((lvotArea * numLvotVti) / numAvVti) * 100) / 100 : 0;
  const dvi = numAvVti > 0 ? Math.round((numLvotVti / numAvVti) * 100) / 100 : 0;

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
        const maxColInRow = currentRow === 1 ? 2 : 1;
        if (currentCol < maxColInRow) targetCol = currentCol + 1;
      }

      const maxColInTargetRow = targetRow === 1 ? 2 : 1;
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

  // ASE/EACVI/ACC/AHA Guidelines Severity Classification
  const getAsSeverity = (): {
    grade: string;
    color: string;
    badgeBg: string;
    textClass: string;
    desc: string;
    lowGradientType?: 'classical' | 'paradoxical' | 'normal_flow';
    guidelineAction: string;
  } => {
    // If all input boxes are empty or cleared
    if (numAvPeakVel === 0 && numAvMeanGrad === 0 && numLvotDiam === 0 && numLvotVti === 0 && numAvVti === 0) {
      return {
        grade: 'Awaiting Parameter Input',
        color: 'border-slate-300 bg-slate-50',
        badgeBg: 'bg-slate-600 text-white',
        textClass: 'text-slate-900',
        desc: 'Enter patient echo measurements above to view AS severity classification and guideline recommendations.',
        guidelineAction: 'Awaiting Doppler and LVOT measurements.'
      };
    }

    // High-Gradient Severe AS
    if (numAvMeanGrad >= 40 || numAvPeakVel >= 4.0) {
      if (ava <= 1.0) {
        return {
          grade: 'High-Gradient Severe Aortic Stenosis',
          color: 'border-rose-500 bg-rose-50',
          badgeBg: 'bg-rose-700 text-white',
          textClass: 'text-rose-950',
          desc: 'High-gradient severe AS with AVA ≤ 1.0 cm² and Mean Gradient ≥ 40 mmHg (or Peak Velocity ≥ 4.0 m/s). Clear indication for AVR/TAVI evaluation.',
          guidelineAction: 'High-Gradient Severe AS confirmed. Refer for Valve Intervention (TAVI / SAVR) if symptomatic or LVEF < 50%.'
        };
      } else {
        return {
          grade: 'High-Gradient Discordant AS (High Velocity, AVA > 1.0)',
          color: 'border-amber-500 bg-amber-50',
          badgeBg: 'bg-amber-600 text-white',
          textClass: 'text-amber-950',
          desc: 'High velocity/gradient with calculated AVA > 1.0 cm². Re-check LVOT measurement accuracy or subaortic/supra-valvular gradient.',
          guidelineAction: 'Re-measure LVOT diameter in PLAX. Check for high-cardiac-output state (anemia, hyperthyroidism, AR).'
        };
      }
    } 
    
    // Low-Gradient Severe AS Spectrum (AVA ≤ 1.0 cm² and Mean Gradient < 40 mmHg)
    if (ava > 0 && ava <= 1.0 && numAvMeanGrad < 40) {
      if (numLvef < 50) {
        // Classical Low-Flow, Low-Gradient Severe AS
        return {
          grade: 'Classical Low-Flow Low-Gradient Severe AS (Low LVEF)',
          color: 'border-purple-500 bg-purple-50',
          badgeBg: 'bg-purple-700 text-white',
          textClass: 'text-purple-950',
          desc: 'Reduced EF (< 50%) with AVA ≤ 1.0 cm² and Mean Gradient < 40 mmHg. Ventricular dysfunction causes low flow across a narrow valve.',
          lowGradientType: 'classical',
          guidelineAction: 'Dobutamine Stress Echocardiogram (DSE) recommended to differentiate True Severe AS from Pseudo-Severe AS.'
        };
      } else {
        // LVEF ≥ 50%
        if (isLowFlow) {
          // Paradoxical Low-Flow, Low-Gradient Severe AS
          return {
            grade: 'Paradoxical Low-Flow Low-Gradient Severe AS (Preserved EF)',
            color: 'border-indigo-500 bg-indigo-50',
            badgeBg: 'bg-indigo-700 text-white',
            textClass: 'text-indigo-950',
            desc: 'Preserved LVEF (≥ 50%) but Low Flow (SVI ≤ 35 mL/m²) with AVA ≤ 1.0 cm² and Mean Gradient < 40 mmHg. Typical in elderly patients with small thick LV cavity.',
            lowGradientType: 'paradoxical',
            guidelineAction: 'Assess CT Aortic Valve Calcium Score (Agatston score ≥ 2000 men / ≥ 1200 women) to confirm true severe calcification.'
          };
        } else {
          // Normal-Flow, Low-Gradient AS
          return {
            grade: 'Normal-Flow Low-Gradient AS (Preserved EF & Normal SVI)',
            color: 'border-sky-500 bg-sky-50',
            badgeBg: 'bg-sky-700 text-white',
            textClass: 'text-sky-950',
            desc: 'Preserved LVEF (≥ 50%) and Normal Flow (SVI > 35 mL/m²) with AVA ≤ 1.0 cm² and Mean Gradient < 40 mmHg. Usually represents moderate AS or LVOT trace overestimation.',
            lowGradientType: 'normal_flow',
            guidelineAction: 'Re-evaluate LVOT measurement accuracy. Most cases represent Moderate AS or discordant measurements.'
          };
        }
      }
    }

    // Moderate AS
    if ((numAvPeakVel >= 3.0 && numAvPeakVel < 4.0) || (numAvMeanGrad >= 20 && numAvMeanGrad < 40) || (ava > 1.0 && ava <= 1.5)) {
      return {
        grade: 'Moderate Aortic Stenosis',
        color: 'border-amber-400 bg-amber-50',
        badgeBg: 'bg-amber-500 text-white',
        textClass: 'text-amber-950',
        desc: 'AVA 1.0 – 1.5 cm², Peak Velocity 3.0 – 3.9 m/s, or Mean Gradient 20 – 39 mmHg. Regular clinical & Echo follow-up recommended.',
        guidelineAction: 'Echocardiogram every 1–2 years. Monitor for clinical symptoms or progression.'
      };
    } 
    
    // Mild AS
    if ((numAvPeakVel >= 2.5 && numAvPeakVel < 3.0) || (numAvMeanGrad > 0 && numAvMeanGrad < 20) || (ava > 1.5)) {
      return {
        grade: 'Mild Aortic Stenosis',
        color: 'border-blue-300 bg-blue-50',
        badgeBg: 'bg-blue-600 text-white',
        textClass: 'text-blue-950',
        desc: 'AVA > 1.5 cm², Peak Velocity 2.5 – 2.9 m/s, and Mean Gradient < 20 mmHg. Mild valve restriction.',
        guidelineAction: 'Echocardiogram every 3–5 years.'
      };
    } 
    
    // Normal / Sclerosis
    return {
      grade: 'Aortic Sclerosis / Normal',
      color: 'border-emerald-300 bg-emerald-50',
      badgeBg: 'bg-emerald-600 text-white',
      textClass: 'text-emerald-950',
      desc: 'Peak Velocity < 2.5 m/s without significant aortic gradient.',
      guidelineAction: 'No specific AS interventions required.'
    };
  };

  const status = getAsSeverity();
  const isLowGradientAs = status.lowGradientType !== undefined;

  const handleReset = () => {
    setLvotDiam('');
    setLvotVti('');
    setAvVti('');
    setAvPeakVel('');
    setAvMeanGrad('');
    setLvef('');
    setBsa('');
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>ASE / EACVI / ACC / AHA Guidelines</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight font-futuristic text-white">
              Aortic Stenosis (AS) Severity Suite
            </h2>
            <p className="text-xs sm:text-sm text-rose-200/80 max-w-2xl leading-relaxed">
              Calculate Continuity Equation AVA, DVI, Stroke Volume Index (SVI), and evaluate Low-Gradient Aortic Stenosis subtypes (Classical &amp; Paradoxical LFLG) according to guidelines.
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
              <span>LVOT &amp; Aortic Doppler Measurements</span>
            </h3>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              SVI = {svi} mL/m² ({isLowFlow ? 'Low Flow' : 'Normal Flow'})
            </span>
          </div>

          <div className="space-y-4">
            {/* LVOT Diameter & VTI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase">LVOT Diameter (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={lvotDiam}
                  data-echo-row="0"
                  data-echo-col="0"
                  onKeyDown={(e) => handleKeyDown(e, 0, 0)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setLvotDiam(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-500">Calculated Area: {lvotArea} cm²</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase">LVOT VTI (cm)</label>
                <input
                  type="number"
                  step="1"
                  value={lvotVti}
                  data-echo-row="0"
                  data-echo-col="1"
                  onKeyDown={(e) => handleKeyDown(e, 0, 1)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setLvotVti(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-500">PW Doppler in LVOT | SV = {strokeVolume} mL</p>
              </div>
            </div>

            {/* AV VTI & Velocities */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase">AV VTI (cm)</label>
                <input
                  type="number"
                  step="1"
                  value={avVti}
                  data-echo-row="1"
                  data-echo-col="0"
                  onKeyDown={(e) => handleKeyDown(e, 1, 0)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setAvVti(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-500">CW Doppler across AV</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase">AV Peak Vel (m/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={avPeakVel}
                  data-echo-row="1"
                  data-echo-col="1"
                  onKeyDown={(e) => handleKeyDown(e, 1, 1)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setAvPeakVel(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-500">Severe if ≥ 4.0 m/s</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase">Mean Grad (mmHg)</label>
                <input
                  type="number"
                  step="1"
                  value={avMeanGrad}
                  data-echo-row="1"
                  data-echo-col="2"
                  onKeyDown={(e) => handleKeyDown(e, 1, 2)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setAvMeanGrad(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-500">Severe if ≥ 40 mmHg</p>
              </div>
            </div>

            {/* LVEF & BSA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-rose-50/50 rounded-xl border border-rose-100">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 uppercase">LVEF (%)</label>
                  <span className="text-[10px] font-mono font-bold text-rose-700 bg-white px-1.5 py-0.5 rounded border border-rose-200">
                    {numLvef < 50 ? 'Reduced (<50%)' : 'Preserved (≥50%)'}
                  </span>
                </div>
                <input
                  type="number"
                  value={lvef}
                  data-echo-row="2"
                  data-echo-col="0"
                  onKeyDown={(e) => handleKeyDown(e, 2, 0)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setLvef(e.target.value === '' ? '' : Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-500">Differentiates Classical vs Paradoxical LFLG AS</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 uppercase">BSA (m²)</label>
                <input
                  type="number"
                  step="0.05"
                  value={bsa}
                  data-echo-row="2"
                  data-echo-col="1"
                  onKeyDown={(e) => handleKeyDown(e, 2, 1)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setBsa(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-500">SVI = Stroke Vol ({strokeVolume} mL) / BSA ({bsa} m²)</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Outputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Calculated Area & DVI Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest block border-b border-slate-800 pb-2">
              Continuity Derived Hemodynamics
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">Aortic Valve Area (AVA)</p>
                <p className="text-3xl font-black font-mono text-white mt-1">
                  {ava} <span className="text-sm font-normal text-slate-400">cm²</span>
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-medium">DVI Index (LVOT / AV)</p>
                <p className="text-3xl font-black font-mono text-rose-400 mt-1">
                  {dvi}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Stroke Volume Index (SVI)</span>
                <span className={`font-mono font-bold ${isLowFlow ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {svi} mL/m² ({isLowFlow ? 'Low Flow' : 'Normal Flow'})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Stroke Volume (SV)</span>
                <span className="font-mono font-bold text-white">{strokeVolume} mL</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 font-mono leading-relaxed">
              Formula: AVA = (LVOT Area × LVOT VTI) / AV VTI<br />
              = ({lvotArea} × {lvotVti}) / {avVti} = {ava} cm²
            </p>
          </div>

          {/* Classification Box */}
          <div className={`p-6 rounded-2xl border shadow-md space-y-4 ${status.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                AS Severity Grading
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs ${status.badgeBg}`}>
                {status.grade}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className={`text-2xl font-black font-futuristic ${status.textClass}`}>
                AVA {ava} cm² | {avMeanGrad} mmHg
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {status.desc}
              </p>
            </div>

            {/* Low-Gradient Severe AS Criteria Met Callout in Result Box */}
            {isLowGradientAs && (
              <div className="p-3 bg-rose-900 text-white rounded-xl border border-rose-700 space-y-1 shadow-xs">
                <span className="text-xs font-bold text-rose-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
                  Low-Gradient Severe AS Criteria Met (AVA ≤ 1.0 cm² &amp; Mean Grad &lt; 40 mmHg)
                </span>
                <p className="text-[11px] text-rose-100 leading-relaxed font-medium">
                  Discordance between area (≤ 1.0 cm²) and gradient (&lt; 40 mmHg).
                </p>
              </div>
            )}

            {/* Guideline Action Step */}
            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-extrabold text-slate-900 uppercase block">Guideline Recommended Action:</span>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {status.guidelineAction}
              </p>
            </div>

            {/* DVI Assessment */}
            <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Dimensionless Velocity Index (DVI):</span>
                <span className={`font-mono font-bold ${dvi < 0.25 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {dvi} {dvi < 0.25 ? '(Severe < 0.25)' : '(Non-severe)'}
                </span>
              </div>
            </div>
          </div>

          {/* Low Gradient Quick Reference Guide Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <h5 className="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Low-Gradient AS Diagnostic Spectrum (ACC/AHA/EACVI)</span>
            </h5>
            <div className="space-y-2 text-[11px] text-slate-700 leading-normal">
              <div className="p-2 rounded bg-purple-50 border border-purple-200">
                <span className="font-bold text-purple-900 block">Classical LFLG AS (LVEF &lt; 50%)</span>
                <span>Low EF creates low flow (SVI ≤ 35). Perform Dobutamine Stress Echo (DSE) to confirm True Severe vs Pseudo-severe.</span>
              </div>
              <div className="p-2 rounded bg-indigo-50 border border-indigo-200">
                <span className="font-bold text-indigo-900 block">Paradoxical LFLG AS (LVEF ≥ 50%, SVI ≤ 35 mL/m²)</span>
                <span>Preserved EF but small thick LV cavity causes low flow. Perform Non-contrast CT Calcium Score (Agatston ≥ 2000 ♂ / ≥ 1200 ♀).</span>
              </div>
              <div className="p-2 rounded bg-sky-50 border border-sky-200">
                <span className="font-bold text-sky-900 block">Normal-Flow Low-Gradient AS (LVEF ≥ 50%, SVI &gt; 35 mL/m²)</span>
                <span>Preserved EF and normal flow. Re-check LVOT tracing accuracy; typically represents Moderate AS.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};


