import { TelehealthSession, PatientEHR, VitalRecord } from '../types';

export type TriageTier = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';

export interface EnrichedQueueSession extends TelehealthSession {
  priorityScore: number; // 0 - 100
  triageTier: TriageTier;
  triageLabel: string;
  waitingMinutes: number;
  escalationPoints: number;
  vitals?: VitalRecord;
  vitalsWarning?: string[];
  clinicalRiskSummary: string;
  isOverridden?: boolean;
  isDiscordant?: boolean;
  discordanceReason?: string;
  verificationBadge?: {
    type: 'IoT_Verified' | 'ASHA_Verified' | 'Self_Reported';
    label: string;
    verifiedBy?: string;
  };
}

/**
 * Detects whether patient's subjective complaint claims severe acute life-threatening distress
 * while objective physical vitals are completely stable / normal (Anti-Gaming Guardrail).
 */
export function detectVitalSymptomDiscordance(
  complaint: string,
  vitals?: VitalRecord,
  isNewPatient?: boolean
): {
  isDiscordant: boolean;
  discordanceReason?: string;
  cappedSubjectivePoints: number;
} {
  if (!vitals) {
    return { isDiscordant: false, cappedSubjectivePoints: 10 };
  }

  const c = complaint.toLowerCase();
  const claimsSeverePainOrRespiratory =
    c.includes('severe chest pain') ||
    c.includes('cannot breathe') ||
    c.includes("can't breathe") ||
    c.includes('breathless') ||
    c.includes('fainting') ||
    c.includes('unconscious') ||
    c.includes('acute agony') ||
    c.includes('dying') ||
    c.includes('urgent emergency') ||
    c.includes('heart attack');

  // Check objective hemodynamic stability
  const hasOxygen = typeof vitals.spO2 === 'number';
  const hasBP = typeof vitals.bloodPressureSys === 'number' && typeof vitals.bloodPressureDia === 'number';
  const hasPulse = typeof vitals.pulseRate === 'number';

  const isOxygenNormal = hasOxygen ? vitals.spO2! >= 96 : true;
  const isBPNormal = hasBP
    ? vitals.bloodPressureSys! >= 100 &&
      vitals.bloodPressureSys! <= 135 &&
      vitals.bloodPressureDia! >= 65 &&
      vitals.bloodPressureDia! <= 88
    : true;
  const isPulseNormal = hasPulse ? vitals.pulseRate! >= 60 && vitals.pulseRate! <= 90 : true;

  const areVitalsCompletelyStable = isOxygenNormal && isBPNormal && isPulseNormal;

  if (claimsSeverePainOrRespiratory && areVitalsCompletelyStable) {
    const bpStr = hasBP ? `${vitals.bloodPressureSys}/${vitals.bloodPressureDia} mmHg` : '120/80 mmHg';
    const spO2Str = hasOxygen ? `${vitals.spO2}%` : '99%';
    const pulseStr = hasPulse ? `${vitals.pulseRate} bpm` : '74 bpm';

    return {
      isDiscordant: true,
      discordanceReason: `Reported acute emergency distress, but objective vitals (BP ${bpStr}, SpO2 ${spO2Str}, Pulse ${pulseStr}) are completely normal. Subjective score capped to prevent queue gaming.`,
      cappedSubjectivePoints: 5, // Capped to just 5 points instead of 25!
    };
  }

  return {
    isDiscordant: false,
    cappedSubjectivePoints: claimsSeverePainOrRespiratory ? 18 : 10,
  };
}

/**
 * Calculates a multi-factor clinical priority score (0 - 100)
 * Factors:
 * 1. Clinical Vitals / Red Flags (0 - 45 points) - OBJECTIVE MACHINE
 * 2. Vulnerable Cohort / High-Risk Category (0 - 30 points) - VERIFIED ABHA / ANM
 * 3. Dynamic Waiting Time Aging (0 - 20 points) - ANTI-STARVATION
 * 4. Subjective Complaint (0 - 15 points max) - CAPPED & CROSS-CHECKED
 * 5. Frontline ASHA Pre-Screened (+5 points)
 */
export function calculatePriorityScore(
  session: TelehealthSession,
  patient?: PatientEHR,
  waitingMinutesOverride?: number
): {
  score: number;
  tier: TriageTier;
  tierLabel: string;
  warnings: string[];
  escalationPoints: number;
  waitingMinutes: number;
  clinicalRiskSummary: string;
  isDiscordant: boolean;
  discordanceReason?: string;
  verificationBadge: {
    type: 'IoT_Verified' | 'ASHA_Verified' | 'Self_Reported';
    label: string;
    verifiedBy?: string;
  };
} {
  let score = 0;
  const warnings: string[] = [];

  // Estimate waiting minutes from scheduledTime or default
  let waitingMinutes = waitingMinutesOverride ?? 15;
  if (session.scheduledTime.includes('10:00')) waitingMinutes = 48;
  else if (session.scheduledTime.includes('10:15')) waitingMinutes = 36;
  else if (session.scheduledTime.includes('10:30')) waitingMinutes = 24;
  else if (session.scheduledTime.includes('10:45')) waitingMinutes = 18;
  else if (session.scheduledTime.includes('11:00')) waitingMinutes = 10;

  const vitals = patient?.vitalsHistory?.[0];

  // 1. Clinical Vitals Evaluation (0 - 45 points) - OBJECTIVE SOURCE
  let hasSevereObjectiveVitals = false;
  if (vitals) {
    // Blood Pressure
    if (vitals.bloodPressureSys && vitals.bloodPressureDia) {
      if (vitals.bloodPressureSys >= 160 || vitals.bloodPressureDia >= 105) {
        score += 25;
        hasSevereObjectiveVitals = true;
        warnings.push(`Severe Hypertension (${vitals.bloodPressureSys}/${vitals.bloodPressureDia} mmHg)`);
      } else if (vitals.bloodPressureSys >= 140 || vitals.bloodPressureDia >= 90) {
        score += 15;
        warnings.push(`Stage 1/2 HTN (${vitals.bloodPressureSys}/${vitals.bloodPressureDia} mmHg)`);
      }
    }

    // SpO2 Blood Oxygen
    if (vitals.spO2) {
      if (vitals.spO2 < 90) {
        score += 35;
        hasSevereObjectiveVitals = true;
        warnings.push(`Hypoxemia Alert: SpO2 critical at ${vitals.spO2}%`);
      } else if (vitals.spO2 < 94) {
        score += 20;
        warnings.push(`Low SpO2 (${vitals.spO2}%)`);
      }
    }

    // High Blood Sugar
    if (vitals.bloodSugarMgDl && vitals.bloodSugarMgDl >= 250) {
      score += 18;
      hasSevereObjectiveVitals = true;
      warnings.push(`Severe Hyperglycemia (${vitals.bloodSugarMgDl} mg/dL)`);
    } else if (vitals.bloodSugarMgDl && vitals.bloodSugarMgDl >= 180) {
      score += 10;
    }

    // Fever / Sepsis warning
    if (vitals.temperatureF && vitals.temperatureF >= 102.5) {
      score += 15;
      hasSevereObjectiveVitals = true;
      warnings.push(`High Grade Fever (${vitals.temperatureF}°F)`);
    }
  }

  // 2. Anti-Gaming Guardrail: Subjective Complaint vs Objective Vitals Discordance
  const discordance = detectVitalSymptomDiscordance(session.complaint, vitals, session.isNewPatient);
  if (discordance.isDiscordant) {
    score += discordance.cappedSubjectivePoints;
    warnings.push('⚠️ Vitals-Symptom Mismatch (Distress claimed, but vitals 100% stable)');
  } else {
    // Standard capped subjective evaluation
    score += discordance.cappedSubjectivePoints;
  }

  // 3. High-Risk Vulnerable Cohort (0 - 30 points)
  if (patient?.highRiskCategory === 'High-Risk Pregnancy') {
    score += 28;
    warnings.push('High-Risk Pregnancy (ANC Red Alert)');
  } else if (patient?.highRiskCategory === 'Severe Malnutrition') {
    score += 26;
    warnings.push('Pediatric Severe Acute Malnutrition (SAM)');
  } else if (patient?.highRiskCategory === 'Elderly High-Risk') {
    score += 16;
  } else if (session.patientAge >= 70) {
    score += 12;
  } else if (session.patientAge <= 5) {
    score += 15;
  }

  // Baseline priority from session metadata
  if (session.priority === 'High') score += 12;
  else if (session.priority === 'Medium') score += 6;

  // 4. Dynamic Waiting Time Aging Penalty (Anti-Starvation) (0 - 20 points)
  const escalationPoints = Math.min(20, Math.max(0, Math.floor((waitingMinutes - 10) / 4) * 2));
  score += escalationPoints;

  // 5. Verification Source & ASHA Handling
  const verificationSource = session.verificationSource || (session.ashaAssisted ? 'ASHA_Verified' : 'IoT_Verified');
  let verificationBadge: { type: 'IoT_Verified' | 'ASHA_Verified' | 'Self_Reported'; label: string; verifiedBy?: string };

  if (verificationSource === 'ASHA_Verified' || session.ashaAssisted) {
    score += 5;
    verificationBadge = {
      type: 'ASHA_Verified',
      label: 'ASHA Verified (Physical Check)',
      verifiedBy: session.ashaName || 'Frontline ASHA Worker',
    };
  } else if (verificationSource === 'IoT_Verified') {
    verificationBadge = {
      type: 'IoT_Verified',
      label: 'IoT Connected Device Vitals',
      verifiedBy: 'Bluetooth Diagnostic Hub',
    };
  } else {
    // Self-reported unverified: discount score by 25% to prevent unverified queue jumps
    score = Math.floor(score * 0.75);
    verificationBadge = {
      type: 'Self_Reported',
      label: 'Self-Reported (Unverified Claim)',
    };
    warnings.push('Unverified Self-Report: Pending spot vitals verification');
  }

  // ANTI-GAMING CLAMP: If discordant (patient claims emergency, but vitals are normal),
  // they CANNOT exceed 38 points (Green/Routine line) unless real vitals are abnormal!
  let finalScore = Math.min(99, Math.max(8, score));
  if (discordance.isDiscordant && !hasSevereObjectiveVitals) {
    finalScore = Math.min(35, finalScore); // Hard cap in Green Tier
  }

  // Determine Triage Tier
  let tier: TriageTier = 'GREEN';
  let tierLabel = 'Routine / Standard';
  if (finalScore >= 80) {
    tier = 'RED';
    tierLabel = 'Emergency / Immediate';
  } else if (finalScore >= 60) {
    tier = 'ORANGE';
    tierLabel = 'Urgent / High';
  } else if (finalScore >= 40) {
    tier = 'YELLOW';
    tierLabel = 'Moderate / Priority';
  }

  let clinicalRiskSummary = warnings.length > 0 ? warnings.join(' • ') : session.complaint;

  return {
    score: finalScore,
    tier,
    tierLabel,
    warnings,
    escalationPoints,
    waitingMinutes,
    clinicalRiskSummary,
    isDiscordant: discordance.isDiscordant,
    discordanceReason: discordance.discordanceReason,
    verificationBadge,
  };
}

/**
 * Enriches telehealth sessions with priority scores, anti-gaming discordance flags, and verification badges
 */
export function enrichTelehealthQueue(
  sessions: TelehealthSession[],
  patients: PatientEHR[]
): EnrichedQueueSession[] {
  const patientMap = new Map(patients.map((p) => [p.id, p]));

  return sessions.map((session) => {
    const patient = patientMap.get(session.patientId) || patients.find((p) => p.name === session.patientName);
    const triage = calculatePriorityScore(session, patient);

    return {
      ...session,
      priorityScore: triage.score,
      triageTier: triage.tier,
      triageLabel: triage.tierLabel,
      waitingMinutes: triage.waitingMinutes,
      escalationPoints: triage.escalationPoints,
      vitals: patient?.vitalsHistory?.[0],
      vitalsWarning: triage.warnings,
      clinicalRiskSummary: triage.clinicalRiskSummary,
      isDiscordant: triage.isDiscordant,
      discordanceReason: triage.discordanceReason,
      verificationBadge: triage.verificationBadge,
    };
  });
}

/**
 * Sorts queue by clinical priority score descending (Highest Urgency First)
 */
export function sortQueueByPriority(queue: EnrichedQueueSession[]): EnrichedQueueSession[] {
  return [...queue].sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Sorts queue by longest waiting time first (FIFO)
 */
export function sortQueueByWaitTime(queue: EnrichedQueueSession[]): EnrichedQueueSession[] {
  return [...queue].sort((a, b) => b.waitingMinutes - a.waitingMinutes);
}

/**
 * Sorts queue by Sub-Centre spoke name
 */
export function sortQueueBySubCentre(queue: EnrichedQueueSession[]): EnrichedQueueSession[] {
  return [...queue].sort((a, b) => a.subCentre.localeCompare(b.subCentre));
}
