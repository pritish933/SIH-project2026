import { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { VitalRecord } from '../../types';
import {
  HeartHandshake,
  Activity,
  Heart,
  Pill,
  Droplets,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
} from 'lucide-react';

interface ManualHealthUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  defaultAshaWorker?: string;
  latestVitals?: VitalRecord;
}

export function ManualHealthUpdateModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  defaultAshaWorker = 'Meena Devi (ASHA Sangini)',
  latestVitals,
}: ManualHealthUpdateModalProps) {
  const { updateVitals, language } = useApp();
  const isHindi = language === 'hi';

  const [sourceType, setSourceType] = useState<'ASHA_Doorstep' | 'Self_Reported' | 'PHC_Clinic'>('ASHA_Doorstep');
  const [conductorName, setConductorName] = useState(defaultAshaWorker);

  const [bpSys, setBpSys] = useState<number>(latestVitals?.bloodPressureSys || 150);
  const [bpDia, setBpDia] = useState<number>(latestVitals?.bloodPressureDia || 94);
  const [sugar, setSugar] = useState<number>(latestVitals?.bloodSugarMgDl || 210);
  const [sugarType, setSugarType] = useState<'Fasting' | 'Post-Prandial' | 'Random'>('Random');
  const [cholesterol, setCholesterol] = useState<number>(latestVitals?.cholesterolMgDl || 225);
  const [creatinine, setCreatinine] = useState<number>(latestVitals?.creatinineMgDl || 1.3);
  const [hemoglobin, setHemoglobin] = useState<number>(latestVitals?.hemoglobinGdl || 12.6);
  const [spO2, setSpO2] = useState<number>(latestVitals?.spO2 || 97);
  const [pulse, setPulse] = useState<number>(latestVitals?.pulseRate || 82);
  const [weight, setWeight] = useState<number>(latestVitals?.weightKg || 68.5);
  const [notes, setNotes] = useState<string>('Routine doorstep vitals checkup. Point-of-care strip test conducted.');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const formattedDate = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newRecord: VitalRecord = {
      id: `VIT-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      lastUpdatedFormatted: formattedDate,
      bloodPressureSys: Number(bpSys),
      bloodPressureDia: Number(bpDia),
      bloodSugarMgDl: Number(sugar),
      bloodSugarType: sugarType,
      cholesterolMgDl: Number(cholesterol),
      creatinineMgDl: Number(creatinine),
      hemoglobinGdl: Number(hemoglobin),
      spO2: Number(spO2),
      pulseRate: Number(pulse),
      temperatureF: 98.4,
      weightKg: Number(weight),
      sourceType,
      conductorName,
      notes,
    };

    updateVitals(patientId, newRecord);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 my-8 space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Update Vitals &amp; Health Status</h3>
              <p className="text-xs text-stone-500">
                Log ASHA doorstep checkup or self-monitored reading for <span className="font-semibold text-stone-800">{patientName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-stone-900">Current Health Status Updated!</h4>
            <p className="text-xs text-stone-600">All new biometric parameters have been synced with the patient record.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Source of Checkup Selection */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2.5">
              <label className="block font-bold text-stone-800">
                {isHindi ? 'जाँच किसके द्वारा की गई:' : 'Checkup Performed By:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSourceType('ASHA_Doorstep');
                    setConductorName(defaultAshaWorker);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                    sourceType === 'ASHA_Doorstep'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div>ASHA Doorstep Visit</div>
                    {isHindi && <div className="text-[10px] text-stone-500 font-normal">आशा कार्यकर्ता द्वारा</div>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSourceType('Self_Reported');
                    setConductorName('Patient / Home Kit');
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                    sourceType === 'Self_Reported'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div>Self / Home Device</div>
                    {isHindi && <div className="text-[10px] text-stone-500 font-normal">मरीज / परिवार द्वारा</div>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSourceType('PHC_Clinic');
                    setConductorName('Sub-Centre / PHC Staff');
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                    sourceType === 'PHC_Clinic'
                      ? 'border-purple-600 bg-purple-50/80 text-purple-900 font-bold'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Activity className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <div>Sub-Centre / PHC</div>
                    {isHindi && <div className="text-[10px] text-stone-500 font-normal">स्वास्थ्य केंद्र क्लिनिक</div>}
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Health Worker / Examiner Name:</label>
                <input
                  type="text"
                  value={conductorName}
                  onChange={(e) => setConductorName(e.target.value)}
                  placeholder="e.g. Meena Devi (ASHA Sangini, Rampur)"
                  className="w-full p-2 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Core Vitals Grid */}
            <div className="space-y-3">
              <div className="font-bold text-stone-900 flex items-center justify-between">
                <span>Clinical Parameters &amp; Lab Markers</span>
                <span className="text-[11px] text-stone-500 font-normal">All fields reflect instantly in Current Health Status</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Blood Pressure Sys */}
                <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1">
                  <label className="block font-semibold text-stone-700">BP Systolic (mmHg)</label>
                  <input
                    type="number"
                    min="70"
                    max="240"
                    value={bpSys}
                    onChange={(e) => setBpSys(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                  <div className="text-[10px] text-stone-500">Normal: &lt;120</div>
                </div>

                {/* Blood Pressure Dia */}
                <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1">
                  <label className="block font-semibold text-stone-700">BP Diastolic (mmHg)</label>
                  <input
                    type="number"
                    min="40"
                    max="140"
                    value={bpDia}
                    onChange={(e) => setBpDia(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                  <div className="text-[10px] text-stone-500">Normal: &lt;80</div>
                </div>

                {/* Blood Sugar */}
                <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-stone-700">Blood Sugar (mg/dL)</label>
                  </div>
                  <input
                    type="number"
                    min="40"
                    max="600"
                    value={sugar}
                    onChange={(e) => setSugar(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                  <select
                    value={sugarType}
                    onChange={(e) => setSugarType(e.target.value as any)}
                    className="w-full text-[10px] p-1 rounded border border-stone-200 bg-stone-50 mt-1"
                  >
                    <option value="Random">{isHindi ? 'रैंडम ग्लूकोज (Random)' : 'Random Glucose'}</option>
                    <option value="Fasting">{isHindi ? 'उपवास (Fasting)' : 'Fasting'}</option>
                    <option value="Post-Prandial">{isHindi ? 'भोजन पश्चात (Post-Prandial)' : 'Post-Prandial (After Meal)'}</option>
                  </select>
                </div>

                {/* Cholesterol */}
                <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1">
                  <label className="block font-semibold text-stone-700">Total Cholesterol (mg/dL)</label>
                  <input
                    type="number"
                    min="80"
                    max="450"
                    value={cholesterol}
                    onChange={(e) => setCholesterol(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                  <div className="text-[10px] text-stone-500">Normal: &lt;200 mg/dL</div>
                </div>

                {/* Creatinine */}
                <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1">
                  <label className="block font-semibold text-stone-700">Serum Creatinine (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="10.0"
                    value={creatinine}
                    onChange={(e) => setCreatinine(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                  <div className="text-[10px] text-stone-500">Normal: 0.6 - 1.2 mg/dL</div>
                </div>

                {/* Hemoglobin */}
                <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1">
                  <label className="block font-semibold text-stone-700">Hemoglobin (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="4"
                    max="22"
                    value={hemoglobin}
                    onChange={(e) => setHemoglobin(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <div className="text-[10px] text-stone-500">Normal: 12 - 16 g/dL</div>
                </div>

                {/* SpO2 */}
                <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1">
                  <label className="block font-semibold text-stone-700">Oxygen SpO2 (%)</label>
                  <input
                    type="number"
                    min="70"
                    max="100"
                    value={spO2}
                    onChange={(e) => setSpO2(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                  <div className="text-[10px] text-stone-500">Normal: 95% - 100%</div>
                </div>

                {/* Pulse & Weight */}
                <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1">
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="block font-semibold text-stone-700">Pulse (bpm)</label>
                      <input
                        type="number"
                        value={pulse}
                        onChange={(e) => setPulse(Number(e.target.value))}
                        className="w-full p-1.5 rounded-lg border border-stone-300 font-bold text-stone-900 text-xs mt-0.5"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block font-semibold text-stone-700">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full p-1.5 rounded-lg border border-stone-300 font-bold text-stone-900 text-xs mt-0.5"
                      />
                    </div>
                  </div>
                  <div className="text-[10px] text-stone-500">Vitals baseline</div>
                </div>
              </div>
            </div>

            {/* Notes / Symptoms */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                {isHindi ? 'टिप्पणी / लक्षण (Health Observations)' : 'Health Observations & Symptoms'}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Patient felt mild dizziness in morning, took regular medicine, no breathlessness..."
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save &amp; Update Current Health Status</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
