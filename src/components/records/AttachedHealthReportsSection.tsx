import { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  UserCheck,
  Printer,
  X,
  Activity,
} from 'lucide-react';
import { AttachedHealthReport } from '../../types';

interface AttachedHealthReportsSectionProps {
  reports?: AttachedHealthReport[];
  prescriptionId: string;
  doctorName: string;
}

export function AttachedHealthReportsSection({
  reports,
  prescriptionId,
  doctorName,
}: AttachedHealthReportsSectionProps) {
  const [selectedReport, setSelectedReport] = useState<AttachedHealthReport | null>(null);

  if (!reports || reports.length === 0) {
    return null;
  }

  return (
    <div className="pt-2 border-t border-stone-200">
      <div className="flex flex-wrap items-center gap-2">
        {reports.map((report) => (
          <button
            key={report.id}
            type="button"
            onClick={() => setSelectedReport(report)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-teal-200" />
            <span>View Full Diagnostic Report</span>
          </button>
        ))}
      </div>

      {/* FULL REPORT MODAL VIEW */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header / Lab Letterhead */}
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-teal-800 uppercase tracking-widest">
                    Government ABDM Digital Health Locker
                  </div>
                  <h3 className="font-bold text-base text-stone-900">{selectedReport.reportName}</h3>
                  <p className="text-xs text-stone-600">{selectedReport.facilityOrLabName}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px]">
                <div>
                  <span className="text-stone-500 block">Report Date:</span>
                  <span className="font-bold text-stone-900">{selectedReport.date}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Investigator/Lab:</span>
                  <span className="font-bold text-stone-900">
                    {selectedReport.conductorOrTechnician || 'Certified Clinical Pathologist'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">ABDM Doc ID:</span>
                  <span className="font-mono text-stone-800">
                    {selectedReport.barcodeOrAbhaDocId || 'ABDM-DOC-99120'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Verification:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Doctor Verified
                  </span>
                </div>
              </div>

              {/* Doctor Review Note Highlight */}
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-950">
                <div className="font-bold text-teal-900 flex items-center gap-1.5 mb-1 text-xs">
                  <UserCheck className="w-4 h-4 text-teal-700" />
                  <span>Attending Doctor's Evaluation ({doctorName}):</span>
                </div>
                <p className="text-stone-800 leading-relaxed">{selectedReport.doctorReviewNotes}</p>
              </div>

              {/* Test Parameters Table */}
              <div>
                <h4 className="font-bold text-stone-900 mb-2 text-xs uppercase tracking-wide">
                  Laboratory Parameter Findings &amp; Reference Ranges:
                </h4>
                <div className="rounded-xl border border-stone-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-stone-700 border-b border-stone-200">
                      <tr>
                        <th className="py-2 px-3 font-semibold">Test Parameter</th>
                        <th className="py-2 px-3 font-semibold">Measured Value</th>
                        <th className="py-2 px-3 font-semibold">Biological Reference Range</th>
                        <th className="py-2 px-3 font-semibold text-right">Clinical Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedReport.findings.map((finding, idx) => (
                        <tr
                          key={idx}
                          className={
                            finding.status === 'Critical'
                              ? 'bg-rose-50/60'
                              : finding.status === 'High'
                              ? 'bg-amber-50/40'
                              : 'bg-white'
                          }
                        >
                          <td className="py-2.5 px-3 font-medium text-stone-900">{finding.parameter}</td>
                          <td className="py-2.5 px-3 font-bold text-stone-900">
                            {finding.value} {finding.unit || ''}
                          </td>
                          <td className="py-2.5 px-3 text-stone-600 font-mono text-[11px]">
                            {finding.referenceRange || 'Standard'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                finding.status === 'Critical'
                                  ? 'bg-rose-100 text-rose-800'
                                  : finding.status === 'High'
                                  ? 'bg-amber-100 text-amber-800'
                                  : finding.status === 'Low'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {finding.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Digital Attestation Footer */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span>Digitally verified via Ayushman Bharat Digital Mission (ABDM).</span>
                  <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                    Doc Ref: {selectedReport.documentName || 'Digital_Health_Record.pdf'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-2.5 py-1 rounded bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-3 py-1 rounded bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
