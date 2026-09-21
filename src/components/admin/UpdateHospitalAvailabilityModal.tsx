import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Bed,
  Stethoscope,
  Ambulance,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Minus,
  Save,
} from 'lucide-react';
import { HospitalFacility } from '../../data/hospitalData';

interface UpdateHospitalAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: HospitalFacility;
  onSave: (
    hospitalId: string,
    updates: {
      availableBeds?: {
        general?: number;
        oxygen?: number;
        icu?: number;
        emergency?: number;
      };
      ambulancesCount?: number;
      staff?: {
        doctorsOnDutyCount?: number;
        emergencyTeamCount?: number;
        isDoctorAvailable?: boolean;
        activeDoctorName?: string;
        activeDoctorSpecialty?: string;
      };
      onDutyDoctorStatus?: 'On Duty' | 'On Call' | 'In Surgery';
    }
  ) => void;
}

export function UpdateHospitalAvailabilityModal({
  isOpen,
  onClose,
  hospital,
  onSave,
}: UpdateHospitalAvailabilityModalProps) {
  const [icuBeds, setIcuBeds] = useState<number>(hospital.availableBeds.icu);
  const [oxygenBeds, setOxygenBeds] = useState<number>(hospital.availableBeds.oxygen);
  const [generalBeds, setGeneralBeds] = useState<number>(hospital.availableBeds.general);
  const [emergencyBeds, setEmergencyBeds] = useState<number>(hospital.availableBeds.emergency || 4);
  const [ambulances, setAmbulances] = useState<number>(hospital.ambulancesCount || 2);
  const [doctorsOnDuty, setDoctorsOnDuty] = useState<number>(hospital.staff?.doctorsOnDutyCount || 5);
  const [emergencyTeam, setEmergencyTeam] = useState<number>(hospital.staff?.emergencyTeamCount || 2);
  const [isDoctorAvailable, setIsDoctorAvailable] = useState<boolean>(
    hospital.staff?.isDoctorAvailable ?? true
  );
  const [doctorStatus, setDoctorStatus] = useState<'On Duty' | 'On Call' | 'In Surgery'>(
    hospital.onDutyDoctor?.status || 'On Duty'
  );
  const [doctorName, setDoctorName] = useState<string>(
    hospital.staff?.activeDoctorName || hospital.onDutyDoctor?.name || 'Dr. Debabrata Roy (MD)'
  );
  const [doctorSpecialty, setDoctorSpecialty] = useState<string>(
    hospital.staff?.activeDoctorSpecialty || hospital.onDutyDoctor?.specialty || 'Casualty & Critical Care'
  );
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Sync state when hospital prop changes
  useEffect(() => {
    setIcuBeds(hospital.availableBeds.icu);
    setOxygenBeds(hospital.availableBeds.oxygen);
    setGeneralBeds(hospital.availableBeds.general);
    setEmergencyBeds(hospital.availableBeds.emergency || 4);
    setAmbulances(hospital.ambulancesCount || 2);
    setDoctorsOnDuty(hospital.staff?.doctorsOnDutyCount || 5);
    setEmergencyTeam(hospital.staff?.emergencyTeamCount || 2);
    setIsDoctorAvailable(hospital.staff?.isDoctorAvailable ?? true);
    setDoctorStatus(hospital.onDutyDoctor?.status || 'On Duty');
    setDoctorName(hospital.staff?.activeDoctorName || hospital.onDutyDoctor?.name || '');
    setDoctorSpecialty(hospital.staff?.activeDoctorSpecialty || hospital.onDutyDoctor?.specialty || '');
  }, [hospital]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(hospital.id, {
      availableBeds: {
        icu: Math.max(0, icuBeds),
        oxygen: Math.max(0, oxygenBeds),
        general: Math.max(0, generalBeds),
        emergency: Math.max(0, emergencyBeds),
      },
      ambulancesCount: Math.max(0, ambulances),
      staff: {
        doctorsOnDutyCount: Math.max(0, doctorsOnDuty),
        emergencyTeamCount: Math.max(0, emergencyTeam),
        isDoctorAvailable: doctorsOnDuty > 0 && isDoctorAvailable,
        activeDoctorName: doctorName.trim(),
        activeDoctorSpecialty: doctorSpecialty.trim(),
      },
      onDutyDoctorStatus: doctorStatus,
    });

    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 1200);
  };

  const StepperInput = ({
    label,
    value,
    setValue,
    color = 'emerald',
    suffix = '',
  }: {
    label: string;
    value: number;
    setValue: (val: number) => void;
    color?: 'emerald' | 'blue' | 'purple' | 'red' | 'amber';
    suffix?: string;
  }) => {
    const colorClasses = {
      emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      blue: 'text-blue-700 bg-blue-50 border-blue-200',
      purple: 'text-purple-700 bg-purple-50 border-purple-200',
      red: 'text-red-700 bg-red-50 border-red-200',
      amber: 'text-amber-700 bg-amber-50 border-amber-200',
    };

    return (
      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-stone-800">{label}</div>
          <div className="text-[11px] text-stone-500 font-mono">
            Current: <span className="font-bold text-stone-800">{value}</span> {suffix}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setValue(Math.max(0, value - 1))}
            className="w-8 h-8 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(Math.max(0, parseInt(e.target.value) || 0))}
            className={`w-14 text-center py-1 rounded-xl font-mono font-bold text-sm border shadow-inner ${colorClasses[color]}`}
          />
          <button
            type="button"
            onClick={() => setValue(value + 1)}
            className="w-8 h-8 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 via-stone-800 to-teal-950 text-white flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm tracking-tight text-white">
                  Update Hospital Live Availability
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Real-Time Sync
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5 truncate max-w-sm">
                {hospital.name} ({hospital.tier})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-stone-50/40">
          {/* Real-Time Sync Notice */}
          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-teal-900">Patient Dashboard Live Broadcast: </span>
              All resource and doctor changes saved here are pushed immediately to the citizen portal ("Hospitals Near Me") so patients and emergency dispatchers have live, verified hospital status.
            </div>
          </div>

          {/* Section 1: Resources (Beds & Ambulances) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Bed className="w-4 h-4 text-teal-700" />
                <span>Hospital Bed &amp; Transport Resources</span>
              </h4>
              <span className="text-[11px] font-mono text-stone-500">
                Total Capacity: {hospital.totalBeds} Beds
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StepperInput
                label="ICU Beds"
                value={icuBeds}
                setValue={setIcuBeds}
                color="blue"
                suffix="available"
              />
              <StepperInput
                label="Oxygen Beds"
                value={oxygenBeds}
                setValue={setOxygenBeds}
                color="emerald"
                suffix="available"
              />
              <StepperInput
                label="General Beds"
                value={generalBeds}
                setValue={setGeneralBeds}
                color="purple"
                suffix="available"
              />
              <StepperInput
                label="Emergency Beds"
                value={emergencyBeds}
                setValue={setEmergencyBeds}
                color="red"
                suffix="available"
              />
            </div>

            <div className="pt-1">
              <StepperInput
                label="Ambulances Available (Live at Bay)"
                value={ambulances}
                setValue={setAmbulances}
                color="amber"
                suffix="units"
              />
            </div>
          </div>

          {/* Section 2: Staff & Doctor Availability */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                <span>Staff &amp; Doctor Availability</span>
              </h4>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  doctorsOnDuty > 0 && isDoctorAvailable
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {doctorsOnDuty > 0 && isDoctorAvailable ? '🟢 Doctor Available' : '🔴 No Doctor Available'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StepperInput
                label="Doctors On Duty"
                value={doctorsOnDuty}
                setValue={(val) => {
                  setDoctorsOnDuty(val);
                  if (val === 0) setIsDoctorAvailable(false);
                  else setIsDoctorAvailable(true);
                }}
                color="emerald"
                suffix="active"
              />
              <StepperInput
                label="Emergency Team"
                value={emergencyTeam}
                setValue={setEmergencyTeam}
                color="purple"
                suffix="members"
              />
            </div>

            {/* Doctor Active Status Toggle */}
            <div className="p-3.5 bg-white rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">
                  Doctor Attending Casualty Status
                </span>
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                  {(['On Duty', 'On Call', 'In Surgery'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setDoctorStatus(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        doctorStatus === st
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    On-Duty Lead Doctor Name
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Debabrata Roy (MD)"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-hidden focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Specialty / Department
                  </label>
                  <input
                    type="text"
                    value={doctorSpecialty}
                    onChange={(e) => setDoctorSpecialty(e.target.value)}
                    placeholder="e.g. Casualty & Critical Care"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-hidden focus:border-teal-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {isSavedNotice ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Updated &amp; Published Live to Patient Portal!
              </span>
            ) : (
              <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Will mark "Updated: Just now"
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Availability</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
