import React, { useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  PhoneCall,
  Navigation,
  Activity,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  HeartPulse,
  Bed,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Ambulance,
  PhoneForwarded,
  X,
  Compass,
  AlertCircle,
  Stethoscope,
  Info,
  ExternalLink,
  Map,
  RotateCcw,
  Crosshair,
} from 'lucide-react';
import {
  NEARBY_HOSPITALS_DATA,
  CURRENT_REFERENCE_LOCATION,
  HospitalFacility,
  HospitalTier,
} from '../../data/hospitalData';
import { useApp } from '../../context/AppContext';

export function NearbyHospitalsSection() {
  const { language, setIsAmbulanceModalOpen, t } = useApp();
  const isHindi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [pmjayOnly, setPmjayOnly] = useState(false);
  const [icuOnly, setIcuOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'grid' | 'radar'>('map');
  const [selectedHospital, setSelectedHospital] = useState<HospitalFacility | null>(
    NEARBY_HOSPITALS_DATA[0] // Dr. B.C. Roy Hospital next to HIT
  );
  const [mapZoom, setMapZoom] = useState<number>(14);

  // Modals for Call & Directions
  const [callModalHospital, setCallModalHospital] = useState<HospitalFacility | null>(null);
  const [directionModalHospital, setDirectionModalHospital] = useState<HospitalFacility | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Filtered hospital facilities
  const filteredHospitals = useMemo(() => {
    return NEARBY_HOSPITALS_DATA.filter((hosp) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName =
          hosp.name.toLowerCase().includes(query) ||
          hosp.hindiName.toLowerCase().includes(query) ||
          hosp.bengaliName.toLowerCase().includes(query);
        const matchBlock =
          hosp.block.toLowerCase().includes(query) ||
          hosp.district.toLowerCase().includes(query) ||
          hosp.address.toLowerCase().includes(query);
        const matchSpec = hosp.specialities.some((s) => s.toLowerCase().includes(query));
        const matchDoctor = hosp.onDutyDoctor.name.toLowerCase().includes(query);
        if (!matchName && !matchBlock && !matchSpec && !matchDoctor) return false;
      }

      // Tier filter
      if (selectedTier !== 'ALL' && hosp.tier !== selectedTier) {
        return false;
      }

      // Distance
      if (hosp.distanceKm > maxDistance) {
        return false;
      }

      // Emergency 24x7
      if (emergencyOnly && !hosp.emergency24x7) {
        return false;
      }

      // PM-JAY / Swasthya Sathi
      if (pmjayOnly && !hosp.pmjayEmpaneled) {
        return false;
      }

      // ICU Available
      if (icuOnly && hosp.availableBeds.icu <= 0) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedTier, maxDistance, emergencyOnly, pmjayOnly, icuOnly]);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard?.writeText?.(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  // Google Maps Embed URL generator
  const getGoogleMapsEmbedUrl = () => {
    if (selectedHospital) {
      // Focus on selected hospital
      const query = encodeURIComponent(
        `${selectedHospital.name}, ${selectedHospital.address}`
      );
      return `https://maps.google.com/maps?q=${query}&t=&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`;
    }
    // Default: Center on Haldia Institute of Technology (HIT)
    const hitQuery = encodeURIComponent(
      'Haldia Institute of Technology, Hatiberia, Haldia, West Bengal 721657'
    );
    return `https://maps.google.com/maps?q=${hitQuery}&t=&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`;
  };

  // Google Maps Directions Deep Link
  const getGoogleMapsDirectionsUrl = (hosp: HospitalFacility) => {
    const origin = encodeURIComponent('Haldia Institute of Technology, Haldia, West Bengal 721657');
    const dest = encodeURIComponent(`${hosp.name}, ${hosp.address}`);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
  };

  const tierColors: Record<HospitalTier, { bg: string; text: string; border: string }> = {
    'Sub-Centre': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    'PHC': { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
    'CHC': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    'SDH': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    'District Hospital': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    'Apex Institute': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    'Empaneled Private': { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Breadcrumb & Location Context: Haldia Institute of Technology */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-stone-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-300" />
                Live Google Maps API Enabled
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-stone-200 border border-white/10 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-300" />
                Haldia Health Network &bull; Purba Medinipur
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                Swasthya Sathi &amp; Ayushman PM-JAY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Building2 className="w-7 h-7 text-emerald-300" />
              {t('hospitals_title')}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl">
              {isHindi
                ? 'हल्दिया इंस्टीट्यूट ऑफ टेक्नोलॉजी (HIT) परिसर के आसपास वास्तविक सरकारी व निजी अस्पताल, गूगल मैप्स लाइव लोकेशन और आपातकालीन 24x7 सेवा।'
                : 'Real hospital locations & live Google Map around Haldia Institute of Technology (HIT Campus), with bed availability, on-duty doctors, and direct transit directions.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 108 Emergency Shortcut */}
            <button
              onClick={() => setIsAmbulanceModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg transition-colors flex items-center gap-2 cursor-pointer animate-pulse"
            >
              <Ambulance className="w-4 h-4" />
              <span>{isHindi ? '108 आपातकालीन एम्बुलेंस' : '108 Emergency Ambulance'}</span>
            </button>
          </div>
        </div>

        {/* Current Reference Location: HIT Campus Haldia */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200/90">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>
              <strong>{isHindi ? 'वर्तमान स्थान:' : 'Current Location:'}</strong>{' '}
              <span className="text-white font-semibold">{CURRENT_REFERENCE_LOCATION.name}</span> &bull; {CURRENT_REFERENCE_LOCATION.address}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-emerald-300 font-mono bg-white/10 px-2 py-0.5 rounded-md">
              GPS: {CURRENT_REFERENCE_LOCATION.lat}° N, {CURRENT_REFERENCE_LOCATION.lng}° E
            </span>
            <button
              onClick={() => {
                setSelectedHospital(null);
                setMapZoom(15);
              }}
              className="text-[11px] text-emerald-200 hover:text-white underline font-semibold flex items-center gap-1 cursor-pointer"
              title="Reset view to HIT Campus"
            >
              <Crosshair className="w-3 h-3" /> Re-Center on HIT
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & View Toggle */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isHindi
                  ? 'हल्दिया में अस्पताल, विशेषज्ञता (ICU, Delivery, Dialysis, Eye) या क्षेत्र खोजें...'
                  : 'Search hospitals in Haldia, specialty (ICU, Trauma, Eye, Delivery, Dialysis) or area (Durgachak, Sutahata)...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle: Real Google Map vs Directory Cards vs Radar */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl border border-stone-200 self-start md:self-auto shrink-0">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-emerald-700 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>{isHindi ? 'गूगल मैप्स लाइव' : 'Google Maps Live'}</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-stone-900 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isHindi ? 'सूची दृश्य' : 'Directory Cards'}</span>
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'radar'
                  ? 'bg-stone-900 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isHindi ? 'राडार मैप' : 'Radar Map'}</span>
            </button>
          </div>
        </div>

        {/* Tier & Distance Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
          {/* Tier Selector Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
              {isHindi ? 'श्रेणी:' : 'Tier:'}
            </span>
            {[
              { id: 'ALL', label: t('hospitals_all_facilities') },
              { id: 'District Hospital', label: 'BC Roy Hospital (IIMSAR)' },
              { id: 'SDH', label: 'Govt SDH Haldia' },
              { id: 'PHC', label: 'UPHC Durgachak' },
              { id: 'CHC', label: 'Port Hospital / BPHC' },
              { id: 'Empaneled Private', label: 'Swasthya Sathi Private' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedTier(chip.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedTier === chip.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Distance Filter Chips from HIT Campus */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
              {isHindi ? 'दूरी (HIT से):' : 'Radius from HIT:'}
            </span>
            {[
              { val: 1, label: '< 1 km (Walking)' },
              { val: 5, label: '< 5 km' },
              { val: 10, label: '< 10 km' },
              { val: 50, label: isHindi ? 'सभी' : 'Any' },
            ].map((d) => (
              <button
                key={d.val}
                onClick={() => setMaxDistance(d.val)}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  maxDistance === d.val
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Checkbox Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <button
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`px-3 py-1 rounded-xl border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              emergencyOnly
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-red-600" />
            <span>24x7 Emergency / Casualty</span>
          </button>

          <button
            onClick={() => setPmjayOnly(!pmjayOnly)}
            className={`px-3 py-1 rounded-xl border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              pmjayOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Swasthya Sathi &amp; PM-JAY Cashless</span>
          </button>

          <button
            onClick={() => setIcuOnly(!icuOnly)}
            className={`px-3 py-1 rounded-xl border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              icuOnly
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Bed className="w-3.5 h-3.5 text-blue-600" />
            <span>ICU / Ventilator Available</span>
          </button>

          {(selectedTier !== 'ALL' || maxDistance !== 50 || emergencyOnly || pmjayOnly || icuOnly || searchQuery) && (
            <button
              onClick={() => {
                setSelectedTier('ALL');
                setMaxDistance(50);
                setEmergencyOnly(false);
                setPmjayOnly(false);
                setIcuOnly(false);
                setSearchQuery('');
              }}
              className="ml-auto text-xs text-stone-500 hover:text-stone-800 underline font-semibold cursor-pointer"
            >
              {t('reset_filters')}
            </button>
          )}
        </div>
      </div>

      {/* REAL GOOGLE MAPS LIVE VIEW (When viewMode === 'map') */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-stone-900 flex items-center gap-2">
                  <Map className="w-4 h-4 text-emerald-600" />
                  <span>{isHindi ? 'गूगल मैप्स लाइव इंटरएक्टिव मानचित्र' : 'Live Google Map View (Haldia & Surrounding Tiers)'}</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Real Location Coordinates
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {selectedHospital
                  ? `Showing location for: ${selectedHospital.name} (${selectedHospital.distanceKm} km from HIT Campus)`
                  : 'Centered on Haldia Institute of Technology (HIT Campus), Hatiberia, Haldia.'}
              </p>
            </div>

            {/* Google Maps Actions */}
            <div className="flex items-center gap-2">
              {selectedHospital && (
                <a
                  href={getGoogleMapsDirectionsUrl(selectedHospital)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Navigate in Google Maps</span>
                </a>
              )}

              <button
                onClick={() => {
                  setSelectedHospital(null);
                  setMapZoom(15);
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Center HIT</span>
              </button>
            </div>
          </div>

          {/* Quick Facility Selector Pills above Map */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-stone-500 shrink-0 uppercase tracking-wider">
              Haldia Pin:
            </span>
            <button
              onClick={() => {
                setSelectedHospital(null);
                setMapZoom(16);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                !selectedHospital
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>🎓 HIT Campus (Origin)</span>
            </button>

            {filteredHospitals.map((hosp) => {
              const isSelected = selectedHospital?.id === hosp.id;
              return (
                <button
                  key={hosp.id}
                  onClick={() => {
                    setSelectedHospital(hosp);
                    setMapZoom(16);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <span>{hosp.name.split(' ')[0]}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-emerald-700'} font-mono`}>
                    ({hosp.distanceKm} km)
                  </span>
                </button>
              );
            })}
          </div>

          {/* Real Google Maps Iframe Embed Container */}
          <div className="relative w-full h-80 sm:h-[420px] rounded-2xl overflow-hidden border border-stone-300 shadow-inner bg-stone-100">
            <iframe
              title="Google Maps Haldia Hospitals"
              src={getGoogleMapsEmbedUrl()}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />

            {/* Overlay Origin Tag */}
            <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-stone-200 flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <span className="font-bold text-stone-900">HIT Campus: 22.0538° N, 88.0725° E</span>
                <span className="text-[10px] text-stone-500 block">Hatiberia, Haldia, Purba Medinipur</span>
              </div>
            </div>

            {/* Overlay Selected Hospital Distance Tag */}
            {selectedHospital && (
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 bg-stone-900/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-stone-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-emerald-300">{selectedHospital.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                      {selectedHospital.distanceKm} km from HIT
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-0.5">
                    {selectedHospital.travelTime} &bull; {selectedHospital.address}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setCallModalHospital(selectedHospital)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Call
                  </button>
                  <button
                    onClick={() => setDirectionModalHospital(selectedHospital)}
                    className="px-3 py-1.5 rounded-xl bg-white text-stone-900 hover:bg-stone-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Directions
                  </button>
                  <a
                    href={getGoogleMapsDirectionsUrl(selectedHospital)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    title="Open in Google Maps Mobile App"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Map App
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RADAR MAP VIEW (When active) */}
      {viewMode === 'radar' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>{isHindi ? 'स्थानीय जीपीएस राडार व अस्पताल स्थिति' : 'Tactical Vector Radar Map (Around HIT Campus Haldia)'}</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {isHindi
                  ? 'अस्पताल के पिन पर क्लिक करके विवरण देखें व दूरी नापें।'
                  : 'Click on any facility marker to inspect live beds, doctor on duty & direct route.'}
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              Center: HIT Campus (0.0 km)
            </span>
          </div>

          {/* Interactive Stylized Vector Radar Map */}
          <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-b from-stone-900 via-stone-900 to-slate-950 border border-stone-800 overflow-hidden shadow-inner flex items-center justify-center select-none">
            {/* Radar Background concentric rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-28 h-28 rounded-full border border-dashed border-emerald-500/30" />
              <div className="w-56 h-56 rounded-full border border-emerald-500/20" />
              <div className="w-80 h-80 rounded-full border border-dashed border-emerald-500/15" />
              <div className="w-full max-w-xl h-full border-t border-emerald-500/15 absolute" />
              <div className="h-full border-l border-emerald-500/15 absolute" />
            </div>

            {/* Radar Sweep Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-80 h-80 rounded-full bg-conic-gradient from-emerald-500/40 via-transparent to-transparent animate-spin duration-[9000ms]" />
            </div>

            {/* Range markers */}
            <span className="absolute text-[10px] font-mono text-emerald-400/60 top-4 right-6 pointer-events-none">
              Max Scope: ~20 km Haldia Sub-Division
            </span>
            <span className="absolute text-[9px] font-mono text-emerald-400/50 left-[53%] top-[42%] pointer-events-none">
              1 km (Dr. BC Roy Hospital)
            </span>
            <span className="absolute text-[9px] font-mono text-emerald-400/50 left-[53%] top-[25%] pointer-events-none">
              5 km (Durgachak &amp; Port)
            </span>
            <span className="absolute text-[9px] font-mono text-emerald-400/50 left-[53%] top-[10%] pointer-events-none">
              15 km (Sutahata / Nandigram)
            </span>

            {/* HIT Campus Home Pin (Center) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-lg" />
              </span>
              <span className="mt-1 px-2 py-0.5 rounded-md bg-stone-900/90 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 shadow-xs backdrop-blur whitespace-nowrap">
                🎓 {isHindi ? 'HIT परिसर' : 'HIT Campus'}
              </span>
            </div>

            {/* Hospital Markers on the Radar Map */}
            {NEARBY_HOSPITALS_DATA.map((hosp) => {
              const isSelected = selectedHospital?.id === hosp.id;
              const isMatchesFilter = filteredHospitals.some((f) => f.id === hosp.id);

              return (
                <button
                  key={hosp.id}
                  onClick={() => setSelectedHospital(hosp)}
                  style={{
                    left: `${hosp.coordinates.x}%`,
                    top: `${hosp.coordinates.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-all cursor-pointer group ${
                    isMatchesFilter ? 'opacity-100 scale-100' : 'opacity-30 scale-75'
                  }`}
                  title={`${hosp.name} (${hosp.distanceKm} km)`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shadow-lg transition-transform ${
                      isSelected
                        ? 'bg-emerald-400 text-stone-950 ring-4 ring-emerald-400/50 scale-125'
                        : hosp.emergency24x7
                        ? 'bg-red-600 text-white group-hover:scale-110'
                        : 'bg-teal-600 text-white group-hover:scale-110'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>

                  {/* Marker Tooltip / Label */}
                  <div
                    className={`mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-emerald-400 text-stone-950'
                        : 'bg-stone-900/90 text-stone-200 border border-stone-700'
                    }`}
                  >
                    <span>{hosp.name.split(' ')[0]}</span>{' '}
                    <span className="text-emerald-400 font-mono">({hosp.distanceKm}km)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* HOSPITAL CARDS DIRECTORY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            {isHindi ? 'हल्दिया के अस्पताल एवं स्वास्थ्य केंद्र' : 'Haldia Hospitals & Health Facilities'} ({filteredHospitals.length} Found)
          </div>
          <span className="text-[11px] text-stone-500">
            Sorted by Proximity to Haldia Institute of Technology (HIT)
          </span>
        </div>

        {filteredHospitals.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
            <Building2 className="w-10 h-10 text-stone-300 mx-auto" />
            <h4 className="font-bold text-stone-800 text-sm">
              {t('hospitals_no_results')}
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {isHindi
                ? 'आपके चुने गए फ़िल्टर या खोज के अनुसार कोई अस्पताल उपलब्ध नहीं है। कृपया फ़िल्टर रीसेट करें।'
                : 'No healthcare centres match your active filters or search terms. Try widening the search radius or resetting filters.'}
            </p>
            <button
              onClick={() => {
                setSelectedTier('ALL');
                setMaxDistance(50);
                setEmergencyOnly(false);
                setPmjayOnly(false);
                setIcuOnly(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-stone-800 text-white text-xs font-bold cursor-pointer"
            >
              {t('reset_filters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredHospitals.map((hosp) => {
              const tierStyle = tierColors[hosp.tier];
              const isSelected = selectedHospital?.id === hosp.id;

              return (
                <div
                  key={hosp.id}
                  className={`bg-white rounded-3xl p-5 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group ${
                    isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-stone-200'
                  }`}
                >
                  <div>
                    {/* Top Row: Tier badge & Proximity */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                        >
                          {hosp.tierLabel}
                        </span>

                        {hosp.emergency24x7 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-red-600" />
                            24x7 Emergency
                          </span>
                        )}

                        {hosp.pmjayEmpaneled && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Swasthya Sathi Free
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-stone-900 font-mono">
                          {hosp.distanceKm} km
                        </div>
                        <div className="text-[10px] text-stone-500 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3 text-stone-400" /> {hosp.travelTime}
                        </div>
                      </div>
                    </div>

                    {/* Hospital Name & Location */}
                    <div className="mt-3">
                      <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-800 transition-colors">
                        {hosp.name}
                      </h3>
                      {isHindi && <div className="text-xs text-stone-500 mt-0.5">{hosp.hindiName}</div>}
                      <p className="text-xs text-stone-600 mt-1 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span>{hosp.address} &bull; {hosp.block}</span>
                      </p>
                    </div>

                    {/* Bed Availability Grid */}
                    <div className="mt-4 p-3 rounded-2xl bg-stone-50 border border-stone-150">
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2">
                        <span className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-stone-500" />
                          {isHindi ? 'लाइव बेड उपलब्धता (डेमो)' : 'Bed Availability (Demo)'}
                        </span>
                        <span className="text-stone-400 font-normal">Total Beds: {hosp.totalBeds}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-white border border-stone-200 shadow-2xs">
                          <div className="text-xs font-bold text-stone-800">
                            {hosp.availableBeds.general}
                          </div>
                          <div className="text-[10px] text-stone-500">General Beds</div>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-stone-200 shadow-2xs">
                          <div className="text-xs font-bold text-emerald-700">
                            {hosp.availableBeds.oxygen}
                          </div>
                          <div className="text-[10px] text-emerald-800">Oxygen Beds</div>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-stone-200 shadow-2xs">
                          <div className={`text-xs font-bold ${hosp.availableBeds.icu > 0 ? 'text-blue-700' : 'text-stone-400'}`}>
                            {hosp.availableBeds.icu > 0 ? hosp.availableBeds.icu : '0 / NA'}
                          </div>
                          <div className="text-[10px] text-stone-500">ICU / Ventilator</div>
                        </div>
                      </div>
                    </div>

                    {/* On Duty Doctor & Key Specialities */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs bg-emerald-50/50 p-2 rounded-xl border border-emerald-150">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Stethoscope className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="font-semibold text-stone-800 truncate">
                            {hosp.onDutyDoctor.name}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shrink-0">
                          {hosp.onDutyDoctor.status}
                        </span>
                      </div>

                      {/* Speciality Pills */}
                      <div className="flex flex-wrap gap-1">
                        {hosp.specialities.slice(0, 3).map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600 text-[10px] font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                        {hosp.specialities.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-lg bg-stone-100 text-stone-400 text-[10px]">
                            +{hosp.specialities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setCallModalHospital(hosp)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t('hospitals_call_helpdesk')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedHospital(hosp);
                        setViewMode('map');
                        setMapZoom(16);
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Map className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t('hospitals_view_map')}</span>
                    </button>

                    <button
                      onClick={() => setDirectionModalHospital(hosp)}
                      className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-stone-700" />
                      <span>{t('hospitals_get_directions')}</span>
                    </button>

                    <a
                      href={getGoogleMapsDirectionsUrl(hosp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                      title="Direct Google Maps Live Navigation"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Google Map</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CALL DESK MODAL */}
      {callModalHospital && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {callModalHospital.tierLabel}
                </span>
                <h3 className="font-bold text-base text-stone-900 mt-1">
                  {callModalHospital.name}
                </h3>
                <p className="text-xs text-stone-500">{callModalHospital.block}, Purba Medinipur</p>
              </div>
              <button
                onClick={() => setCallModalHospital(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Direct Contact Lines (Haldia STD: 03224):
              </div>

              {/* Main Reception */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200">
                <div>
                  <div className="font-bold text-xs text-stone-800">Hospital Reception / Helpdesk</div>
                  <div className="font-mono text-xs text-emerald-700 font-semibold">{callModalHospital.phone}</div>
                </div>
                <button
                  onClick={() => handleCopyPhone(callModalHospital.phone)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 cursor-pointer"
                >
                  {copiedPhone === callModalHospital.phone ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Emergency Casualty */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200">
                <div>
                  <div className="font-bold text-xs text-red-900">24x7 Casualty &amp; Trauma Line</div>
                  <div className="font-mono text-xs text-red-700 font-semibold">
                    {callModalHospital.emergencyPhone || '108 (National Emergency)'}
                  </div>
                </div>
                <a
                  href={`tel:${callModalHospital.emergencyPhone || '108'}`}
                  className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                >
                  Dial
                </a>
              </div>
            </div>

            {/* Doctor on Duty */}
            <div className="text-xs text-stone-600 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <Stethoscope className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <strong>Current On-Duty Officer:</strong> {callModalHospital.onDutyDoctor.name} ({callModalHospital.onDutyDoctor.specialty})
              </div>
            </div>

            <button
              onClick={() => setCallModalHospital(null)}
              className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DIRECTIONS & ROUTE MODAL */}
      {directionModalHospital && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  Route from HIT Campus Haldia
                </span>
                <h3 className="font-bold text-base text-stone-900 mt-1">
                  Directions to {directionModalHospital.name}
                </h3>
                <p className="text-xs text-stone-500">
                  Origin: <strong>Haldia Institute of Technology (Hatiberia)</strong> &bull; Distance: <strong>{directionModalHospital.distanceKm} km</strong>
                </p>
              </div>
              <button
                onClick={() => setDirectionModalHospital(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Route Summary */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-stone-600">Estimated Transit Time:</span>
                <span className="font-bold text-stone-900">{directionModalHospital.travelTime}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-stone-600">Road Corridor:</span>
                <span className="font-semibold text-stone-800">ICARE Complex Road / HPL Link Road &bull; Haldia</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">108 Ambulance Status:</span>
                <span className="font-bold text-emerald-700">Active Fleet in Haldia Port &amp; Durgachak Base</span>
              </div>
            </div>

            {/* Turn by turn waypoints */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-stone-800">Step-by-Step Waypoints:</div>
              <div className="space-y-2 border-l-2 border-emerald-500 pl-3">
                <div className="relative">
                  <div className="font-semibold text-stone-800">1. Exit HIT Campus Main Gate (ICARE Complex)</div>
                  <div className="text-[11px] text-stone-500">Hatiberia, towards Balughata Road</div>
                </div>
                <div className="relative">
                  <div className="font-semibold text-stone-800">2. Head towards {directionModalHospital.address}</div>
                  <div className="text-[11px] text-stone-500">Distance approx {directionModalHospital.distanceKm} km ({directionModalHospital.travelTime})</div>
                </div>
                <div className="relative">
                  <div className="font-semibold text-stone-800">3. Arrive at {directionModalHospital.name}</div>
                  <div className="text-[11px] text-stone-500">Emergency &amp; Casualty reception on main gate</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href={getGoogleMapsDirectionsUrl(directionModalHospital)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Live Google Maps Turn-by-Turn</span>
              </a>

              <button
                onClick={() => {
                  setDirectionModalHospital(null);
                  setIsAmbulanceModalOpen(true);
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Ambulance className="w-4 h-4" />
                <span>108 Ambulance</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
