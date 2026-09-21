import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  AlertTriangle,
  Zap,
  CheckCircle2,
  HeartPulse,
  ShieldAlert,
  Baby,
  Activity,
  Brain,
  Biohazard,
  Stethoscope,
  ArrowRight,
  RotateCcw,
  Volume2,
  Building2,
  Ambulance,
  Bed,
  MapPin,
  ShieldCheck,
  HelpCircle,
  PhoneCall,
  User,
} from 'lucide-react';
import {
  EmergencyCategory,
  EmergencyCategoryMeta,
} from '../../types';
import {
  parseEmergencyQuery,
  EmergencyTriageResult,
  EMERGENCY_QUICK_CHIPS,
  EMERGENCY_ARCHETYPES,
} from '../../utils/emergencyCoordinationEngine';
import { useApp } from '../../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  triageResult?: EmergencyTriageResult;
  isTyping?: boolean;
}

interface EmergencyAIChatbotProps {
  patientName: string;
  patientVillage: string;
  landmark: string;
  onLaunchEmergency: (params: {
    category: EmergencyCategory;
    patientName: string;
    patientVillage: string;
    landmark: string;
    chiefComplaint: string;
  }) => void;
  onSwitchToCategories?: () => void;
}

export function EmergencyAIChatbot({
  patientName,
  patientVillage,
  landmark,
  onLaunchEmergency,
  onSwitchToCategories,
}: EmergencyAIChatbotProps) {
  const { language, currentUser } = useApp();
  const isHindi = language === 'hi';

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Editable patient info state
  const [pName, setPName] = useState(patientName || currentUser.name || 'Rameshwar Prasad');
  const [pVillage, setPVillage] = useState(patientVillage || 'Gram Sihore');
  const [pLandmark, setPLandmark] = useState(landmark || 'Near Primary School & Panchayat Bhawan');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: isHindi
        ? 'नमस्ते! मैं स्वास्थ्यसेतु AI आपातकालीन ट्राइएज सहायक हूँ। आप अपनी भाषा या बोली (हिंदी, बुंदेली, भोजपुरी, बंगाली, इंग्लिश) में बताएं कि मरीज को क्या समस्या है। मैं तुरंत लक्षणों का विश्लेषण करके सही अस्पताल, बेड और 108 एंबुलेंस तैयार करूँगा।'
        : 'Hello! I am the SwasthyaSetu AI Emergency Triage Assistant. Speak or type the symptoms in your preferred language or rural dialect. I will analyze the clinical urgency, map it to the correct emergency pathway, and coordinate hospital, bed & 108 ambulance dispatch.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Setup Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isHindi ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
          handleProcessInput(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isHindi]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleSpeech = () => {
    if (!speechSupported) {
      // Simulate voice input for testing
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const demoPhrase = 'मरीज के सीने में बहुत तेज दर्द हो रहा है और ठंडा पसीना आ रहा है';
        setInputQuery(demoPhrase);
        handleProcessInput(demoPhrase);
      }, 2000);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleProcessInput = (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `user-${Date.now()}`;

    // Add user message
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: trimmed,
      timestamp: time,
    };

    // Temporary typing indicator
    const typingId = `typing-${Date.now()}`;
    const typingMsg: ChatMessage = {
      id: typingId,
      sender: 'ai',
      text: isHindi ? 'ट्राइएज इंजन लक्षणों का विश्लेषण कर रहा है...' : 'AI Triage Engine evaluating clinical indicators...',
      timestamp: time,
      isTyping: true,
    };

    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setInputQuery('');

    // Run Triage / Logic Engine
    setTimeout(() => {
      const triage = parseEmergencyQuery(trimmed);

      const aiResponseText = isHindi
        ? `लक्षण विश्लेषण पूर्ण: आपके विवरण के आधार पर यह "${triage.categoryMeta.hindiName}" की श्रेणी में वर्गीकृत किया गया है (तीव्रता: ${triage.urgencyLevel === 'CRITICAL_RED' ? 'अत्यधिक गंभीर (Red Flag)' : 'त्वरित (Urgent)'})। तुरंत अस्पताल में ${triage.recommendedBedType.toUpperCase()} बेड आरक्षित करने और ${triage.recommendedAmbulance} भेजने के लिए नीचे दिए गए बटन पर क्लिक करें।`
        : `Triage Analysis Complete: Based on reported symptoms, this has been mapped to "${triage.categoryMeta.name}" (${triage.urgencyLevel === 'CRITICAL_RED' ? 'Critical Red Flag' : 'Urgent'}). Ready to lock ${triage.recommendedBedType.toUpperCase()} Bed and dispatch ${triage.recommendedAmbulance}.`;

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== typingId)
          .concat({
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: aiResponseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            triageResult: triage,
          })
      );
    }, 700);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'Baby':
        return <Baby className="w-5 h-5 text-purple-500" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-blue-500" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-indigo-500" />;
      case 'Biohazard':
        return <Biohazard className="w-5 h-5 text-amber-500" />;
      default:
        return <Stethoscope className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Triage Status Strip */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950 via-stone-900 to-red-900 text-white border border-red-800/60 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-xs tracking-wide">
            {isHindi ? 'आपातकालीन ट्राइएज व भाषा अनुवादक' : 'Emergency Triage & Dialect Parser'}
          </h3>
          <p className="text-[11px] text-stone-300 mt-0.5">
            {isHindi
              ? 'अपनी भाषा / बोली में लक्षण बताएं • ट्राइएज इंजन श्रेणी का मिलान करेगा'
              : 'Natural language symptom triage • Instant classification to Emergency Pathway'}
          </p>
        </div>

        {onSwitchToCategories && (
          <button
            onClick={onSwitchToCategories}
            className="text-[11px] font-bold text-red-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/20 transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
          >
            <span>{isHindi ? '⚡ सीधे श्रेणी चुनें' : '⚡ Or Select Category Manually'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Patient Meta Strip (Editable before dispatch) */}
      <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div>
          <label className="text-[10px] uppercase font-bold text-stone-500 block mb-0.5">Patient Name:</label>
          <input
            type="text"
            value={pName}
            onChange={(e) => setPName(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 font-semibold text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-stone-500 block mb-0.5">Village / Locality:</label>
          <input
            type="text"
            value={pVillage}
            onChange={(e) => setPVillage(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 font-semibold text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-stone-500 block mb-0.5">Pickup Landmark (108):</label>
          <input
            type="text"
            value={pLandmark}
            onChange={(e) => setPLandmark(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 font-semibold text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Quick Dialect & Symptom Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-stone-600 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{isHindi ? 'त्वरित लक्षण विकल्प (1-क्लिक ट्राइएज):' : 'Quick Symptom Prompts (1-Click):'}</span>
          </span>
          <span className="text-stone-500 text-[10px]">{isHindi ? 'हिंदी व स्थानीय बोली' : 'English & Dialects'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EMERGENCY_QUICK_CHIPS.map((chip, idx) => {
            const displayLabel = isHindi ? chip.label : chip.labelEn;
            const chosenInput = isHindi ? chip.sampleInput : chip.sampleInputEn;

            return (
              <button
                key={idx}
                onClick={() => {
                  setInputQuery(chosenInput);
                  handleProcessInput(chosenInput);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-red-50 text-stone-800 hover:text-red-700 border border-stone-200 hover:border-red-300 text-xs font-medium transition-all text-left shadow-2xs cursor-pointer flex items-center gap-1.5 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 group-hover:scale-125 transition-transform"></span>
                <span>{displayLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-white border border-stone-200 min-h-[300px] max-h-[420px] shadow-inner">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} space-y-1`}
            >
              <div className="flex items-center gap-2 text-[10px] text-stone-500 px-1">
                <span>{isAi ? 'SwasthyaSetu Triage AI' : pName || 'Patient'}</span>
                <span>&bull;</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isAi
                    ? 'bg-stone-100/90 text-stone-900 rounded-tl-xs border border-stone-200/80 shadow-xs'
                    : 'bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-tr-xs shadow-xs font-medium'
                }`}
              >
                {msg.isTyping ? (
                  <div className="flex items-center gap-2 text-stone-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                    <span>{msg.text}</span>
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}

                {/* Structured Triage Result Card */}
                {msg.triageResult && (
                  <div className="mt-3.5 p-3.5 rounded-2xl bg-white border-2 border-red-500/40 shadow-md text-stone-900 space-y-3">
                    {/* Header badge */}
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-red-50 border border-red-200">
                          {getCategoryIcon(msg.triageResult.categoryMeta.icon)}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-stone-900">
                            {isHindi
                              ? msg.triageResult.categoryMeta.hindiName
                              : msg.triageResult.categoryMeta.name}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            Category: {msg.triageResult.category} &bull; Confidence: {msg.triageResult.confidencePercent}%
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          msg.triageResult.urgencyLevel === 'CRITICAL_RED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {msg.triageResult.urgencyLevel === 'CRITICAL_RED' ? 'CRITICAL RED' : 'URGENT'}
                      </span>
                    </div>

                    {/* Extracted Symptoms */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        {isHindi ? 'पहचाने गए लक्षण (Extracted Symptoms):' : 'Extracted Clinical Symptoms:'}
                      </span>
                      <div className="space-y-1">
                        {msg.triageResult.extractedSymptoms.map((symp, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-stone-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span>{symp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logistics Recommendation */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px]">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">Required Bed:</span>
                        <span className="font-bold text-stone-900">
                          {msg.triageResult.recommendedBedType.toUpperCase()} Emergency Bed
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">Ambulance Needed:</span>
                        <span className="font-bold text-red-700">{msg.triageResult.recommendedAmbulance}</span>
                      </div>
                    </div>

                    {/* Doorstep First-Aid Advice */}
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-950 space-y-1">
                      <strong className="block text-amber-900 font-bold">
                        {isHindi ? '🚑 एंबुलेंस आने तक तुरंत प्राथमिक उपचार (First Aid):' : '🚑 Urgent Doorstep Action Checklist:'}
                      </strong>
                      {msg.triageResult.doorstepFirstAid.map((fa, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[10px]">
                          <span className="text-amber-700 font-bold">&bull;</span>
                          <span>{fa}</span>
                        </div>
                      ))}
                    </div>

                    {/* Launch Pathway Action Button */}
                    <button
                      type="button"
                      onClick={() =>
                        onLaunchEmergency({
                          category: msg.triageResult!.category,
                          patientName: pName,
                          patientVillage: pVillage,
                          landmark: pLandmark,
                          chiefComplaint: msg.text,
                        })
                      }
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>
                        {isHindi
                          ? `आपातकालीन समन्वय शुरू करें (${msg.triageResult.categoryMeta.hindiName})`
                          : `Launch Emergency Pathway (${msg.triageResult.categoryMeta.name})`}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Bar & Speech Controls */}
      <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-2xl border border-stone-300">
        <button
          type="button"
          onClick={toggleSpeech}
          className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            isListening
              ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-300'
          }`}
          title={isListening ? 'Listening... Speak now' : 'Speak symptoms in Hindi / Dialect'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-red-600" />}
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleProcessInput(inputQuery);
            }
          }}
          placeholder={
            isListening
              ? 'बोलिए, सुन रहे हैं... (Listening...)'
              : isHindi
              ? 'मरीज की परेशानी बताएं (जैसे: सीने में भारी दर्द, खून बह रहा, सांस फूल रही)...'
              : 'Describe emergency symptoms in your words (or click mic)...'
          }
          className="flex-1 px-3 py-2 bg-transparent text-stone-900 placeholder:text-stone-400 text-xs font-medium focus:outline-none"
        />

        <button
          type="button"
          disabled={!inputQuery.trim()}
          onClick={() => handleProcessInput(inputQuery)}
          className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
            inputQuery.trim()
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-[10px] text-stone-500 px-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Non-Diagnostic Logistics &amp; Triage Engine</span>
        </span>
        <span>Supports Hindi, English &amp; Rural Dialects</span>
      </div>
    </div>
  );
}
