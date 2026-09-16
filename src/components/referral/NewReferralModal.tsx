import { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  Send,
  X,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react';

export function NewReferralModal() {
  const {
    isReferralModalOpen,
    setIsReferralModalOpen,
    patients,
    createReferral,
    triggerEmergencySOS,
    t,
  } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [fromFacility, setFromFacility] = useState('Sub-Centre Pipariya');
  const [toFacility, setToFacility] = useState('District Hospital Telemedicine Unit & Cardiology');
  const [specialtyRequired, setSpecialtyRequired] = useState('Cardiology & Diabetology');
  const [urgency, setUrgency] = useState<'Routine' | 'Urgent' | 'Emergency'>('Urgent');
  const [reason, setReason] = useState('Persistent stage 2 hypertension with pedal edema not responding to oral therapy.');
  const [transportArranged, setTransportArranged] = useState(true);

  if (!isReferralModalOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    createReferral({
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      abhaId: patient.abhaId,
      fromFacility,
      toFacility,
      specialtyRequired,
      reason,
      urgency,
      status: 'Initiated',
      dateInitiated: new Date().toISOString().split('T')[0],
      transportArranged,
      notes: transportArranged ? 'Janani Express 108 vehicle assigned' : 'Self-transport arranged',
    });

    if (urgency === 'Emergency') {
      triggerEmergencySOS(patient.name, fromFacility);
    }

    setIsReferralModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900">Initiate Inter-Facility Care Referral</h2>
              <p className="text-xs text-stone-600">Continuity of care from Sub-Centre / PHC to higher specialists</p>
            </div>
          </div>
          <button
            onClick={() => setIsReferralModalOpen(false)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Select Patient</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}y, {p.gender}) &bull; ABHA: {p.abhaId}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Referring Facility (Spoke)</label>
              <input
                type="text"
                value={fromFacility}
                onChange={(e) => setFromFacility(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Receiving Facility (Hub / FRU)</label>
              <input
                type="text"
                value={toFacility}
                onChange={(e) => setToFacility(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Specialty Required</label>
              <select
                value={specialtyRequired}
                onChange={(e) => setSpecialtyRequired(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
              >
                <option value="Cardiology & Diabetology">Cardiology &amp; Diabetology</option>
                <option value="Obstetrics & High-Risk Pregnancy">Obstetrics &amp; High-Risk Pregnancy</option>
                <option value="Pediatrics & NRC">Pediatrics &amp; NRC (Malnutrition)</option>
                <option value="General Surgery">General Surgery</option>
                <option value="Ophthalmology / Cataract">Ophthalmology / Cataract</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Clinical Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold"
              >
                <option value="Routine">Routine (Within 7 Days)</option>
                <option value="Urgent">Urgent (Within 24 Hours)</option>
                <option value="Emergency">Emergency (Immediate 108 Transit)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Clinical Reason &amp; Summary</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300"
              required
            />
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-stone-900 block">Emergency 108 / Janani Transport</span>
              <span className="text-[11px] text-stone-500">Auto-alert nearest Government ambulance</span>
            </div>
            <input
              type="checkbox"
              checked={transportArranged}
              onChange={(e) => setTransportArranged(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Issue Inter-Facility Referral &amp; Notify Receiving Hospital</span>
          </button>
        </form>
      </div>
    </div>
  );
}
