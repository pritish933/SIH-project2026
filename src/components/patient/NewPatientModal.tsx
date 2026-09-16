import { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserPlus,
  X,
  CreditCard,
  Building,
  CheckCircle2,
} from 'lucide-react';

export function NewPatientModal() {
  const {
    isNewPatientModalOpen,
    setIsNewPatientModalOpen,
    addPatient,
    t,
  } = useApp();

  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [phone, setPhone] = useState('+91 98');
  const [village, setVillage] = useState('Gram Rampur');
  const [district, setDistrict] = useState('Jabalpur');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [facility, setFacility] = useState('Ayushman Arogya Mandir (Sub-Centre) Rampur');
  const [highRisk, setHighRisk] = useState<'None' | 'High-Risk Pregnancy' | 'Severe Malnutrition' | 'Uncontrolled Diabetes/HTN'>('None');
  const [allergies, setAllergies] = useState('None');
  const [chronic, setChronic] = useState('None');
  const [sys, setSys] = useState(120);
  const [dia, setDia] = useState(80);

  if (!isNewPatientModalOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const abhaGenerated = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    addPatient({
      abhaId: abhaGenerated,
      name,
      age,
      gender,
      phone,
      village,
      district,
      bloodGroup,
      allergies: allergies === 'None' ? [] : [allergies],
      chronicConditions: chronic === 'None' ? [] : [chronic],
      highRiskCategory: highRisk as any,
      triageStatus: highRisk !== 'None' ? 'Amber' : 'Green',
      lastVisitDate: new Date().toISOString().split('T')[0],
      registeredFacility: facility,
      assignedAshaWorker: 'Meena Devi (ASHA)',
      vitalsHistory: [
        {
          date: new Date().toISOString().split('T')[0],
          bloodPressureSys: sys,
          bloodPressureDia: dia,
          pulseRate: 78,
          spO2: 98,
          temperatureF: 98.4,
          notes: 'Initial registration vitals at doorstep screening.',
        },
      ],
      prescriptions: [],
      referrals: [],
    });

    setIsNewPatientModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900">Enroll Rural Citizen &amp; Issue ABHA</h2>
              <p className="text-xs text-stone-600">Register into ABDM longitudinal public health registry</p>
            </div>
          </div>
          <button
            onClick={() => setIsNewPatientModalOpen(false)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kaushalya Bai"
              className="w-full px-3 py-2 rounded-xl border border-stone-300"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
              >
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
                <option value="B-">B-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Village</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Mobile No.</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">High-Risk Vulnerable Cohort Flag</label>
            <select
              value={highRisk}
              onChange={(e) => setHighRisk(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold"
            >
              <option value="None">None (Routine Citizen)</option>
              <option value="High-Risk Pregnancy">High-Risk Pregnancy (Severe Anemia / Gestational HTN)</option>
              <option value="Severe Malnutrition">Severe Malnutrition (Child SAM/MAM)</option>
              <option value="Uncontrolled Diabetes/HTN">Uncontrolled NCD (Diabetes / Hypertension)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Initial Systolic BP</label>
              <input
                type="number"
                value={sys}
                onChange={(e) => setSys(parseInt(e.target.value) || 120)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Initial Diastolic BP</label>
              <input
                type="number"
                value={dia}
                onChange={(e) => setDia(parseInt(e.target.value) || 80)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Enroll Citizen &amp; Generate ABHA Record</span>
          </button>
        </form>
      </div>
    </div>
  );
}
