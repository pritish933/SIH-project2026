import { useState, useEffect, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { PrescriptionMedicine, VitalRecord, AttachedHealthReport } from '../../types';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Wifi,
  FileText,
  Pill,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Activity,
  CreditCard,
  Building,
  User,
  ShieldCheck,
  MapPin,
  Globe,
  Volume2,
  VolumeX,
  Languages,
  Sparkles,
} from 'lucide-react';
import { getMedicineAvailability } from '../../utils/medicineLocator';
import { speakText, stopSpeech } from '../../utils/speechUtils';
import { DialectSymptomTranslatorModal } from '../translation/DialectSymptomTranslatorModal';

const LIVE_SUBTITLE_STREAMS: Record<
  'hi' | 'bn' | 'ta' | 'en' | 'dialect',
  Array<{ speaker: string; text: string; role: 'doctor' | 'patient' }>
> = {
  hi: [
    { speaker: 'डॉक्टर (Dr. Sneha)', text: 'नमस्ते रमेश जी! दवाइयां समय पर ले रहे हैं? बीपी की गोली सुबह नाश्ते के बाद ही लेनी है।', role: 'doctor' },
    { speaker: 'मरीज़ (ASHA Assisted)', text: 'जी डॉक्टर साहिबा, सिर में हल्का चक्कर आ रहा था, बाकी छाती का दर्द अब पहले से कम है।', role: 'patient' },
    { speaker: 'डॉक्टर (Dr. Sneha)', text: 'घबराने की बात नहीं है। मैंने पर्चे में नमक कम खाने और 7 दिन बाद आशा दीदी से बीपी दोबारा नपवाने को लिखा है।', role: 'doctor' },
  ],
  bn: [
    { speaker: 'ডাক্তার (Dr. Sneha)', text: 'নমস্কার রমেশবাবু! ওষুধগুলো ঠিক সময়ে নিচ্ছেন তো? প্রেসারের ওষুধ সকালে খাবার পর খাবেন।', role: 'doctor' },
    { speaker: 'রোগী (ASHA Assisted)', text: 'হ্যাঁ ডাক্তার ম্যাডাম, একটু মাথা ঘুরছিল, তবে বুকের চাপটা এখন আগের চেয়ে কম আছে।', role: 'patient' },
    { speaker: 'ডাক্তার (Dr. Sneha)', text: 'চিন্তার কিছু নেই। খাবারে নুন কম খাবেন এবং ৭ দিন পর আশা দিদিকে দিয়ে প্রেসার মাপাবেন।', role: 'doctor' },
  ],
  ta: [
    { speaker: 'மருத்துவர் (Dr. Sneha)', text: 'வணக்கம்! மருந்துகளை சரியான நேரத்தில் உட்கொள்கிறீர்களா? இரத்த அழுத்த மாத்திரையை காலையில் சாப்பிட்ட பின் போடவும்.', role: 'doctor' },
    { speaker: 'நோயாளி (ASHA Assisted)', text: 'ஆம் டாக்டர், தலைசுற்றல் சற்று இருந்தது, ஆனால் நெஞ்சு பாரம் இப்போது குறைந்துள்ளது.', role: 'patient' },
    { speaker: 'மருத்துவர் (Dr. Sneha)', text: 'பயப்பட வேண்டாம். உப்பை குறைத்து சாப்பிடுங்கள், 7 நாட்களுக்குப் பின் ஆஷா பணியாளரிடம் மீண்டும் பரிசோதிக்கவும்.', role: 'doctor' },
  ],
  dialect: [
    { speaker: 'डॉक्टर (Dr. Sneha)', text: 'रमेश भइया, माथो घूम रओ थो का? बीपी की गोली सुबेरे नाश्ता के बादई खाने हे, नागा मत करियो।', role: 'doctor' },
    { speaker: 'मरीज़ (ASHA Assisted)', text: 'हओ डॉक्टर साब, सबेरे से माथा घनघना रओ थो, छाती को जाड़ा अब थोड़ो सो कम हे।', role: 'patient' },
    { speaker: 'डॉक्टर (Dr. Sneha)', text: 'कछु चिंता की बात नई हे। नोन (नमक) कम खाइयो, आशा दीदी सात दिन बाद घर आके बीपी नापेंगी।', role: 'doctor' },
  ],
  en: [
    { speaker: 'Dr. Sneha Sharma', text: 'Hello Rameshwar ji! Are you taking your medications on time? Take the BP tablet strictly after breakfast.', role: 'doctor' },
    { speaker: 'Patient (Assisted)', text: 'Yes Doctor, had slight dizziness in the morning, but the chest heaviness has reduced now.', role: 'patient' },
    { speaker: 'Dr. Sneha Sharma', text: 'Nothing to worry about. Reduce dietary sodium and have ASHA Meena ji re-check your blood pressure in 7 days.', role: 'doctor' },
  ],
};

export function TelehealthRoom() {
  const {
    activeTelehealthSession,
    endTeleconsultation,
    selectedPatientForEHR,
    addPrescription,
    createReferral,
    connectivity,
    medicineStock,
    t,
  } = useApp();

  if (!activeTelehealthSession) return null;

  const patient = selectedPatientForEHR;

  // Telehealth call state
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isLowBandwidthMode, setIsLowBandwidthMode] = useState(connectivity === 'online_low');
  const [activeTab, setActiveTab] = useState<'prescription' | 'ehr' | 'chat'>('prescription');

  // Multilingual Subtitles & Dialect Translation State
  const [isSubtitlesOpen, setIsSubtitlesOpen] = useState(true);
  const [subtitleLang, setSubtitleLang] = useState<'hi' | 'bn' | 'ta' | 'en' | 'dialect'>('hi');
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [isDialectModalOpen, setIsDialectModalOpen] = useState(false);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  // Live call timer
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // In-call e-Prescription state
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    {
      id: 'm-1',
      name: 'Amlodipine Besylate 5mg',
      dosage: '5 mg',
      frequency: '1-0-0',
      timing: 'After Food',
      durationDays: 30,
      instructions: 'Take in morning with breakfast',
    },
  ]);
  const [advisedTests, setAdvisedTests] = useState<string>('Blood Urea & Serum Creatinine, Urine Microalbumin');
  const [dietaryAdvice, setDietaryAdvice] = useState<string>('Low sodium diet (<3g/day), avoid fried snacks, walk 30 mins.');
  const [followUpDate, setFollowUpDate] = useState<string>('2026-09-28');
  const [rxSuccessMessage, setRxSuccessMessage] = useState<string | null>(null);
  const [attachReviewedReports, setAttachReviewedReports] = useState<boolean>(true);
  const [doctorReportReviewNotes, setDoctorReportReviewNotes] = useState<string>(
    'Reviewed point-of-care vitals and diagnostic center lab reports during teleconsultation. Findings indicate urgent need for medication adjustment.'
  );

  // In-call quick chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'ASHA Meena Devi',
      text: 'Doctor Sahiba, patient BP check kiya tha 154/96 aaya hai. Dizziness ki shikayat hai subah se.',
      time: '10:31 AM',
    },
    {
      sender: 'Dr. Sneha Sharma',
      text: 'Theek hai Meena ji, main patient se baat karti hoon aur medication review karti hoon.',
      time: '10:32 AM',
    },
  ]);
  const [newChatText, setNewChatText] = useState('');

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        id: `med-${Date.now()}`,
        name: 'Metformin Hydrochloride 500mg SR',
        dosage: '500 mg',
        frequency: '1-0-1',
        timing: 'After Food',
        durationDays: 30,
        instructions: 'After lunch and dinner',
      },
    ]);
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const handleUpdateMedicine = (id: string, field: keyof PrescriptionMedicine, value: any) => {
    setMedicines(
      medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleIssuePrescription = (e: FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    const attachedReportsList: AttachedHealthReport[] = [];
    if (attachReviewedReports && latestVital) {
      attachedReportsList.push({
        id: `REP-${Date.now()}`,
        reportName:
          latestVital.reportDocumentName ||
          (latestVital.sourceType === 'Diagnostic_Center'
            ? 'Diagnostic Pathology Laboratory Panel'
            : 'Point-of-Care Vitals & Clinical Screening Report'),
        reportType: latestVital.sourceType === 'Diagnostic_Center' ? 'Diagnostic_Center' : 'Point_of_Care_Vitals',
        date: latestVital.date || new Date().toISOString().split('T')[0],
        facilityOrLabName:
          latestVital.diagnosticCenterName || activeTelehealthSession.subCentre || 'Primary Health Centre Pipariya',
        conductorOrTechnician: latestVital.conductorName || 'Attending ASHA Worker / CHO',
        verifiedByDoctor: true,
        doctorReviewNotes:
          doctorReportReviewNotes ||
          'Reviewed and corroborated diagnostic vitals during teleconsultation prior to prescribing.',
        barcodeOrAbhaDocId: `ABDM-DOC-${Math.floor(100000 + Math.random() * 900000)}`,
        findings: [
          {
            parameter: 'Blood Pressure (Sys / Dia)',
            value: `${latestVital.bloodPressureSys} / ${latestVital.bloodPressureDia}`,
            unit: 'mmHg',
            status: latestVital.bloodPressureSys >= 140 ? 'High' : 'Normal',
            referenceRange: '< 120 / 80 mmHg',
          },
          ...(latestVital.bloodSugarMgDl
            ? [
                {
                  parameter: `Blood Glucose (${latestVital.bloodSugarType || 'Fasting'})`,
                  value: `${latestVital.bloodSugarMgDl}`,
                  unit: 'mg/dL',
                  status: (latestVital.bloodSugarMgDl > 140 ? 'High' : 'Normal') as any,
                  referenceRange: '70 - 100 mg/dL',
                },
              ]
            : []),
          ...(latestVital.cholesterolMgDl
            ? [
                {
                  parameter: 'Serum Total Cholesterol',
                  value: `${latestVital.cholesterolMgDl}`,
                  unit: 'mg/dL',
                  status: (latestVital.cholesterolMgDl > 200 ? 'High' : 'Normal') as any,
                  referenceRange: '< 200 mg/dL',
                },
              ]
            : []),
          ...(latestVital.creatinineMgDl
            ? [
                {
                  parameter: 'Serum Creatinine',
                  value: `${latestVital.creatinineMgDl}`,
                  unit: 'mg/dL',
                  status: (latestVital.creatinineMgDl > 1.3 ? 'High' : 'Normal') as any,
                  referenceRange: '0.7 - 1.3 mg/dL',
                },
              ]
            : []),
          ...(latestVital.hemoglobinGdl
            ? [
                {
                  parameter: 'Hemoglobin (Hb)',
                  value: `${latestVital.hemoglobinGdl}`,
                  unit: 'g/dL',
                  status: (latestVital.hemoglobinGdl < 11 ? 'Critical' : 'Normal') as any,
                  referenceRange: '11.0 - 14.0 g/dL',
                },
              ]
            : []),
          {
            parameter: 'Pulse Rate',
            value: `${latestVital.pulseRate}`,
            unit: 'bpm',
            status: 'Normal',
            referenceRange: '60 - 100 bpm',
          },
          {
            parameter: 'Oxygen Saturation (SpO2)',
            value: `${latestVital.spO2}`,
            unit: '%',
            status: latestVital.spO2 < 95 ? 'Critical' : 'Normal',
            referenceRange: '95 - 100 %',
          },
        ],
      });
    }

    addPrescription(patient.id, {
      date: new Date().toISOString().split('T')[0],
      doctorId: activeTelehealthSession.doctorId,
      doctorName: activeTelehealthSession.doctorName,
      doctorSpecialty: activeTelehealthSession.doctorSpecialty,
      facility: 'District Hospital Telemedicine Hub',
      diagnosis: diagnosis || 'Essential Hypertension with early peripheral signs',
      symptoms: symptoms ? symptoms.split(',').map((s) => s.trim()) : ['High BP', 'Morning dizziness'],
      medicines,
      advisedTests: advisedTests ? advisedTests.split(',').map((t) => t.trim()) : [],
      dietaryAdvice,
      followUpDate,
      isDispensed: true,
      attachedReports: attachedReportsList,
    });

    setRxSuccessMessage('e-Prescription signed with attached health report & pushed to ABDM registry!');
    setTimeout(() => setRxSuccessMessage(null), 4500);
  };

  const handleSendChat = (e: FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        sender: 'You',
        text: newChatText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewChatText('');
  };

  const latestVital = patient?.vitalsHistory[0];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900 text-stone-100 flex flex-col">
      {/* Top Teleconsultation Header Bar */}
      <div className="bg-stone-950 border-b border-stone-800 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-extrabold text-white text-sm tracking-wide">
              LIVE TELECONSULTATION
            </span>
          </div>
          <span className="text-xs text-stone-400 font-mono bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
            {formatTimer(callSeconds)}
          </span>
          <span className="hidden sm:inline text-xs text-stone-400">
            Spoke: <strong className="text-stone-200">{activeTelehealthSession.subCentre}</strong>
          </span>
        </div>

        {/* Low-Bandwidth Mode Switcher & Dialect Dictionary */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dialect Dictionary Button */}
          <button
            onClick={() => setIsDialectModalOpen(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-800/60 hover:bg-teal-700 text-teal-200 border border-teal-600/40 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open Rural Dialect Symptom Dictionary"
          >
            <Globe className="w-3.5 h-3.5 text-teal-300" />
            <span className="hidden sm:inline">बोली शब्दकोश (Dialect)</span>
          </button>

          <button
            onClick={() => setIsLowBandwidthMode(!isLowBandwidthMode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLowBandwidthMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
            title="Optimized for 2G / Poor Rural Connectivity"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>{isLowBandwidthMode ? '2G Mode' : 'HD Video'}</span>
          </button>

          {/* End Call Button */}
          <button
            onClick={endTeleconsultation}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Main Split Body: Video Feed on Left, EHR/Rx on Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Video / Audio Feed Area (7 cols) */}
        <div className="lg:col-span-7 bg-stone-900 flex flex-col p-4 overflow-y-auto space-y-4">
          {/* Main Remote Video Screen (Patient at Sub-Centre) */}
          <div className="relative flex-1 min-h-[300px] lg:min-h-[420px] bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden flex items-center justify-center">
            {isLowBandwidthMode ? (
              /* Low-Bandwidth Audio-First View */
              <div className="text-center p-6 space-y-4 max-w-md">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                  <Mic className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{activeTelehealthSession.patientName}</h3>
                  <p className="text-xs text-stone-400">
                    {activeTelehealthSession.subCentre} &bull; Assisted by {activeTelehealthSession.ashaName || 'ASHA Worker'}
                  </p>
                </div>
                <div className="p-3 bg-stone-900/90 rounded-xl border border-stone-800 text-xs text-amber-300">
                  <div className="font-semibold">Low-Bandwidth Adaptive Mode</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Audio bitrate throttled to 16 kbps with zero dropouts. Vital telemetry is streaming live.
                  </div>
                </div>
              </div>
            ) : (
              /* Simulated Remote Patient Video Feed */
              <div className="w-full h-full relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
                  alt="Rural Patient Feed"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30" />

                {/* Watermark Spoke info */}
                <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-200 border border-stone-700/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{activeTelehealthSession.patientName} (Sub-Centre Pipariya)</span>
                </div>

                <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur px-2.5 py-1 rounded-lg text-[11px] font-mono text-stone-300 border border-stone-700/50">
                  Latency: 48ms &bull; 720p HD
                </div>
              </div>
            )}

            {/* Doctor Self Picture-in-Picture */}
            <div className="absolute bottom-4 right-4 w-32 h-24 sm:w-40 sm:h-28 bg-stone-900 rounded-xl border-2 border-stone-700 overflow-hidden shadow-2xl">
              {isVideoMuted ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-xs">
                  <VideoOff className="w-6 h-6 mb-1" />
                  <span>Camera Off</span>
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
                  alt="Doctor Stream"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-1 left-1.5 text-[9px] bg-stone-900/80 px-1 rounded text-stone-300">
                You (Doctor Hub)
              </div>
            </div>

            {/* Live Patient Vital Telemetry Strip Overlay */}
            {latestVital && (
              <div className="absolute bottom-4 left-4 right-36 sm:right-48 bg-stone-900/90 backdrop-blur p-2.5 rounded-xl border border-stone-800 text-xs flex items-center gap-3 overflow-x-auto">
                <div className="shrink-0 flex items-center gap-1.5 text-stone-300">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Live Vitals:</span>
                </div>
                <div className="flex items-center gap-3 text-stone-200">
                  <span className="px-2 py-0.5 rounded bg-stone-800 font-mono">
                    BP: <strong className="text-amber-400">{latestVital.bloodPressureSys}/{latestVital.bloodPressureDia}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-stone-800 font-mono">
                    SpO2: <strong className="text-emerald-400">{latestVital.spO2}%</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-stone-800 font-mono">
                    Pulse: <strong>{latestVital.pulseRate} bpm</strong>
                  </span>
                  {latestVital.bloodSugarMgDl && (
                    <span className="px-2 py-0.5 rounded bg-stone-800 font-mono">
                      Sugar: <strong className="text-amber-400">{latestVital.bloodSugarMgDl} mg/dL</strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Live Subtitles & AI Dialect Translation Box */}
          <div className="bg-stone-950/90 rounded-2xl border border-stone-800 p-3.5 space-y-2 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-teal-400" />
                  <span>सजीव अनुवाद व उपशीर्षक (Live Subtitles)</span>
                </span>
              </div>

              {/* Language Selector Pills */}
              <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
                {[
                  { code: 'hi', label: 'हिंदी' },
                  { code: 'bn', label: 'বাংলা' },
                  { code: 'ta', label: 'தமிழ்' },
                  { code: 'dialect', label: 'बुंदेली' },
                  { code: 'en', label: 'EN' },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      stopSpeech();
                      setSubtitleLang(l.code as any);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                      subtitleLang === l.code
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle Dialogue Active Line */}
            {LIVE_SUBTITLE_STREAMS[subtitleLang] && (
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold tracking-wider text-teal-400 uppercase">
                    {LIVE_SUBTITLE_STREAMS[subtitleLang][activeSubtitleIndex]?.speaker}
                  </span>
                  <p className="text-xs text-stone-100 font-medium leading-relaxed">
                    &ldquo;{LIVE_SUBTITLE_STREAMS[subtitleLang][activeSubtitleIndex]?.text}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* TTS Voice Readout Button */}
                  <button
                    onClick={() => {
                      if (isTtsPlaying) {
                        stopSpeech();
                        setIsTtsPlaying(false);
                      } else {
                        const currentLine = LIVE_SUBTITLE_STREAMS[subtitleLang][activeSubtitleIndex]?.text || '';
                        speakText(
                          currentLine,
                          subtitleLang,
                          () => setIsTtsPlaying(true),
                          () => setIsTtsPlaying(false),
                          () => setIsTtsPlaying(false)
                        );
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isTtsPlaying
                        ? 'bg-amber-600 text-white animate-pulse'
                        : 'bg-stone-800 hover:bg-stone-700 text-teal-300 border border-stone-700'
                    }`}
                    title="Read aloud in selected language"
                  >
                    {isTtsPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isTtsPlaying ? 'रोकें' : 'बोलकर सुनाएं'}</span>
                  </button>

                  {/* Cycle Next Dialogue Sample */}
                  <button
                    onClick={() => {
                      stopSpeech();
                      setIsTtsPlaying(false);
                      setActiveSubtitleIndex((prev) => (prev + 1) % LIVE_SUBTITLE_STREAMS[subtitleLang].length);
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 cursor-pointer"
                    title="Next dialogue snippet"
                  >
                    अगला संवाद &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls Bar */}
          <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={`p-3 rounded-full cursor-pointer transition-colors ${
                isAudioMuted ? 'bg-red-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
              }`}
              title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsVideoMuted(!isVideoMuted)}
              className={`p-3 rounded-full cursor-pointer transition-colors ${
                isVideoMuted ? 'bg-red-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
              }`}
              title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsLowBandwidthMode(!isLowBandwidthMode)}
              className={`p-3 rounded-full cursor-pointer transition-colors ${
                isLowBandwidthMode ? 'bg-amber-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
              }`}
              title="Toggle Low Bandwidth Mode"
            >
              <Radio className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Tabbed Panel: Clinical Pad & Patient Records (5 cols) */}
        <div className="lg:col-span-5 bg-stone-900 border-l border-stone-800 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-stone-800 bg-stone-950 px-2 shrink-0">
            <button
              onClick={() => setActiveTab('prescription')}
              className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'prescription'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Digital e-Prescription Pad</span>
            </button>
            <button
              onClick={() => setActiveTab('ehr')}
              className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'ehr'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Patient Longitudinal EHR</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Clinical Chat &amp; Notes</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. In-Call e-Prescription Pad */}
            {activeTab === 'prescription' && (
              <form onSubmit={handleIssuePrescription} className="space-y-4 text-xs">
                {rxSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{rxSuccessMessage}</span>
                  </div>
                )}

                {/* Patient summary badge */}
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">{activeTelehealthSession.patientName}</div>
                    <div className="text-stone-400 text-[11px]">
                      ABHA: {activeTelehealthSession.abhaId} &bull; Age: {activeTelehealthSession.patientAge}y
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                    ABHA Verified
                  </span>
                </div>

                {/* Diagnosis */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Clinical Diagnosis</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Stage II Essential Hypertension with early nephropathy risk"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Medicines List from Essential Drugs List (EDL) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-stone-300 font-semibold">Prescribed Medicines (From Essential Drug List)</label>
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Drug
                    </button>
                  </div>

                    {medicines.map((med, idx) => {
                      const avail = getMedicineAvailability(
                        med.name,
                        activeTelehealthSession.subCentre,
                        medicineStock
                      );

                      return (
                        <div key={med.id} className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={med.name}
                              onChange={(e) => handleUpdateMedicine(med.id, 'name', e.target.value)}
                              className="flex-1 px-2 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-stone-100"
                            >
                              <option value="Amlodipine Besylate 5mg">Amlodipine Besylate 5mg (Cardiovascular)</option>
                              <option value="Metformin Hydrochloride 500mg SR">Metformin Hydrochloride 500mg SR (Diabetes)</option>
                              <option value="Atorvastatin 10mg">Atorvastatin 10mg (Lipid/Heart)</option>
                              <option value="Telmisartan 40mg">Telmisartan 40mg (Cardiovascular)</option>
                              <option value="Iron & Folic Acid (IFA) Red">Iron &amp; Folic Acid (IFA) Red (Maternal)</option>
                              <option value="Inj. Iron Sucrose 100mg">Inj. Iron Sucrose 100mg IV (Severe Anemia)</option>
                              <option value="Folic Acid & Calcium Tablet">Folic Acid &amp; Calcium Tablet (Maternal)</option>
                              <option value="Zinc Sulfate Dispersible Tablets">Zinc Sulfate DT 20mg (Pediatric)</option>
                              <option value="Amoxicillin + Clavulanate 625mg">Amoxicillin + Clavulanate 625mg (Antibiotic)</option>
                              <option value="Amoxicillin Oral Suspension">Amoxicillin Oral Suspension (Pediatric)</option>
                              <option value="Paracetamol 500mg">Paracetamol 500mg (Analgesic)</option>
                            </select>
                            {medicines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMedicine(med.id)}
                                className="text-stone-500 hover:text-red-400 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Real-Time Drug Stock & Pickup Center Visibility for Prescribing Doctor */}
                          <div className="p-2 rounded-lg bg-stone-900/90 border border-stone-800 text-[11px] flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-stone-300">
                              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                              <span>
                                {activeTelehealthSession.subCentre}:{' '}
                                <strong className="text-stone-100">
                                  {avail.primaryLocation.stockCount} {avail.primaryLocation.unit}
                                </strong>{' '}
                                &bull; PHC Central: {avail.allLocations[1]?.stockCount || 400} {avail.primaryLocation.unit}
                              </span>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                avail.summaryStatusColor === 'emerald'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : avail.summaryStatusColor === 'blue'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {avail.summaryStatus}
                            </span>
                          </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="text-stone-500">Frequency:</span>
                          <select
                            value={med.frequency}
                            onChange={(e) => handleUpdateMedicine(med.id, 'frequency', e.target.value)}
                            className="w-full mt-0.5 px-2 py-1 rounded bg-stone-900 border border-stone-700 text-stone-200"
                          >
                            <option value="1-0-1">1-0-1 (Twice)</option>
                            <option value="1-0-0">1-0-0 (Morning)</option>
                            <option value="0-0-1">0-0-1 (Night)</option>
                            <option value="1-1-1">1-1-1 (Thrice)</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-stone-500">Timing:</span>
                          <select
                            value={med.timing}
                            onChange={(e) => handleUpdateMedicine(med.id, 'timing', e.target.value as any)}
                            className="w-full mt-0.5 px-2 py-1 rounded bg-stone-900 border border-stone-700 text-stone-200"
                          >
                            <option value="After Food">After Food</option>
                            <option value="Before Food">Before Food</option>
                            <option value="With Food">With Food</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-stone-500">Duration (Days):</span>
                          <input
                            type="number"
                            value={med.durationDays}
                            onChange={(e) => handleUpdateMedicine(med.id, 'durationDays', parseInt(e.target.value) || 1)}
                            className="w-full mt-0.5 px-2 py-1 rounded bg-stone-900 border border-stone-700 text-stone-200"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

                {/* Recommended Diagnostic Investigations */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Advised Point-of-Care / PHC Diagnostics
                  </label>
                  <input
                    type="text"
                    value={advisedTests}
                    onChange={(e) => setAdvisedTests(e.target.value)}
                    placeholder="e.g. Blood Sugar, Serum Creatinine, Urine Albumin"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-xs"
                  />
                </div>

                {/* Dietary & Lifestyle Advice */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Dietary &amp; Home Care Instructions</label>
                  <textarea
                    rows={2}
                    value={dietaryAdvice}
                    onChange={(e) => setDietaryAdvice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-xs"
                  />
                </div>

                {/* Health Reports Reviewed & Attached to Prescription */}
                <div className="p-3 rounded-xl bg-stone-950 border border-teal-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-teal-300 flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={attachReviewedReports}
                        onChange={(e) => setAttachReviewedReports(e.target.checked)}
                        className="rounded accent-teal-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Attach Reviewed Health Report to this Prescription</span>
                    </label>
                    <span className="text-[10px] font-semibold text-teal-300 bg-teal-950/90 px-2 py-0.5 rounded border border-teal-700">
                      ABDM Linked
                    </span>
                  </div>

                  {attachReviewedReports && (
                    <div className="space-y-2 pt-1 border-t border-stone-800">
                      <div className="text-[11px] text-stone-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>
                          Referenced Report:{' '}
                          <strong className="text-stone-100 font-semibold">
                            {latestVital?.reportDocumentName ||
                              (latestVital?.sourceType === 'Diagnostic_Center'
                                ? 'Diagnostic Center Laboratory Report'
                                : 'Point-of-Care Vitals Screening')}
                          </strong>{' '}
                          ({latestVital?.date || 'Today'})
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-stone-400 block mb-1">
                          Doctor's Clinical Remark on this Report:
                        </span>
                        <input
                          type="text"
                          value={doctorReportReviewNotes}
                          onChange={(e) => setDoctorReportReviewNotes(e.target.value)}
                          placeholder="Reason for prescribing based on this report..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Digitally Sign &amp; Issue e-Prescription (ABDM Compliant)</span>
                </button>
              </form>
            )}

            {/* 2. Patient Longitudinal EHR */}
            {activeTab === 'ehr' && patient && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="font-bold text-white text-sm flex items-center justify-between">
                    <span>Clinical Profile</span>
                    <span className="text-emerald-400 text-xs">Blood Group: {patient.bloodGroup}</span>
                  </div>
                  <div className="text-stone-400">
                    <div>Known Allergies: <span className="text-rose-400 font-semibold">{patient.allergies.join(', ') || 'None reported'}</span></div>
                    <div>Chronic Diagnoses: <span className="text-stone-200 font-semibold">{patient.chronicConditions.join(', ')}</span></div>
                    <div>Registered Sub-Centre: <span className="text-stone-200">{patient.registeredFacility}</span></div>
                  </div>
                </div>

                {/* Vitals History Trend */}
                <div className="space-y-2">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Point-of-Care Vitals History</span>
                  </div>
                  <div className="space-y-2">
                    {patient.vitalsHistory.map((vital, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-300">
                        <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                          <span className="text-stone-400">{vital.date}</span>
                          <span className="text-amber-400 font-bold">BP: {vital.bloodPressureSys}/{vital.bloodPressureDia}</span>
                          <span className="text-emerald-400 font-bold">SpO2: {vital.spO2}%</span>
                        </div>
                        {vital.notes && <p className="text-[11px] text-stone-400">{vital.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Past Prescriptions */}
                <div className="space-y-2">
                  <div className="font-bold text-white text-xs">Past Encounters &amp; Treatments</div>
                  {patient.prescriptions.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                      <div className="flex items-center justify-between font-semibold text-white">
                        <span>{p.diagnosis}</span>
                        <span className="text-stone-400 text-[10px]">{p.date}</span>
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {p.medicines.map((m) => m.name).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. In-Call Clinical Chat */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-[400px] justify-between text-xs">
                <div className="space-y-3 overflow-y-auto pr-1">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl max-w-[85%] ${
                        msg.sender === 'You'
                          ? 'ml-auto bg-emerald-900/60 border border-emerald-700/50 text-emerald-100'
                          : 'bg-stone-950 border border-stone-800 text-stone-200'
                      }`}
                    >
                      <div className="text-[10px] text-stone-400 flex items-center justify-between mb-1">
                        <span className="font-bold">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newChatText}
                    onChange={(e) => setNewChatText(e.target.value)}
                    placeholder="Type clinical note or message to ASHA..."
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rural Dialect Symptom Translator Modal */}
      <DialectSymptomTranslatorModal
        isOpen={isDialectModalOpen}
        onClose={() => setIsDialectModalOpen(false)}
        onSelectTermForNotes={(termText) => {
          setDoctorReportReviewNotes((prev) => (prev ? `${prev}\n${termText}` : termText));
          setIsDialectModalOpen(false);
        }}
      />
    </div>
  );
}
