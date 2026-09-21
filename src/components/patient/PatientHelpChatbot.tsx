import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Building2,
  CalendarPlus,
  Award,
  Pill,
  Ambulance,
  Activity,
  CreditCard,
  ChevronDown,
  RotateCcw,
  Volume2,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { PatientSectionId } from './PatientSidebar';
import { useApp } from '../../context/AppContext';

export interface PatientHelpChatbotProps {
  activeSection: PatientSectionId;
  onNavigateSection: (section: PatientSectionId) => void;
  onOpenEmergencyModal: () => void;
  patientName: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  action?: {
    label: string;
    section?: PatientSectionId;
    actionType?: 'navigate' | 'emergency';
  };
  timestamp: string;
}

interface QuickPrompt {
  id: string;
  label: string;
  query: string;
  icon: typeof Building2;
}

export function PatientHelpChatbot({
  activeSection,
  onNavigateSection,
  onOpenEmergencyModal,
  patientName,
}: PatientHelpChatbotProps) {
  const { language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Quick 1-Click Suggestions tailored for rural patients
  const getQuickPrompts = (): QuickPrompt[] => {
    if (language === 'hi') {
      return [
        { id: 'hosp', label: '🏥 मुझे अस्पताल जाना है', query: 'मुझे अस्पताल जाना है', icon: Building2 },
        { id: 'doc', label: '👨‍⚕️ ऑनलाइन डॉक्टर दिखाना है', query: 'ऑनलाइन डॉक्टर दिखाना है', icon: CalendarPlus },
        { id: 'sch', label: '📜 सरकारी योजना (आयुष्मान)', query: 'स्वास्थ्य योजना के बारे में जानना है', icon: Award },
        { id: 'med', label: '💊 दवाइयां और पर्चे', query: 'दवाइयां और पर्चे देखने हैं', icon: Pill },
        { id: 'vit', label: '🩺 बीपी/शुगर व आशा दीदी', query: 'आशा दीदी चेकअप व बीपी जांच', icon: Activity },
        { id: 'emg', label: '🚨 108 इमरजेंसी एम्बुलेंस', query: 'इमरजेंसी एम्बुलेंस चाहिए', icon: Ambulance },
      ];
    }
    if (language === 'bn') {
      return [
        { id: 'hosp', label: '🏥 হাসপাতালে যেতে চাই', query: 'হাসপাতালে যেতে চাই', icon: Building2 },
        { id: 'doc', label: '👨‍⚕️ অনলাইনে ডাক্তার দেখাবো', query: 'অনলাইনে ডাক্তার দেখাবো', icon: CalendarPlus },
        { id: 'sch', label: '📜 সরকারি স্বাস্থ্য প্রকল্প', query: 'স্বাস্থ্য সাথী ও আয়ুষ্মান প্রকল্প', icon: Award },
        { id: 'med', label: '💊 ওষুধ ও প্রেসক্রিপশন', query: 'ওষুধ এবং প্রেসক্রিপশন দেখতে চাই', icon: Pill },
        { id: 'vit', label: '🩺 আশা দিদি ও স্বাস্থ্য পরীক্ষা', query: 'আশা দিদি স্বাস্থ্য পরীক্ষা', icon: Activity },
        { id: 'emg', label: '🚨 জরুরি ১০৮ অ্যাম্বুলেন্স', query: 'জরুরি ১০৮ অ্যাম্বুলেন্স প্রয়োজন', icon: Ambulance },
      ];
    }
    return [
      { id: 'hosp', label: '🏥 Need to go to Hospital', query: 'I need to go to a hospital', icon: Building2 },
      { id: 'doc', label: '👨‍⚕️ Consult Doctor Online', query: 'I want to consult a doctor online', icon: CalendarPlus },
      { id: 'sch', label: '📜 Govt Health Schemes', query: 'Tell me about health schemes like Ayushman Bharat', icon: Award },
      { id: 'med', label: '💊 Medicines & Prescriptions', query: 'Where can I find medicines and prescriptions?', icon: Pill },
      { id: 'vit', label: '🩺 Health Vitals & ASHA', query: 'How to check BP/sugar or request ASHA visit?', icon: Activity },
      { id: 'emg', label: '🚨 108 Emergency Ambulance', query: 'I need an emergency ambulance', icon: Ambulance },
    ];
  };

  const getInitialMessage = (): ChatMessage => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (language === 'hi') {
      return {
        id: 'init-1',
        sender: 'bot',
        text: `नमस्ते ${patientName}! मैं आपका InstaCure चैटबॉट हूँ।\n\nअगर आपको इस डैशबोर्ड को समझने में कोई भी परेशानी आ रही है—जैसे अस्पताल जाना, डॉक्टर दिखाना, सरकारी योजना जानना या दवाइयां खोजना—तो मुझसे पूछें।`,
        timestamp: timeStr,
      };
    }
    if (language === 'bn') {
      return {
        id: 'init-1',
        sender: 'bot',
        text: `নমস্কার ${patientName}! আমি আপনার InstaCure চ্যাটবট।\n\nড্যাশবোর্ড বুঝতে আপনার কোনো অসুবিধা হলে—যেমন হাসপাতালে যাওয়া, অনলাইন ডাক্তার দেখানো, সরকারি প্রকল্প বা ওষুধ খোঁজা—আমাকে নির্দ্বিধায় জিজ্ঞেস করুন।`,
        timestamp: timeStr,
      };
    }
    return {
      id: 'init-1',
      sender: 'bot',
      text: `Namaste ${patientName}! I am your InstaCure Chatbot.\n\nIf you find anything confusing in this dashboard—such as finding hospitals, consulting a doctor online, learning about health schemes, or locating generic medicines—ask me anytime!`,
      timestamp: timeStr,
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Listen for external trigger events (e.g. from Overview banner)
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setHasInteracted(true);
    };
    window.addEventListener('open-patient-help-chatbot', handleOpen);
    return () => window.removeEventListener('open-patient-help-chatbot', handleOpen);
  }, []);

  // Handle Speech Recognition (Web Speech API)
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया लिखकर पूछें।'
          : 'Voice input is not supported in this browser. Please type your query.'
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript) {
          handleUserQuery(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Process user intent and respond
  const handleUserQuery = (rawQuery: string) => {
    const query = rawQuery.trim();
    if (!query) return;

    setHasInteracted(true);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeStr,
    };

    const lower = query.toLowerCase();

    // Determine Intent & Guidance Response
    let botResponseText = '';
    let actionData: ChatMessage['action'] = undefined;

    // 1. HOSPITAL INTENT
    if (
      lower.includes('hospital') ||
      lower.includes('aspatal') ||
      lower.includes('अस्पताल') ||
      lower.includes('हॉस्पिटल') ||
      lower.includes('হাসপাতাল') ||
      lower.includes('bed') ||
      lower.includes('बेड') ||
      lower.includes('chc') ||
      lower.includes('phc') ||
      lower.includes('admit')
    ) {
      if (language === 'hi') {
        botResponseText =
          'नजदीकी सरकारी अस्पताल, PHC, CHC और अनुमंडलीय अस्पताल देखने के लिए "नजदीकी अस्पताल खोजें" सेक्शन पर जाएँ। वहाँ आप लाइव उपलब्ध सामान्य व ICU बेड, डॉक्टर ड्यूटी और दूरी भी देख सकते हैं।';
        actionData = {
          label: '🏥 नजदीकी अस्पताल खोलें (Hospitals Near Me)',
          section: 'hospitals',
          actionType: 'navigate',
        };
      } else if (language === 'bn') {
        botResponseText =
          'কাছের সরকারি হাসপাতাল, PHC, CHC এবং লাইভ বেডের তথ্য দেখতে "কাছের হাসপাতাল" বিভাগে যান।';
        actionData = {
          label: '🏥 কাছের হাসপাতাল বিভাগ খুলুন',
          section: 'hospitals',
          actionType: 'navigate',
        };
      } else {
        botResponseText =
          'To locate nearby government hospitals, PHCs, CHCs, and check live ICU and general bed availability in Haldia, use the "Hospitals Near Me" section.';
        actionData = {
          label: '🏥 Open Hospitals Near Me',
          section: 'hospitals',
          actionType: 'navigate',
        };
      }
    }
    // 2. DOCTOR CONSULT / APPOINTMENT INTENT
    else if (
      lower.includes('doctor') ||
      lower.includes('डॉक्टर') ||
      lower.includes('ডাক্তার') ||
      lower.includes('appointment') ||
      lower.includes('अपॉइंटमेंट') ||
      lower.includes('consult') ||
      lower.includes('video') ||
      lower.includes('बात') ||
      lower.includes('दिखाना') ||
      lower.includes('सलाह') ||
      lower.includes('opd') ||
      lower.includes('টোকেন')
    ) {
      if (language === 'hi') {
        botResponseText =
          'विशेषज्ञ डॉक्टर से ऑनलाइन वीडियो कॉल पर परामर्श लेने या नजदीकी सरकारी अस्पताल का OPD टोकन बुक करने के लिए "डॉक्टर अपॉइंटमेंट्स" सेक्शन का उपयोग करें।';
        actionData = {
          label: '👨‍⚕️ डॉक्टर अपॉइंटमेंट्स खोलें (Video & OPD)',
          section: 'appointments',
          actionType: 'navigate',
        };
      } else if (language === 'bn') {
        botResponseText =
          'অনলাইন ভিডিও কলে বিশেষজ্ঞ ডাক্তারের সাথে পরামর্শ করতে বা ওপিডি টিকিট কাটতে "ডাক্তারের অ্যাপয়েন্টমেন্ট" বিভাগে যান।';
        actionData = {
          label: '👨‍⚕️ ডাক্তারের অ্যাপয়েন্টমেন্ট খুলুন',
          section: 'appointments',
          actionType: 'navigate',
        };
      } else {
        botResponseText =
          'To consult a specialist doctor online via video call or book advance OPD slips for hospital visits, open the "Doctor Appointments" section.';
        actionData = {
          label: '👨‍⚕️ Open Doctor Appointments',
          section: 'appointments',
          actionType: 'navigate',
        };
      }
    }
    // 3. HEALTH SCHEMES (AYUSHMAN / SWASTHYA SATHI) INTENT
    else if (
      lower.includes('scheme') ||
      lower.includes('योजना') ||
      lower.includes('প্রকল্প') ||
      lower.includes('ayushman') ||
      lower.includes('आयुष्मान') ||
      lower.includes('pm-jay') ||
      lower.includes('pmjay') ||
      lower.includes('swasthya sathi') ||
      lower.includes('स्वास्थ्य साथी') ||
      lower.includes('bima') ||
      lower.includes('बीमा') ||
      lower.includes('5 lakh') ||
      lower.includes('लाख') ||
      lower.includes('free') ||
      lower.includes('मुफ्त')
    ) {
      if (language === 'hi') {
        botResponseText =
          'आयुष्मान भारत (PM-JAY, प्रति परिवार ₹5 लाख तक का मुफ्त इलाज), स्वास्थ्य साथी और 9+ सरकारी स्वास्थ्य योजनाओं की पात्रता और लाभ जानने के लिए "सरकारी योजनाएँ" सेक्शन देखें।';
        actionData = {
          label: '📜 सरकारी योजनाएँ देखें (9+ Schemes)',
          section: 'schemes',
          actionType: 'navigate',
        };
      } else if (language === 'bn') {
        botResponseText =
          'আয়ুষ্মান ভারত (PM-JAY) এবং স্বাস্থ্য সাথী প্রকল্পে ৫ লাখ টাকা পর্যন্ত বিনামূল্যে চিকিৎসার সুবিধা জানতে "সরকারি স্বাস্থ্য প্রকল্প" বিভাগে যান।';
        actionData = {
          label: '📜 সরকারি স্বাস্থ্য প্রকল্প দেখুন',
          section: 'schemes',
          actionType: 'navigate',
        };
      } else {
        botResponseText =
          'To explore government healthcare welfare programs like Ayushman Bharat (PM-JAY with ₹5 Lakh cashless coverage) and state schemes, open the "Govt Health Schemes" section.';
        actionData = {
          label: '📜 Open Govt Health Schemes',
          section: 'schemes',
          actionType: 'navigate',
        };
      }
    }
    // 4. MEDICINES & JAN AUSHADHI INTENT
    else if (
      lower.includes('dawa') ||
      lower.includes('dawai') ||
      lower.includes('दवा') ||
      lower.includes('ঔষধ') ||
      lower.includes('ওষুধ') ||
      lower.includes('medicine') ||
      lower.includes('parcha') ||
      lower.includes('prescription') ||
      lower.includes('पर्चा') ||
      lower.includes('jan aushadhi') ||
      lower.includes('जन औषधि') ||
      lower.includes('pharmacy')
    ) {
      if (language === 'hi') {
        botResponseText =
          'डॉक्टर द्वारा लिखे गए दवाइयों के पर्चे (Rx) देखने और प्रधानमंत्री जन औषधि केंद्र से 50% से 90% कम कीमत पर मिलने वाली जेनेरिक दवाइयों का स्टॉक जांचने के लिए "दवाइयाँ व पर्चे" सेक्शन खोलें।';
        actionData = {
          label: '💊 दवाइयाँ व पर्चे खोलें (Prescriptions)',
          section: 'prescriptions',
          actionType: 'navigate',
        };
      } else if (language === 'bn') {
        botResponseText =
          'প্রেসক্রিপশন দেখতে এবং জন ঔষধি কেন্দ্রের কম মূল্যের জেনেরিক ওষুধের প্রাপ্যতা পরীক্ষা করতে "ওষুধ ও প্রেসক্রিপশন" বিভাগে যান।';
        actionData = {
          label: '💊 ওষুধ ও প্রেসক্রিপশন দেখুন',
          section: 'prescriptions',
          actionType: 'navigate',
        };
      } else {
        botResponseText =
          'To review active prescriptions and search generic medicine availability at 50-90% subsidized rates from Pradhan Mantri Jan Aushadhi Kendras, open "Prescriptions & Medicines".';
        actionData = {
          label: '💊 Open Prescriptions & Medicines',
          section: 'prescriptions',
          actionType: 'navigate',
        };
      }
    }
    // 5. EMERGENCY / 108 AMBULANCE INTENT
    else if (
      lower.includes('emergency') ||
      lower.includes('ambulance') ||
      lower.includes('108') ||
      lower.includes('एम्बुलेंस') ||
      lower.includes('আক্রান্ত') ||
      lower.includes('জরুরি') ||
      lower.includes('aapatkal') ||
      lower.includes('आपातकाल') ||
      lower.includes('sos') ||
      lower.includes('accident') ||
      lower.includes('durghatna') ||
      lower.includes('behoshi')
    ) {
      if (language === 'hi') {
        botResponseText =
          'तत्काल जीवन रक्षक सहायता के लिए 108 एम्बुलेंस और नजदीकी अस्पताल में बेड रिजर्वेशन हेतु इमरजेंसी कोऑर्डिनेशन हब तुरंत खोलें:';
        actionData = {
          label: '🚨 108 इमरजेंसी हब चालू करें',
          actionType: 'emergency',
        };
      } else if (language === 'bn') {
        botResponseText =
          'জরুরি অবস্থায় ১০৮ অ্যাম্বুলেন্স এবং হাসপাতালে বেড বুকিংয়ের জন্য জরুরি স্বাস্থ্যসেবা হাব চালু করুন:';
        actionData = {
          label: '🚨 জরুরি ১০৮ হাব চালু করুন',
          actionType: 'emergency',
        };
      } else {
        botResponseText =
          'For critical medical emergencies, initiate the 108 Emergency Healthcare Coordination Hub for immediate ambulance dispatch and bed reservation:';
        actionData = {
          label: '🚨 Launch 108 Emergency Coordination Hub',
          actionType: 'emergency',
        };
      }
    }
    // 6. VITALS & ASHA WORKER VISIT INTENT
    else if (
      lower.includes('bp') ||
      lower.includes('sugar') ||
      lower.includes('शुगर') ||
      lower.includes('সুগার') ||
      lower.includes('vital') ||
      lower.includes('checkup') ||
      lower.includes('asha') ||
      lower.includes('आशा') ||
      lower.includes('didi') ||
      lower.includes('दीदी') ||
      lower.includes('doorstep') ||
      lower.includes('जांच')
    ) {
      if (language === 'hi') {
        botResponseText =
          'अपना ब्लड प्रेशर, शुगर, पल्स और आशा दीदी द्वारा घर पर की गई जांच देखने या नया चेकअप अनुरोध दर्ज करने के लिए "स्वास्थ्य स्थिति व वाइटल्स" सेक्शन खोलें।';
        actionData = {
          label: '🩺 स्वास्थ्य स्थिति व वाइटल्स खोलें',
          section: 'vitals',
          actionType: 'navigate',
        };
      } else if (language === 'bn') {
        botResponseText =
          'আপনার বিপি, রক্তে শর্করার মাত্রা এবং আশা কর্মীর স্বাস্থ্য পরীক্ষা দেখতে "বর্তমান স্বাস্থ্য লক্ষণ" বিভাগে যান।';
        actionData = {
          label: '🩺 স্বাস্থ্য লক্ষণ ও ভাইটালস খুলুন',
          section: 'vitals',
          actionType: 'navigate',
        };
      } else {
        botResponseText =
          'To monitor your blood pressure, sugar, biometric vitals, or request a doorstep screening by your assigned ASHA worker, visit "Current Health Vitals".';
        actionData = {
          label: '🩺 Open Current Health Vitals',
          section: 'vitals',
          actionType: 'navigate',
        };
      }
    }
    // 7. ABHA CARD & OVERVIEW INTENT
    else if (
      lower.includes('card') ||
      lower.includes('कार्ड') ||
      lower.includes('কার্ড') ||
      lower.includes('abha') ||
      lower.includes('आभा') ||
      lower.includes('qr') ||
      lower.includes('क्यूआर') ||
      lower.includes('overview') ||
      lower.includes('profile') ||
      lower.includes('अवलोकन')
    ) {
      if (language === 'hi') {
        botResponseText =
          'आपका डिजिटल आयुष्मान आभा (ABHA) हेल्थ कार्ड, क्यूआर कोड और मुख्य स्वास्थ्य सारांश "डैशबोर्ड अवलोकन" सेक्शन में उपलब्ध है।';
        actionData = {
          label: '📋 डैशबोर्ड अवलोकन (ABHA कार्ड) खोलें',
          section: 'overview',
          actionType: 'navigate',
        };
      } else {
        botResponseText =
          'Your official Ayushman Bharat ABHA Health ID card, QR code, and core vitals summary are located in the "Dashboard Overview" section.';
        actionData = {
          label: '📋 Go to Dashboard Overview (ABHA Card)',
          section: 'overview',
          actionType: 'navigate',
        };
      }
    }
    // 8. PAST REPORTS / LAB HISTORY INTENT
    else if (
      lower.includes('report') ||
      lower.includes('रिपोर्ट') ||
      lower.includes('lab') ||
      lower.includes('लैब') ||
      lower.includes('history') ||
      lower.includes('purana') ||
      lower.includes('पुरानी')
    ) {
      if (language === 'hi') {
        botResponseText =
          'आपकी पुरानी जांच रिपोर्ट, पर्चे और संपूर्ण स्वास्थ्य इतिहास "चेकअप एवं लैब हिस्ट्री" सेक्शन में सुरक्षित हैं।';
        actionData = {
          label: '📄 चेकअप एवं लैब हिस्ट्री खोलें',
          section: 'history',
          actionType: 'navigate',
        };
      } else {
        botResponseText =
          'All your historical diagnostic lab reports, past vitals logs, and prescriptions are archived under "Diagnostic Checkup & Lab History".';
        actionData = {
          label: '📄 Open Checkup & Lab History',
          section: 'history',
          actionType: 'navigate',
        };
      }
    }
    // 9. GENERAL / FALLBACK ASSISTANCE
    else {
      if (language === 'hi') {
        botResponseText =
          'मैं इस डैशबोर्ड पर आपको रास्ता दिखाने के लिए हूँ! आप नीचे दिए गए किसी भी विषय पर क्लिक करके सीधे उस सेक्शन में जा सकते हैं:\n• अस्पताल व बेड खोजना\n• डॉक्टर से ऑनलाइन सलाह\n• सरकारी योजना (आयुष्मान भारत)\n• सस्ती दवाइयां\n• 108 एम्बुलेंस';
      } else if (language === 'bn') {
        botResponseText =
          'আমি এই ড্যাশবোর্ডে আপনাকে সাহায্য করার জন্য প্রস্তুত! হাসপাতাল খোঁজা, অনলাইন ডাক্তার, সরকারি প্রকল্প বা ওষুধ দেখতে নিচের বোতামগুলোতে ক্লিক করুন।';
      } else {
        botResponseText =
          'I am here to guide you around this health dashboard! You can ask me how to reach any section or click the quick action buttons below.';
      }
    }

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: botResponseText,
      action: actionData,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputText('');
  };

  const handleActionClick = (action: ChatMessage['action']) => {
    if (!action) return;
    if (action.actionType === 'emergency') {
      onOpenEmergencyModal();
      setIsOpen(false);
    } else if (action.section) {
      onNavigateSection(action.section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Keep chatbot minimized or ready
      setIsOpen(false);
    }
  };

  const resetChat = () => {
    setMessages([getInitialMessage()]);
  };

  return (
    <>
      {/* Floating Chatbot Launch Trigger Button (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          {!hasInteracted && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/90 text-white text-xs font-semibold shadow-lg border border-stone-700 animate-bounce">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>InstaCure Chatbot</span>
            </div>
          )}

          <button
            onClick={() => {
              setIsOpen(true);
              setHasInteracted(true);
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-teal-800 via-teal-700 to-emerald-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-2 border-white/40 group relative"
            aria-label="Open InstaCure Chatbot"
            title="InstaCure Chatbot"
          >
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
            <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}

      {/* Expandable Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[85vh] h-[600px] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Chatbot Header */}
          <div className="p-4 bg-gradient-to-r from-teal-800 via-teal-900 to-stone-900 text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 relative shadow-inner">
                <MessageCircle className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-teal-900"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm tracking-tight text-white">
                    InstaCure Chatbot
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                    {language === 'hi' ? 'डैशबोर्ड गाइड' : 'Dashboard Guide'}
                  </span>
                </div>
                <p className="text-[11px] text-teal-200/90 font-medium">
                  {language === 'hi'
                    ? 'अस्पताल, डॉक्टर, योजना व दवाइयों में सहायता'
                    : 'Guidance for Hospitals, Consult, Schemes & Medicines'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                title={language === 'hi' ? 'चैट रीसेट करें' : 'Reset Chat'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                title="Close"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Help Prompts Bar */}
          <div className="p-2.5 bg-stone-50 border-b border-stone-200 shrink-0">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 px-1">
              {language === 'hi'
                ? 'त्वरित प्रश्न (1-क्लिक सहायता):'
                : language === 'bn'
                ? 'দ্রুত সহায়তা (১-ক্লিক):'
                : 'Quick Prompts (1-Click Guide):'}
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {getQuickPrompts().map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleUserQuery(prompt.query)}
                  className="px-2.5 py-1 rounded-xl bg-white border border-stone-200 hover:border-teal-600 text-stone-700 hover:text-teal-900 text-[11px] font-semibold whitespace-nowrap shadow-2xs hover:bg-teal-50 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-stone-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-teal-700 text-white rounded-tr-xs'
                      : 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs space-y-2.5'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Direct 1-Click Action Button inside Bot Message */}
                  {msg.action && (
                    <div className="pt-1">
                      <button
                        onClick={() => handleActionClick(msg.action)}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                          msg.action.actionType === 'emergency'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        <span>{msg.action.label}</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-stone-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input & Microphone Footer */}
          <div className="p-3 bg-white border-t border-stone-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserQuery(inputText);
              }}
              className="flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                }`}
                title={
                  isListening
                    ? 'सुन रहे हैं... (Listening...)'
                    : language === 'hi'
                    ? 'बोलकर पूछें (Voice Input)'
                    : 'Speak (Voice Input)'
                }
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'पूछें: जैसे "मुझे अस्पताल जाना है"...'
                    : language === 'bn'
                    ? 'লিখুন: যেমন "হাসপাতালে যেতে চাই"...'
                    : 'Ask: e.g. "I want to go to hospital"...'
                }
                className="flex-1 bg-stone-100 text-stone-900 placeholder:text-stone-400 text-xs px-3.5 py-2.5 rounded-2xl border border-stone-200 focus:outline-hidden focus:border-teal-700 focus:bg-white transition-all"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xs transition-all cursor-pointer"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
