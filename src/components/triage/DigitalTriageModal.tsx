import { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Heart,
  Baby,
  X,
  PhoneCall,
  Video,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export function DigitalTriageModal() {
  const {
    isTriageModalOpen,
    setIsTriageModalOpen,
    patients,
    updateVitals,
    triggerEmergencySOS,
    startTeleconsultation,
    telehealthQueue,
    t,
  } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [systolic, setSystolic] = useState<number>(140);
  const [diastolic, setDiastolic] = useState<number>(90);
  const [spO2, setSpO2] = useState<number>(97);
  const [pulse, setPulse] = useState<number>(82);
  const [temp, setTemp] = useState<number>(98.6);
  const [bloodSugar, setBloodSugar] = useState<number>(160);
  const [isPregnant, setIsPregnant] = useState<boolean>(false);
  const [hemoglobin, setHemoglobin] = useState<number>(11.5);
  const [muacColor, setMuacColor] = useState<'Green' | 'Amber' | 'Red'>('Green');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [triageResult, setTriageResult] = useState<{
    level: 'Red' | 'Amber' | 'Green';
    title: string;
    description: string;
    actionPlan: string;
  } | null>(null);

  if (!isTriageModalOpen) return null;

  const toggleSymptom = (sym: string) => {
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const calculateTriage = (e: FormEvent) => {
    e.preventDefault();

    // Critical Red criteria
    const isEmergency =
      systolic >= 160 ||
      diastolic >= 100 ||
      spO2 < 92 ||
      (isPregnant && hemoglobin < 8.0) ||
      muacColor === 'Red' ||
      symptoms.includes('Severe Chest Pain / Angina') ||
      symptoms.includes('Altered Mental State / Convulsions') ||
      symptoms.includes('Severe Breathlessness at rest');

    // Amber criteria
    const isPriority =
      systolic >= 140 ||
      diastolic >= 90 ||
      bloodSugar > 200 ||
      (isPregnant && hemoglobin < 10.0) ||
      muacColor === 'Amber' ||
      symptoms.includes('High Fever > 3 Days') ||
      symptoms.includes('Bilateral Pedal Edema');

    let result: {
      level: 'Red' | 'Amber' | 'Green';
      title: string;
      description: string;
      actionPlan: string;
    };

    if (isEmergency) {
      result = {
        level: 'Red',
        title: 'CATEGORY RED: Immediate Emergency Escalation Required',
        description: 'Patient exhibits severe critical signs (e.g. vital organ risk, severe anemia in pregnancy, or acute respiratory distress).',
        actionPlan: 'Dispatch 108 Janani/Emergency Ambulance, initiate immediate teleconsultation with District Hospital ICU/Specialist, and prepare FRU bed.',
      };
    } else if (isPriority) {
      result = {
        level: 'Amber',
        title: 'CATEGORY AMBER: Priority Teleconsultation within 2 Hours',
        description: 'Elevated clinical risk factors detected requiring specialist doctor review and medication adjustment today.',
        actionPlan: 'Book assisted teleconsultation at Sub-Centre kiosk, ensure Essential Drug refill, schedule 7-day ASHA follow-up.',
      };
    } else {
      result = {
        level: 'Green',
        title: 'CATEGORY GREEN: Routine Primary Care & Village Monitoring',
        description: 'Vitals stable and within safe rural screening parameters.',
        actionPlan: 'Provide lifestyle advice, dispensable PHC medicines, and routine 30-day non-communicable disease follow-up.',
      };
    }

    setTriageResult(result);

    // Save vitals to patient EHR
    if (selectedPatientId) {
      updateVitals(selectedPatientId, {
        date: new Date().toISOString().split('T')[0],
        bloodPressureSys: systolic,
        bloodPressureDia: diastolic,
        pulseRate: pulse,
        spO2,
        temperatureF: temp,
        bloodSugarMgDl: bloodSugar,
        hemoglobinGdl: isPregnant ? hemoglobin : undefined,
        notes: `Triage screening result: ${result.level} - ${result.title}`,
      });
    }
  };

  const handleEscalateRed = () => {
    const selected = patients.find((p) => p.id === selectedPatientId);
    triggerEmergencySOS(selected?.name, selected?.village);
    setIsTriageModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900">Doorstep Digital Clinical Triage</h2>
              <p className="text-xs text-stone-600">
                National Health Mission (NHM) Protocol for Rural Frontline Screening
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTriageModalOpen(false)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!triageResult ? (
            <form onSubmit={calculateTriage} className="space-y-4">
              {/* Patient Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Select Patient / Citizen</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.age}y, {p.gender}) &bull; ABHA: {p.abhaId} &bull; {p.village}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vitals Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Point-of-Care Physiological Vitals
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-stone-600">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={systolic}
                      onChange={(e) => setSystolic(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-stone-600">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={diastolic}
                      onChange={(e) => setDiastolic(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-stone-600">SpO2 Oxygen (%)</label>
                    <input
                      type="number"
                      value={spO2}
                      onChange={(e) => setSpO2(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-stone-600">Pulse Rate (bpm)</label>
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-stone-600">Random Blood Glucose</label>
                    <input
                      type="number"
                      value={bloodSugar}
                      onChange={(e) => setBloodSugar(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-stone-600">Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(parseFloat(e.target.value) || 98.6)}
                      className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                    />
                  </div>
                </div>
              </div>

              {/* Special Vulnerable Group Screening */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Vulnerable Cohort Assessment (Maternal / Child)
                </span>

                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPregnant}
                      onChange={(e) => setIsPregnant(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-semibold text-stone-800">Antenatal Mother (ANC)</span>
                  </label>
                </div>

                {isPregnant && (
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs">
                    <label className="text-[11px] font-semibold text-rose-900 block mb-1">
                      Hemoglobin (Hb in g/dL) - Alert if &lt; 8.0 g/dL
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={hemoglobin}
                      onChange={(e) => setHemoglobin(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-rose-300"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Child Malnutrition MUAC Strip (Mid-Upper Arm Circumference)
                  </label>
                  <div className="flex gap-2">
                    {(['Green', 'Amber', 'Red'] as const).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setMuacColor(color)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                          muacColor === color
                            ? color === 'Red'
                              ? 'bg-red-600 text-white border-red-700'
                              : color === 'Amber'
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-white border-stone-200 text-stone-600'
                        }`}
                      >
                        {color === 'Green' ? 'Normal (>12.5cm)' : color === 'Amber' ? 'MAM (11.5-12.5cm)' : 'SAM (<11.5cm RED)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Critical Danger Signs */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Danger Signs &amp; Acute Symptoms
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    'Severe Chest Pain / Angina',
                    'Severe Breathlessness at rest',
                    'Altered Mental State / Convulsions',
                    'Bilateral Pedal Edema',
                    'High Fever > 3 Days',
                    'Persistent Vomiting / Inability to drink',
                  ].map((sym) => (
                    <label
                      key={sym}
                      className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer ${
                        symptoms.includes(sym)
                          ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                          : 'bg-white border-stone-200 text-stone-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={symptoms.includes(sym)}
                        onChange={() => toggleSymptom(sym)}
                        className="rounded text-rose-600"
                      />
                      <span>{sym}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>Calculate Digital Triage &amp; Risk Level</span>
              </button>
            </form>
          ) : (
            /* Triage Result Screen */
            <div className="space-y-5 text-center sm:text-left">
              <div
                className={`p-5 rounded-2xl border ${
                  triageResult.level === 'Red'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : triageResult.level === 'Amber'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-base mb-1">
                  {triageResult.level === 'Red' && <ShieldAlert className="w-6 h-6 text-rose-600" />}
                  {triageResult.level === 'Amber' && <AlertTriangle className="w-6 h-6 text-amber-600" />}
                  {triageResult.level === 'Green' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                  <span>{triageResult.title}</span>
                </div>
                <p className="text-xs mt-1 text-stone-700">{triageResult.description}</p>
                <div className="mt-3 p-3 bg-white/80 rounded-xl border border-stone-200 text-xs font-medium">
                  <span className="font-bold text-stone-900">Clinical Protocol Action: </span>
                  {triageResult.actionPlan}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {triageResult.level === 'Red' && (
                  <button
                    onClick={handleEscalateRed}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Trigger 108 Emergency Ambulance</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const session = telehealthQueue[0];
                    if (session) {
                      setIsTriageModalOpen(false);
                      startTeleconsultation(session);
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Start Priority Teleconsultation Now</span>
                </button>

                <button
                  onClick={() => setTriageResult(null)}
                  className="py-3 px-4 rounded-xl border border-stone-300 bg-white text-stone-700 font-semibold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Screen Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
