export type SchemeCategory =
  | 'hospitalization'
  | 'maternal_child'
  | 'medicines'
  | 'dbt_financial'
  | 'chronic_care'
  | 'digital_health';

export interface GovtScheme {
  id: string;
  name: string;
  hindiName: string;
  bengaliName: string;
  category: SchemeCategory;
  categoryLabel: string;
  ministry: string;
  stateOrCentral: 'Central' | 'West Bengal' | 'National Mission';
  benefitAmount: string;
  benefitSummary: string;
  eligibility: string[];
  requiredDocuments: string[];
  howToApply: string[];
  helpline: string;
  officialPortal: string;
  isNewAnnouncement?: boolean;
  announcementDate?: string;
  gazetteNumber?: string;
  applicationMode: 'Online & CSC' | 'Hospital Helpdesk' | 'ASHA / Anganwadi' | 'Automatic via Ration Card';
}

export const INITIAL_GOVT_SCHEMES: GovtScheme[] = [
  {
    id: 'SCHEME-PMJAY-01',
    name: 'Ayushman Bharat - PM-JAY',
    hindiName: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (PM-JAY)',
    bengaliName: 'আয়ুষ্মান ভারত - প্রধানমন্ত্রী জন আরোগ্য যোজনা',
    category: 'hospitalization',
    categoryLabel: 'Cashless Hospitalization',
    ministry: 'National Health Authority (NHA) & MoHFW',
    stateOrCentral: 'Central',
    benefitAmount: '₹5,00,000 / Family / Year',
    benefitSummary: 'Completely cashless and paperless hospitalization for secondary and tertiary critical illnesses at empaneled public & private hospitals.',
    eligibility: [
      'Identified BPL / SECC 2011 database families',
      'Active NFSA (Priority Household / Antyodaya) ration card holders',
      'Vulnerable rural households (landless, single room kutcha house)',
      'No cap on family size or age of family members',
    ],
    requiredDocuments: [
      'Aadhaar Card of all family members',
      'Ration Card / Family ID document',
      'Mobile number linked with Aadhaar (for OTP)',
      'ABHA ID (Ayushman Bharat Health Account)',
    ],
    howToApply: [
      '1. Visit nearest Ayushman Mitra kiosk at any Government Hospital (e.g. Haldia SDH or BCR Roy Hospital).',
      '2. Present your Aadhaar Card and Ration Card to check instant eligibility.',
      '3. Biometric / OTP e-KYC will be completed on the spot.',
      '4. Receive instant PVC or digital Ayushman Golden Card.',
    ],
    helpline: '14555 (National Toll-Free 24x7)',
    officialPortal: 'https://pmjay.gov.in',
    applicationMode: 'Hospital Helpdesk',
  },
  {
    id: 'SCHEME-SWASTHYA-02',
    name: 'Swasthya Sathi Scheme (West Bengal)',
    hindiName: 'स्वास्थ्य साथी योजना (पश्चिम बंगाल)',
    bengaliName: 'স্বাস্থ্য সাথী প্রকল্প (পশ্চিমবঙ্গ সরকার)',
    category: 'hospitalization',
    categoryLabel: 'State Cashless Cover',
    ministry: 'Health & Family Welfare Dept, Govt. of West Bengal',
    stateOrCentral: 'West Bengal',
    benefitAmount: '₹5,00,000 / Family / Year',
    benefitSummary: 'Universal health protection scheme for all citizens of West Bengal. Smart Card issued in the name of the female head of the family.',
    eligibility: [
      'Permanent resident family of West Bengal (including Purba Medinipur/Haldia)',
      'Entire family covered without restriction on age or income limit',
      'Cover includes pre-existing diseases from Day 1',
      'Valid at 1,500+ empaneled private nursing homes and state hospitals in WB',
    ],
    requiredDocuments: [
      'Aadhaar Card of all family members',
      'Khadya Sathi Digital Ration Card (AAY/SPHH/RKSY)',
      'Passport photo of the female head of the household',
      'Proof of residence in West Bengal',
    ],
    howToApply: [
      '1. Register at your nearest Duare Sarkar camp or Municipality BDO office in Haldia/Sutahata.',
      '2. Biometric capture & photograph of the female guardian is recorded.',
      '3. Instant Swasthya Sathi Smart Card is issued.',
      '4. Flash the card at any hospital TPA desk for cashless admission.',
    ],
    helpline: '1800 345 5384 (Toll-Free WB)',
    officialPortal: 'https://swasthyasathi.gov.in',
    applicationMode: 'Online & CSC',
  },
  {
    id: 'SCHEME-VAY-VANDANA-03',
    name: 'Ayushman Vay Vandana Card (Senior Citizens 70+)',
    hindiName: 'आयुष्मान वय वंदना कार्ड (70+ वरिष्ठ नागरिक योजना)',
    bengaliName: 'আয়ুষ্মান বয় বন্দনা কার্ড (৭০+ প্রবীণ নাগরিক)',
    category: 'hospitalization',
    categoryLabel: 'Senior Citizen Universal Health',
    ministry: 'National Health Authority (NHA) & PM Office',
    stateOrCentral: 'Central',
    benefitAmount: '₹5,00,000 Dedicated Top-up Cover',
    benefitSummary: 'UNIVERSAL FREE HEALTH COVER for all Indian senior citizens aged 70 years and above, irrespective of income, caste, or pension status.',
    eligibility: [
      'All Indian citizens aged 70 years and above (as per Aadhaar age)',
      'No income limit — open to rich, middle-class, and underprivileged seniors alike',
      'Separate exclusive ₹5 Lakh cover (does not deplete the regular family PM-JAY quota)',
      'Covers pre-existing age conditions, bypass, knee replacement, stroke, cancer',
    ],
    requiredDocuments: [
      'Aadhaar Card (Mandatory date of birth verification showing 70+ years)',
      'Active mobile number for e-KYC OTP',
      'Live selfie capture during registration',
    ],
    howToApply: [
      '1. Open the Ayushman App on mobile or visit beneficiary.nha.gov.in.',
      '2. Enter senior citizen’s Aadhaar number and verify with mobile OTP.',
      '3. Select "Enroll for Vay Vandana Card (70+)".',
      '4. Instant digital card is generated with distinctive purple senior badge.',
    ],
    helpline: '14555 (Toll-Free Senior Care)',
    officialPortal: 'https://beneficiary.nha.gov.in',
    isNewAnnouncement: true,
    announcementDate: 'Recent Cabinet Gazette',
    gazetteNumber: 'CG-DL-E-29102024-25678',
    applicationMode: 'Online & CSC',
  },
  {
    id: 'SCHEME-JSSK-04',
    name: 'Janani Shishu Suraksha Karyakram (JSSK)',
    hindiName: 'जननी शिशु सुरक्षा कार्यक्रम (JSSK)',
    bengaliName: 'জননী শিশু সুরক্ষা কার্যক্রম (জেএসএসকে)',
    category: 'maternal_child',
    categoryLabel: 'Maternal & Newborn Care',
    ministry: 'National Health Mission (NHM) & MoHFW',
    stateOrCentral: 'National Mission',
    benefitAmount: '100% Cashless Zero-Expense Delivery',
    benefitSummary: 'Completely free institutional deliveries and Caesarean sections for pregnant women, plus free care for sick newborns up to 1 year of age.',
    eligibility: [
      'All pregnant women delivering in public health institutions (Sub-Centre, PHC, CHC, SDH, DH)',
      'Sick neonates up to 1 year of age receiving care at government facilities',
      'Zero out-of-pocket expenses guaranteed by law',
    ],
    requiredDocuments: [
      'Mother and Child Protection (MCP / RCH) Card from ASHA/ANM',
      'Aadhaar Card / Voter ID',
      'Bank passbook copy of the mother (for DBT incentives)',
    ],
    howToApply: [
      '1. Contact your village ASHA worker or ANM sister upon confirming pregnancy.',
      '2. Register for the MCP Card at nearest Sub-Centre / Ayushman Arogya Mandir.',
      '3. Dial 102 for free ambulance pick-up to hospital during labor.',
      '4. All medicines, blood transfusions, lab tests, and food during stay are 100% free.',
    ],
    helpline: '102 (Free Janani Shishu Ambulance) / 108',
    officialPortal: 'https://nhm.gov.in',
    applicationMode: 'ASHA / Anganwadi',
  },
  {
    id: 'SCHEME-PMMVY-05',
    name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    hindiName: 'प्रधानमंत्री मातृ वंदना योजना (PMMVY)',
    bengaliName: 'প্রধানমন্ত্রী মাতৃ বন্দনা যোজনা (পিএমএমভিওয়াই)',
    category: 'dbt_financial',
    categoryLabel: 'Direct Cash Benefit (DBT)',
    ministry: 'Ministry of Women and Child Development (MoWCD)',
    stateOrCentral: 'Central',
    benefitAmount: '₹5,000 to ₹6,000 Direct Cash Transfer',
    benefitSummary: 'Direct Benefit Transfer (DBT) cash incentive paid directly into the mother’s bank account in instalments for nutritional compensation during pregnancy.',
    eligibility: [
      'Pregnant women and lactating mothers for first living child (₹5,000 in two instalments)',
      'Additional ₹6,000 single instalment if the second child is a girl child',
      'Excludes regular central/state government employees',
    ],
    requiredDocuments: [
      'Aadhaar Card of mother and husband',
      'MCP (Mother-Child Protection) Card registration proof',
      'Aadhaar-seeded bank account passbook copy',
      'Child birth certificate (for final instalment)',
    ],
    howToApply: [
      '1. Submit Form 1A to your local Anganwadi Centre or ASHA worker within 150 days of LMP.',
      '2. Undergo at least one Antenatal Check-up (ANC).',
      '3. Funds are transferred directly via DBT to the mother’s bank account.',
    ],
    helpline: '14408 (PMMVY National Helpline)',
    officialPortal: 'https://pmmvy.wcd.gov.in',
    applicationMode: 'ASHA / Anganwadi',
  },
  {
    id: 'SCHEME-PMBJP-06',
    name: 'PM Bhartiya Janaushadhi Pariyojana (Generic Drugs)',
    hindiName: 'प्रधानमंत्री भारतीय जनऔषधि परियोजना (PMBJP)',
    bengaliName: 'প্রধানমন্ত্রী ভারতীয় জনঔষধী পরিযোজনা',
    category: 'medicines',
    categoryLabel: 'Affordable Generic Pharmacy',
    ministry: 'Department of Pharmaceuticals & Min. of Chemicals & Fertilizers',
    stateOrCentral: 'Central',
    benefitAmount: '50% to 90% Cheaper Generic Medicines',
    benefitSummary: 'Provides high-quality WHO-GMP certified generic medicines, surgical consumables, and sanitary napkins at massive discounts through Jan Aushadhi Kendras.',
    eligibility: [
      'Open to all Indian citizens without any income or identity restriction',
      'Anyone with a valid doctor prescription can purchase medicine',
      'Suvidha Oxo-Biodegradable sanitary pads at ₹1 per pad',
    ],
    requiredDocuments: [
      'Doctor Prescription (e-Prescription or handwritten OPD slip)',
      'No ID card required — direct counter purchase',
    ],
    howToApply: [
      '1. Visit the nearest Pradhan Mantri Jan Aushadhi Kendra (e.g. at Haldia SDH or Durgachak Market).',
      '2. Present your medicine list to the pharmacist.',
      '3. Get equivalent bio-equivalent generic medicines at up to 90% lower prices.',
    ],
    helpline: '1800 180 8080 (Jan Aushadhi Helpline)',
    officialPortal: 'https://janaushadhi.gov.in',
    applicationMode: 'Automatic via Ration Card',
  },
  {
    id: 'SCHEME-DIALYSIS-07',
    name: 'Pradhan Mantri National Dialysis Programme (PMNDP)',
    hindiName: 'प्रधानमंत्री राष्ट्रीय डायलिसिस कार्यक्रम (PMNDP)',
    bengaliName: 'প্রধানমন্ত্রী জাতীয় ডায়ালাইসিস কর্মসূচি',
    category: 'chronic_care',
    categoryLabel: 'Free Kidney Dialysis',
    ministry: 'National Health Mission (NHM) & MoHFW',
    stateOrCentral: 'National Mission',
    benefitAmount: '100% Free Hemodialysis Sessions',
    benefitSummary: 'Free hemodialysis for all BPL renal patients in public hospitals and subsidized rates for non-BPL patients under PPP mode.',
    eligibility: [
      'Patients diagnosed with End-Stage Renal Disease (ESRD) requiring regular dialysis',
      'Completely 100% free for BPL / NFSA ration card holders',
      'Nominal government rates for other categories',
    ],
    requiredDocuments: [
      'Nephrologist / Medical Officer prescription recommending dialysis',
      'BPL Card / Khadya Sathi / Ayushman Card',
      'Aadhaar Card & recent Serum Creatinine / Renal panel lab reports',
    ],
    howToApply: [
      '1. Visit the Dialysis Centre at Haldia Sub-Divisional Hospital (Durgachak) or District Hospital.',
      '2. Register at the PMNDP portal counter with your nephrologist prescription.',
      '3. Get recurring dialysis sessions scheduled free of cost.',
    ],
    helpline: '104 (State Health Helpdesk)',
    officialPortal: 'https://nhm.gov.in',
    applicationMode: 'Hospital Helpdesk',
  },
  {
    id: 'SCHEME-NIKSHAY-08',
    name: 'Nikshay Poshan Yojana (TB Elimination Mission)',
    hindiName: 'निक्षय पोषण योजना (टीबी पोषण सहायता)',
    bengaliName: 'নিক্ষয় পোষণ যোজনা (যক্ষ্মা পুষ্টি সহায়তা)',
    category: 'dbt_financial',
    categoryLabel: 'TB Nutrition Cash Grant',
    ministry: 'Central TB Division (CTD) & MoHFW',
    stateOrCentral: 'National Mission',
    benefitAmount: '₹500 - ₹1,000 / Month DBT Cash',
    benefitSummary: 'Monthly financial assistance directly into the patient’s bank account to support nutritional requirements for the entire duration of anti-TB treatment.',
    eligibility: [
      'All notified Tuberculosis (TB) patients registered on the Ni-kshay national portal',
      'Patients undergoing treatment in public or private health facilities',
      'Both drug-sensitive and drug-resistant TB cases eligible',
    ],
    requiredDocuments: [
      'Ni-kshay ID (provided at Govt DOTS centre or hospital)',
      'Aadhaar Card',
      'Active Bank Account details (IFSC & Account number for DBT)',
    ],
    howToApply: [
      '1. Diagnosis confirmed at Govt DOTS centre, PHC, or recognized private lab.',
      '2. Medical officer / Senior Treatment Supervisor (STS) creates Ni-kshay profile.',
      '3. Monthly financial grant is deposited directly into patient bank account.',
    ],
    helpline: '1800 11 6666 (Nikshay National Toll-Free)',
    officialPortal: 'https://nikshay.in',
    applicationMode: 'Hospital Helpdesk',
  },
  {
    id: 'SCHEME-RBSK-09',
    name: 'Rashtriya Bal Swasthya Karyakram (RBSK 4Ds)',
    hindiName: 'राष्ट्रीय बाल स्वास्थ्य कार्यक्रम (RBSK)',
    bengaliName: 'রাষ্ট্রীয় বাল স্বাস্থ্য কার্যক্রম',
    category: 'maternal_child',
    categoryLabel: 'Child Health & Early Screening',
    ministry: 'Child Health Division, NHM & MoHFW',
    stateOrCentral: 'National Mission',
    benefitAmount: 'Free Surgical & Specialized Child Care',
    benefitSummary: 'Universal health screening and early intervention services for children from birth to 18 years, covering 32 health conditions categorized into 4Ds.',
    eligibility: [
      'All children from birth to 18 years of age',
      'Screened at Anganwadi Centres (0-6 yrs) and Government Schools (6-18 yrs)',
      'Free corrective surgery for congenital heart defect, cleft lip, clubfoot, and cataract',
    ],
    requiredDocuments: [
      'Child MCP Card / School Identity Card',
      'Parent Aadhaar Card',
      'RBSK Mobile Health Team Referral Slip',
    ],
    howToApply: [
      '1. RBSK Mobile Health Team visits local Anganwadi/School for bi-annual checkup.',
      '2. If a health defect is identified, child is referred to District Early Intervention Centre (DEIC).',
      '3. Free surgery and specialized rehabilitation provided at tertiary centres.',
    ],
    helpline: '104 (Health Helpdesk)',
    officialPortal: 'https://nhm.gov.in',
    applicationMode: 'ASHA / Anganwadi',
  },
];

// Additional newly gazetted government schemes ready for Live Sync simulation
export const GAZETTED_NEW_SCHEMES: GovtScheme[] = [
  {
    id: 'SCHEME-SICKLE-10',
    name: 'National Sickle Cell Anemia Elimination Mission 2047',
    hindiName: 'राष्ट्रीय सिकल सेल एनीमिया उन्मूलन मिशन 2047',
    bengaliName: 'জাতীয় সিকেল সেল অ্যানিমিয়া নির্মূল মিশন',
    category: 'chronic_care',
    categoryLabel: 'Genetic Blood Disorder Mission',
    ministry: 'Ministry of Tribal Affairs & MoHFW',
    stateOrCentral: 'Central',
    benefitAmount: '100% Free Screening, Counseling & Hydroxyurea Meds',
    benefitSummary: 'Nationwide flagship mission targeting screening of 7 crore citizens with dedicated colored Sickle Cell Status Cards and free lifelong management.',
    eligibility: [
      'Individuals aged 0 to 40 years in high-prevalence districts',
      'Screening priority for tribal and rural communities',
      'Pre-marital and pre-conception genetic counseling',
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Community / Caste certificate (if applicable)',
    ],
    howToApply: [
      '1. Attend Sickle Cell Mobile Health Camps at local Sub-Centre / CHC.',
      '2. Rapid Point-of-Care solubility test performed in 5 minutes.',
      '3. Confirmatory HPLC test provided free of cost with digital card generation.',
    ],
    helpline: '1800 180 1104',
    officialPortal: 'https://sickle.nhm.gov.in',
    isNewAnnouncement: true,
    announcementDate: 'Newly Gazetted 2025-2026',
    gazetteNumber: 'CG-DL-E-15012025-90142',
    applicationMode: 'Hospital Helpdesk',
  },
  {
    id: 'SCHEME-TELEMANAS-11',
    name: 'National Tele-MANAS (Mental Health & Counseling)',
    hindiName: 'राष्ट्रीय टेली-मानस (मानसिक स्वास्थ्य एवं परामर्श सेवा)',
    bengaliName: 'জাতীয় টেলি-মানস (মানসিক স্বাস্থ্য হেল্পলাইন)',
    category: 'digital_health',
    categoryLabel: 'Mental Wellbeing & Counseling',
    ministry: 'MoHFW & NIMHANS Apex Center',
    stateOrCentral: 'National Mission',
    benefitAmount: '100% Free 24x7 Clinical Psychological Counseling',
    benefitSummary: 'Toll-free 24x7 multi-lingual digital mental healthcare service linking citizens with clinical psychologists, psychiatrists, and district counselor desks.',
    eligibility: [
      'Any citizen experiencing stress, depression, anxiety, grief, or trauma',
      'Completely anonymous, confidential, and free of charge',
      'Available in 20+ regional languages including Hindi and Bengali',
    ],
    requiredDocuments: [
      'No documents required — zero barrier direct phone access',
    ],
    howToApply: [
      '1. Dial 14416 or 1800-891-4416 from any mobile or landline.',
      '2. Select your preferred language (Hindi, Bengali, English, etc.).',
      '3. Speak with a certified clinical counselor immediately.',
    ],
    helpline: '14416 / 1800 891 4416 (Toll-Free 24x7)',
    officialPortal: 'https://telemanas.mohfw.gov.in',
    isNewAnnouncement: true,
    announcementDate: 'Digital Health Expansion 2025-2026',
    gazetteNumber: 'CG-DL-E-04022025-11029',
    applicationMode: 'Automatic via Ration Card',
  },
];

const STORAGE_KEY = 'swasthyasetu_govt_schemes_v1';

export function getStoredGovtSchemes(): GovtScheme[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse stored schemes:', err);
  }
  return INITIAL_GOVT_SCHEMES;
}

export function saveGovtSchemes(schemes: GovtScheme[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schemes));
  } catch (err) {
    console.error('Failed to save schemes:', err);
  }
}

export function saveNewCustomScheme(scheme: Omit<GovtScheme, 'id'>): GovtScheme {
  const current = getStoredGovtSchemes();
  const newScheme: GovtScheme = {
    ...scheme,
    id: `SCHEME-CUSTOM-${Date.now()}`,
    isNewAnnouncement: true,
    announcementDate: 'Newly Registered by Health Admin',
  };
  const updated = [newScheme, ...current];
  saveGovtSchemes(updated);
  return newScheme;
}

export function syncGazettedUpdates(): { addedCount: number; allSchemes: GovtScheme[] } {
  const current = getStoredGovtSchemes();
  const currentIds = new Set(current.map((s) => s.id));
  const newItems = GAZETTED_NEW_SCHEMES.filter((item) => !currentIds.has(item.id));

  const updated = [...newItems, ...current];
  saveGovtSchemes(updated);
  return {
    addedCount: newItems.length,
    allSchemes: updated,
  };
}
