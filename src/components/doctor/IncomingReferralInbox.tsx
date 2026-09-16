import React, { useState, useMemo } from 'react';
import {
  Inbox,
  ArrowRight,
  Building,
  Clock,
  AlertTriangle,
  AlertCircle,
  FileText,
  Video,
  Ambulance,
  CheckCircle2,
  X,
  Search,
  Filter,
  UserCheck,
  Activity,
  Heart,
  Calendar,
  Sparkles,
  PhoneCall,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PatientEHR, Referral, TelehealthSession } from '../../types';

interface IncomingReferralInboxProps {
  onStartTeleconsultation: (session: TelehealthSession) => void;
  onSelectPatientForEHR: (patient: PatientEHR) => void;
  onDispatch108Ambulance: () => void;
  onIssuePrescription?: (patient: PatientEHR) => void;
}

export function IncomingReferralInbox({
  onStartTeleconsultation,
  onSelectPatientForEHR,
  onDispatch108Ambulance,
  onIssuePrescription,
}: IncomingReferralInboxProps) {
  const { patients, updateReferralStatus, currentUser, t } = useApp();

  const [statusFilter, setStatusFilter] = useState<'ALL' | Referral['status']>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'Emergency' | 'Urgent' | 'Routine'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for doctor actions
  const [actionModalReferral, setActionModalReferral] = useState<(Referral & { patientObj: PatientEHR }) | null>(null);
  const [actionType, setActionType] = useState<'ACCEPT' | 'COMPLETE' | null>(null);
  const [allocatedBedOrToken, setAllocatedBedOrToken] = useState('HDU Bed #04 (ICU Step-Down)');
  const [arrivalNotes, setArrivalNotes] = useState('Patient arrival pre-notified. Nursing staff alerted for immediate vitals triage & IV setup.');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Flatten all referrals from all patients and pair with patient object
  const allReferrals = useMemo(() => {
    return patients.flatMap((p) =>
      p.referrals.map((r) => ({
        ...r,
        patientObj: p,
      }))
    );
  }, [patients]);

  // Filtered referrals
  const filteredReferrals = useMemo(() => {
    return allReferrals.filter((r) => {
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesUrgency = urgencyFilter === 'ALL' || r.urgency === urgencyFilter;
      const matchesSearch =
        r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.fromFacility.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.toFacility.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.specialtyRequired.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.abhaId.includes(searchQuery) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesUrgency && matchesSearch;
    });
  }, [allReferrals, statusFilter, urgencyFilter, searchQuery]);

  // Metrics summary counts
  const metrics = useMemo(() => {
    const total = allReferrals.length;
    const pending = allReferrals.filter((r) => r.status === 'Initiated').length;
    const emergency = allReferrals.filter((r) => r.urgency === 'Emergency').length;
    const inTransit = allReferrals.filter(
      (r) => r.transportArranged && (r.status === 'Initiated' || r.status === 'Specialist_Review' || r.status === 'Accepted_PHC')
    ).length;
    const completed = allReferrals.filter((r) => r.status === 'Completed').length;

    return { total, pending, emergency, inTransit, completed };
  }, [allReferrals]);

  // Handle Accept Referral
  const handleConfirmAccept = () => {
    if (!actionModalReferral) return;

    updateReferralStatus(actionModalReferral.id, 'Accepted_PHC');
    setActionSuccessToast(
      `Referral ${actionModalReferral.id} Accepted! Allocated ${allocatedBedOrToken}. Spoke health center notified.`
    );
    setActionModalReferral(null);
    setActionType(null);

    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  // Handle Complete / Counter-Referral
  const handleConfirmComplete = () => {
    if (!actionModalReferral) return;

    updateReferralStatus(actionModalReferral.id, 'Completed');
    setActionSuccessToast(
      `Referral ${actionModalReferral.id} marked as Completed & Counter-Referral notes dispatched to ${actionModalReferral.fromFacility}.`
    );
    setActionModalReferral(null);
    setActionType(null);

    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  // Launch Pre-Arrival Teleconsult Call
  const handleLaunchPreArrivalCall = (referral: Referral & { patientObj: PatientEHR }) => {
    const tempSession: TelehealthSession = {
      id: `CALL-REF-${referral.id}`,
      patientId: referral.patientId,
      patientName: referral.patientName,
      patientAge: referral.patientAge,
      patientGender: referral.patientGender,
      abhaId: referral.abhaId,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      doctorSpecialty: currentUser.specialization || 'Telemedicine Specialist',
      scheduledTime: 'Immediate Pre-Arrival Triage',
      status: 'In-Progress',
      complaint: `Pre-Arrival Inter-Facility Referral Triage: ${referral.reason}`,
      priority: referral.urgency === 'Emergency' ? 'High' : referral.urgency === 'Urgent' ? 'Medium' : 'Low',
      ashaAssisted: true,
      ashaName: referral.patientObj.assignedAshaWorker || 'Frontline Health Worker',
      subCentre: referral.fromFacility,
      connectionQuality: 'Good',
    };

    onStartTeleconsultation(tempSession);
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {actionSuccessToast && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionSuccessToast}</span>
          </div>
          <button onClick={() => setActionSuccessToast(null)} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Overview */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-800 shrink-0 shadow-2xs">
            <Inbox className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-stone-900">{t('referral_inbox_title')}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                Spoke &bull; Hub Escalations
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Inter-facility patient transfers &amp; specialist triage from rural Sub-Centres, PHCs and CHCs.
            </p>
          </div>
        </div>

        {/* Quick Facility Tag */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-stone-50 border border-stone-200 px-3 py-2 rounded-2xl text-xs">
          <Building className="w-4 h-4 text-stone-400" />
          <div>
            <span className="text-[10px] text-stone-500 block uppercase tracking-wider font-bold">{t('receiving_facility')}</span>
            <span className="font-bold text-stone-900">{currentUser.facility || 'District Hospital Tele-Hub'}</span>
          </div>
        </div>
      </div>

      {/* 5-Metric Triage Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
            <span>{t('total_referrals')}</span>
            <Inbox className="w-4 h-4 text-stone-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-stone-900">{metrics.total}</div>
          <p className="text-[11px] text-stone-500 mt-0.5">All spokes combined</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
            <span>{t('action_required')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">{metrics.pending}</div>
          <p className="text-[11px] text-amber-800 font-medium mt-0.5">{t('pending_triage_decision')}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-red-800 text-xs font-bold">
            <span>{t('emergency_transfers')}</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-red-700">{metrics.emergency}</div>
          <p className="text-[11px] text-red-800 font-medium mt-0.5">&lt; 15 min protocol</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-blue-800 text-xs font-bold">
            <span>108 In-Transit</span>
            <Ambulance className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-700">{metrics.inTransit}</div>
          <p className="text-[11px] text-blue-800 font-medium mt-0.5">{t('ambulance_en_route')}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
            <span>{t('completed_discharged')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">{metrics.completed}</div>
          <p className="text-[11px] text-emerald-800 font-medium mt-0.5">Counter-referral closed</p>
        </div>
      </div>

      {/* Controls: Status Tabs, Urgency Filters, Search */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200">
            {[
              { id: 'ALL', label: `All (${metrics.total})` },
              { id: 'Initiated', label: `Pending Review (${metrics.pending})` },
              { id: 'Specialist_Review', label: 'Accepted & En Route' },
              { id: 'Completed', label: `Completed (${metrics.completed})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Urgency Filter Chips */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">{t('urgency_label')}</span>
            {(['ALL', 'Emergency', 'Urgent', 'Routine'] as const).map((urg) => (
              <button
                key={urg}
                onClick={() => setUrgencyFilter(urg)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  urgencyFilter === urg
                    ? urg === 'Emergency'
                      ? 'bg-red-600 text-white border-red-600'
                      : urg === 'Urgent'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {urg === 'Emergency' ? '🔴 Emergency' : urg === 'Urgent' ? '🟡 Urgent' : urg === 'Routine' ? '🟢 Routine' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_referrals_placeholder')}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-stone-900 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Referrals List Cards */}
      <div className="space-y-4">
        {filteredReferrals.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-stone-900">{t('no_referrals_filter')}</h3>
            <p className="text-xs text-stone-500">
              There are no incoming referrals for the selected status or search term.
            </p>
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setUrgencyFilter('ALL');
                setSearchQuery('');
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-800 text-white text-xs font-bold cursor-pointer mt-2"
            >
              {t('reset_filters')}
            </button>
          </div>
        ) : (
          filteredReferrals.map((referral) => {
            const isEmergency = referral.urgency === 'Emergency';
            const isUrgent = referral.urgency === 'Urgent';
            const isPending = referral.status === 'Initiated';
            const isCompleted = referral.status === 'Completed';
            const patient = referral.patientObj;
            const latestVital = patient?.vitalsHistory?.[0];

            return (
              <div
                key={referral.id}
                className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 shadow-xs space-y-4 ${
                  isEmergency && isPending
                    ? 'border-red-300 bg-red-50/20 hover:border-red-400'
                    : isUrgent && isPending
                    ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Header Row: Referral ID, Urgency, Status & Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2.5 py-0.5 rounded-lg border border-stone-200">
                      {referral.id}
                    </span>

                    {/* Urgency Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                        isEmergency
                          ? 'bg-red-600 text-white border-red-700 shadow-2xs'
                          : isUrgent
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {isEmergency && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                      {referral.urgency} Escalation
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                        referral.status === 'Initiated'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : referral.status === 'Accepted_PHC' || referral.status === 'Specialist_Review'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {referral.status === 'Initiated' && t('status_initiated')}
                      {referral.status === 'Accepted_PHC' && t('status_accepted')}
                      {referral.status === 'Specialist_Review' && t('status_specialist_review')}
                      {referral.status === 'Completed' && t('status_completed')}
                    </span>
                  </div>

                  <div className="text-xs text-stone-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{t('initiated_date')} {referral.dateInitiated}</span>
                  </div>
                </div>

                {/* Patient Identity & Route */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Patient Info (4 cols) */}
                  <div className="lg:col-span-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-base">{referral.patientName}</span>
                      <span className="text-xs text-stone-600">
                        ({referral.patientAge}y, {referral.patientGender})
                      </span>
                    </div>

                    <div className="text-xs font-mono text-teal-900 font-bold">ABHA: {referral.abhaId}</div>
                    <div className="text-xs text-stone-500">
                      Village: {patient?.village || 'Local Spoke Area'}, {patient?.district || 'Jabalpur'}
                    </div>

                    {patient?.assignedAshaWorker && (
                      <div className="text-[11px] text-purple-800 font-semibold flex items-center gap-1 pt-1">
                        <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>ASHA: {patient.assignedAshaWorker}</span>
                      </div>
                    )}
                  </div>

                  {/* Inter-Facility Route Strip (4 cols) */}
                  <div className="lg:col-span-4 space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-200/70 text-xs">
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      {t('care_escalation_pathway')}
                    </div>

                    <div className="flex items-center gap-2 font-semibold text-stone-800">
                      <span className="text-rose-700 font-bold">{referral.fromFacility}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="text-teal-900 font-bold">{referral.toFacility}</span>
                    </div>

                    <div className="text-[11px] text-stone-600">
                      {t('specialty_required')} <strong>{referral.specialtyRequired}</strong>
                    </div>
                  </div>

                  {/* Transport & Ambulance Status (4 cols) */}
                  <div className="lg:col-span-4 space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-200/70 text-xs">
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      Transit &amp; Emergency Transport
                    </div>

                    {referral.transportArranged ? (
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                          <Ambulance className="w-3.5 h-3.5 text-emerald-700" />
                          108 Ambulance Linked &amp; In-Transit
                        </span>
                        <p className="text-[11px] text-stone-600">{referral.notes || 'Ambulance GPS tracking active'}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 w-fit">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                            {t('self_transport_unconfirmed')}
                          </span>
                          <p className="text-[11px] text-stone-500 mt-0.5">Assistance may be required</p>
                        </div>

                        <button
                          onClick={onDispatch108Ambulance}
                          className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
                        >
                          <Ambulance className="w-3.5 h-3.5" />
                          <span>{t('dispatch_108')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason for Referral & Vitals Strip */}
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 text-xs space-y-2 shadow-2xs">
                  <div className="font-semibold text-stone-800 leading-relaxed">
                    <strong className="text-stone-900">Clinical Escalation Reason:</strong> {referral.reason}
                  </div>

                  {latestVital && (
                    <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      <span className="font-sans font-bold text-stone-500 uppercase text-[10px] mr-1">
                        Spoke Vitals at Referral:
                      </span>
                      {latestVital.bloodPressureSys && (
                        <span
                          className={`px-2 py-0.5 rounded font-bold border ${
                            latestVital.bloodPressureSys >= 150
                              ? 'bg-red-50 text-red-800 border-red-300'
                              : 'bg-stone-100 text-stone-800 border-stone-200'
                          }`}
                        >
                          BP: {latestVital.bloodPressureSys}/{latestVital.bloodPressureDia}
                        </span>
                      )}
                      {latestVital.spO2 && (
                        <span
                          className={`px-2 py-0.5 rounded font-bold border ${
                            latestVital.spO2 < 95
                              ? 'bg-red-50 text-red-800 border-red-300'
                              : 'bg-stone-100 text-stone-800 border-stone-200'
                          }`}
                        >
                          SpO2: {latestVital.spO2}%
                        </span>
                      )}
                      {latestVital.pulseRate && (
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                          Pulse: {latestVital.pulseRate} bpm
                        </span>
                      )}
                      {latestVital.bloodSugarMgDl && (
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                          Sugar: {latestVital.bloodSugarMgDl} mg/dL
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions Desk */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Pre-Arrival Teleconsultation Video Call */}
                    <button
                      onClick={() => handleLaunchPreArrivalCall(referral)}
                      className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Speak with referring ASHA or CHO while patient is en-route"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{t('pre_arrival_video_call')}</span>
                    </button>

                    {/* View ABDM Longitudinal EHR */}
                    <button
                      onClick={() => onSelectPatientForEHR(patient)}
                      className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Review full longitudinal health records & labs"
                    >
                      <FileText className="w-3.5 h-3.5 text-stone-500" />
                      <span>{t('abdm_ehr')}</span>
                    </button>

                    {/* Issue e-Prescription shortcut */}
                    {onIssuePrescription && (
                      <button
                        onClick={() => onIssuePrescription(patient)}
                        className="px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 hover:bg-teal-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Pre-write prescription or emergency medication order"
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-700" />
                        <span>{t('issue_rx')}</span>
                      </button>
                    )}
                  </div>

                  {/* Status Decision Buttons */}
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <button
                        onClick={() => {
                          setActionModalReferral(referral);
                          setActionType('ACCEPT');
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('accept_referral')}</span>
                      </button>
                    )}

                    {!isCompleted && !isPending && (
                      <button
                        onClick={() => {
                          setActionModalReferral(referral);
                          setActionType('COMPLETE');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('discharge_counter_referral')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ACCEPT / COMPLETE ACTION MODAL */}
      {actionModalReferral && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {actionType === 'ACCEPT' ? 'Triage & Accept Referral' : 'Close & Counter-Referral'}
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-1">
                  {actionModalReferral.patientName} &bull; {actionModalReferral.id}
                </h3>
                <p className="text-xs text-stone-500">
                  Origin: <strong>{actionModalReferral.fromFacility}</strong> &bull; Specialty: {actionModalReferral.specialtyRequired}
                </p>
              </div>
              <button
                onClick={() => setActionModalReferral(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionType === 'ACCEPT' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    {t('allocated_bed_token')}
                  </label>
                  <input
                    type="text"
                    value={allocatedBedOrToken}
                    onChange={(e) => setAllocatedBedOrToken(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Arrival Protocol &amp; Pre-Triage Instructions to Spoke
                  </label>
                  <textarea
                    rows={3}
                    value={arrivalNotes}
                    onChange={(e) => setArrivalNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Counter-Referral Care Summary back to Sub-Centre
                  </label>
                  <textarea
                    rows={4}
                    defaultValue="Patient treated and stabilized. Discharge with oral medication. ASHA to perform home BP charting twice weekly and report any warning signs."
                    className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActionModalReferral(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
              >
                {t('cancel')}
              </button>

              {actionType === 'ACCEPT' ? (
                <button
                  type="button"
                  onClick={handleConfirmAccept}
                  className="px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {t('confirm_accept_alert_spoke')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmComplete}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {t('confirm_discharge_close_loop')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
