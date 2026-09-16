import {
  LayoutDashboard,
  Calendar,
  Activity,
  Pill,
  FileText,
  Building,
  Ambulance,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Building2,
  Award,
} from 'lucide-react';
import { PatientEHR } from '../../types';
import { useApp } from '../../context/AppContext';

export type PatientSectionId =
  | 'overview'
  | 'appointments'
  | 'hospitals'
  | 'schemes'
  | 'vitals'
  | 'prescriptions'
  | 'history'
  | 'referrals'
  | 'emergency';

interface PatientSidebarProps {
  activeSection: PatientSectionId;
  onSelectSection: (section: PatientSectionId) => void;
  currentPatient: PatientEHR;
  counts: {
    appointments: number;
    prescriptions: number;
    referrals: number;
    history: number;
    hasActiveAmbulance: boolean;
    hasElevatedVitals: boolean;
  };
  onOpenAmbulanceModal: () => void;
}

interface NavItem {
  id: PatientSectionId;
  title: string;
  subTitle: string;
  icon: typeof LayoutDashboard;
  badge?: {
    text: string;
    variant: 'neutral' | 'emerald' | 'amber' | 'red' | 'blue' | 'purple';
    pulsing?: boolean;
  };
}

export function PatientSidebar({
  activeSection,
  onSelectSection,
  currentPatient,
  counts,
  onOpenAmbulanceModal,
}: PatientSidebarProps) {
  const { language } = useApp();
  const getSidebarText = (en: string, hi: string, bn: string, ta: string) => {
    if (language === 'hi') return hi;
    if (language === 'bn') return bn;
    if (language === 'ta') return ta;
    return en;
  };

  const navItems: NavItem[] = [
    {
      id: 'overview',
      title: getSidebarText('Dashboard Overview', 'डैशबोर्ड अवलोकन', 'ড্যাশবোর্ড ওভারভিউ', 'முகப்பு கண்ணோட்டம்'),
      subTitle: getSidebarText('ABHA Card & Health Summary', 'अवलोकन एवं आभा कार्ड', 'ABHA কার্ড ও সারাংশ', 'ABHA அட்டை மற்றும் சுருக்கம்'),
      icon: LayoutDashboard,
    },
    {
      id: 'appointments',
      title: getSidebarText('Doctor Appointments', 'डॉक्टर अपॉइंटमेंट्स', 'ডাক্তারের অ্যাপয়েন্টমেন্ট', 'மருத்துவர் முன்பதிவு'),
      subTitle: getSidebarText('Video Consult & Hospital OPD', 'ऑनलाइन व ओपीडी परामर्श', 'অনলাইন ও ওপিডি পরামর্শ', 'காணொளி மற்றும் மருத்துவமனை ஆலோசனை'),
      icon: Calendar,
      badge:
        counts.appointments > 0
          ? {
              text: `${counts.appointments}`,
              variant: 'emerald',
            }
          : undefined,
    },
    {
      id: 'hospitals',
      title: getSidebarText('Hospitals Near Me', 'नजदीकी अस्पताल खोजें', 'কাছের হাসপাতাল খুঁজুন', 'அருகிலுள்ள மருத்துவமனைகள்'),
      subTitle: getSidebarText('Nearby CHC, PHC & Live Beds', 'दूरी, बेड व आपातकालीन सेवा', 'দূরত্ব, বেড ও জরুরী সেবা', 'தூர அளவு மற்றும் படுக்கை வசதி'),
      icon: Building2,
      badge: {
        text: getSidebarText('8 in Haldia', 'हल्दिया में 8', 'হলদিয়ায় ৮টি', 'ஹால்தியாவில் 8'),
        variant: 'emerald',
      },
    },
    {
      id: 'schemes',
      title: getSidebarText('Govt Health Schemes', 'सरकारी योजनाएँ', 'সরকারি স্বাস্থ্য প্রকল্প', 'அரசு சுகாதார திட்டங்கள்'),
      subTitle: getSidebarText('PM-JAY, Swasthya Sathi & DBT', 'आयुष्मान, स्वास्थ्य साथी व लाभ', 'আয়ুষ্মান, স্বাস্থ্য সাথী ও ডিবিটি', 'ஆயுஷ்மான், ஸ்வஸ்திய சாதி'),
      icon: Award,
      badge: {
        text: getSidebarText('9+ Schemes', '9+ योजनाएँ', '৯+ প্রকল্প', '9+ திட்டங்கள்'),
        variant: 'amber',
      },
    },
    {
      id: 'vitals',
      title: getSidebarText('Current Health Vitals', 'स्वास्थ्य स्थिति व वाइटल्स', 'বর্তমান স্বাস্থ্য লক্ষণ', 'உடல்நல அளவீடுகள்'),
      subTitle: getSidebarText('BP, Glucose & Biometrics', 'बीपी, शुगर व बायोमेट्रिक्स', 'বিপি, সুগার ও বায়োমেট্রিক্স', 'இரத்த அழுத்தம், சர்க்கரை'),
      icon: Activity,
      badge: counts.hasElevatedVitals
        ? {
            text: getSidebarText('Alert', 'अलर्ट', 'সতর্কতা', 'எச்சரிக்கை'),
            variant: 'amber',
          }
        : {
            text: getSidebarText('Synced', 'सामान्य', 'স্বাভাবিক', 'சீரானது'),
            variant: 'neutral',
          },
    },
    {
      id: 'prescriptions',
      title: getSidebarText('Prescriptions & Medicines', 'दवाइयाँ व पर्चे', 'ওষুধ ও প্রেসক্রিপশন', 'மருந்துகள் மற்றும் சீட்டுகள்'),
      subTitle: getSidebarText('Rx Prescriptions & Stock Status', 'दवाइयाँ व उपलब्धता जाँच', 'প্রেসক্রিপশন ও মজুদ পরীক্ষা', 'இருப்பு நிலை சோதனை'),
      icon: Pill,
      badge:
        counts.prescriptions > 0
          ? {
              text: `${counts.prescriptions}`,
              variant: 'blue',
            }
          : undefined,
    },
    {
      id: 'history',
      title: getSidebarText('Checkup & Lab History', 'जाँच रिपोर्ट व इतिहास', 'পরীক্ষা রিপোর্ট ও ইতিহাস', 'பரிசோதனை வரலாறு'),
      subTitle: getSidebarText('Diagnostic Tests & ASHA Visits', 'जाँच रिपोर्ट व इतिहास', 'ডায়াগনস্টিক টেস্ট ও আশা রিপোর্ট', 'ஆஷா பணியாளர் வருகை'),
      icon: FileText,
      badge:
        counts.history > 0
          ? {
              text: `${counts.history}`,
              variant: 'neutral',
            }
          : undefined,
    },
    {
      id: 'referrals',
      title: getSidebarText('Hospital Referrals', 'अस्पताल रेफरल', 'হাসপাতাল রেফারেল', 'மருத்துவமனை பரிந்துரைகள்'),
      subTitle: getSidebarText('CHC & District Referrals', 'सीएचसी/जिला अस्पताल रेफरल', 'সিএইচসি ও জেলা হাসপাতাল', 'மாவட்ட மருத்துவமனை'),
      icon: Building,
      badge:
        counts.referrals > 0
          ? {
              text: `${counts.referrals}`,
              variant: 'purple',
            }
          : undefined,
    },
    {
      id: 'emergency',
      title: getSidebarText('108 Emergency & SOS', '108 आपातकालीन सेवा', '১০৮ জরুরী অ্যাম্বুলেন্স', '108 அவசர ஆம்புலன்ஸ்'),
      subTitle: getSidebarText('Ambulance Dispatch & Helplines', 'एंबुलेंस व आपातकालीन सेवा', 'অ্যাম্বুলেন্স ও হেল্পলাইন', 'ஆம்புலன்ஸ் உதவி'),
      icon: Ambulance,
      badge: counts.hasActiveAmbulance
        ? {
            text: 'LIVE 108',
            variant: 'red',
            pulsing: true,
          }
        : undefined,
    },
  ];

  return (
    <div className="w-full bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
      {/* Patient Mini Profile Header */}
      <div className="p-5 bg-gradient-to-br from-teal-900 via-emerald-900 to-stone-900 text-white border-b border-teal-800/40 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-base text-emerald-200 shrink-0 shadow-inner">
              {currentPatient.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white truncate">{currentPatient.name}</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verified ABHA" />
              </div>
              <div className="text-[11px] font-mono text-emerald-200/90 truncate">
                {currentPatient.abhaId}
              </div>
              <div className="text-[10px] text-emerald-300/80 truncate mt-0.5">
                {currentPatient.age} Yrs &bull; {currentPatient.gender} &bull; {currentPatient.village}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-emerald-300/80">Registered Facility</span>
            <span className="font-medium text-white truncate max-w-[140px]">
              {currentPatient.registeredFacility.replace('Ayushman Arogya Mandir - ', '')}
            </span>
          </div>
        </div>

        {/* Section Navigation List */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-600">
            Patient Portal Sections
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs font-semibold'
                    : 'text-stone-700 hover:bg-stone-100/80 hover:text-stone-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-stone-100 text-stone-600 group-hover:bg-teal-50 group-hover:text-teal-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{item.title}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-teal-100' : 'text-stone-600'
                      }`}
                    >
                      {item.subTitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badge.variant === 'red'
                          ? 'bg-red-100 text-red-700 font-extrabold'
                          : item.badge.variant === 'amber'
                          ? 'bg-amber-100 text-amber-800'
                          : item.badge.variant === 'purple'
                          ? 'bg-purple-100 text-purple-800'
                          : item.badge.variant === 'blue'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge.pulsing && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                      )}
                      {item.badge.text}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive
                        ? 'text-white/80 translate-x-0.5'
                        : 'text-stone-400 group-hover:text-stone-600'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Assigned Frontline Health Worker Card */}
        <div className="p-4 m-3 mt-1 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-800">Assigned ASHA Worker</div>
              <div className="text-xs font-bold text-emerald-950">
                {currentPatient.assignedAshaWorker || 'Meena Devi'}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-emerald-900 leading-snug">
            Available in {currentPatient.village} for doorstep vitals screening, medicine delivery, and hospital escort.
          </p>
        </div>

        {/* Quick Emergency 108 Action Bar */}
        <div className="p-3 border-t border-stone-100 bg-stone-50/60">
          <button
            onClick={onOpenAmbulanceModal}
            className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Ambulance className="w-4 h-4 text-white" />
            <span>Emergency 108 Dispatch</span>
          </button>
        </div>
    </div>
  );
}
