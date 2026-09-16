import { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { DOCTOR_PROFILES } from '../../data/appointmentData';
import { DoctorProfile, DoctorAppointment, AppointmentMode } from '../../types';
import { OpdTokenSlipModal } from './OpdTokenSlipModal';
import {
  Calendar,
  Clock,
  Video,
  Hospital,
  MapPin,
  CheckCircle2,
  CalendarPlus,
  Filter,
  UserCheck,
  Stethoscope,
  ChevronRight,
  AlertCircle,
  Award,
  Sparkles,
  Search,
  Building,
  Phone,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Radio,
  PowerOff,
  AlertTriangle,
  Star,
} from 'lucide-react';

const COMMON_SYMPTOMS_EN = [
  'Fever & Body Ache',
  'High Blood Pressure',
  'Knee & Joint Pain',
  'Diabetes / Sugar Check',
  'Chest Heaviness',
  'Maternal / Pregnancy Check',
  'Childhood Cough & Cold',
  'Weakness & Anemia',
];

const COMMON_SYMPTOMS_HI = [
  'बुखार व बदन दर्द',
  'उच्च रक्तचाप',
  'घुटने व जोड़ों में दर्द',
  'शुगर जांच व दवा',
  'सीने में भारीपन',
  'गर्भावस्था जांच',
  'बच्चों की खांसी-जुकाम',
  'कमजोरी व खून की कमी',
];

export function DoctorAppointmentSection() {
  const {
    currentUser,
    patients,
    appointments,
    bookAppointment,
    cancelAppointment,
    startTeleconsultation,
    telehealthQueue,
    getDoctorAvailability,
    doctorAvailabilityMap,
    feedbacks,
    openFeedbackModal,
    language,
  } = useApp();

  const isHindi = language === 'hi';
  const commonSymptoms = isHindi ? COMMON_SYMPTOMS_HI : COMMON_SYMPTOMS_EN;

  const currentPatient =
    patients.find((p) => p.id === currentUser.id || p.abhaId === currentUser.abhaId) || patients[0];

  const [activeTab, setActiveTab] = useState<'book' | 'my-appointments'>('book');
  const [selectedMode, setSelectedMode] = useState<AppointmentMode>('Online');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [onlyAvailableNow, setOnlyAvailableNow] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile>(DOCTOR_PROFILES[0]);
  const [selectedDate, setSelectedDate] = useState<'Today' | 'Tomorrow'>('Today');
  const [selectedSlot, setSelectedSlot] = useState<string>(DOCTOR_PROFILES[0].todayAvailableSlots[0] || '10:30 AM');
  const [complaint, setComplaint] = useState<string>('Routine health review and blood pressure checkup');
  
  // Available doctors count
  const availableNowCount = DOCTOR_PROFILES.filter(
    (d) => getDoctorAvailability(d.id).status === 'Available'
  ).length;

  // Modal states
  const [selectedAppointmentForSlip, setSelectedAppointmentForSlip] = useState<DoctorAppointment | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [bookingSuccessToast, setBookingSuccessToast] = useState<{
    show: boolean;
    token: string;
    mode: AppointmentMode;
    doctorName: string;
  } | null>(null);

  // Filtered doctors list
  const filteredDoctors = DOCTOR_PROFILES.filter((doc) => {
    // Mode filter
    const matchesMode = doc.modesAvailable.includes(selectedMode);
    // Specialty filter
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    // Availability filter
    const docAvail = getDoctorAvailability(doc.id);
    const matchesAvailability = !onlyAvailableNow || docAvail.status === 'Available';
    return matchesMode && matchesSpecialty && matchesAvailability;
  });

  // Handle booking submission
  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newApt = bookAppointment({
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      abhaId: currentPatient.abhaId,
      patientPhone: currentPatient.phone,
      mode: selectedMode,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorSpecialty: selectedDoctor.specialty,
      doctorQualification: selectedDoctor.qualifications,
      facility: selectedDoctor.facility,
      opdRoomNumber: selectedDoctor.opdRoomNumber,
      appointmentDate: selectedDate === 'Today' ? 'Today (Live Queue)' : 'Tomorrow, 17 Sep 2026',
      timeSlot: selectedSlot,
      complaint: complaint.trim() || 'General Health Consultation',
      fee: '₹0 Free (Govt NHM / Ayushman)',
      reportingInstructions:
        selectedMode === 'Online'
          ? 'Join the online video room 5 minutes prior from mobile or ASHA sub-centre kiosk. Have your previous vitals/prescription ready.'
          : `Please report at ${selectedDoctor.facility}, ${selectedDoctor.opdRoomNumber}. Show this digital token slip at Gate 1 OPD counter.`,
    });

    setBookingSuccessToast({
      show: true,
      token: newApt.tokenNumber,
      mode: selectedMode,
      doctorName: selectedDoctor.name,
    });

    setSelectedAppointmentForSlip(newApt);
    setIsSlipOpen(true);
    setActiveTab('my-appointments');

    setTimeout(() => {
      setBookingSuccessToast(null);
    }, 6000);
  };

  const handleSelectDoctor = (doc: DoctorProfile) => {
    setSelectedDoctor(doc);
    const slots = selectedDate === 'Today' ? doc.todayAvailableSlots : doc.tomorrowAvailableSlots;
    if (slots && slots.length > 0) {
      setSelectedSlot(slots[0]);
    }
  };

  const handleDateChange = (date: 'Today' | 'Tomorrow') => {
    setSelectedDate(date);
    const slots = date === 'Today' ? selectedDoctor.todayAvailableSlots : selectedDoctor.tomorrowAvailableSlots;
    if (slots && slots.length > 0) {
      setSelectedSlot(slots[0]);
    }
  };

  const handleJoinVideoCallForAppointment = (apt: DoctorAppointment) => {
    // Find matching telehealth session or start on-the-fly
    const existingSession = telehealthQueue.find(
      (s) => s.patientId === apt.patientId || s.abhaId === apt.abhaId
    );
    if (existingSession) {
      startTeleconsultation(existingSession);
    } else {
      startTeleconsultation({
        id: apt.id,
        patientId: apt.patientId,
        patientName: apt.patientName,
        patientAge: 58,
        patientGender: 'Male',
        abhaId: apt.abhaId,
        doctorId: apt.doctorId,
        doctorName: apt.doctorName,
        doctorSpecialty: apt.doctorSpecialty,
        scheduledTime: apt.timeSlot,
        status: 'Waiting',
        complaint: apt.complaint,
        priority: 'Medium',
        ashaAssisted: true,
        subCentre: apt.facility,
        connectionQuality: 'Good',
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden space-y-0">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-teal-950 text-white border-b border-stone-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-400" />
                <span>Ayushman Bharat &bull; ABDM Verified</span>
              </span>
              <span className="text-[11px] text-stone-400 hidden sm:inline">
                National Health Portal (e-Sanjeevani &amp; Hospital OPD)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <CalendarPlus className="w-6 h-6 text-teal-400" />
              <span>Doctor Appointment Booking</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
              Book free appointments with government specialists for <strong>Online Video Teleconsultation</strong> or <strong>In-Person Hospital OPD Visit</strong> with instant token slip.
            </p>
          </div>

          {/* Navigation Tab Buttons */}
          <div className="flex items-center bg-stone-800/80 p-1.5 rounded-2xl border border-stone-700/80 shrink-0 self-start lg:self-center">
            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'book'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <CalendarPlus className="w-4 h-4" />
              <span>{isHindi ? 'नया अपॉइंटमेंट' : 'Book Doctor'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('my-appointments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'my-appointments'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{isHindi ? 'मेरे अपॉइंटमेंट्स' : 'My Appointments'}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {appointments.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Banner Notification */}
      {bookingSuccessToast && (
        <div className="bg-emerald-50 border-b border-emerald-200 p-4 px-6 flex items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold">
                Appointment Booked Successfully! Token #{bookingSuccessToast.token}
              </span>
              <p className="text-[11px] text-emerald-800">
                {bookingSuccessToast.mode === 'Online'
                  ? `Online video consultation queued with ${bookingSuccessToast.doctorName}.`
                  : `Offline hospital token generated for ${bookingSuccessToast.doctorName}.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setBookingSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: BOOK NEW APPOINTMENT */}
      {activeTab === 'book' && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Step 1: Select Consultation Mode (Online vs Offline) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700">Step 1</span>
                <h3 className="text-sm sm:text-base font-bold text-stone-900">
                  {isHindi ? 'परामर्श का प्रकार चुनें' : 'Select Consultation Type'}
                </h3>
              </div>
              <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                Both modes are 100% Free under Ayushman Bharat (NHM)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Online Teleconsultation */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('Online');
                  const firstOnline = DOCTOR_PROFILES.find((d) => d.modesAvailable.includes('Online'));
                  if (firstOnline) handleSelectDoctor(firstOnline);
                }}
                className={`p-4 sm:p-5 rounded-2xl text-left border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  selectedMode === 'Online'
                    ? 'border-teal-700 bg-teal-50/50 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        selectedMode === 'Online'
                          ? 'bg-teal-700 text-white'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 text-base">
                          Online Teleconsultation
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                          e-Sanjeevani OPD
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 font-medium mt-0.5">
                        {isHindi
                          ? 'ऑनलाइन वीडियो कंसल्टेशन (घर या उपकेंद्र से)'
                          : 'Online video consultation from home or sub-centre'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      selectedMode === 'Online'
                        ? 'bg-teal-700 border-teal-700 text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {selectedMode === 'Online' && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" /> Instant Video Link &bull; 2G/3G Ready
                  </span>
                  <span className="font-bold text-stone-700">Digital Rx on ABHA</span>
                </div>
              </button>

              {/* Option B: Offline In-Person Hospital Visit */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('Offline');
                  const firstOffline = DOCTOR_PROFILES.find((d) => d.modesAvailable.includes('Offline'));
                  if (firstOffline) handleSelectDoctor(firstOffline);
                }}
                className={`p-4 sm:p-5 rounded-2xl text-left border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  selectedMode === 'Offline'
                    ? 'border-emerald-700 bg-emerald-50/50 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        selectedMode === 'Offline'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      <Hospital className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 text-base">
                          Offline In-Person Hospital Visit
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Digital OPD Pass
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 font-medium mt-0.5">
                        {isHindi
                          ? 'अस्पताल ओपीडी में शारीरिक जांच (PHC / CHC / जिला अस्पताल)'
                          : 'In-person physical OPD exam (PHC / CHC / District Hospital)'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      selectedMode === 'Offline'
                        ? 'bg-emerald-700 border-emerald-700 text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {selectedMode === 'Offline' && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Skip Long Physical OPD Queues
                  </span>
                  <span className="font-bold text-stone-700">Digital Gate Token</span>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Department / Specialty Filter */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700">Step 2</span>
                <h3 className="text-sm sm:text-base font-bold text-stone-900">
                  {isHindi ? 'विभाग चुनें' : 'Filter by Medical Department'}
                </h3>
              </div>
              <span className="text-xs text-stone-500">
                Showing {filteredDoctors.length} available specialist(s)
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {/* Quick Filter: Live Available Now Only */}
              <button
                type="button"
                onClick={() => setOnlyAvailableNow(!onlyAvailableNow)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                  onlyAvailableNow
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-2 ring-emerald-400/40'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{isHindi ? '🟢 केवल लाइव उपलब्ध' : '🟢 Live Available Now'} ({availableNowCount})</span>
              </button>

              <div className="h-5 w-px bg-stone-200 shrink-0" />

              {[
                { label: isHindi ? 'सभी विभाग' : 'All Departments', value: 'All' },
                { label: isHindi ? 'सामान्य रोग' : 'General Medicine', value: 'General' },
                { label: isHindi ? 'महिला एवं प्रसूति' : 'Gynecology & Obstetrics', value: 'Obstetrics' },
                { label: isHindi ? 'शिशु रोग' : 'Pediatrics & Child Health', value: 'Pediatrics' },
                { label: isHindi ? 'हड्डी व जोड़' : 'Orthopedics & Joint Care', value: 'Orthopedics' },
                { label: isHindi ? 'हृदय व शुगर' : 'Cardiology & Diabetes', value: 'Cardiology' },
                { label: isHindi ? 'आयुर्वेद व प्राकृतिक' : 'AYUSH Medicine', value: 'AYUSH' },
              ].map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedSpecialty(cat.value)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                    selectedSpecialty === cat.value
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Doctor Selection & Booking Form (Two Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Doctors Directory List (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700">Step 3</span>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900">
                    {isHindi ? 'विशेषज्ञ डॉक्टर चुनें' : 'Select Specialist Doctor'}
                  </h3>
                </div>
                <span className="text-[11px] text-stone-500">
                  Click card to inspect queue & availability
                </span>
              </div>

              <div className="space-y-3">
                {filteredDoctors.map((doc) => {
                  const isSelected = selectedDoctor.id === doc.id;
                  const availableSlots =
                    selectedDate === 'Today' ? doc.todayAvailableSlots : doc.tomorrowAvailableSlots;
                  const docAvail = getDoctorAvailability(doc.id);

                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectDoctor(doc)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50/40 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/40'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="relative shrink-0">
                          <img
                            src={doc.avatarUrl}
                            alt={doc.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shadow-xs"
                          />
                          {/* Live presence indicator badge on avatar */}
                          <span
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                              docAvail.status === 'Available'
                                ? 'bg-emerald-500'
                                : docAvail.status === 'Busy'
                                ? 'bg-amber-500'
                                : 'bg-stone-400'
                            }`}
                          >
                            {docAvail.status === 'Available' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            )}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-extrabold text-stone-900 text-base">
                                  {doc.name}
                                </h4>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                                  Govt M.O.
                                </span>

                                {/* Live Availability Status Badge */}
                                {docAvail.status === 'Available' && (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 shadow-2xs">
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                    </span>
                                    <span>Available Now</span>
                                  </span>
                                )}
                                {docAvail.status === 'Busy' && (
                                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <span>Busy &bull; Wait ~{docAvail.estimatedWaitMins || 12}m</span>
                                  </span>
                                )}
                                {docAvail.status === 'Offline' && (
                                  <span className="text-[10px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200 flex items-center gap-1 shadow-2xs">
                                    <PowerOff className="w-2.5 h-2.5 text-stone-400" />
                                    <span>Offline</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-teal-800">
                                {doc.specialty} &bull; <span className="font-normal text-stone-600">{doc.qualifications}</span>
                              </p>
                              {isHindi && (
                                <p className="text-[11px] text-stone-500 mt-0.5">
                                  {doc.hindiSpecialty}
                                </p>
                              )}

                              {/* Status Note & Virtual Spoke Hubs */}
                              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                                {docAvail.statusNote && (
                                  <span className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded font-medium">
                                    {docAvail.statusNote}
                                  </span>
                                )}
                                {docAvail.coveredSpokes && docAvail.coveredSpokes.length > 0 && (
                                  <span className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80 font-medium">
                                    Hubbed: {docAvail.coveredSpokes.slice(0, 2).join(', ')}
                                    {docAvail.coveredSpokes.length > 2 && ` +${docAvail.coveredSpokes.length - 2} more`}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 justify-end">
                                ★ {doc.rating}
                              </span>
                              <span className="text-[10px] text-stone-500 mt-0.5 block">
                                {doc.experienceYears}+ Yrs Exp
                              </span>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
                            <div className="flex items-center gap-1 text-[11px] text-stone-700">
                              <Building className="w-3.5 h-3.5 text-stone-400" />
                              <span className="font-medium truncate max-w-[240px]">{doc.facility}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {doc.modesAvailable.map((m) => (
                                <span
                                  key={m}
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                    m === 'Online'
                                      ? 'bg-teal-100 text-teal-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {m === 'Online' ? '🌐 Video' : '🏥 Hospital'}
                                </span>
                              ))}
                              <span className="text-[10px] font-bold text-emerald-700 bg-stone-100 px-2 py-0.5 rounded">
                                {availableSlots.length} Slots Open
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredDoctors.length === 0 && (
                  <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <p className="text-sm font-semibold">No specialists found matching this filter.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSpecialty('All');
                        setSelectedMode('Online');
                      }}
                      className="text-xs text-teal-700 font-bold underline cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Booking Panel (5 cols) */}
            <div className="lg:col-span-5 bg-stone-50 rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="border-b border-stone-200 pb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700">Step 4 &bull; Finalize</span>
                <h3 className="text-base font-extrabold text-stone-900">
                  Confirm Booking Details
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedMode === 'Online' ? '🌐 Online Teleconsultation' : '🏥 Offline Hospital OPD Visit'} with {selectedDoctor.name}
                </p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                {/* 1. Date Selector */}
                <div>
                  <label className="block font-bold text-stone-800 mb-1.5">
                    {isHindi ? 'दिन चुनें' : 'Select Appointment Day'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDateChange('Today')}
                      className={`p-2.5 rounded-xl font-bold text-center border transition-all cursor-pointer ${
                        selectedDate === 'Today'
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <div>{isHindi ? 'आज (Today)' : 'Today'}</div>
                      <div className="text-[10px] font-normal opacity-90">Live Queue &bull; Immediate</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDateChange('Tomorrow')}
                      className={`p-2.5 rounded-xl font-bold text-center border transition-all cursor-pointer ${
                        selectedDate === 'Tomorrow'
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <div>{isHindi ? 'कल (Tomorrow)' : 'Tomorrow'}</div>
                      <div className="text-[10px] font-normal opacity-90">17 Sep 2026</div>
                    </button>
                  </div>
                </div>

                {/* 2. Slot Selector */}
                <div>
                  <label className="block font-bold text-stone-800 mb-1.5 flex items-center justify-between">
                    <span>{isHindi ? 'समय चुनें' : 'Select Time Slot'}</span>
                    <span className="text-[11px] font-normal text-stone-500">
                      Chamber: {selectedDoctor.opdRoomNumber}
                    </span>
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {(selectedDate === 'Today'
                      ? selectedDoctor.todayAvailableSlots
                      : selectedDoctor.tomorrowAvailableSlots
                    ).map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border text-center ${
                          selectedSlot === slot
                            ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                            : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Patient Details Card */}
                <div className="p-3 bg-white rounded-2xl border border-stone-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">Beneficiary Patient:</span>
                    <span className="font-bold text-stone-900">{currentPatient.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">ABHA Health ID:</span>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                      {currentPatient.abhaId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">Contact Mobile:</span>
                    <span className="font-mono text-stone-700">{currentPatient.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-100">
                    <span className="text-stone-500">Consultation Fee:</span>
                    <span className="font-bold text-emerald-700">₹0 Free (Govt Scheme)</span>
                  </div>
                </div>

                {/* 4. Symptoms / Chief Complaint */}
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    {isHindi ? 'मुख्य लक्षण / समस्या' : 'Symptoms or Reason for Consultation'}
                  </label>
                  <textarea
                    rows={2}
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Describe symptoms, e.g. continuous headache for 3 days, joint swelling..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    required
                  />

                  {/* Quick Symptom Chips */}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {commonSymptoms.slice(0, 4).map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => setComplaint(sym)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-medium transition-colors cursor-pointer"
                      >
                        + {sym}
                      </button>
                    ))}
                  </div>
                </div>

              {/* Mode Confirmation & Blind-Call Prevention Banner */}
              {selectedMode === 'Online' ? (
                getDoctorAvailability(selectedDoctor.id).status === 'Offline' ? (
                  /* BLIND CALL PREVENTED ALERT */
                  <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Blind Call Prevented &bull; Doctor Currently Offline</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-900">
                      Dr. {selectedDoctor.name} is currently off-duty or in procedure (
                      <span className="font-semibold">
                        {getDoctorAvailability(selectedDoctor.id).statusNote || 'Duty Off'}
                      </span>
                      ). Direct online calling is disabled to prevent unanswered ringing.
                    </p>
                    <div className="text-[10px] text-amber-800 font-semibold bg-amber-100/90 p-2.5 rounded-xl border border-amber-200 leading-relaxed">
                      💡 <strong>Recommended Action:</strong> Choose another doctor marked with{' '}
                      <span className="text-emerald-800 font-bold bg-emerald-100 px-1 rounded">🟢 Available Now</span>{' '}
                      above, or switch to "Offline In-Person Hospital Visit" mode to book an OPD visit.
                    </div>
                  </div>
                ) : getDoctorAvailability(selectedDoctor.id).status === 'Busy' ? (
                  /* DOCTOR BUSY / WAITING ROOM */
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-950 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Doctor In Active Consultation</span>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                        Queue Active
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-700">
                      Dr. {selectedDoctor.name} is consulting another rural patient (
                      {getDoctorAvailability(selectedDoctor.id).statusNote || 'OPD Rounds'}). Submitting will place
                      your consultation into the <strong>Telehealth Virtual Waiting Room</strong>.
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-amber-800 font-medium pt-1 border-t border-amber-200">
                      <span>Estimated Queue Wait:</span>
                      <span className="font-bold font-mono text-xs text-amber-900">
                        ~{getDoctorAvailability(selectedDoctor.id).estimatedWaitMins || 12} mins
                      </span>
                    </div>
                  </div>
                ) : (
                  /* DOCTOR AVAILABLE */
                  <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-300 text-teal-950 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-teal-900">
                        <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                        <span>Doctor Live on Tele-Duty &bull; Instant Ready</span>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        0 Min Wait
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-900">
                      {getDoctorAvailability(selectedDoctor.id).statusNote || 'Ready for instant video consultation'}.
                      Direct connection ready without queue delay.
                    </p>
                  </div>
                )
              ) : (
                /* OFFLINE IN-PERSON OPD PASS */
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Hospital className="w-4 h-4 text-emerald-700" />
                    <span>Offline In-Person Hospital Visit Mode</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    A digital gate pass will be generated for {selectedDoctor.facility}. Skip the queue and present
                    this token at the OPD counter.
                  </p>
                </div>
              )}

              {/* Submit Action Button with Blind Call Protection */}
              {selectedMode === 'Online' &&
              getDoctorAvailability(selectedDoctor.id).status === 'Offline' ? (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 px-4 rounded-xl bg-stone-200 text-stone-500 font-bold text-xs border border-stone-300 cursor-not-allowed flex items-center justify-center gap-2 shadow-none"
                  >
                    <PowerOff className="w-4 h-4 text-stone-400" />
                    <span>🚫 Doctor Offline — Blind Call Prevented (Choose Live Doctor)</span>
                  </button>
                  <p className="text-[10px] text-center text-stone-500">
                    Direct calling is disabled while doctor is off-duty. Please choose an Available specialist above.
                  </p>
                </div>
              ) : (
                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    selectedMode === 'Online'
                      ? getDoctorAvailability(selectedDoctor.id).status === 'Busy'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-teal-700 hover:bg-teal-800'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  {selectedMode === 'Online' ? (
                    getDoctorAvailability(selectedDoctor.id).status === 'Busy' ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>
                          Join Virtual Waiting Room (~
                          {getDoctorAvailability(selectedDoctor.id).estimatedWaitMins || 12}m Wait)
                        </span>
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" />
                        <span>Confirm & Start Instant Teleconsultation</span>
                      </>
                    )
                  ) : (
                    <>
                      <CalendarPlus className="w-4 h-4" />
                      <span>Confirm & Generate Hospital OPD Pass</span>
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
      )}

      {/* TAB 2: MY BOOKED APPOINTMENTS */}
      {activeTab === 'my-appointments' && (
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
            <div>
              <h3 className="text-base font-extrabold text-stone-900">
                {isHindi ? 'मेरे सभी डॉक्टर अपॉइंटमेंट्स' : 'My Doctor Appointments'}
              </h3>
              <p className="text-xs text-stone-500">
                Track both Online Video Consultations and Offline Hospital OPD Gate Passes
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Book New Appointment</span>
            </button>
          </div>

          {/* Appointments Grid / List */}
          <div className="space-y-3">
            {appointments.map((apt) => {
              const isOnline = apt.mode === 'Online';
              const isCancelled = apt.status === 'Cancelled';

              return (
                <div
                  key={apt.id}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                    isCancelled
                      ? 'border-stone-200 bg-stone-50 opacity-60'
                      : isOnline
                      ? 'border-teal-200 bg-teal-50/30'
                      : 'border-emerald-200 bg-emerald-50/30'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Mode Badge & Doctor / Token Info */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          isOnline ? 'bg-teal-700 text-white' : 'bg-emerald-700 text-white'
                        }`}
                      >
                        {isOnline ? <Video className="w-6 h-6" /> : <Hospital className="w-6 h-6" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isOnline
                                ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isOnline ? '🌐 Online Video Consult' : '🏥 Offline In-Person OPD'}
                          </span>

                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-stone-900 text-white">
                            {apt.tokenNumber}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCancelled
                                ? 'bg-stone-200 text-stone-600'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-stone-900 text-base">
                          {apt.doctorName}
                        </h4>

                        <p className="text-xs text-stone-600 font-medium">
                          {apt.doctorSpecialty} &bull; <span className="text-stone-500">{apt.facility}</span>
                        </p>

                        <div className="text-xs text-stone-700 flex flex-wrap items-center gap-3 pt-1">
                          <span className="flex items-center gap-1 font-semibold text-stone-800">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            <span>{apt.appointmentDate}</span>
                          </span>

                          <span className="flex items-center gap-1 font-mono font-bold text-stone-900">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span>{apt.timeSlot}</span>
                          </span>

                          <span className="flex items-center gap-1 text-[11px] text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span>{apt.opdRoomNumber}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                      {/* Action 1: For Online, Join Video Call */}
                      {isOnline && !isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleJoinVideoCallForAppointment(apt)}
                          className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Video Call Now</span>
                        </button>
                      )}

                      {/* Action 2: View Printable Token Slip */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAppointmentForSlip(apt);
                          setIsSlipOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs border border-stone-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>{isOnline ? 'View Appointment Pass' : '📄 View OPD Token Slip'}</span>
                      </button>

                      {/* Action 3: Rate & Quality Feedback */}
                      {!isCancelled && (() => {
                        const existingFeedback = feedbacks.find(
                          (f) => f.consultationId === apt.id || f.consultationId === apt.tokenNumber
                        );
                        return existingFeedback ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span>★ {existingFeedback.overallRating}.0 Rated</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              openFeedbackModal({
                                doctorId: apt.doctorId,
                                doctorName: apt.doctorName,
                                consultationId: apt.id,
                                patientName: apt.patientName,
                                subCentre: apt.facility,
                              })
                            }
                            className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-amber-300 shadow-2xs"
                            title="Rate doctor consultation quality, network clarity, and medicine understanding"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                            <span>{isHindi ? 'रेटिंग दें' : 'Rate & Review'}</span>
                          </button>
                        );
                      })()}

                      {/* Action 4: Cancel Appointment */}
                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to cancel appointment ${apt.tokenNumber}?`)) {
                              cancelAppointment(apt.id);
                            }
                          }}
                          className="px-2.5 py-2 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-800 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Complaint snippet */}
                  <div className="mt-3 pt-2.5 border-t border-stone-200/60 text-xs text-stone-600 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-stone-800">Reason: </span>
                      <span>{apt.complaint}</span>
                    </div>
                    <span className="text-[11px] text-stone-500 hidden sm:inline">
                      Booked for: <strong className="text-stone-700">{apt.patientName}</strong> ({apt.abhaId})
                    </span>
                  </div>
                </div>
              );
            })}

            {appointments.length === 0 && (
              <div className="p-12 text-center text-stone-500 bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
                <Calendar className="w-10 h-10 text-stone-400 mx-auto" />
                <p className="text-sm font-semibold">You have no booked appointments yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('book')}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold cursor-pointer"
                >
                  Book Your First Doctor Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable OPD Token / Pass Modal */}
      <OpdTokenSlipModal
        appointment={selectedAppointmentForSlip}
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        onJoinCall={
          selectedAppointmentForSlip?.mode === 'Online'
            ? () => handleJoinVideoCallForAppointment(selectedAppointmentForSlip)
            : undefined
        }
      />
    </div>
  );
}
