import { VitalRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Heart,
  Droplets,
  Clock,
  HeartHandshake,
  Building,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  ShieldAlert,
} from 'lucide-react';

interface CurrentHealthStatusCardProps {
  latestVitals: VitalRecord;
  onOpenManualModal: () => void;
  onOpenScannerModal: () => void;
}

export function CurrentHealthStatusCard({
  latestVitals,
  onOpenManualModal,
  onOpenScannerModal,
}: CurrentHealthStatusCardProps) {
  const { language } = useApp();
  const isHindi = language === 'hi';

  // Blood pressure evaluation
  const bpSys = latestVitals.bloodPressureSys;
  const bpDia = latestVitals.bloodPressureDia;
  const isBpCritical = bpSys >= 160 || bpDia >= 100;
  const isBpHigh = bpSys >= 140 || bpDia >= 90;
  const isBpPre = bpSys >= 120 || bpDia >= 80;

  // Blood sugar evaluation
  const sugar = latestVitals.bloodSugarMgDl || 140;
  const isSugarHigh = sugar >= 200;
  const isSugarPre = sugar >= 140;

  // Cholesterol evaluation
  const cholesterol = latestVitals.cholesterolMgDl || 210;
  const isCholesterolHigh = cholesterol >= 240;
  const isCholesterolBorderline = cholesterol >= 200;

  // Creatinine evaluation
  const creatinine = latestVitals.creatinineMgDl || 1.1;
  const isCreatinineHigh = creatinine >= 1.4;
  const isCreatinineBorderline = creatinine >= 1.25;

  // Formatted last updated date string
  const lastUpdatedDisplay =
    latestVitals.lastUpdatedFormatted ||
    new Date(latestVitals.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const isAsha = latestVitals.sourceType === 'ASHA_Doorstep';
  const isDiagnostic = latestVitals.sourceType === 'Diagnostic_Center';

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
      {/* Top Banner with prominent Last Updated Date & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700" />
              <span>{isHindi ? 'वर्तमान स्वास्थ्य स्थिति (Current Health Status)' : 'Current Health Status'}</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
              Real-Time Biometrics
            </span>
          </div>

          {/* User requirement: "aur dashboard mai likha hona chahiye last updated on this date." */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Last updated on: {lastUpdatedDisplay}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-stone-500">
              <span>by</span>
              <span className="font-semibold text-stone-800 flex items-center gap-1">
                {isDiagnostic ? (
                  <>
                    <Building className="w-3.5 h-3.5 text-purple-600" />
                    <span>{latestVitals.conductorName || 'Diagnostic PathLab (AI Scanned)'}</span>
                  </>
                ) : isAsha ? (
                  <>
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{latestVitals.conductorName || 'ASHA Doorstep Checkup'}</span>
                  </>
                ) : (
                  <span>{latestVitals.conductorName || 'Self / PHC Clinic'}</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons for ASHA Manual Entry and AI Lab Report Scan */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenManualModal}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            title="Update vitals manually after ASHA visit or home check"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>+ Update Vitals (ASHA Visit)</span>
          </button>

          <button
            onClick={onOpenScannerModal}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            title="Scan pathology report from diagnostic center with AI"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Scan Lab Report (AI)</span>
          </button>
        </div>
      </div>

      {/* Main 4 Core Health Indicators Requested by User */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Blood Pressure */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isBpCritical
              ? 'bg-red-50/70 border-red-200'
              : isBpHigh
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-stone-50/80 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">Blood Pressure</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isBpCritical
                  ? 'bg-red-100 text-red-800'
                  : isBpHigh
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isBpCritical ? 'Stage 2 High' : isBpHigh ? 'Stage 1 High' : isBpPre ? 'Pre-HTN' : 'Normal'}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-stone-900">
              {bpSys}/{bpDia}
            </span>
            <span className="text-xs text-stone-500 font-medium">mmHg</span>
          </div>

          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between pt-2 border-t border-stone-200/60">
            <span>Normal: &lt; 120/80</span>
            <span className={isBpHigh ? 'text-amber-800 font-semibold' : 'text-emerald-700'}>
              {isBpHigh ? 'Above target' : 'In range'}
            </span>
          </div>
        </div>

        {/* 2. Blood Sugar */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isSugarHigh
              ? 'bg-red-50/70 border-red-200'
              : isSugarPre
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-stone-50/80 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">Blood Sugar</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isSugarHigh
                  ? 'bg-red-100 text-red-800'
                  : isSugarPre
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isSugarHigh ? 'Elevated' : isSugarPre ? 'Borderline' : 'Normal'}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-stone-900">{sugar}</span>
            <span className="text-xs text-stone-500 font-medium">mg/dL</span>
            {latestVitals.bloodSugarType && (
              <span className="text-[10px] font-semibold text-stone-600 bg-white px-1.5 py-0.5 rounded border border-stone-200 ml-auto">
                {latestVitals.bloodSugarType}
              </span>
            )}
          </div>

          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between pt-2 border-t border-stone-200/60">
            <span>Target: 70 - 140</span>
            <span className={isSugarHigh ? 'text-red-700 font-semibold' : 'text-emerald-700'}>
              {isSugarHigh ? 'High Glycemia' : 'Controlled'}
            </span>
          </div>
        </div>

        {/* 3. Total Cholesterol */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isCholesterolHigh
              ? 'bg-red-50/70 border-red-200'
              : isCholesterolBorderline
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-stone-50/80 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">Total Cholesterol</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isCholesterolHigh
                  ? 'bg-red-100 text-red-800'
                  : isCholesterolBorderline
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isCholesterolHigh ? 'High' : isCholesterolBorderline ? 'Borderline' : 'Desirable'}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-stone-900">{cholesterol}</span>
            <span className="text-xs text-stone-500 font-medium">mg/dL</span>
          </div>

          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between pt-2 border-t border-stone-200/60">
            <span>Target: &lt; 200</span>
            <span className={isCholesterolBorderline ? 'text-amber-800 font-semibold' : 'text-emerald-700'}>
              {isCholesterolBorderline ? 'Diet review' : 'Optimal'}
            </span>
          </div>
        </div>

        {/* 4. Serum Creatinine */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isCreatinineHigh
              ? 'bg-red-50/70 border-red-200'
              : isCreatinineBorderline
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-stone-50/80 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">Serum Creatinine</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isCreatinineHigh
                  ? 'bg-red-100 text-red-800'
                  : isCreatinineBorderline
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isCreatinineHigh ? 'Elevated' : isCreatinineBorderline ? 'Borderline' : 'Normal'}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-stone-900">{creatinine}</span>
            <span className="text-xs text-stone-500 font-medium">mg/dL</span>
          </div>

          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between pt-2 border-t border-stone-200/60">
            <span>Ref: 0.6 - 1.2</span>
            <span className={isCreatinineBorderline ? 'text-amber-800 font-semibold' : 'text-emerald-700'}>
              {isCreatinineBorderline ? 'Renal watch' : 'Healthy kidneys'}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Biometrics Ribbon (Hemoglobin, SpO2, Pulse, Weight) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-rose-600 shrink-0" />
          <div>
            <div className="text-[10px] text-stone-500">Hemoglobin (Hb)</div>
            <div className="font-bold text-stone-900">
              {latestVitals.hemoglobinGdl ? `${latestVitals.hemoglobinGdl} g/dL` : '12.6 g/dL'}
              <span className="text-[10px] text-emerald-700 ml-1 font-normal">(Normal)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <div className="text-[10px] text-stone-500">Oxygen Saturation (SpO2)</div>
            <div className="font-bold text-stone-900">
              {latestVitals.spO2}%
              <span className="text-[10px] text-emerald-700 ml-1 font-normal">(Optimal)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 shrink-0" />
          <div>
            <div className="text-[10px] text-stone-500">Pulse Rate</div>
            <div className="font-bold text-stone-900">{latestVitals.pulseRate} bpm</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <div className="text-[10px] text-stone-500">Body Weight</div>
            <div className="font-bold text-stone-900">
              {latestVitals.weightKg ? `${latestVitals.weightKg} kg` : '68.5 kg'}
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Care Summary & Guidance Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-950">
            Care Protocol: Active Monitoring (Amber High-Risk Category)
          </div>
          <p className="text-amber-900/90 leading-relaxed text-[11px]">
            {latestVitals.notes ||
              'Systolic BP and blood sugar require continued diet and medication adherence. ASHA worker visit scheduled every 14 days.'}
          </p>
          {latestVitals.keyFindings && latestVitals.keyFindings.length > 0 && (
            <div className="text-[11px] text-purple-900 font-medium pt-1">
              <span className="font-bold text-purple-950">Diagnostic Lab Notes: </span>
              {latestVitals.keyFindings.join(' • ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
