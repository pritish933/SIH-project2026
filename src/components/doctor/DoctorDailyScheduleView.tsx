import React, { useState, useMemo, FormEvent } from 'react';
import {
  Calendar,
  Clock,
  Video,
  UserCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  PlusCircle,
  Building,
  Radio,
  ShieldAlert,
  MapPin,
  User,
  Stethoscope,
  Coffee,
  Sparkles,
  Plus,
  X,
  Pill,
  Activity,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  User as UserType,
  DoctorAppointment,
  PatientEHR,
  TelehealthSession,
} from '../../types';

export interface DailyScheduleSlot {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  subtitle?: string;
  category:
    | 'ward_round'
    | 'physical_opd'
    | 'telehealth'
    | 'ncd_clinic'
    | 'break'
    | 'emergency_buffer'
    | 'coordination';
  status: 'completed' | 'in_progress' | 'upcoming' | 'standby';
  mode: 'Online' | 'Offline' | 'Facility_Duty';
  roomOrFacility: string;
  patientDetails?: {
    id: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    village: string;
    tokenNumber: string;
    complaint: string;
    vitalsSummary?: {
      bp?: string;
      spo2?: string;
      pulse?: string;
      sugar?: string;
    };
    ashaName?: string;
    ashaPhone?: string;
    spokeName?: string;
    priority?: 'Normal' | 'Urgent' | 'Critical';
  };
  notes?: string;
  actionAvailable?: boolean;
}

interface DoctorDailyScheduleViewProps {
  currentUser: UserType;
  appointments: DoctorAppointment[];
  patients: PatientEHR[];
  onStartTeleconsultation: (session: TelehealthSession) => void;
  onSelectPatientForEHR: (patient: PatientEHR) => void;
  onIssuePrescription: (patient: PatientEHR) => void;
  onOpenTriageModal?: () => void;
}

export function DoctorDailyScheduleView({
  currentUser,
  appointments,
  patients,
  onStartTeleconsultation,
  onSelectPatientForEHR,
  onIssuePrescription,
  onOpenTriageModal,
}: DoctorDailyScheduleViewProps) {
  // Built-in base roster for today's shift
  const [scheduleSlots, setScheduleSlots] = useState<DailyScheduleSlot[]>([
    {
      id: 'SLOT-01',
      startTime: '08:30 AM',
      endTime: '09:15 AM',
      title: 'Inpatient Ward Rounds & Casualty Handover',
      subtitle: 'Inpatient Rounds & Night-Shift Emergency Casualty Handover',
      category: 'ward_round',
      status: 'completed',
      mode: 'Facility_Duty',
      roomOrFacility: 'General Ward & Post-Op Recovery Block',
      notes: 'Checked 8 admitted post-op patients; stabilized 1 acute fever casualty.',
      actionAvailable: false,
    },
    {
      id: 'SLOT-02',
      startTime: '09:15 AM',
      endTime: '10:00 AM',
      title: 'Physical In-Clinic OPD (Walk-in Consultations)',
      subtitle: 'Physical OPD Consultations (Consultation Chamber 9)',
      category: 'physical_opd',
      status: 'completed',
      mode: 'Offline',
      roomOrFacility: 'NCD & Medicine Chamber 9 (Ground Floor)',
      patientDetails: {
        id: 'PAT-4012',
        name: 'Kailash Patel',
        age: 64,
        gender: 'Male',
        village: 'Gram Pipariya',
        tokenNumber: 'OPD-CHC-038',
        complaint: 'Type 2 Diabetes follow-up; morning fasting sugar elevated (186 mg/dL)',
        vitalsSummary: {
          bp: '138/86 mmHg',
          spo2: '98%',
          pulse: '74 bpm',
          sugar: '186 mg/dL (FBS)',
        },
        priority: 'Normal',
      },
      notes: 'Adjusted Metformin dosage; requested 14-day HbA1c lab review.',
      actionAvailable: true,
    },
    {
      id: 'SLOT-03',
      startTime: '10:00 AM',
      endTime: '10:45 AM',
      title: 'eSanjeevani Tele-Spoke Consultation (Live Active)',
      subtitle: 'eSanjeevani Rural Teleconsultation (Live Session)',
      category: 'telehealth',
      status: 'in_progress',
      mode: 'Online',
      roomOrFacility: 'Telemedicine Hub Kiosk 1 (Connected to SC Bamori)',
      patientDetails: {
        id: 'PAT-4011',
        name: 'Rameshwar Prasad',
        age: 58,
        gender: 'Male',
        village: 'Gram Sihore / SC Bamori',
        tokenNumber: 'TELE-2026-019',
        complaint: 'Persistent High Blood Pressure (140/90) & mild morning dizziness in farm',
        vitalsSummary: {
          bp: '140/90 mmHg',
          spo2: '97%',
          pulse: '78 bpm',
        },
        ashaName: 'Meena Devi (ASHA)',
        ashaPhone: '+91 98934 11209',
        spokeName: 'Ayushman Arogya Mandir SC Bamori',
        priority: 'Urgent',
      },
      notes: 'ASHA assisted reading uploaded via Bluetooth BP monitor. Patient on call waiting.',
      actionAvailable: true,
    },
    {
      id: 'SLOT-04',
      startTime: '10:45 AM',
      endTime: '11:30 AM',
      title: 'High-Risk Maternal ANC Teleconsultation',
      subtitle: 'High-Risk Pregnancy (ANC) Tele-Review & Evaluation',
      category: 'telehealth',
      status: 'upcoming',
      mode: 'Online',
      roomOrFacility: 'Maternal Tele-Desk (Spoke: SC Bankhedi)',
      patientDetails: {
        id: 'PAT-4013',
        name: 'Sunita Bai',
        age: 28,
        gender: 'Female',
        village: 'Gram Bankhedi',
        tokenNumber: 'TELE-2026-022',
        complaint: '3rd Trimester Gestation (32 weeks); Severe Anemia flag (Hb 8.4 g/dL)',
        vitalsSummary: {
          bp: '118/78 mmHg',
          spo2: '99%',
          pulse: '84 bpm',
        },
        ashaName: 'Sarita Uikey (ASHA)',
        ashaPhone: '+91 98261 55420',
        spokeName: 'Sub-Centre Bankhedi Maternal Wing',
        priority: 'Critical',
      },
      notes: 'Needs parenteral iron sucrose infusion approval and institutional delivery roadmap.',
      actionAvailable: true,
    },
    {
      id: 'SLOT-05',
      startTime: '11:30 AM',
      endTime: '12:15 PM',
      title: 'Physical OPD Walk-in & Referral Review',
      subtitle: 'Physical OPD & Secondary Referral Evaluations',
      category: 'physical_opd',
      status: 'upcoming',
      mode: 'Offline',
      roomOrFacility: 'OPD Chamber 9',
      patientDetails: {
        id: 'PAT-4014',
        name: 'Geeta Ahirwar',
        age: 42,
        gender: 'Female',
        village: 'Gram Belkheda',
        tokenNumber: 'OPD-CHC-042',
        complaint: 'Chronic lumbar spine stiffness radiating to left knee; difficulty lifting water pots',
        vitalsSummary: {
          bp: '126/82 mmHg',
          spo2: '98%',
          pulse: '72 bpm',
        },
        priority: 'Normal',
      },
      notes: 'Sub-Centre Pipariya referred for secondary orthopedic X-Ray consultation.',
      actionAvailable: true,
    },
    {
      id: 'SLOT-06',
      startTime: '12:15 PM',
      endTime: '01:00 PM',
      title: 'Inter-Facility Spoke Hub Case Coordination',
      subtitle: 'Spoke-Hub PHC Medical Officer Case Review & Coordination',
      category: 'coordination',
      status: 'upcoming',
      mode: 'Facility_Duty',
      roomOrFacility: 'District Hub Conference Link',
      notes: 'Weekly tele-case discussion with Medical Officers of PHC Pipariya, Shahpura & Bamori.',
      actionAvailable: false,
    },
    {
      id: 'SLOT-07',
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      title: 'Lunch Break & ABDM Health Records Cloud Sync',
      subtitle: 'Midday Meal Break & ABDM Digital Records Batch Sync',
      category: 'break',
      status: 'upcoming',
      mode: 'Facility_Duty',
      roomOrFacility: 'Doctors Duty Lounge',
      notes: 'Automated offline queue synchronization and NHM Ayushman dashboard data batch upload.',
      actionAvailable: false,
    },
    {
      id: 'SLOT-08',
      startTime: '02:00 PM',
      endTime: '03:15 PM',
      title: 'Afternoon Telehealth Cohort (NCD & Hypertension Hub)',
      subtitle: 'Afternoon NCD & Chronic Disease Telehealth Session',
      category: 'ncd_clinic',
      status: 'upcoming',
      mode: 'Online',
      roomOrFacility: 'Tele-Suite Room 3 (Spoke: SC Rampur)',
      patientDetails: {
        id: 'PAT-4015',
        name: 'Ramcharan Verma',
        age: 61,
        gender: 'Male',
        village: 'Gram Rampur',
        tokenNumber: 'TELE-2026-027',
        complaint: 'Grade 2 Hypertension follow-up & chronic arthritis refill',
        vitalsSummary: {
          bp: '152/96 mmHg',
          spo2: '96%',
          pulse: '80 bpm',
        },
        ashaName: 'Sunita Mehra (ASHA)',
        ashaPhone: '+91 94258 77102',
        spokeName: 'Ayushman Arogya Mandir Rampur',
        priority: 'Urgent',
      },
      notes: 'Requires Amlodipine 5mg to 10mg titration and low-salt dietary counseling.',
      actionAvailable: true,
    },
    {
      id: 'SLOT-09',
      startTime: '03:15 PM',
      endTime: '04:15 PM',
      title: '108 Rapid Emergency Standby & Casualty Window',
      subtitle: '108 Ambulance Emergency Buffer (Highway Trauma Standby)',
      category: 'emergency_buffer',
      status: 'standby',
      mode: 'Facility_Duty',
      roomOrFacility: 'Casualty Emergency Ward (Red Zone)',
      notes: 'Reserved operational buffer for sudden 108 ALS Ambulance incoming trauma casualties.',
      actionAvailable: true,
    },
    {
      id: 'SLOT-10',
      startTime: '04:15 PM',
      endTime: '05:00 PM',
      title: 'Day-End Review, ASHA Tasking & Shift Handover',
      subtitle: 'Daily Shift Review, Frontline Tasking & Evening Handover',
      category: 'coordination',
      status: 'upcoming',
      mode: 'Facility_Duty',
      roomOrFacility: 'Administrative Chamber',
      notes: 'Sign digital e-prescriptions, approve sub-centre medicine indents, and brief night officer.',
      actionAvailable: false,
    },
  ]);

  // Filters state
  const [filterMode, setFilterMode] = useState<'All' | 'Online' | 'Offline' | 'Facility_Duty'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'active_upcoming' | 'completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Slot Modal State
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [newSlotTitle, setNewSlotTitle] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('05:00 PM');
  const [newSlotEnd, setNewSlotEnd] = useState('05:30 PM');
  const [newSlotCategory, setNewSlotCategory] = useState<DailyScheduleSlot['category']>('physical_opd');
  const [newSlotMode, setNewSlotMode] = useState<DailyScheduleSlot['mode']>('Offline');
  const [newSlotRoom, setNewSlotRoom] = useState('Room 9 (Medicine OPD)');

  // Merge live user-booked appointments into schedule dynamically
  const mergedSchedule = useMemo(() => {
    // Copy existing slots
    const allSlots = [...scheduleSlots];

    // Check for user-booked appointments not in the hardcoded list
    appointments.forEach((apt) => {
      const alreadyIncluded = allSlots.some(
        (s) => s.patientDetails?.tokenNumber === apt.tokenNumber || s.id === apt.id
      );

      if (!alreadyIncluded) {
        // Create slot from appointment
        const newAptSlot: DailyScheduleSlot = {
          id: apt.id,
          startTime: apt.timeSlot ? apt.timeSlot.split('-')[0].trim() : '03:30 PM',
          endTime: apt.timeSlot && apt.timeSlot.includes('-') ? apt.timeSlot.split('-')[1].trim() : '04:00 PM',
          title: `${apt.mode === 'Online' ? 'eSanjeevani Teleconsultation' : 'Physical OPD Appointment'} - ${apt.patientName}`,
          subtitle: `${apt.mode === 'Online' ? 'eSanjeevani Teleconsultation' : 'Physical OPD Consultation'} - ${apt.patientName}`,
          category: apt.mode === 'Online' ? 'telehealth' : 'physical_opd',
          status: apt.status === 'Completed' ? 'completed' : 'upcoming',
          mode: apt.mode,
          roomOrFacility: apt.opdRoomNumber || apt.facility,
          patientDetails: {
            id: apt.patientId,
            name: apt.patientName,
            age: 52,
            gender: 'Male',
            village: 'Local Village',
            tokenNumber: apt.tokenNumber,
            complaint: apt.complaint,
            priority: 'Normal',
          },
          notes: apt.reportingInstructions || 'Booked via InstaCure Citizen App.',
          actionAvailable: true,
        };
        allSlots.push(newAptSlot);
      }
    });

    return allSlots;
  }, [scheduleSlots, appointments]);

  // Filtered slots calculation
  const filteredSlots = useMemo(() => {
    return mergedSchedule.filter((slot) => {
      // Mode filter
      if (filterMode !== 'All' && slot.mode !== filterMode) return false;

      // Status filter
      if (filterStatus === 'completed' && slot.status !== 'completed') return false;
      if (
        filterStatus === 'active_upcoming' &&
        slot.status !== 'in_progress' &&
        slot.status !== 'upcoming' &&
        slot.status !== 'standby'
      )
        return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = slot.title.toLowerCase().includes(query) || (slot.subtitle && slot.subtitle.toLowerCase().includes(query));
        const matchesPatient = slot.patientDetails?.name.toLowerCase().includes(query);
        const matchesToken = slot.patientDetails?.tokenNumber.toLowerCase().includes(query);
        const matchesVillage = slot.patientDetails?.village.toLowerCase().includes(query);
        const matchesSpoke = slot.patientDetails?.spokeName?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesPatient && !matchesToken && !matchesVillage && !matchesSpoke) {
          return false;
        }
      }

      return true;
    });
  }, [mergedSchedule, filterMode, filterStatus, searchQuery]);

  // Statistics
  const totalCount = mergedSchedule.length;
  const completedCount = mergedSchedule.filter((s) => s.status === 'completed').length;
  const inProgressCount = mergedSchedule.filter((s) => s.status === 'in_progress').length;
  const upcomingCount = mergedSchedule.filter((s) => s.status === 'upcoming').length;
  const teleCount = mergedSchedule.filter((s) => s.mode === 'Online').length;
  const opdCount = mergedSchedule.filter((s) => s.mode === 'Offline').length;

  // Handler: toggle slot status
  const handleToggleSlotStatus = (slotId: string) => {
    setScheduleSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          const nextStatus: DailyScheduleSlot['status'] =
            s.status === 'completed' ? 'upcoming' : s.status === 'in_progress' ? 'completed' : 'in_progress';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
    setActionMessage('Slot status updated successfully.');
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Handler: Start Teleconsultation
  const handleJoinCall = (slot: DailyScheduleSlot) => {
    if (!slot.patientDetails) return;

    // Find full patient if available, or construct temporary session
    const matchedPatient = patients.find(
      (p) => p.id === slot.patientDetails?.id || p.name === slot.patientDetails?.name
    ) || {
      id: slot.patientDetails.id,
      abhaId: '91-4509-2810-9941',
      name: slot.patientDetails.name,
      age: slot.patientDetails.age,
      gender: slot.patientDetails.gender,
      phone: '+91 94250 88712',
      village: slot.patientDetails.village,
      district: 'Jabalpur',
      bloodGroup: 'B+' as const,
      vitalsHistory: [],
      prescriptions: [],
      triageStatus: 'Green' as const,
      highRiskCategory: 'None' as const,
      allergies: [],
      chronicConditions: [],
      referrals: [],
      createdAt: '2026-01-01',
      lastVisitDate: 'Today',
    };

    const session: TelehealthSession = {
      id: `TC-${Math.floor(100 + Math.random() * 900)}`,
      patientId: matchedPatient.id,
      patientName: matchedPatient.name,
      patientAge: matchedPatient.age,
      patientGender: matchedPatient.gender,
      abhaId: matchedPatient.abhaId,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      doctorSpecialty: currentUser.specialization || 'General Medicine',
      scheduledTime: `${slot.startTime} - ${slot.endTime}`,
      status: 'In-Progress',
      complaint: slot.patientDetails.complaint,
      priority: slot.patientDetails.priority === 'Critical' ? 'High' : 'Medium',
      ashaAssisted: !!slot.patientDetails.ashaName,
      ashaName: slot.patientDetails.ashaName || 'Frontline Worker',
      subCentre: slot.patientDetails.spokeName || 'Spoke Sub-Centre',
      connectionQuality: 'Good',
    };

    onStartTeleconsultation(session);
  };

  // Handler: Open Patient EHR
  const handleOpenEHR = (slot: DailyScheduleSlot) => {
    if (!slot.patientDetails) return;
    const matchedPatient = patients.find(
      (p) => p.id === slot.patientDetails?.id || p.name === slot.patientDetails?.name
    );
    if (matchedPatient) {
      onSelectPatientForEHR(matchedPatient);
    } else {
      // Fallback patient
      onSelectPatientForEHR(patients[0]);
    }
  };

  // Handler: Issue Prescription
  const handleOpenRx = (slot: DailyScheduleSlot) => {
    if (!slot.patientDetails) return;
    const matchedPatient = patients.find(
      (p) => p.id === slot.patientDetails?.id || p.name === slot.patientDetails?.name
    );
    onIssuePrescription(matchedPatient || patients[0]);
  };

  // Handler: Add Custom Slot
  const handleAddCustomSlot = (e: FormEvent) => {
    e.preventDefault();
    if (!newSlotTitle.trim()) return;

    const newSlot: DailyScheduleSlot = {
      id: `CUSTOM-${Date.now()}`,
      startTime: newSlotStart,
      endTime: newSlotEnd,
      title: newSlotTitle,
      subtitle: newSlotTitle,
      category: newSlotCategory,
      status: 'upcoming',
      mode: newSlotMode,
      roomOrFacility: newSlotRoom,
      notes: 'Custom scheduled slot added by medical officer.',
      actionAvailable: newSlotMode !== 'Facility_Duty',
    };

    setScheduleSlots((prev) => [...prev, newSlot]);
    setIsAddSlotModalOpen(false);
    setNewSlotTitle('');
    setActionMessage(`Slot "${newSlotTitle}" added to today's schedule.`);
    setTimeout(() => setActionMessage(null), 3500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Real-time feedback toast */}
      {actionMessage && (
        <div className="p-3 bg-teal-900 text-white text-xs font-semibold rounded-2xl flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-stone-300 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Master Shift Header Card */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-stone-700 relative overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                <span>Today &bull; 18 Sep 2026 (Friday)</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Duty On (Live Shift)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{currentUser.name}'s Daily Clinical Schedule</span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300 pt-1">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-teal-400" />
                <span>{currentUser.facility || 'District Hospital Telemedicine Hub'}</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Shift: 08:30 AM &ndash; 05:00 PM (OPD + eSanjeevani Hub)</span>
              </span>
              <span>&bull;</span>
              <span className="text-stone-400">
                {currentUser.specialization || 'General Medicine'}
              </span>
            </div>
          </div>

          {/* Quick Schedule Management Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddSlotModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 hover:shadow-teal-900/40"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Block</span>
            </button>
            <button
              onClick={() => {
                setActionMessage('Emergency 108 Ambulance buffer window verified and primed.');
                setTimeout(() => setActionMessage(null), 3000);
              }}
              className="px-4 py-2.5 rounded-2xl bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border border-rose-500/40 font-bold text-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Reserve 108 Buffer</span>
            </button>
          </div>
        </div>

        {/* Live Slot Highlight Banner */}
        <div className="mt-5 pt-4 border-t border-stone-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-stone-400 text-[11px] uppercase tracking-wider font-semibold">
                Current Ongoing Slot:
              </span>
              <div className="font-extrabold text-white text-sm">
                10:00 AM &ndash; 10:45 AM &bull; eSanjeevani Teleconsultation &bull; Token #TELE-2026-019 (Rameshwar Prasad)
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-teal-300 bg-teal-950/60 border border-teal-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            Spoke Hub: SC Bamori &bull; ASHA Meena Devi Assisted
          </div>
        </div>
      </div>

      {/* 2. Top Stats Counter Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Total Day Slots</span>
            <Calendar className="w-4 h-4 text-teal-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-stone-900">{totalCount}</div>
          <p className="text-[11px] text-stone-500 mt-0.5">Full day scheduled activities</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">{completedCount}</div>
          <p className="text-[11px] text-emerald-700 mt-0.5">Rx dispensed &amp; logged</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">In Progress / Next</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">
            {inProgressCount + (upcomingCount > 0 ? 1 : 0)}
          </div>
          <p className="text-[11px] text-amber-700 mt-0.5">{upcomingCount} slots in queue</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200/80 bg-indigo-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-800">eSanjeevani Tele-OPD</span>
            <Video className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-700">{teleCount}</div>
          <p className="text-[11px] text-indigo-700 mt-0.5">Rural spoke video consults</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Physical In-Clinic</span>
            <Stethoscope className="w-4 h-4 text-stone-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-stone-800">{opdCount}</div>
          <p className="text-[11px] text-stone-500 mt-0.5">Room 9 OPD walk-ins</p>
        </div>
      </div>

      {/* 3. Search & Timeline Filter Strip */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, token, village, or spoke..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
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

          {/* Mode Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-stone-500 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Category:</span>
            </span>
            {[
              { id: 'All', label: 'All Slots' },
              { id: 'Online', label: '🌐 Tele-Spoke (Online)' },
              { id: 'Offline', label: '🏥 Physical OPD' },
              { id: 'Facility_Duty', label: '📋 Rounds & Duties' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  filterMode === f.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Status Filter Strip */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-stone-100 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-semibold mr-1">Status:</span>
            {[
              { id: 'All', label: 'All Status' },
              { id: 'active_upcoming', label: '⏳ In-Progress & Upcoming' },
              { id: 'completed', label: '✅ Completed Only' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setFilterStatus(s.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterStatus === s.id
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-200/70 border border-stone-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="text-stone-500 text-xs">
            Showing <strong className="text-stone-900">{filteredSlots.length}</strong> of {totalCount} total slots
          </div>
        </div>
      </div>

      {/* 4. Chronological Interactive Timeline List */}
      <div className="space-y-4">
        {filteredSlots.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-800 text-sm">No schedule slots match the selected filters</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try resetting your search query or switching between Online Telehealth and Physical OPD filters.
            </p>
            <button
              onClick={() => {
                setFilterMode('All');
                setFilterStatus('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredSlots.map((slot, index) => {
            const isCompleted = slot.status === 'completed';
            const isInProgress = slot.status === 'in_progress';
            const isStandby = slot.status === 'standby';

            return (
              <div
                key={slot.id}
                className={`bg-white rounded-3xl border transition-all relative overflow-hidden ${
                  isInProgress
                    ? 'border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                    : isCompleted
                    ? 'border-stone-200 bg-stone-50/40 opacity-85'
                    : isStandby
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-stone-200 hover:border-teal-300 hover:shadow-xs'
                }`}
              >
                {/* Left accent color strip */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-2 ${
                    isInProgress
                      ? 'bg-emerald-500 animate-pulse'
                      : isCompleted
                      ? 'bg-stone-300'
                      : slot.mode === 'Online'
                      ? 'bg-indigo-600'
                      : slot.category === 'emergency_buffer'
                      ? 'bg-rose-600'
                      : 'bg-teal-700'
                  }`}
                />

                <div className="p-5 sm:p-6 pl-6 sm:pl-7">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Time Slot & Main Title */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Time badge */}
                        <span
                          className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono flex items-center gap-1.5 ${
                            isInProgress
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isCompleted
                              ? 'bg-stone-200 text-stone-700'
                              : 'bg-stone-100 text-stone-900 border border-stone-300'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{slot.startTime} &ndash; {slot.endTime}</span>
                        </span>

                        {/* Status badge */}
                        {isInProgress && (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            <span>CURRENT ACTIVE</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-stone-200 text-stone-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Completed</span>
                          </span>
                        )}
                        {isStandby && (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>108 Emergency Standby</span>
                          </span>
                        )}

                        {/* Mode badge */}
                        {slot.mode === 'Online' && (
                          <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                            <Video className="w-3 h-3 text-indigo-600" />
                            <span>eSanjeevani Tele-Spoke</span>
                          </span>
                        )}
                        {slot.mode === 'Offline' && (
                          <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                            <Building className="w-3 h-3 text-amber-700" />
                            <span>In-Clinic Physical OPD</span>
                          </span>
                        )}
                        {slot.mode === 'Facility_Duty' && (
                          <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-stone-100 text-stone-700 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-stone-500" />
                            <span>Clinical Duty / Sync</span>
                          </span>
                        )}

                        {/* Room/Location */}
                        <span className="text-[11px] text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{slot.roomOrFacility}</span>
                        </span>
                      </div>

                      {/* Main Title */}
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                          <span>{slot.title}</span>
                        </h3>
                        {slot.subtitle && (
                          <p className="text-xs text-stone-500 mt-0.5 font-medium">
                            {slot.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Patient Details Card if available */}
                      {slot.patientDetails && (
                        <div className="mt-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                                <User className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-black text-stone-900 flex items-center gap-2">
                                  <span>{slot.patientDetails.name}</span>
                                  <span className="text-[11px] font-normal text-stone-600">
                                    ({slot.patientDetails.age}y &bull; {slot.patientDetails.gender})
                                  </span>
                                  <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-stone-200 font-bold text-teal-800">
                                    Token: {slot.patientDetails.tokenNumber}
                                  </span>
                                </div>
                                <div className="text-[11px] text-stone-500">
                                  Village: <strong>{slot.patientDetails.village}</strong>
                                  {slot.patientDetails.spokeName && (
                                    <span> &bull; Spoke: {slot.patientDetails.spokeName}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Priority tag */}
                            {slot.patientDetails.priority && (
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                  slot.patientDetails.priority === 'Critical'
                                    ? 'bg-rose-600 text-white animate-pulse'
                                    : slot.patientDetails.priority === 'Urgent'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {slot.patientDetails.priority} Priority
                              </span>
                            )}
                          </div>

                          {/* Chief Complaint */}
                          <div className="text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200/60">
                            <span className="font-bold text-stone-900">Chief Complaint: </span>
                            <span>{slot.patientDetails.complaint}</span>
                          </div>

                          {/* Vitals Summary Pill Strip */}
                          {slot.patientDetails.vitalsSummary && (
                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="font-semibold text-stone-600">Latest Vitals:</span>
                              {slot.patientDetails.vitalsSummary.bp && (
                                <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-mono font-bold">
                                  BP: {slot.patientDetails.vitalsSummary.bp}
                                </span>
                              )}
                              {slot.patientDetails.vitalsSummary.spo2 && (
                                <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-mono font-bold">
                                  SpO2: {slot.patientDetails.vitalsSummary.spo2}
                                </span>
                              )}
                              {slot.patientDetails.vitalsSummary.pulse && (
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold">
                                  Pulse: {slot.patientDetails.vitalsSummary.pulse}
                                </span>
                              )}
                              {slot.patientDetails.vitalsSummary.sugar && (
                                <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-mono font-bold">
                                  Sugar: {slot.patientDetails.vitalsSummary.sugar}
                                </span>
                              )}
                            </div>
                          )}

                          {/* ASHA Attribution */}
                          {slot.patientDetails.ashaName && (
                            <div className="text-[11px] text-teal-800 flex items-center justify-between pt-1">
                              <span className="flex items-center gap-1 font-medium">
                                <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                                <span>Assisted by: <strong>{slot.patientDetails.ashaName}</strong></span>
                              </span>
                              {slot.patientDetails.ashaPhone && (
                                <span className="font-mono text-[10px] text-stone-500">
                                  {slot.patientDetails.ashaPhone}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Clinical Duty Notes */}
                      {slot.notes && (
                        <p className="text-xs text-stone-600 italic">
                          &bull; {slot.notes}
                        </p>
                      )}
                    </div>

                    {/* Right Column: Slot Actions & Status Control */}
                    <div className="flex lg:flex-col items-end sm:items-center justify-between lg:justify-start gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                      {/* Telehealth Online Launch Button */}
                      {slot.mode === 'Online' && slot.patientDetails && (
                        <button
                          onClick={() => handleJoinCall(slot)}
                          className={`w-full px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            isInProgress
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/40 shadow-md'
                              : 'bg-indigo-700 hover:bg-indigo-800 text-white'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>{isInProgress ? 'Join Live Video Call' : 'Start Teleconsult'}</span>
                        </button>
                      )}

                      {/* Open EHR Button */}
                      {slot.patientDetails && (
                        <button
                          onClick={() => handleOpenEHR(slot)}
                          className="w-full px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-700" />
                          <span>Open Patient EHR</span>
                        </button>
                      )}

                      {/* Issue e-Rx Button */}
                      {slot.patientDetails && (
                        <button
                          onClick={() => handleOpenRx(slot)}
                          className="w-full px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Pill className="w-3.5 h-3.5 text-teal-700" />
                          <span>Issue e-Rx</span>
                        </button>
                      )}

                      {/* Toggle status */}
                      <button
                        onClick={() => handleToggleSlotStatus(slot.id)}
                        className={`w-full px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isCompleted
                            ? 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                            : isInProgress
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                        title="Click to advance slot status"
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            isCompleted ? 'text-emerald-600' : 'text-stone-400'
                          }`}
                        />
                        <span>
                          {isCompleted
                            ? 'Mark as Upcoming'
                            : isInProgress
                            ? 'Mark as Completed'
                            : 'Set as Active'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add Custom Slot / Time Block */}
      {isAddSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Add Clinical Time Block</h3>
                  <p className="text-xs text-stone-500">Add custom consultation or administrative window</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddSlotModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomSlot} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Slot Title / Purpose</label>
                <input
                  type="text"
                  required
                  value={newSlotTitle}
                  onChange={(e) => setNewSlotTitle(e.target.value)}
                  placeholder="e.g. VIP In-Clinic Review, SAM Nutrition Assessment, Tea Break"
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={newSlotStart}
                    onChange={(e) => setNewSlotStart(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">End Time</label>
                  <input
                    type="text"
                    value={newSlotEnd}
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Mode</label>
                  <select
                    value={newSlotMode}
                    onChange={(e) => setNewSlotMode(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  >
                    <option value="Offline">Physical (In-Clinic OPD)</option>
                    <option value="Online">Online (eSanjeevani Telehealth)</option>
                    <option value="Facility_Duty">Facility Duty / Rounds</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category</label>
                  <select
                    value={newSlotCategory}
                    onChange={(e) => setNewSlotCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  >
                    <option value="physical_opd">Physical OPD</option>
                    <option value="telehealth">Telehealth Hub</option>
                    <option value="ward_round">Ward Rounds</option>
                    <option value="ncd_clinic">NCD Special Clinic</option>
                    <option value="break">Official Break</option>
                    <option value="emergency_buffer">Emergency Standby</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Chamber / Room / Location</label>
                <input
                  type="text"
                  value={newSlotRoom}
                  onChange={(e) => setNewSlotRoom(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-xs"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
