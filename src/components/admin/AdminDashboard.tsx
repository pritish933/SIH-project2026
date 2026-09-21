import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Pill,
  CheckCircle2,
} from 'lucide-react';
import { HospitalAvailabilityManagerCard } from './HospitalAvailabilityManagerCard';

export function AdminDashboard() {
  const {
    medicineStock,
    setIsMedicineModalOpen,
    requestMedicineRestock,
  } = useApp();

  const [stockReorderNotice, setStockReorderNotice] = useState<string | null>(null);

  const lowStockItems = medicineStock.filter(
    (m) => m.status === 'Low Stock' || m.status === 'Critical Stockout'
  );

  const handleApproveEmergencyIndent = (medId: string, medName: string) => {
    requestMedicineRestock(medId, 'phc');
    setStockReorderNotice(`Emergency dispatch of 250 units of ${medName} approved from District Medical Store Depot.`);
    setTimeout(() => setStockReorderNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {stockReorderNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{stockReorderNotice}</span>
          </div>
          <button onClick={() => setStockReorderNotice(null)} className="text-emerald-700 font-bold">Dismiss</button>
        </div>
      )}

      {/* Hospital Resource & Staff Live Availability Manager (Single Hospital Admin) */}
      <HospitalAvailabilityManagerCard />

      {/* Hospital Pharmacy & Emergency Admissions Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Essential Medicines Availability */}
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
    );
}
