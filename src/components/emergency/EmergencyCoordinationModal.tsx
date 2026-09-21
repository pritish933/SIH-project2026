import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  EmergencyCategory,
  HospitalEvaluationDetail,
} from '../../types';
import {
  EMERGENCY_ARCHETYPES,
} from '../../utils/emergencyCoordinationEngine';
import {
  HeartPulse,
  ShieldAlert,
  Baby,
  Activity,
  Brain,
  Biohazard,
  Stethoscope,
  X,
  PhoneCall,
  MapPin,
  Building2,
  Ambulance,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Navigation,
  Sparkles,
  ArrowRight,
  Radio,
  Share2,
  QrCode,
  ShieldCheck,
  RotateCcw,
  Users,
  Compass,
  Zap,
  Bed,
  Layers,
  ChevronRight,
  ExternalLink,
  Bot,
  MessageSquare,
} from 'lucide-react';
import { EmergencyAIChatbot } from './EmergencyAIChatbot';

export function EmergencyCoordinationModal() {
  const {
    isCoordinationModalOpen,
    setIsCoordinationModalOpen,
    activeCoordinationSession,
    launchEmergencyCoordination,
    acknowledgeBedReservation,
    updateEmergencyStakeholderStatus,
    cancelEmergencyCoordination,
    setIsHospitalReceptionViewOpen,
    currentUser,
    activeRole,
    language,
  } = useApp();

  const isHindi = language === 'hi';

  // Navigation tab inside modal
  const [activeTab, setActiveTab] = useState<'war_room' | 'cascade_routing' | 'bed_pass' | 'live_map' | 'new_trigger'>(
    activeCoordinationSession ? 'war_room' : 'new_trigger'
  );

  // Trigger screen sub-mode: AI Chatbot vs Predefined Categories
  const [triggerMode, setTriggerMode] = useState<'ai_chatbot' | 'categories'>('ai_chatbot');

  // New Emergency Trigger Form State
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('cardiac_arrest');
  const [patientNameInput, setPatientNameInput] = useState(
    activeRole === 'patient' ? currentUser.name : 'Rameshwar Prasad'
  );
  const [patientVillageInput, setPatientVillageInput] = useState(currentUser.village || 'Gram Sihore');
  const [landmarkInput, setLandmarkInput] = useState('Near Primary School & Panchayat Bhawan');
  const [chiefComplaintInput, setChiefComplaintInput] = useState('');
  const [gpsSimulated, setGpsSimulated] = useState(true);

  // Live timer for countdown hold & simulation
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!activeCoordinationSession) {
      setActiveTab('new_trigger');
      return;
    }
    setActiveTab('war_room');
  }, [activeCoordinationSession]);

  useEffect(() => {
    let interval: any;
    if (activeCoordinationSession) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCoordinationSession]);

  if (!isCoordinationModalOpen) return null;

  const handleLaunchEmergency = (options?: {
    category?: EmergencyCategory;
    patientName?: string;
    patientVillage?: string;
    landmark?: string;
    chiefComplaint?: string;
  }) => {
    const categoryToUse = options?.category || selectedCategory;
    launchEmergencyCoordination({
      category: categoryToUse,
      requesterRole: activeRole === 'asha_worker' ? 'asha_worker' : 'patient',
      patientName: options?.patientName || patientNameInput,
      patientVillage: options?.patientVillage || patientVillageInput,
      landmark: options?.landmark || landmarkInput,
      chiefComplaint: options?.chiefComplaint?.trim() || chiefComplaintInput.trim() || undefined,
    });
  };


  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'Baby':
        return <Baby className="w-5 h-5 text-purple-500" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-blue-500" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-indigo-500" />;
      case 'Biohazard':
        return <Biohazard className="w-5 h-5 text-amber-500" />;
      default:
        return <Stethoscope className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden my-auto">
        {/* ========================================================================= */}
        {/* TOP HEADER: SIH 133 AI EMERGENCY COMMAND STRIP                            */}
        {/* ========================================================================= */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-red-600 via-red-700 to-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-red-600 flex items-center justify-center font-black text-sm shadow-inner shrink-0">
              <Zap className="w-5 h-5 fill-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  Emergency Healthcare Coordination Hub
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-900/80 border border-red-400 text-red-200">
                  Non-Diagnostic Logistics Engine
                </span>
              </div>
              <p className="text-[11px] text-red-100 flex items-center gap-2 mt-0.5">
                <span>Rural &amp; Underserved Golden Hour Preservation</span>
                <span>&bull;</span>
                <span>Multi-Criteria Facility &amp; Bed Match</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">

            <button
              onClick={() => setIsCoordinationModalOpen(false)}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              title="Close / Minimize"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Header when Session is Active */}
        {activeCoordinationSession && (
          <div className="px-5 py-2.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <button
                onClick={() => setActiveTab('war_room')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'war_room'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Emergency Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('cascade_routing')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'cascade_routing'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Cascade Routing ({activeCoordinationSession.evaluatedHospitals.length} Evaluated)</span>
              </button>

              <button
                onClick={() => setActiveTab('bed_pass')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'bed_pass'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                <Bed className="w-3.5 h-3.5" />
                <span>Bed Reservation Pass</span>
              </button>

              <button
                onClick={() => setActiveTab('live_map')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'live_map'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Dual-Point GPS Map</span>
              </button>
            </div>

            {/* Minutes Saved Badge */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{activeCoordinationSession.timeSavedMinutes} mins saved vs manual search</span>
              </span>

              <button
                onClick={() => setActiveTab('new_trigger')}
                className="text-[11px] font-bold text-stone-600 hover:text-red-700 bg-white px-2.5 py-1 rounded-xl border border-stone-300 hover:border-red-300 cursor-pointer transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Raise Another</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL BODY CONTAINER                                                      */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100/60">
          {/* ========================================================================= */}
          {/* TAB 1: NEW EMERGENCY TRIGGER FORM                                         */}
          {/* ========================================================================= */}
          {activeTab === 'new_trigger' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Dual Mode Switcher: AI Chatbot vs Predefined Categories */}
              <div className="p-1.5 rounded-2xl bg-stone-200/80 border border-stone-300 flex items-center gap-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => setTriggerMode('ai_chatbot')}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    triggerMode === 'ai_chatbot'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>{isHindi ? 'ट्राइएज चैटबॉट (बोलकर या लिखकर बताएं)' : 'Emergency Chatbot (Voice & Dialect)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTriggerMode('categories')}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    triggerMode === 'categories'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{isHindi ? 'सीधे श्रेणी चुनें (Predefined Categories)' : 'Predefined Categories (Direct)'}</span>
                </button>
              </div>

              {/* MODE 1: AI CONVERSATIONAL TRIAGE CHATBOT */}
              {triggerMode === 'ai_chatbot' ? (
                <EmergencyAIChatbot
                  patientName={patientNameInput}
                  patientVillage={patientVillageInput}
                  landmark={landmarkInput}
                  onLaunchEmergency={(params) => {
                    handleLaunchEmergency(params);
                  }}
                  onSwitchToCategories={() => setTriggerMode('categories')}
                />
              ) : (
                /* MODE 2: PREDEFINED CATEGORIES GRID & LOCATION FORM */
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Guidance Banner */}
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="text-xs leading-relaxed">
                      <strong className="font-extrabold text-red-900 block text-sm">
                        {isHindi
                          ? 'आपातकालीन सहायता अनुरोध'
                          : 'Emergency Healthcare Response Trigger'}
                      </strong>
                      <span>
                        {isHindi
                          ? 'मरीज के GPS स्थान से नजदीकी उपयुक्त अस्पताल खोजना, डॉक्टर व टेस्ट/बेड की पुष्टि करना, रिसेप्शन पर बेड आरक्षित करना और एंबुलेंस भेजना।'
                          : 'Finds the nearest suitable hospital, verifies doctor/facilities/beds, pre-reserves an emergency bed, and dispatches GPS ambulance.'}
                      </span>
                    </div>
                  </div>

                  {/* Step 1: Select Emergency Archetype */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                      <span>1. {isHindi ? 'आपातकालीन प्रकार चुनें:' : 'Select Emergency Category:'}</span>
                      <span className="text-[11px] font-normal text-stone-500">
                        6 Rural Triage Archetypes with Resource Mapping
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(Object.keys(EMERGENCY_ARCHETYPES) as EmergencyCategory[]).map((catKey) => {
                        const meta = EMERGENCY_ARCHETYPES[catKey];
                        const isSelected = selectedCategory === catKey;

                        return (
                          <div
                            key={catKey}
                            onClick={() => setSelectedCategory(catKey)}
                            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-white border-red-600 shadow-md ring-2 ring-red-500/20'
                                : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="p-2 rounded-xl bg-stone-100">
                                  {getCategoryIcon(meta.icon)}
                                </div>
                                <span
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                    meta.severity === 'CRITICAL_RED'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {meta.goldenHourWindowMinutes}m Golden Hr
                                </span>
                              </div>

                              <h4 className="font-bold text-stone-900 text-xs tracking-tight">
                                {isHindi ? meta.hindiName : meta.name}
                              </h4>

                              <div className="mt-2 text-[11px] text-stone-500 line-clamp-2">
                                {meta.typicalComplaints[0]}
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[10px]">
                              <span className="font-semibold text-stone-700">{meta.requiredBedType.toUpperCase()} Bed</span>
                              <span className="font-bold text-red-600">{meta.ambulanceTypeNeeded}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Patient Location & GPS auto-detection */}
                  <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        <span>2. {isHindi ? 'मरीज का स्थान व जीपीएस:' : 'Patient GPS & Location:'}</span>
                      </label>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <Compass className="w-3 h-3 text-emerald-600 animate-spin" />
                        <span>Live GPS Locked (22.0538° N, 88.0725° E)</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-600 block mb-1">Patient Name:</label>
                        <input
                          type="text"
                          value={patientNameInput}
                          onChange={(e) => setPatientNameInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-medium focus:ring-2 focus:ring-red-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-600 block mb-1">Village / Sector:</label>
                        <input
                          type="text"
                          value={patientVillageInput}
                          onChange={(e) => setPatientVillageInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-medium focus:ring-2 focus:ring-red-600 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-stone-600 block mb-1">
                          Local Landmark / Pickup Instructions for 108 Ambulance:
                        </label>
                        <input
                          type="text"
                          value={landmarkInput}
                          onChange={(e) => setLandmarkInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-medium focus:ring-2 focus:ring-red-600 focus:outline-none"
                          placeholder="E.g., Near Primary School & Panchayat Bhawan, Gram Sihore"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-stone-600 block mb-1">
                          Specific Symptoms / Chief Emergency Complaint:
                        </label>
                        <input
                          type="text"
                          value={chiefComplaintInput}
                          onChange={(e) => setChiefComplaintInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-medium focus:ring-2 focus:ring-red-600 focus:outline-none"
                          placeholder={EMERGENCY_ARCHETYPES[selectedCategory].typicalComplaints[0]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Trigger CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchEmergency()}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 cursor-pointer group"
                    >
                      <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>
                        {isHindi
                          ? 'आपातकालीन समन्वय शुरू करें (अस्पताल, बेड और एंबुलेंस)'
                          : 'Launch Emergency Coordination (Hospital + Bed + Ambulance)'}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="text-center text-[11px] text-stone-500 mt-2">
                      ⚡ Auto-evaluates all nearby hospitals &bull; Automatic failover if nearest lacks beds &bull; Locks bed at reception
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: 5-WAY MULTI-STAKEHOLDER WAR ROOM                                   */}
          {/* ========================================================================= */}
          {activeTab === 'war_room' && activeCoordinationSession && (
            <div className="space-y-6">
              {/* Emergency Status Banner */}
              <div className="p-4 rounded-2xl bg-stone-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                        {activeCoordinationSession.categoryMeta.severity}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">
                        {activeCoordinationSession.timestamp}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                      {isHindi
                        ? activeCoordinationSession.categoryMeta.hindiName
                        : activeCoordinationSession.categoryMeta.name}
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Patient: <strong className="text-white">{activeCoordinationSession.patientName}</strong> &bull; {activeCoordinationSession.patientLocation.address}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-stone-800/80 p-3 rounded-2xl border border-stone-700">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] uppercase font-bold text-stone-400">Locked Facility</div>
                    <div className="text-xs font-bold text-emerald-400 truncate max-w-[200px]">
                      {activeCoordinationSession.selectedHospital.hospitalName}
                    </div>
                    <div className="text-[11px] text-stone-300">
                      Bed: <span className="font-mono font-bold text-amber-400">{activeCoordinationSession.bedReservation.bedNumber}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('bed_pass')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    View Bed Pass
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* EMERGENCY COORDINATION DASHBOARD (SIH 133 SPECIFIED HIGHLIGHT CARD)       */}
              {/* ========================================================================= */}
              <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-red-950 rounded-3xl p-5 sm:p-6 text-white border-2 border-red-500/40 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center font-black text-white shadow-lg shrink-0">
                      <Zap className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                          Emergency Coordination Dashboard
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Live Active Pathway
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Multi-criteria zero-hop routing &bull; Synchronized hospital, 108 ambulance, doctor &amp; frontline escort
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveTab('bed_pass')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Bed className="w-4 h-4" />
                      <span>Bed Reservation Pass</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('live_map')}
                      className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Live Track Ambulance</span>
                    </button>
                  </div>
                </div>

                {/* 5-Point Core Real-Time Status Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {/* 1. 🚑 Ambulance: En Route */}
                  <div className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                        <Ambulance className="w-4 h-4 animate-pulse" />
                      </div>
                      <span className="text-[10px] font-bold font-mono text-stone-400">
                        {activeCoordinationSession.ambulanceDispatch.ambulanceType}
                      </span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-stone-400 pt-1">
                      108 Ambulance Unit
                    </div>
                    <div className="font-black text-sm text-red-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      <span>🚑 Ambulance: En Route</span>
                    </div>
                    <div className="text-[11px] text-stone-300 font-mono truncate">
                      {activeCoordinationSession.ambulanceDispatch.vehicleNumber} ({activeCoordinationSession.ambulanceDispatch.driverName.split(' ')[0]})
                    </div>
                  </div>

                  {/* 2. 🏥 Hospital: Bed Reserved */}
                  <div className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        Pre-Arrival Locked
                      </span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-stone-400 pt-1">
                      Casualty Reception
                    </div>
                    <div className="font-black text-sm text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>🏥 Hospital: Bed Reserved</span>
                    </div>
                    <div className="text-[11px] text-amber-300 font-mono font-bold truncate">
                      {activeCoordinationSession.bedReservation.bedNumber} ({activeCoordinationSession.selectedHospital.hospitalName.slice(0, 18)}...)
                    </div>
                  </div>

                  {/* 3. 👨‍⚕️ Doctor: Notified */}
                  <div className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-purple-300">
                        On-Duty Lead
                      </span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-stone-400 pt-1">
                      Specialist Casualty
                    </div>
                    <div className="font-black text-sm text-purple-300 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>👨‍⚕️ Doctor: Notified</span>
                    </div>
                    <div className="text-[11px] text-stone-300 truncate">
                      {activeCoordinationSession.selectedHospital.doctorName}
                    </div>
                  </div>

                  {/* 4. 👩‍⚕️ ASHA: Alerted */}
                  <div className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-300">
                        ABHA Synced
                      </span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-stone-400 pt-1">
                      Frontline Care Worker
                    </div>
                    <div className="font-black text-sm text-amber-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>👩‍⚕️ ASHA: Alerted</span>
                    </div>
                    <div className="text-[11px] text-stone-300 truncate">
                      {activeCoordinationSession.stakeholders.ashaWorker.name}
                    </div>
                  </div>

                  {/* 5. 📍 ETA: 5 min */}
                  <div className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                        <Clock className="w-4 h-4 animate-pulse" />
                      </div>
                      <span className="text-[10px] font-bold text-blue-300">
                        GPS Active
                      </span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-stone-400 pt-1">
                      Estimated Pickup
                    </div>
                    <div className="font-black text-sm text-blue-400 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>📍 ETA: {activeCoordinationSession.ambulanceDispatch.etaMinutes} min</span>
                    </div>
                    <div className="text-[11px] text-stone-300 truncate">
                      Distance: {activeCoordinationSession.selectedHospital.distanceKm} km away
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: AI CASCADE ROUTING AUDIT TRAIL                                     */}
          {/* ========================================================================= */}
          {activeTab === 'cascade_routing' && activeCoordinationSession && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    {isHindi ? 'कैस्केड रूटिंग विश्लेषण (अस्पताल चयन प्रक्रिया)' : 'Cascade Routing Decision Tree'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Evaluates candidate hospitals by proximity. If nearest facility lacks required ICU, blood bank, or doctor, automatically cascades to the next best hospital.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-red-100 text-red-800 border border-red-200">
                    Required: {activeCoordinationSession.categoryMeta.requiredBedType.toUpperCase()} Bed + {activeCoordinationSession.categoryMeta.requiredSpecialist}
                  </span>
                </div>
              </div>

              {/* Cascade Timeline */}
              <div className="space-y-3">
                {activeCoordinationSession.evaluatedHospitals.map((evalHosp, index) => {
                  const isSelected = evalHosp.hospitalId === activeCoordinationSession.selectedHospital.hospitalId;

                  return (
                    <div
                      key={evalHosp.hospitalId}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'bg-emerald-50/50 border-emerald-600 shadow-md ring-1 ring-emerald-600/30'
                          : 'bg-white border-stone-200/80 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200/60">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            #{index + 1}
                          </span>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-stone-900 text-sm">
                                {evalHosp.hospitalName}
                              </h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                                {evalHosp.tier}
                              </span>
                            </div>
                            <span className="text-xs text-stone-500">
                              {evalHosp.distanceKm} km from patient &bull; {evalHosp.travelTime}
                            </span>
                          </div>
                        </div>

                        <div>
                          {isSelected ? (
                            <span className="px-3 py-1 rounded-xl font-extrabold text-xs bg-emerald-600 text-white flex items-center gap-1.5 shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>LOCKED &amp; BED RESERVED</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl font-bold text-xs bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                              <X className="w-3.5 h-3.5 text-rose-700" />
                              <span>CASCADED (Inadequate)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Criteria Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                          <span className="text-[10px] text-stone-500 block uppercase font-bold">Doctor On Duty:</span>
                          <span className="font-bold text-stone-900 block truncate">{evalHosp.doctorName}</span>
                          <span
                            className={`text-[10px] font-bold ${
                              evalHosp.doctorStatus === 'On Duty'
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            Status: {evalHosp.doctorStatus}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                          <span className="text-[10px] text-stone-500 block uppercase font-bold">Bed Availability:</span>
                          <span className="font-bold text-stone-900 block">
                            ICU: <strong className={evalHosp.availableBeds.icu > 0 ? 'text-emerald-700' : 'text-rose-600'}>{evalHosp.availableBeds.icu}</strong>
                            {' '}&bull; O2: <strong className={evalHosp.availableBeds.oxygen > 0 ? 'text-emerald-700' : 'text-rose-600'}>{evalHosp.availableBeds.oxygen}</strong>
                          </span>
                          <span className="text-[10px] text-stone-500">Gen: {evalHosp.availableBeds.general} free</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                          <span className="text-[10px] text-stone-500 block uppercase font-bold">Blood Bank:</span>
                          <span
                            className={`font-bold block ${
                              evalHosp.bloodBankAvailable ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {evalHosp.bloodBankAvailable ? 'Licensed Blood Bank' : 'No Blood Bank'}
                          </span>
                          <span className="text-[10px] text-stone-500">Emergency Transfusion</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                          <span className="text-[10px] text-stone-500 block uppercase font-bold">24x7 Emergency:</span>
                          <span className="font-bold text-emerald-700 block">Round-the-clock</span>
                          <span className="text-[10px] text-stone-500">Casualty Ramp Active</span>
                        </div>
                      </div>

                      {/* Reasons explanation */}
                      <div className="mt-3 text-xs">
                        {isSelected ? (
                          <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 font-medium">
                            <strong>Routing Decision: </strong> {evalHosp.acceptanceReason}
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                            <strong className="text-rose-900 font-bold block text-[11px]">
                              Why this hospital was skipped (Automatic Cascade Trigger):
                            </strong>
                            {evalHosp.rejectionReasons.map((rej, rIdx) => (
                              <div key={rIdx} className="flex items-start gap-1.5 text-[11px] text-rose-800">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                                <span>{rej}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: BED RESERVATION PASS                                               */}
          {/* ========================================================================= */}
          {activeTab === 'bed_pass' && activeCoordinationSession && (
            <div className="max-w-xl mx-auto bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-200">
                    National Health Authority &bull; ABDM HFR Priority Pass
                  </span>
                  <h3 className="text-lg font-black tracking-tight mt-0.5">
                    Pre-Arrival Emergency Bed Reservation
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Token: <span className="font-mono font-bold text-amber-300">{activeCoordinationSession.bedReservation.reservationToken}</span>
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <QrCode className="w-7 h-7" />
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Hold Timer */}
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
                    <div>
                      <div className="font-bold text-xs">Bed Hold Window (45 Minutes)</div>
                      <div className="text-[11px] text-amber-800">
                        Reserved at {activeCoordinationSession.bedReservation.reservedAt}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-900 bg-amber-200 px-2 py-1 rounded-lg">
                    ACTIVE HOLD
                  </span>
                </div>

                {/* Details Table */}
                <div className="space-y-2 text-xs divide-y divide-stone-100">
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-stone-500">Destination Hospital</span>
                    <strong className="text-stone-900 text-right">{activeCoordinationSession.selectedHospital.hospitalName}</strong>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-stone-500">Reserved Bed Number</span>
                    <strong className="font-mono text-emerald-700 text-sm">{activeCoordinationSession.bedReservation.bedNumber} ({activeCoordinationSession.bedReservation.bedType.toUpperCase()})</strong>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-stone-500">Patient Full Name</span>
                    <strong className="text-stone-900">{activeCoordinationSession.patientName} (Age: {activeCoordinationSession.patientAge})</strong>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-stone-500">Casualty Desk Phone</span>
                    <strong className="text-stone-900 font-mono">{activeCoordinationSession.bedReservation.receptionDeskPhone}</strong>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-stone-500">Casualty Desk Officer</span>
                    <strong className="text-stone-900">{activeCoordinationSession.bedReservation.receptionistOnDuty}</strong>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-stone-500">Attending Specialist</span>
                    <strong className="text-stone-900">{activeCoordinationSession.selectedHospital.doctorName}</strong>
                  </div>
                </div>

                {/* QR Simulation */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-4">
                  <div className="w-16 h-16 bg-white p-2 rounded-xl border border-stone-300 flex items-center justify-center shrink-0">
                    <QrCode className="w-full h-full text-stone-800" />
                  </div>
                  <div className="text-xs text-stone-600">
                    <span className="font-bold text-stone-900 block">Instant Reception Scan</span>
                    <span>Show this pass or token at the casualty entrance. Stretcher team will admit patient without administrative delay.</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => acknowledgeBedReservation(activeCoordinationSession.bedReservation.reservationToken)}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Reception Ready</span>
                  </button>

                  <button
                    onClick={() => setIsHospitalReceptionViewOpen(true)}
                    className="px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Receptionist View
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: DUAL-POINT GPS AMBULANCE MAP                                       */}
          {/* ========================================================================= */}
          {activeTab === 'live_map' && activeCoordinationSession && (
            <div className="space-y-4">
              {/* Map Header */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    {isHindi ? '108 जीपीएस एंबुलेंस लाइव नेविगेशन (द्वि-बिंदु रूट)' : '108 Ambulance Dual-Point GPS Navigation'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Routing from <strong>{activeCoordinationSession.patientLocation.village} (Pickup)</strong> to <strong>{activeCoordinationSession.selectedHospital.hospitalName} (Drop-off)</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-red-100 text-red-800 px-3 py-1 rounded-xl border border-red-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                    ETA: {activeCoordinationSession.ambulanceDispatch.etaMinutes} mins ({activeCoordinationSession.selectedHospital.distanceKm} km)
                  </span>
                </div>
              </div>

              {/* Vector Stylized Map Canvas */}
              <div className="relative w-full h-80 sm:h-96 rounded-3xl bg-stone-900 overflow-hidden border border-stone-800 shadow-inner">
                {/* SVG Route Graphic */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>

                  {/* Topo grid lines */}
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* River line representation */}
                  <path
                    d="M 0 160 Q 200 130, 450 200 T 900 240"
                    fill="none"
                    stroke="#1e3a8a"
                    strokeWidth="12"
                    opacity="0.4"
                  />

                  {/* Emergency Route corridor */}
                  <path
                    d="M 120 280 C 220 250, 360 210, 520 180 S 720 120, 840 90"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 120 280 C 220 250, 360 210, 520 180 S 720 120, 840 90"
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="4"
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                </svg>

                {/* Patient GPS Pin */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: '15%', top: '75%' }}
                >
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px] shadow-md whitespace-nowrap mb-1">
                    📍 Patient: {activeCoordinationSession.patientLocation.village}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white animate-ping"></div>
                </div>

                {/* Moving 108 Ambulance Unit */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all duration-700"
                  style={{ left: '42%', top: '54%' }}
                >
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] shadow-lg whitespace-nowrap mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    108 Ambulance (52 km/h)
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xl border-2 border-white">
                    <Ambulance className="w-5 h-5" />
                  </div>
                </div>

                {/* Hospital Destination Pin */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: '84%', top: '22%' }}
                >
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] shadow-md whitespace-nowrap mb-1">
                    🏥 {activeCoordinationSession.selectedHospital.hospitalName}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                    H
                  </div>
                </div>

                {/* Map telemetry overlay */}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-stone-950/80 backdrop-blur-md border border-stone-700/80 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400">
                      <Ambulance className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-200">
                        {activeCoordinationSession.ambulanceDispatch.driverName} ({activeCoordinationSession.ambulanceDispatch.vehicleNumber})
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Paramedic: {activeCoordinationSession.ambulanceDispatch.paramedicName} &bull; Oxygen &amp; Stretcher Ready
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <a
                      href={`tel:${activeCoordinationSession.ambulanceDispatch.driverPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Driver</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BAR                                                         */}
        {/* ========================================================================= */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              100% Free Rural Emergency Coordination &bull; National Health Mission (NHM) &bull; ABDM Integrated
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeCoordinationSession && (
              <button
                onClick={cancelEmergencyCoordination}
                className="px-3 py-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-200 font-bold transition-colors cursor-pointer"
              >
                End Session
              </button>
            )}

            <button
              onClick={() => setIsCoordinationModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold transition-colors cursor-pointer"
            >
              Minimize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
