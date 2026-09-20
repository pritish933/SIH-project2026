import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Bed,
  CheckCircle2,
  Clock,
  Radio,
  PhoneCall,
  UserCheck,
  AlertTriangle,
  X,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Ambulance,
  QrCode,
  ArrowRight,
} from 'lucide-react';

export function HospitalReceptionEmergencyDesk() {
  const {
    isHospitalReceptionViewOpen,
    setIsHospitalReceptionViewOpen,
    activeCoordinationSession,
    acknowledgeBedReservation,
    updateEmergencyStakeholderStatus,
    language,
  } = useApp();

  const [deskNotes, setDeskNotes] = useState(
    'Trauma bay 1 ready with invasive ventilator, multi-para monitor, and crash cart.'
  );
  const [stretcherDispatched, setStretcherDispatched] = useState(true);

  if (!isHospitalReceptionViewOpen) return null;

  const handleConfirmReady = () => {
    if (activeCoordinationSession) {
      acknowledgeBedReservation(
        activeCoordinationSession.bedReservation.reservationToken,
        deskNotes
      );
    }
    setIsHospitalReceptionViewOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm tracking-tight text-white">
                  Hospital Emergency Casualty Reception Desk
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  Pre-Arrival Triage
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Dr. B. C. Roy Hospital (IIMSAR) &bull; Casualty Station 01 &bull; 24x7 Emergency Ramp
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsHospitalReceptionViewOpen(false)}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeCoordinationSession ? (
            <div className="space-y-4">
              {/* Incoming Emergency Alert Card */}
              <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-500/40 text-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-600 text-white shrink-0 mt-0.5">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-red-200 text-red-900 uppercase">
                        Incoming Code Red
                      </span>
                      <span className="text-xs font-mono font-bold text-red-700">
                        ETA: {activeCoordinationSession.ambulanceDispatch.etaMinutes} mins
                      </span>
                    </div>
                    <h4 className="font-extrabold text-base text-red-950 mt-1">
                      {activeCoordinationSession.categoryMeta.name}
                    </h4>
                    <p className="text-xs text-red-900 mt-0.5">
                      Patient: <strong className="text-red-950">{activeCoordinationSession.patientName}</strong>, Age: {activeCoordinationSession.patientAge} &bull; Village: {activeCoordinationSession.patientLocation.village}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <span className="text-[10px] text-red-700 block font-bold uppercase">Locked Bed:</span>
                  <span className="font-mono font-black text-base text-red-950 bg-white px-2.5 py-1 rounded-xl border border-red-200 shadow-xs inline-block">
                    {activeCoordinationSession.bedReservation.bedNumber}
                  </span>
                </div>
              </div>

              {/* Pre-Reservation Verification Strip */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold text-stone-700 pb-2 border-b border-stone-200">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Digital Pre-Arrival Admission Pass</span>
                  </span>
                  <span className="font-mono text-stone-500">Token: {activeCoordinationSession.bedReservation.reservationToken}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-stone-600">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Assigned Specialist:</span>
                    <strong className="text-stone-900">{activeCoordinationSession.selectedHospital.doctorName}</strong>
                    <div className="text-[11px] text-emerald-700">Status: On Duty in Casualty</div>
                  </div>

                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">108 Pilot &amp; Paramedic:</span>
                    <strong className="text-stone-900">{activeCoordinationSession.ambulanceDispatch.driverName}</strong>
                    <div className="text-[11px] text-stone-500">{activeCoordinationSession.ambulanceDispatch.vehicleNumber} ({activeCoordinationSession.ambulanceDispatch.ambulanceType})</div>
                  </div>

                  <div className="col-span-2">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Emergency Chief Complaint:</span>
                    <p className="text-stone-800 bg-white p-2.5 rounded-xl border border-stone-200 text-[11px]">
                      {activeCoordinationSession.chiefComplaint}
                    </p>
                  </div>
                </div>
              </div>

              {/* Casualty Desk Action Form */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Receptionist Action &amp; Bay Readiness Checklist:
                </label>

                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stretcherDispatched}
                      onChange={(e) => setStretcherDispatched(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-semibold text-stone-800">
                      Stretcher &amp; Oxygen Porter deployed to Emergency Entrance Ramp
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-semibold text-stone-800">
                      Emergency Bed ({activeCoordinationSession.bedReservation.bedNumber}) sterilized &amp; locked for incoming patient
                    </span>
                  </label>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Casualty Desk Notes (Visible to Doctor &amp; Ambulance Pilot):
                  </label>
                  <input
                    type="text"
                    value={deskNotes}
                    onChange={(e) => setDeskNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleConfirmReady}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Emergency Bed Ready &amp; Transmit to War Room</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Building2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-stone-800 text-sm">No Active Emergency Inflow at this moment</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                When a patient or ASHA worker triggers an emergency, the system will evaluate hospital suitability and automatically lock a bed here with live telemetry.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
