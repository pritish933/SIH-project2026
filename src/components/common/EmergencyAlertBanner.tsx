import { useApp } from '../../context/AppContext';
import { PhoneCall, X, ShieldAlert, ArrowRight } from 'lucide-react';

export function EmergencyAlertBanner() {
  const { emergencyAlert, dismissEmergencySOS, setIsAmbulanceModalOpen } = useApp();

  if (!emergencyAlert || !emergencyAlert.active) return null;

  return (
    <div className="fixed top-18 right-4 z-50 max-w-md w-full">
      <div className="p-4 bg-red-600 text-white rounded-2xl shadow-2xl border-2 border-red-400 flex items-start justify-between gap-3 animate-in slide-in-from-top-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white text-red-600 shrink-0">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide">108 EMERGENCY ALERT DISPATCHED</span>
              {emergencyAlert.timestamp && (
                <span className="text-[10px] bg-red-700 px-1.5 py-0.5 rounded font-mono">
                  {emergencyAlert.timestamp}
                </span>
              )}
            </div>
            <p className="text-xs text-red-100 mt-1 leading-relaxed">{emergencyAlert.message}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAmbulanceModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white text-red-700 hover:bg-red-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <span>Live Track Ambulance (Map)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={dismissEmergencySOS}
          className="text-red-200 hover:text-white p-1 rounded-lg hover:bg-red-700 cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

