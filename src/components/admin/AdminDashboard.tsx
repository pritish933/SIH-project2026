import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  TrendingUp,
  Users,
  Pill,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  Heart,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Send,
  Download,
  Zap,
  Building2,
} from 'lucide-react';
import { FACILITY_TIERS } from '../../data/mockData';

export function AdminDashboard() {
  const {
    currentUser,
    patients,
    medicineStock,
    telehealthQueue,
    setIsMedicineModalOpen,
    requestMedicineRestock,
    setIsHospitalReceptionViewOpen,
    setIsCoordinationModalOpen,
    activeCoordinationSession,
    t,
  } = useApp();

  const [selectedFacilityTier, setSelectedFacilityTier] = useState<string>('All');
  const [stockReorderNotice, setStockReorderNotice] = useState<string | null>(null);

  const lowStockItems = medicineStock.filter(
    (m) => m.status === 'Low Stock' || m.status === 'Critical Stockout'
  );

  const highRiskTotal = patients.filter((p) => p.triageStatus === 'Red').length;
  const maternalHighRisk = patients.filter((p) => p.highRiskCategory === 'High-Risk Pregnancy').length;
  const childMalnutrition = patients.filter((p) => p.highRiskCategory === 'Severe Malnutrition').length;

  const handleApproveEmergencyIndent = (medId: string, medName: string) => {
    requestMedicineRestock(medId, 'phc');
    setStockReorderNotice(`Emergency dispatch of 250 units of ${medName} approved from District Medical Store Depot.`);
    setTimeout(() => setStockReorderNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Admin Title & Command Center Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-800 shrink-0">
            <Building className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900">{currentUser.name}</h1>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-100 text-purple-800">
                CMHO Command Center
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              {currentUser.facility} &bull; District Public Health Monitoring &amp; Telehealth Command
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsHospitalReceptionViewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Hospital Emergency Casualty Reception & Bed Reservation Desk"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Casualty Reception Desk</span>
          </button>

          <button
            onClick={() => setIsCoordinationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Emergency Healthcare Coordination Hub"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>{activeCoordinationSession ? '108 War Room (Active)' : '108 Coordination'}</span>
          </button>

          <button
            onClick={() => setIsMedicineModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>District Drug Registry</span>
          </button>
        </div>
      </div>

      {stockReorderNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{stockReorderNotice}</span>
          </div>
          <button onClick={() => setStockReorderNotice(null)} className="text-emerald-700 font-bold">Dismiss</button>
        </div>
      )}

      {/* Key Public Health Outcomes Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Teleconsults Month-to-Date</span>
            <TrendingUp className="w-4 h-4 text-purple-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">1,482</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +28% vs. prior quarter
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Travel Distance Saved</span>
            <Heart className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">64,200 km</div>
          <p className="text-[11px] text-stone-600 mt-0.5">Avg 42 km saved per patient</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Referral Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-blue-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">84.6%</div>
          <p className="text-[11px] text-blue-700 mt-0.5">Baseline before platform: 32%</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Avg Wait to Consultation</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">18 Mins</div>
          <p className="text-[11px] text-emerald-700 mt-0.5">Down from 4.5 hours bus commute</p>
        </div>
      </div>

      {/* Main Admin Content: Facility Hierarchy + Drug Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rural Health Facility Network Hierarchy (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-700" />
                  <span>Public Health Facility Tiers &amp; Spoke Connectivity</span>
                </h3>
                <p className="text-xs text-stone-600">
                  Strengthening existing IPHS infrastructure (Sub-Centres &rarr; PHC &rarr; CHC &rarr; DH)
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                100% Spokes Connected
              </span>
            </div>

            <div className="space-y-3">
              {FACILITY_TIERS.map((tier, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{tier.tier}</span>
                    </div>
                    <span className="text-xs font-semibold text-purple-700">{tier.reach}</span>
                  </div>

                  <div className="mt-2 text-xs text-stone-600">
                    <span className="font-semibold text-stone-800">Staffing: </span> {tier.staff}
                  </div>
                  <div className="mt-1 text-xs text-stone-500">
                    <span className="font-semibold text-stone-800">Role in Network: </span> {tier.role}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-Risk Population Registry */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-600" />
                  <span>High-Risk Maternal &amp; Child Health Registry</span>
                </h3>
                <p className="text-xs text-stone-600">Active monitoring of high-risk cases flagged by frontline workers</p>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">
                {highRiskTotal} Critical Cases
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
                <div className="text-xs font-bold text-rose-900 flex items-center justify-between">
                  <span>High-Risk Pregnancies (ANC)</span>
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold">
                    {maternalHighRisk} Active
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1">
                  Cases with severe anemia (Hb &lt; 8.0 g/dL) or gestational hypertension. Automated 108 ambulance pre-alert enabled.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
                <div className="text-xs font-bold text-amber-900 flex items-center justify-between">
                  <span>Child Malnutrition (SAM/MAM)</span>
                  <span className="px-2 py-0.5 bg-amber-600 text-white rounded text-[10px] font-bold">
                    {childMalnutrition} Active
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1">
                  Mid-Upper Arm Circumference &lt; 11.5cm or bilateral pedal edema. Tracked for direct NRC bed reservation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Essential Medicines Availability & Stockout Watch (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <Pill className="w-5 h-5 text-amber-600" />
                  <span>Essential Drug Availability Alerts</span>
                </h3>
                <p className="text-xs text-stone-600">Stock status across primary &amp; community facilities</p>
              </div>
              <button
                onClick={() => setIsMedicineModalOpen(true)}
                className="text-xs font-semibold text-purple-700 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.map((med) => (
                  <div
                    key={med.id}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-stone-900">{med.name}</div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          med.status === 'Critical Stockout'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {med.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[10px] text-stone-600 pt-1">
                      <div>
                        Sub-Centres: <span className="font-bold text-stone-900">{med.subCentreStock}</span>
                      </div>
                      <div>
                        PHCs: <span className="font-bold text-stone-900">{med.phcStock}</span>
                      </div>
                      <div>
                        District Depot: <span className="font-bold text-emerald-700">{med.districtHospitalStock}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                      <span className="text-[10px] text-stone-500">Reorder Threshold: {med.reorderLevel}</span>
                      <button
                        onClick={() => handleApproveEmergencyIndent(med.id, med.name)}
                        className="px-2.5 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        Approve Re-Indent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-stone-500">
                All essential drugs currently above buffer stock levels.
              </div>
            )}
          </div>

          {/* Referral Pipeline Summary */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
            <h3 className="font-bold text-stone-900 text-base mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Referral Continuum Pipeline</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">Sub-Centre to PHC Consults</span>
                <span className="font-bold text-stone-900">412 completed</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '85%' }} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">PHC to CHC / FRU Specialist Referrals</span>
                <span className="font-bold text-stone-900">188 completed</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '74%' }} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">District Hospital Emergency Admissions</span>
                <span className="font-bold text-stone-900">34 pre-alerted</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
