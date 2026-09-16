import { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { VitalRecord } from '../../types';
import { MedicineAvailabilityCard } from '../pharmacy/MedicineAvailabilityCard';
import { AttachedHealthReportsSection } from './AttachedHealthReportsSection';
import {
  FileText,
  Activity,
  Pill,
  Building,
  Heart,
  Calendar,
  X,
  Plus,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Printer,
  ShieldCheck,
  Send,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { speakText, stopSpeech } from '../../utils/speechUtils';

export function EhrDetailModal() {
  const {
    activeRole,
    currentUser,
    selectedPatientForEHR,
    setSelectedPatientForEHR,
    updateVitals,
    telehealthQueue,
    startTeleconsultation,
    setIsReferralModalOpen,
    t,
  } = useApp();

  const isPatientView = activeRole === 'patient' || currentUser.role === 'patient';
  const [activeTab, setActiveTab] = useState<'vitals' | 'prescriptions' | 'referrals'>(
    isPatientView ? 'prescriptions' : 'vitals'
  );
  const [isAddingVital, setIsAddingVital] = useState(false);
  const [activeSpeakingRxId, setActiveSpeakingRxId] = useState<string | null>(null);

  // New vitals state
  const [newSys, setNewSys] = useState<number>(140);
  const [newDia, setNewDia] = useState<number>(90);
  const [newPulse, setNewPulse] = useState<number>(80);
  const [newSpO2, setNewSpO2] = useState<number>(98);
  const [newSugar, setNewSugar] = useState<number>(180);
  const [newNotes, setNewNotes] = useState<string>('Routine point-of-care follow-up by ASHA worker.');

  if (!selectedPatientForEHR) return null;

  const patient = selectedPatientForEHR;

  const handleSaveVital = (e: FormEvent) => {
    e.preventDefault();
    updateVitals(patient.id, {
      date: new Date().toISOString().split('T')[0],
      bloodPressureSys: newSys,
      bloodPressureDia: newDia,
      pulseRate: newPulse,
      spO2: newSpO2,
      temperatureF: 98.4,
      bloodSugarMgDl: newSugar,
      notes: newNotes,
    });
    setIsAddingVital(false);
  };

  const handlePrintEhr = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white border border-white/20">
                ABHA ID: {patient.abhaId}
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              {patient.age} Yrs &bull; {patient.gender} &bull; Blood: {patient.bloodGroup} &bull; Village: {patient.village}, {patient.district}
            </p>
            <p className="text-[11px] text-emerald-200/80 mt-0.5">
              Primary Facility: {patient.registeredFacility} &bull; Assigned ASHA: {patient.assignedAshaWorker || 'Meena Devi'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintEhr}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer flex items-center gap-1"
              title="Print Official Medical Summary"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedPatientForEHR(null)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Diagnostic Flags bar */}
        <div className="px-5 py-2.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Allergies:</span>
            <span className="text-rose-700 font-bold">{patient.allergies.join(', ') || 'No known allergies'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Chronic Conditions:</span>
            <span className="text-stone-900 font-medium">{patient.chronicConditions.join(', ') || 'None'}</span>
          </div>
          {patient.highRiskCategory !== 'None' && (
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
              {patient.highRiskCategory}
            </span>
          )}
        </div>

        {/* Tab Navigation (Or Single Prescription Bar for Patient View) */}
        {isPatientView ? (
          <div className="px-5 py-3 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                <Pill className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Digital Prescriptions &amp; Rx History ({patient.prescriptions.length})
              </span>
            </div>
            <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
              Verified Public Health System Records
            </span>
          </div>
        ) : (
          <div className="flex border-b border-stone-200 bg-white px-5">
            <button
              onClick={() => setActiveTab('vitals')}
              className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'vitals'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Longitudinal Vitals ({patient.vitalsHistory.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'prescriptions'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Prescriptions &amp; Rx ({patient.prescriptions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'referrals'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Referrals &amp; Transport ({patient.referrals.length})</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: VITALS (Completely excluded for patient view) */}
          {!isPatientView && activeTab === 'vitals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Vitals Trajectory &amp; Screening History
                </h3>
                <button
                  onClick={() => setIsAddingVital(!isAddingVital)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingVital ? 'Cancel' : 'Log New Vitals'}</span>
                </button>
              </div>

              {/* Form to log new vital */}
              {isAddingVital && (
                <form onSubmit={handleSaveVital} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs">
                  <div className="font-bold text-stone-800">Record Point-of-Care Measurement</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[11px] text-stone-600">Systolic BP</label>
                      <input
                        type="number"
                        value={newSys}
                        onChange={(e) => setNewSys(parseInt(e.target.value) || 0)}
                        className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-white border border-stone-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-600">Diastolic BP</label>
                      <input
                        type="number"
                        value={newDia}
                        onChange={(e) => setNewDia(parseInt(e.target.value) || 0)}
                        className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-white border border-stone-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-600">SpO2 (%)</label>
                      <input
                        type="number"
                        value={newSpO2}
                        onChange={(e) => setNewSpO2(parseInt(e.target.value) || 0)}
                        className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-white border border-stone-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-600">Blood Sugar (mg/dL)</label>
                      <input
                        type="number"
                        value={newSugar}
                        onChange={(e) => setNewSugar(parseInt(e.target.value) || 0)}
                        className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-white border border-stone-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600">Clinical Notes</label>
                    <input
                      type="text"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-white border border-stone-300"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 cursor-pointer"
                  >
                    Save to Longitudinal Record
                  </button>
                </form>
              )}

              {/* Vitals History List */}
              <div className="space-y-3">
                {patient.vitalsHistory.map((vital, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-stone-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {vital.date}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Pulse: <strong className="text-stone-800">{vital.pulseRate} bpm</strong> &bull; Temp: {vital.temperatureF}°F
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                        <span className="text-[10px] text-stone-500 block">Blood Pressure</span>
                        <span className="font-bold text-stone-900 text-sm">
                          {vital.bloodPressureSys}/{vital.bloodPressureDia} mmHg
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                        <span className="text-[10px] text-stone-500 block">Oxygen (SpO2)</span>
                        <span className="font-bold text-emerald-700 text-sm">{vital.spO2}%</span>
                      </div>
                      {vital.bloodSugarMgDl && (
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                          <span className="text-[10px] text-stone-500 block">Blood Sugar</span>
                          <span className="font-bold text-amber-700 text-sm">{vital.bloodSugarMgDl} mg/dL</span>
                        </div>
                      )}
                      {vital.hemoglobinGdl && (
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                          <span className="text-[10px] text-rose-600 block">Hemoglobin (Hb)</span>
                          <span className="font-bold text-rose-700 text-sm">{vital.hemoglobinGdl} g/dL</span>
                        </div>
                      )}
                    </div>

                    {vital.notes && (
                      <p className="mt-2 text-[11px] text-stone-600 italic bg-stone-50/60 p-2 rounded-md">
                        &ldquo;{vital.notes}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PRESCRIPTIONS (Shown when isPatientView OR activeTab === 'prescriptions') */}
          {(isPatientView || activeTab === 'prescriptions') && (
            <div className="space-y-4">
              {patient.prescriptions.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500">No prescriptions issued yet.</div>
              ) : (
                patient.prescriptions.map((rx) => (
                  <div key={rx.id} className="p-4 rounded-xl border border-stone-200 bg-white space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-stone-100 gap-1">
                      <div>
                        <div className="font-bold text-stone-900 text-sm">{rx.diagnosis}</div>
                        <div className="text-[11px] text-stone-500">
                          Doctor: {rx.doctorName} ({rx.doctorSpecialty}) &bull; {rx.facility}
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex items-start sm:items-end gap-1.5 flex-col">
                        <span className="text-xs font-mono text-stone-600">{rx.date}</span>
                        <div className="text-[10px] text-emerald-700 font-semibold">Follow-up: {rx.followUpDate}</div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {rx.isDispensed ? 'Available at PHC' : 'Pending Dispense'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (activeSpeakingRxId === rx.id) {
                                stopSpeech();
                                setActiveSpeakingRxId(null);
                              } else {
                                const speech = `डॉक्टर ${rx.doctorName} का पर्चा। बीमारी: ${rx.diagnosis}। दवाइयां: ${rx.medicines.map((m) => `${m.name}, खुराक ${m.dosage}, ${m.frequency}, ${m.timing}`).join('। ')}। परहेज: ${rx.dietaryAdvice || 'संतुलित आहार लें'}। अगली जांच: ${rx.followUpDate || 'सलाह अनुसार'}।`;
                                speakText(
                                  speech,
                                  'hi',
                                  () => setActiveSpeakingRxId(rx.id),
                                  () => setActiveSpeakingRxId(null),
                                  () => setActiveSpeakingRxId(null)
                                );
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              activeSpeakingRxId === rx.id
                                ? 'bg-amber-600 text-white animate-pulse'
                                : 'bg-teal-100 text-teal-900 hover:bg-teal-200'
                            }`}
                            title="Listen prescription instructions aloud"
                          >
                            {activeSpeakingRxId === rx.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                            <span>{activeSpeakingRxId === rx.id ? 'रोकें' : '🔊 बोलकर सुनें'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Medicines with Real-Time Stock & Pickup Centers */}
                    <div className="space-y-2.5">
                      <div className="text-[11px] font-bold text-stone-700 uppercase">
                        Prescribed Medicines &amp; Pickup Availability
                      </div>
                      <div className="space-y-2.5">
                        {rx.medicines.map((med) => (
                          <div key={med.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div>
                                <div className="font-bold text-stone-900 text-sm">{med.name}</div>
                                <div className="text-[11px] text-stone-600 mt-0.5">
                                  Dosage: <span className="font-semibold text-blue-700">{med.dosage}</span> &bull; {med.timing} &bull; {med.frequency}
                                </div>
                              </div>
                              <div className="text-[10px] text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200 font-mono self-start sm:self-auto">
                                Duration: {med.durationDays} days &bull; {med.instructions}
                              </div>
                            </div>

                            {/* Where to get & stock status */}
                            <MedicineAvailabilityCard
                              medicineName={med.name}
                              dosage={med.dosage}
                              facility={patient.registeredFacility}
                              assignedAsha={patient.assignedAshaWorker}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {rx.advisedTests.length > 0 && (
                      <div className="text-xs text-stone-700">
                        <strong className="text-stone-900">Advised Investigations: </strong>
                        {rx.advisedTests.join(', ')}
                      </div>
                    )}

                    <div className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg">
                      <strong className="text-stone-800">Diet &amp; Precautions: </strong>
                      {rx.dietaryAdvice}
                    </div>

                    {/* Attached Diagnostic Reports Reviewed by Doctor for this Prescription */}
                    <AttachedHealthReportsSection
                      reports={rx.attachedReports}
                      prescriptionId={rx.id}
                      doctorName={rx.doctorName}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: REFERRALS (Completely excluded for patient view) */}
          {!isPatientView && activeTab === 'referrals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Inter-Facility Referrals &amp; Transport Audit
                </h3>
                <button
                  onClick={() => setIsReferralModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Initiate New Referral</span>
                </button>
              </div>

              {patient.referrals.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500">No referrals initiated for this patient.</div>
              ) : (
                patient.referrals.map((ref) => (
                  <div key={ref.id} className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-stone-900">
                          {ref.fromFacility} &rarr; {ref.toFacility}
                        </div>
                        <div className="text-[11px] text-stone-600 mt-0.5">
                          Required Specialty: <span className="font-bold text-purple-900">{ref.specialtyRequired}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-200 text-purple-900">
                        {ref.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700">{ref.reason}</p>

                    <div className="flex items-center justify-between text-[11px] text-stone-600 pt-2 border-t border-purple-100">
                      <span>Date Initiated: {ref.dateInitiated}</span>
                      <span className="font-bold text-emerald-700">
                        {ref.transportArranged ? '108 Ambulance Pre-Booked' : 'Patient Self-Transport'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
