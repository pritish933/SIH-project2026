import React, { useState } from 'react';
import {
  Building2,
  Bed,
  Stethoscope,
  Ambulance,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  Activity,
  HeartPulse,
  Radio,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HospitalFacility } from '../../data/hospitalData';
import { UpdateHospitalAvailabilityModal } from './UpdateHospitalAvailabilityModal';

export function HospitalAvailabilityManagerCard() {
  const {
    hospitals,
    updateHospitalAvailability,
    setIsHospitalReceptionViewOpen,
  } = useApp();

  // Fixed to this hospital admin's institution (Dr. B. C. Roy Hospital & Medical Research / IIMSAR)
  const currentHospital: HospitalFacility =
    hospitals.find((h) => h.id === 'HOSP-HIT-01') || hospitals[0];

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const lastUpdatedText =
    currentHospital.lastUpdatedMinutesAgo === undefined ||
    currentHospital.lastUpdatedMinutesAgo === 0
      ? 'Just now'
      : `${currentHospital.lastUpdatedMinutesAgo} min ago`;

  const isDoctorAvailable =
    (currentHospital.staff?.doctorsOnDutyCount || 0) > 0 &&
    (currentHospital.staff?.isDoctorAvailable ?? true);

  const totalAvailableBeds =
    currentHospital.availableBeds.icu +
    currentHospital.availableBeds.oxygen +
    currentHospital.availableBeds.general +
    (currentHospital.availableBeds.emergency || 4);

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
      {/* Hospital Admin Header - Strictly for this one hospital */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0 border border-teal-600/30">
            <Building2 className="w-7 h-7 text-emerald-200" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Hospital Admin Dashboard
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                ABDM Facility ID: {currentHospital.hfrFacilityId || 'IN-WB-HFR-70192'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {currentHospital.name}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {currentHospital.tierLabel} &bull; {currentHospital.address}
            </p>
          </div>
        </div>

        {/* Quick Command Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => setIsHospitalReceptionViewOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Hospital Emergency Casualty Reception & Bed Reservation Desk"
          >
            <Building2 className="w-4 h-4 text-emerald-300" />
            <span>Casualty Reception Desk</span>
          </button>
        </div>
      </div>

      {/* Hospital Status Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Doctor Live Status
            </div>
            <div className="font-extrabold text-sm text-stone-900 mt-0.5">
              {isDoctorAvailable ? 'Doctors On Duty' : 'No Doctors On Duty'}
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
              isDoctorAvailable
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}
          >
            {isDoctorAvailable ? '🟢 Available' : '🔴 Unavailable'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Available Inpatient Beds
            </div>
            <div className="font-extrabold text-sm text-stone-900 mt-0.5">
              <span className="text-emerald-700 text-base">{totalAvailableBeds}</span> / {currentHospital.totalBeds} Total
            </div>
          </div>
          <span className="p-2 rounded-xl bg-white text-stone-700 border border-stone-200 shadow-2xs">
            <Bed className="w-4 h-4 text-teal-700" />
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              24x7 Ambulance Bay
            </div>
            <div className="font-extrabold text-sm text-stone-900 mt-0.5">
              <span className="text-amber-700 text-base">{currentHospital.ambulancesCount || 2}</span> Ready at Station
            </div>
          </div>
          <span className="p-2 rounded-xl bg-white text-stone-700 border border-stone-200 shadow-2xs">
            <Ambulance className="w-4 h-4 text-amber-600" />
          </span>
        </div>
      </div>

      {/* Modern Card-Based Resources & Staff Panels (NO branch arrows!) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Resources (7 Cols) */}
        <div className="lg:col-span-7 bg-stone-50/70 rounded-3xl p-5 border border-stone-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800">
                  <Bed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-stone-900">Hospital Resources</h3>
                  <p className="text-[11px] text-stone-500">Live bed capacity &amp; ambulance status</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-stone-700 shadow-2xs">
                {totalAvailableBeds} Beds Free
              </span>
            </div>

            {/* Clean Resource Cards without tree branches/arrows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* ICU Beds */}
              <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-800">ICU Beds</div>
                    <div className="text-[10px] text-stone-500">Critical / Ventilator</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-base text-blue-700">
                    {currentHospital.availableBeds.icu}
                  </div>
                  <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    Available
                  </div>
                </div>
              </div>

              {/* Oxygen Beds */}
              <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-800">Oxygen Beds</div>
                    <div className="text-[10px] text-stone-500">Piped O2 Pipeline</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-base text-emerald-700">
                    {currentHospital.availableBeds.oxygen}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Available
                  </div>
                </div>
              </div>

              {/* General Beds */}
              <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between hover:border-purple-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
                    <Bed className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-800">General Beds</div>
                    <div className="text-[10px] text-stone-500">Inpatient Ward</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-base text-purple-700">
                    {currentHospital.availableBeds.general}
                  </div>
                  <div className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                    Available
                  </div>
                </div>
              </div>

              {/* Emergency Beds */}
              <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between hover:border-red-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-bold">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-800">Emergency Beds</div>
                    <div className="text-[10px] text-stone-500">Trauma Resuscitation</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-base text-rose-700">
                    {currentHospital.availableBeds.emergency || 4}
                  </div>
                  <div className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                    Available
                  </div>
                </div>
              </div>
            </div>

            {/* Ambulances Strip */}
            <div className="mt-2.5 p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between hover:border-amber-300 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
                  <Ambulance className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-stone-800">Ambulances Available</div>
                  <div className="text-[10px] text-stone-500">Emergency transport ready at casualty gate</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-black text-base text-amber-700">
                  {currentHospital.ambulancesCount || 2}
                </div>
                <div className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  At Bay
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
            <span>Verified Bed Capacity:</span>
            <span className="font-mono font-bold text-stone-800">
              {totalAvailableBeds} Available / {currentHospital.totalBeds} Capacity
            </span>
          </div>
        </div>

        {/* Right Column: Staff (5 Cols) */}
        <div className="lg:col-span-5 bg-stone-50/70 rounded-3xl p-5 border border-stone-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-stone-900">Medical Staff On Duty</h3>
                  <p className="text-[11px] text-stone-500">Active casualty team &amp; specialists</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-emerald-800 shadow-2xs">
                {currentHospital.staff?.doctorsOnDutyCount || 5} Active
              </span>
            </div>

            {/* Clean Staff Cards */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-800">Doctors On Duty</div>
                    <div className="text-[10px] text-stone-500">Emergency &amp; General RMOs</div>
                  </div>
                </div>
                <div className="font-mono font-black text-base text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  {currentHospital.staff?.doctorsOnDutyCount || 5}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-800">Emergency Team</div>
                    <div className="text-[10px] text-stone-500">Nursing, Stretcher &amp; OT Staff</div>
                  </div>
                </div>
                <div className="font-mono font-black text-base text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                  {currentHospital.staff?.emergencyTeamCount || 2}
                </div>
              </div>

              {/* Casualty Lead Card */}
              <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Casualty Duty Lead
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {currentHospital.onDutyDoctor?.status || 'On Duty'}
                  </span>
                </div>
                <div className="font-bold text-xs text-stone-900">
                  {currentHospital.staff?.activeDoctorName ||
                    currentHospital.onDutyDoctor?.name ||
                    'Dr. Debabrata Roy (MD, Emergency Medicine)'}
                </div>
                <div className="text-[11px] text-stone-500">
                  {currentHospital.staff?.activeDoctorSpecialty ||
                    currentHospital.onDutyDoctor?.specialty ||
                    'Casualty Medical Officer & Critical Care'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 text-xs text-emerald-800 font-bold flex items-center justify-between">
            <span>Trauma Casualty Ready:</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> 24x7 Immediate Response
            </span>
          </div>
        </div>
      </div>

      {/* Action Row & Live Sync Telemetry */}
      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Edit3 className="w-4 h-4" />
            <span>[ Update Availability ]</span>
          </button>

          <span className="text-xs text-stone-500 hidden md:inline">
            Update live bed counts, ambulances &amp; doctor duty shifts
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-stone-600">
            <strong>Last Updated:</strong>{' '}
            <span className="text-stone-900 font-bold bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
              {lastUpdatedText}
            </span>
          </span>
        </div>
      </div>

      {/* Modal Dialog */}
      <UpdateHospitalAvailabilityModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        hospital={currentHospital}
        onSave={updateHospitalAvailability}
      />
    </div>
  );
}
