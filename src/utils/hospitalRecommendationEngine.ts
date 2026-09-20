import { HospitalFacility, NEARBY_HOSPITALS_DATA } from '../data/hospitalData';

// ============================================================================
// CLINICAL SAFETY GUARDRAIL
// This engine ONLY matches patient-described symptoms to hospital facilities.
// It does NOT diagnose, treat, or provide medical advice.
// ============================================================================

export interface PatientReview {
  author: string;
  rating: number;
  comment: string;
  date: string;
  tags: string[];
}

export interface HospitalRecommendation {
  hospital: HospitalFacility;
  totalScore: number;          // 0–100
  serviceScore: number;
  ratingScore: number;
  distanceScore: number;
  bedScore: number;
  doctorScore: number;
  emergencyScore: number;
  matchedServices: string[];   // which specialities matched the symptom
  whyExplanationEn: string;
  whyExplanationHi: string;
  rank: number;
  urgencyLevel: 'critical' | 'moderate' | 'mild';
  reviews: PatientReview[];
}

// ============================================================================
// MOCK PATIENT REVIEWS (static demo data — 3 per hospital)
// ============================================================================
export const MOCK_REVIEWS: Record<string, PatientReview[]> = {
  'HOSP-HIT-01': [
    { author: 'Ramesh K.', rating: 5, comment: 'Emergency mein bahut fast service mili. Doctor ne turant dekhaa.', date: '12 Sep 2026', tags: ['Fast Emergency', 'Skilled Doctor'] },
    { author: 'Priya D.', rating: 5, comment: 'ICU staff very professional. My mother recovered quickly.', date: '8 Sep 2026', tags: ['ICU Care', 'Professional Staff'] },
    { author: 'Suresh M.', rating: 4, comment: 'Swasthya Sathi se cashless treatment mila. Wait thoda zyada tha.', date: '2 Sep 2026', tags: ['Cashless', 'Long Wait'] },
  ],
  'HOSP-HIT-02': [
    { author: 'Anita B.', rating: 5, comment: 'Govt hospital mein itni achhi seva milegi nahi socha tha. Shukriya.', date: '10 Sep 2026', tags: ['Good Service', 'Free Medicine'] },
    { author: 'Deepak R.', rating: 4, comment: 'Free dialysis unit excellent hai. Doctor available rehte hain.', date: '5 Sep 2026', tags: ['Free Dialysis', 'Doctors Available'] },
    { author: 'Meena S.', rating: 5, comment: 'Delivery mein bahut help mili. SNCU staff bhout caring the.', date: '1 Sep 2026', tags: ['Maternity Care', 'Caring Staff'] },
  ],
  'HOSP-HIT-03': [
    { author: 'Bikash P.', rating: 4, comment: 'Port hospital, quick first aid. Ambulance ready rehti hai.', date: '9 Sep 2026', tags: ['Quick Aid', 'Ambulance Ready'] },
    { author: 'Suman L.', rating: 5, comment: 'Cardiac monitoring facility very good. Staff knowledgeable.', date: '4 Sep 2026', tags: ['Cardiac Care', 'Knowledgeable Staff'] },
    { author: 'Tanya G.', rating: 4, comment: 'Clean and organized. Doctor on call was responsive.', date: '28 Aug 2026', tags: ['Clean', 'Responsive'] },
  ],
  'HOSP-HIT-04': [
    { author: 'Kavita N.', rating: 4, comment: 'OPD fast hai. Blood pressure check free mili.', date: '11 Sep 2026', tags: ['Fast OPD', 'Free Tests'] },
    { author: 'Arun T.', rating: 4, comment: 'Good for routine checkups. Diabetes management helpful.', date: '6 Sep 2026', tags: ['Diabetes Care', 'Routine Check'] },
    { author: 'Rekha J.', rating: 5, comment: 'Antenatal checkup bahut achhi tarah se hui. Doctor ne sab explain kiya.', date: '30 Aug 2026', tags: ['Maternity', 'Explained Well'] },
  ],
  'HOSP-HIT-05': [
    { author: 'Mohan C.', rating: 5, comment: 'Best eye hospital in Haldia! Cataract surgery perfect thi.', date: '13 Sep 2026', tags: ['Eye Surgery', 'Excellent Results'] },
    { author: 'Lalita V.', rating: 5, comment: 'Low cost mein world class eye treatment. Highly recommend!', date: '7 Sep 2026', tags: ['Affordable', 'World Class'] },
    { author: 'Piyush W.', rating: 5, comment: 'Charitable hospital — doctor bahut humble hain aur care excellent.', date: '3 Sep 2026', tags: ['Caring Doctors', 'Affordable'] },
  ],
  'HOSP-HIT-06': [
    { author: 'Sunita F.', rating: 5, comment: 'Advanced ICU saved my husband\'s life. Ventilator facility top class.', date: '12 Sep 2026', tags: ['Life-Saving ICU', 'Advanced Equipment'] },
    { author: 'Rohit E.', rating: 4, comment: 'Swasthya Sathi se poora admission cashless hua. Fast admission.', date: '6 Sep 2026', tags: ['Cashless', 'Fast Admission'] },
    { author: 'Nita H.', rating: 5, comment: 'Laparoscopic surgery excellent. Recovery ward clean and comfortable.', date: '1 Sep 2026', tags: ['Surgery', 'Clean Ward'] },
  ],
  'HOSP-HIT-07': [
    { author: 'Ganesh I.', rating: 4, comment: 'Rural area mein itna achha hospital. ASHA worker ne guide kiya.', date: '10 Sep 2026', tags: ['Rural Access', 'ASHA Guided'] },
    { author: 'Savitri O.', rating: 5, comment: '24x7 delivery room life saver tha. Raat ko bhi doctor available tha.', date: '5 Sep 2026', tags: ['24x7 Delivery', 'Night Emergency'] },
    { author: 'Dilip U.', rating: 4, comment: 'Vaccine hub achha hai. Cold chain properly maintained.', date: '29 Aug 2026', tags: ['Vaccination', 'Cold Chain'] },
  ],
  'HOSP-HIT-08': [
    { author: 'Anjali Q.', rating: 5, comment: 'Super specialty government hospital. Cardiology CCU world class.', date: '11 Sep 2026', tags: ['Cardiology', 'World Class'] },
    { author: 'Vikram Z.', rating: 5, comment: 'Trauma centre saved my brother after road accident. Amazing team.', date: '7 Sep 2026', tags: ['Trauma Care', 'Amazing Team'] },
    { author: 'Champa X.', rating: 4, comment: 'Blood bank excellent. Dialysis unit free under govt scheme.', date: '2 Sep 2026', tags: ['Blood Bank', 'Free Dialysis'] },
  ],
};

// ============================================================================
// SYMPTOM → REQUIRED SPECIALITY MAP (Hindi + English keywords)
// ============================================================================
interface SymptomGroup {
  keywords: string[];           // patient input keywords (Hindi + English)
  requiredSpecialities: string[]; // partial matches against hospital.specialities
  urgency: 'critical' | 'moderate' | 'mild';
  needsICU: boolean;
  needsBloodBank: boolean;
  labelEn: string;
  labelHi: string;
}

export const SYMPTOM_GROUPS: SymptomGroup[] = [
  {
    keywords: [
      'chest pain', 'seene mein dard', 'heart attack', 'heart', 'dil', 'cardiac',
      'saans nahi', 'breathing', 'saans', 'cpr', 'collapse', 'unconscious',
      'haath mein dard', 'jaw pain', 'baya haath', 'left arm pain', 'palpitation',
      'dil ki dhadkan', 'heart beat', 'bp high', 'blood pressure',
    ],
    requiredSpecialities: ['Critical Care ICU', 'Cardiac', 'CCU', '24x7 Emergency'],
    urgency: 'critical',
    needsICU: true,
    needsBloodBank: false,
    labelEn: 'Cardiac / Chest Pain Emergency',
    labelHi: 'हृदय रोग / सीने में दर्द',
  },
  {
    keywords: [
      'accident', 'durghatna', 'injury', 'chot', 'fracture', 'haddi', 'bone',
      'road accident', 'sadak durghatna', 'bleeding', 'khoon', 'blood', 'wound',
      'ghaav', 'sar pe chot', 'head injury', 'trauma', 'crash', 'fall', 'gira',
      'haath toot', 'paon toot', 'broken', 'cut', 'cut gaya',
    ],
    requiredSpecialities: ['Trauma', 'Emergency', 'Ortho', 'X-Ray', 'Blood Bank'],
    urgency: 'critical',
    needsICU: false,
    needsBloodBank: true,
    labelEn: 'Trauma / Accident Injury',
    labelHi: 'दुर्घटना / गहरी चोट',
  },
  {
    keywords: [
      'delivery', 'prasav', 'labor', 'pregnant', 'garbhwati', 'baby', 'bachcha',
      'normal delivery', 'c section', 'caesarean', 'mata', 'postpartum', 'ante natal',
      'antenatal', 'dard utha', 'pains', 'khoon ja raha', 'hemorrhage', 'preclampsia',
      'bp high pregnancy', 'neonatal', 'newborn', 'nawajanat', 'shishu',
    ],
    requiredSpecialities: ['Obstetrics', 'Maternal', 'Neonatal', 'SNCU', 'Delivery'],
    urgency: 'critical',
    needsICU: false,
    needsBloodBank: true,
    labelEn: 'Maternal / Delivery Emergency',
    labelHi: 'प्रसव / मातृत्व सेवा',
  },
  {
    keywords: [
      'aankh', 'eye', 'aankhon mein', 'drishti', 'vision', 'cataract', 'motiyabind',
      'aankhon se aansoo', 'red eye', 'laal aankh', 'dhundla', 'blurry', 'aankhon mein dard',
      'eye pain', 'eye injury', 'aankhon mein chot', 'cornea', 'retina', 'glaucoma',
      'kala motiya', 'spectacles', 'chashma',
    ],
    requiredSpecialities: ['Ophthalmology', 'Eye', 'Netralaya'],
    urgency: 'moderate',
    needsICU: false,
    needsBloodBank: false,
    labelEn: 'Eye Problem / Ophthalmology',
    labelHi: 'आँखों की समस्या',
  },
  {
    keywords: [
      'kidney', 'gurdaa', 'dialysis', 'renal', 'urine nahi', 'peshab band',
      'peshab mein jalan', 'kidney failure', 'creatinine', 'swelling', 'sujan',
      'pao sujan', 'pedu mein dard',
    ],
    requiredSpecialities: ['Dialysis', 'Hemodialysis', 'Renal'],
    urgency: 'moderate',
    needsICU: false,
    needsBloodBank: false,
    labelEn: 'Kidney / Dialysis',
    labelHi: 'किडनी / डायलिसिस',
  },
  {
    keywords: [
      'bukhar', 'fever', 'temperature', 'tapman', 'body hot', 'badan garam',
      'ulti', 'vomiting', 'vomit', 'diarrhea', 'loose motion', 'dast', 'pet mein dard',
      'stomach pain', 'abdominal', 'gastro', 'appendix', 'cholera', 'typhoid',
      'food poisoning', 'nausea', 'matli',
    ],
    requiredSpecialities: ['General', 'Emergency', 'Surgery', 'OPD'],
    urgency: 'moderate',
    needsICU: false,
    needsBloodBank: false,
    labelEn: 'Fever / Vomiting / Stomach',
    labelHi: 'बुखार / उल्टी / पेट दर्द',
  },
  {
    keywords: [
      'sugar', 'diabetes', 'madhumeh', 'blood sugar', 'glucose', 'insulin',
      'diabetes high', 'diabetic', 'bp', 'blood pressure', 'hypertension',
      'bp check', 'routine', 'general checkup', 'opd', 'simple',
    ],
    requiredSpecialities: ['NCD', 'General', 'OPD', 'Checkup', 'Diabetes'],
    urgency: 'mild',
    needsICU: false,
    needsBloodBank: false,
    labelEn: 'Routine / OPD / Diabetes / BP',
    labelHi: 'सामान्य OPD / शुगर / बीपी',
  },
  {
    keywords: [
      'saans', 'asthma', 'damaa', 'breathing problem', 'oxygen', 'khaan khaansi',
      'cough', 'khansi', 'lung', 'pneumonia', 'tb', 'tuberculosis', 'respiratory',
      'inhaler', 'inhaler nahi chal raha', 'saans phoolna',
    ],
    requiredSpecialities: ['Emergency', 'ICU', 'General', 'Respiratory'],
    urgency: 'moderate',
    needsICU: false,
    needsBloodBank: false,
    labelEn: 'Breathing / Respiratory',
    labelHi: 'सांस की तकलीफ',
  },
  {
    keywords: [
      'sir dard', 'headache', 'migraine', 'brain', 'stroke', 'paralysis',
      'lakwa', 'seizure', 'epilepsy', 'mrigu', 'chakkar', 'dizziness', 'vertigo',
      'behosh', 'unconscious', 'faint', 'haath pair numb', 'numbness',
    ],
    requiredSpecialities: ['Emergency', 'Critical Care', 'ICU', 'CT Scan'],
    urgency: 'critical',
    needsICU: true,
    needsBloodBank: false,
    labelEn: 'Neurological / Head / Stroke',
    labelHi: 'न्यूरो / सिर दर्द / स्ट्रोक',
  },
  {
    keywords: [
      'tika', 'vaccination', 'vaccine', 'polio', 'pulse polio', 'immunization',
      'bacche ka tika', 'child vaccination',
    ],
    requiredSpecialities: ['Immunization', 'Vaccine', 'Cold Chain', 'NBCC'],
    urgency: 'mild',
    needsICU: false,
    needsBloodBank: false,
    labelEn: 'Vaccination / Child Immunization',
    labelHi: 'टीकाकरण / बच्चे का टीका',
  },
];

// ============================================================================
// DISTANCE SCORING (closer = better)
// ============================================================================
function distanceScore(km: number): number {
  if (km <= 1) return 100;
  if (km <= 3) return 85;
  if (km <= 6) return 70;
  if (km <= 10) return 55;
  if (km <= 15) return 40;
  return 25;
}

// ============================================================================
// BED SCORING (based on urgency)
// ============================================================================
function bedScore(hospital: HospitalFacility, urgency: 'critical' | 'moderate' | 'mild'): number {
  if (urgency === 'critical') {
    if (hospital.availableBeds.icu >= 5) return 100;
    if (hospital.availableBeds.icu >= 2) return 75;
    if (hospital.availableBeds.icu >= 1) return 50;
    if (hospital.availableBeds.oxygen >= 5) return 35;
    return 10;
  }
  if (urgency === 'moderate') {
    if (hospital.availableBeds.oxygen >= 8) return 100;
    if (hospital.availableBeds.oxygen >= 4) return 75;
    if (hospital.availableBeds.general >= 15) return 60;
    if (hospital.availableBeds.general >= 5) return 40;
    return 20;
  }
  // mild
  if (hospital.availableBeds.general >= 10) return 100;
  if (hospital.availableBeds.general >= 5) return 70;
  return 50;
}

// ============================================================================
// SERVICE MATCH SCORING
// ============================================================================
function serviceMatchScore(hospital: HospitalFacility, requiredSpecialities: string[]): { score: number; matched: string[] } {
  const matched: string[] = [];
  let hits = 0;
  for (const req of requiredSpecialities) {
    const found = hospital.specialities.find((s) =>
      s.toLowerCase().includes(req.toLowerCase())
    );
    if (found) {
      hits++;
      matched.push(found);
    }
  }
  const score = Math.min(100, (hits / Math.max(requiredSpecialities.length, 1)) * 100);
  return { score, matched };
}

// ============================================================================
// DETECT SYMPTOM GROUP FROM INPUT
// ============================================================================
export function detectSymptomGroup(input: string): SymptomGroup | null {
  const lower = input.toLowerCase();
  let bestGroup: SymptomGroup | null = null;
  let bestHits = 0;

  for (const group of SYMPTOM_GROUPS) {
    const hits = group.keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
    if (hits > bestHits) {
      bestHits = hits;
      bestGroup = group;
    }
  }
  return bestGroup;
}

// ============================================================================
// GENERATE WHY EXPLANATION
// ============================================================================
function buildExplanation(
  hospital: HospitalFacility,
  totalScore: number,
  rank: number,
  matchedServices: string[],
  group: SymptomGroup
): { en: string; hi: string } {
  const distKm = hospital.distanceKm;
  const rating = hospital.rating;
  const beds = hospital.availableBeds;
  const doctor = hospital.onDutyDoctor;

  const en: string[] = [];
  const hi: string[] = [];

  if (rank === 1) {
    en.push(`**${hospital.name}** is the best match for your condition (Score: ${totalScore}/100).`);
    hi.push(`**${hospital.name}** aapki condition ke liye sabse best match hai (Score: ${totalScore}/100).`);
  } else {
    en.push(`**${hospital.name}** is the #${rank} alternative (Score: ${totalScore}/100).`);
    hi.push(`**${hospital.name}** #${rank} alternative hai (Score: ${totalScore}/100).`);
  }

  // Service match
  if (matchedServices.length > 0) {
    en.push(`✅ Required services available: ${matchedServices.slice(0, 2).join(', ')}.`);
    hi.push(`✅ Aapki zaroorat ki suvidha yahan hai: ${matchedServices.slice(0, 2).join(', ')}.`);
  } else {
    en.push(`⚠️ No exact specialty match found, but general emergency care available.`);
    hi.push(`⚠️ Exact specialty match nahi mila, lekin general emergency care available hai.`);
  }

  // Distance
  en.push(`📏 Distance: ${distKm} km (${hospital.travelTime}).`);
  hi.push(`📏 Doori: ${distKm} km (${hospital.travelTime}).`);

  // Rating
  en.push(`⭐ Patient Rating: ${rating}/5 — based on ${MOCK_REVIEWS[hospital.id]?.length || 3} verified reviews.`);
  hi.push(`⭐ Mrizoo ki rating: ${rating}/5 — ${MOCK_REVIEWS[hospital.id]?.length || 3} samiksha ke aadhar par.`);

  // Beds
  if (group.urgency === 'critical') {
    en.push(`🛏️ ICU Beds Available: ${beds.icu} | Oxygen Beds: ${beds.oxygen}.`);
    hi.push(`🛏️ ICU Bed Available: ${beds.icu} | Oxygen Bed: ${beds.oxygen}.`);
  } else {
    en.push(`🛏️ General Beds: ${beds.general} | Oxygen Beds: ${beds.oxygen} available right now.`);
    hi.push(`🛏️ General Bed: ${beds.general} | Oxygen Bed: ${beds.oxygen} abhi available hain.`);
  }

  // Doctor
  en.push(`👨‍⚕️ ${doctor.name} (${doctor.specialty}) — Status: ${doctor.status}.`);
  hi.push(`👨‍⚕️ ${doctor.name} — Status: ${doctor.status === 'On Duty' ? 'Duty par hain ✅' : doctor.status === 'On Call' ? 'Call par available hain' : 'Surgery mein hain'}.`);

  // Blood bank
  if (group.needsBloodBank) {
    if (hospital.bloodBank) {
      en.push(`🩸 Blood Bank: Available — critical for your emergency.`);
      hi.push(`🩸 Blood Bank: Yahan available hai — aapki emergency mein zaroori.`);
    } else {
      en.push(`⚠️ Blood Bank: Not available here. Keep this in mind.`);
      hi.push(`⚠️ Blood Bank: Yahan nahi hai — dhyan rakhein.`);
    }
  }

  // PM-JAY
  if (hospital.pmjayEmpaneled) {
    en.push(`✅ PM-JAY / Swasthya Sathi cashless treatment available.`);
    hi.push(`✅ PM-JAY / Swasthya Sathi se cashless ilaaj milega.`);
  }

  return { en: en.join(' '), hi: hi.join(' ') };
}

// ============================================================================
// MAIN: RANK ALL HOSPITALS
// ============================================================================
export function rankHospitals(userInput: string): HospitalRecommendation[] {
  const group = detectSymptomGroup(userInput);

  // Fallback if no group detected — treat as general OPD
  const effectiveGroup: SymptomGroup = group || {
    keywords: [],
    requiredSpecialities: ['General', 'OPD', 'Emergency'],
    urgency: 'mild',
    needsICU: false,
    needsBloodBank: false,
    labelEn: 'General Consultation',
    labelHi: 'सामान्य परामर्श',
  };

  const scored = NEARBY_HOSPITALS_DATA.map((hospital) => {
    const { score: svc, matched } = serviceMatchScore(hospital, effectiveGroup.requiredSpecialities);
    const rat = (hospital.rating / 5.0) * 100;
    const dist = distanceScore(hospital.distanceKm);
    const bed = bedScore(hospital, effectiveGroup.urgency);
    const doc = hospital.onDutyDoctor.status === 'On Duty' ? 100 : hospital.onDutyDoctor.status === 'On Call' ? 60 : 20;
    const emer =
      (hospital.emergency24x7 ? 50 : 0) +
      (hospital.pmjayEmpaneled ? 30 : 0) +
      (hospital.bloodBank ? 20 : 0);

    // Weighted total
    const total = Math.round(
      svc * 0.35 +
      rat * 0.20 +
      dist * 0.20 +
      bed * 0.15 +
      doc * 0.05 +
      emer * 0.05
    );

    return {
      hospital,
      totalScore: total,
      serviceScore: Math.round(svc),
      ratingScore: Math.round(rat),
      distanceScore: Math.round(dist),
      bedScore: Math.round(bed),
      doctorScore: Math.round(doc),
      emergencyScore: Math.round(emer),
      matchedServices: matched,
      whyExplanationEn: '',
      whyExplanationHi: '',
      rank: 0,
      urgencyLevel: effectiveGroup.urgency,
      reviews: MOCK_REVIEWS[hospital.id] || [],
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.totalScore - a.totalScore);

  // Assign rank + generate explanations
  return scored.map((item, idx) => {
    const { en, hi } = buildExplanation(item.hospital, item.totalScore, idx + 1, item.matchedServices, effectiveGroup);
    return {
      ...item,
      rank: idx + 1,
      whyExplanationEn: en,
      whyExplanationHi: hi,
    };
  });
}

// ============================================================================
// QUICK-SELECT CHIP SUGGESTIONS
// ============================================================================
export const QUICK_SYMPTOM_CHIPS = [
  { label: '❤️ Chest Pain', labelHi: '❤️ सीने में दर्द', query: 'chest pain seene mein dard' },
  { label: '🤰 Delivery / Pregnancy', labelHi: '🤰 डिलीवरी / गर्भावस्था', query: 'delivery prasav pregnant' },
  { label: '🚗 Accident / Trauma', labelHi: '🚗 दुर्घटना / चोट', query: 'accident trauma injury bleeding' },
  { label: '👁️ Eye Problem', labelHi: '👁️ आँख की समस्या', query: 'aankh eye problem' },
  { label: '🫁 Breathing Difficulty', labelHi: '🫁 सांस की तकलीफ', query: 'saans nahi breathing problem' },
  { label: '🤒 Fever / Vomiting', labelHi: '🤒 बुखार / उल्टी', query: 'bukhar fever ulti vomiting' },
  { label: '💉 Dialysis / Kidney', labelHi: '💉 डायलिसिस / किडनी', query: 'kidney dialysis' },
  { label: '🩺 General OPD / Checkup', labelHi: '🩺 सामान्य OPD', query: 'general opd checkup routine' },
];
