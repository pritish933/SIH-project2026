import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileText,
  UserCheck,
  Calendar,
  Building,
  Activity,
  Heart,
  Pill,
  Sparkles,
  Printer,
  Send,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  Download,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { speakText, stopSpeech } from '../../utils/speechUtils';
import { PatientEHR, PrescriptionMedicine, TelehealthSession } from '../../types';

interface EPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedPatient?: PatientEHR | null;
  preSelectedSession?: TelehealthSession | null;
}

// Common rural clinical condition presets
const CLINICAL_PRESETS = [
  {
    id: 'htn',
    title: 'Essential Hypertension (उच्च रक्तचाप)',
    category: 'Cardiovascular',
    diagnosis: 'Essential Stage 2 Hypertension with borderline diastolic elevation',
    symptoms: ['Headache', 'Morning dizziness', 'Occasional chest heaviness'],
    medicines: [
      {
        id: 'med-htn-1',
        name: 'Amlodipine 5mg',
        dosage: '5mg',
        frequency: '1-0-0',
        timing: 'After Food' as const,
        durationDays: 30,
        instructions: '1 गोली सुबह नाश्ते के बाद पानी के साथ लें (1-0-0)',
      },
      {
        id: 'med-htn-2',
        name: 'Telmisartan 40mg',
        dosage: '40mg',
        frequency: '0-0-1',
        timing: 'After Food' as const,
        durationDays: 30,
        instructions: '1 गोली रात के खाने के बाद लें (0-0-1)',
      },
    ],
    advisedTests: ['Serum Creatinine & Urea', 'Serum Electrolytes (Na/K)', 'Lipid Profile'],
    dietaryAdvice: 'भोजन में नमक की मात्रा कम करें (< 3 ग्राम/दिन)। अचार, पापड़ व तली चीजों से बचें। प्रतिदिन 30 मिनट टहलें।',
    followUpDays: 14,
  },
  {
    id: 'dm2',
    title: 'Type-2 Diabetes (मधुमेह)',
    category: 'Endocrine',
    diagnosis: 'Uncontrolled Type 2 Diabetes Mellitus with postprandial hyperglycemia',
    symptoms: ['Polyuria (बार-बार पेशाब)', 'Polydipsia (अत्यधिक प्यास)', 'General fatigue'],
    medicines: [
      {
        id: 'med-dm-1',
        name: 'Metformin 500mg',
        dosage: '500mg',
        frequency: '1-0-1',
        timing: 'After Food' as const,
        durationDays: 30,
        instructions: '1 गोली सुबह व 1 गोली शाम को भोजन के तुरंत बाद लें (1-0-1)',
      },
      {
        id: 'med-dm-2',
        name: 'Glimepiride 1mg',
        dosage: '1mg',
        frequency: '1-0-0',
        timing: 'Before Food' as const,
        durationDays: 30,
        instructions: '1 गोली सुबह के नाश्ते से 15 मिनट पहले लें (1-0-0)',
      },
    ],
    advisedTests: ['Fasting & PP Blood Sugar', 'HbA1c Glycated Hemoglobin', 'Urine Microalbumin'],
    dietaryAdvice: 'चीनी, गुड़, मिठाई व आलू-चावल कम करें। फाइबर युक्त हरी सब्जियां, खीरा और साबुत अनाज लें। नियमित शुगर चार्ट बनाएं।',
    followUpDays: 21,
  },
  {
    id: 'anc_anemia',
    title: 'High-Risk ANC / Severe Anemia (गर्भावस्था में एनीमिया)',
    category: 'Maternal',
    diagnosis: 'Severe Gestational Iron-Deficiency Anemia (30-34 weeks gestation)',
    symptoms: ['Severe fatigue', 'Dizziness on standing', 'Pallor of conjunctiva & nails'],
    medicines: [
      {
        id: 'med-anc-1',
        name: 'Iron & Folic Acid (IFA)',
        dosage: '100mg elemental Iron + 500mcg FA',
        frequency: '1-0-0',
        timing: 'After Food' as const,
        durationDays: 30,
        instructions: '1 गोली दोपहर के भोजन के 1 घंटे बाद नींबू पानी के साथ लें। चाय/दूध के साथ न लें।',
      },
      {
        id: 'med-anc-2',
        name: 'Calcium & Vit D3 500mg',
        dosage: '500mg / 250 IU',
        frequency: '0-1-0',
        timing: 'After Food' as const,
        durationDays: 30,
        instructions: '1 गोली रात को भोजन के बाद दूध के साथ लें। आयरन गोली के साथ न लें।',
      },
    ],
    advisedTests: ['Complete Blood Count (CBC & Peripheral Smear)', 'Serum Ferritin', 'Obstetric Ultrasound (Growth Scan)'],
    dietaryAdvice: 'पालक, मेथी, गुड़, चना, अनार व दालें प्रचुर मात्रा में लें। भारी वजन न उठाएं व पर्याप्त आराम करें।',
    followUpDays: 14,
  },
  {
    id: 'diabetic_ulcer',
    title: 'Diabetic Foot Ulcer / Wound (पैर का घाव व अल्सर)',
    category: 'Surgical/Endocrine',
    diagnosis: 'Grade-1 Plantar Neuropathic Foot Ulcer with localized bacterial colonization',
    symptoms: ['Right foot plantar skin lesion', 'Loss of peripheral sensation', 'Mild edema'],
    medicines: [
      {
        id: 'med-wound-1',
        name: 'Amoxicillin-Clavulanate 625mg',
        dosage: '625mg',
        frequency: '1-0-1',
        timing: 'After Food' as const,
        durationDays: 7,
        instructions: '1 गोली सुबह व 1 गोली रात को भोजन के बाद लें। 7 दिन का पूरा कोर्स करें।',
      },
      {
        id: 'med-wound-2',
        name: 'Povidone Iodine 5% Ointment',
        dosage: 'Topical',
        frequency: '1-0-1',
        timing: 'With Food' as const,
        durationDays: 10,
        instructions: 'नॉर्मल सेलाइन से साफ करने के बाद घाव पर लगाएं व साफ गॉज पट्टी से बांधें।',
      },
    ],
    advisedTests: ['Wound Swab Culture & Sensitivity', 'Fasting Blood Sugar', 'X-ray Right Foot (rule out osteomyelitis)'],
    dietaryAdvice: 'पैर को सूखा व साफ रखें। नंगे पैर कभी न चलें। ब्लड शुगर 140 से नीचे रखें। घाव पर पानी न पड़ने दें।',
    followUpDays: 7,
  },
  {
    id: 'respiratory',
    title: 'Acute Bronchitis & Cough (खांसी व सांस की तकलीफ)',
    category: 'Respiratory',
    diagnosis: 'Acute Upper Respiratory Tract Infection with seasonal bronchospasm',
    symptoms: ['Dry nocturnal cough', 'Sore throat', 'Mild chest discomfort'],
    medicines: [
      {
        id: 'med-resp-1',
        name: 'Paracetamol 500mg',
        dosage: '500mg',
        frequency: '1-0-1',
        timing: 'After Food' as const,
        durationDays: 5,
        instructions: 'बुखार या शरीर दर्द होने पर 1 गोली भोजन के बाद लें (SOS / 1-0-1)',
      },
      {
        id: 'med-resp-2',
        name: 'Cetirizine 10mg',
        dosage: '10mg',
        frequency: '0-0-1',
        timing: 'After Food' as const,
        durationDays: 5,
        instructions: '1 गोली रात को सोने से पहले लें (नींद आ सकती है)',
      },
    ],
    advisedTests: ['Chest X-ray PA View (if cough > 2 wks)', 'Sputum for AFB (rule out TB)'],
    dietaryAdvice: 'गुनगुना पानी पिएं। दिन में 2-3 बार गर्म पानी के गरारे व भाप लें। ठंडे पेय और धूल-धुएं से बचें।',
    followUpDays: 5,
  },
];

// Quick test choices
const COMMON_LAB_TESTS = [
  'Complete Blood Count (CBC)',
  'Fasting Blood Sugar (FBS)',
  'Post-Prandial Sugar (PPBS)',
  'HbA1c (Glycated Hb)',
  'Serum Creatinine & Urea',
  'Lipid Profile',
  'Urine Routine & Microscopic',
  'Liver Function Test (LFT)',
  'Serum Electrolytes',
  'Chest X-Ray PA View',
  'ECG 12-Lead',
  'Obstetric Ultrasound (USG)',
];

export function EPrescriptionModal({
  isOpen,
  onClose,
  preSelectedPatient,
  preSelectedSession,
}: EPrescriptionModalProps) {
  const { currentUser, patients, medicineStock, addPrescription, createFollowUpTask, t } = useApp();

  // Mode: 'editor' or 'preview'
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Selected Patient ID
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preSelectedPatient?.id || preSelectedSession?.patientId || patients[0]?.id || ''
  );

  // Form Fields
  const [diagnosis, setDiagnosis] = useState('');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [customTestInput, setCustomTestInput] = useState('');
  const [dietaryAdvice, setDietaryAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [enrolHighRiskTracker, setEnrolHighRiskTracker] = useState(true);
  const [isSuccessSaved, setIsSuccessSaved] = useState(false);
  const [isSpeakingVoiceRx, setIsSpeakingVoiceRx] = useState(false);

  const handleToggleVoiceRx = () => {
    if (isSpeakingVoiceRx) {
      stopSpeech();
      setIsSpeakingVoiceRx(false);
    } else {
      const patientName = currentPatient?.name || 'मरीज';
      const medList = medicines.length > 0
        ? medicines.map((m) => `${m.name}, खुराक ${m.dosage}, ${m.frequency}, ${m.timing}`).join('। ')
        : 'दवाइयों का चयन करें';
      const textToSpeak = `डॉक्टर ${currentUser.name} का पर्चा। मरीज: ${patientName}। बीमारी: ${diagnosis || 'सामान्य परामर्श'}। दवाइयां: ${medList}। खानपान परहेज: ${dietaryAdvice || 'संतुलित आहार लें व खूब पानी पिएं'}। अगली जांच की तारीख: ${followUpDate || 'सात दिन बाद'}।`;

      speakText(
        textToSpeak,
        'hi',
        () => setIsSpeakingVoiceRx(true),
        () => setIsSpeakingVoiceRx(false),
        () => setIsSpeakingVoiceRx(false)
      );
    }
  };

  // Update selected patient when preSelectedPatient changes
  useEffect(() => {
    if (preSelectedPatient) {
      setSelectedPatientId(preSelectedPatient.id);
    } else if (preSelectedSession) {
      const match = patients.find((p) => p.id === preSelectedSession.patientId || p.name === preSelectedSession.patientName);
      if (match) setSelectedPatientId(match.id);
    }
  }, [preSelectedPatient, preSelectedSession, patients]);

  // Current Patient Object
  const currentPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  // Initialize with default or pre-filled data when patient changes
  useEffect(() => {
    if (!diagnosis && currentPatient) {
      if (currentPatient.chronicConditions.includes('Hypertension')) {
        applyPreset(CLINICAL_PRESETS[0]);
      } else if (currentPatient.chronicConditions.includes('Type 2 Diabetes')) {
        applyPreset(CLINICAL_PRESETS[1]);
      } else if (currentPatient.highRiskCategory === 'High-Risk Pregnancy') {
        applyPreset(CLINICAL_PRESETS[2]);
      } else {
        // Default follow-up in 7 days
        const d = new Date();
        d.setDate(d.getDate() + 7);
        setFollowUpDate(d.toISOString().split('T')[0]);
        // Default symptoms from patient
        if (preSelectedSession?.complaint) {
          setSymptomsInput(preSelectedSession.complaint);
        }
      }
    }
  }, [selectedPatientId, currentPatient]);

  // Apply a 1-click clinical preset
  const applyPreset = (preset: (typeof CLINICAL_PRESETS)[0]) => {
    setDiagnosis(preset.diagnosis);
    setSymptomsInput(preset.symptoms.join(', '));
    setMedicines(preset.medicines.map((m, idx) => ({ ...m, id: `med-gen-${Date.now()}-${idx}` })));
    setSelectedTests(preset.advisedTests);
    setDietaryAdvice(preset.dietaryAdvice);

    const d = new Date();
    d.setDate(d.getDate() + preset.followUpDays);
    setFollowUpDate(d.toISOString().split('T')[0]);
  };

  // Helper to generate Hindi dosage instruction from frequency and timing
  const generateHindiInstruction = (freq: string, timing: string, duration: number) => {
    let freqText = '';
    if (freq === '1-0-1') freqText = '1 गोली सुबह और 1 गोली शाम को';
    else if (freq === '1-0-0') freqText = '1 गोली सिर्फ सुबह';
    else if (freq === '0-0-1') freqText = '1 गोली सिर्फ रात को';
    else if (freq === '1-1-1') freqText = '1 गोली सुबह, 1 दोपहर और 1 शाम को';
    else if (freq === 'SOS') freqText = 'जरूरत पड़ने पर (दर्द या बुखार होने पर)';
    else freqText = `${freq} बार`;

    let timingText = '';
    if (timing === 'After Food') timingText = 'खाना खाने के 30 मिनट बाद';
    else if (timing === 'Before Food') timingText = 'खाली पेट (भोजन से 20 मिनट पहले)';
    else timingText = 'भोजन के साथ';

    return `${freqText} ${timingText} लें (${duration} दिनों तक)`;
  };

  // Add a blank medicine row
  const handleAddMedicine = () => {
    const newMed: PrescriptionMedicine = {
      id: `med-${Date.now()}`,
      name: 'Amlodipine 5mg',
      dosage: '5mg',
      frequency: '1-0-1',
      timing: 'After Food',
      durationDays: 14,
      instructions: '1 गोली सुबह और 1 गोली शाम को खाना खाने के बाद लें (14 दिनों तक)',
    };
    setMedicines((prev) => [...prev, newMed]);
  };

  // Update a medicine row
  const handleUpdateMedicine = (index: number, updates: Partial<PrescriptionMedicine>) => {
    setMedicines((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], ...updates };
      // Auto-update Hindi instructions if frequency, timing, or duration changed
      if (updates.frequency || updates.timing || updates.durationDays) {
        target.instructions = generateHindiInstruction(
          target.frequency,
          target.timing,
          target.durationDays
        );
      }
      copy[index] = target;
      return copy;
    });
  };

  // Remove a medicine row
  const handleRemoveMedicine = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle advised test
  const handleToggleTest = (testName: string) => {
    setSelectedTests((prev) =>
      prev.includes(testName) ? prev.filter((t) => t !== testName) : [...prev, testName]
    );
  };

  // Add custom test
  const handleAddCustomTest = () => {
    if (!customTestInput.trim()) return;
    if (!selectedTests.includes(customTestInput.trim())) {
      setSelectedTests((prev) => [...prev, customTestInput.trim()]);
    }
    setCustomTestInput('');
  };

  // Check inventory stock status for a given medicine name
  const getStockStatus = (medicineName: string) => {
    const medLower = medicineName.toLowerCase();
    const match = medicineStock.find(
      (m) =>
        m.name.toLowerCase().includes(medLower) ||
        medLower.includes(m.name.toLowerCase()) ||
        m.genericName.toLowerCase().includes(medLower)
    );

    if (!match) {
      return {
        label: 'Stock Status: Check at Sub-Centre',
        available: true,
        count: 120,
        badgeColor: 'bg-stone-100 text-stone-700',
      };
    }

    if (match.subCentreStock > 100) {
      return {
        label: `🟢 In Stock at Sub-Centre (${match.subCentreStock} ${match.unit})`,
        available: true,
        count: match.subCentreStock,
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
    } else if (match.subCentreStock > 0) {
      return {
        label: `🟡 Low Stock (${match.subCentreStock} ${match.unit}) - Buffer at PHC`,
        available: true,
        count: match.subCentreStock,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    } else {
      return {
        label: `🔴 Sub-Centre Stockout (PHC Hub Stock: ${match.phcStock})`,
        available: false,
        count: 0,
        badgeColor: 'bg-red-100 text-red-800 border-red-200',
      };
    }
  };

  // Save Prescription to AppContext (ABDM EHR)
  const handleSavePrescription = () => {
    if (!currentPatient) return;

    const prescriptionData = {
      date: new Date().toISOString().split('T')[0],
      doctorId: currentUser.id || 'DOC-1029',
      doctorName: currentUser.name || 'Dr. Rajesh Sharma',
      doctorSpecialty: currentUser.specialization || 'Public Health & Telemedicine Specialist',
      facility: currentUser.facility || 'District Hospital Telemedicine Hub',
      diagnosis: diagnosis || 'General Clinical Consultation with symptomatic care',
      symptoms: symptomsInput ? symptomsInput.split(',').map((s) => s.trim()) : ['Follow-up consultation'],
      medicines: medicines.length > 0 ? medicines : [
        {
          id: `med-${Date.now()}`,
          name: 'Paracetamol 500mg',
          dosage: '500mg',
          frequency: '1-0-1',
          timing: 'After Food' as const,
          durationDays: 5,
          instructions: '1 गोली सुबह व 1 गोली शाम को भोजन के बाद लें',
        },
      ],
      advisedTests: selectedTests,
      dietaryAdvice: dietaryAdvice || 'संतुलित आहार लें व पर्याप्त पानी पिएं।',
      followUpDate: followUpDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      isDispensed: false,
    };

    addPrescription(currentPatient.id, prescriptionData);

    // Auto-enroll in High-Risk Follow-Up Tracker if selected
    if (enrolHighRiskTracker && currentPatient) {
      const isSam = currentPatient.highRiskCategory?.includes('Malnutrition');
      const isAnc = currentPatient.highRiskCategory?.includes('Pregnancy');
      const isCopd = currentPatient.chronicConditions.some((c) => c.includes('COPD'));
      const cat = isAnc
        ? ('High-Risk Pregnancy (ANC)' as const)
        : isSam
        ? ('Severe Acute Malnutrition (SAM)' as const)
        : isCopd
        ? ('Elderly High-Risk / COPD' as const)
        : ('Hypertensive Crisis / Uncontrolled BP' as const);

      createFollowUpTask({
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        patientAge: currentPatient.age,
        patientGender: currentPatient.gender,
        abhaId: currentPatient.abhaId,
        village: currentPatient.village,
        subCentre: currentPatient.registeredFacility,
        assignedAshaWorker: currentPatient.assignedAshaWorker || 'Meena Devi (ASHA)',
        ashaPhone: '+91 98934 11209',
        category: cat,
        urgency: 'Upcoming_Week',
        dueDate: prescriptionData.followUpDate,
        triggerReason: `e-Prescription follow-up: ${diagnosis || 'Treatment plan initiated by Dr. ' + currentUser.name}. Review medicine adherence and symptom relief.`,
        actionRequired: 'Doorstep check for medication adherence, side-effects, and vitals re-check.',
        latestVitals: {
          recordedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        },
        ashaDoorstepStatus: 'Pending',
        status: 'Pending',
        sourcePrescriptionId: currentPatient.prescriptions[0]?.id || `RX-${Date.now().toString().slice(-4)}`,
      });
    }

    setIsSuccessSaved(true);

    setTimeout(() => {
      setIsSuccessSaved(false);
      onClose();
    }, 2000);
  };

  // Quick follow-up helpers
  const handleSetQuickFollowUp = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().split('T')[0]);
  };

  if (!isOpen) return null;

  const latestVital = currentPatient?.vitalsHistory?.[0];
  const rxDocNumber = `RX-${new Date().getFullYear()}-${selectedPatientId.slice(-4)}${Math.floor(100 + Math.random() * 900)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden my-auto">
        {/* Top Header */}
        <div className="bg-stone-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>{t('rx_modal_title')}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    NHA &amp; MoHFW Compliant
                  </span>
                </h2>
              </div>
              <p className="text-xs text-stone-400">
                {t('rx_prescribing_physician')} <strong>{currentUser.name}</strong> &bull; Reg No: {currentUser.registrationNumber || 'MCI-WB-2018-88412'}
              </p>
            </div>
          </div>

          {/* Toggle between Editor and Slip Preview */}
          <div className="flex items-center gap-2">
            <div className="bg-stone-800 p-1 rounded-xl border border-stone-700 flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {t('rx_interactive_editor')}
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'preview'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('rx_slip_preview')}</span>
              </button>

              {/* Voice Prescription Player Button */}
              <button
                type="button"
                onClick={handleToggleVoiceRx}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSpeakingVoiceRx
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-stone-800 text-teal-300 hover:bg-stone-700'
                }`}
                title="Read prescription aloud in patient dialect"
              >
                {isSpeakingVoiceRx ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeakingVoiceRx ? 'बोलना रोकें' : '🔊 Voice Rx (बोलकर सुनें)'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'editor' ? (
            <>
              {/* Patient Selection & Vitals Strip */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                      {t('rx_target_patient')}
                    </label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-stone-900"
                    >
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.age}y, {p.gender}) &bull; ABHA: {p.abhaId} &bull; Village: {p.village}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:w-64 text-right">
                    <span className="text-[11px] text-stone-500 block">{t('rx_subcentre_spoke')}</span>
                    <span className="text-xs font-bold text-stone-800 flex items-center justify-end gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-stone-400" />
                      {currentPatient?.registeredFacility || 'Sub-Centre Sihore'}
                    </span>
                  </div>
                </div>

                {/* Latest Recorded Vitals Strip */}
                {latestVital && (
                  <div className="pt-2 border-t border-stone-200/70 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
                      {t('rx_latest_vitals')}
                    </span>

                    {latestVital.bloodPressureSys && (
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
                          latestVital.bloodPressureSys >= 150
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-white text-stone-800 border-stone-200'
                        }`}
                      >
                        BP: {latestVital.bloodPressureSys}/{latestVital.bloodPressureDia}
                      </span>
                    )}

                    {latestVital.spO2 && (
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
                          latestVital.spO2 < 95
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-white text-stone-800 border-stone-200'
                        }`}
                      >
                        SpO2: {latestVital.spO2}%
                      </span>
                    )}

                    {latestVital.pulseRate && (
                      <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-white text-stone-800 border border-stone-200">
                        Pulse: {latestVital.pulseRate} bpm
                      </span>
                    )}

                    {latestVital.bloodSugarMgDl && (
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
                          latestVital.bloodSugarMgDl >= 200
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-white text-stone-800 border-stone-200'
                        }`}
                      >
                        Sugar: {latestVital.bloodSugarMgDl} mg/dL
                      </span>
                    )}

                    {latestVital.temperatureF && (
                      <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-white text-stone-800 border border-stone-200">
                        Temp: {latestVital.temperatureF}°F
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 1-Click Rural Clinical Protocols Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t('rx_clinical_presets')}</span>
                  </label>
                  <span className="text-[11px] text-stone-500">Auto-fills Rx, tests &amp; Hindi instructions</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {CLINICAL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-teal-50 hover:border-teal-300 text-xs font-semibold text-stone-700 hover:text-teal-900 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-teal-600" />
                      <span>{preset.title.split('(')[0].trim()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnosis & Reported Symptoms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    {t('rx_diagnosis_label')}
                  </label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Essential Hypertension with early peripheral signs"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    {t('rx_symptoms_label')}
                  </label>
                  <input
                    type="text"
                    value={symptomsInput}
                    onChange={(e) => setSymptomsInput(e.target.value)}
                    placeholder="e.g. Morning dizziness, headache x 2 weeks"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-stone-900"
                  />
                </div>
              </div>

              {/* Dynamic Medicine Rx Pad */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-teal-700" />
                      <span>{t('rx_medicines_label')}</span>
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Live availability verified against {currentPatient?.registeredFacility || 'Sub-Centre'} pharmacy
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('rx_add_medicine')}</span>
                  </button>
                </div>

                {/* Medicine Items List */}
                <div className="space-y-3">
                  {medicines.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-stone-200 rounded-2xl text-xs text-stone-500 space-y-2">
                      <Pill className="w-6 h-6 text-stone-400 mx-auto" />
                      <div>No medicines added yet. Click &ldquo;Add Medicine&rdquo; or select a clinical preset above.</div>
                    </div>
                  ) : (
                    medicines.map((med, index) => {
                      const stockInfo = getStockStatus(med.name);

                      return (
                        <div
                          key={med.id}
                          className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3 hover:border-teal-300 transition-all"
                        >
                          {/* Row 1: Drug Name, Stock Badge, Delete Button */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex-1 flex flex-wrap items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <input
                                type="text"
                                value={med.name}
                                onChange={(e) => handleUpdateMedicine(index, { name: e.target.value })}
                                placeholder="Medicine Brand or Generic Name (e.g. Amlodipine 5mg)"
                                className="flex-1 min-w-[200px] text-xs font-bold px-3 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />

                              {/* Live Stock Status Badge */}
                              <span
                                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${stockInfo.badgeColor}`}
                              >
                                {stockInfo.label}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveMedicine(index)}
                              className="text-stone-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer self-end sm:self-auto"
                              title="Remove medicine"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Row 2: Frequency, Timing, Duration */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                                {t('rx_frequency')}
                              </label>
                              <select
                                value={med.frequency}
                                onChange={(e) => handleUpdateMedicine(index, { frequency: e.target.value })}
                                className="w-full text-xs font-medium px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              >
                                <option value="1-0-1">1-0-1 (सुबह व शाम / Twice daily)</option>
                                <option value="1-0-0">1-0-0 (सिर्फ सुबह / Once daily morning)</option>
                                <option value="0-0-1">0-0-1 (सिर्फ रात को / Once daily night)</option>
                                <option value="1-1-1">1-1-1 (सुबह, दोपहर, शाम / Thrice daily)</option>
                                <option value="SOS">SOS (जरूरत पड़ने पर / As needed)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                                {t('rx_timing')}
                              </label>
                              <select
                                value={med.timing}
                                onChange={(e) =>
                                  handleUpdateMedicine(index, {
                                    timing: e.target.value as 'After Food' | 'Before Food' | 'With Food',
                                  })
                                }
                                className="w-full text-xs font-medium px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              >
                                <option value="After Food">After Food (भोजन के बाद)</option>
                                <option value="Before Food">Before Food (खाली पेट)</option>
                                <option value="With Food">With Food (भोजन के साथ)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                                {t('rx_duration')}
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="1"
                                  max="90"
                                  value={med.durationDays}
                                  onChange={(e) =>
                                    handleUpdateMedicine(index, { durationDays: parseInt(e.target.value) || 1 })
                                  }
                                  className="w-20 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                                <span className="text-xs text-stone-500">{t('rx_days')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Row 3: Auto-Generated Hindi Dosage Instruction */}
                          <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0">
                              हिंदी निर्देश:
                            </span>
                            <input
                              type="text"
                              value={med.instructions || ''}
                              onChange={(e) => handleUpdateMedicine(index, { instructions: e.target.value })}
                              placeholder="Auto-generated Hindi dosage instruction"
                              className="flex-1 text-xs text-stone-800 font-medium px-2 py-1 rounded bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Advised Lab Tests & Investigations */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-700" />
                  <span>{t('rx_tests_label')}</span>
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {COMMON_LAB_TESTS.map((test) => {
                    const isSelected = selectedTests.includes(test);
                    return (
                      <button
                        key={test}
                        type="button"
                        onClick={() => handleToggleTest(test)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {test}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Test Input */}
                <div className="flex items-center gap-2 pt-1 max-w-md">
                  <input
                    type="text"
                    value={customTestInput}
                    onChange={(e) => setCustomTestInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTest())}
                    placeholder="Other test (e.g. Sputum for AFB)..."
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTest}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t('rx_add_test')}
                  </button>
                </div>
              </div>

              {/* Dietary Advice & Follow-Up Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    {t('rx_dietary_label')}
                  </label>
                  <textarea
                    rows={3}
                    value={dietaryAdvice}
                    onChange={(e) => setDietaryAdvice(e.target.value)}
                    placeholder="e.g. नमक की मात्रा कम करें, पर्याप्त पानी पिएं..."
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-stone-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    {t('rx_followup_label')}
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-stone-900"
                  />

                  {/* Quick Shortcuts for follow up */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-stone-500">{t('rx_quick')}</span>
                    <button
                      type="button"
                      onClick={() => handleSetQuickFollowUp(3)}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[11px] font-semibold text-stone-700 cursor-pointer"
                    >
                      +3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickFollowUp(7)}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[11px] font-semibold text-stone-700 cursor-pointer"
                    >
                      +1 Week
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickFollowUp(14)}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[11px] font-semibold text-stone-700 cursor-pointer"
                    >
                      +2 Weeks
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickFollowUp(30)}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[11px] font-semibold text-stone-700 cursor-pointer"
                    >
                      +1 Month
                    </button>
                  </div>

                  {/* High-Risk Follow-Up Enrollment Checkbox */}
                  <label className="flex items-center gap-2 pt-2 text-xs font-semibold text-stone-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enrolHighRiskTracker}
                      onChange={(e) => setEnrolHighRiskTracker(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
                    />
                    <span>{t('rx_enrol_tracker')}</span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            /* OFFICIAL PRINTABLE PRESCRIPTION SLIP PREVIEW */
            <div className="bg-white rounded-2xl border-2 border-stone-300 p-6 sm:p-8 shadow-sm space-y-6 text-stone-900 print:border-none print:shadow-none font-sans">
              {/* Government & Telemedicine Letterhead Header */}
              <div className="border-b-2 border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-teal-800 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    Government of West Bengal &bull; National Health Mission (NHM)
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-stone-900 mt-0.5">
                    Ayushman Bharat Digital Mission (ABDM) e-Prescription
                  </h1>
                  <p className="text-xs text-stone-600 font-medium">
                    District Telemedicine Hub &bull; Hub &amp; Spoke Assisted Rural Telehealth Network
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-stone-900">Rx No: {rxDocNumber}</div>
                  <div className="text-xs text-stone-500 flex items-center justify-end gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Patient & Doctor Demographics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
                {/* Patient Box */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('rx_patient_details')}</div>
                  <div className="text-sm font-black text-stone-900">{currentPatient?.name}</div>
                  <div className="text-stone-600">
                    Age / Gender: <strong>{currentPatient?.age}y / {currentPatient?.gender}</strong>
                  </div>
                  <div className="text-stone-600">
                    ABHA ID: <span className="font-mono font-bold text-teal-900">{currentPatient?.abhaId}</span>
                  </div>
                  <div className="text-stone-600">
                    Village: {currentPatient?.village}, {currentPatient?.district}
                  </div>
                  <div className="text-stone-600">
                    Sub-Centre Spoke: <strong>{currentPatient?.registeredFacility}</strong>
                  </div>
                </div>

                {/* Doctor Box */}
                <div className="space-y-1 sm:border-l sm:border-stone-200 sm:pl-4">
                  <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('rx_consulting_physician')}</div>
                  <div className="text-sm font-black text-stone-900">{currentUser.name}</div>
                  <div className="text-stone-600">
                    Specialty: <strong>{currentUser.specialization}</strong>
                  </div>
                  <div className="text-stone-600">
                    Registration No: <span className="font-mono font-bold">{currentUser.registrationNumber || 'MCI-WB-2018-88412'}</span>
                  </div>
                  <div className="text-stone-600">
                    Facility: {currentUser.facility}
                  </div>
                  <div className="text-stone-600 flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t('rx_digital_signature')}
                  </div>
                </div>
              </div>

              {/* Clinical Diagnosis & Vitals Summary */}
              <div className="space-y-2 text-xs border-b border-stone-200 pb-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Diagnosis:</span>
                  <span className="font-bold text-stone-900 text-sm">{diagnosis || 'General Consultation'}</span>
                </div>

                {symptomsInput && (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Chief Complaints:</span>
                    <span className="text-stone-700">{symptomsInput}</span>
                  </div>
                )}

                {latestVital && (
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-stone-600 font-mono text-[11px]">
                    <span className="font-bold text-stone-500 font-sans uppercase text-[10px]">Recorded Vitals:</span>
                    {latestVital.bloodPressureSys && <span>BP: {latestVital.bloodPressureSys}/{latestVital.bloodPressureDia} mmHg</span>}
                    {latestVital.spO2 && <span>SpO2: {latestVital.spO2}%</span>}
                    {latestVital.pulseRate && <span>Pulse: {latestVital.pulseRate} bpm</span>}
                    {latestVital.bloodSugarMgDl && <span>Sugar: {latestVital.bloodSugarMgDl} mg/dL</span>}
                  </div>
                )}
              </div>

              {/* Prescribed Medications Table (The Core Rx) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-serif italic font-black text-2xl text-teal-900">℞</span>
                  <span className="font-bold text-stone-800 text-xs uppercase tracking-wider">
                    Prescribed Medicines (औषधि विवरण)
                  </span>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">Medicine &amp; Dosage</th>
                        <th className="p-3">Frequency</th>
                        <th className="p-3">Timing</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Hindi Instructions (खुराक निर्देश)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {medicines.map((m, idx) => (
                        <tr key={m.id} className="hover:bg-stone-50/60">
                          <td className="p-3 font-mono text-center text-stone-400">{idx + 1}</td>
                          <td className="p-3 font-bold text-stone-900">{m.name}</td>
                          <td className="p-3 font-mono font-bold text-teal-900">{m.frequency}</td>
                          <td className="p-3 text-stone-700">{m.timing}</td>
                          <td className="p-3 font-medium text-stone-800">{m.durationDays} Days</td>
                          <td className="p-3 text-stone-800 font-medium">{m.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Advised Diagnostic Investigations */}
              {selectedTests.length > 0 && (
                <div className="space-y-1 text-xs border-t border-stone-200 pt-3">
                  <div className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                    Advised Investigations / Laboratory Tests:
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedTests.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-md bg-stone-100 font-semibold text-stone-800 border border-stone-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietary & Lifestyle Advice */}
              {dietaryAdvice && (
                <div className="space-y-1 text-xs border-t border-stone-200 pt-3">
                  <div className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                    Dietary &amp; Lifestyle Precautions (परहेज व सलाह):
                  </div>
                  <p className="text-stone-800 leading-relaxed bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
                    {dietaryAdvice}
                  </p>
                </div>
              )}

              {/* Follow-up & Footer */}
              <div className="border-t-2 border-stone-800 pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-stone-900">
                    Follow-up Consultation Date:{' '}
                    <span className="text-teal-900 font-bold underline">
                      {followUpDate || 'As advised after 7 days'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    In case of acute breathlessness, chest pain or convulsions, dial 108 Emergency Ambulance immediately.
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Generated via SwasthyaSetu Rural Telehealth Node &bull; Electronic prescription valid under Indian Telemedicine Practice Guidelines 2020.
                  </p>
                </div>

                {/* Digital Stamp & QR Code */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-16 h-16 bg-stone-100 border border-stone-300 rounded-lg flex flex-col items-center justify-center p-1 text-[9px] text-stone-600">
                    <QrCode className="w-10 h-10 text-stone-800" />
                    <span>ABDM QR</span>
                  </div>

                  <div className="text-center p-2 rounded-xl border border-teal-200 bg-teal-50/50 text-[10px]">
                    <div className="font-black text-teal-900">{currentUser.name}</div>
                    <div className="text-stone-600">{currentUser.specialization}</div>
                    <div className="text-stone-500 font-mono">Reg: {currentUser.registrationNumber || 'MCI-WB-2018-88412'}</div>
                    <div className="text-emerald-700 font-bold mt-0.5">Digitally Signed &bull; {new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {isSuccessSaved && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('rx_success_message')}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold cursor-pointer transition-colors"
            >
              {t('rx_close')}
            </button>

            {activeTab === 'preview' && (
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('rx_print_slip')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSavePrescription}
              disabled={isSuccessSaved}
              className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:shadow-teal-200"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('rx_sign_push')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
