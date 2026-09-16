export type UserRole = 'doctor' | 'patient' | 'admin' | 'asha_worker';

export type ConnectivityStatus = 'online_high' | 'online_low' | 'offline';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'ta';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  facility?: string;
  specialization?: string;
  registrationNumber?: string;
  abhaId?: string; // Ayushman Bharat Health Account ID
  village?: string;
  avatarUrl?: string;
}

export interface VitalRecord {
  id?: string;
  date: string;
  bloodPressureSys: number;
  bloodPressureDia: number;
  pulseRate: number;
  spO2: number;
  temperatureF: number;
  bloodSugarMgDl?: number;
  bloodSugarType?: 'Fasting' | 'Post-Prandial' | 'Random';
  cholesterolMgDl?: number; // Total Cholesterol mg/dL
  creatinineMgDl?: number; // Serum Creatinine mg/dL
  hemoglobinGdl?: number;
  weightKg?: number;
  sourceType?: 'ASHA_Doorstep' | 'Diagnostic_Center' | 'Self_Reported' | 'PHC_Clinic';
  conductorName?: string; // e.g., 'ASHA Meena Devi' or 'SRL / District Lab'
  diagnosticCenterName?: string;
  reportDocumentName?: string;
  aiScanConfidence?: number;
  lastUpdatedFormatted?: string;
  keyFindings?: string[];
  notes?: string;
}

export interface PrescriptionMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g., '1-0-1' or 'Once daily'
  timing: 'Before Food' | 'After Food' | 'With Food';
  durationDays: number;
  instructions?: string;
}

export interface ReportParameterFinding {
  parameter: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status: 'Normal' | 'High' | 'Low' | 'Critical';
}

export interface AttachedHealthReport {
  id: string;
  reportName: string; // e.g. 'Biochemistry & Lipid Panel', 'Complete Blood Count (CBC)'
  reportType: 'Pathology_Lab' | 'Diagnostic_Center' | 'Point_of_Care_Vitals' | 'Imaging_Radiology';
  date: string;
  facilityOrLabName: string;
  conductorOrTechnician?: string;
  verifiedByDoctor: boolean;
  doctorReviewNotes: string; // Doctor's evaluation of the report that led to this prescription
  findings: ReportParameterFinding[];
  documentName?: string;
  barcodeOrAbhaDocId?: string;
}

export interface Prescription {
  id: string;
  date: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  facility: string;
  diagnosis: string;
  symptoms: string[];
  medicines: PrescriptionMedicine[];
  advisedTests: string[];
  dietaryAdvice: string;
  followUpDate: string;
  isDispensed?: boolean;
  attachedReports?: AttachedHealthReport[];
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  abhaId: string;
  fromFacility: string;
  toFacility: string;
  specialtyRequired: string;
  reason: string;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Initiated' | 'Accepted_PHC' | 'Specialist_Review' | 'Completed' | 'Rejected';
  dateInitiated: string;
  transportArranged: boolean;
  notes?: string;
}

export interface PatientEHR {
  id: string;
  abhaId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  village: string;
  district: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  highRiskCategory?: 'High-Risk Pregnancy' | 'Severe Malnutrition' | 'Uncontrolled Diabetes/HTN' | 'Elderly High-Risk' | 'None';
  triageStatus: 'Red' | 'Amber' | 'Green';
  lastVisitDate: string;
  vitalsHistory: VitalRecord[];
  prescriptions: Prescription[];
  referrals: Referral[];
  assignedAshaWorker?: string;
  registeredFacility: string;
}

export interface TelehealthSession {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  abhaId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  scheduledTime: string;
  status: 'Waiting' | 'In-Progress' | 'Completed' | 'Cancelled';
  complaint: string;
  priority: 'High' | 'Medium' | 'Low';
  ashaAssisted: boolean;
  ashaName?: string;
  subCentre: string;
  connectionQuality: 'Good' | 'Fair' | 'Poor';
  isNewPatient?: boolean;
  verificationSource?: 'IoT_Verified' | 'ASHA_Verified' | 'Self_Reported';
  visualChecklist?: {
    consciousness: 'Alert' | 'Drowsy' | 'Unresponsive';
    breathing: 'Normal' | 'Labored' | 'Gasping';
    mobility: 'Independent' | 'Assisted' | 'Stretcher';
  };
  discordanceFlag?: {
    isDiscordant: boolean;
    warningNote: string;
    suggestedAction: string;
  };
}

export interface MedicineStock {
  id: string;
  name: string;
  genericName: string;
  category: 'Antibiotics' | 'Analgesics' | 'Maternal/Iron' | 'Cardiovascular' | 'Antidiabetic' | 'Emergency';
  form: 'Tablet' | 'Syrup' | 'Injection' | 'Ointment';
  subCentreStock: number;
  phcStock: number;
  districtHospitalStock: number;
  unit: string;
  reorderLevel: number;
  status: 'In Stock' | 'Low Stock' | 'Critical Stockout';
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  sender: 'Doctor' | 'Patient' | 'ASHA Worker';
  text: string;
  timestamp: string;
}

export interface AmbulanceDriver {
  name: string;
  phone: string;
  experienceYears: number;
  rating: number;
  completedTrips: number;
  badgeNumber: string;
  onboardParamedic: {
    name: string;
    designation: string;
    certifications: string;
  };
}

export interface AmbulanceRide {
  id: string;
  bookingTime: string;
  ambulanceType: 'BLS_108' | 'ALS_108' | 'JANANI_102';
  ambulanceTypeName: string;
  vehicleNumber: string;
  vehicleModel: string;
  pickupLocation: {
    address: string;
    village: string;
    landmark: string;
    coordinates: { x: number; y: number }; // 0 to 100 on map
  };
  destinationHospital: {
    name: string;
    facilityType: string;
    distanceKm: number;
    coordinates: { x: number; y: number };
  };
  driver: AmbulanceDriver;
  status: 'Searching' | 'Dispatched' | 'EnRoute' | 'Arrived' | 'InTransit' | 'Completed' | 'Cancelled';
  etaMinutes: number;
  distanceRemainingKm: number;
  routeProgressPercent: number; // 0 to 100
  emergencyReason: string;
  patientName: string;
  patientPhone: string;
  sirenActive: boolean;
}

export type AppointmentMode = 'Online' | 'Offline';

export type DoctorAvailabilityStatus = 'Available' | 'Busy' | 'Offline';

export interface DoctorAvailabilityInfo {
  status: DoctorAvailabilityStatus;
  statusNote?: string; // e.g. "Available for SC Bamori & Pipariya", "In OPD Ward 4"
  coveredSpokes: string[]; // e.g. ['PHC Pipariya', 'SC Bamori', 'SC Bankhedi']
  estimatedWaitMins?: number;
  lastUpdated?: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  hindiSpecialty: string;
  qualifications: string;
  experienceYears: number;
  rating: number;
  totalConsultations: number;
  facility: string;
  facilityType: 'PHC' | 'CHC' | 'District Hospital' | 'Ayushman Arogya Mandir';
  opdRoomNumber: string;
  languages: string[];
  avatarUrl: string;
  modesAvailable: AppointmentMode[];
  opdTiming: string;
  todayAvailableSlots: string[];
  tomorrowAvailableSlots: string[];
  availability?: DoctorAvailabilityInfo;
}

export interface DoctorAppointment {
  id: string;
  tokenNumber: string; // e.g. "OPD-042" or "TELE-019"
  patientId: string;
  patientName: string;
  abhaId: string;
  patientPhone: string;
  mode: AppointmentMode;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorQualification: string;
  facility: string;
  opdRoomNumber: string;
  appointmentDate: string; // "Today, 16 Sep 2026"
  timeSlot: string; // "10:30 AM - 11:00 AM"
  complaint: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  bookedAt: string;
  fee: string;
  reportingInstructions: string;
}

export interface ConsultationFeedback {
  id: string;
  consultationId: string; // appointment id or telehealth session id
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  ashaName?: string;
  subCentre?: string;
  date: string;
  overallRating: number; // 1 to 5
  communicationRating: number; // 1 to 5
  networkClarityRating: number; // 1 to 5
  medicineClarityRating: number; // 1 to 5
  tags: string[];
  comment?: string;
  beneficiaryType: 'Patient' | 'ASHA_Worker';
}

export interface DoctorQualityMetrics {
  averageRating: number;
  totalReviews: number;
  communicationPercentage: number;
  networkClarityPercentage: number;
  medicineClarityPercentage: number;
  topTags: { tag: string; count: number }[];
  recentReviews: ConsultationFeedback[];
}

export type FollowUpUrgency = 'Critical_Overdue' | 'Due_Today' | 'Upcoming_Week' | 'Resolved';

export type FollowUpCategory =
  | 'High-Risk Pregnancy (ANC)'
  | 'Severe Acute Malnutrition (SAM)'
  | 'Hypertensive Crisis / Uncontrolled BP'
  | 'Severe Diabetes / Hyperglycemia'
  | 'Elderly High-Risk / COPD';

export interface FollowUpTask {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  abhaId: string;
  village: string;
  subCentre: string;
  assignedAshaWorker: string;
  ashaPhone: string;
  category: FollowUpCategory;
  urgency: FollowUpUrgency;
  dueDate: string; // YYYY-MM-DD
  daysOffset: number; // negative = overdue days, 0 = today, positive = days remaining
  triggerReason: string; // e.g., 'Pre-eclampsia warning signs: BP 162/104 mmHg and 3+ proteinuria'
  actionRequired: string; // e.g., 'Doorstep BP re-check, urine dipstick review, fetal movement log'
  latestVitals: {
    bloodPressureSys?: number;
    bloodPressureDia?: number;
    bloodSugarMgDl?: number;
    hemoglobinGdl?: number;
    spO2?: number;
    muacCm?: number;
    weightKg?: number;
    recordedAt: string;
  };
  ashaDoorstepStatus: 'Pending' | 'Alert_Sent' | 'Completed';
  lastAshaAlertSentAt?: string;
  ashaVisitNotes?: string;
  lastDoorstepVisitDate?: string;
  doctorNotes?: string;
  status: 'Pending' | 'In_Progress' | 'Completed';
  resolvedAt?: string;
  resolutionSummary?: string;
  sourcePrescriptionId?: string;
  sourceReferralId?: string;
}
