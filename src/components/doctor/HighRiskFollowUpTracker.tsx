import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FollowUpTask, FollowUpCategory, FollowUpUrgency, PatientEHR, TelehealthSession } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PhoneCall,
  Video,
  FileText,
  Send,
  Calendar,
  Activity,
  UserCheck,
  Search,
  Filter,
  HeartPulse,
  Baby,
  Stethoscope,
  ChevronRight,
  Sparkles,
  MapPin,
  X,
} from 'lucide-react';

interface HighRiskFollowUpTrackerProps {
  onStartTeleconsultation: (session: TelehealthSession) => void;
  onSelectPatientForEHR: (patient: PatientEHR) => void;
}

export function HighRiskFollowUpTracker({
  onStartTeleconsultation,
  onSelectPatientForEHR,
}: HighRiskFollowUpTrackerProps) {
  const {
    followUpTasks,
    patients,
    triggerAshaAlert,
    recordDoorstepVitals,
    resolveFollowUpTask,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'All' | FollowUpUrgency>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolution modal state
  const [resolvingTask, setResolvingTask] = useState<FollowUpTask | null>(null);
  const [recordBpSys, setRecordBpSys] = useState<number | ''>('');
  const [recordBpDia, setRecordBpDia] = useState<number | ''>('');
  const [recordSugar, setRecordSugar] = useState<number | ''>('');
  const [recordSpo2, setRecordSpo2] = useState<number | ''>('');
  const [recordHb, setRecordHb] = useState<number | ''>('');
  const [recordMuac, setRecordMuac] = useState<number | ''>('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Metrics
  const overdueCount = followUpTasks.filter((t) => t.urgency === 'Critical_Overdue').length;
  const dueTodayCount = followUpTasks.filter((t) => t.urgency === 'Due_Today').length;
  const upcomingCount = followUpTasks.filter((t) => t.urgency === 'Upcoming_Week').length;
  const resolvedCount = followUpTasks.filter((t) => t.urgency === 'Resolved' || t.status === 'Completed').length;
  const pendingAshaVisitsCount = followUpTasks.filter((t) => t.ashaDoorstepStatus === 'Pending').length;

  // Filtered tasks
  const filteredTasks = followUpTasks.filter((task) => {
    // Tab filter
    if (activeTab !== 'All') {
      if (activeTab === 'Resolved') {
        if (task.urgency !== 'Resolved' && task.status !== 'Completed') return false;
      } else if (task.urgency !== activeTab) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'All' && task.category !== selectedCategory) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        task.patientName.toLowerCase().includes(q) ||
        task.abhaId.toLowerCase().includes(q) ||
        task.village.toLowerCase().includes(q) ||
        task.assignedAshaWorker.toLowerCase().includes(q) ||
        task.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const handleAlertAsha = (task: FollowUpTask) => {
    triggerAshaAlert(task.id);
    showToast(
      `📲 WhatsApp & SMS Priority Alert sent to ${task.assignedAshaWorker} for ${task.patientName} (${task.subCentre})!`
    );
  };

  const handleOpenResolveModal = (task: FollowUpTask) => {
    setResolvingTask(task);
    setRecordBpSys(task.latestVitals.bloodPressureSys || 120);
    setRecordBpDia(task.latestVitals.bloodPressureDia || 80);
    setRecordSugar(task.latestVitals.bloodSugarMgDl || '');
    setRecordSpo2(task.latestVitals.spO2 || 98);
    setRecordHb(task.latestVitals.hemoglobinGdl || '');
    setRecordMuac(task.latestVitals.muacCm || '');
    setResolutionNotes(
      task.ashaVisitNotes || `Doorstep review completed. Patient condition re-evaluated.`
    );
  };

  const handleSaveResolution = () => {
    if (!resolvingTask) return;

    recordDoorstepVitals(
      resolvingTask.id,
      {
        bloodPressureSys: recordBpSys ? Number(recordBpSys) : undefined,
        bloodPressureDia: recordBpDia ? Number(recordBpDia) : undefined,
        bloodSugarMgDl: recordSugar ? Number(recordSugar) : undefined,
        spO2: recordSpo2 ? Number(recordSpo2) : undefined,
        hemoglobinGdl: recordHb ? Number(recordHb) : undefined,
        muacCm: recordMuac ? Number(recordMuac) : undefined,
      },
      resolutionNotes
    );

    showToast(
      `✅ Doorstep vitals recorded and follow-up marked RESOLVED for ${resolvingTask.patientName}!`
    );
    setResolvingTask(null);
  };

  const handleStartFollowUpCall = (task: FollowUpTask) => {
    const existingPatient = patients.find((p) => p.id === task.patientId);
    const session: TelehealthSession = {
      id: `TC-FU-${Date.now().toString().slice(-4)}`,
      patientId: task.patientId,
      patientName: task.patientName,
      patientAge: task.patientAge,
      patientGender: task.patientGender,
      abhaId: task.abhaId,
      doctorId: 'DOC-1029',
      doctorName: 'Dr. Sneha Sharma',
      doctorSpecialty: 'Internal Medicine / Tele-Hub',
      scheduledTime: 'Immediate High-Risk Follow-Up',
      status: 'Waiting',
      complaint: `High-Risk Follow-Up: ${task.triggerReason}`,
      priority: task.urgency === 'Critical_Overdue' ? 'High' : 'Medium',
      ashaAssisted: true,
      ashaName: task.assignedAshaWorker,
      subCentre: task.subCentre,
      connectionQuality: 'Good',
    };

    onStartTeleconsultation(session);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-700 animate-in fade-in slide-in-from-top duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">Critical Overdue</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700 flex items-center gap-2">
            <span>{overdueCount}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 animate-pulse">
              Action Required
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Missed follow-up &gt; 24 hrs</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Due Today</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">{dueTodayCount}</div>
          <p className="text-[11px] text-stone-500 mt-1">Mandatory contact / doorstep</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800">Doorstep ASHA Pending</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-700">{pendingAshaVisitsCount}</div>
          <p className="text-[11px] text-stone-500 mt-1">Awaiting home verification</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Monitored &amp; Resolved</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">{resolvedCount}</div>
          <p className="text-[11px] text-stone-500 mt-1">Condition stabilized &amp; logged</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'All'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Cohort ({followUpTasks.length})
            </button>

            <button
              onClick={() => setActiveTab('Critical_Overdue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'Critical_Overdue'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Overdue ({overdueCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('Due_Today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'Due_Today'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Due Today ({dueTodayCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('Upcoming_Week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'Upcoming_Week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Upcoming ({upcomingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('Resolved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'Resolved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolved ({resolvedCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient, ABHA, village, ASHA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-stone-50"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
          <span className="text-stone-400 font-semibold flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3" /> Filter Category:
          </span>
          {[
            'All',
            'High-Risk Pregnancy (ANC)',
            'Severe Acute Malnutrition (SAM)',
            'Hypertensive Crisis / Uncontrolled BP',
            'Severe Diabetes / Hyperglycemia',
            'Elderly High-Risk / COPD',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat === 'All' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* High-Risk Follow-Up Cards List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-stone-800">No High-Risk Follow-Ups Found</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Selected filter ya search criteria ke according koi follow-up task pending nahi hai.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = task.urgency === 'Critical_Overdue';
            const isDueToday = task.urgency === 'Due_Today';
            const isResolved = task.urgency === 'Resolved' || task.status === 'Completed';

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border shadow-xs transition-all hover:shadow-md ${
                  isOverdue
                    ? 'border-rose-300 ring-1 ring-rose-200/50'
                    : isDueToday
                    ? 'border-amber-300'
                    : isResolved
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-stone-200'
                }`}
              >
                <div className="p-5 space-y-4">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-700'
                            : isDueToday
                            ? 'bg-amber-100 text-amber-700'
                            : isResolved
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {task.category.includes('Pregnancy') ? (
                          <HeartPulse className="w-5 h-5" />
                        ) : task.category.includes('Malnutrition') ? (
                          <Baby className="w-5 h-5" />
                        ) : (
                          <ShieldAlert className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-stone-900">{task.patientName}</h3>
                          <span className="text-[11px] text-stone-500">
                            ({task.patientAge}y, {task.patientGender})
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                            ABHA: {task.abhaId}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {task.village} &bull; {task.subCentre}
                          </span>
                          <span>&bull;</span>
                          <span className="font-medium text-stone-700">
                            ASHA: <strong>{task.assignedAshaWorker}</strong> ({task.ashaPhone})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Urgency Badge */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {isOverdue && (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-xs animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Overdue by {Math.abs(task.daysOffset)} Days</span>
                          </span>
                          <p className="text-[10px] text-rose-700 font-semibold mt-0.5">
                            Due date: {task.dueDate}
                          </p>
                        </div>
                      )}

                      {isDueToday && (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Due Today (आज फ़ॉलो-अप)</span>
                          </span>
                          <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                            Priority queue active
                          </p>
                        </div>
                      )}

                      {task.urgency === 'Upcoming_Week' && (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Due in {task.daysOffset} Days</span>
                          </span>
                          <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                            {task.dueDate}
                          </p>
                        </div>
                      )}

                      {isResolved && (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolved / Verified</span>
                          </span>
                          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                            {task.resolvedAt || 'Verified at doorstep'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clinical Trigger Alert Box */}
                  <div
                    className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                      isOverdue
                        ? 'bg-rose-50 border border-rose-200 text-rose-950'
                        : isDueToday
                        ? 'bg-amber-50 border border-amber-200 text-amber-950'
                        : 'bg-stone-50 border border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-stone-700" />
                        <span>Clinical Trigger ({task.category}):</span>
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                        {task.sourcePrescriptionId || task.sourceReferralId || 'High-Risk Protocol'}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-medium">
                      {task.triggerReason}
                    </p>
                    <div className="text-[11px] font-semibold text-stone-700 pt-1 border-t border-stone-200/60 flex items-center gap-1.5">
                      <span className="text-rose-700 font-bold">Prescribed Doorstep Action:</span>
                      <span>{task.actionRequired}</span>
                    </div>
                  </div>

                  {/* Vitals Snapshot & ASHA Visit Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Vitals Snapshot */}
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex flex-wrap items-center gap-3">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block w-full">
                        Latest Recorded Vitals ({task.latestVitals.recordedAt}):
                      </span>
                      {task.latestVitals.bloodPressureSys && (
                        <span className="px-2 py-1 rounded-lg bg-white border border-stone-200 font-semibold text-stone-800">
                          BP:{' '}
                          <strong
                            className={
                              task.latestVitals.bloodPressureSys > 140 ? 'text-rose-600' : 'text-stone-900'
                            }
                          >
                            {task.latestVitals.bloodPressureSys}/{task.latestVitals.bloodPressureDia}
                          </strong>{' '}
                          mmHg
                        </span>
                      )}
                      {task.latestVitals.spO2 && (
                        <span className="px-2 py-1 rounded-lg bg-white border border-stone-200 font-semibold text-stone-800">
                          SpO2:{' '}
                          <strong
                            className={
                              task.latestVitals.spO2 < 95 ? 'text-amber-600' : 'text-emerald-700'
                            }
                          >
                            {task.latestVitals.spO2}%
                          </strong>
                        </span>
                      )}
                      {task.latestVitals.bloodSugarMgDl && (
                        <span className="px-2 py-1 rounded-lg bg-white border border-stone-200 font-semibold text-stone-800">
                          Sugar:{' '}
                          <strong className="text-amber-700">
                            {task.latestVitals.bloodSugarMgDl} mg/dL
                          </strong>
                        </span>
                      )}
                      {task.latestVitals.hemoglobinGdl && (
                        <span className="px-2 py-1 rounded-lg bg-white border border-stone-200 font-semibold text-stone-800">
                          Hb:{' '}
                          <strong className="text-rose-700">
                            {task.latestVitals.hemoglobinGdl} g/dL
                          </strong>
                        </span>
                      )}
                      {task.latestVitals.muacCm && (
                        <span className="px-2 py-1 rounded-lg bg-white border border-rose-200 font-semibold text-rose-700">
                          MUAC: <strong>{task.latestVitals.muacCm} cm (RED Zone)</strong>
                        </span>
                      )}
                    </div>

                    {/* ASHA Status Box */}
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                        Doorstep ASHA Visit Status:
                      </span>
                      <div className="flex items-center gap-2">
                        {task.ashaDoorstepStatus === 'Completed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Ghar Par Jaanch Poori Hui ({task.lastDoorstepVisitDate})</span>
                          </span>
                        ) : task.ashaDoorstepStatus === 'Alert_Sent' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800">
                            <Send className="w-3.5 h-3.5" />
                            <span>Priority Alert Sent ({task.lastAshaAlertSentAt})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Doorstep Visit Pending ({task.assignedAshaWorker})</span>
                          </span>
                        )}
                      </div>
                      {task.ashaVisitNotes && (
                        <p className="text-[11px] text-stone-600 italic mt-1.5">
                          &ldquo;{task.ashaVisitNotes}&rdquo;
                        </p>
                      )}
                      {task.resolutionSummary && (
                        <p className="text-[11px] text-emerald-800 font-medium mt-1">
                          ✓ {task.resolutionSummary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Alert ASHA Button */}
                      <button
                        onClick={() => handleAlertAsha(task)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                          task.ashaDoorstepStatus === 'Alert_Sent'
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                            : 'bg-stone-900 text-white hover:bg-stone-800'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {task.ashaDoorstepStatus === 'Alert_Sent'
                            ? 'Re-Send Priority Alert to ASHA'
                            : 'Alert ASHA Worker (SMS/WhatsApp)'}
                        </span>
                      </button>

                      {/* Start Teleconsultation Follow-up */}
                      <button
                        onClick={() => handleStartFollowUpCall(task)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Start Teleconsult Follow-Up</span>
                      </button>

                      {/* View Longitudinal EHR */}
                      <button
                        onClick={() => {
                          const p = patients.find((pat) => pat.id === task.patientId);
                          if (p) onSelectPatientForEHR(p);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-stone-500" />
                        <span>View EHR Record</span>
                      </button>
                    </div>

                    {/* Record Vitals / Resolve */}
                    <button
                      onClick={() => handleOpenResolveModal(task)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs ml-auto"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {isResolved ? 'Update Doorstep Vitals' : 'Record Doorstep Vitals / Resolve'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Doorstep Vitals & Resolution Modal */}
      {resolvingTask && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-teal-800 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-teal-300" />
                  <h3 className="font-bold text-base">Record Doorstep Vitals &amp; Follow-Up</h3>
                </div>
                <p className="text-xs text-teal-200 mt-1">
                  {resolvingTask.patientName} &bull; ABHA: {resolvingTask.abhaId} &bull;{' '}
                  {resolvingTask.subCentre}
                </p>
              </div>
              <button
                onClick={() => setResolvingTask(null)}
                className="w-8 h-8 rounded-full bg-teal-900/50 hover:bg-teal-900 flex items-center justify-center text-teal-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                <span className="font-bold">Follow-Up Action Mandated:</span> {resolvingTask.actionRequired}
              </div>

              {/* Vitals Form */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Doorstep Measured Parameters
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Blood Pressure (Sys / Dia)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="120"
                        value={recordBpSys}
                        onChange={(e) => setRecordBpSys(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <span className="text-stone-400">/</span>
                      <input
                        type="number"
                        placeholder="80"
                        value={recordBpDia}
                        onChange={(e) => setRecordBpDia(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Pulse Oximetry (SpO2 %)
                    </label>
                    <input
                      type="number"
                      placeholder="98"
                      value={recordSpo2}
                      onChange={(e) => setRecordSpo2(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Blood Sugar (mg/dL)
                    </label>
                    <input
                      type="number"
                      placeholder="110"
                      value={recordSugar}
                      onChange={(e) => setRecordSugar(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Hemoglobin (g/dL)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="11.5"
                      value={recordHb}
                      onChange={(e) => setRecordHb(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      MUAC (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="12.5"
                      value={recordMuac}
                      onChange={(e) => setRecordMuac(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    ASHA / CHO Doorstep Notes &amp; Verification
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Ghar par jaanch poori hui: Dawai niyamit le rahe hain, koi emergency lakshan nahi dikha..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 p-4 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => setResolvingTask(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResolution}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Vitals &amp; Mark Resolved</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
