import { useState, useEffect, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PhoneCall,
  X,
  MapPin,
  Building,
  Navigation,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Share2,
  Volume2,
  VolumeX,
  MessageSquare,
  Clock,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Check,
  Send,
  UserCheck,
} from 'lucide-react';
import { AmbulanceRide, AmbulanceDriver } from '../../types';
import { DEFAULT_AMBULANCE_DRIVERS } from '../../data/ambulanceData';
import { AmbulanceLiveMap } from './AmbulanceLiveMap';

export function AmbulanceBookingModal() {
  const {
    isAmbulanceModalOpen,
    setIsAmbulanceModalOpen,
    activeAmbulanceRide,
    bookAmbulance,
    cancelAmbulance,
    updateAmbulanceStatus,
    currentUser,
    patients,
    language,
  } = useApp();

  const isHindi = language === 'hi';

  // Booking Form State (when booking a new ambulance)
  const [selectedType, setSelectedType] = useState<'BLS_108' | 'ALS_108' | 'JANANI_102'>('BLS_108');
  const [pickupAddress, setPickupAddress] = useState<string>('Near Primary School & Panchayat Bhawan, Gram Sihore');
  const [selectedHospital, setSelectedHospital] = useState<string>('Community Health Centre (CHC) Pipariya (4.8 km)');
  const [emergencyReason, setEmergencyReason] = useState<string>('Chest Pain & Uncontrolled High Blood Pressure');
  const [patientName, setPatientName] = useState<string>('Ram Prasad Verma');
  const [patientPhone, setPatientPhone] = useState<string>('+91 94258 77102');

  // Active Ride interaction states
  const [isCallingDriver, setIsCallingDriver] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'driver'; text: string; time: string }>>([
    {
      sender: 'driver',
      text: 'Namaste! Main 108 Pilot Rameshwar baat kar raha hoon. Hum nikal chuke hain, 5 minute mein pahunch rahe hain.',
      time: '10:43 AM',
    },
  ]);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Call timer simulation
  useEffect(() => {
    let interval: any;
    if (isCallingDriver) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallingDriver]);

  if (!isAmbulanceModalOpen) return null;

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    bookAmbulance({
      ambulanceType: selectedType,
      pickupLocation: pickupAddress,
      destinationHospital: selectedHospital,
      emergencyReason: emergencyReason,
      patientName: patientName,
      patientPhone: patientPhone,
    });
  };

  const handleSendChat = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: timeNow }]);
    setChatInput('');

    // Automated driver response after 1.5s
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'driver',
          text: 'Theek hai ji, note kar liya hai. Hum bas gaon ke main entrance gate par hain!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden my-auto">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-xs">
              108
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-stone-900 text-sm tracking-tight">
                  National Ambulance Service (EMRI 108 / 102)
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  <span>Govt 100% Free Service</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-600">
                National Health Mission &bull; 24x7 Emergency Rural Dispatch
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAmbulanceModalOpen(false)}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 cursor-pointer transition-colors"
            title="Close / Minimize to Background"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
          {!activeAmbulanceRide ? (
            /* ========================================================================= */
            /* SCREEN 1: UBER-STYLE AMBULANCE BOOKING / DISPATCH REQUEST                 */
            /* ========================================================================= */
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Emergency Banner */}
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5 text-xs">
                <Radio className="w-4 h-4 text-red-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="leading-relaxed">
                  <strong className="font-bold">Instant Emergency Triage: </strong>
                  Nearest active 108 GPS ambulance unit will be routed directly to patient coordinates. Average rural response time: <strong>6-10 minutes</strong>.
                </div>
              </div>

              {/* Step 1: Select Ambulance Type (Uber Style) */}
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                  {isHindi ? 'एंबुलेंस का प्रकार चुनें:' : 'Select Ambulance Type:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: 108 BLS */}
                  <div
                    onClick={() => setSelectedType('BLS_108')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedType === 'BLS_108'
                        ? 'bg-teal-50/70 border-teal-600 shadow-sm ring-1 ring-teal-600'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">🚑</span>
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                          FASTEST (6 min)
                        </span>
                      </div>
                      <div className="font-bold text-stone-900 text-xs">108 Basic Life Support</div>
                      <div className="text-[11px] text-stone-600 mt-1">
                        Oxygen Cylinder, First Aid, Stretcher &amp; EMT.
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-stone-200/70 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-stone-900">₹0 Free</span>
                      <span className="text-[10px] text-stone-500">All Emergencies</span>
                    </div>
                  </div>

                  {/* Option 2: 108 ALS ICU */}
                  <div
                    onClick={() => setSelectedType('ALS_108')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedType === 'ALS_108'
                        ? 'bg-teal-50/70 border-teal-600 shadow-sm ring-1 ring-teal-600'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">🏥</span>
                        <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                          CRITICAL ICU
                        </span>
                      </div>
                      <div className="font-bold text-stone-900 text-xs">108 Advanced Cardiac (ALS)</div>
                      <div className="text-[11px] text-stone-600 mt-1">
                        Invasive Ventilator, AED Defibrillator &amp; Doctor.
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-stone-200/70 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-stone-900">₹0 Free</span>
                      <span className="text-[10px] text-stone-500">Cardiac / Stroke</span>
                    </div>
                  </div>

                  {/* Option 3: 102 Janani Shishu */}
                  <div
                    onClick={() => setSelectedType('JANANI_102')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedType === 'JANANI_102'
                        ? 'bg-teal-50/70 border-teal-600 shadow-sm ring-1 ring-teal-600'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">🤱</span>
                        <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                          MATERNAL
                        </span>
                      </div>
                      <div className="font-bold text-stone-900 text-xs">102 Janani Express</div>
                      <div className="text-[11px] text-stone-600 mt-1">
                        Safe Delivery Kit, Stretcher &amp; ANM Midwife.
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-stone-200/70 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-stone-900">₹0 Free</span>
                      <span className="text-[10px] text-stone-500">Mother &amp; Child</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pickup & Destination Form */}
              <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                {/* Pickup Address */}
                <div>
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isHindi ? 'मरीज का पता / गांव:' : 'Pickup Location:'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="E.g., Near Primary School, Gram Sihore"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    📍 Live GPS auto-detected from mobile cell tower &bull; Gram Sihore, Pipariya Block
                  </span>
                </div>

                {/* Destination Hospital */}
                <div>
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5 mb-1">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isHindi ? 'अस्पताल चुनें:' : 'Destination Facility:'}</span>
                  </label>
                  <select
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  >
                    <option value="Community Health Centre (CHC) Pipariya (4.8 km)">
                      Community Health Centre (CHC) Pipariya (4.8 km &bull; 10 min)
                    </option>
                    <option value="Sub-District Hospital Gadarwara (18 km)">
                      Sub-District Hospital Gadarwara (18 km &bull; 25 min)
                    </option>
                    <option value="District Hospital & Medical College Jabalpur (48 km)">
                      District Hospital &amp; Medical College Jabalpur (48 km &bull; 50 min)
                    </option>
                  </select>
                </div>

                {/* Emergency Reason / Complaint */}
                <div>
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isHindi ? 'मरीज की मुख्य तकलीफ:' : 'Emergency Complaint:'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    placeholder="E.g., Chest pain, difficulty breathing, pregnancy labour"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>

                {/* Patient Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Patient Name:</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Contact Phone:</label>
                    <input
                      type="text"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA Button (Uber Style) */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isHindi ? 'एंबुलेंस तुरंत बुलाएं (108)' : 'Confirm & Request 108 Ambulance'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* ========================================================================= */
            /* SCREEN 2: UBER-STYLE LIVE AMBULANCE TRACKING WITH REAL-TIME MAP & DRIVER   */
            /* ========================================================================= */
            <div className="space-y-4">
              {/* Uber-Style Large ETA Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-stone-900 text-white shadow-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      {activeAmbulanceRide.status === 'Arrived'
                        ? 'Ambulance Arrived'
                        : isHindi
                        ? 'आ रही है (En Route)'
                        : 'En Route'}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      Ride ID: {activeAmbulanceRide.id}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight mt-1 text-white flex items-center gap-2">
                    {activeAmbulanceRide.status === 'Arrived' ? (
                      <span className="text-emerald-400">At Patient Doorstep!</span>
                    ) : (
                      <>
                        <span>Arriving in {activeAmbulanceRide.etaMinutes} mins</span>
                        <span className="text-sm font-normal text-stone-400">
                          ({activeAmbulanceRide.distanceRemainingKm} km away)
                        </span>
                      </>
                    )}
                  </h2>

                  <p className="text-xs text-stone-300 mt-0.5">
                    Destination: <strong>{activeAmbulanceRide.destinationHospital.name}</strong>
                  </p>
                </div>

                {/* Simulation Shortcut buttons for testing during SIH demo */}
                <div className="flex items-center gap-1.5 bg-stone-800 p-1.5 rounded-xl border border-stone-700 self-start sm:self-auto">
                  <span className="text-[10px] font-bold text-stone-400 px-1 uppercase">Prototype Sim:</span>
                  <button
                    type="button"
                    onClick={() => updateAmbulanceStatus('EnRoute')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                      activeAmbulanceRide.status === 'EnRoute' ? 'bg-teal-600 text-white' : 'text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    On The Way
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAmbulanceStatus('Arrived')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                      activeAmbulanceRide.status === 'Arrived' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    Arrived
                  </button>
                </div>
              </div>

              {/* Progress Bar (Road percentage) */}
              <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-700"
                  style={{ width: `${activeAmbulanceRide.routeProgressPercent}%` }}
                ></div>
              </div>

              {/* REAL-TIME INTERACTIVE SVG MAP */}
              <AmbulanceLiveMap
                ride={activeAmbulanceRide}
                onToggleSiren={() => {
                  activeAmbulanceRide.sirenActive = !activeAmbulanceRide.sirenActive;
                  updateAmbulanceStatus(activeAmbulanceRide.status);
                }}
              />

              {/* UBER-STYLE DRIVER & VEHICLE PROFILE CARD */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-md space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    {/* Driver Avatar */}
                    <div className="relative">
                      <div className="w-13 h-13 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold text-lg border-2 border-stone-700 shadow-xs">
                        {activeAmbulanceRide.driver.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
                        <Check className="w-3 h-3" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-stone-900 text-sm">
                          {activeAmbulanceRide.driver.name}
                        </h4>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{activeAmbulanceRide.driver.rating}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Senior 108 Ambulance Pilot &bull; {activeAmbulanceRide.driver.experienceYears} Years Exp &bull; {activeAmbulanceRide.driver.completedTrips}+ emergency runs
                      </p>
                      <span className="text-[10px] font-mono text-stone-400">
                        Badge ID: {activeAmbulanceRide.driver.badgeNumber}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Plate Badge (Uber Style Metallic) */}
                  <div className="text-right">
                    <div className="px-3 py-1.5 rounded-lg bg-amber-300 text-stone-900 font-mono font-black text-xs sm:text-sm border-2 border-stone-900 shadow-xs tracking-wider inline-block">
                      {activeAmbulanceRide.vehicleNumber}
                    </div>
                    <div className="text-[10px] text-stone-500 font-medium mt-0.5">
                      {activeAmbulanceRide.vehicleModel}
                    </div>
                  </div>
                </div>

                {/* On-board Paramedic / EMT Details */}
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-teal-700 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-800">
                        {activeAmbulanceRide.driver.onboardParamedic.name}
                      </span>{' '}
                      <span className="text-stone-500">
                        ({activeAmbulanceRide.driver.onboardParamedic.designation})
                      </span>
                      <div className="text-[10px] text-stone-600">
                        Certified in: {activeAmbulanceRide.driver.onboardParamedic.certifications}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                    Active on board
                  </span>
                </div>

                {/* Uber Action Buttons: Call, Message, Share */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {/* Call Driver Button */}
                  <button
                    type="button"
                    onClick={() => setIsCallingDriver(true)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Driver</span>
                  </button>

                  {/* Message Driver Button */}
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-stone-600" />
                    <span>Message</span>
                  </button>

                  {/* Share Tracking Link */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-stone-600" />
                    <span>{copiedLink ? 'Link Copied!' : 'Share Live'}</span>
                  </button>
                </div>

                {/* Embedded Quick Chat with Driver */}
                {isChatOpen && (
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                      <span className="font-bold text-stone-800">
                        Chat with Pilot {activeAmbulanceRide.driver.name}
                      </span>
                      <button
                        onClick={() => setIsChatOpen(false)}
                        className="text-stone-400 hover:text-stone-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1.5 p-1">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex flex-col ${
                            msg.sender === 'user' ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl max-w-[85%] text-xs ${
                              msg.sender === 'user'
                                ? 'bg-teal-700 text-white rounded-br-none'
                                : 'bg-white border border-stone-200 text-stone-900 rounded-bl-none shadow-2xs'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-stone-400 mt-0.5 px-1">{msg.time}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendChat} className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type message to ambulance pilot..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Bottom Cancel Request */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone-500">
                  Pickup: {activeAmbulanceRide.pickupLocation.address}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel the 108 Ambulance dispatch?')) {
                      cancelAmbulance();
                    }
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Cancel Ambulance Request
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SIMULATED ACTIVE CALL MODAL (When user clicks Call Driver) */}
        {isCallingDriver && activeAmbulanceRide && (
          <div className="absolute inset-0 z-50 bg-stone-950/95 flex flex-col items-center justify-between p-8 text-white animate-in zoom-in-95 duration-150">
            <div className="text-center pt-8">
              <span className="text-xs text-stone-400 font-mono block mb-2">
                CONNECTED VIA GOVT 108 TOLL-FREE RELAY
              </span>
              <div className="w-20 h-20 rounded-3xl bg-teal-600 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-2xl border-2 border-teal-400">
                {activeAmbulanceRide.driver.name[0]}
              </div>
              <h3 className="text-xl font-bold mt-4">{activeAmbulanceRide.driver.name}</h3>
              <p className="text-sm text-stone-400">{activeAmbulanceRide.vehicleNumber}</p>
              <div className="mt-3 font-mono text-emerald-400 text-sm font-semibold">
                {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {/* Simulated pilot audio dialogue box */}
            <div className="max-w-xs w-full bg-stone-900 border border-stone-800 p-3.5 rounded-2xl text-xs text-stone-300 text-center leading-relaxed">
              <span className="text-amber-400 font-bold block mb-1">
                {isHindi ? 'पायलट (लाउडस्पीकर):' : 'Pilot Speaking (Loudspeaker):'}
              </span>
              {isHindi
                ? '"हाँ जी नमस्कार! हम नहर पुलिया पार कर चुके हैं। सायरन ऑन है, रास्ता साफ है। बस 4 मिनट में आपके घर के सामने पहुंच रहे हैं!"'
                : '"Hello! We have crossed the canal bridge. Siren is on, the road is clear. Reaching right in front of your home in 4 minutes!"'}
            </div>

            <div className="pb-6">
              <button
                type="button"
                onClick={() => setIsCallingDriver(false)}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-105"
              >
                <PhoneCall className="w-6 h-6 rotate-135" />
              </button>
              <span className="text-xs text-stone-400 block text-center mt-2">End Call</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
