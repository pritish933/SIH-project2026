import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Video,
  FileText,
  Clock,
  QrCode,
  MapPin,
  Pill,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  Building2,
  Heart,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  PhoneCall,
  Activity,
  CalendarPlus,
  Info,
  Ambulance,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Award,
  Zap,
  Bot,
  MessageCircle,
} from 'lucide-react';
import { CurrentHealthStatusCard } from '../health/CurrentHealthStatusCard';
import { ManualHealthUpdateModal } from '../health/ManualHealthUpdateModal';
import { AiReportScannerModal } from '../health/AiReportScannerModal';
import { HealthCheckupHistorySection } from '../health/HealthCheckupHistorySection';
import { VitalRecord, DoctorAppointment } from '../../types';
import { MedicineAvailabilityCard } from '../pharmacy/MedicineAvailabilityCard';
import { AttachedHealthReportsSection } from '../records/AttachedHealthReportsSection';
import { DoctorAppointmentSection } from '../appointments/DoctorAppointmentSection';
import { OpdTokenSlipModal } from '../appointments/OpdTokenSlipModal';
import { PatientSidebar, PatientSectionId } from './PatientSidebar';
import { NearbyHospitalsSection } from './NearbyHospitalsSection';
import { GovtSchemesSection } from './GovtSchemesSection';
import { PatientHelpChatbot } from './PatientHelpChatbot';

export function PatientDashboard() {
  const {
    currentUser,
    patients,
    telehealthQueue,
    startTeleconsultation,
    setSelectedPatientForEHR,
    setIsMedicineModalOpen,
    triggerEmergencySOS,
    activeAmbulanceRide,
    setIsAmbulanceModalOpen,
    appointments,
    isCoordinationModalOpen,
    setIsCoordinationModalOpen,
    activeCoordinationSession,
    language,
    t,
  } = useApp();

  // Find EHR record for current patient or default to Rameshwar Prasad
  const currentPatient =
    patients.find((p) => p.id === currentUser.id || p.abhaId === currentUser.abhaId) || patients[0];

  // Active appointments for this patient
  const patientAppointments = appointments.filter(
    (apt) => apt.patientId === currentPatient.id || apt.abhaId === currentPatient.abhaId
  );

  // Active section controlled by the Sidebar
  const [activeSection, setActiveSection] = useState<PatientSectionId>('overview');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedAppointmentForSlip, setSelectedAppointmentForSlip] = useState<DoctorAppointment | null>(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  // Listen for global navigation events (e.g. from Navbar or action buttons)
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<PatientSectionId>;
      if (customEvent.detail) {
        setActiveSection(customEvent.detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('navigate-patient-section', handleNavigate);
    return () => window.removeEventListener('navigate-patient-section', handleNavigate);
  }, []);

  // Most recent health status record
  const latestVitals: VitalRecord = currentPatient.vitalsHistory[0] || {
    date: new Date().toISOString().split('T')[0],
    lastUpdatedFormatted: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    bloodPressureSys: 140,
    bloodPressureDia: 90,
    pulseRate: 80,
    spO2: 97,
    temperatureF: 98.4,
    bloodSugarMgDl: 160,
    bloodSugarType: 'Random',
    cholesterolMgDl: 210,
    creatinineMgDl: 1.2,
    hemoglobinGdl: 12.8,
    weightKg: 68.0,
    sourceType: 'ASHA_Doorstep',
    conductorName: currentPatient.assignedAshaWorker || 'Meena Devi (ASHA Sangini)',
  };

  const hasElevatedVitals =
    (latestVitals.bloodPressureSys && latestVitals.bloodPressureSys >= 140) ||
    (latestVitals.bloodSugarMgDl && latestVitals.bloodSugarMgDl >= 140) ||
    (latestVitals.cholesterolMgDl && latestVitals.cholesterolMgDl >= 200);

  const handleRequestAshaVisit = () => {
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Main Sidebar + Content Grid for Desktop */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sidebar Navigation (Desktop Sticky) */}
        <aside className="w-full md:w-72 lg:w-80 shrink-0 md:sticky md:top-20">
          <PatientSidebar
            activeSection={activeSection}
            onSelectSection={(section) => {
              setActiveSection(section);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentPatient={currentPatient}
            counts={{
              appointments: patientAppointments.length,
              prescriptions: currentPatient.prescriptions.length,
              referrals: currentPatient.referrals.length,
              history: currentPatient.vitalsHistory.length,
              hasActiveAmbulance: Boolean(activeAmbulanceRide),
              hasElevatedVitals: Boolean(hasElevatedVitals),
            }}
            onOpenAmbulanceModal={() => setIsAmbulanceModalOpen(true)}
          />
        </aside>

        {/* Right Dynamic Section Content Container */}
        <div className="flex-1 w-full min-w-0 space-y-6">
          {/* SECTION 1: OVERVIEW & ABHA DIGITAL CARD */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Greeting */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> ABDM Verified Health Account
                    </span>
                    <span className="text-xs text-stone-500 font-medium">Ayushman Bharat Digital Mission</span>
                  </div>
                  <h1 className="text-2xl font-black text-stone-900">
                    Namaste, {currentPatient.name}
                  </h1>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Sub-Centre: <span className="font-semibold text-stone-800">{currentPatient.registeredFacility}</span> &bull; Village: <span className="font-semibold text-stone-800">{currentPatient.village}</span>
                  </p>
                </div>
              </div>

              {/* Quick Dashboard Guide Banner (InstaCure Chatbot for Navigation) */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-900 via-stone-900 to-emerald-950 border border-teal-700/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">
                        InstaCure Chatbot
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                        {language === 'hi' ? 'डैशबोर्ड गाइड' : 'Dashboard Guide'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-0.5">
                      {language === 'hi'
                        ? 'डैशबोर्ड समझने में कोई परेशानी? पूछें: "मुझे अस्पताल जाना है", "डॉक्टर दिखाना है", "सरकारी योजनाएँ" आदि।'
                        : language === 'bn'
                        ? 'ড্যাশবোর্ড বুঝতে কোনো অসুবিধা? জিজ্ঞেস করুন: "হাসপাতালে যেতে চাই", "ডাক্তার দেখাবো", "সরকারি প্রকল্প" ইত্যাদি।'
                        : 'Confused where to go? Ask: "I need a hospital", "Consult online doctor", "Govt health schemes" etc.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-patient-help-chatbot'))}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {language === 'hi'
                      ? 'InstaCure चैटबॉट से पूछें'
                      : language === 'bn'
                      ? 'InstaCure চ্যাটবটকে জিজ্ঞেস করুন'
                      : 'Ask InstaCure Chatbot'}
                  </span>
                </button>
              </div>

              {/* Digital Ayushman ABHA Health Card & Frontline Care Banner */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                {/* Official Ayushman Bharat ABHA Card */}
                <div className="md:col-span-7 bg-gradient-to-br from-emerald-800 via-teal-900 to-stone-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-700/50 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-emerald-500/10 pointer-events-none blur-xl" />

                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-emerald-600/40 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-black text-sm text-emerald-200 border border-white/10">
                        AB
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm tracking-wide text-white">Ayushman Bharat</h3>
                        <p className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">
                          Health Account (ABHA Card)
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" /> Verified Citizen
                    </span>
                  </div>

                  {/* Patient Identity info */}
                  <div className="flex items-center gap-4 my-2">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center text-emerald-200">
                      <CreditCard className="w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-white truncate">{currentPatient.name}</h2>
                      <p className="text-xs text-emerald-200 mt-0.5">
                        {currentPatient.age} Yrs &bull; {currentPatient.gender} &bull; Blood: <span className="font-bold text-white">{currentPatient.bloodGroup}</span>
                      </p>
                      <p className="text-xs text-emerald-300 mt-1 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" /> {currentPatient.village}, {currentPatient.district}
                      </p>
                    </div>
                  </div>

                  {/* ABHA Number & Barcode QR */}
                  <div className="mt-4 pt-3 border-t border-emerald-600/30 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-emerald-300 uppercase font-semibold">ABHA Address / Number</div>
                      <div className="text-base sm:text-lg font-mono font-bold tracking-wider text-emerald-100">
                        {currentPatient.abhaId}
                      </div>
                      <div className="text-[10px] text-emerald-300/80 mt-0.5 truncate max-w-xs">
                        Assigned Sub-Centre: {currentPatient.registeredFacility}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white text-stone-900 shrink-0 shadow-md">
                      <QrCode className="w-10 h-10" />
                    </div>
                  </div>
                </div>

                {/* Village Frontline ASHA Sangini & Quick Help */}
                <div className="md:col-span-5 bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Village Healthcare Support</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-stone-600">
                        Assigned Frontline ASHA:
                        <div className="text-sm font-bold text-stone-900 mt-0.5">
                          {currentPatient.assignedAshaWorker || 'Meena Devi (ASHA Sangini)'}
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Your village ASHA worker carries a Point-of-Care (PoC) screening kit for doorstep BP, Blood Sugar, and SpO2 checks.
                      </p>
                    </div>
                  </div>

                  {bookingSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Request sent to ASHA Sangini! She will visit with testing kit.</span>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={handleRequestAshaVisit}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer border border-emerald-200 text-center flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-700" />
                      <span>Request ASHA Doorstep Health Visit</span>
                    </button>
                    <button
                      onClick={() => setIsAmbulanceModalOpen(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5"
                    >
                      <Ambulance className="w-4 h-4 text-white" />
                      <span>Dispatch 108 Emergency Ambulance</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Uber-Style Live Ambulance Card (if active ride exists) */}
              {activeAmbulanceRide && (
                <div className="p-4 rounded-3xl bg-stone-900 text-white border border-stone-700 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                        {activeAmbulanceRide.status === 'Arrived' ? 'AMBULANCE ARRIVED AT YOUR LOCATION' : 'LIVE 108 AMBULANCE DISPATCH'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-stone-800 px-2.5 py-1 rounded-md text-stone-300">
                      ID: {activeAmbulanceRide.id}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-800/60 p-3 rounded-2xl border border-stone-700">
                    <div>
                      <div className="text-lg font-black text-white">
                        {activeAmbulanceRide.status === 'Arrived'
                          ? 'Arrived at Patient Village!'
                          : `Arriving in ~${activeAmbulanceRide.etaMinutes} minutes`}
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">
                        Distance remaining: {activeAmbulanceRide.distanceRemainingKm} km &bull; Pickup: {activeAmbulanceRide.pickupLocation.village}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-xl bg-amber-400 text-stone-900 font-mono font-black text-sm border border-stone-800">
                        {activeAmbulanceRide.vehicleNumber}
                      </div>
                      <button
                        onClick={() => setIsAmbulanceModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Open Live Map &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 6 Interactive Portal Summary Cards (Direct access to other sections) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Card 1: Doctor Appointments */}
                <div
                  onClick={() => setActiveSection('appointments')}
                  className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      {patientAppointments.length} Active
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm group-hover:text-teal-700 transition-colors">
                      Doctor Appointments
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Online Video Calls &amp; Hospital OPD Token Passes
                    </p>
                  </div>
                  <div className="text-xs font-bold text-teal-700 flex items-center gap-1 pt-1 border-t border-stone-100">
                    <span>View &amp; Book &rarr;</span>
                  </div>
                </div>

                {/* Card 2: Search Hospitals Near Me */}
                <div
                  onClick={() => setActiveSection('hospitals')}
                  className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group space-y-3 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      8 in Haldia
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm group-hover:text-emerald-700 transition-colors">
                      Hospitals Near Me
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      HIT Campus &bull; Live Google Maps &amp; Bed Tracker
                    </p>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 pt-1 border-t border-stone-100">
                    <span>Search Facilities &rarr;</span>
                  </div>
                </div>

                {/* Card 3: Govt Health Schemes (NEW) */}
                <div
                  onClick={() => setActiveSection('schemes')}
                  className="bg-white rounded-3xl p-5 border border-amber-200 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group space-y-3 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      9+ Schemes
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm group-hover:text-amber-800 transition-colors">
                      Govt Health Schemes
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      PM-JAY, Swasthya Sathi, 70+ Vay Vandana &amp; Free Meds
                    </p>
                  </div>
                  <div className="text-xs font-bold text-amber-800 flex items-center gap-1 pt-1 border-t border-stone-100">
                    <span>Check Eligibility &rarr;</span>
                  </div>
                </div>

                {/* Card 4: Current Vitals */}
                <div
                  onClick={() => setActiveSection('vitals')}
                  className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${hasElevatedVitals
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                        }`}
                    >
                      {hasElevatedVitals ? 'Needs Care' : 'Normal'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm group-hover:text-emerald-700 transition-colors">
                      Health Vitals
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      BP: {latestVitals.bloodPressureSys}/{latestVitals.bloodPressureDia} mmHg &bull; Sugar: {latestVitals.bloodSugarMgDl} mg/dL
                    </p>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 pt-1 border-t border-stone-100">
                    <span>Check Biometrics &rarr;</span>
                  </div>
                </div>

                {/* Card 5: Prescriptions & Meds */}
                <div
                  onClick={() => setActiveSection('prescriptions')}
                  className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition-colors">
                      <Pill className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {currentPatient.prescriptions.length} Records
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm group-hover:text-blue-700 transition-colors">
                      Prescriptions &amp; Meds
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Digital dosage, Sub-Centre &amp; PHC stock checker
                    </p>
                  </div>
                  <div className="text-xs font-bold text-blue-700 flex items-center gap-1 pt-1 border-t border-stone-100">
                    <span>View Medicines &rarr;</span>
                  </div>
                </div>

                {/* Card 6: Referrals */}
                <div
                  onClick={() => setActiveSection('referrals')}
                  className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
                      <Building className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {currentPatient.referrals.length} Hospital
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm group-hover:text-purple-700 transition-colors">
                      Hospital Referrals
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Track CHC &amp; District Hospital clinical transfers
                    </p>
                  </div>
                  <div className="text-xs font-bold text-purple-700 flex items-center gap-1 pt-1 border-t border-stone-100">
                    <span>Track Pipeline &rarr;</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: SEARCH HOSPITALS NEAR ME & LIVE BEDS */}
          {activeSection === 'hospitals' && <NearbyHospitalsSection />}

          {/* SECTION: GOVERNMENT HEALTH SCHEMES */}
          {activeSection === 'schemes' && <GovtSchemesSection />}

          {/* SECTION 2: DOCTOR APPOINTMENTS & OPD PASSES */}
          {activeSection === 'appointments' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Section Header */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> e-Sanjeevani &amp; Hospital OPD
                    </span>
                    <span className="text-xs text-stone-500">Government Free Consultation</span>
                  </div>
                  <h2 className="text-2xl font-black text-stone-900">
                    Doctor Appointments &amp; OPD Passes
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Book free online video teleconsultation with medical specialists or download in-person hospital OPD tokens.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-bold text-xs">
                    {patientAppointments.length} Active {patientAppointments.length === 1 ? 'Booking' : 'Bookings'}
                  </span>
                </div>
              </div>

              {/* Active Bookings List */}
              {patientAppointments.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-700" />
                      <span>Your Scheduled Appointments</span>
                    </h3>
                    <span className="text-xs text-stone-500 font-medium">ABDM Digital Queue</span>
                  </div>

                  <div className="space-y-3">
                    {patientAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={`p-5 rounded-2xl border space-y-3 transition-colors ${apt.mode === 'Online'
                            ? 'bg-teal-50/40 border-teal-200'
                            : 'bg-purple-50/40 border-purple-200'
                          }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 ${apt.mode === 'Online'
                                    ? 'bg-teal-200/80 text-teal-900'
                                    : 'bg-purple-200/80 text-purple-900'
                                  }`}
                              >
                                {apt.mode === 'Online' ? (
                                  <>
                                    <Video className="w-3.5 h-3.5" /> Online Video Call (e-Sanjeevani)
                                  </>
                                ) : (
                                  <>
                                    <Building className="w-3.5 h-3.5" /> In-Person Hospital OPD Counter
                                  </>
                                )}
                              </span>
                              <span className="text-xs font-mono font-bold bg-white px-2.5 py-0.5 rounded-md border border-stone-200 text-stone-800">
                                Token: {apt.tokenNumber}
                              </span>
                            </div>
                            <div className="text-lg font-bold text-stone-900">{apt.doctorName}</div>
                            <div className="text-xs text-stone-600">
                              {apt.doctorSpecialty} &bull; {apt.facility}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-xs font-bold text-stone-800 flex items-center gap-1 sm:justify-end">
                              <Clock className="w-3.5 h-3.5 text-teal-600" />
                              <span>{apt.date} &bull; {apt.timeSlot}</span>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md mt-1 inline-block">
                              Status: {apt.status}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700">
                          <span className="font-semibold text-stone-900">Reason / Complaint: </span>
                          {apt.complaint}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <span className="text-xs text-stone-500">
                            {apt.mode === 'Online'
                              ? 'Connect using 2G/4G video link below'
                              : `Show Token Slip at ${apt.facility} registration counter`}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedAppointmentForSlip(apt);
                                setIsSlipModalOpen(true);
                              }}
                              className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-stone-600" />
                              <span>Print / View Token Slip</span>
                            </button>

                            {apt.mode === 'Online' && (
                              <button
                                onClick={() => {
                                  const session = telehealthQueue.find(
                                    (s) => s.patientId === currentPatient.id
                                  ) || {
                                    id: apt.id,
                                    patientId: apt.patientId,
                                    patientName: apt.patientName,
                                    patientAge: currentPatient.age,
                                    patientGender: currentPatient.gender,
                                    abhaId: apt.abhaId,
                                    doctorId: apt.doctorId,
                                    doctorName: apt.doctorName,
                                    doctorSpecialty: apt.doctorSpecialty,
                                    scheduledTime: apt.timeSlot,
                                    complaint: apt.complaint,
                                    priority: 'Medium',
                                    ashaAssisted: true,
                                    ashaName: currentPatient.assignedAshaWorker || 'Meena Devi',
                                    subCentre: apt.facility,
                                    status: 'Active Call',
                                    connectionQuality: 'Good',
                                  };
                                  startTeleconsultation(session as any);
                                }}
                                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Video className="w-4 h-4" />
                                <span>Join Consultation Video Call</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Interactive Booking Engine */}
              <DoctorAppointmentSection />
            </div>
          )}

          {/* SECTION 3: CURRENT HEALTH VITALS & BIOMETRICS */}
          {activeSection === 'vitals' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" /> PoC Biometrics Screening
                    </span>
                    <span className="text-xs text-stone-500">Synced with ASHA &amp; Sub-Centre</span>
                  </div>
                  <h2 className="text-2xl font-black text-stone-900">
                    Current Health Status &amp; Biometrics
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Real-time physiological indicators recorded during doorstep health screenings and Sub-Centre visits.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsManualModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <span>+ Update Vitals</span>
                  </button>
                  <button
                    onClick={() => setIsScannerModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lab Report Scanner</span>
                  </button>
                </div>
              </div>

              {/* Comprehensive Health Status Card */}
              <CurrentHealthStatusCard
                latestVitals={latestVitals}
                onOpenManualModal={() => setIsManualModalOpen(true)}
                onOpenScannerModal={() => setIsScannerModalOpen(true)}
              />

              {/* Clinical Guidelines / Range Reference Note */}
              <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 text-xs text-stone-600 space-y-2">
                <div className="font-bold text-stone-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-stone-700" />
                  <span>Indian Public Health Standards (IPHS) Vital Reference Ranges</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                  <div className="p-3 bg-white rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-800 block">Blood Pressure (BP)</span>
                    <span>Normal: &lt; 120/80 mmHg</span>
                    <span className="block text-amber-700">Pre-HTN: 120-139 / 80-89</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-800 block">Blood Glucose (Sugar)</span>
                    <span>Fasting: 70 - 100 mg/dL</span>
                    <span className="block text-amber-700">Post-Prandial: &lt; 140 mg/dL</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-800 block">Oxygen Saturation (SpO2)</span>
                    <span>Normal: 95% - 100%</span>
                    <span className="block text-red-700">Alert: &lt; 94% (Requires O2)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PRESCRIPTIONS & MEDICINE STOCK */}
          {activeSection === 'prescriptions' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5" /> Essential Drugs List (EDL)
                    </span>
                    <span className="text-xs text-stone-500">Government Free Pharmacy</span>
                  </div>
                  <h2 className="text-2xl font-black text-stone-900">
                    My Prescriptions &amp; Medicines
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Digital prescriptions issued by public health medical officers with real-time stock availability check at your Sub-Centre and PHC.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPatientForEHR(currentPatient)}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full EHR Record</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                </div>
              </div>

              {/* Prescriptions List */}
              {currentPatient.prescriptions.length > 0 ? (
                <div className="space-y-5">
                  {currentPatient.prescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Diagnosis</div>
                          <h3 className="text-lg font-bold text-stone-900">{rx.diagnosis}</h3>
                          <div className="text-xs text-stone-500 mt-0.5">
                            Prescribed by <span className="font-semibold text-stone-800">{rx.doctorName}</span> &bull; {rx.facility} &bull; Date: {rx.date}
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                          {rx.isDispensed ? 'Dispensed at Sub-Centre' : 'Free Government Supply'}
                        </span>
                      </div>

                      {/* Medicines List with Availability & Where to Collect */}
                      <div className="space-y-3 pt-1">
                        <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">Prescribed Medications</div>
                        {rx.medicines.map((med) => (
                          <div
                            key={med.id}
                            className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200 text-xs space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                              <div>
                                <div className="font-bold text-base text-stone-900">{med.name}</div>
                                <div className="text-xs text-stone-600 mt-0.5">
                                  Dosage: <span className="font-bold text-blue-700">{med.dosage}</span> &bull; Timing:{' '}
                                  <span className="font-semibold text-stone-800">{med.timing}</span> &bull; Frequency:{' '}
                                  <span className="font-semibold text-stone-800">{med.frequency}</span>
                                </div>
                              </div>
                              <div className="text-xs text-stone-700 bg-white px-3 py-1.5 rounded-xl font-mono self-start sm:self-auto border border-stone-200 shadow-2xs">
                                Duration: {med.durationDays} days &bull; {med.instructions}
                              </div>
                            </div>

                            {/* Where can you get this medicine & is it currently available */}
                            <MedicineAvailabilityCard
                              medicineName={med.name}
                              dosage={med.dosage}
                              facility={currentPatient.registeredFacility}
                              assignedAsha={currentPatient.assignedAshaWorker}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span><strong className="text-stone-900">Lifestyle Advice:</strong> {rx.dietaryAdvice}</span>
                        <button
                          onClick={() => setIsMedicineModalOpen(true)}
                          className="text-xs font-bold text-blue-700 hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
                        >
                          <Pill className="w-3.5 h-3.5" />
                          <span>View Essential Drugs List &rarr;</span>
                        </button>
                      </div>

                      {/* Attached Diagnostic Reports Reviewed by Doctor for this Prescription */}
                      <AttachedHealthReportsSection
                        reports={rx.attachedReports}
                        prescriptionId={rx.id}
                        doctorName={rx.doctorName}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xs text-center text-stone-500 text-xs space-y-3">
                  <p>No active prescriptions on file for this ABHA account.</p>
                </div>
              )}
            </div>
          )}

          {/* SECTION 5: CHECKUP & LAB HISTORY */}
          {activeSection === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Longitudinal Health Record
                    </span>
                    <span className="text-xs text-stone-500">Audit Trail of Care</span>
                  </div>
                  <h2 className="text-2xl font-black text-stone-900">
                    Diagnostic Checkup &amp; Lab History
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Complete historical log of vitals screening, ASHA visits, diagnostic test results, and scanned reports.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsManualModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold cursor-pointer transition-colors"
                  >
                    + Record New Vitals
                  </button>
                  <button
                    onClick={() => setIsScannerModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Scan Lab Report</span>
                  </button>
                </div>
              </div>

              {/* Full Health History Component */}
              <HealthCheckupHistorySection
                vitalsHistory={currentPatient.vitalsHistory}
                onOpenManualModal={() => setIsManualModalOpen(true)}
                onOpenScannerModal={() => setIsScannerModalOpen(true)}
              />
            </div>
          )}

          {/* SECTION 6: HOSPITAL REFERRALS */}
          {activeSection === 'referrals' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" /> Tiered Referral Pathway
                    </span>
                    <span className="text-xs text-stone-500">Sub-Centre &rarr; PHC &rarr; CHC &rarr; DH</span>
                  </div>
                  <h2 className="text-2xl font-black text-stone-900">
                    Inter-Facility Referral Tracking
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Track doctor-initiated hospital transfers, ambulance coordination, specialist appointments, and bed reservation status.
                  </p>
                </div>

                <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 font-bold text-xs">
                  {currentPatient.referrals.length} Active {currentPatient.referrals.length === 1 ? 'Referral' : 'Referrals'}
                </span>
              </div>

              {/* Educational Referral Protocol Banner */}
              <div className="p-4 bg-purple-50/70 rounded-3xl border border-purple-200 text-xs text-purple-950 flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-purple-900">National Health Protocol: </span>
                  Under the Ayushman Bharat public health framework, clinical referrals are issued by treating Doctors or CHOs when secondary or tertiary hospital intervention is required. This pipeline guarantees priority admission, pre-allocated specialist beds, and free 108 ambulance transit.
                </div>
              </div>

              {currentPatient.referrals.length > 0 ? (
                <div className="space-y-4">
                  {currentPatient.referrals.map((ref) => (
                    <div
                      key={ref.id}
                      className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                        <div>
                          <div className="text-base font-bold text-stone-900 flex items-center gap-2">
                            <span>{ref.fromFacility}</span>
                            <span className="text-stone-400">&rarr;</span>
                            <span className="text-purple-700">{ref.toFacility}</span>
                          </div>
                          <div className="text-xs text-stone-600 mt-0.5">
                            Specialty: <span className="font-bold text-stone-800">{ref.specialtyRequired}</span> &bull; Urgency:{' '}
                            <span
                              className={`font-bold ${ref.urgency === 'Immediate' ? 'text-red-600' : 'text-stone-800'
                                }`}
                            >
                              {ref.urgency}
                            </span>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 self-start sm:self-auto">
                          {ref.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* 4-Stage Step Progress Tracker */}
                      <div>
                        <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2">
                          Referral Progress Pipeline
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="p-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-2xs">
                            1. Sub-Centre Triage
                          </div>
                          <div
                            className={`p-2.5 rounded-xl font-bold ${ref.status !== 'Initiated'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                              }`}
                          >
                            2. PHC Cleared
                          </div>
                          <div
                            className={`p-2.5 rounded-xl font-bold ${ref.status === 'Specialist_Review' || ref.status === 'Completed'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                              }`}
                          >
                            3. Transit &amp; Review
                          </div>
                          <div
                            className={`p-2.5 rounded-xl font-bold ${ref.status === 'Completed'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                              }`}
                          >
                            4. Specialist Consult
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700">
                        <span className="font-semibold text-stone-900">Clinical Referral Reason: </span>
                        {ref.reason}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xs text-center text-stone-500 text-xs space-y-2">
                  <p>No active hospital referral transfers at this time.</p>
                  <p className="text-stone-400">If your condition requires higher hospital care, your consulting doctor will initiate an official referral here.</p>
                </div>
              )}
            </div>
          )}

          {/* SECTION 7: 108 EMERGENCY & SOS */}
          {activeSection === 'emergency' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-700 via-red-800 to-stone-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white flex items-center gap-1">
                      <Ambulance className="w-3.5 h-3.5" /> 24x7 National Emergency
                    </span>
                    <span className="text-xs text-red-200">National Health Mission (NHM)</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    108 Emergency Ambulance &amp; Village SOS
                  </h2>
                  <p className="text-xs text-red-100 mt-0.5">
                    Fast response ambulance dispatch with GPS telemetry, live tracking, and frontline ASHA escort.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setIsCoordinationModalOpen(true)}
                    className="px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-white/20"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Emergency Voice &amp; Chat</span>
                  </button>
                  <button
                    onClick={() => setIsCoordinationModalOpen(true)}
                    className="px-4 py-3 rounded-2xl bg-white hover:bg-stone-100 text-red-700 text-xs font-black shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-red-600 fill-red-600" />
                    <span>{activeCoordinationSession ? 'Emergency Dashboard' : 'Emergency Healthcare Hub'}</span>
                  </button>
                  <button
                    onClick={() => setIsAmbulanceModalOpen(true)}
                    className="px-4 py-3 rounded-2xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border border-red-500/40"
                  >
                    <Ambulance className="w-4 h-4 text-white" />
                    <span>Manual 108 Form</span>
                  </button>
                </div>
              </div>

              {/* Uber-Style Live Ambulance Card (Active Ride) */}
              {activeAmbulanceRide ? (
                <div className="bg-stone-900 text-white rounded-3xl p-6 border border-stone-700 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="text-sm font-black text-emerald-400 uppercase tracking-wider">
                        {activeAmbulanceRide.status === 'Arrived' ? 'AMBULANCE ARRIVED AT PICKUP LOCATION' : 'ACTIVE 108 AMBULANCE DISPATCH'}
                      </span>
                    </div>
                    <span className="text-xs font-mono bg-stone-800 px-3 py-1 rounded-lg text-stone-300 border border-stone-700">
                      ID: {activeAmbulanceRide.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-800/80 p-5 rounded-2xl border border-stone-700">
                    <div>
                      <div className="text-xs uppercase font-bold text-stone-400">Estimated Arrival Time</div>
                      <div className="text-2xl font-black text-white mt-0.5">
                        {activeAmbulanceRide.status === 'Arrived'
                          ? 'Arrived!'
                          : `~${activeAmbulanceRide.etaMinutes} mins`}
                      </div>
                      <div className="text-xs text-stone-400 mt-1">
                        {activeAmbulanceRide.distanceRemainingKm} km remaining
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase font-bold text-stone-400">Assigned Vehicle</div>
                      <div className="text-lg font-mono font-bold text-amber-400 mt-0.5">
                        {activeAmbulanceRide.vehicleNumber}
                      </div>
                      <div className="text-xs text-stone-400 mt-1">
                        Type: {activeAmbulanceRide.ambulanceType.replace('_', ' ')} (Equipped with O2 &amp; Defibrillator)
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase font-bold text-stone-400">Pilot / Driver</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {activeAmbulanceRide.driver.name}
                      </div>
                      <div className="text-xs text-amber-400 font-bold mt-1">
                        ★ {activeAmbulanceRide.driver.rating} Rating &bull; Ph: {activeAmbulanceRide.driver.phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-stone-400">
                      Destination Hospital: <span className="font-bold text-white">{activeAmbulanceRide.destinationHospital}</span>
                    </span>
                    <button
                      onClick={() => setIsAmbulanceModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Open Live GPS Map View &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <h3 className="font-bold text-base text-stone-900">Emergency Medical Support</h3>
                    <span className="text-xs text-stone-500">Free Government Service</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-900 to-stone-900 text-white border border-red-700/60 shadow-md space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">Emergency Voice &amp; Dialect Triage</div>
                            <div className="text-[11px] text-red-200">Multilingual Chatbot</div>
                          </div>
                        </div>
                        <p className="text-xs text-stone-300">
                          अपनी भाषा या बोली में बताएं। ट्राइएज इंजन लक्षणों को प्रोसेस करके सही अस्पताल, बेड व एंबुलेंस भेजेगा।
                        </p>
                      </div>
                      <button
                        onClick={() => setIsCoordinationModalOpen(true)}
                        className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Start Voice / Chat Triage</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm">
                            108
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-sm">108 Emergency Ambulance</div>
                            <div className="text-[11px] text-stone-600">Accidents, Heart Attacks, Severe Illness</div>
                          </div>
                        </div>
                        <p className="text-xs text-stone-600">
                          Dial 108 for round-the-clock emergency medical response with paramedics and basic/advanced life support.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAmbulanceModalOpen(true)}
                        className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        Book 108 Ambulance (GPS Tracked)
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-sm">Village ASHA Sangini</div>
                            <div className="text-[11px] text-stone-600">Immediate Doorstep Assistance</div>
                          </div>
                        </div>
                        <p className="text-xs text-stone-600">
                          Request your village health worker ({currentPatient.assignedAshaWorker || 'Meena Devi'}) to visit with point-of-care emergency kit.
                        </p>
                      </div>
                      <button
                        onClick={handleRequestAshaVisit}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        Request ASHA Doorstep Visit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* National Helpline Directory */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-stone-900">National Health &amp; Emergency Helplines</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="text-lg font-black text-red-600">108</div>
                    <div className="text-xs font-bold text-stone-800 mt-0.5">Emergency Medical</div>
                    <div className="text-[10px] text-stone-500">Ambulance &amp; Trauma</div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="text-lg font-black text-pink-600">102</div>
                    <div className="text-xs font-bold text-stone-800 mt-0.5">Janani Shishu (JSSK)</div>
                    <div className="text-[10px] text-stone-500">Maternal &amp; Child</div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="text-lg font-black text-teal-600">104</div>
                    <div className="text-xs font-bold text-stone-800 mt-0.5">Health Advice line</div>
                    <div className="text-[10px] text-stone-500">Medical Guidance</div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="text-lg font-black text-blue-600">112</div>
                    <div className="text-xs font-bold text-stone-800 mt-0.5">National Emergency</div>
                    <div className="text-[10px] text-stone-500">Police / Fire / Health</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Health Update Modal (ASHA visit or patient self entry) */}
      <ManualHealthUpdateModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        patientId={currentPatient.id}
        patientName={currentPatient.name}
        defaultAshaWorker={currentPatient.assignedAshaWorker || 'Meena Devi (ASHA Sangini)'}
        latestVitals={latestVitals}
      />

      {/* AI Diagnostic Lab Report Scanner Modal (Gemini OCR) */}
      <AiReportScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        patientId={currentPatient.id}
        patientName={currentPatient.name}
      />

      {/* OPD Token Slip Printable Modal */}
      <OpdTokenSlipModal
        appointment={selectedAppointmentForSlip}
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        onJoinCall={
          selectedAppointmentForSlip?.mode === 'Online'
            ? () => {
              setIsSlipModalOpen(false);
              const session = telehealthQueue.find(
                (s) => s.patientId === currentPatient.id
              ) || {
                id: selectedAppointmentForSlip.id,
                patientId: selectedAppointmentForSlip.patientId,
                patientName: selectedAppointmentForSlip.patientName,
                patientAge: currentPatient.age,
                patientGender: currentPatient.gender,
                abhaId: selectedAppointmentForSlip.abhaId,
                doctorId: selectedAppointmentForSlip.doctorId,
                doctorName: selectedAppointmentForSlip.doctorName,
                doctorSpecialty: selectedAppointmentForSlip.doctorSpecialty,
                scheduledTime: selectedAppointmentForSlip.timeSlot,
                complaint: selectedAppointmentForSlip.complaint,
                priority: 'Medium',
                ashaAssisted: true,
                ashaName: currentPatient.assignedAshaWorker || 'Meena Devi',
                subCentre: selectedAppointmentForSlip.facility,
                status: 'Active Call',
                connectionQuality: 'Good',
              };
              startTeleconsultation(session as any);
            }
            : undefined
        }
      />

      {/* Dashboard Help & Guidance Chatbot (Strictly No AI labeling) */}
      <PatientHelpChatbot
        activeSection={activeSection}
        onNavigateSection={(sec) => setActiveSection(sec)}
        onOpenEmergencyModal={() => setIsCoordinationModalOpen(true)}
        patientName={currentPatient.name}
      />
    </div>
  );
}
