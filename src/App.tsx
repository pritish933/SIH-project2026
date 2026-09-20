import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AshaWorkerPortal } from './components/asha/AshaWorkerPortal';
import { TelehealthRoom } from './components/telehealth/TelehealthRoom';
import { DigitalTriageModal } from './components/triage/DigitalTriageModal';
import { EhrDetailModal } from './components/records/EhrDetailModal';
import { MedicineStockModal } from './components/inventory/MedicineStockModal';
import { NewReferralModal } from './components/referral/NewReferralModal';
import { NewPatientModal } from './components/patient/NewPatientModal';
import { LoginModal } from './components/auth/LoginModal';
import { EmergencyAlertBanner } from './components/common/EmergencyAlertBanner';
import { AmbulanceBookingModal } from './components/ambulance/AmbulanceBookingModal';
import { ConsultationFeedbackModal } from './components/feedback/ConsultationFeedbackModal';
import { EmergencyCoordinationModal } from './components/emergency/EmergencyCoordinationModal';
import { HospitalReceptionEmergencyDesk } from './components/emergency/HospitalReceptionEmergencyDesk';
import {
  HeartPulse,
  ShieldCheck,
  Building,
  Users,
  Wifi,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

function MainAppContent() {
  const {
    activeRole,
    switchRole,
    isLoginModalOpen,
    setIsLoginModalOpen,
    activeTelehealthSession,
    t,
  } = useApp();

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col selection:bg-emerald-200">
      {/* Navigation Header */}
      <Navbar />

      {/* Emergency Alert Toast */}
      <EmergencyAlertBanner />

      {/* Primary Role Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeRole === 'doctor' && <DoctorDashboard />}
        {activeRole === 'patient' && <PatientDashboard />}
        {activeRole === 'admin' && <AdminDashboard />}
        {activeRole === 'asha_worker' && <AshaWorkerPortal />}
      </main>

      {/* Footer / National Health Mission Architecture Badge */}
      <footer className="mt-auto bg-white border-t border-stone-200 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white text-[11px] font-bold">
              IC
            </div>
            <div>
              <span className="font-bold text-stone-800">InstaCure Rural Telehealth Network</span>
              <span className="ml-2 text-[11px] text-stone-500">
                &bull; Built for Smart India Hackathon (SIH) Rural Healthcare Challenge
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold border border-stone-200">
              IPHS Tier Architecture (Sub-Centre &rarr; PHC &rarr; CHC &rarr; DH)
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              Low-Bandwidth 2G Adaptive
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-semibold border border-purple-200">
              ABDM Longitudinal EHR
            </span>
          </div>
        </div>
      </footer>

      {/* Global Interactive Modals */}
      <TelehealthRoom />
      <DigitalTriageModal />
      <EhrDetailModal />
      <MedicineStockModal />
      <NewReferralModal />
      <NewPatientModal />
      <AmbulanceBookingModal />
      <ConsultationFeedbackModal />
      <EmergencyCoordinationModal />
      <HospitalReceptionEmergencyDesk />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        canDismiss={true}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
