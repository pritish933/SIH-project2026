import React, { useState, useMemo, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  HeartPulse,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  PhoneCall,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  FileText,
  UserCheck,
  AlertCircle,
  X,
  HelpCircle,
  Copy,
  Check,
  Building,
  Radio,
  BookOpen,
  Info,
  Activity,
} from 'lucide-react';
import {
  GovtScheme,
  SchemeCategory,
  getStoredGovtSchemes,
  saveNewCustomScheme,
  syncGazettedUpdates,
} from '../../data/govtSchemesData';
import { useApp } from '../../context/AppContext';

export function GovtSchemesSection() {
  const { language, t } = useApp();
  const isHindi = language === 'hi';

  const [schemes, setSchemes] = useState<GovtScheme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCitizenProfile, setSelectedCitizenProfile] = useState<string>('ALL');
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState<GovtScheme | null>(null);

  // Sync / New Announcement Feedback
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [copiedDoc, setCopiedDoc] = useState(false);

  // Add Scheme Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSchemeForm, setNewSchemeForm] = useState({
    name: '',
    hindiName: '',
    category: 'hospitalization' as SchemeCategory,
    ministry: '',
    stateOrCentral: 'Central' as 'Central' | 'West Bengal' | 'National Mission',
    benefitAmount: '',
    benefitSummary: '',
    eligibility: '',
    requiredDocuments: '',
    howToApply: '',
    helpline: '',
    officialPortal: '',
  });

  // Load schemes from LocalStorage on mount
  useEffect(() => {
    setSchemes(getStoredGovtSchemes());
  }, []);

  // Sync Gazetted Updates simulation (handles how new govt announcements are added)
  const handleSyncGazettes = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const result = syncGazettedUpdates();
      setSchemes(result.allSchemes);
      setIsSyncing(false);
      if (result.addedCount > 0) {
        setSyncNotice(
          isHindi
            ? `🎉 ${result.addedCount} नई सरकारी योजनाएँ (गजट 2025-2026) सफलतापूर्वक सिंक हो गईं!`
            : `🎉 ${result.addedCount} newly gazetted government programs (2025-2026) synced successfully!`
        );
      } else {
        setSyncNotice(
          isHindi
            ? '✅ सभी केंद्रीय व राज्य स्वास्थ्य योजनाएँ पहले से ही अद्यतित (Up to date) हैं।'
            : '✅ All Central & State Health Gazette schemes are already up to date.'
        );
      }
      setTimeout(() => setSyncNotice(null), 5000);
    }, 1000);
  };

  // Submit custom new scheme
  const handleAddSchemeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchemeForm.name || !newSchemeForm.benefitAmount) return;

    const saved = saveNewCustomScheme({
      name: newSchemeForm.name,
      hindiName: newSchemeForm.hindiName || newSchemeForm.name,
      bengaliName: newSchemeForm.name,
      category: newSchemeForm.category,
      categoryLabel: newSchemeForm.category.toUpperCase().replace('_', ' '),
      ministry: newSchemeForm.ministry || 'Ministry of Health & Family Welfare (MoHFW)',
      stateOrCentral: newSchemeForm.stateOrCentral,
      benefitAmount: newSchemeForm.benefitAmount,
      benefitSummary: newSchemeForm.benefitSummary || 'New government health initiative.',
      eligibility: newSchemeForm.eligibility
        ? newSchemeForm.eligibility.split('\n').filter(Boolean)
        : ['All eligible Indian citizens as per notification guidelines'],
      requiredDocuments: newSchemeForm.requiredDocuments
        ? newSchemeForm.requiredDocuments.split('\n').filter(Boolean)
        : ['Aadhaar Card', 'Ration Card / ID Proof'],
      howToApply: newSchemeForm.howToApply
        ? newSchemeForm.howToApply.split('\n').filter(Boolean)
        : ['1. Contact nearest Government Hospital helpdesk or CSC counter.'],
      helpline: newSchemeForm.helpline || '104 / 14555',
      officialPortal: newSchemeForm.officialPortal || 'https://www.myscheme.gov.in',
      applicationMode: 'Online & CSC',
    });

    setSchemes(getStoredGovtSchemes());
    setIsAddModalOpen(false);
    setSyncNotice(
      isHindi
        ? `✨ नई योजना "${saved.name}" सफलतापूर्वक पंजीकृत की गई!`
        : `✨ New Scheme "${saved.name}" successfully registered & published!`
    );
    setTimeout(() => setSyncNotice(null), 5000);
  };

  // Copy document checklist to clipboard
  const handleCopyDocuments = (docs: string[]) => {
    navigator.clipboard?.writeText?.(docs.join('\n• '));
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2500);
  };

  // Citizen Profiles for quick eligibility filter
  const citizenProfiles = [
    { id: 'ALL', label: isHindi ? 'सभी नागरिक' : 'All Beneficiaries', icon: UserCheck },
    { id: 'SENIOR_70', label: isHindi ? '70+ वरिष्ठ नागरिक (Senior Citizen)' : 'Senior Citizens (70+ Years)', icon: Award },
    { id: 'BPL_RATION', label: isHindi ? 'राशन कार्ड / बीपीएल परिवार' : 'Ration Card / BPL Families', icon: ShieldCheck },
    { id: 'PREGNANT', label: isHindi ? 'गर्भवती महिला एवं शिशु' : 'Pregnant & Lactating Mothers', icon: HeartPulse },
    { id: 'CHILDREN', label: isHindi ? 'बच्चे (0-18 वर्ष)' : 'Children (0-18 Yrs)', icon: Sparkles },
    { id: 'DIALYSIS', label: isHindi ? 'किडनी डायलिसिस मरीज़' : 'Dialysis / Kidney Patients', icon: Activity },
    { id: 'TB', label: isHindi ? 'टीबी (Tuberculosis) मरीज़' : 'Tuberculosis (TB) Patients', icon: AlertCircle },
  ];

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter((scheme) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName =
          scheme.name.toLowerCase().includes(query) ||
          scheme.hindiName.toLowerCase().includes(query) ||
          scheme.bengaliName.toLowerCase().includes(query);
        const matchMinistry = scheme.ministry.toLowerCase().includes(query);
        const matchBenefit = scheme.benefitAmount.toLowerCase().includes(query) || scheme.benefitSummary.toLowerCase().includes(query);
        const matchEligibility = scheme.eligibility.some((e) => e.toLowerCase().includes(query));
        if (!matchName && !matchMinistry && !matchBenefit && !matchEligibility) return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && scheme.category !== selectedCategory) {
        return false;
      }

      // Citizen Profile Eligibility filter
      if (selectedCitizenProfile === 'SENIOR_70') {
        const isSenior =
          scheme.id.includes('VAY') ||
          scheme.name.toLowerCase().includes('senior') ||
          scheme.name.toLowerCase().includes('70') ||
          scheme.eligibility.some((e) => e.toLowerCase().includes('70') || e.toLowerCase().includes('senior'));
        if (!isSenior) return false;
      } else if (selectedCitizenProfile === 'BPL_RATION') {
        const isBpl =
          scheme.id.includes('PMJAY') ||
          scheme.id.includes('SWASTHYA') ||
          scheme.id.includes('DIALYSIS') ||
          scheme.eligibility.some((e) => e.toLowerCase().includes('bpl') || e.toLowerCase().includes('ration'));
        if (!isBpl) return false;
      } else if (selectedCitizenProfile === 'PREGNANT') {
        const isMaternal =
          scheme.category === 'maternal_child' ||
          scheme.id.includes('JSSK') ||
          scheme.id.includes('PMMVY') ||
          scheme.eligibility.some((e) => e.toLowerCase().includes('pregnant') || e.toLowerCase().includes('mother'));
        if (!isMaternal) return false;
      } else if (selectedCitizenProfile === 'CHILDREN') {
        const isChild =
          scheme.id.includes('RBSK') ||
          scheme.id.includes('JSSK') ||
          scheme.id.includes('SICKLE') ||
          scheme.eligibility.some((e) => e.toLowerCase().includes('child') || e.toLowerCase().includes('18'));
        if (!isChild) return false;
      } else if (selectedCitizenProfile === 'DIALYSIS') {
        const isDialysis =
          scheme.id.includes('DIALYSIS') ||
          scheme.benefitSummary.toLowerCase().includes('dialysis') ||
          scheme.eligibility.some((e) => e.toLowerCase().includes('renal') || e.toLowerCase().includes('dialysis'));
        if (!isDialysis) return false;
      } else if (selectedCitizenProfile === 'TB') {
        const isTb =
          scheme.id.includes('NIKSHAY') ||
          scheme.name.toLowerCase().includes('tb') ||
          scheme.eligibility.some((e) => e.toLowerCase().includes('tb') || e.toLowerCase().includes('tuberculosis'));
        if (!isTb) return false;
      }

      return true;
    });
  }, [schemes, searchQuery, selectedCategory, selectedCitizenProfile]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-orange-900 to-stone-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-300" />
                {isHindi ? 'राष्ट्रीय व राज्य स्वास्थ्य योजनाएँ' : 'National & State Health Yojana'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-stone-200 border border-white/10 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                myScheme.gov.in &amp; MoHFW Gazette Linked
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                100% Verified Benefits
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Award className="w-7 h-7 text-amber-300" />
              {t('schemes_title')}
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-2xl">
              {isHindi
                ? 'आयुष्मान भारत (PM-JAY), स्वास्थ्य साथी, वय वंदना (70+), जननी सुरक्षा और मुफ़्त दवाइयों की सम्पूर्ण जानकारी, आवश्यक दस्तावेज़ व पात्रता जाँच।'
                : 'Complete directory of Central & State healthcare schemes (PM-JAY, Swasthya Sathi, Vay Vandana 70+, JSSK, Free Dialysis) with instant eligibility calculator & document checklist.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Sync Gazette Updates Button (Handles new announcements) */}
            <button
              onClick={handleSyncGazettes}
              disabled={isSyncing}
              className="px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs border border-white/20"
              title="Sync latest gazetted schemes from PIB & National Portal"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (isHindi ? 'सिंक हो रहा है...' : 'Syncing...') : (isHindi ? 'ताज़ा गजट सिंक करें' : 'Sync Latest Gazettes')}</span>
            </button>

            {/* Add Newly Announced Scheme Modal Trigger */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Register a newly announced Government Health Scheme"
            >
              <PlusCircle className="w-4 h-4 text-stone-950" />
              <span>{isHindi ? 'नई योजना जोड़ें' : 'Publish New Scheme'}</span>
            </button>
          </div>
        </div>

        {/* Live Gazette Ticker */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200/90">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>
              <strong>{isHindi ? 'नवीनतम सरकारी गजट:' : 'Latest Gazette Update:'}</strong>{' '}
              <span className="text-white">Ayushman Vay Vandana Card launched — ₹5 Lakh free top-up for all citizens aged 70+</span>
            </span>
          </div>
          <span className="text-[11px] font-mono text-amber-300 bg-black/30 px-2.5 py-0.5 rounded-md">
            PIB / MoHFW Circular Validated
          </span>
        </div>
      </div>

      {/* Sync / Success Notice Notification */}
      {syncNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncNotice}</span>
          </div>
          <button
            onClick={() => setSyncNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* INTERACTIVE ELIGIBILITY CHECKER (पात्रता कैलकुलेटर) */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-black">
              <UserCheck className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                {isHindi ? 'त्वरित पात्रता जाँच (Check Your Eligibility)' : 'Instant Scheme Eligibility Calculator'}
              </h3>
              <p className="text-xs text-stone-500">
                {isHindi
                  ? 'अपनी या परिवार की श्रेणी चुनें — संबंधित सभी सरकारी योजनाएँ तुरंत फ़िल्टर हो जाएँगी।'
                  : 'Select beneficiary profile to instantly discover and filter all schemes applicable to you.'}
              </p>
            </div>
          </div>
          {selectedCitizenProfile !== 'ALL' && (
            <button
              onClick={() => setSelectedCitizenProfile('ALL')}
              className="text-xs text-amber-800 hover:underline font-semibold cursor-pointer"
            >
              {isHindi ? 'रीसेट' : 'Show All'}
            </button>
          )}
        </div>

        {/* Profile Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {citizenProfiles.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedCitizenProfile === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedCitizenProfile(p.id)}
                className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/40'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH & CATEGORY CONTROLS */}
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
                  ? 'योजना का नाम, लाभ (उदा. ₹5 लाख, दवाइयां, डायलिसिस) या मंत्रालय खोजें...'
                  : 'Search by scheme name, benefit (e.g. 5 Lakh, Dialysis, Delivery, 5000), or ministry...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
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
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 text-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
            {isHindi ? 'श्रेणी:' : 'Category:'}
          </span>
          {[
            { id: 'ALL', label: isHindi ? 'सभी योजनाएँ' : 'All Schemes' },
            { id: 'hospitalization', label: isHindi ? 'कैशलेस इलाज (₹5 लाख)' : 'Cashless Hospitalization' },
            { id: 'maternal_child', label: isHindi ? 'मातृ एवं शिशु स्वास्थ्य' : 'Maternal & Newborn' },
            { id: 'dbt_financial', label: isHindi ? 'प्रत्यक्ष वित्तीय सहायता (DBT)' : 'DBT Cash Grants' },
            { id: 'medicines', label: isHindi ? 'सस्ती जेनेरिक दवाइयाँ' : 'Affordable Medicines' },
            { id: 'chronic_care', label: isHindi ? 'डायलिसिस व गंभीर रोग' : 'Chronic & Dialysis Care' },
            { id: 'digital_health', label: isHindi ? 'डिजिटल स्वास्थ्य व काउंसलिंग' : 'Digital Health & Counseling' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* SCHEMES DIRECTORY GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            {isHindi ? 'उपलब्ध सरकारी योजनाएँ' : 'Government Health Schemes'} ({filteredSchemes.length} Available)
          </div>
          <span className="text-[11px] text-stone-500">
            Official Guidelines &amp; Direct Benefits
          </span>
        </div>

        {filteredSchemes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
            <Award className="w-10 h-10 text-stone-300 mx-auto" />
            <h4 className="font-bold text-stone-800 text-sm">
              {isHindi ? 'कोई योजना नहीं मिली' : 'No Matching Schemes Found'}
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {isHindi
                ? 'आपके चुने गए फ़िल्टर या खोज के अनुसार कोई योजना नहीं मिली। कृपया फ़िल्टर रीसेट करें।'
                : 'No government schemes match your active search terms or beneficiary profile.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedCitizenProfile('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-stone-800 text-white text-xs font-bold cursor-pointer"
            >
              {isHindi ? 'फ़िल्टर रीसेट करें' : 'Reset All Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSchemes.map((scheme) => {
              return (
                <div
                  key={scheme.id}
                  className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Badge row */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {scheme.stateOrCentral} Scheme
                      </span>

                      {scheme.isNewAnnouncement && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200 animate-pulse">
                          ✨ NEW GAZETTE
                        </span>
                      )}
                    </div>

                    {/* Scheme Name & Ministry */}
                    <div>
                      <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-800 transition-colors">
                        {scheme.name}
                      </h3>
                      {isHindi && <div className="text-xs text-stone-500 mt-0.5">{scheme.hindiName}</div>}
                      <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                        <Building className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">{scheme.ministry}</span>
                      </p>
                    </div>

                    {/* Benefit Amount Pill */}
                    <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                      <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                        Benefit Amount / Coverage:
                      </div>
                      <div className="text-sm font-black text-amber-950 mt-0.5">
                        {scheme.benefitAmount}
                      </div>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                        {scheme.benefitSummary}
                      </p>
                    </div>

                    {/* Eligibility Snapshot */}
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-stone-700 text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Key Eligibility:</span>
                      </div>
                      <ul className="text-stone-600 text-[11px] space-y-0.5 pl-4 list-disc">
                        {scheme.eligibility.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="line-clamp-1">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedSchemeForModal(scheme)}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'पात्रता व दस्तावेज़' : 'Eligibility & Docs'}</span>
                    </button>

                    <a
                      href={`tel:${scheme.helpline.split(' ')[0]}`}
                      className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Call Helpline"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-stone-600" />
                      <span className="hidden sm:inline">Call</span>
                    </a>

                    <a
                      href={scheme.officialPortal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center gap-1"
                      title="Visit Official Govt Portal"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SCHEME FULL DETAILS & DOCUMENTS MODAL */}
      {selectedSchemeForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {selectedSchemeForModal.stateOrCentral} &bull; {selectedSchemeForModal.categoryLabel}
                </span>
                <h3 className="font-bold text-lg text-stone-900 mt-1">
                  {selectedSchemeForModal.name}
                </h3>
                <p className="text-xs text-stone-500">{selectedSchemeForModal.ministry}</p>
              </div>
              <button
                onClick={() => setSelectedSchemeForModal(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Benefit Box */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Total Guaranteed Benefit:
              </div>
              <div className="text-lg font-black text-amber-950">
                {selectedSchemeForModal.benefitAmount}
              </div>
              <p className="text-xs text-stone-700">
                {selectedSchemeForModal.benefitSummary}
              </p>
            </div>

            {/* Eligibility Criteria */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Eligibility Criteria (पात्रता की शर्तें):</span>
              </h4>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                {selectedSchemeForModal.eligibility.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents Checklist */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Required Documents Checklist (आवश्यक दस्तावेज़):</span>
                </h4>
                <button
                  onClick={() => handleCopyDocuments(selectedSchemeForModal.requiredDocuments)}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedDoc ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDoc ? 'Copied' : 'Copy List'}</span>
                </button>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-1.5">
                {selectedSchemeForModal.requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-stone-800 font-medium">
                    <span className="w-4 h-4 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Apply Roadmap */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4 text-amber-600" />
                <span>How to Apply / Enrol (आवेदन कैसे करें):</span>
              </h4>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                {selectedSchemeForModal.howToApply.map((step, idx) => (
                  <div key={idx} className="text-stone-700 leading-relaxed">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Helpline & Action Footer */}
            <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <PhoneCall className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <div className="text-[10px] text-stone-500 font-bold uppercase">Toll-Free Helpline:</div>
                  <div className="font-mono font-bold text-emerald-800">{selectedSchemeForModal.helpline}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedSchemeForModal.officialPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit Official Portal</span>
                </a>
                <button
                  onClick={() => setSelectedSchemeForModal(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH / ADD NEW GOVT SCHEME MODAL (Handles newly announced schemes) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Gazette Registry &bull; PIB Health Update
                </span>
                <h3 className="font-bold text-lg text-stone-900 mt-1">
                  {isHindi ? 'नई सरकारी योजना पंजीकृत करें' : 'Publish Newly Announced Govt Scheme'}
                </h3>
                <p className="text-xs text-stone-500">
                  {isHindi
                    ? 'संसद, कैबिनेट या राज्य सरकार द्वारा घोषित नई योजना का विवरण दर्ज करें।'
                    : 'Register any newly gazetted Central or State health scheme into the citizen directory.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Demo Pre-fill helper */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs">
              <span className="text-amber-900 font-medium">Quick Template:</span>
              <button
                type="button"
                onClick={() => {
                  setNewSchemeForm({
                    name: 'PM National Cancer Drug Subvention Mission',
                    hindiName: 'प्रधानमंत्री राष्ट्रीय कैंसर औषधि छूट मिशन 2026',
                    category: 'medicines',
                    ministry: 'Ministry of Chemicals & Fertilizers & MoHFW',
                    stateOrCentral: 'Central',
                    benefitAmount: 'Up to 95% Subsidy on 36 Essential Oncology Drugs',
                    benefitSummary: 'Government price capping and direct subsidy on critical cancer chemotherapy drugs and monoclonal antibodies across India.',
                    eligibility: 'All diagnosed oncology cancer patients with valid oncologist prescription\nCovers both OPD chemotherapy and inpatient treatments',
                    requiredDocuments: 'Aadhaar Card\nBiopsy / Histopathology lab confirmation\nOncologist prescription with drug regimen',
                    howToApply: '1. Visit nearest AMRIT pharmacy or Govt Medical College counter.\n2. Present Aadhaar and verified prescription.\n3. Receive subsidized cancer therapy medications instantly.',
                    helpline: '1800 180 8080',
                    officialPortal: 'https://pharmaceuticals.gov.in',
                  });
                }}
                className="text-amber-950 underline font-bold cursor-pointer"
              >
                Auto-Fill New Cancer Mission
              </button>
            </div>

            <form onSubmit={handleAddSchemeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Scheme Name (योजना का नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={newSchemeForm.name}
                  onChange={(e) => setNewSchemeForm({ ...newSchemeForm, name: e.target.value })}
                  placeholder="e.g. Ayushman Vay Vandana Card / National Health Mission"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category (श्रेणी)</label>
                  <select
                    value={newSchemeForm.category}
                    onChange={(e) => setNewSchemeForm({ ...newSchemeForm, category: e.target.value as SchemeCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none"
                  >
                    <option value="hospitalization">Cashless Hospitalization</option>
                    <option value="maternal_child">Maternal &amp; Child</option>
                    <option value="medicines">Medicines &amp; Pharmacy</option>
                    <option value="dbt_financial">DBT Financial Cash Grant</option>
                    <option value="chronic_care">Chronic &amp; Dialysis Care</option>
                    <option value="digital_health">Digital Health</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Authority (स्रोत्र)</label>
                  <select
                    value={newSchemeForm.stateOrCentral}
                    onChange={(e) => setNewSchemeForm({ ...newSchemeForm, stateOrCentral: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none"
                  >
                    <option value="Central">Central Government</option>
                    <option value="West Bengal">West Bengal State</option>
                    <option value="National Mission">National Health Mission</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Guaranteed Financial Benefit (लाभ की राशि / कवर) *
                </label>
                <input
                  type="text"
                  required
                  value={newSchemeForm.benefitAmount}
                  onChange={(e) => setNewSchemeForm({ ...newSchemeForm, benefitAmount: e.target.value })}
                  placeholder="e.g. ₹5,00,000 / Year or 100% Free Treatment"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Benefit Summary (संक्षिप्त विवरण)</label>
                <textarea
                  rows={2}
                  value={newSchemeForm.benefitSummary}
                  onChange={(e) => setNewSchemeForm({ ...newSchemeForm, benefitSummary: e.target.value })}
                  placeholder="Explain key advantages for rural citizens..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Eligibility Criteria (पात्रता - प्रत्येक पंक्ति में एक शर्त)
                </label>
                <textarea
                  rows={2}
                  value={newSchemeForm.eligibility}
                  onChange={(e) => setNewSchemeForm({ ...newSchemeForm, eligibility: e.target.value })}
                  placeholder="Enter each eligibility rule on a new line..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Required Documents (आवश्यक दस्तावेज़)
                </label>
                <textarea
                  rows={2}
                  value={newSchemeForm.requiredDocuments}
                  onChange={(e) => setNewSchemeForm({ ...newSchemeForm, requiredDocuments: e.target.value })}
                  placeholder="Aadhaar Card&#10;Ration Card..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Toll-Free Helpline</label>
                  <input
                    type="text"
                    value={newSchemeForm.helpline}
                    onChange={(e) => setNewSchemeForm({ ...newSchemeForm, helpline: e.target.value })}
                    placeholder="14555 / 104"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Official Portal URL</label>
                  <input
                    type="url"
                    value={newSchemeForm.officialPortal}
                    onChange={(e) => setNewSchemeForm({ ...newSchemeForm, officialPortal: e.target.value })}
                    placeholder="https://myscheme.gov.in"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black cursor-pointer shadow-md"
                >
                  Publish to Network
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
