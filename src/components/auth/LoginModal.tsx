import { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Stethoscope,
  User,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  Lock,
  Phone,
  CreditCard,
  Building,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
}

export function LoginModal({ isOpen, onClose, canDismiss = true }: LoginModalProps) {
  const { loginAsRole, activeRole } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>(activeRole || 'doctor');
  
  // Simulated form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'doctor') setIdentifier('MCI-MP-49201');
    else if (role === 'patient') setIdentifier('91-4509-2810-9941');
    else if (role === 'admin') setIdentifier('ADMIN-CMHO-04');
    else if (role === 'asha_worker') setIdentifier('ASHA-MP-0982');
    setPassword('••••••••');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    loginAsRole(selectedRole);
    if (onClose) onClose();
  };

  const handleOneClickDemo = (role: UserRole) => {
    loginAsRole(role);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white relative">
          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-700/60 border border-emerald-500/40 text-[11px] font-semibold text-emerald-100 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Ayushman Bharat Digital Health Gateway</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">InstaCure Portal Login</h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Access secure longitudinal health records, real-time queues, and rural teleconsultation tools.
          </p>
        </div>

        {/* Role Tab Selector */}
        <div className="px-6 pt-5 pb-2 bg-stone-50/80 border-b border-stone-200">
          <label className="block text-xs font-semibold text-stone-600 mb-2.5 uppercase tracking-wider">
            Select Your Role to Continue
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleRoleSelect('doctor')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left ${
                selectedRole === 'doctor'
                  ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-xs'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100/60'
              }`}
            >
              <Stethoscope className={`w-5 h-5 mb-1.5 ${selectedRole === 'doctor' ? 'text-teal-700' : 'text-stone-400'}`} />
              <span className="text-xs font-bold leading-snug">Doctor</span>
              <span className="text-[10px] text-stone-700 hidden sm:inline">Tele-Specialist</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('patient')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left ${
                selectedRole === 'patient'
                  ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-xs'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100/60'
              }`}
            >
              <User className={`w-5 h-5 mb-1.5 ${selectedRole === 'patient' ? 'text-blue-700' : 'text-stone-400'}`} />
              <span className="text-xs font-bold leading-snug">Patient</span>
              <span className="text-[10px] text-stone-700 hidden sm:inline">ABHA Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left ${
                selectedRole === 'admin'
                  ? 'bg-purple-50 border-purple-600 text-purple-950 shadow-xs'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100/60'
              }`}
            >
              <Building className={`w-5 h-5 mb-1.5 ${selectedRole === 'admin' ? 'text-purple-700' : 'text-stone-400'}`} />
              <span className="text-xs font-bold leading-snug">Admin / CMO</span>
              <span className="text-[10px] text-stone-700 hidden sm:inline">Health Officer</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('asha_worker')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left ${
                selectedRole === 'asha_worker'
                  ? 'bg-amber-50 border-amber-600 text-amber-950 shadow-xs'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100/60'
              }`}
            >
              <HeartHandshake className={`w-5 h-5 mb-1.5 ${selectedRole === 'asha_worker' ? 'text-amber-700' : 'text-stone-400'}`} />
              <span className="text-xs font-bold leading-snug">ASHA / ANM</span>
              <span className="text-[10px] text-stone-700 hidden sm:inline">Frontline Worker</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="p-6 overflow-y-auto space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {selectedRole === 'doctor' && 'Medical Council Reg No. or Hospital Email'}
                {selectedRole === 'patient' && '14-digit ABHA Address / Mobile Number'}
                {selectedRole === 'admin' && 'District Health Admin Employee ID / Email'}
                {selectedRole === 'asha_worker' && 'ASHA Sangini / Sub-Centre ID'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier || (
                    selectedRole === 'doctor' ? 'dr.sneha.sharma@health.gov.in (MCI-MP-49201)' :
                    selectedRole === 'patient' ? '91-4509-2810-9941 (Rameshwar Prasad)' :
                    selectedRole === 'admin' ? 'cmo.rajeshverma@nhm.gov.in (ADM-0014)' :
                    'meena.asha@gramin.in (ASHA-MP-0982)'
                  )}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  {selectedRole === 'patient' ? <CreditCard className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  {selectedRole === 'patient' ? 'Aadhaar / Mobile OTP or PIN' : 'Password / Secure Token'}
                </label>
                <span className="text-[11px] text-emerald-700 hover:underline cursor-pointer">
                  {selectedRole === 'patient' ? 'Resend OTP' : 'Forgot Password?'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password || 'password123'}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember session on this device</span>
              </label>
              <span className="text-stone-400 text-[11px]">256-bit SSL Encrypted</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In as {selectedRole.toUpperCase().replace('_', ' ')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Evaluation / Demo Buttons */}
          <div className="pt-3 border-t border-stone-200">
            <div className="flex items-center gap-1.5 mb-2 text-stone-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Instant 1-Click Demo Portals (For Hackathon Review)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleOneClickDemo('doctor')}
                className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-teal-900 text-xs font-medium text-left cursor-pointer transition-colors"
              >
                <div className="font-bold flex items-center gap-1 text-teal-800">
                  <Stethoscope className="w-3.5 h-3.5" /> Dr. Sneha Sharma
                </div>
                <div className="text-[10px] text-teal-700">MD Teleconsultant (DH Jabalpur)</div>
              </button>

              <button
                type="button"
                onClick={() => handleOneClickDemo('patient')}
                className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-medium text-left cursor-pointer transition-colors"
              >
                <div className="font-bold flex items-center gap-1 text-blue-800">
                  <User className="w-3.5 h-3.5" /> Rameshwar Prasad
                </div>
                <div className="text-[10px] text-blue-700">Rural Patient (ABHA ID)</div>
              </button>

              <button
                type="button"
                onClick={() => handleOneClickDemo('admin')}
                className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-900 text-xs font-medium text-left cursor-pointer transition-colors"
              >
                <div className="font-bold flex items-center gap-1 text-purple-800">
                  <Building className="w-3.5 h-3.5" /> Dr. Rajesh Verma
                </div>
                <div className="text-[10px] text-purple-700">Chief Medical Officer (CMHO)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
