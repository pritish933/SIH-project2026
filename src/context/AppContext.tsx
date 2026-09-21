import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  LanguageCode,
  ConnectivityStatus,
  PatientEHR,
  TelehealthSession,
  MedicineStock,
  Prescription,
  Referral,
  VitalRecord,
  AmbulanceRide,
  DoctorAppointment,
  DoctorAvailabilityStatus,
  DoctorAvailabilityInfo,
  ConsultationFeedback,
  DoctorQualityMetrics,
  FollowUpTask,
  EmergencyCoordinationSession,
  EmergencyCategory,
  EmergencyBedReservation,
} from '../types';
import {
  createEmergencySession,
  EMERGENCY_ARCHETYPES,
} from '../utils/emergencyCoordinationEngine';
import {
  DEMO_USERS,
  INITIAL_PATIENTS,
  INITIAL_TELEHEALTH_SESSIONS,
  INITIAL_MEDICINE_STOCK,
} from '../data/mockData';
import {
  INITIAL_DEMO_RIDE,
  DEFAULT_AMBULANCE_DRIVERS,
} from '../data/ambulanceData';
import { INITIAL_APPOINTMENTS, DOCTOR_PROFILES } from '../data/appointmentData';
import { INITIAL_FEEDBACKS } from '../data/feedbackData';
import { INITIAL_FOLLOW_UP_TASKS } from '../data/followUpData';
import { HospitalFacility, NEARBY_HOSPITALS_DATA } from '../data/hospitalData';
import { getTranslation } from '../utils/translations';

interface AppContextType {
  currentUser: User;
  activeRole: UserRole;
  language: LanguageCode;
  connectivity: ConnectivityStatus;
  offlineQueueCount: number;
  patients: PatientEHR[];
  telehealthQueue: TelehealthSession[];
  medicineStock: MedicineStock[];
  activeTelehealthSession: TelehealthSession | null;
  selectedPatientForEHR: PatientEHR | null;
  isTriageModalOpen: boolean;
  isMedicineModalOpen: boolean;
  isReferralModalOpen: boolean;
  isNewPatientModalOpen: boolean;
  isLoginModalOpen: boolean;
  emergencyAlert: { active: boolean; message: string; timestamp?: string } | null;
  activeAmbulanceRide: AmbulanceRide | null;
  isAmbulanceModalOpen: boolean;
  appointments: DoctorAppointment[];
  doctorAvailabilityMap: Record<string, DoctorAvailabilityInfo>;
  feedbacks: ConsultationFeedback[];
  isFeedbackModalOpen: boolean;
  feedbackTargetSession: {
    doctorId: string;
    doctorName: string;
    consultationId: string;
    patientName: string;
    subCentre?: string;
  } | null;
  followUpTasks: FollowUpTask[];
  
  // SIH Problem Statement 133: AI Emergency Coordination System State
  activeCoordinationSession: EmergencyCoordinationSession | null;
  isCoordinationModalOpen: boolean;
  isHospitalReceptionViewOpen: boolean;
  
  // Actions
  loginAsRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  setLanguage: (lang: LanguageCode) => void;
  setConnectivity: (status: ConnectivityStatus) => void;
  t: (key: string) => string;
  startTeleconsultation: (session: TelehealthSession) => void;
  endTeleconsultation: () => void;
  setDoctorAvailability: (
    doctorId: string,
    status: DoctorAvailabilityStatus,
    note?: string,
    coveredSpokes?: string[]
  ) => void;
  getDoctorAvailability: (doctorId: string) => DoctorAvailabilityInfo;
  addFeedback: (feedback: Omit<ConsultationFeedback, 'id' | 'date'>) => void;
  getDoctorQualityMetrics: (doctorId: string) => DoctorQualityMetrics;
  openFeedbackModal: (target: {
    doctorId: string;
    doctorName: string;
    consultationId: string;
    patientName: string;
    subCentre?: string;
  }) => void;
  closeFeedbackModal: () => void;
  triggerAshaAlert: (taskId: string) => void;
  recordDoorstepVitals: (
    taskId: string,
    vitals: {
      bloodPressureSys?: number;
      bloodPressureDia?: number;
      bloodSugarMgDl?: number;
      hemoglobinGdl?: number;
      spO2?: number;
      muacCm?: number;
      weightKg?: number;
    },
    notes?: string
  ) => void;
  resolveFollowUpTask: (taskId: string, resolutionSummary: string) => void;
  createFollowUpTask: (taskData: Omit<FollowUpTask, 'id' | 'daysOffset'>) => void;
  setSelectedPatientForEHR: (patient: PatientEHR | null) => void;
  setIsTriageModalOpen: (open: boolean) => void;
  setIsMedicineModalOpen: (open: boolean) => void;
  setIsReferralModalOpen: (open: boolean) => void;
  setIsNewPatientModalOpen: (open: boolean) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsAmbulanceModalOpen: (open: boolean) => void;
  bookAmbulance: (data: {
    ambulanceType: 'BLS_108' | 'ALS_108' | 'JANANI_102';
    pickupLocation: string;
    destinationHospital: string;
    emergencyReason: string;
    patientName?: string;
    patientPhone?: string;
  }) => void;
  cancelAmbulance: () => void;
  updateAmbulanceStatus: (status: AmbulanceRide['status']) => void;
  addPrescription: (patientId: string, rx: Omit<Prescription, 'id'>) => void;
  addPatient: (patientData: Omit<PatientEHR, 'id'>) => string;
  updateVitals: (patientId: string, vitals: VitalRecord) => void;
  createReferral: (referralData: Omit<Referral, 'id'>) => void;
  bookTeleconsultation: (sessionData: Omit<TelehealthSession, 'id' | 'status'>) => void;
  updateReferralStatus: (referralId: string, status: Referral['status']) => void;
  triggerEmergencySOS: (patientName?: string, location?: string) => void;
  dismissEmergencySOS: () => void;
  syncOfflineQueue: () => void;
  requestMedicineRestock: (medicineId: string, facility: 'subCentre' | 'phc') => void;
  bookAppointment: (appointmentData: Omit<DoctorAppointment, 'id' | 'tokenNumber' | 'status' | 'bookedAt'>) => DoctorAppointment;
  cancelAppointment: (appointmentId: string) => void;
  launchEmergencyCoordination: (params: {
    category: EmergencyCategory;
    requesterRole?: 'patient' | 'asha_worker';
    patientName?: string;
    patientAge?: number;
    patientGender?: 'Male' | 'Female' | 'Other';
    patientVillage?: string;
    landmark?: string;
    chiefComplaint?: string;
  }) => EmergencyCoordinationSession;
  acknowledgeBedReservation: (token: string, notes?: string) => void;
  updateEmergencyStakeholderStatus: (
    stakeholder: 'ambulance' | 'hospitalReception' | 'doctor' | 'ashaWorker',
    update: Record<string, any>
  ) => void;
  cancelEmergencyCoordination: () => void;
  setIsCoordinationModalOpen: (open: boolean) => void;
  setIsHospitalReceptionViewOpen: (open: boolean) => void;
  triggerAiEmergencyCoordination: (category?: EmergencyCategory) => void;
  hospitals: HospitalFacility[];
  updateHospitalAvailability: (
    hospitalId: string,
    updates: {
      availableBeds?: {
        general?: number;
        oxygen?: number;
        icu?: number;
        emergency?: number;
      };
      ambulancesCount?: number;
      staff?: {
        doctorsOnDutyCount?: number;
        emergencyTeamCount?: number;
        isDoctorAvailable?: boolean;
        activeDoctorName?: string;
        activeDoctorSpecialty?: string;
      };
      onDutyDoctorStatus?: 'On Duty' | 'On Call' | 'In Surgery';
    }
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<UserRole>('patient');
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS.patient);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [connectivity, setConnectivity] = useState<ConnectivityStatus>('online_high');
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);

  const [patients, setPatients] = useState<PatientEHR[]>(INITIAL_PATIENTS);
  const [telehealthQueue, setTelehealthQueue] = useState<TelehealthSession[]>(INITIAL_TELEHEALTH_SESSIONS);
  const [medicineStock, setMedicineStock] = useState<MedicineStock[]>(INITIAL_MEDICINE_STOCK);

  const [activeTelehealthSession, setActiveTelehealthSession] = useState<TelehealthSession | null>(null);
  const [selectedPatientForEHR, setSelectedPatientForEHR] = useState<PatientEHR | null>(null);

  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [emergencyAlert, setEmergencyAlert] = useState<{ active: boolean; message: string; timestamp?: string } | null>(null);
  const [activeAmbulanceRide, setActiveAmbulanceRide] = useState<AmbulanceRide | null>(null);
  const [isAmbulanceModalOpen, setIsAmbulanceModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>(INITIAL_APPOINTMENTS);

  // SIH 133: AI-Powered Emergency Healthcare Coordination State
  const [activeCoordinationSession, setActiveCoordinationSession] = useState<EmergencyCoordinationSession | null>(null);
  const [isCoordinationModalOpen, setIsCoordinationModalOpen] = useState(false);
  const [isHospitalReceptionViewOpen, setIsHospitalReceptionViewOpen] = useState(false);

  // Hospital Resources, Beds & Doctor Live Availability State
  const [hospitals, setHospitals] = useState<HospitalFacility[]>(NEARBY_HOSPITALS_DATA);

  const updateHospitalAvailability = (
    hospitalId: string,
    updates: {
      availableBeds?: {
        general?: number;
        oxygen?: number;
        icu?: number;
        emergency?: number;
      };
      ambulancesCount?: number;
      staff?: {
        doctorsOnDutyCount?: number;
        emergencyTeamCount?: number;
        isDoctorAvailable?: boolean;
        activeDoctorName?: string;
        activeDoctorSpecialty?: string;
      };
      onDutyDoctorStatus?: 'On Duty' | 'On Call' | 'In Surgery';
    }
  ) => {
    setHospitals((prevHospitals) =>
      prevHospitals.map((hosp) => {
        if (hosp.id !== hospitalId) return hosp;

        const updatedBeds = {
          ...hosp.availableBeds,
          ...(updates.availableBeds || {}),
        };

        const updatedStaff = {
          ...hosp.staff,
          ...(updates.staff || {}),
        };

        const updatedOnDutyDoctor = {
          ...hosp.onDutyDoctor,
          ...(updates.staff?.activeDoctorName ? { name: updates.staff.activeDoctorName } : {}),
          ...(updates.staff?.activeDoctorSpecialty ? { specialty: updates.staff.activeDoctorSpecialty } : {}),
          ...(updates.onDutyDoctorStatus ? { status: updates.onDutyDoctorStatus } : {}),
        };

        return {
          ...hosp,
          availableBeds: updatedBeds,
          ambulancesCount:
            updates.ambulancesCount !== undefined ? updates.ambulancesCount : hosp.ambulancesCount,
          staff: updatedStaff,
          onDutyDoctor: updatedOnDutyDoctor,
          lastUpdatedMinutesAgo: 0,
          lastUpdatedTimestamp: new Date().toISOString(),
        };
      })
    );
  };

  // Initialize Doctor Availability from DOCTOR_PROFILES + DEMO_USERS
  const [doctorAvailabilityMap, setDoctorAvailabilityMap] = useState<Record<string, DoctorAvailabilityInfo>>(() => {
    const map: Record<string, DoctorAvailabilityInfo> = {};
    DOCTOR_PROFILES.forEach((doc) => {
      if (doc.availability) {
        map[doc.id] = { ...doc.availability };
      }
    });
    // Ensure Dr. Sneha Sharma (DOC-1029 / DOC-105) is present in map
    if (map['DOC-105']) {
      map['DOC-1029'] = { ...map['DOC-105'] };
    } else {
      map['DOC-1029'] = {
        status: 'Available',
        statusNote: 'Online for NCD & Cardio Tele-Hub',
        coveredSpokes: ['District Tele-Hub Jabalpur', 'PHC Pipariya', 'SC Bamori', 'SC Bankhedi'],
        estimatedWaitMins: 0,
        lastUpdated: 'Live Now',
      };
      map['DOC-105'] = { ...map['DOC-1029'] };
    }
    return map;
  });

  const setDoctorAvailability = (
    doctorId: string,
    status: DoctorAvailabilityStatus,
    note?: string,
    coveredSpokes?: string[]
  ) => {
    setDoctorAvailabilityMap((prev) => {
      const existing = prev[doctorId] || {
        status: 'Available',
        statusNote: '',
        coveredSpokes: ['District Hospital Tele-Hub', 'PHC Pipariya', 'SC Bamori'],
        estimatedWaitMins: 0,
        lastUpdated: 'Live Now',
      };

      const updated: DoctorAvailabilityInfo = {
        ...existing,
        status,
        statusNote: note !== undefined ? note : existing.statusNote,
        coveredSpokes: coveredSpokes || existing.coveredSpokes,
        estimatedWaitMins: status === 'Available' ? 0 : status === 'Busy' ? 12 : 180,
        lastUpdated: 'Just now',
      };

      const nextMap = { ...prev, [doctorId]: updated };
      // Keep DOC-105 and DOC-1029 synchronized for Dr. Sneha Sharma
      if (doctorId === 'DOC-1029') nextMap['DOC-105'] = { ...updated };
      if (doctorId === 'DOC-105') nextMap['DOC-1029'] = { ...updated };

      return nextMap;
    });
  };

  const getDoctorAvailability = (doctorId: string): DoctorAvailabilityInfo => {
    if (doctorAvailabilityMap[doctorId]) return doctorAvailabilityMap[doctorId];
    if (doctorId === 'DOC-1029' && doctorAvailabilityMap['DOC-105']) return doctorAvailabilityMap['DOC-105'];
    if (doctorId === 'DOC-105' && doctorAvailabilityMap['DOC-1029']) return doctorAvailabilityMap['DOC-1029'];
    return {
      status: 'Available',
      statusNote: 'Online for Teleconsultation',
      coveredSpokes: ['District Hospital Tele-Hub', 'PHC Pipariya'],
      estimatedWaitMins: 0,
      lastUpdated: 'Live Now',
    };
  };

  // Feedback & Quality Rating State
  const [feedbacks, setFeedbacks] = useState<ConsultationFeedback[]>(INITIAL_FEEDBACKS);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTargetSession, setFeedbackTargetSession] = useState<{
    doctorId: string;
    doctorName: string;
    consultationId: string;
    patientName: string;
    subCentre?: string;
  } | null>(null);

  const [followUpTasks, setFollowUpTasks] = useState<FollowUpTask[]>(INITIAL_FOLLOW_UP_TASKS);

  const openFeedbackModal = (target: {
    doctorId: string;
    doctorName: string;
    consultationId: string;
    patientName: string;
    subCentre?: string;
  }) => {
    setFeedbackTargetSession(target);
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setFeedbackTargetSession(null);
  };

  const addFeedback = (feedbackData: Omit<ConsultationFeedback, 'id' | 'date'>) => {
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newFeedback: ConsultationFeedback = {
      ...feedbackData,
      id: `FB-${Math.floor(1000 + Math.random() * 9000)}`,
      date: today,
    };

    setFeedbacks((prev) => [newFeedback, ...prev]);
    closeFeedbackModal();
  };

  const getDoctorQualityMetrics = (doctorId: string): DoctorQualityMetrics => {
    const targetIds =
      doctorId === 'DOC-1029' || doctorId === 'DOC-105'
        ? ['DOC-1029', 'DOC-105']
        : [doctorId];

    const doctorReviews = feedbacks.filter((f) => targetIds.includes(f.doctorId));
    const totalReviews = doctorReviews.length;

    if (totalReviews === 0) {
      return {
        averageRating: 5.0,
        totalReviews: 0,
        communicationPercentage: 100,
        networkClarityPercentage: 95,
        medicineClarityPercentage: 100,
        topTags: [
          { tag: 'Bilingual Hindi Explanation', count: 1 },
          { tag: 'Clear Dosage Guidance', count: 1 },
        ],
        recentReviews: [],
      };
    }

    const sumOverall = doctorReviews.reduce((acc, curr) => acc + curr.overallRating, 0);
    const sumComm = doctorReviews.reduce((acc, curr) => acc + curr.communicationRating, 0);
    const sumNetwork = doctorReviews.reduce((acc, curr) => acc + curr.networkClarityRating, 0);
    const sumMed = doctorReviews.reduce((acc, curr) => acc + curr.medicineClarityRating, 0);

    const averageRating = Number((sumOverall / totalReviews).toFixed(1));
    const communicationPercentage = Math.round((sumComm / (totalReviews * 5)) * 100);
    const networkClarityPercentage = Math.round((sumNetwork / (totalReviews * 5)) * 100);
    const medicineClarityPercentage = Math.round((sumMed / (totalReviews * 5)) * 100);

    const tagCountMap: Record<string, number> = {};
    doctorReviews.forEach((r) => {
      r.tags.forEach((t) => {
        tagCountMap[t] = (tagCountMap[t] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCountMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      averageRating,
      totalReviews,
      communicationPercentage,
      networkClarityPercentage,
      medicineClarityPercentage,
      topTags,
      recentReviews: doctorReviews,
    };
  };

  // Live GPS movement simulation along road for active ambulance
  useEffect(() => {
    if (!activeAmbulanceRide || activeAmbulanceRide.status !== 'EnRoute') return;

    const timer = setInterval(() => {
      setActiveAmbulanceRide((prev) => {
        if (!prev || prev.status !== 'EnRoute') return prev;
        const nextProgress = Math.min(96, prev.routeProgressPercent + 3);
        const nextDistance = Math.max(0.2, Number((prev.distanceRemainingKm - 0.15).toFixed(1)));
        const nextEta = Math.max(1, Math.ceil(nextDistance * 2));

        if (nextProgress >= 95) {
          return {
            ...prev,
            status: 'Arrived',
            routeProgressPercent: 98,
            etaMinutes: 0,
            distanceRemainingKm: 0,
          };
        }

        return {
          ...prev,
          routeProgressPercent: nextProgress,
          distanceRemainingKm: nextDistance,
          etaMinutes: nextEta,
        };
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [activeAmbulanceRide?.status]);

  // Sync role change with default user
  const loginAsRole = (role: UserRole) => {
    setActiveRole(role);
    setCurrentUser(DEMO_USERS[role] || DEMO_USERS.doctor);
    setIsLoginModalOpen(false);
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    setCurrentUser(DEMO_USERS[role] || DEMO_USERS.doctor);
    if (activeTelehealthSession) {
      setActiveTelehealthSession(null);
    }
  };

  const logout = () => {
    setIsLoginModalOpen(true);
  };

  const t = (key: string) => getTranslation(key, language);

  const startTeleconsultation = (session: TelehealthSession) => {
    setActiveTelehealthSession(session);
    // Find matching patient and set for EHR reference during the call
    const matched = patients.find((p) => p.id === session.patientId);
    if (matched) {
      setSelectedPatientForEHR(matched);
    }
    // Auto-set doctor status to Busy
    if (currentUser.role === 'doctor') {
      setDoctorAvailability(
        currentUser.id,
        'Busy',
        `In consultation with ${session.patientName} (${session.subCentre || 'Rural Spoke'})`
      );
    } else if (session.doctorId) {
      setDoctorAvailability(session.doctorId, 'Busy', `In consultation with ${session.patientName}`);
    }
  };

  const endTeleconsultation = () => {
    if (activeTelehealthSession) {
      const targetSession = {
        doctorId: activeTelehealthSession.doctorId || 'DOC-1029',
        doctorName: activeTelehealthSession.doctorName || 'Dr. Sneha Sharma',
        consultationId: activeTelehealthSession.id,
        patientName: activeTelehealthSession.patientName,
        subCentre: activeTelehealthSession.subCentre,
      };

      // Mark session completed
      setTelehealthQueue((prev) =>
        prev.map((s) =>
          s.id === activeTelehealthSession.id ? { ...s, status: 'Completed' } : s
        )
      );

      // Trigger feedback modal for beneficiary
      openFeedbackModal(targetSession);
    }
    // Auto-set doctor back to Available
    if (currentUser.role === 'doctor') {
      setDoctorAvailability(currentUser.id, 'Available', 'Ready for next consultation');
    }
    setActiveTelehealthSession(null);
  };

  const addPrescription = (patientId: string, rxData: Omit<Prescription, 'id'>) => {
    const newRx: Prescription = {
      ...rxData,
      id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    if (connectivity === 'offline') {
      setOfflineQueueCount((c) => c + 1);
    }

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            prescriptions: [newRx, ...p.prescriptions],
            lastVisitDate: newRx.date,
          };
        }
        return p;
      })
    );

    // Also update selected patient if open
    setSelectedPatientForEHR((prev) =>
      prev && prev.id === patientId
        ? {
            ...prev,
            prescriptions: [newRx, ...prev.prescriptions],
            lastVisitDate: newRx.date,
          }
        : prev
    );
  };

  const updateVitals = (patientId: string, vital: VitalRecord) => {
    if (connectivity === 'offline') {
      setOfflineQueueCount((c) => c + 1);
    }

    const nowFormatted = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const enrichedVital: VitalRecord = {
      ...vital,
      id: vital.id || `VIT-${Date.now()}`,
      lastUpdatedFormatted: vital.lastUpdatedFormatted || nowFormatted,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          // Re-evaluate triage status based on new vitals
          let triageStatus = p.triageStatus;
          if (
            enrichedVital.bloodPressureSys >= 160 ||
            enrichedVital.bloodPressureDia >= 105 ||
            enrichedVital.spO2 < 92 ||
            (enrichedVital.creatinineMgDl && enrichedVital.creatinineMgDl >= 2.0) ||
            (enrichedVital.hemoglobinGdl && enrichedVital.hemoglobinGdl < 8)
          ) {
            triageStatus = 'Red';
          } else if (
            enrichedVital.bloodPressureSys >= 140 ||
            enrichedVital.bloodPressureDia >= 90 ||
            (enrichedVital.bloodSugarMgDl && enrichedVital.bloodSugarMgDl > 200) ||
            (enrichedVital.cholesterolMgDl && enrichedVital.cholesterolMgDl >= 240) ||
            (enrichedVital.creatinineMgDl && enrichedVital.creatinineMgDl >= 1.4)
          ) {
            triageStatus = 'Amber';
          } else {
            triageStatus = 'Green';
          }

          return {
            ...p,
            triageStatus,
            lastVisitDate: enrichedVital.date || p.lastVisitDate,
            vitalsHistory: [enrichedVital, ...p.vitalsHistory],
          };
        }
        return p;
      })
    );

    setSelectedPatientForEHR((prev) =>
      prev && prev.id === patientId
        ? {
            ...prev,
            vitalsHistory: [enrichedVital, ...prev.vitalsHistory],
          }
        : prev
    );
  };

  const addPatient = (patientData: Omit<PatientEHR, 'id'>): string => {
    const newId = `PAT-${Math.floor(4020 + Math.random() * 1000)}`;
    const newPatient: PatientEHR = {
      ...patientData,
      id: newId,
    };

    if (connectivity === 'offline') {
      setOfflineQueueCount((c) => c + 1);
    }

    setPatients((prev) => [newPatient, ...prev]);
    return newId;
  };

  const createReferral = (referralData: Omit<Referral, 'id'>) => {
    const newRef: Referral = {
      ...referralData,
      id: `REF-${Math.floor(310 + Math.random() * 500)}`,
    };

    if (connectivity === 'offline') {
      setOfflineQueueCount((c) => c + 1);
    }

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === referralData.patientId) {
          return {
            ...p,
            referrals: [newRef, ...p.referrals],
          };
        }
        return p;
      })
    );
  };

  const bookTeleconsultation = (sessionData: Omit<TelehealthSession, 'id' | 'status'>) => {
    const newSession: TelehealthSession = {
      ...sessionData,
      id: `TC-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Waiting',
    };

    if (connectivity === 'offline') {
      setOfflineQueueCount((c) => c + 1);
    }

    setTelehealthQueue((prev) => [newSession, ...prev]);
  };

  const updateReferralStatus = (referralId: string, status: Referral['status']) => {
    setPatients((prev) =>
      prev.map((p) => ({
        ...p,
        referrals: p.referrals.map((r) => (r.id === referralId ? { ...r, status } : r)),
      }))
    );
  };

  const bookAmbulance = (data: {
    ambulanceType: 'BLS_108' | 'ALS_108' | 'JANANI_102';
    pickupLocation: string;
    destinationHospital: string;
    emergencyReason: string;
    patientName?: string;
    patientPhone?: string;
  }) => {
    const config = DEFAULT_AMBULANCE_DRIVERS[data.ambulanceType];
    const newRide: AmbulanceRide = {
      id: `AMB-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ambulanceType: data.ambulanceType,
      ambulanceTypeName: config.typeName,
      vehicleNumber: config.vehicleNumber,
      vehicleModel: config.vehicleModel,
      pickupLocation: {
        address: data.pickupLocation,
        village: data.pickupLocation.split(',')[0] || 'Gram Sihore',
        landmark: 'Primary School Gate',
        coordinates: { x: 80, y: 74 },
      },
      destinationHospital: {
        name: data.destinationHospital,
        facilityType: 'Secondary Referral Hospital',
        distanceKm: 4.8,
        coordinates: { x: 18, y: 22 },
      },
      driver: config.driver,
      status: 'EnRoute',
      etaMinutes: 6,
      distanceRemainingKm: 3.2,
      routeProgressPercent: 15,
      emergencyReason: data.emergencyReason,
      patientName: data.patientName || 'Rural Patient',
      patientPhone: data.patientPhone || '+91 94250 11080',
      sirenActive: true,
    };

    setActiveAmbulanceRide(newRide);
    setIsAmbulanceModalOpen(true);
    triggerEmergencySOS(data.patientName, data.pickupLocation);
  };

  const cancelAmbulance = () => {
    setActiveAmbulanceRide(null);
  };

  const updateAmbulanceStatus = (status: AmbulanceRide['status']) => {
    setActiveAmbulanceRide((prev) => {
      if (!prev) return null;
      if (status === 'Arrived') {
        return {
          ...prev,
          status: 'Arrived',
          routeProgressPercent: 98,
          etaMinutes: 0,
          distanceRemainingKm: 0,
        };
      }
      return {
        ...prev,
        status,
      };
    });
  };

  const triggerEmergencySOS = (patientName?: string, location?: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setEmergencyAlert({
      active: true,
      message: `CRITICAL 108 AMBULANCE DISPATCH TRIGGERED! Priority triage alert for ${patientName || 'Rural Patient'} at ${location || 'Sub-Centre Rampur / Gram Pipariya'}. Emergency response team alerted.`,
      timestamp: timeStr,
    });
    setIsAmbulanceModalOpen(true);
  };

  const dismissEmergencySOS = () => {
    setEmergencyAlert(null);
  };

  // SIH 133: AI Emergency Coordination Handlers
  const launchEmergencyCoordination = (params: {
    category: EmergencyCategory;
    requesterRole?: 'patient' | 'asha_worker';
    patientName?: string;
    patientAge?: number;
    patientGender?: 'Male' | 'Female' | 'Other';
    patientVillage?: string;
    landmark?: string;
    chiefComplaint?: string;
  }): EmergencyCoordinationSession => {
    const patient = patients[0];
    const session = createEmergencySession({
      category: params.category,
      requesterRole: params.requesterRole || (activeRole === 'asha_worker' ? 'asha_worker' : 'patient'),
      requesterName: currentUser.name || 'Rameshwar Prasad',
      requesterPhone: currentUser.phone || '+91 94250 11080',
      patientName: params.patientName || patient?.name || 'Rameshwar Prasad',
      patientAge: params.patientAge || patient?.age || 52,
      patientGender: params.patientGender || patient?.gender || 'Male',
      patientAbhaId: patient?.abhaId || '91-8472-9103-2941',
      patientVillage: params.patientVillage || patient?.village || currentUser.village || 'Gram Sihore',
      landmark: params.landmark,
      chiefComplaint: params.chiefComplaint,
    });

    setActiveCoordinationSession(session);
    setIsCoordinationModalOpen(true);

    // Synchronize ambulance ride and global emergency alert banner
    const rideConfig = DEFAULT_AMBULANCE_DRIVERS[session.ambulanceDispatch.ambulanceType];
    setActiveAmbulanceRide({
      id: session.ambulanceDispatch.rideId,
      bookingTime: session.timestamp,
      ambulanceType: session.ambulanceDispatch.ambulanceType,
      ambulanceTypeName: rideConfig.typeName,
      vehicleNumber: session.ambulanceDispatch.vehicleNumber,
      vehicleModel: session.ambulanceDispatch.vehicleModel,
      pickupLocation: {
        address: session.patientLocation.address,
        village: session.patientVillage,
        landmark: session.patientLocation.landmark || 'Primary School Gate',
        coordinates: { x: 80, y: 74 },
      },
      destinationHospital: {
        name: session.selectedHospital.hospitalName,
        facilityType: session.selectedHospital.tier,
        distanceKm: session.selectedHospital.distanceKm,
        coordinates: { x: 18, y: 22 },
      },
      driver: rideConfig.driver,
      status: 'EnRoute',
      etaMinutes: session.ambulanceDispatch.etaMinutes,
      distanceRemainingKm: session.selectedHospital.distanceKm,
      routeProgressPercent: 15,
      emergencyReason: session.chiefComplaint,
      patientName: session.patientName,
      patientPhone: session.requesterPhone,
      sirenActive: true,
    });

    setEmergencyAlert({
      active: true,
      message: `🚨 EMERGENCY ROUTING ACTIVE (${session.categoryMeta.name}): Bed reserved (${session.bedReservation.bedNumber}) at ${session.selectedHospital.hospitalName}. 108 Ambulance dispatched (ETA: ${session.ambulanceDispatch.etaMinutes} mins).`,
      timestamp: session.timestamp,
    });

    return session;
  };

  const acknowledgeBedReservation = (token: string, notes?: string) => {
    setActiveCoordinationSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        bedReservation: {
          ...prev.bedReservation,
          status: 'Trauma_Bay_Ready',
        },
        stakeholders: {
          ...prev.stakeholders,
          hospitalReception: {
            ...prev.stakeholders.hospitalReception,
            status: 'Confirmed by Casualty Desk • Trauma Bay Prepped',
            stretcherTeamReady: true,
            casualtyDeskNotes: notes || 'Emergency admission pass validated. Stretcher team standing by.',
          },
        },
      };
    });
  };

  const updateEmergencyStakeholderStatus = (
    stakeholder: 'ambulance' | 'hospitalReception' | 'doctor' | 'ashaWorker',
    update: Record<string, any>
  ) => {
    setActiveCoordinationSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        stakeholders: {
          ...prev.stakeholders,
          [stakeholder]: {
            ...prev.stakeholders[stakeholder],
            ...update,
          },
        },
      };
    });
  };

  const cancelEmergencyCoordination = () => {
    setActiveCoordinationSession(null);
    setIsCoordinationModalOpen(false);
  };

  const triggerAiEmergencyCoordination = (category?: EmergencyCategory) => {
    launchEmergencyCoordination({
      category: category || 'cardiac_arrest',
    });
  };

  const syncOfflineQueue = () => {
    if (offlineQueueCount > 0) {
      setOfflineQueueCount(0);
      alert(`Successfully synchronized all pending actions with central Ayushman Bharat Digital Mission (ABDM) Cloud registry.`);
    }
  };

  const requestMedicineRestock = (medicineId: string, facility: 'subCentre' | 'phc') => {
    setMedicineStock((prev) =>
      prev.map((m) => {
        if (m.id === medicineId) {
          return {
            ...m,
            [facility === 'subCentre' ? 'subCentreStock' : 'phcStock']:
              m[facility === 'subCentre' ? 'subCentreStock' : 'phcStock'] + 250,
            status: 'In Stock',
            lastUpdated: 'Just now (Indent Approved)',
          };
        }
        return m;
      })
    );
  };

  const bookAppointment = (
    data: Omit<DoctorAppointment, 'id' | 'tokenNumber' | 'status' | 'bookedAt'>
  ): DoctorAppointment => {
    const isOnline = data.mode === 'Online';
    const randomNum = Math.floor(10 + Math.random() * 90);
    const token = isOnline ? `TELE-2026-0${randomNum}` : `OPD-CHC-0${randomNum}`;
    
    const newAppointment: DoctorAppointment = {
      ...data,
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      tokenNumber: token,
      status: 'Confirmed',
      bookedAt: 'Just now',
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    // If online, also queue into telehealth sessions so doctor sees it immediately
    if (isOnline) {
      const newSession: TelehealthSession = {
        id: `TC-${Math.floor(100 + Math.random() * 900)}`,
        patientId: data.patientId,
        patientName: data.patientName,
        patientAge: 58,
        patientGender: 'Male',
        abhaId: data.abhaId,
        doctorId: data.doctorId,
        doctorName: data.doctorName,
        doctorSpecialty: data.doctorSpecialty,
        scheduledTime: `${data.appointmentDate} • ${data.timeSlot}`,
        status: 'Waiting',
        complaint: data.complaint,
        priority: 'Medium',
        ashaAssisted: true,
        ashaName: 'Meena Devi (ASHA)',
        subCentre: data.facility,
        connectionQuality: 'Good',
      };
      setTelehealthQueue((prev) => [newSession, ...prev]);
    }

    if (connectivity === 'offline') {
      setOfflineQueueCount((c) => c + 1);
    }

    return newAppointment;
  };

  const cancelAppointment = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: 'Cancelled' as const } : apt))
    );
  };

  // High-Risk Follow-Up Handlers
  const triggerAshaAlert = (taskId: string) => {
    const timeNow = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setFollowUpTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            ashaDoorstepStatus: 'Alert_Sent' as const,
            lastAshaAlertSentAt: `Today, ${timeNow}`,
            status: t.status === 'Pending' ? ('In_Progress' as const) : t.status,
          };
        }
        return t;
      })
    );
  };

  const recordDoorstepVitals = (
    taskId: string,
    vitals: {
      bloodPressureSys?: number;
      bloodPressureDia?: number;
      bloodSugarMgDl?: number;
      hemoglobinGdl?: number;
      spO2?: number;
      muacCm?: number;
      weightKg?: number;
    },
    notes?: string
  ) => {
    const timeFormatted = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + `, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

    let targetPatientId = '';

    setFollowUpTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          targetPatientId = t.patientId;
          return {
            ...t,
            latestVitals: {
              ...t.latestVitals,
              ...vitals,
              recordedAt: timeFormatted,
            },
            ashaDoorstepStatus: 'Completed' as const,
            lastDoorstepVisitDate: timeFormatted,
            ashaVisitNotes: notes || 'Ghar par jaanch poori hui (Doorstep vitals verified).',
            status: 'Completed' as const,
            urgency: 'Resolved' as const,
            resolvedAt: timeFormatted,
            resolutionSummary: `Doorstep vitals verified by ${t.assignedAshaWorker}. ${notes || 'Condition stable.'}`,
          };
        }
        return t;
      })
    );

    // If patient exists, also append to their longitudinal EHR vitals
    if (targetPatientId) {
      const newVital: VitalRecord = {
        date: new Date().toISOString().split('T')[0],
        lastUpdatedFormatted: timeFormatted,
        bloodPressureSys: vitals.bloodPressureSys || 120,
        bloodPressureDia: vitals.bloodPressureDia || 80,
        pulseRate: 78,
        spO2: vitals.spO2 || 98,
        temperatureF: 98.4,
        bloodSugarMgDl: vitals.bloodSugarMgDl,
        hemoglobinGdl: vitals.hemoglobinGdl,
        weightKg: vitals.weightKg || 50,
        sourceType: 'ASHA_Doorstep',
        conductorName: 'Meena Devi (ASHA)',
        notes: notes || 'High-Risk doorstep follow-up visit completed.',
      };

      setPatients((prev) =>
        prev.map((p) =>
          p.id === targetPatientId
            ? { ...p, vitalsHistory: [newVital, ...p.vitalsHistory], lastVisitDate: newVital.date }
            : p
        )
      );
    }
  };

  const resolveFollowUpTask = (taskId: string, resolutionSummary: string) => {
    const timeFormatted = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + `, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

    setFollowUpTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'Completed' as const,
              urgency: 'Resolved' as const,
              resolvedAt: timeFormatted,
              resolutionSummary,
            }
          : t
      )
    );
  };

  const createFollowUpTask = (taskData: Omit<FollowUpTask, 'id' | 'daysOffset'>) => {
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(taskData.dueDate);
    const now = new Date(today);
    const diffTime = due.getTime() - now.getTime();
    const daysOffset = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const newTask: FollowUpTask = {
      ...taskData,
      id: `HFT-${Math.floor(100 + Math.random() * 900)}`,
      daysOffset,
    };

    setFollowUpTasks((prev) => [newTask, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        language,
        connectivity,
        offlineQueueCount,
        patients,
        telehealthQueue,
        medicineStock,
        activeTelehealthSession,
        selectedPatientForEHR,
        isTriageModalOpen,
        isMedicineModalOpen,
        isReferralModalOpen,
        isNewPatientModalOpen,
        isLoginModalOpen,
        emergencyAlert,
        activeAmbulanceRide,
        isAmbulanceModalOpen,
        appointments,
        doctorAvailabilityMap,
        feedbacks,
        isFeedbackModalOpen,
        feedbackTargetSession,
        followUpTasks,
        loginAsRole,
        switchRole,
        logout,
        setLanguage,
        setConnectivity,
        t,
        startTeleconsultation,
        endTeleconsultation,
        setDoctorAvailability,
        getDoctorAvailability,
        addFeedback,
        getDoctorQualityMetrics,
        openFeedbackModal,
        closeFeedbackModal,
        triggerAshaAlert,
        recordDoorstepVitals,
        resolveFollowUpTask,
        createFollowUpTask,
        setSelectedPatientForEHR,
        setIsTriageModalOpen,
        setIsMedicineModalOpen,
        setIsReferralModalOpen,
        setIsNewPatientModalOpen,
        setIsLoginModalOpen,
        setIsAmbulanceModalOpen,
        bookAmbulance,
        cancelAmbulance,
        updateAmbulanceStatus,
        addPrescription,
        addPatient,
        updateVitals,
        createReferral,
        bookTeleconsultation,
        updateReferralStatus,
        triggerEmergencySOS,
        dismissEmergencySOS,
        syncOfflineQueue,
        requestMedicineRestock,
        bookAppointment,
        cancelAppointment,
        activeCoordinationSession,
        isCoordinationModalOpen,
        isHospitalReceptionViewOpen,
        launchEmergencyCoordination,
        acknowledgeBedReservation,
        updateEmergencyStakeholderStatus,
        cancelEmergencyCoordination,
        setIsCoordinationModalOpen,
        setIsHospitalReceptionViewOpen,
        triggerAiEmergencyCoordination,
        hospitals,
        updateHospitalAvailability,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
