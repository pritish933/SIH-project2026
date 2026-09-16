import { useState, MouseEvent } from 'react';
import {
  MapPin,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Navigation,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ShieldCheck,
  PhoneCall,
  Package,
  Info,
} from 'lucide-react';
import { getMedicineAvailability, FacilityStockLocation } from '../../utils/medicineLocator';
import { useApp } from '../../context/AppContext';

interface MedicineAvailabilityCardProps {
  medicineName: string;
  dosage: string;
  facility?: string;
  assignedAsha?: string;
  compact?: boolean;
}

export function MedicineAvailabilityCard({
  medicineName,
  dosage,
  facility,
  assignedAsha = 'Meena Devi (ASHA Sangini)',
  compact = false,
}: MedicineAvailabilityCardProps) {
  const { medicineStock, language } = useApp();
  const isHindi = language === 'hi';
  const [isExpanded, setIsExpanded] = useState(false);
  const [ashaRequested, setAshaRequested] = useState(false);

  const availability = getMedicineAvailability(medicineName, facility, medicineStock);

  const handleRequestAshaPickup = (e: MouseEvent) => {
    e.stopPropagation();
    setAshaRequested(true);
    setTimeout(() => setAshaRequested(false), 5000);
  };

  const getStatusBadge = () => {
    if (availability.summaryStatus === 'Available at Sub-Centre') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>In Stock at Village Sub-Centre ({availability.primaryLocation.stockCount} {availability.primaryLocation.unit})</span>
        </span>
      );
    }
    if (availability.summaryStatus === 'Available at PHC') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>Available at PHC Central Dispensary (4.5 km)</span>
        </span>
      );
    }
    if (availability.summaryStatus === 'Low Stock Nearby') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <AlertTriangle className="w-3 h-3 text-amber-700" />
          <span>Limited Stock ({availability.primaryLocation.stockCount} left) &bull; PHC Stocked</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
        <AlertTriangle className="w-3 h-3 text-rose-700" />
        <span>Sub-Centre Out of Stock &bull; Available at Jan Aushadhi / PHC</span>
      </span>
    );
  };

  return (
    <div className="mt-2 pt-2 border-t border-stone-200/80">
      {/* Top Bar: Availability Status & Quick Expand */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            <span>{isHindi ? 'दवा कहाँ से मिलेगी (Pickup Points):' : 'Pickup Points & Stock:'}</span>
          </span>
          {getStatusBadge()}
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
        >
          <span>{isExpanded ? 'Hide Pickup Centers' : 'View All 3 Centers & Timings'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ASHA Notification alert */}
      {ashaRequested && (
        <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Doorstep medicine request sent to <strong>{assignedAsha}</strong>! She will collect your dosage during her village round.
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            ASHA Alerted
          </span>
        </div>
      )}

      {/* Expandable Breakdown of Facilities */}
      {isExpanded && (
        <div className="mt-3 space-y-2.5 bg-stone-50/80 p-3 rounded-xl border border-stone-200 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="text-[11px] text-stone-600 flex items-center justify-between pb-1 border-b border-stone-200">
            <span>Verified Public Health Dispensing Counters:</span>
            <span className="font-semibold text-stone-800">Drug: {medicineName}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {availability.allLocations.slice(0, 3).map((loc, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-2 ${
                  loc.status === 'In Stock'
                    ? 'bg-white border-emerald-200 shadow-2xs'
                    : loc.status === 'Low Stock'
                    ? 'bg-white border-amber-200'
                    : 'bg-stone-100 border-stone-300 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                      {isHindi && loc.tierLabelHi ? `${loc.tierLabelHi} (${loc.tierLabel})` : loc.tierLabel}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        loc.status === 'In Stock'
                          ? 'bg-emerald-100 text-emerald-800'
                          : loc.status === 'Low Stock'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {loc.status} ({loc.stockCount} {loc.unit})
                    </span>
                  </div>

                  <div className="font-bold text-stone-900 mt-1 leading-snug">
                    {loc.facilityName}
                  </div>

                  <div className="text-[11px] text-stone-600 mt-1 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-teal-700" />
                    <span>Distance: <strong className="text-stone-900">{loc.distanceKm} km</strong></span>
                  </div>

                  <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                    {loc.costText}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-500 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{loc.timings}</span>
                  </div>
                  <div>Contact: {loc.contactPerson}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Practical Assistance Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="text-stone-600 flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Free government medicines dispensed with ABHA card scan. No paper prescription needed.</span>
            </div>

            {availability.ashaDoorstepEligible && !ashaRequested && (
              <button
                type="button"
                onClick={handleRequestAshaPickup}
                className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Request ASHA Doorstep Delivery</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
