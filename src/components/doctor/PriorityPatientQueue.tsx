import React, { useState, useMemo } from 'react';
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
  Pill,
  Building,
  ShieldAlert,
  Wifi,
  Radio,
  Sparkles,
  ArrowUpDown,
  Filter,
  Flame,
  AlertTriangle,
  Ambulance,
  Sliders,
  CheckCircle2,
  X,
  Stethoscope,
  RefreshCw,
} from 'lucide-react';
import { PatientEHR, TelehealthSession } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  EnrichedQueueSession,
  TriageTier,
  enrichTelehealthQueue,
  sortQueueByPriority,
  sortQueueByWaitTime,
  sortQueueBySubCentre,
} from '../../utils/queueTriageEngine';

interface PriorityPatientQueueProps {
  telehealthQueue: TelehealthSession[];
  patients: PatientEHR[];
  onStartTeleconsultation: (session: TelehealthSession) => void;
  onSelectPatientForEHR: (patient: PatientEHR) => void;
  onDispatch108Ambulance: () => void;
  onOpenPrescriptionModal?: (patient: PatientEHR) => void;
}

export function PriorityPatientQueue({
  telehealthQueue,
  patients,
  onStartTeleconsultation,
  onSelectPatientForEHR,
  onDispatch108Ambulance,
  onOpenPrescriptionModal,
}: PriorityPatientQueueProps) {
  const { t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<'ALL' | TriageTier>('ALL');
  const [sortMode, setSortMode] = useState<'priority' | 'wait_time' | 'sub_centre'>('priority');
  const [overrides, setOverrides] = useState<Record<string, { tier: TriageTier; note: string }>>({});
  const [overrideModalSession, setOverrideModalSession] = useState<EnrichedQueueSession | null>(null);

  // Enrich queue with clinical scoring
  const enrichedQueue = useMemo(() => {
    const enriched = enrichTelehealthQueue(telehealthQueue, patients);

    // Apply manual doctor overrides if present
    const withOverrides = enriched.map((session) => {
      const override = overrides[session.id];
      if (override) {
        let overriddenScore = session.priorityScore;
        if (override.tier === 'RED') overriddenScore = Math.max(88, session.priorityScore);
        else if (override.tier === 'ORANGE') overriddenScore = 70;
        else if (override.tier === 'YELLOW') overriddenScore = 50;
        else if (override.tier === 'GREEN') overriddenScore = 25;

        return {
          ...session,
          triageTier: override.tier,
          triageLabel: `${override.tier} (Doctor Overridden)`,
          priorityScore: overriddenScore,
          isOverridden: true,
          clinicalRiskSummary: `${override.note} • [Doctor Overridden]`,
        };
      }
      return session;
    });

    // Sort according to selected sort mode
    if (sortMode === 'priority') {
      return sortQueueByPriority(withOverrides);
    } else if (sortMode === 'wait_time') {
      return sortQueueByWaitTime(withOverrides);
    } else {
      return sortQueueBySubCentre(withOverrides);
    }
  }, [telehealthQueue, patients, sortMode, overrides]);

  // Filtered queue based on tier & search query
  const filteredQueue = useMemo(() => {
    return enrichedQueue.filter((s) => {
      const matchesSearch =
        s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subCentre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.abhaId.includes(searchQuery) ||
        s.complaint.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier = filterTier === 'ALL' || s.triageTier === filterTier;

      return matchesSearch && matchesTier;
    });
  }, [enrichedQueue, searchQuery, filterTier]);

  // Priority Tier Counts
  const counts = useMemo(() => {
    const c = { RED: 0, ORANGE: 0, YELLOW: 0, GREEN: 0, TOTAL: enrichedQueue.length };
    enrichedQueue.forEach((s) => {
      if (s.triageTier in c) {
        c[s.triageTier]++;
      }
    });
    return c;
  }, [enrichedQueue]);

  // Handle manual override submission
  const handleSaveOverride = (tier: TriageTier, note: string) => {
    if (!overrideModalSession) return;
    setOverrides((prev) => ({
      ...prev,
      [overrideModalSession.id]: { tier, note: note || 'Priority escalated by consulting physician.' },
    }));
    setOverrideModalSession(null);
  };

  const getTierBadgeStyle = (tier: TriageTier) => {
    switch (tier) {
      case 'RED':
        return 'bg-red-100 text-red-800 border-red-300 ring-1 ring-red-400/50';
      case 'ORANGE':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'YELLOW':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'GREEN':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden space-y-0">
      {/* Top Header & Triage Statistics Bar */}
      <div className="p-5 border-b border-stone-200 bg-stone-50/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-stone-900 text-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-600 animate-pulse" />
                <span>{t('queue_title')}</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                {t('ai_triage_active')}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Patients dynamically ranked by <strong>Clinical Vitals + High-Risk Vulnerability + Waiting Time</strong> (Anti-Starvation).
            </p>
          </div>

          {/* Quick 108 Transfer alert button */}
          <button
            onClick={onDispatch108Ambulance}
            className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            title="Dispatch 108 Emergency Ambulance to Rural Sub-Centre"
          >
            <Ambulance className="w-4 h-4 text-red-600" />
            <span>{t('sos_108')}</span>
          </button>
        </div>

        {/* Triage Tier Counter Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <button
            onClick={() => setFilterTier('ALL')}
            className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
              filterTier === 'ALL'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <div className="text-base font-black">{counts.TOTAL}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider">{t('all_patients')}</div>
          </button>

          <button
            onClick={() => setFilterTier('RED')}
            className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer relative overflow-hidden ${
              filterTier === 'RED'
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-red-50/70 text-red-900 border-red-200 hover:bg-red-100'
            }`}
          >
            {counts.RED > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-400 absolute top-2 right-2 animate-ping" />
            )}
            <div className="text-base font-black">{counts.RED}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider">{t('tier_red_emergency')}</div>
          </button>

          <button
            onClick={() => setFilterTier('ORANGE')}
            className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
              filterTier === 'ORANGE'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <div className="text-base font-black">{counts.ORANGE}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider">{t('tier_orange_urgent')}</div>
          </button>

          <button
            onClick={() => setFilterTier('YELLOW')}
            className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
              filterTier === 'YELLOW'
                ? 'bg-yellow-600 text-white border-yellow-600 shadow-xs'
                : 'bg-yellow-50/70 text-yellow-900 border-yellow-200 hover:bg-yellow-100'
            }`}
          >
            <div className="text-base font-black">{counts.YELLOW}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider">{t('tier_yellow_priority')}</div>
          </button>

          <button
            onClick={() => setFilterTier('GREEN')}
            className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
              filterTier === 'GREEN'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <div className="text-base font-black">{counts.GREEN}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider">{t('tier_green_routine')}</div>
          </button>
        </div>

        {/* Sort Controls & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('search_queue_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Mode Dropdown / Button Toggle */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> {t('sort_label')}
            </span>
            <div className="p-1 bg-stone-100 rounded-xl border border-stone-200 flex items-center gap-1 text-xs">
              <button
                onClick={() => setSortMode('priority')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  sortMode === 'priority'
                    ? 'bg-white text-stone-950 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('sort_clinical_priority')}
              </button>
              <button
                onClick={() => setSortMode('wait_time')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  sortMode === 'wait_time'
                    ? 'bg-white text-stone-950 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('sort_longest_wait')}
              </button>
              <button
                onClick={() => setSortMode('sub_centre')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  sortMode === 'sub_centre'
                    ? 'bg-white text-stone-950 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('sort_by_subcentre')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Queue List Rows */}
      <div className="divide-y divide-stone-100">
        {filteredQueue.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="font-bold text-stone-800 text-sm">{t('no_patients_filter')}</div>
            <p>All queue slots for this priority level are cleared or matching search criteria is empty.</p>
            <button
              onClick={() => {
                setFilterTier('ALL');
                setSearchQuery('');
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-800 text-white text-xs font-bold cursor-pointer"
            >
              {t('reset_filters')}
            </button>
          </div>
        ) : (
          filteredQueue.map((session, index) => {
            const patient = patients.find((p) => p.id === session.patientId) || patients.find((p) => p.name === session.patientName);
            const isRed = session.triageTier === 'RED';
            const isOrange = session.triageTier === 'ORANGE';
            const vitals = session.vitals;

            return (
              <div
                key={session.id}
                className={`p-5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group ${
                  isRed
                    ? 'bg-red-50/40 hover:bg-red-50/80 border-l-4 border-l-red-600'
                    : isOrange
                    ? 'bg-amber-50/30 hover:bg-amber-50/70 border-l-4 border-l-amber-500'
                    : 'hover:bg-stone-50/80 border-l-4 border-l-transparent'
                }`}
              >
                {/* Left Side: Priority Score & Patient Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Row 1: Priority Rank, Tier, Score & Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Rank Badge */}
                    <span className="w-6 h-6 rounded-lg bg-stone-800 text-white text-xs font-mono font-black flex items-center justify-center">
                      #{index + 1}
                    </span>

                    {/* Triage Tier Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${getTierBadgeStyle(
                        session.triageTier
                      )}`}
                    >
                      {isRed && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />}
                      {session.triageTier === 'RED' && t('tier_immediate_emergency')}
                      {session.triageTier === 'ORANGE' && t('tier_urgent_priority')}
                      {session.triageTier === 'YELLOW' && t('tier_moderate_triage')}
                      {session.triageTier === 'GREEN' && t('tier_routine_opd')}
                    </span>

                    {/* Priority Score Progress Gauge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white border border-stone-200 text-xs shadow-2xs font-mono">
                      <span className="font-black text-stone-900">{session.priorityScore}</span>
                      <span className="text-[10px] text-stone-400">/100</span>
                      <div className="w-12 h-1.5 bg-stone-200 rounded-full overflow-hidden ml-1">
                        <div
                          className={`h-full rounded-full ${
                            isRed ? 'bg-red-600' : isOrange ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${session.priorityScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Waiting Escalation Tag */}
                    <span className="text-[11px] font-mono text-stone-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{session.scheduledTime}</span>
                      {session.escalationPoints > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 text-[10px] font-bold">
                          +{session.escalationPoints} {t('wait_penalty')}
                        </span>
                      )}
                    </span>

                    {session.isOverridden && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        {t('physician_override')}
                      </span>
                    )}
                  </div>

                  {/* Row 2: Patient Identity */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="font-bold text-stone-900 text-base">{session.patientName}</span>
                    <span className="text-xs text-stone-600">
                      ({session.patientAge}y, {session.patientGender})
                    </span>
                    <span className="text-xs font-mono text-stone-400">&bull; ABHA: {session.abhaId}</span>

                    {/* New Patient Cold-Start Tag */}
                    {session.isNewPatient && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        {t('new_patient_first_visit')}
                      </span>
                    )}

                    {/* Verification Source Badge */}
                    {session.verificationBadge && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
                          session.verificationBadge.type === 'ASHA_Verified'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : session.verificationBadge.type === 'IoT_Verified'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                        title={session.verificationBadge.label}
                      >
                        {session.verificationBadge.type === 'ASHA_Verified' && <UserCheck className="w-3 h-3" />}
                        {session.verificationBadge.type === 'IoT_Verified' && <Activity className="w-3 h-3 text-blue-600" />}
                        {session.verificationBadge.type === 'Self_Reported' && <AlertCircle className="w-3 h-3 text-stone-500" />}
                        {session.verificationBadge.label}
                      </span>
                    )}

                    {patient?.highRiskCategory && patient.highRiskCategory !== 'None' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white shadow-2xs">
                        {patient.highRiskCategory}
                      </span>
                    )}
                  </div>

                  {/* Anti-Gaming Discordance Alert Box */}
                  {session.isDiscordant && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs flex items-start gap-2.5 shadow-2xs">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-950">{t('vitals_symptom_mismatch')}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-200 rounded text-amber-900">
                            {t('anti_gaming_guardrail')}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                          {session.discordanceReason ||
                            'Reported acute emergency distress, but objective hemodynamic vitals are 100% normal. Priority score capped in Routine tier.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Row 3: Complaint & Clinical Alert Summary */}
                  <div className="p-2.5 rounded-xl bg-white/90 border border-stone-200/80 text-xs">
                    <div className="font-semibold text-stone-800">
                      <strong>Complaint:</strong> {session.complaint}
                    </div>
                    {session.vitalsWarning && session.vitalsWarning.length > 0 && (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span className="text-[11px] font-bold text-red-700">
                          {session.vitalsWarning.join(' | ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Row 4: Live Vitals Strip & Spoke Details */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    {/* Vitals */}
                    {vitals ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {vitals.bloodPressureSys && vitals.bloodPressureDia && (
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
                              vitals.bloodPressureSys >= 150 || vitals.bloodPressureDia >= 95
                                ? 'bg-red-50 text-red-800 border-red-300'
                                : 'bg-stone-100 text-stone-800 border-stone-200'
                            }`}
                          >
                            BP: {vitals.bloodPressureSys}/{vitals.bloodPressureDia}
                          </span>
                        )}

                        {vitals.spO2 && (
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
                              vitals.spO2 < 94
                                ? 'bg-red-50 text-red-800 border-red-300'
                                : 'bg-stone-100 text-stone-800 border-stone-200'
                            }`}
                          >
                            SpO2: {vitals.spO2}%
                          </span>
                        )}

                        {vitals.pulseRate && (
                          <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                            Pulse: {vitals.pulseRate}
                          </span>
                        )}

                        {vitals.bloodSugarMgDl && (
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
                              vitals.bloodSugarMgDl >= 200
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-stone-100 text-stone-800 border-stone-200'
                            }`}
                          >
                            Sugar: {vitals.bloodSugarMgDl}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-stone-400 text-[11px]">{t('vitals_pending')}</span>
                    )}

                    {/* Sub-Centre Spoke Info */}
                    <span className="flex items-center gap-1 text-[11px] text-stone-500">
                      <Building className="w-3 h-3 text-stone-400" />
                      <span>{session.subCentre}</span>
                    </span>

                    {/* Network Connectivity */}
                    <span className="flex items-center gap-1 text-[11px] text-stone-500">
                      {session.connectionQuality === 'Good' ? (
                        <Wifi className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Radio className="w-3 h-3 text-amber-600" />
                      )}
                      <span>{t('spoke_link')} {session.connectionQuality}</span>
                    </span>
                  </div>
                </div>

                {/* Right Side: Doctor Actions */}
                <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                  {/* Start Teleconsultation Call */}
                  <button
                    onClick={() => onStartTeleconsultation(session)}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isRed
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
                        : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-200'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>{isRed ? t('start_emergency_call') : t('start_consult_call')}</span>
                  </button>

                  <div className="flex items-center gap-1.5 w-full justify-end">
                    {/* Direct e-Prescription Generator Shortcut */}
                    {patient && onOpenPrescriptionModal && (
                      <button
                        onClick={() => onOpenPrescriptionModal(patient)}
                        className="px-2.5 py-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-xs font-semibold text-teal-800 cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                        title="Issue ABDM-compliant e-Prescription for this patient"
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-700" />
                        <span>{t('rx_slip')}</span>
                      </button>
                    )}

                    {/* Open Longitudinal EHR */}
                    {patient && (
                      <button
                        onClick={() => onSelectPatientForEHR(patient)}
                        className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                        title="Review Longitudinal Medical Records & Lab Panel"
                      >
                        <FileText className="w-3.5 h-3.5 text-stone-500" />
                        <span>{t('abdm_ehr')}</span>
                      </button>
                    )}

                    {/* Override Priority */}
                    <button
                      onClick={() => setOverrideModalSession(session)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                      title="Adjust or Override Triage Priority Score"
                    >
                      <Sliders className="w-3.5 h-3.5 text-stone-500" />
                      <span>{t('override')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MANUAL DOCTOR OVERRIDE MODAL */}
      {overrideModalSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  {t('triage_override_desk')}
                </span>
                <h3 className="font-bold text-base text-stone-900 mt-1">
                  {overrideModalSession.patientName}
                </h3>
                <p className="text-xs text-stone-500">
                  Current Score: <strong>{overrideModalSession.priorityScore}/100</strong> &bull; {overrideModalSession.triageLabel}
                </p>
              </div>
              <button
                onClick={() => setOverrideModalSession(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              {t('override_description')}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleSaveOverride('RED', 'Elevated to Emergency RED by Doctor')}
                className="p-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-900 font-bold flex items-center gap-2 cursor-pointer"
              >
                <span className="w-3 h-3 rounded-full bg-red-600" />
                <span>{t('mark_red_emergency')}</span>
              </button>

              <button
                onClick={() => handleSaveOverride('ORANGE', 'Marked Urgent by Doctor')}
                className="p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold flex items-center gap-2 cursor-pointer"
              >
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>{t('mark_orange_urgent')}</span>
              </button>

              <button
                onClick={() => handleSaveOverride('YELLOW', 'Marked Moderate by Doctor')}
                className="p-3 rounded-xl border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-900 font-bold flex items-center gap-2 cursor-pointer"
              >
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>{t('mark_yellow_priority')}</span>
              </button>

              <button
                onClick={() => handleSaveOverride('GREEN', 'Marked Routine by Doctor')}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold flex items-center gap-2 cursor-pointer"
              >
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <span>{t('mark_green_routine')}</span>
              </button>
            </div>

            {/* 1-Click Anti-Gaming Demote Action */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() =>
                  handleSaveOverride(
                    'GREEN',
                    'Verified spot vitals stable; claimed symptoms were non-emergent or exaggerated. Demoted to routine FIFO queue.'
                  )
                }
                className="w-full py-2.5 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{t('demote_exaggerated')}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-center justify-end">
              <button
                onClick={() => setOverrideModalSession(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
