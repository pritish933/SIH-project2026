import { useRef } from 'react';
import { DoctorAppointment } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  Calendar,
  Clock,
  MapPin,
  User,
  CreditCard,
  Building,
  CheckCircle2,
  Video,
  Hospital,
  AlertCircle,
  Share2,
} from 'lucide-react';

interface OpdTokenSlipModalProps {
  appointment: DoctorAppointment | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinCall?: () => void;
}

export function OpdTokenSlipModal({
  appointment,
  isOpen,
  onClose,
  onJoinCall,
}: OpdTokenSlipModalProps) {
  const { language } = useApp();
  const isHindi = language === 'hi';
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !appointment) return null;

  const isOnline = appointment.mode === 'Online';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in duration-150">
        {/* Header Bar */}
        <div className="bg-stone-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isOnline ? 'bg-teal-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {isOnline ? <Video className="w-5 h-5" /> : <Hospital className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-stone-200">
                  {isOnline ? 'e-Sanjeevani Citizen OPD' : 'Ayushman Arogya Digital Token'}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Confirmed
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                {isOnline ? 'Online Teleconsultation Pass' : 'Hospital OPD In-Person Token Slip'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Pass Body */}
        <div ref={printRef} className="p-5 sm:p-6 space-y-5 text-stone-800">
          {/* Government / NHM Header watermark */}
          <div className="border-b border-dashed border-stone-300 pb-4 text-center space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">
              Ministry of Health &amp; Family Welfare &bull; Govt of India
            </div>
            <div className="text-xs font-bold text-stone-900">
              NATIONAL HEALTH MISSION &bull; AYUSHMAN BHARAT DIGITAL MISSION (ABDM)
            </div>
            <div className="text-[11px] text-stone-600 font-medium">
              {appointment.facility}
            </div>
          </div>

          {/* Token Highlight Banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${
              isOnline
                ? 'bg-teal-50 border-teal-200 text-teal-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                {isOnline ? 'Digital Queue Token ID' : 'Hospital Gate & OPD Token No.'}
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-stone-900">
                {appointment.tokenNumber}
              </div>
              <div className="text-xs text-stone-600 font-medium mt-0.5">
                Booked At: <span className="font-bold text-stone-800">{appointment.bookedAt}</span>
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  isOnline
                    ? 'bg-teal-700 text-white'
                    : 'bg-emerald-700 text-white'
                }`}
              >
                {isOnline ? '🌐 Online Video OPD' : '🏥 Offline In-Person OPD'}
              </span>
              <div className="text-[11px] font-bold text-emerald-700 mt-1">
                Consultation Fee: {appointment.fee}
              </div>
            </div>
          </div>

          {/* Key Appointment Logistics Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <div className="text-stone-500 flex items-center gap-1 font-semibold text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>{isHindi ? 'दिनांक' : 'Date'}</span>
              </div>
              <div className="font-bold text-stone-900 text-sm">{appointment.appointmentDate}</div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <div className="text-stone-500 flex items-center gap-1 font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{isHindi ? 'समय' : 'Time Slot'}</span>
              </div>
              <div className="font-bold text-stone-900 text-sm">{appointment.timeSlot}</div>
            </div>
          </div>

          {/* Doctor & Location Info */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-stone-500">Consulting Specialist</div>
                <div className="text-sm font-black text-stone-900">{appointment.doctorName}</div>
                <div className="text-xs text-stone-600 font-medium">{appointment.doctorSpecialty}</div>
                <div className="text-[11px] text-stone-500">{appointment.doctorQualification}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-stone-500">Chamber / Room</div>
                <span className="inline-block mt-0.5 px-2.5 py-1 rounded-lg bg-stone-200 font-bold text-stone-800 text-xs">
                  {appointment.opdRoomNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="border border-stone-200 rounded-2xl p-3.5 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <User className="w-4 h-4 text-emerald-600" />
                <span>{appointment.patientName}</span>
              </div>
              <div className="font-mono text-xs font-bold text-stone-600">
                {appointment.patientPhone}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-500">Ayushman ABHA ID:</span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {appointment.abhaId}
              </span>
            </div>

            <div className="text-[11px] text-stone-600 pt-1">
              <span className="font-semibold text-stone-800">Reason / Symptoms: </span>
              {appointment.complaint}
            </div>
          </div>

          {/* Reporting Guidelines */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px]">
              <div className="font-bold">Important Patient Instructions:</div>
              <div>{appointment.reportingInstructions}</div>
            </div>
          </div>

          {/* Security barcode visual */}
          <div className="text-center pt-1 border-t border-dashed border-stone-200">
            <div className="font-mono text-xs text-stone-400 tracking-widest uppercase">
              ||| | ||||| || |||||| | ||| |||| | ||||| ||||
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              Digital Verified Token &bull; Ayushman Bharat Health Records (ABDM) Compatible
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-stone-50 p-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500 text-center sm:text-left">
            Show this slip on mobile or bring printed copy.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>

            {isOnline && onJoinCall && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onJoinCall();
                }}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Video Call</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
