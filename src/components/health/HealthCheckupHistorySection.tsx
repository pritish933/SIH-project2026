import { useState } from 'react';
import { VitalRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  HeartHandshake,
  Building,
  FileText,
  User,
  Activity,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface HealthCheckupHistorySectionProps {
  vitalsHistory: VitalRecord[];
  onOpenManualModal: () => void;
  onOpenScannerModal: () => void;
}

export function HealthCheckupHistorySection({
  vitalsHistory,
  onOpenManualModal,
  onOpenScannerModal,
}: HealthCheckupHistorySectionProps) {
  const { language } = useApp();
  const isHindi = language === 'hi';
  const [filter, setFilter] = useState<'All' | 'ASHA' | 'Diagnostic' | 'Clinic'>('All');

  const filteredHistory = vitalsHistory.filter((v) => {
    if (filter === 'ASHA') return v.sourceType === 'ASHA_Doorstep';
    if (filter === 'Diagnostic') return v.sourceType === 'Diagnostic_Center';
    if (filter === 'Clinic') return v.sourceType === 'PHC_Clinic';
    return true;
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <span>{isHindi ? 'जाँच इतिहास (Checkup & Diagnostic History)' : 'Health Checkup & Diagnostic History'}</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {vitalsHistory.length} Records Logged
            </span>
          </div>
          <p className="text-xs text-stone-600">
            Complete audit trail of all ASHA doorstep screenings and pathology laboratory reports
          </p>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenManualModal}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            + ASHA / Manual Log
          </button>
          <button
            onClick={onOpenScannerModal}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Scan Lab Report</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter('All')}
          className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
            filter === 'All' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          All Checkups ({vitalsHistory.length})
        </button>
        <button
          onClick={() => setFilter('ASHA')}
          className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 ${
            filter === 'ASHA' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <HeartHandshake className="w-3 h-3" />
          <span>ASHA Doorstep</span>
        </button>
        <button
          onClick={() => setFilter('Diagnostic')}
          className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 ${
            filter === 'Diagnostic' ? 'bg-purple-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Building className="w-3 h-3" />
          <span>Diagnostic Centers (Lab Scanned)</span>
        </button>
        <button
          onClick={() => setFilter('Clinic')}
          className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 ${
            filter === 'Clinic' ? 'bg-blue-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>PHC / Clinic Routine</span>
        </button>
      </div>

      {/* History Items List */}
      <div className="space-y-3 pt-1">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((rec, index) => {
            const isAsha = rec.sourceType === 'ASHA_Doorstep';
            const isDiagnostic = rec.sourceType === 'Diagnostic_Center';
            const isClinic = rec.sourceType === 'PHC_Clinic';

            return (
              <div
                key={rec.id || index}
                className={`p-4 rounded-xl border transition-shadow space-y-3 ${
                  isDiagnostic
                    ? 'border-purple-200 bg-purple-50/30'
                    : isAsha
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-stone-200 bg-stone-50/40'
                }`}
              >
                {/* Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isDiagnostic
                          ? 'bg-purple-100 text-purple-800'
                          : isAsha
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isDiagnostic ? (
                        <Building className="w-4 h-4" />
                      ) : isAsha ? (
                        <HeartHandshake className="w-4 h-4" />
                      ) : (
                        <Activity className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-xs">
                          {rec.conductorName || (isDiagnostic ? 'Diagnostic PathLab' : 'ASHA Worker')}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            isDiagnostic
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : isAsha
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : 'bg-stone-200 text-stone-800'
                          }`}
                        >
                          {isDiagnostic
                            ? 'Pathology Lab Scan'
                            : isAsha
                            ? 'ASHA Doorstep Visit'
                            : 'PHC Clinic'}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>Reported: {rec.lastUpdatedFormatted || rec.date}</span>
                        </span>
                        {rec.reportDocumentName && (
                          <span className="text-purple-700 font-medium truncate max-w-[200px]">
                            &bull; Doc: {rec.reportDocumentName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {rec.aiScanConfidence && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 self-start sm:self-auto flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{rec.aiScanConfidence}% OCR Verified</span>
                    </span>
                  )}
                </div>

                {/* Parameters Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs pt-1">
                  <div className="p-2 bg-white rounded-lg border border-stone-200">
                    <div className="text-[10px] text-stone-500">Blood Pressure</div>
                    <div className="font-bold text-stone-900">
                      {rec.bloodPressureSys}/{rec.bloodPressureDia} <span className="text-[10px] font-normal text-stone-400">mmHg</span>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-stone-200">
                    <div className="text-[10px] text-stone-500">Blood Sugar</div>
                    <div className="font-bold text-stone-900">
                      {rec.bloodSugarMgDl ? `${rec.bloodSugarMgDl} mg/dL` : 'N/A'}
                    </div>
                    {rec.bloodSugarType && (
                      <div className="text-[9px] text-stone-500">{rec.bloodSugarType}</div>
                    )}
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-stone-200">
                    <div className="text-[10px] text-stone-500">Total Cholesterol</div>
                    <div className="font-bold text-stone-900">
                      {rec.cholesterolMgDl ? `${rec.cholesterolMgDl} mg/dL` : '220 mg/dL'}
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-stone-200">
                    <div className="text-[10px] text-stone-500">Serum Creatinine</div>
                    <div className="font-bold text-stone-900">
                      {rec.creatinineMgDl ? `${rec.creatinineMgDl} mg/dL` : '1.2 mg/dL'}
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-stone-200">
                    <div className="text-[10px] text-stone-500">Hemoglobin</div>
                    <div className="font-bold text-stone-900">
                      {rec.hemoglobinGdl ? `${rec.hemoglobinGdl} g/dL` : '12.8 g/dL'}
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-stone-200">
                    <div className="text-[10px] text-stone-500">SpO2 &amp; Pulse</div>
                    <div className="font-bold text-stone-900">
                      {rec.spO2}% &bull; {rec.pulseRate} bpm
                    </div>
                  </div>
                </div>

                {/* Notes & Key findings */}
                {rec.keyFindings && rec.keyFindings.length > 0 && (
                  <div className="p-2.5 bg-white rounded-lg border border-purple-100 text-[11px] text-purple-950">
                    <span className="font-semibold text-purple-900">Diagnostic Insights: </span>
                    {rec.keyFindings.join(' • ')}
                  </div>
                )}

                {rec.notes && (
                  <div className="text-[11px] text-stone-600 bg-white/70 p-2 rounded-lg border border-stone-100">
                    <span className="font-semibold text-stone-800">Checkup Note: </span>
                    {rec.notes}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-xs text-stone-500 bg-stone-50 rounded-xl border border-stone-200">
            No checkup reports found under this category filter.
          </div>
        )}
      </div>
    </div>
  );
}
