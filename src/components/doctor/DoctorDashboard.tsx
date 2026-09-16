import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PatientEHR, TelehealthSession, DoctorAvailabilityStatus } from '../../types';
import { PriorityPatientQueue } from './PriorityPatientQueue';
import { EPrescriptionModal } from '../prescription/EPrescriptionModal';
import { IncomingReferralInbox } from './IncomingReferralInbox';
import { DoctorQualityReviewsView } from './DoctorQualityReviewsView';
import { HighRiskFollowUpTracker } from './HighRiskFollowUpTracker';
import {
  Video,
  PhoneCall,
  UserCheck,
  Clock,
  AlertCircle,
  FileText,
  Activity,
  Heart,
  ChevronRight,
  Search,
  PlusCircle,
  Pill,
  Send,
  Building,
  UserPlus,
  ShieldAlert,
  Wifi,
  Radio,
  Inbox,
  CheckCircle2,
  PauseCircle,
  PowerOff,
  SlidersHorizontal,
  MapPin,
  Check,
  X,
  Star,
  Award,
  ThumbsUp,
  MessageSquareQuote,
} from 'lucide-react';

export function DoctorDashboard() {
  const {
    currentUser,
    telehealthQueue,
    patients,
    startTeleconsultation,
    setSelectedPatientForEHR,
    setIsTriageModalOpen,
    setIsMedicineModalOpen,
    setIsReferralModalOpen,
    setIsNewPatientModalOpen,
    setIsAmbulanceModalOpen,
    triggerEmergencySOS,
    getDoctorAvailability,
    setDoctorAvailability,
    getDoctorQualityMetrics,
    feedbacks,
    followUpTasks,
    t,
  } = useApp();

  const [activeDoctorView, setActiveDoctorView] = useState<'queue' | 'referrals' | 'quality' | 'followup'>('queue');
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [prescriptionTargetPatient, setPrescriptionTargetPatient] = useState<PatientEHR | null>(null);

  // Quality & Reviews metrics
  const qualityMetrics = getDoctorQualityMetrics(currentUser.id);

  // Doctor Availability state & helpers
  const availability = getDoctorAvailability(currentUser.id);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState(availability.statusNote || '');
  const [tempSpokes, setTempSpokes] = useState<string[]>(
    availability.coveredSpokes || ['District Tele-Hub Jabalpur', 'PHC Pipariya', 'SC Bamori', 'SC Bankhedi']
  );

  const ALL_RURAL_SPOKES = [
    'District Tele-Hub Jabalpur',
    'PHC Pipariya',
    'SC Bamori',
    'SC Bankhedi',
    'SC Rampur',
    'SC Belkheda',
  ];

  const handleStatusToggle = (newStatus: DoctorAvailabilityStatus) => {
    let note = availability.statusNote;
    if (newStatus === 'Available') {
      note = 'Live on Tele-Duty (Ready for Consultations)';
    } else if (newStatus === 'Busy') {
      note = 'In Active OPD / Teleconsultation';
    } else if (newStatus === 'Offline') {
      note = 'Duty Off / Shift Ended';
    }

    setDoctorAvailability(currentUser.id, newStatus, note, availability.coveredSpokes);
    setStatusFeedback(
      `Status updated to "${newStatus}". ASHA workers and Patients now see real-time availability.`
    );
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  const handleSaveStatusModal = () => {
    setDoctorAvailability(currentUser.id, availability.status, tempNote, tempSpokes);
    setIsStatusModalOpen(false);
    setStatusFeedback('Virtual Spoke Coverage and Status Note updated successfully.');
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  // High risk patients among records
  const highRiskPatients = patients.filter((p) => p.triageStatus === 'Red' || p.highRiskCategory !== 'None');

  // Follow-up overdue / due today counts
  const overdueFollowUpCount = followUpTasks.filter((t) => t.urgency === 'Critical_Overdue').length;
  const dueTodayFollowUpCount = followUpTasks.filter((t) => t.urgency === 'Due_Today').length;

  // Pending referrals count
  const pendingReferralsCount = useMemo(() => {
    return patients.flatMap((p) => p.referrals).filter((r) => r.status === 'Initiated').length;
  }, [patients]);

  return (
    <div className="space-y-6">
      {/* Real-time Status Sync Feedback Toast */}
      {statusFeedback && (
        <div className="p-3 bg-teal-900 text-white text-xs font-semibold rounded-2xl flex items-center justify-between shadow-md transition-all animate-fadeIn">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{statusFeedback}</span>
          </div>
          <button
            onClick={() => setStatusFeedback(null)}
            className="text-stone-300 hover:text-white p-1 rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Doctor Welcome & Status Banner */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0 relative">
              <UserCheck className="w-7 h-7" />
              {/* Floating live indicator on avatar */}
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                  availability.status === 'Available'
                    ? 'bg-emerald-500'
                    : availability.status === 'Busy'
                    ? 'bg-amber-500'
                    : 'bg-stone-400'
                }`}
              >
                {availability.status === 'Available' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                )}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900">{currentUser.name}</h1>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-100 text-teal-800">
                  {currentUser.facility || 'Telemedicine Hub'}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {currentUser.specialization} &bull; Reg: {currentUser.registrationNumber}
              </p>
            </div>
          </div>

          {/* Availability 3-Way Switcher & Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 3-State Toggle Segment */}
            <div className="p-1 bg-stone-100 border border-stone-200 rounded-2xl flex items-center gap-1 shadow-2xs">
              {/* 1. Available */}
              <button
                type="button"
                onClick={() => handleStatusToggle('Available')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  availability.status === 'Available'
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
                title="Mark as Live & Available for Teleconsultations"
              >
                <span className="relative flex h-2 w-2">
                  {availability.status === 'Available' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      availability.status === 'Available' ? 'bg-white' : 'bg-emerald-500'
                    }`}
                  />
                </span>
                <span>{t('status_available')}</span>
              </button>

              {/* 2. Busy */}
              <button
                type="button"
                onClick={() => handleStatusToggle('Busy')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  availability.status === 'Busy'
                    ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/40'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
                title="Mark as Busy (Consultation in progress / Procedure)"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    availability.status === 'Busy' ? 'bg-white' : 'bg-amber-500'
                  }`}
                />
                <span>{t('status_busy')}</span>
              </button>

              {/* 3. Offline */}
              <button
                type="button"
                onClick={() => handleStatusToggle('Offline')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  availability.status === 'Offline'
                    ? 'bg-stone-700 text-white shadow-sm ring-2 ring-stone-400/40'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
                title="Mark as Offline (Duty Off / Shift Ended - prevents blind calls)"
              >
                <PowerOff className="w-3 h-3" />
                <span>{t('status_offline')}</span>
              </button>
            </div>

            {/* Edit Status Note / Spokes Button */}
            <button
              type="button"
              onClick={() => {
                setTempNote(availability.statusNote || '');
                setTempSpokes(availability.coveredSpokes || []);
                setIsStatusModalOpen(true);
              }}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
              title="Configure Spoke PHCs & Custom Status Note"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Spoke Hub Coverage & Live Status Details Strip */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 ${
                availability.status === 'Available'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : availability.status === 'Busy'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              {availability.status === 'Available' && <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />}
              {availability.status === 'Busy' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
              {availability.status === 'Offline' && <PowerOff className="w-3 h-3 text-stone-500" />}
              <span>{availability.status.toUpperCase()}</span>
              {availability.statusNote && (
                <span className="font-normal text-stone-600">&bull; {availability.statusNote}</span>
              )}
            </span>

            {/* Virtual Spoke Hubs (Mitigating Specialist Shortage) */}
            <div className="flex items-center gap-1.5 text-stone-600 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
              <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span className="font-semibold text-stone-800">{t('virtually_covering')} {availability.coveredSpokes?.length || 0} {t('spokes_label')}</span>
              <div className="flex items-center gap-1 flex-wrap">
                {(availability.coveredSpokes || []).slice(0, 3).map((spoke) => (
                  <span
                    key={spoke}
                    className="px-1.5 py-0.2 bg-teal-100/70 text-teal-900 rounded text-[10px] font-semibold"
                  >
                    {spoke}
                  </span>
                ))}
                {(availability.coveredSpokes?.length || 0) > 3 && (
                  <span className="text-[10px] font-bold text-stone-500">
                    +{(availability.coveredSpokes?.length || 0) - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Doctor Desk Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsNewPatientModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('register_patient')}</span>
            </button>
            <button
              onClick={() => {
                setPrescriptionTargetPatient(null);
                setIsPrescriptionModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Issue ABDM-compliant e-Prescription with live stock verification"
            >
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span>Issue e-Rx</span>
            </button>
            <button
              onClick={() => setActiveDoctorView('referrals')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs border ${
                activeDoctorView === 'referrals'
                  ? 'bg-indigo-700 text-white border-indigo-700'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
              }`}
              title="View incoming patient transfers from rural Sub-Centres"
            >
              <Inbox className="w-3.5 h-3.5 text-indigo-700" />
              <span>Referrals {pendingReferralsCount > 0 ? `(${pendingReferralsCount} New)` : ''}</span>
            </button>
            <button
              onClick={() => setIsTriageModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Triage</span>
            </button>
            <button
              onClick={() => setIsMedicineModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5 text-blue-600" />
              <span>Drugs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Customize Doctor Status Note & Virtual Spoke Hubs */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">{t('configure_availability')}</h3>
                  <p className="text-xs text-stone-500">Visible in real-time to ASHA workers and patients</p>
                </div>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets for Status Note */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700">{t('status_note_presets')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  'Live on Tele-Duty (Ready for Consultations)',
                  'In Consultation with Rural Spoke Patient',
                  'Emergency Ward Rounds (Back in 15 mins)',
                  'In Minor OT / Procedure',
                  'On Lunch Break (Back at 02:00 PM)',
                  'Duty Off / Shift Ended',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTempNote(preset)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      tempNote === preset
                        ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                placeholder="Or type custom status note..."
                className="w-full mt-2 p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
              />
            </div>

            {/* Virtual Rural Spokes Coverage */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">
                  {t('virtual_spoke_coverage')}
                </label>
                <span className="text-[11px] text-teal-700 font-semibold">
                  {tempSpokes.length} Spokes Active
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Choose rural sub-centres and PHCs routed to your teleconsultation room.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {ALL_RURAL_SPOKES.map((spoke) => {
                  const isChecked = tempSpokes.includes(spoke);
                  return (
                    <button
                      key={spoke}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setTempSpokes(tempSpokes.filter((s) => s !== spoke));
                        } else {
                          setTempSpokes([...tempSpokes, spoke]);
                        }
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'border-teal-700 bg-teal-50/70 text-teal-900 font-bold'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <span className="truncate">{spoke}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-teal-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveStatusModal}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm"
              >
                {t('save_broadcast_status')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">{t('waiting_in_queue')}</span>
            <Clock className="w-4 h-4 text-teal-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">{telehealthQueue.filter((s) => s.status === 'Waiting').length}</div>
          <p className="text-[11px] text-teal-800 mt-0.5">Average wait time: 14 mins</p>
        </div>

        <div
          onClick={() => setActiveDoctorView('followup')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs hover:border-rose-300 hover:shadow-xs cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">{t('high_risk_followups')}</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-bold text-rose-600">{highRiskPatients.length}</span>
            {overdueFollowUpCount > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                {overdueFollowUpCount} Overdue
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-600 mt-0.5">ANC, SAM &amp; HTN active tracking &rarr;</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">{t('connected_subcentres')}</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">18 / 18</div>
          <p className="text-[11px] text-emerald-800 mt-0.5">All spokes operational</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">{t('travel_saved')}</span>
            <Heart className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-800">420 km</div>
          <p className="text-[11px] text-stone-600 mt-0.5">~₹1,850 bus fare saved/pt</p>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveDoctorView('queue')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeDoctorView === 'queue'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>{t('telehealth_queue_tab')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeDoctorView === 'queue' ? 'bg-teal-800 text-teal-100' : 'bg-stone-100 text-stone-700'
              }`}
            >
              {telehealthQueue.filter((s) => s.status === 'Waiting').length} Waiting
            </span>
          </button>

          <button
            onClick={() => setActiveDoctorView('referrals')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeDoctorView === 'referrals'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>{t('incoming_referral_inbox_tab')}</span>
            {pendingReferralsCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                {pendingReferralsCount} Action Required
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
                {patients.flatMap((p) => p.referrals).length} Total
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveDoctorView('quality')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeDoctorView === 'quality'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>{t('quality_reviews_tab')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeDoctorView === 'quality'
                  ? 'bg-amber-700 text-amber-100'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              ★ {qualityMetrics.averageRating} ({qualityMetrics.totalReviews})
            </span>
          </button>

          <button
            onClick={() => setActiveDoctorView('followup')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeDoctorView === 'followup'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>{t('high_risk_followup_tab')}</span>
            {overdueFollowUpCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                {overdueFollowUpCount} Overdue
              </span>
            ) : dueTodayFollowUpCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
                {dueTodayFollowUpCount} Due Today
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                {followUpTasks.length} Cohort
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Active View:{' '}
          <strong className="text-stone-800">
            {activeDoctorView === 'queue'
              ? 'Live Telehealth Queue'
              : activeDoctorView === 'referrals'
              ? 'Incoming Inter-Facility Referrals'
              : activeDoctorView === 'quality'
              ? 'Beneficiary Quality & Patient Reviews'
              : 'High-Risk Patient Follow-Up Tracker'}
          </strong>
        </div>
      </div>

      {/* Conditionally Render View */}
      {activeDoctorView === 'referrals' ? (
        <IncomingReferralInbox
          onStartTeleconsultation={startTeleconsultation}
          onSelectPatientForEHR={setSelectedPatientForEHR}
          onDispatch108Ambulance={() => setIsAmbulanceModalOpen(true)}
          onIssuePrescription={(patient) => {
            setPrescriptionTargetPatient(patient);
            setIsPrescriptionModalOpen(true);
          }}
        />
      ) : activeDoctorView === 'quality' ? (
        <DoctorQualityReviewsView
          qualityMetrics={qualityMetrics}
          currentUser={currentUser}
        />
      ) : activeDoctorView === 'followup' ? (
        <HighRiskFollowUpTracker
          onStartTeleconsultation={startTeleconsultation}
          onSelectPatientForEHR={setSelectedPatientForEHR}
        />
      ) : (
        /* Main Grid: Queue on Left, High Risk & Records on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Priority-Sorted Telehealth Queue (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <PriorityPatientQueue
              telehealthQueue={telehealthQueue}
              patients={patients}
              onStartTeleconsultation={startTeleconsultation}
              onSelectPatientForEHR={setSelectedPatientForEHR}
              onDispatch108Ambulance={() => setIsAmbulanceModalOpen(true)}
              onOpenPrescriptionModal={(patient) => {
                setPrescriptionTargetPatient(patient);
                setIsPrescriptionModalOpen(true);
              }}
            />
          </div>

          {/* Right Column: High-Risk Cohort & Registered Rural Patients (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* High-Risk Watchlist */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>{t('high_risk_rural_cohort')}</span>
                </h3>
                <button
                  onClick={() => setActiveDoctorView('followup')}
                  className="text-xs text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                    {t('open_tracker')}
                </button>
              </div>

              <div className="space-y-3">
                {highRiskPatients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatientForEHR(p)}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900">{p.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                        {p.highRiskCategory}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 mt-1">
                      ABHA: {p.abhaId} &bull; Village: {p.village}
                    </div>
                    {p.vitalsHistory[0] && (
                      <div className="mt-2 flex items-center gap-3 text-[11px] bg-white p-2 rounded-lg border border-rose-100">
                        <div>
                          BP: <span className="font-bold text-stone-900">{p.vitalsHistory[0].bloodPressureSys}/{p.vitalsHistory[0].bloodPressureDia}</span>
                        </div>
                        {p.vitalsHistory[0].hemoglobinGdl && (
                          <div>
                            Hb: <span className="font-bold text-rose-700">{p.vitalsHistory[0].hemoglobinGdl} g/dL</span>
                          </div>
                        )}
                        {p.vitalsHistory[0].bloodSugarMgDl && (
                          <div>
                            Sugar: <span className="font-bold text-amber-700">{p.vitalsHistory[0].bloodSugarMgDl} mg/dL</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* All Longitudinal Patient EHRs */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-700" />
                  <span>{t('longitudinal_health_records')}</span>
                </h3>
                <span className="text-xs text-stone-500">{patients.length} Registered</span>
              </div>

              <div className="divide-y divide-stone-100">
                {patients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatientForEHR(p)}
                    className="py-2.5 flex items-center justify-between hover:bg-stone-50 rounded-lg px-2 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-800">{p.name}</div>
                      <div className="text-[11px] text-stone-500">
                        {p.age}y, {p.gender} &bull; {p.registeredFacility}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          p.triageStatus === 'Red' ? 'bg-rose-500' : p.triageStatus === 'Amber' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABDM e-Prescription Generator Modal */}
      <EPrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        preSelectedPatient={prescriptionTargetPatient}
      />
    </div>
  );
}
