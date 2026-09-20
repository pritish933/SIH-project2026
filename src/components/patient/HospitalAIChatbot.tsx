import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Building2,
  MapPin,
  Star,
  Bed,
  Stethoscope,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ambulance,
  Navigation,
  RotateCcw,
  ShieldCheck,
  Zap,
  MessageCircle,
  X,
  HeartPulse,
  Activity,
  ArrowRight,
  ThumbsUp,
  User,
  Info,
} from 'lucide-react';
import {
  rankHospitals,
  HospitalRecommendation,
  QUICK_SYMPTOM_CHIPS,
  MOCK_REVIEWS,
  detectSymptomGroup,
} from '../../utils/hospitalRecommendationEngine';
import { HospitalFacility } from '../../data/hospitalData';
import { useApp } from '../../context/AppContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  recommendations?: HospitalRecommendation[];
  isTyping?: boolean;
}

interface HospitalAIChatbotProps {
  onSelectHospital: (hospital: HospitalFacility) => void;
  onClose: () => void;
}

// Score color helper
function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-200';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'from-emerald-600 to-teal-700';
  if (score >= 60) return 'from-amber-500 to-orange-600';
  return 'from-rose-500 to-red-600';
}

function UrgencyBadge({ level }: { level: 'critical' | 'moderate' | 'mild' }) {
  if (level === 'critical') return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-300 flex items-center gap-1 animate-pulse">
      <Zap className="w-2.5 h-2.5" /> CRITICAL
    </span>
  );
  if (level === 'moderate') return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300 flex items-center gap-1">
      <Activity className="w-2.5 h-2.5" /> MODERATE
    </span>
  );
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
      <HeartPulse className="w-2.5 h-2.5" /> ROUTINE
    </span>
  );
}

function HospitalCard({
  rec,
  onSelectHospital,
  language,
}: {
  rec: HospitalRecommendation;
  onSelectHospital: (h: HospitalFacility) => void;
  language: string;
}) {
  const [expanded, setExpanded] = useState(rec.rank === 1);
  const [showReviews, setShowReviews] = useState(false);
  const isHindi = language === 'hi';
  const h = rec.hospital;
  const reviews = MOCK_REVIEWS[h.id] || [];

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
        rec.rank === 1
          ? 'border-emerald-300 shadow-md shadow-emerald-100 ring-1 ring-emerald-200'
          : 'border-stone-200 shadow-sm'
      }`}
    >
      {/* Card Header */}
      <div
        className={`p-3.5 flex items-start gap-3 ${
          rec.rank === 1 ? 'bg-gradient-to-r from-emerald-50 to-teal-50' : 'bg-white'
        }`}
      >
        {/* Rank Badge */}
        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${scoreBg(rec.totalScore)} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm`}
        >
          #{rec.rank}
        </div>

        <div className="flex-1 min-w-0">
          {/* Hospital name + score */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              {rec.rank === 1 && (
                <div className="flex items-center gap-1.5 mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wide">
                    {isHindi ? 'सर्वश्रेष्ठ सिफ़ारिश' : "Top Recommendation"}
                  </span>
                </div>
              )}
              <p className="font-bold text-[13px] text-stone-900 leading-snug truncate max-w-[200px]">
                {h.name}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="flex items-center gap-1 text-[11px] text-stone-500">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  {h.distanceKm} km • {h.travelTime}
                </span>
                <UrgencyBadge level={rec.urgencyLevel} />
              </div>
            </div>

            {/* Score Circle */}
            <div className={`shrink-0 text-center px-2.5 py-1.5 rounded-xl border font-black text-sm ${scoreColor(rec.totalScore)}`}>
              {rec.totalScore}
              <span className="text-[9px] font-medium block leading-none opacity-70">/100</span>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-[11px] text-stone-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              {h.rating}/5
              <span className="text-stone-400 ml-0.5">({reviews.length} reviews)</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-stone-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
              <Bed className="w-3 h-3 text-blue-500" />
              {h.availableBeds.icu > 0 ? `${h.availableBeds.icu} ICU` : `${h.availableBeds.oxygen} O₂`}
            </span>
            <span className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border ${
              h.onDutyDoctor.status === 'On Duty'
                ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                : 'text-amber-700 bg-amber-50 border-amber-100'
            }`}>
              <Stethoscope className="w-3 h-3" />
              {h.onDutyDoctor.status}
            </span>
          </div>

          {/* Matched services */}
          {rec.matchedServices.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {rec.matchedServices.slice(0, 2).map((svc, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200"
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {svc.split('&')[0].trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expandable "Why this hospital" explanation */}
      <div className="border-t border-stone-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-[12px] font-bold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            {isHindi ? 'यह hospital क्यों चुना? देखें' : 'Why this hospital? See details'}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {expanded && (
          <div className="px-4 pb-3 space-y-3 bg-stone-50/60">
            {/* Score breakdown bars */}
            <div className="space-y-1.5 pt-1">
              {[
                { label: isHindi ? 'सेवा मिलान' : 'Service Match', score: rec.serviceScore, weight: '35%' },
                { label: isHindi ? 'रेटिंग' : 'Rating', score: rec.ratingScore, weight: '20%' },
                { label: isHindi ? 'दूरी' : 'Distance', score: rec.distanceScore, weight: '20%' },
                { label: isHindi ? 'बेड उपलब्धता' : 'Bed Availability', score: rec.bedScore, weight: '15%' },
                { label: isHindi ? 'डॉक्टर' : 'Doctor Status', score: rec.doctorScore, weight: '5%' },
                { label: isHindi ? 'आपातकाल तैयारी' : 'Emergency Readiness', score: rec.emergencyScore, weight: '5%' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-500 w-28 shrink-0">{f.label} <span className="text-stone-400">({f.weight})</span></span>
                  <div className="flex-1 bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${scoreBg(f.score)} transition-all duration-500`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-stone-700 w-8 text-right">{f.score}</span>
                </div>
              ))}
            </div>

            {/* Full explanation */}
            <div className="text-[11px] text-stone-700 bg-white rounded-xl p-3 border border-stone-200 leading-relaxed">
              {isHindi ? rec.whyExplanationHi : rec.whyExplanationEn}
            </div>

            {/* Patient reviews */}
            <div>
              <button
                onClick={() => setShowReviews(!showReviews)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {isHindi ? `${reviews.length} मरीज़ों की समीक्षाएं` : `${reviews.length} Patient Reviews`}
                {showReviews ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showReviews && (
                <div className="mt-2 space-y-2">
                  {reviews.map((rv, i) => (
                    <div key={i} className="bg-white rounded-xl p-2.5 border border-stone-200">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center">
                            <User className="w-3 h-3 text-stone-500" />
                          </div>
                          <span className="text-[10px] font-bold text-stone-700">{rv.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, s) => (
                            <Star
                              key={s}
                              className={`w-2.5 h-2.5 ${s < rv.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`}
                            />
                          ))}
                          <span className="text-[10px] text-stone-400 ml-1">{rv.date}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">{rv.comment}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {rv.tags.map((tag, t) => (
                          <span key={t} className="text-[9px] font-semibold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-md border border-stone-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-3.5 py-3 bg-white border-t border-stone-100 flex flex-wrap items-center gap-2">
        <button
          onClick={() => onSelectHospital(h)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
        >
          <Navigation className="w-3.5 h-3.5" />
          {isHindi ? 'मैप पर दिखाओ' : 'Show on Map'}
        </button>
        <a
          href={`tel:${h.phone}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5 text-stone-600" />
          {isHindi ? 'कॉल' : 'Call'}
        </a>
        <a
          href={h.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer border border-blue-200"
        >
          <MapPin className="w-3.5 h-3.5" />
          Maps
        </a>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN CHATBOT COMPONENT
// ============================================================================
export function HospitalAIChatbot({ onSelectHospital, onClose }: HospitalAIChatbotProps) {
  const { language, setIsAmbulanceModalOpen } = useApp();
  const isHindi = language === 'hi';

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: isHindi
        ? 'Namaste! 🙏 Mujhe apni takleef ya symptoms batao — main aapke liye sabse sahi hospital dhundhega aur explain karunga ki woh hospital kyun best hai.'
        : "Hello! 🙏 Tell me your health issue or symptoms — I'll find the best hospital for you and explain exactly why it was chosen.",
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: q,
    };

    const typingMsg: ChatMessage = {
      id: `typing-${Date.now()}`,
      role: 'ai',
      text: isHindi
        ? '🔍 Aapke symptoms analyze kar raha hoon... 8 hospitals ko check kar raha hoon...'
        : '🔍 Analyzing your symptoms... checking 8 hospitals near you...',
      isTyping: true,
    };

    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setInput('');
    setIsProcessing(true);

    // Simulate AI processing delay for realism
    setTimeout(() => {
      const results = rankHospitals(q);
      const detected = detectSymptomGroup(q);

      const top = results[0];
      const aiText = isHindi
        ? `${detected ? `"${detected.labelHi}" ke liye` : 'Aapke issue ke liye'} maine 8 hospitals ko analyze kiya — **${top.hospital.name}** sabse best match hai (Score: ${top.totalScore}/100). Neeche ranked results dekhein:`
        : `For ${detected ? `"${detected.labelEn}"` : 'your symptoms'}, I analyzed 8 nearby hospitals — **${top.hospital.name}** is the best match (Score: ${top.totalScore}/100). See ranked results below:`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: aiText,
        recommendations: results.slice(0, 4), // show top 4
      };

      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => !m.isTyping);
        return [...withoutTyping, aiMsg];
      });
      setIsProcessing(false);
    }, 1400);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'ai',
        text: isHindi
          ? 'Namaste! 🙏 Mujhe apni takleef ya symptoms batao.'
          : "Hello again! 🙏 Tell me your health issue or symptoms.",
      },
    ]);
    setInput('');
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-teal-900 via-emerald-900 to-stone-900 text-white flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/30 border border-emerald-400/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">Hospital Advisor</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/20">
                {isHindi ? 'प्रोटोटाइप डेमो' : 'Prototype Demo'}
              </span>
            </div>
            <p className="text-[10px] text-emerald-200/80 mt-0.5">
              {isHindi ? '6-factor scoring: सेवा • रेटिंग • दूरी • बेड • डॉक्टर • आपातकाल' : '6-factor: Service • Rating • Distance • Beds • Doctor • Emergency'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Reset chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Chips (shown when no user message yet) */}
      {messages.length <= 1 && (
        <div className="px-3.5 py-3 border-b border-stone-100 shrink-0">
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">
            {isHindi ? 'जल्दी चुनें:' : 'Quick Select:'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SYMPTOM_CHIPS.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSend(chip.query)}
                className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 text-xs font-semibold text-stone-700 transition-all cursor-pointer"
              >
                {isHindi ? chip.labelHi : chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 bg-stone-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-2xl shrink-0 flex items-center justify-center text-white font-bold text-xs ${
              msg.role === 'ai'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
                : 'bg-gradient-to-br from-stone-600 to-stone-800'
            }`}>
              {msg.role === 'ai' ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            </div>

            <div className={`flex-1 space-y-2.5 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
              {/* Text bubble */}
              <div className={`inline-block max-w-[90%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-stone-800 text-white rounded-tr-sm'
                  : 'bg-white text-stone-800 border border-stone-200 shadow-xs rounded-tl-sm'
              } ${msg.isTyping ? 'animate-pulse' : ''}`}
              >
                {msg.text}
              </div>

              {/* Recommendation cards */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="w-full space-y-2.5 mt-1">
                  {msg.recommendations.map((rec) => (
                    <React.Fragment key={rec.hospital.id}>
                      <HospitalCard
                        rec={rec}
                        onSelectHospital={(h) => {
                          onSelectHospital(h);
                          onClose();
                        }}
                        language={language}
                      />
                    </React.Fragment>
                  ))}

                  {/* Footer note */}
                  <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2 border border-blue-100">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-800 leading-relaxed">
                      {isHindi
                        ? 'Yeh ranking: service match (35%) + rating (20%) + distance (20%) + beds (15%) + doctor (5%) + emergency (5%) par based hai. Real system mein live hospital API se data aayega.'
                        : 'Rankings based on: service match (35%) + rating (20%) + distance (20%) + beds (15%) + doctor status (5%) + emergency readiness (5%). Production system will use live hospital APIs.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="px-3.5 py-3 border-t border-stone-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <MessageCircle className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={isHindi ? 'Apna issue batao... (e.g. seene mein dard)' : 'Describe your symptoms... (e.g. chest pain)'}
              disabled={isProcessing}
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all disabled:opacity-50"
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isProcessing}
            className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-colors cursor-pointer shadow-xs disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
