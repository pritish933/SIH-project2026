import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FollowUpTask } from '../../types';
import {
  HeartHandshake,
  Activity,
  Video,
  UserPlus,
  WifiOff,
  RefreshCw,
  PhoneCall,
  ShieldAlert,
  ChevronRight,
  Baby,
  Heart,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  Send,
  Sparkles,
  X,
  Stethoscope,
  HeartPulse,
  Zap,
} from 'lucide-react';

export function AshaWorkerPortal() {
  const {
    currentUser,
    patients,
    telehealthQueue,
    connectivity,
    offlineQueueCount,
    followUpTasks,
    recordDoorstepVitals,
    startTeleconsultation,
    setSelectedPatientForEHR,
    setIsTriageModalOpen,
    setIsNewPatientModalOpen,
    triggerEmergencySOS,
    syncOfflineQueue,
    isCoordinationModalOpen,
    setIsCoordinationModalOpen,
    activeCoordinationSession,
    launchEmergencyCoordination,
    t,
  } = useApp();

  const [selectedVillageFilter, setSelectedVillageFilter] = useState('All');

  // Modal for Doorstep Visit Recording
  const [activeVisitTask, setActiveVisitTask] = useState<FollowUpTask | null>(null);
  const [bpSys, setBpSys] = useState<number | ''>('');
  const [bpDia, setBpDia] = useState<number | ''>('');
  const [sugar, setSugar] = useState<number | ''>('');
  const [spo2, setSpo2] = useState<number | ''>('');
  const [muac, setMuac] = useState<number | ''>('');
  const [visitNotes, setVisitNotes] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Patients assigned to this ASHA worker or village
  const villagePatients = patients.filter((p) =>
    selectedVillageFilter === 'All' ? true : p.village.toLowerCase().includes(selectedVillageFilter.toLowerCase())
  );

  // High risk follow-up tasks
  const relevantFollowUps = followUpTasks.filter((t) =>
    selectedVillageFilter === 'All'
      ? true
      : t.village.toLowerCase().includes(selectedVillageFilter.toLowerCase())
  );

  const handleOpenVisitModal = (task: FollowUpTask) => {
    setActiveVisitTask(task);
    setBpSys(task.latestVitals.bloodPressureSys || 120);
    setBpDia(task.latestVitals.bloodPressureDia || 80);
    setSugar(task.latestVitals.bloodSugarMgDl || '');
    setSpo2(task.latestVitals.spO2 || 98);
    setMuac(task.latestVitals.muacCm || '');
    setVisitNotes(task.ashaVisitNotes || 'Ghar par jaanch poori hui: Mariz ne dawai niyamit li hai.');
  };

  const handleSaveVisit = () => {
    if (!activeVisitTask) return;

    recordDoorstepVitals(
      activeVisitTask.id,
      {
        bloodPressureSys: bpSys ? Number(bpSys) : undefined,
        bloodPressureDia: bpDia ? Number(bpDia) : undefined,
        bloodSugarMgDl: sugar ? Number(sugar) : undefined,
        spO2: spo2 ? Number(spo2) : undefined,
        muacCm: muac ? Number(muac) : undefined,
      },
      visitNotes
    );

    showNotification(
      `✓ Ghar par jaanch safal! ${activeVisitTask.patientName} ka doorstep record District Doctor Dashboard par update ho gaya.`
    );
    setActiveVisitTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-700 animate-in fade-in slide-in-from-top duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-stone-400 hover:text-white ml-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ASHA Welcome Banner */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900">{currentUser.name}</h1>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800">
                ASHA Sangini / Frontline
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              {currentUser.facility} &bull; Village Sector: {currentUser.village} &bull; ID: {currentUser.registrationNumber}
            </p>
          </div>
        </div>

        {/* Rapid Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsTriageModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Digital Triage Protocol</span>
          </button>

          <button
            onClick={() => setIsNewPatientModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Patient (ABHA KYC)</span>
          </button>

          <button
            onClick={() => setIsCoordinationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Emergency Healthcare Coordination Hub"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span>{activeCoordinationSession ? '108 Active War Room' : 'Red Flag 108 Dispatch'}</span>
          </button>
        </div>
      </div>

      {/* Connectivity & Sync Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-100 p-3 rounded-xl border border-stone-200 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-stone-700">Network &amp; Sync Status:</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              connectivity === 'offline'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {connectivity === 'offline' ? 'Offline (Store & Forward Active)' : 'Online (2G/4G Connected)'}
          </span>
          {offlineQueueCount > 0 && (
            <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
              {offlineQueueCount} consultations pending sync
            </span>
          )}
        </div>

        {offlineQueueCount > 0 && (
          <button
            onClick={syncOfflineQueue}
            className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Sync Now
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Village Cohort (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Village Sector Beneficiaries</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Longitudinal health tracking for Rampur &amp; surrounding hamlets
                </p>
              </div>

              {/* Village Filter */}
              <div className="flex items-center gap-1">
                {['All', 'Pipariya', 'Rampur', 'Sihore', 'Kundam'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVillageFilter(v)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      selectedVillageFilter === v
                        ? 'bg-amber-700 text-white font-bold'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {villagePatients.map((patient) => {
                const isHighRisk =
                  patient.triageStatus === 'Red' || patient.highRiskCategory !== 'None';

                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatientForEHR(patient)}
                    className="py-3 flex items-center justify-between hover:bg-stone-50 rounded-xl px-2 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                          isHighRisk ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900">{patient.name}</span>
                          <span className="text-[10px] text-stone-500">
                            {patient.age}y, {patient.gender}
                          </span>
                          {isHighRisk && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-600 text-white">
                              High-Risk
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          ABHA: {patient.abhaId} &bull; Village: {patient.village}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          patient.triageStatus === 'Red'
                            ? 'bg-rose-100 text-rose-800'
                            : patient.triageStatus === 'Amber'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {patient.triageStatus}
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: High-Risk Follow-Up & Doorstep Visits (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Baby className="w-4 h-4 text-rose-600" />
                <span>High-Risk Follow-Up (Doorstep Jaanch)</span>
              </h3>
              <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                Strict Protocol
              </span>
            </div>

            <div className="space-y-3">
              {relevantFollowUps.map((task) => {
                const isOverdue = task.urgency === 'Critical_Overdue';
                const isDueToday = task.urgency === 'Due_Today';
                const isCompleted = task.status === 'Completed' || task.ashaDoorstepStatus === 'Completed';

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                      isOverdue
                        ? 'border-rose-300 bg-rose-50/70'
                        : isDueToday
                        ? 'border-amber-300 bg-amber-50/50'
                        : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-stone-200 bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-stone-900">{task.patientName}</span>
                        <span className="text-[10px] text-stone-500 ml-1.5">
                          ({task.patientAge}y, {task.patientGender})
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isOverdue
                            ? 'bg-rose-600 text-white'
                            : isDueToday
                            ? 'bg-amber-600 text-white'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {isOverdue
                          ? 'Overdue'
                          : isDueToday
                          ? 'Due Today'
                          : isCompleted
                          ? 'Visit Completed'
                          : 'Upcoming'}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-700">
                      <span className="font-semibold text-rose-800">{task.category}</span> &bull; {task.village}
                    </div>

                    {/* Clinical Alert reason */}
                    <p className="text-[11px] text-stone-600 bg-white/80 p-2 rounded-lg border border-stone-200/60 leading-relaxed">
                      <strong>Doctor Alert:</strong> {task.actionRequired}
                    </p>

                    {/* Priority Alert from Doctor pill */}
                    {task.ashaDoorstepStatus === 'Alert_Sent' && (
                      <div className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-1 rounded-md flex items-center gap-1.5">
                        <Send className="w-3 h-3 text-amber-700" />
                        <span>Doctor Priority Alert: {task.lastAshaAlertSentAt}</span>
                      </div>
                    )}

                    {/* Doorstep Action Buttons */}
                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          const p = patients.find((pat) => pat.id === task.patientId);
                          if (p) setSelectedPatientForEHR(p);
                        }}
                        className="text-[11px] text-stone-500 hover:text-stone-800 font-medium cursor-pointer"
                      >
                        View History
                      </button>

                      {isCompleted ? (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ghar Jaanch Done
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenVisitModal(task)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          <Activity className="w-3 h-3" />
                          <span>Ghar Par Jaanch Karein</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nutrition & IFA Tracking Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-3">
            <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-600" />
              <span>Village Nutrition &amp; Drug Distribution</span>
            </h4>
            <p className="text-xs text-stone-600">
              Track Iron Folic Acid (IFA) Red tablets, Zinc, and ORS distribution to target households in Rampur Sub-Centre.
            </p>
            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <div className="font-extrabold text-base text-emerald-800">92%</div>
                <div className="text-[10px] text-stone-600">IFA Compliance</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                <div className="font-extrabold text-base text-blue-800">100%</div>
                <div className="text-[10px] text-stone-600">Immunization Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Doorstep Visit Recording Modal for ASHA */}
      {activeVisitTask && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-amber-700 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-amber-200" />
                  <h3 className="font-bold text-base">Ghar Par Jaanch (Doorstep Vitals)</h3>
                </div>
                <p className="text-xs text-amber-100 mt-1">
                  {activeVisitTask.patientName} &bull; {activeVisitTask.village}
                </p>
              </div>
              <button
                onClick={() => setActiveVisitTask(null)}
                className="w-8 h-8 rounded-full bg-amber-800 hover:bg-amber-900 flex items-center justify-center text-amber-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                <strong>Doctor Mandate:</strong> {activeVisitTask.actionRequired}
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      BP (Systolic / Diastolic)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="120"
                        value={bpSys}
                        onChange={(e) => setBpSys(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <span className="text-stone-400">/</span>
                      <input
                        type="number"
                        placeholder="80"
                        value={bpDia}
                        onChange={(e) => setBpDia(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      SpO2 (Pulse Oximeter %)
                    </label>
                    <input
                      type="number"
                      placeholder="98"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Blood Sugar (mg/dL)
                    </label>
                    <input
                      type="number"
                      placeholder="110"
                      value={sugar}
                      onChange={(e) => setSugar(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      MUAC Tape (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="12.5"
                      value={muac}
                      onChange={(e) => setMuac(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    ASHA Home Visit Notes (दवा ले रहे हैं, कोई समस्या?)
                  </label>
                  <textarea
                    rows={3}
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="Ghar par jaanch ki: Mariz theek hain, dawai roz le rahe hain..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 p-4 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => setActiveVisitTask(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVisit}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save &amp; Sync to Doctor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
