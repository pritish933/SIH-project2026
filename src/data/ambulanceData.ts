import { AmbulanceRide, AmbulanceDriver } from '../types';

export const DEFAULT_AMBULANCE_DRIVERS: Record<'BLS_108' | 'ALS_108' | 'JANANI_102', { driver: AmbulanceDriver; vehicleModel: string; vehicleNumber: string; typeName: string }> = {
  BLS_108: {
    typeName: '108 Basic Life Support (BLS)',
    vehicleNumber: 'MP-04-AM-1084',
    vehicleModel: 'Force Traveller BLS (Dual O2 + Stretcher + Suction)',
    driver: {
      name: 'Rameshwar "Ramesh" Singh',
      phone: '+91 98261 44108',
      experienceYears: 12,
      rating: 4.9,
      completedTrips: 1420,
      badgeNumber: 'EMRI-PILOT-8821',
      onboardParamedic: {
        name: 'EMT Suresh Patel',
        designation: 'Certified Emergency Medical Technician (EMT-B)',
        certifications: 'BLS / CPR / Advanced Trauma Care',
      },
    },
  },
  ALS_108: {
    typeName: '108 Advanced Cardiac Life Support (ALS ICU)',
    vehicleNumber: 'MP-04-IC-1088',
    vehicleModel: 'Tata Winger Critical Care ICU Mobile Unit (Ventilator + AED)',
    driver: {
      name: 'Vikram Singh Rathore',
      phone: '+91 94250 88108',
      experienceYears: 9,
      rating: 4.95,
      completedTrips: 980,
      badgeNumber: 'EMRI-PILOT-4109',
      onboardParamedic: {
        name: 'Dr. Ankit Saxena',
        designation: 'Emergency Medical Officer & Critical Care Specialist',
        certifications: 'ACLS / ATLS / Airway Management',
      },
    },
  },
  JANANI_102: {
    typeName: '102 Janani Shishu Express (Maternal/Infant)',
    vehicleNumber: 'MP-04-JS-1022',
    vehicleModel: 'Mahindra Bolero Neo Special Obstetric Care Unit',
    driver: {
      name: 'Dinesh Kumar Yadav',
      phone: '+91 97532 10202',
      experienceYears: 8,
      rating: 4.88,
      completedTrips: 1150,
      badgeNumber: 'JANANI-PILOT-2204',
      onboardParamedic: {
        name: 'Suman Devi (ANM / SBA)',
        designation: 'Skilled Birth Attendant & Neonatal Nurse',
        certifications: 'Dakshata SBA / NSSK Neonatal Resuscitation',
      },
    },
  },
};

// Route points along rural road from PHC Station to Patient's Home in Village Sihore
// Represented as (x%, y%) coordinates on our stylized vector map
export const AMBULANCE_ROUTE_COORDINATES: Array<{ x: number; y: number; label?: string }> = [
  { x: 18, y: 22, label: 'PHC Station / Ambulance Depot' },
  { x: 28, y: 24 },
  { x: 36, y: 31, label: 'Narmada Canal Bridge' },
  { x: 44, y: 40 },
  { x: 50, y: 48, label: 'Kala Peepal Tri-Junction' },
  { x: 58, y: 52 },
  { x: 67, y: 59, label: 'Gram Sihore Village Gate' },
  { x: 74, y: 68 },
  { x: 80, y: 74, label: 'Patient Home / Sub-Centre Sihore' },
];

export function getPositionOnRoute(progressPercent: number): { x: number; y: number; angle: number } {
  const clamped = Math.max(0, Math.min(100, progressPercent));
  const totalSegments = AMBULANCE_ROUTE_COORDINATES.length - 1;
  const scaled = (clamped / 100) * totalSegments;
  const index = Math.min(Math.floor(scaled), totalSegments - 1);
  const fraction = scaled - index;

  const p1 = AMBULANCE_ROUTE_COORDINATES[index];
  const p2 = AMBULANCE_ROUTE_COORDINATES[index + 1] || p1;

  const x = p1.x + (p2.x - p1.x) * fraction;
  const y = p1.y + (p2.y - p1.y) * fraction;

  // Calculate angle of heading
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return { x, y, angle };
}

// Initial demo ride so that if a user opens live tracking right away, there is already an active ride progressing!
export const INITIAL_DEMO_RIDE: AmbulanceRide = {
  id: 'AMB-108-9941',
  bookingTime: 'Just now (10:42 AM)',
  ambulanceType: 'BLS_108',
  ambulanceTypeName: '108 Basic Life Support (BLS)',
  vehicleNumber: 'MP-04-AM-1084',
  vehicleModel: 'Force Traveller BLS (Dual O2 + Stretcher)',
  pickupLocation: {
    address: 'Near Village Panchayat & Primary School, Gram Sihore',
    village: 'Gram Sihore, Pipariya Block',
    landmark: 'Hanuman Mandir Chowk',
    coordinates: { x: 80, y: 74 },
  },
  destinationHospital: {
    name: 'Community Health Centre (CHC) Pipariya',
    facilityType: 'Secondary Referral Hospital (24x7 Emergency & OT)',
    distanceKm: 4.8,
    coordinates: { x: 18, y: 22 },
  },
  driver: DEFAULT_AMBULANCE_DRIVERS.BLS_108.driver,
  status: 'EnRoute',
  etaMinutes: 5,
  distanceRemainingKm: 2.3,
  routeProgressPercent: 42,
  emergencyReason: 'Severe Chest Discomfort & Stage 2 Hypertension (154/96 mmHg)',
  patientName: 'Ram Prasad Verma (Age 54)',
  patientPhone: '+91 94258 77102',
  sirenActive: true,
};
