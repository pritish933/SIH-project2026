export type HospitalTier =
  | 'Sub-Centre'
  | 'PHC'
  | 'CHC'
  | 'SDH'
  | 'District Hospital'
  | 'Apex Institute'
  | 'Empaneled Private';

export interface HospitalFacility {
  id: string;
  name: string;
  hindiName: string;
  bengaliName: string;
  tier: HospitalTier;
  tierLabel: string;
  distanceKm: number;
  travelTime: string;
  address: string;
  block: string;
  district: string;
  phone: string;
  emergencyPhone?: string;
  emergency24x7: boolean;
  pmjayEmpaneled: boolean; // Swasthya Sathi & Ayushman PM-JAY
  bloodBank: boolean;
  totalBeds: number;
  availableBeds: {
    general: number;
    oxygen: number;
    icu: number;
    emergency: number; // Emergency Beds
  };
  ambulancesCount: number; // Ambulances available
  staff: {
    doctorsOnDutyCount: number;
    emergencyTeamCount: number;
    isDoctorAvailable: boolean;
    activeDoctorName?: string;
    activeDoctorSpecialty?: string;
  };
  lastUpdatedMinutesAgo: number;
  lastUpdatedTimestamp?: string;
  specialities: string[];
  onDutyDoctor: {
    name: string;
    specialty: string;
    status: 'On Duty' | 'On Call' | 'In Surgery';
  };
  coordinates: {
    lat: number;
    lng: number;
    x: number; // radar map percentage
    y: number;
  };
  rating: number;
  verifiedAbdm: boolean;
  hfrFacilityId: string;
  description: string;
  ambulanceAvailable: boolean;
  googleMapsUrl: string;
  googleSearchQuery: string;
}

export const CURRENT_REFERENCE_LOCATION = {
  name: 'Haldia Institute of Technology (HIT Campus)',
  hindiName: 'हल्दिया इंस्टीट्यूट ऑफ टेक्नोलॉजी (HIT परिसर)',
  bengaliName: 'হলদিয়া ইনস্টিটিউট অফ টেকনোলজি (HIT ক্যাম্পাস)',
  address: 'ICARE Complex, HIT Campus, Hatiberia, Haldia, Purba Medinipur, West Bengal - 721657',
  lat: 22.0538,
  lng: 88.0725,
  pincode: '721657',
  district: 'Purba Medinipur',
  state: 'West Bengal',
};

export const NEARBY_HOSPITALS_DATA: HospitalFacility[] = [
  {
    id: 'HOSP-HIT-01',
    name: 'Dr. B. C. Roy Hospital & Medical Research (IIMSAR)',
    hindiName: 'डॉ. बी. सी. रॉय अस्पताल एवं मेडिकल कॉलेज (IIMSAR)',
    bengaliName: 'ডাঃ বিধানচন্দ্র রায় হাসপাতাল (আইআইএমএসএআর)',
    tier: 'District Hospital',
    tierLabel: 'Medical College & Tertiary Hospital (IIMSAR)',
    distanceKm: 0.4,
    travelTime: '2 mins (Walking / Campus Gate)',
    address: 'ICARE Complex, Banbishnupur, PO Balughata, Next to HIT, Haldia',
    block: 'Haldia Municipality',
    district: 'Purba Medinipur',
    phone: '+91 3224 269261',
    emergencyPhone: '+91 3224 269262',
    emergency24x7: true,
    pmjayEmpaneled: true,
    bloodBank: true,
    totalBeds: 500,
    availableBeds: {
      icu: 3,
      oxygen: 7,
      general: 18,
      emergency: 4,
    },
    ambulancesCount: 2,
    staff: {
      doctorsOnDutyCount: 5,
      emergencyTeamCount: 2,
      isDoctorAvailable: true,
      activeDoctorName: 'Dr. Debabrata Roy (MD, Emergency Medicine)',
      activeDoctorSpecialty: 'Casualty Medical Officer & Critical Care',
    },
    lastUpdatedMinutesAgo: 2,
    lastUpdatedTimestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    specialities: ['24x7 Emergency Trauma & Resuscitation', 'Critical Care ICU / CCU', 'General & Laparoscopic Surgery', 'Obstetrics & Neonatal Care', 'Licensed Blood Bank', 'Digital X-Ray & CT Scan'],
    onDutyDoctor: {
      name: 'Dr. Debabrata Roy (MD, Emergency Medicine)',
      specialty: 'Casualty Medical Officer & Critical Care',
      status: 'On Duty',
    },
    coordinates: {
      lat: 22.0562,
      lng: 88.0692,
      x: 48,
      y: 47,
    },
    rating: 4.8,
    verifiedAbdm: true,
    hfrFacilityId: 'IN-WB-HFR-70192',
    description: 'Premier 500-bed multi-specialty medical college hospital directly adjacent to HIT campus. 24x7 Emergency casualty, full trauma team, and Swasthya Sathi / PM-JAY cashless counter.',
    ambulanceAvailable: true,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dr+BC+Roy+Hospital+Haldia',
    googleSearchQuery: 'Dr. B. C. Roy Hospital IIMSAR Haldia West Bengal',
  },
  {
    id: 'HOSP-HIT-02',
    name: 'Haldia Sub-Divisional Hospital (Govt SDH)',
    hindiName: 'हल्दिया उप-मंडल अस्पताल (सरकारी SDH दुर्गाचक)',
    bengaliName: 'হলদিয়া মহকুমা হাসপাতাল (দুর্গাচক)',
    tier: 'SDH',
    tierLabel: 'Sub-Divisional Govt Hospital (SDH)',
    distanceKm: 4.5,
    travelTime: '10 mins (Via Durgachak Station Road)',
    address: 'Purba Srikrishnapur, Near Durgachak Railway Stn, Haldia',
    block: 'Haldia Municipality',
    district: 'Purba Medinipur',
    phone: '+91 3224 274333',
    emergencyPhone: '108 / 102',
    emergency24x7: true,
    pmjayEmpaneled: true,
    bloodBank: true,
    totalBeds: 150,
    availableBeds: {
      icu: 2,
      oxygen: 12,
      general: 28,
      emergency: 5,
    },
    ambulancesCount: 3,
    staff: {
      doctorsOnDutyCount: 4,
      emergencyTeamCount: 2,
      isDoctorAvailable: true,
      activeDoctorName: 'Dr. Subhashis Sen (MS, General Surgery)',
      activeDoctorSpecialty: 'Sub-Divisional Medical Officer (SMO)',
    },
    lastUpdatedMinutesAgo: 5,
    lastUpdatedTimestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    specialities: ['24x7 Casualty & Emergency', 'Govt Fair Price Medicine Shop', 'Maternal Delivery & SNCU', 'Dialysis Centre (PMNDP Free)', 'Free Diagnostic Pathology'],
    onDutyDoctor: {
      name: 'Dr. Subhashis Sen (MS, General Surgery)',
      specialty: 'Sub-Divisional Medical Officer (SMO)',
      status: 'On Duty',
    },
    coordinates: {
      lat: 22.0625,
      lng: 88.1145,
      x: 74,
      y: 35,
    },
    rating: 4.6,
    verifiedAbdm: true,
    hfrFacilityId: 'IN-WB-HFR-30114',
    description: 'Major state government referral hospital in Durgachak. Free medical consultations, government free medicines, and 24x7 emergency casualty.',
    ambulanceAvailable: true,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Haldia+Sub+Divisional+Hospital+Durgachak',
    googleSearchQuery: 'Haldia Sub-Divisional Hospital Durgachak West Bengal',
  },
  {
    id: 'HOSP-HIT-03',
    name: 'Haldia Port Hospital (CPT Port Trust Hospital)',
    hindiName: 'हल्दिया पोर्ट ट्रस्ट अस्पताल (CPT हॉस्पिटल)',
    bengaliName: 'হলদিয়া পোর্ট ট্রাস্ট হাসপাতাল',
    tier: 'CHC',
    tierLabel: 'Port Trust Health Facility (CPT)',
    distanceKm: 5.2,
    travelTime: '12 mins (Port Township Corridor)',
    address: 'Chiranjibpur, Port Colony, Haldia Township',
    block: 'Haldia Port Area',
    district: 'Purba Medinipur',
    phone: '+91 3224 252115',
    emergencyPhone: '+91 3224 252108',
    emergency24x7: true,
    pmjayEmpaneled: true,
    bloodBank: false,
    totalBeds: 60,
    availableBeds: {
      icu: 1,
      oxygen: 6,
      general: 14,
      emergency: 2,
    },
    ambulancesCount: 2,
    staff: {
      doctorsOnDutyCount: 2,
      emergencyTeamCount: 1,
      isDoctorAvailable: true,
      activeDoctorName: 'Dr. P. K. Bandyopadhyay (MBBS, DNB)',
      activeDoctorSpecialty: 'Senior Port Medical Officer',
    },
    lastUpdatedMinutesAgo: 10,
    lastUpdatedTimestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    specialities: ['First Aid & Trauma Stabilization', 'Occupational Medicine & Triage', 'Ambulance Evacuation Unit', 'General Physician OPD', 'Cardiac Monitoring'],
    onDutyDoctor: {
      name: 'Dr. P. K. Bandyopadhyay (MBBS, DNB)',
      specialty: 'Senior Port Medical Officer',
      status: 'On Call',
    },
    coordinates: {
      lat: 22.0255,
      lng: 88.1065,
      x: 68,
      y: 72,
    },
    rating: 4.5,
    verifiedAbdm: true,
    hfrFacilityId: 'IN-WB-HFR-55091',
    description: 'Dedicated port healthcare facility with round-the-clock emergency support, modern ambulance fleet, and direct linkage to Kolkata trauma centres.',
    ambulanceAvailable: true,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Haldia+Port+Trust+Hospital',
    googleSearchQuery: 'Haldia Port Hospital Chiranjibpur West Bengal',
  },
  {
    id: 'HOSP-HIT-04',
    name: 'Durgachak Urban Primary Health Centre (UPHC)',
    hindiName: 'दुर्गाचक शहरी प्राथमिक स्वास्थ्य केंद्र (UPHC)',
    bengaliName: 'দুর্গাচক আরবান প্রাইমারি হেলথ সেন্টার',
    tier: 'PHC',
    tierLabel: 'Urban Primary Health Centre (UPHC)',
    distanceKm: 3.8,
    travelTime: '8 mins (Township Link)',
    address: 'Near Durgachak Super Market & Bus Stand, Haldia',
    block: 'Haldia Municipality',
    district: 'Purba Medinipur',
    phone: '+91 3224 276100',
    emergencyPhone: '104 (Health Help)',
    emergency24x7: false,
    pmjayEmpaneled: true,
    bloodBank: false,
    totalBeds: 10,
    availableBeds: {
      icu: 0,
      oxygen: 2,
      general: 5,
      emergency: 1,
    },
    ambulancesCount: 1,
    staff: {
      doctorsOnDutyCount: 1,
      emergencyTeamCount: 1,
      isDoctorAvailable: true,
      activeDoctorName: 'Dr. Shampa Das (MBBS)',
      activeDoctorSpecialty: 'Municipal Medical Officer',
    },
    lastUpdatedMinutesAgo: 15,
    lastUpdatedTimestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    specialities: ['Daily General OPD', 'National Immunization Day (Pulse Polio)', 'NCD Checkup (Diabetes & BP)', 'Maternal & Antenatal Checkups', 'Free Govt Drug Dispensing'],
    onDutyDoctor: {
      name: 'Dr. Shampa Das (MBBS)',
      specialty: 'Municipal Medical Officer',
      status: 'On Duty',
    },
    coordinates: {
      lat: 22.0680,
      lng: 88.1110,
      x: 62,
      y: 38,
    },
    rating: 4.4,
    verifiedAbdm: true,
    hfrFacilityId: 'IN-WB-HFR-22901',
    description: 'Neighborhood municipal primary health centre. Fast OPD consultation, free blood glucose / BP tests, and maternal care.',
    ambulanceAvailable: false,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Durgachak+Health+Center+Haldia',
    googleSearchQuery: 'Durgachak Urban Primary Health Centre Haldia West Bengal',
  },
  {
    id: 'HOSP-HIT-05',
    name: 'Ramakrishna Sarada Mission Matri Bhavan & Netralaya',
    hindiName: 'रामकृष्ण शारदा मिशन मातृ भवन व नेत्रालय',
    bengaliName: 'রামকৃষ্ণ সারদা মিশন মাতৃভবন ও নেত্রালয়',
    tier: 'Empaneled Private',
    tierLabel: 'Charitable Multi-Speciality & Eye Institute',
    distanceKm: 4.1,
    travelTime: '9 mins (Brajanathchak Road)',
    address: 'Brajanathchak, Durgachak, Haldia',
    block: 'Haldia Municipality',
    district: 'Purba Medinipur',
    phone: '+91 3224 274045',
    emergencyPhone: '+91 3224 274046',
    emergency24x7: true,
    pmjayEmpaneled: true,
    bloodBank: false,
    totalBeds: 40,
    availableBeds: {
      icu: 1,
      oxygen: 4,
      general: 11,
      emergency: 2,
    },
    ambulancesCount: 1,
    staff: {
      doctorsOnDutyCount: 3,
      emergencyTeamCount: 1,
      isDoctorAvailable: true,
      activeDoctorName: 'Dr. Sougata Mukherjee (MS Ophthalmology)',
      activeDoctorSpecialty: 'Chief Eye Surgeon & Senior Consultant',
    },
    lastUpdatedMinutesAgo: 8,
    lastUpdatedTimestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    specialities: ['Advanced Ophthalmology (Micro-surgery & Phaco)', 'Maternal Mother & Child Care', 'Clean Low-Cost Inpatient Ward', 'Pathological Diagnostic Laboratory', 'Emergency Eye Injury Service'],
    onDutyDoctor: {
      name: 'Dr. Sougata Mukherjee (MS Ophthalmology)',
      specialty: 'Chief Eye Surgeon & Senior Consultant',
      status: 'On Duty',
    },
    coordinates: {
      lat: 22.0710,
      lng: 88.0980,
      x: 58,
      y: 30,
    },
    rating: 4.9,
    verifiedAbdm: true,
    hfrFacilityId: 'IN-WB-HFR-66209',
    description: 'Highly acclaimed charitable healthcare hospital in Haldia with modern eye operation theatre, low-cost patient care, and Swasthya Sathi cashless empanelment.',
    ambulanceAvailable: true,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ramakrishna+Sarada+Mission+Netralaya+Haldia',
    googleSearchQuery: 'Ramakrishna Sarada Mission Netralaya Haldia West Bengal',
  },
  {
    id: 'HOSP-HIT-06',
    name: 'Jeevan Suraksha / Mediland Multi-Speciality Nursing Home',
    hindiName: 'जीवन सुरक्षा / मेडीलैंड मल्टी-स्पेशियलिटी अस्पताल',
    bengaliName: 'জীবন সুরক্ষা নার্সিং হোম (এইচপিএল লিঙ্ক রোড)',
    tier: 'Empaneled Private',
    tierLabel: 'Private Multi-Speciality (Swasthya Sathi)',
    distanceKm: 4.8,
    travelTime: '11 mins (Via HPL Link Road)',
    address: 'HPL Link Road, Manjushree Crossing, Durgachak, Haldia',
    block: 'Haldia Industrial Belt',
    district: 'Purba Medinipur',
    phone: '+91 3224 275880',
    emergencyPhone: '+91 3224 275888',
    emergency24x7: true,
    pmjayEmpaneled: true,
    bloodBank: true,
    totalBeds: 55,
    availableBeds: {
      icu: 3,
      oxygen: 6,
      general: 12,
      emergency: 3,
    },
    ambulancesCount: 2,
    staff: {
      doctorsOnDutyCount: 3,
      emergencyTeamCount: 1,
      isDoctorAvailable: true,
      activeDoctorName: 'Dr. Indranil Ghosh (MD, DNB Cardiology)',
      activeDoctorSpecialty: 'Critical Care & Interventional Specialist',
    },
    lastUpdatedMinutesAgo: 12,
    lastUpdatedTimestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    specialities: ['Swasthya Sathi & PM-JAY Cashless', 'Advanced ICU & Mechanical Ventilator', 'Dialysis Unit (24x7)', 'Laparoscopic Surgery OT', 'Digital Sonography & Echocardiography'],
    onDutyDoctor: {
      name: 'Dr. Indranil Ghosh (MD, DNB Cardiology)',
      specialty: 'Critical Care & Interventional Specialist',
      status: 'On Duty',
    },
    coordinates: {
      lat: 22.0650,
      lng: 88.1020,
      x: 64,
      y: 42,
    },
    rating: 4.7,
    verifiedAbdm: true,
    hfrFacilityId: 'IN-WB-HFR-88120',
    description: 'Premier private multi-specialty nursing home on HPL Link Road. Fast-track emergency admissions, critical care ICU beds, and full health card assistance.',
    ambulanceAvailable: true,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Mediland+Nursing+Home+HPL+Link+Road+Haldia',
    googleSearchQuery: 'Mediland Nursing Home HPL Link Road Haldia West Bengal',
  },
  {
    id: 'HOSP-HIT-07',
    name: 'Sutahata Block Primary Health Centre (BPHC Sutahata)',
    hindiName: 'सुताहाटा ब्लॉक प्राथमिक स्वास्थ्य केंद्र (BPHC)',
    bengaliName: 'সুতাহাটা ব্লক প্রাথমিক স্বাস্থ্য কেন্দ্র (বিপিএইচসি)',
    tier: 'CHC',
    tierLabel: 'Rural Block Primary Health Centre (BPHC)',
    distanceKm: 9.8,
    travelTime: '18 mins (State Highway 4)',
    address: 'Sutahata Block More, Near BDO Office, Sutahata',
    block: 'Sutahata Rural Block',
    district: 'Purba Medinipur',
    phone: '+91 3224 282220',
    emergencyPhone: '108 (Rural SOS)',
    emergency24x7: true,
    pmjayEmpaneled: true,
    bloodBank: false,
    totalBeds: 30,
    availableBeds: {
      icu: 0,
      oxygen: 4,
      general: 9,
      emergency: 2,
    },
    ambulancesCount: 1,
    staff: {
      doctorsOnDutyCount: 2,
      emergencyTeamCount: 1,
      isDoctorAvailable: true,
      activeDoctorName: 'Dr. Partha Sarathi Maity (MBBS, DCH)',
      activeDoctorSpecialty: 'Block Medical Officer of Health (BMOH)',
    },
    lastUpdatedMinutesAgo: 20,
    lastUpdatedTimestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    specialities: ['24x7 Rural Emergency Delivery', 'Newborn Care Corner (NBCC)', 'ASHA Frontline Referral Linkage', 'Cold Chain Vaccine Hub', 'Basic X-Ray & Pathological Tests'],
    onDutyDoctor: {
      name: 'Dr. Partha Sarathi Maity (MBBS, DCH)',
      specialty: 'Block Medical Officer of Health (BMOH)',
      status: 'On Duty',
    },
    coordinates: {
      lat: 22.1380,
      lng: 88.0820,
      x: 52,
      y: 12,
    },
    rating: 4.5,
    verifiedAbdm: true,
    hfrFacilityId: 'IN-WB-HFR-41009',
    description: 'Rural block hub connecting 24 gram panchayats with sub-centres. Round-the-clock delivery room and ASHA emergency transport linkage.',
    ambulanceAvailable: true,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sutahata+BPHC+Hospital+Purba+Medinipur',
    googleSearchQuery: 'Sutahata BPHC Rural Hospital West Bengal',
  },
  {
    id: 'HOSP-HIT-08',
    name: 'Nandigram District Super Speciality Hospital',
    hindiName: 'नंदीग्राम सुपर स्पेशियलिटी अस्पताल',
    bengaliName: 'নন্দীগ্রাম সুপার স্পেশালিটি হাসপাতাল',
    tier: 'Apex Institute',
    tierLabel: 'District Super Speciality Hospital (Govt)',
    distanceKm: 14.2,
    travelTime: '28 mins (Via Haldi River Ferry / Bypass)',
    address: 'Kendemari, Nandigram, Purba Medinipur',
    block: 'Nandigram',
    district: 'Purba Medinipur',
    phone: '+91 3224 231108',
    emergencyPhone: '108 / 112',
    emergency24x7: true,
    pmjayEmpaneled: true,
    bloodBank: true,
    totalBeds: 300,
    availableBeds: {
      icu: 6,
      oxygen: 19,
      general: 48,
      emergency: 8,
    },
    ambulancesCount: 4,
    staff: {
      doctorsOnDutyCount: 6,
      emergencyTeamCount: 3,
      isDoctorAvailable: true,
      activeDoctorName: 'Dr. Tanmay Roy (MS Ortho, MCh)',
      activeDoctorSpecialty: 'Superintendent & Trauma Lead',
    },
    lastUpdatedMinutesAgo: 14,
    lastUpdatedTimestamp: new Date(Date.now() - 14 * 60000).toISOString(),
    specialities: ['Tertiary Trauma & Critical Care', 'Cardiology & CCU Monitoring', 'Hemodialysis Unit', 'High-Risk Delivery & Special Newborn Care (SNCU)', 'Modern Central Blood Bank'],
    onDutyDoctor: {
      name: 'Dr. Tanmay Roy (MS Ortho, MCh)',
      specialty: 'Superintendent & Trauma Lead',
      status: 'On Duty',
    },
    coordinates: {
      lat: 22.0080,
      lng: 87.9890,
      x: 20,
      y: 84,
    },
    rating: 4.7,
    verifiedAbdm: true,
    hfrFacilityId: 'IN-WB-HFR-10088',
    description: '300-bed modern state-of-the-art super-speciality government hospital. Complete trauma centre, hemodialysis, and blood component separation unit.',
    ambulanceAvailable: true,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Nandigram+Super+Speciality+Hospital',
    googleSearchQuery: 'Nandigram Super Speciality Hospital Purba Medinipur West Bengal',
  },
];
