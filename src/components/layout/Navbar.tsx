import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, LanguageCode, ConnectivityStatus } from '../../types';
import {
  HeartPulse,
  Activity,
  Wifi,
  WifiOff,
  Radio,
  AlertTriangle,
  Globe,
  UserCheck,
  LogOut,
  Pill,
  RefreshCw,
  PhoneCall,
  Sparkles,
  CalendarPlus,
  Building2,
  Award,
} from 'lucide-react';
import { DialectSymptomTranslatorModal } from '../translation/DialectSymptomTranslatorModal';

export function Navbar() {
  const {
    currentUser,
    activeRole,
    language,
    connectivity,
    offlineQueueCount,
    switchRole,
    setLanguage,
    setConnectivity,
    setIsLoginModalOpen,
    setIsMedicineModalOpen,
    setIsTriageModalOpen,
    setIsAmbulanceModalOpen,
    triggerEmergencySOS,
    syncOfflineQueue,
    t,
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isConnMenuOpen, setIsConnMenuOpen] = useState(false);
  const [isDialectModalOpen, setIsDialectModalOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; bg: string; text: string }> = {
    doctor: { label: 'Doctor / Specialist', bg: 'bg-teal-50', text: 'text-teal-800' },
    patient: { label: 'Patient (ABHA)', bg: 'bg-blue-50', text: 'text-blue-800' },
    admin: { label: 'Health Admin / CMO', bg: 'bg-purple-50', text: 'text-purple-800' },
    asha_worker: { label: 'ASHA / Frontline', bg: 'bg-amber-50', text: 'text-amber-800' },
  };

  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
      {/* Offline Sync Banner if in offline mode */}
      {connectivity === 'offline' && (
        <div className="bg-amber-500 text-stone-900 px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>
              Offline Mode Active. All triage, vitals & e-prescriptions are queued locally ({offlineQueueCount} pending items).
            </span>
          </div>
          <button
            onClick={() => {
              setConnectivity('online_high');
              syncOfflineQueue();
            }}
            className="underline hover:text-stone-950 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reconnect & Sync
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & National Health Mission Alignment */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-stone-900 font-sans">
                  Swasthya<span className="text-emerald-700">Setu</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ABDM Compliant
                </span>
              </div>
              <p className="text-[11px] text-stone-700 hidden md:block">
                Rural Telehealth & Longitudinal Care Network
              </p>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Emergency SOS 108 */}
            <button
              onClick={() => setIsAmbulanceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer animate-pulse"
              title="Book & Live Track 108 Emergency Ambulance"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">108 Ambulance</span>
            </button>

            {/* Quick Doctor Appointment shortcut for Patient */}
            {activeRole === 'patient' && (
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('navigate-patient-section', { detail: 'appointments' })
                  );
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors cursor-pointer"
                title="Book Online / Offline Doctor Appointment"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-teal-700" />
                <span>Doctor OPD</span>
              </button>
            )}

            {/* Quick Hospitals Near Me shortcut for Patient */}
            {activeRole === 'patient' && (
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('navigate-patient-section', { detail: 'hospitals' })
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                title={language === 'hi' ? 'नजदीकी अस्पताल खोजें (बेड उपलब्धता)' : 'Search Hospitals Near Me (Live Beds)'}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{language === 'hi' ? 'अस्पताल खोजें' : 'Hospitals Near Me'}</span>
              </button>
            )}

            {/* Quick Govt Schemes shortcut for Patient */}
            {activeRole === 'patient' && (
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('navigate-patient-section', { detail: 'schemes' })
                  );
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors cursor-pointer"
                title={language === 'hi' ? 'सरकारी स्वास्थ्य योजनाएँ (PM-JAY, स्वास्थ्य साथी)' : 'Govt Health Schemes (PM-JAY, Swasthya Sathi)'}
              >
                <Award className="w-3.5 h-3.5 text-amber-700" />
                <span>{language === 'hi' ? 'सरकारी योजनाएँ' : 'Govt Schemes'}</span>
              </button>
            )}

            {/* Quick Digital Triage trigger */}
            <button
              onClick={() => setIsTriageModalOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Digital Triage</span>
            </button>

            {/* Medicine Stock quick viewer */}
            <button
              onClick={() => setIsMedicineModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5 text-blue-600" />
              <span>Drug Stock</span>
            </button>

            {/* Connectivity Mode Simulator (Crucial for SIH Low-Connectivity demonstration) */}
            <div className="relative">
              <button
                onClick={() => setIsConnMenuOpen(!isConnMenuOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                  connectivity === 'online_high'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : connectivity === 'online_low'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
                title="Connectivity Mode for Rural Testing"
              >
                {connectivity === 'online_high' && <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
                {connectivity === 'online_low' && <Radio className="w-3.5 h-3.5 text-amber-600" />}
                {connectivity === 'offline' && <WifiOff className="w-3.5 h-3.5 text-rose-600" />}
                <span className="hidden sm:inline">
                  {connectivity === 'online_high' ? '4G Full' : connectivity === 'online_low' ? '2G Audio-Only' : 'Offline'}
                </span>
              </button>

              {isConnMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    Network Simulation (Rural)
                  </div>
                  <button
                    onClick={() => {
                      setConnectivity('online_high');
                      setIsConnMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Wifi className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold text-stone-800">4G / High Speed</div>
                      <div className="text-[10px] text-stone-600">Full HD video teleconsultation</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setConnectivity('online_low');
                      setIsConnMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-semibold text-stone-800">2G Low Bandwidth</div>
                      <div className="text-[10px] text-stone-600">Audio-first with real-time vitals stream</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setConnectivity('offline');
                      setIsConnMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                  >
                    <WifiOff className="w-4 h-4 text-rose-600" />
                    <div>
                      <div className="font-semibold text-stone-800">Offline Village Mode</div>
                      <div className="text-[10px] text-stone-600">Local storage & sync queue</div>
                    </div>
                  </button>
                </div>
              )}
            </div>


            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-stone-500" />
                <span>{languages.find((l) => l.code === language)?.native || 'English'}</span>
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 text-xs">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-stone-50 cursor-pointer ${
                        language === l.code ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-stone-700'
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[10px] text-stone-600">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active Role Switcher / Demo Role Selector */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${roleLabels[activeRole].bg} ${roleLabels[activeRole].text} border-stone-200 shadow-2xs`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="max-w-[110px] sm:max-w-none truncate">{roleLabels[activeRole].label}</span>
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50">
                  <div className="px-3 py-2 border-b border-stone-100 mb-1">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Switch Portal Role</p>
                    <p className="text-xs text-stone-600">Simulate different health actors:</p>
                  </div>

                  <button
                    onClick={() => {
                      switchRole('doctor');
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-stone-50 cursor-pointer ${
                      activeRole === 'doctor' ? 'bg-teal-50 font-bold text-teal-800' : 'text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Doctor / Specialist</div>
                      <div className="text-[10px] text-stone-600">Teleconsult queue, EHR & Rx pad</div>
                    </div>
                    {activeRole === 'doctor' && <span className="w-2 h-2 rounded-full bg-teal-600" />}
                  </button>

                  <button
                    onClick={() => {
                      switchRole('patient');
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-stone-50 cursor-pointer ${
                      activeRole === 'patient' ? 'bg-blue-50 font-bold text-blue-800' : 'text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Patient (Citizen)</div>
                      <div className="text-[10px] text-stone-600">ABHA Health Card, prescriptions</div>
                    </div>
                    {activeRole === 'patient' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  </button>

                  <button
                    onClick={() => {
                      switchRole('admin');
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-stone-50 cursor-pointer ${
                      activeRole === 'admin' ? 'bg-purple-50 font-bold text-purple-800' : 'text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Health Admin / CMO</div>
                      <div className="text-[10px] text-stone-600">Analytics, facility & drug monitoring</div>
                    </div>
                    {activeRole === 'admin' && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                  </button>

                  <button
                    onClick={() => {
                      switchRole('asha_worker');
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-stone-50 cursor-pointer ${
                      activeRole === 'asha_worker' ? 'bg-amber-50 font-bold text-amber-800' : 'text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">ASHA Frontline Worker</div>
                      <div className="text-[10px] text-stone-600">Doorstep triage, assisted consult</div>
                    </div>
                    {activeRole === 'asha_worker' && <span className="w-2 h-2 rounded-full bg-amber-600" />}
                  </button>

                  <div className="border-t border-stone-100 mt-2 pt-1">
                    <button
                      onClick={() => {
                        setIsRoleMenuOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-stone-600 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch Account / Sign In</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rural Dialect Symptom Translator Modal */}
      <DialectSymptomTranslatorModal
        isOpen={isDialectModalOpen}
        onClose={() => setIsDialectModalOpen(false)}
      />
    </header>
  );
}
