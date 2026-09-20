import {
  EmergencyCategory,
  EmergencyCategoryMeta,
  HospitalCapabilityRequirement,
  HospitalEvaluationDetail,
  EmergencyBedReservation,
  EmergencyAmbulanceDispatch,
  StakeholderCoordinationStatus,
  EmergencyCoordinationSession,
} from '../types';
import { NEARBY_HOSPITALS_DATA, HospitalFacility } from '../data/hospitalData';
import { DEFAULT_AMBULANCE_DRIVERS } from '../data/ambulanceData';

// ============================================================================
// CLINICAL SAFETY GUARDRAIL DECLARATION
// ============================================================================
// NOTE: This engine strictly coordinates emergency logistics, facility matching,
// bed reservations, and dispatch. It DOES NOT provide medical diagnosis or treatment.
// ============================================================================

export const EMERGENCY_ARCHETYPES: Record<EmergencyCategory, EmergencyCategoryMeta> = {
  cardiac_arrest: {
    id: 'cardiac_arrest',
    name: 'Acute Cardiac Emergency / Chest Pain',
    hindiName: 'गंभीर हृदय रोग / सीने में दर्द / हार्ट अटैक',
    bengaliName: 'তীব্র হৃদরোগ / বুকে ব্যথা / হার্ট অ্যাটাক',
    icon: 'HeartPulse',
    severity: 'CRITICAL_RED',
    typicalComplaints: [
      'Severe crushing chest pain radiating to left arm/jaw',
      'Profuse cold sweating with sudden dizziness',
      'Acute shortness of breath & cyanosis',
      'Unstable cardiac rhythm or sudden collapse',
    ],
    requiredSpecialist: 'Cardiologist / Critical Care Specialist',
    requiredFacilities: ['Critical Care ICU / CCU', 'Licensed Blood Bank', '24x7 Emergency Trauma & Resuscitation'],
    requiredBedType: 'icu',
    ambulanceTypeNeeded: 'ALS_108',
    goldenHourWindowMinutes: 60,
  },
  trauma_accident: {
    id: 'trauma_accident',
    name: 'Severe Trauma / High-Impact Road Accident',
    hindiName: 'गंभीर दुर्घटना / गहरा आघात / रक्तस्राव',
    bengaliName: 'গুরুতর সড়ক দুর্ঘটনা / গভীর আঘাত ও রক্তক্ষরণ',
    icon: 'ShieldAlert',
    severity: 'CRITICAL_RED',
    typicalComplaints: [
      'Multiple compound fractures with severe arterial hemorrhage',
      'Head injury with loss of consciousness or vomiting',
      'Polytrauma with blunt chest or abdominal impact',
      'Pedestrian or vehicular collision with shock',
    ],
    requiredSpecialist: 'Orthopedic / Trauma Surgeon',
    requiredFacilities: ['24x7 Emergency Trauma & Resuscitation', 'Digital X-Ray & CT Scan', 'Licensed Blood Bank'],
    requiredBedType: 'icu',
    ambulanceTypeNeeded: 'ALS_108',
    goldenHourWindowMinutes: 60,
  },
  maternal_labor: {
    id: 'maternal_labor',
    name: 'High-Risk Maternal Delivery & Obstetric Emergency',
    hindiName: 'उच्च जोखिम प्रसव पीड़ा / आपातकालीन मातृत्व सेवा',
    bengaliName: 'উচ্চ ঝুঁকিপূর্ণ প্রসবকালীন জরুরী অবস্থা',
    icon: 'Baby',
    severity: 'CRITICAL_RED',
    typicalComplaints: [
      'Severe pre-eclamptic seizures or BP > 160/110 mmHg',
      'Antepartum / Postpartum massive hemorrhage',
      'Obstructed or prolonged labor > 12 hours',
      'Umbilical cord prolapse or fetal distress',
    ],
    requiredSpecialist: 'Obstetrician & Gynecologist',
    requiredFacilities: ['Obstetrics & Neonatal Care', 'Licensed Blood Bank', '24x7 Emergency Trauma & Resuscitation'],
    requiredBedType: 'oxygen',
    ambulanceTypeNeeded: 'JANANI_102',
    goldenHourWindowMinutes: 75,
  },
  respiratory_distress: {
    id: 'respiratory_distress',
    name: 'Acute Severe Respiratory Failure & Hypoxia',
    hindiName: 'गंभीर सांस लेने में तकलीफ / ऑक्सीजन की कमी (हाइपोक्सिया)',
    bengaliName: 'তীব্র শ্বাসকষ্ট / শরীরে অক্সিজেনের ঘাটতি',
    icon: 'Activity',
    severity: 'CRITICAL_RED',
    typicalComplaints: [
      'SpO2 < 88% on room air with severe tachypnea',
      'Severe status asthmaticus or acute COPD exacerbation',
      'Severe respiratory stridor / partial airway blockage',
      'Severe pulmonary edema or chest congestion',
    ],
    requiredSpecialist: 'Pulmonologist / Emergency Medical Officer',
    requiredFacilities: ['24x7 Emergency Trauma & Resuscitation', 'High-Flow Oxygen / Suction'],
    requiredBedType: 'oxygen',
    ambulanceTypeNeeded: 'BLS_108',
    goldenHourWindowMinutes: 60,
  },
  stroke_neuro: {
    id: 'stroke_neuro',
    name: 'Acute Ischemic Stroke / Neurological Deficit',
    hindiName: 'स्ट्रोक / अचानक पक्षाघात / चेहरे या हाथ में कमजोरी',
    bengaliName: 'তীব্র স্ট্রোক / পক্ষাঘাত / স্নায়বিক সমস্যা',
    icon: 'Brain',
    severity: 'CRITICAL_RED',
    typicalComplaints: [
      'Sudden facial drooping, arm weakness, slurred speech (FAST)',
      'Sudden unilateral paralysis or numbness',
      'Acute loss of consciousness or non-responsive stupor',
      'Severe thunderclap headache with visual distortion',
    ],
    requiredSpecialist: 'Neurologist / Casualty Medical Officer',
    requiredFacilities: ['Digital X-Ray & CT Scan', 'Critical Care ICU / CCU', '24x7 Emergency Trauma & Resuscitation'],
    requiredBedType: 'icu',
    ambulanceTypeNeeded: 'ALS_108',
    goldenHourWindowMinutes: 90,
  },
  snakebite_poisoning: {
    id: 'snakebite_poisoning',
    name: 'Toxic Envenomation / Snakebite / Acute Poisoning',
    hindiName: 'सर्पदंश / जहरीला विष / आकस्मिक विषाक्तता',
    bengaliName: 'সর্পদংশন / বিষক্রিয়া / জরুরি প্রতিষেধক',
    icon: 'Biohazard',
    severity: 'CRITICAL_RED',
    typicalComplaints: [
      'Venomous snake bite with fang punctures and rapid swelling',
      'Neurotoxic symptoms: ptosis, dysphagia, respiratory paralysis',
      'Hemotoxic symptoms: spontaneous mucosal bleeding',
      'Organophosphate ingestion with excessive salivation and pin-point pupils',
    ],
    requiredSpecialist: 'Casualty Medical Officer & Critical Care',
    requiredFacilities: ['24x7 Emergency Trauma & Resuscitation', 'Critical Care ICU / CCU'],
    requiredBedType: 'icu',
    ambulanceTypeNeeded: 'ALS_108',
    goldenHourWindowMinutes: 45,
  },
  general_casualty: {
    id: 'general_casualty',
    name: 'General Acute Casualty / High Fever / Severe Dehydration',
    hindiName: 'सामान्य आपातकालीन कैजुअल्टी / तेज बुखार / डिहाइड्रेशन',
    bengaliName: 'সাধারণ জরুরি ক্যাজুয়ালটি / তীব্র জ্বর / পানিশূন্যতা',
    icon: 'Stethoscope',
    severity: 'URGENT_YELLOW',
    typicalComplaints: [
      'Hypovolemic shock due to acute severe gastroenteritis',
      'High febrile convulsions in pediatric patient',
      'Uncontrolled high-grade infection with confusion',
      'Deep lacerations requiring urgent surgical suturing',
    ],
    requiredSpecialist: 'Emergency Medical Officer',
    requiredFacilities: ['24x7 Emergency Trauma & Resuscitation'],
    requiredBedType: 'general',
    ambulanceTypeNeeded: 'BLS_108',
    goldenHourWindowMinutes: 120,
  },
};

/**
 * Maps an emergency category to mandatory hospital capability requirements.
 */
export function deriveCapabilityRequirement(category: EmergencyCategory): HospitalCapabilityRequirement {
  const meta = EMERGENCY_ARCHETYPES[category] || EMERGENCY_ARCHETYPES.general_casualty;
  return {
    specialistNeeded: meta.requiredSpecialist,
    facilitiesNeeded: meta.requiredFacilities,
    bedTypeNeeded: meta.requiredBedType,
    emergency24x7Required: true,
    bloodBankRequired: meta.requiredFacilities.includes('Licensed Blood Bank'),
  };
}

/**
 * Evaluates a specific hospital facility against the emergency requirements.
 */
export function evaluateHospitalForEmergency(
  hospital: HospitalFacility,
  req: HospitalCapabilityRequirement,
  cascadeOrder: number
): HospitalEvaluationDetail {
  const rejectionReasons: string[] = [];

  // Check 1: 24x7 Emergency Casualty
  if (req.emergency24x7Required && !hospital.emergency24x7) {
    rejectionReasons.push('Emergency department does not operate 24x7 (closed at night / holidays)');
  }

  // Check 2: Bed availability
  let bedAvailable = false;
  if (req.bedTypeNeeded === 'icu') {
    bedAvailable = hospital.availableBeds.icu > 0;
    if (!bedAvailable) {
      rejectionReasons.push(`0 ICU beds available (${hospital.availableBeds.icu}/${hospital.totalBeds} free)`);
    }
  } else if (req.bedTypeNeeded === 'oxygen') {
    bedAvailable = hospital.availableBeds.oxygen > 0;
    if (!bedAvailable) {
      rejectionReasons.push(`0 Oxygen beds available (${hospital.availableBeds.oxygen}/${hospital.totalBeds} free)`);
    }
  } else {
    bedAvailable = hospital.availableBeds.general > 0;
    if (!bedAvailable) {
      rejectionReasons.push(`0 General emergency beds available`);
    }
  }

  // Check 3: Doctor Availability & Specialty
  const doctorStatus = hospital.onDutyDoctor.status;
  let specialistMatched = true;

  if (doctorStatus === 'In Surgery') {
    specialistMatched = false;
    rejectionReasons.push(`On-duty doctor (${hospital.onDutyDoctor.name}) is currently occupied In Surgery`);
  }

  // Check 4: Critical Facilities (Blood Bank, CT Scan, ICU, etc.)
  const missingFacilities: string[] = [];
  req.facilitiesNeeded.forEach((fac) => {
    if (fac === 'Licensed Blood Bank' && !hospital.bloodBank) {
      missingFacilities.push('Licensed Blood Bank');
      rejectionReasons.push('Lacks on-site Licensed Blood Bank for emergency transfusion');
    } else if (fac === 'Critical Care ICU / CCU' && hospital.availableBeds.icu <= 0) {
      if (!missingFacilities.includes('Critical Care ICU')) {
        missingFacilities.push('Critical Care ICU');
      }
    } else {
      const hasSpeciality = hospital.specialities.some((s) =>
        s.toLowerCase().includes(fac.toLowerCase().slice(0, 10))
      );
      if (!hasSpeciality && fac !== 'Licensed Blood Bank' && fac !== 'Critical Care ICU / CCU') {
        missingFacilities.push(fac);
        rejectionReasons.push(`Missing certified facility: ${fac}`);
      }
    }
  });

  const isSuitable = rejectionReasons.length === 0;
  const acceptanceReason = isSuitable
    ? `Verified Suitable: ${req.bedTypeNeeded.toUpperCase()} Bed Available (${
        req.bedTypeNeeded === 'icu'
          ? hospital.availableBeds.icu
          : req.bedTypeNeeded === 'oxygen'
          ? hospital.availableBeds.oxygen
          : hospital.availableBeds.general
      } free), Doctor ${hospital.onDutyDoctor.name} On Duty, Required Facilities Confirmed.`
    : undefined;

  return {
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    tier: hospital.tier,
    distanceKm: hospital.distanceKm,
    travelTime: hospital.travelTime,
    doctorStatus: hospital.onDutyDoctor.status,
    doctorName: hospital.onDutyDoctor.name,
    doctorSpecialty: hospital.onDutyDoctor.specialty,
    specialistMatched,
    availableBeds: hospital.availableBeds,
    bedAvailable,
    facilitiesAvailable: hospital.specialities,
    missingFacilities,
    bloodBankAvailable: hospital.bloodBank,
    isSuitable,
    cascadeOrder,
    rejectionReasons,
    acceptanceReason,
  };
}

/**
 * Intelligent Cascade Emergency Routing Algorithm (SIH 133 Core)
 */
export function runCascadeEmergencyRouting(
  category: EmergencyCategory,
  hospitals: HospitalFacility[] = NEARBY_HOSPITALS_DATA
): {
  evaluatedHospitals: HospitalEvaluationDetail[];
  selectedHospital: HospitalEvaluationDetail;
  cascadeCount: number;
  timeSavedMinutes: number;
} {
  const req = deriveCapabilityRequirement(category);

  // Sort hospitals by ascending distance
  const sortedHospitals = [...hospitals].sort((a, b) => a.distanceKm - b.distanceKm);

  const evaluatedHospitals: HospitalEvaluationDetail[] = [];
  let selectedHospital: HospitalEvaluationDetail | null = null;
  let cascadeCount = 0;

  for (let i = 0; i < sortedHospitals.length; i++) {
    const hosp = sortedHospitals[i];
    const evaluation = evaluateHospitalForEmergency(hosp, req, i + 1);
    evaluatedHospitals.push(evaluation);

    if (evaluation.isSuitable && !selectedHospital) {
      selectedHospital = evaluation;
      cascadeCount = i;
    }
  }

  // Fallback: If no hospital is 100% suitable, pick the one with fewest rejection reasons
  if (!selectedHospital) {
    const sortedByRejections = [...evaluatedHospitals].sort(
      (a, b) => a.rejectionReasons.length - b.rejectionReasons.length
    );
    selectedHospital = sortedByRejections[0] || evaluatedHospitals[0];
    selectedHospital.acceptanceReason =
      'Selected as Highest Capability Referral (Closest Match with Immediate Stabilization Support)';
  }

  const timeSavedMinutes = Math.min(120, Math.max(25, cascadeCount * 38 + 22));

  return {
    evaluatedHospitals,
    selectedHospital,
    cascadeCount,
    timeSavedMinutes,
  };
}

/**
 * Generates an automated Pre-Arrival Emergency Bed Reservation Pass for hospital reception.
 */
export function generateBedReservation(
  hospital: HospitalEvaluationDetail,
  bedType: 'icu' | 'oxygen' | 'general',
  patientName: string
): EmergencyBedReservation {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const token = `EMERG-RES-2026-${randomSuffix}`;

  const bedNumber =
    bedType === 'icu'
      ? `ICU-BAY-0${Math.floor(1 + Math.random() * 4)}`
      : bedType === 'oxygen'
      ? `O2-TRIAGE-0${Math.floor(1 + Math.random() * 6)}`
      : `CASUALTY-BED-0${Math.floor(1 + Math.random() * 8)}`;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    reservationToken: token,
    bedType,
    bedNumber,
    hospitalId: hospital.hospitalId,
    hospitalName: hospital.hospitalName,
    reservedAt: `Today, ${timeStr}`,
    expiresInMinutes: 45,
    status: 'Pre_Reserved',
    receptionDeskPhone: '+91 3224 269262',
    receptionistOnDuty: 'Officer Debashis Mitra (Casualty Desk 1)',
    traumaTeamAlerted: true,
    qrVerificationCode: `ABDM:HFR:${hospital.hospitalId}:EMERG:${token}:${encodeURIComponent(patientName)}`,
  };
}

/**
 * Selects the optimal ambulance type and builds dual-point GPS navigation.
 */
export function dispatchAmbulanceForEmergency(
  category: EmergencyCategory,
  patientLocation: { lat: number; lng: number; address: string; village: string },
  destinationHospital: HospitalEvaluationDetail
): EmergencyAmbulanceDispatch {
  const meta = EMERGENCY_ARCHETYPES[category] || EMERGENCY_ARCHETYPES.general_casualty;
  const ambType = meta.ambulanceTypeNeeded;
  const driverPreset = DEFAULT_AMBULANCE_DRIVERS[ambType];

  const rideId = `108-DISPATCH-${Math.floor(10000 + Math.random() * 90000)}`;
  const eta = Math.max(5, Math.round(destinationHospital.distanceKm * 1.8) + 3);

  return {
    rideId,
    ambulanceType: ambType,
    vehicleNumber: driverPreset.vehicleNumber,
    vehicleModel: driverPreset.vehicleModel,
    driverName: driverPreset.driver.name,
    driverPhone: driverPreset.driver.phone,
    paramedicName: driverPreset.driver.onboardParamedic.name,
    paramedicDesignation: driverPreset.driver.onboardParamedic.designation,
    pickupGps: patientLocation,
    destinationHospitalGps: {
      lat: 22.0562,
      lng: 88.0692,
      name: destinationHospital.hospitalName,
      address: `${destinationHospital.hospitalName}, Haldia`,
    },
    etaMinutes: eta,
    distanceKm: destinationHospital.distanceKm,
    currentProgressPercent: 12,
    status: 'Dispatched',
  };
}

/**
 * Initializes the 5-Way War Room Stakeholder coordination state.
 */
export function initializeStakeholders(
  patientName: string,
  category: EmergencyCategory,
  ashaName: string = 'Meena Devi (ASHA Sangini)',
  hospitalName: string = 'Dr. B. C. Roy Hospital (IIMSAR)',
  doctorName: string = 'Dr. Debabrata Roy (MD, Emergency Medicine)',
  bedNumber: string = 'ICU-BAY-02'
): StakeholderCoordinationStatus {
  const meta = EMERGENCY_ARCHETYPES[category] || EMERGENCY_ARCHETYPES.general_casualty;

  return {
    patient: {
      status: 'Emergency Alert Raised • Reassurance Protocol Active',
      instructions: [
        'Keep the patient calm and in a seated/semi-recumbent position.',
        'Loosen any tight clothing around neck and chest.',
        'Do not offer water or solid food if vomiting or drowsy.',
        'Keep patient ABHA card / Aadhaar handy for swift casualty triage.',
      ],
      reassuranceNote:
        '108 Ambulance is en route and an emergency bed has been pre-locked at the hospital. Stay calm.',
    },
    ashaWorker: {
      name: ashaName,
      phone: '+91 98261 44108',
      status: 'On-Ground Frontline Escort Alerted',
      actionChecklist: [
        'Verify airway, breathing, and circulation (ABC)',
        'Check doorstep pulse rate and SpO2 using pulse oximeter',
        'Accompany patient to the ambulance or guide pilot to the exact lane',
        'Transmit emergency summary via InstaCure app',
      ],
      isDoorstepPresent: true,
    },
    ambulance: {
      status: `En Route • GPS Tracked (${meta.ambulanceTypeNeeded})`,
      etaMinutes: 6,
      telemetry: 'Speed: 52 km/h • Siren: ACTIVE • Oxygen Line: Primed & Ready',
    },
    hospitalReception: {
      status: 'Pre-Arrival Notice Acknowledged • Bed Locked',
      bedNumber: bedNumber,
      stretcherTeamReady: true,
      casualtyDeskNotes: `Patient ${patientName} (${meta.name}) incoming. Stretcher team on standby at Bay 1.`,
    },
    doctor: {
      name: doctorName,
      specialty: meta.requiredSpecialist,
      status: 'Specialist Notified & Reviewing Case Profile',
      clinicalPreBrief: `Incoming case: ${meta.name}. Trauma bay equipped with ventilator, suction, and emergency meds.`,
      traumaBayEquipped: true,
    },
  };
}

/**
 * Creates a complete active coordination session.
 */
export function createEmergencySession(params: {
  category: EmergencyCategory;
  requesterRole: 'patient' | 'asha_worker';
  requesterName: string;
  requesterPhone: string;
  patientName: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';
  patientAbhaId?: string;
  patientVillage?: string;
  landmark?: string;
  chiefComplaint?: string;
}): EmergencyCoordinationSession {
  const meta = EMERGENCY_ARCHETYPES[params.category] || EMERGENCY_ARCHETYPES.general_casualty;
  const routing = runCascadeEmergencyRouting(params.category);
  const bedRes = generateBedReservation(routing.selectedHospital, meta.requiredBedType, params.patientName);

  const patientLocation = {
    lat: 22.0538,
    lng: 88.0725,
    address: `${params.landmark || 'Near Panchayat Bhawan / Primary School'}, ${params.patientVillage || 'Gram Sihore'}`,
    village: params.patientVillage || 'Gram Sihore',
  };

  const ambDispatch = dispatchAmbulanceForEmergency(params.category, patientLocation, routing.selectedHospital);

  const stakeholders = initializeStakeholders(
    params.patientName,
    params.category,
    params.requesterRole === 'asha_worker' ? params.requesterName : 'Meena Devi (ASHA Sangini)',
    routing.selectedHospital.hospitalName,
    routing.selectedHospital.doctorName,
    bedRes.bedNumber
  );

  return {
    id: `SIH-EMERG-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    category: params.category,
    categoryMeta: meta,
    requesterRole: params.requesterRole,
    requesterName: params.requesterName,
    requesterPhone: params.requesterPhone,
    patientName: params.patientName,
    patientAge: params.patientAge || 48,
    patientGender: params.patientGender || 'Male',
    patientAbhaId: params.patientAbhaId || '91-8472-9103-2941',
    patientVillage: params.patientVillage || 'Gram Sihore',
    patientLocation,
    chiefComplaint: params.chiefComplaint || meta.typicalComplaints[0],
    evaluatedHospitals: routing.evaluatedHospitals,
    selectedHospital: routing.selectedHospital,
    cascadeCount: routing.cascadeCount,
    bedReservation: bedRes,
    ambulanceDispatch: ambDispatch,
    stakeholders,
    timeSavedMinutes: routing.timeSavedMinutes,
    status: 'coordinating',
  };
}
