import { useState, useMemo } from 'react';
import {
  MapPin,
  Building,
  Navigation,
  Sparkles,
  Maximize2,
  Volume2,
  VolumeX,
  Compass,
  Radio,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { AmbulanceRide } from '../../types';
import { AMBULANCE_ROUTE_COORDINATES, getPositionOnRoute } from '../../data/ambulanceData';

interface AmbulanceLiveMapProps {
  ride: AmbulanceRide;
  onToggleSiren?: () => void;
}

export function AmbulanceLiveMap({ ride, onToggleSiren }: AmbulanceLiveMapProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);

  // Compute current ambulance position on route
  const currentPos = useMemo(() => {
    return getPositionOnRoute(ride.routeProgressPercent);
  }, [ride.routeProgressPercent]);

  // Build SVG path data for the road route
  const svgPathData = useMemo(() => {
    if (AMBULANCE_ROUTE_COORDINATES.length === 0) return '';
    return AMBULANCE_ROUTE_COORDINATES.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x * 10} ${pt.y * 6}` : `${acc} L ${pt.x * 10} ${pt.y * 6}`;
    }, '');
  }, []);

  return (
    <div className="relative w-full h-[320px] sm:h-[380px] bg-[#0c141c] rounded-2xl overflow-hidden border border-stone-800 select-none shadow-inner group">
      {/* Top Map HUD: Live Status & GPS Signal */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-stone-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700/70 text-xs shadow-lg pointer-events-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-stone-100 font-mono tracking-wide">
            {ride.status === 'Arrived'
              ? 'AT PATIENT LOCATION'
              : ride.status === 'InTransit'
              ? 'EN ROUTE TO CHC HOSPITAL'
              : 'LIVE GPS TRACKING'}
          </span>
          <span className="text-stone-500 text-[10px] hidden sm:inline">&bull;</span>
          <span className="text-emerald-400 text-[10px] font-mono hidden sm:inline">
            4G RTK &bull; ±1.5m accuracy
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {onToggleSiren && (
            <button
              type="button"
              onClick={onToggleSiren}
              className={`p-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer shadow-md ${
                ride.sirenActive
                  ? 'bg-rose-950/90 text-rose-300 border-rose-600 animate-pulse'
                  : 'bg-stone-950/80 text-stone-300 border-stone-700 hover:bg-stone-800'
              }`}
              title="Toggle Emergency Siren Alert"
            >
              {ride.sirenActive ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          <div className="bg-stone-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-stone-700 text-[11px] font-mono text-stone-300 shadow-md">
            Speed: <span className="font-bold text-amber-400">{ride.status === 'Arrived' ? '0 km/h' : '52 km/h'}</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full transition-transform duration-500"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <defs>
          {/* Subtle Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>

          {/* River / Canal Gradient */}
          <linearGradient id="canalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#082f49" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.6" />
          </linearGradient>

          {/* Route Glow */}
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Ambulance Beacon Glow */}
          <radialGradient id="beaconRed">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="beaconBlue">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Map Background with terrain texture */}
        <rect width="1000" height="600" fill="#0d1721" />
        <rect width="1000" height="600" fill="url(#grid)" />

        {/* Green Fields / Village Outskirts Patches */}
        <path
          d="M 50 40 Q 180 30 250 120 T 120 300 T 40 200 Z"
          fill="#064e3b"
          fillOpacity="0.15"
        />
        <path
          d="M 600 80 Q 780 40 850 160 T 920 380 T 700 320 Z"
          fill="#064e3b"
          fillOpacity="0.18"
        />
        <path
          d="M 400 380 Q 620 420 720 540 T 480 580 T 360 480 Z"
          fill="#064e3b"
          fillOpacity="0.15"
        />

        {/* Natural Water Canal (Narmada Sub-Canal) */}
        <path
          d="M 0 420 C 250 360 380 300 500 240 C 650 170 820 180 1000 120"
          fill="none"
          stroke="url(#canalGradient)"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <text x="560" y="210" fill="#0284c7" fontSize="11" fontWeight="bold" letterSpacing="2" opacity="0.6">
          NARMADA MAIN IRRIGATION CANAL
        </text>

        {/* Secondary Rural Connecting Roads */}
        <path
          d="M 80 140 L 320 280 L 480 200 L 780 260 L 960 440"
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 220 580 L 340 450 L 520 480 L 680 570"
          fill="none"
          stroke="#1e293b"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* State Highway #22 (Major Asphalt Route) */}
        <path
          d="M 0 80 Q 300 140 500 110 T 1000 60"
          fill="none"
          stroke="#334155"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <text x="360" y="95" fill="#64748b" fontSize="10" fontWeight="bold" letterSpacing="1.5">
          STATE HIGHWAY 22 &bull; PIPARIYA ROAD
        </text>

        {/* PLANNED AMBULANCE DISPATCH ROUTE (Dashed & Glowing) */}
        {/* Background Road Base */}
        <path
          d={svgPathData}
          fill="none"
          stroke="#1e293b"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Traveled Route segment in Emerald / Cyan */}
        <path
          d={svgPathData}
          fill="none"
          stroke="#0284c7"
          strokeWidth="6"
          strokeDasharray="8 6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#routeGlow)"
        />

        {/* Route checkpoint labels */}
        {AMBULANCE_ROUTE_COORDINATES.filter((pt) => pt.label).map((pt, idx) => (
          <g key={idx} transform={`translate(${pt.x * 10}, ${pt.y * 6})`}>
            <circle r="3" fill="#64748b" />
            <text
              y={idx % 2 === 0 ? -12 : 18}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
              fontWeight="600"
              className="select-none pointer-events-none"
            >
              {pt.label}
            </text>
          </g>
        ))}

        {/* DESTINATION / DISPATCH BASE PIN (CHC Pipariya) */}
        <g transform="translate(180, 132)">
          {/* Outer circle */}
          <circle r="18" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
          <rect x="-10" y="-10" width="20" height="20" rx="6" fill="#0284c7" />
          {/* White Medical Cross */}
          <rect x="-2" y="-6" width="4" height="12" fill="white" />
          <rect x="-6" y="-2" width="12" height="4" fill="white" />
          <text
            x="0"
            y="32"
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="11"
            fontWeight="bold"
            className="select-none"
          >
            CHC Pipariya Base Depot
          </text>
          <text x="0" y="44" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="600">
            Emergency Station #108
          </text>
        </g>

        {/* PATIENT PICKUP LOCATION PIN (With Pulsing Radar Rings) */}
        <g transform="translate(800, 444)">
          {/* Animated Radar Pulse Rings */}
          <circle r="32" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.3">
            <animate attributeName="r" values="16;44;16" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle r="22" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.6">
            <animate attributeName="r" values="10;28;10" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Pin Core */}
          <circle r="14" fill="#065f46" stroke="#34d399" strokeWidth="2.5" />
          <circle r="6" fill="#10b981" />

          {/* Label Card */}
          <g transform="translate(0, -28)">
            <rect x="-70" y="-20" width="140" height="24" rx="6" fill="#064e3b" stroke="#059669" strokeWidth="1" />
            <text x="0" y="-4" textAnchor="middle" fill="#ecfdf5" fontSize="10.5" fontWeight="bold">
              📍 Patient: {ride.pickupLocation.village}
            </text>
          </g>
        </g>

        {/* MOVING AMBULANCE VEHICLE MARKER */}
        <g
          transform={`translate(${currentPos.x * 10}, ${currentPos.y * 6})`}
          className="transition-all duration-700 ease-linear"
        >
          {/* Siren Flasher Glow */}
          {ride.sirenActive && (
            <>
              <circle r="34" fill="url(#beaconRed)" className="animate-ping" opacity="0.7">
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.8s" repeatCount="indefinite" />
              </circle>
              <circle r="24" fill="url(#beaconBlue)" opacity="0.6">
                <animate attributeName="opacity" values="0.2;0.8;0.2" dur="0.8s" repeatCount="indefinite" />
              </circle>
            </>
          )}

          {/* Vehicle Body Shadow */}
          <rect
            x="-18"
            y="-10"
            width="36"
            height="20"
            rx="5"
            fill="#000000"
            opacity="0.5"
            transform={`rotate(${currentPos.angle}) translate(0, 4)`}
          />

          {/* Vehicle Body (Rotated towards travel heading) */}
          <g transform={`rotate(${currentPos.angle})`}>
            {/* White Ambulance Chassis */}
            <rect
              x="-18"
              y="-10"
              width="36"
              height="20"
              rx="5"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            {/* Red Stripe across sides */}
            <rect x="-16" y="-7" width="32" height="3" fill="#dc2626" />
            <rect x="-16" y="4" width="32" height="3" fill="#dc2626" />

            {/* Windshield */}
            <rect x="8" y="-8" width="5" height="16" rx="1.5" fill="#1e293b" />
            {/* Rear window */}
            <rect x="-16" y="-8" width="3" height="16" rx="1" fill="#334155" />

            {/* Red Medical Cross on Roof */}
            <rect x="-5" y="-1" width="10" height="2" fill="#dc2626" />
            <rect x="-1" y="-5" width="2" height="10" fill="#dc2626" />

            {/* Emergency LED Lightbar on Top */}
            <rect x="4" y="-7" width="3" height="6" rx="1" fill="#ef4444" />
            <rect x="4" y="1" width="3" height="6" rx="1" fill="#3b82f6" />
          </g>

          {/* Vehicle Tag / Number Plate Floating Pill */}
          <g transform="translate(0, -26)">
            <rect
              x="-48"
              y="-12"
              width="96"
              height="20"
              rx="6"
              fill="#020617"
              stroke="#38bdf8"
              strokeWidth="1.2"
              className="shadow-md"
            />
            <text x="0" y="2" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold" fontSmoothing="antialiased">
              🚑 {ride.vehicleNumber}
            </text>
          </g>
        </g>
      </svg>

      {/* Bottom Map Controls: Recenter, Zoom In/Out */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.2))}
          className="w-8 h-8 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 border border-stone-700/80 flex items-center justify-center font-bold text-sm cursor-pointer shadow-md transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(0.9, z - 0.2))}
          className="w-8 h-8 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 border border-stone-700/80 flex items-center justify-center font-bold text-sm cursor-pointer shadow-md transition-colors"
          title="Zoom Out"
        >
          &minus;
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel(1)}
          className="w-8 h-8 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 border border-stone-700/80 flex items-center justify-center cursor-pointer shadow-md transition-colors"
          title="Reset View"
        >
          <Compass className="w-4 h-4 text-stone-300" />
        </button>
      </div>

      {/* Bottom Left Quick Distance Metric Badge */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
        <div className="bg-stone-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700 text-xs shadow-lg flex items-center gap-2 text-stone-200">
          <Navigation className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>
            {ride.status === 'Arrived' ? (
              <span className="font-bold text-emerald-400">At Patient Doorstep</span>
            ) : (
              <>
                <strong className="font-bold text-stone-100">{ride.distanceRemainingKm} km</strong> to pickup point
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
