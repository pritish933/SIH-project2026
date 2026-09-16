import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RURAL_FEEDBACK_PRESET_TAGS } from '../../data/feedbackData';
import {
  Star,
  ShieldCheck,
  Radio,
  Pill,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  X,
  Heart,
  Volume2,
  Award,
} from 'lucide-react';

export function ConsultationFeedbackModal() {
  const {
    isFeedbackModalOpen,
    feedbackTargetSession,
    closeFeedbackModal,
    addFeedback,
    language,
  } = useApp();

  const isHindi = language === 'hi';

  const [overallRating, setOverallRating] = useState<number>(5);
  const [hoveredOverall, setHoveredOverall] = useState<number | null>(null);

  const [communicationRating, setCommunicationRating] = useState<number>(5);
  const [networkClarityRating, setNetworkClarityRating] = useState<number>(5);
  const [medicineClarityRating, setMedicineClarityRating] = useState<number>(5);

  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Bilingual Hindi Explanation',
    'Clear Dosage Guidance',
    'Patient Listening',
  ]);

  const [comment, setComment] = useState<string>('');
  const [beneficiaryType, setBeneficiaryType] = useState<'Patient' | 'ASHA_Worker'>('Patient');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isFeedbackModalOpen || !feedbackTargetSession) return null;

  const RATING_LABELS_HI: Record<number, string> = {
    1: 'असंतोषजनक (Poor)',
    2: 'साधारण (Fair)',
    3: 'ठीक-ठाक (Average)',
    4: 'बहुत अच्छा (Good)',
    5: 'उत्कृष्ट व भरोसेमंद (Excellent & Highly Recommended)',
  };

  const RATING_LABELS_EN: Record<number, string> = {
    1: 'Poor / Needs Improvement',
    2: 'Fair',
    3: 'Average / Acceptable',
    4: 'Good / Satisfactory',
    5: 'Excellent & Highly Recommended',
  };

  const activeOverall = hoveredOverall || overallRating;
  const ratingLabel = isHindi ? RATING_LABELS_HI[activeOverall] : RATING_LABELS_EN[activeOverall];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addFeedback({
      consultationId: feedbackTargetSession.consultationId,
      doctorId: feedbackTargetSession.doctorId,
      doctorName: feedbackTargetSession.doctorName,
      patientId: 'PAT-4011',
      patientName: feedbackTargetSession.patientName,
      ashaName: 'Meena Devi (ASHA)',
      subCentre: feedbackTargetSession.subCentre || 'Primary Health Centre Pipariya',
      overallRating,
      communicationRating,
      networkClarityRating,
      medicineClarityRating,
      tags: selectedTags,
      comment: comment.trim() || undefined,
      beneficiaryType,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto animate-scaleUp">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={closeFeedbackModal}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950 uppercase tracking-wide flex items-center gap-1">
              <Award className="w-3 h-3 text-stone-950" />
              ABDM Quality Assurance
            </span>
            <span className="text-[11px] text-teal-200">National Rural Telehealth Mission</span>
          </div>

          <h2 className="text-lg sm:text-xl font-black">
            {isHindi ? 'परामर्श संतुष्टि व गुणवत्ता रेटिंग' : 'Consultation Quality & Feedback Rating'}
          </h2>
          <p className="text-xs text-teal-100 mt-0.5">
            Consultation with <strong className="text-white">{feedbackTargetSession.doctorName}</strong> &bull; Patient: {feedbackTargetSession.patientName}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs">
          {/* Submitter Role Toggle */}
          <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
            <span className="font-bold text-stone-700">
              {isHindi ? 'रेटिंग देने वाले:' : 'Feedback Given By:'}
            </span>
            <div className="flex items-center gap-1.5 bg-stone-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setBeneficiaryType('Patient')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  beneficiaryType === 'Patient'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                👤 {isHindi ? 'मरीज (Patient)' : 'Patient'}
              </button>
              <button
                type="button"
                onClick={() => setBeneficiaryType('ASHA_Worker')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  beneficiaryType === 'ASHA_Worker'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                👩‍⚕️ {isHindi ? 'आशा कार्यकर्ता (ASHA)' : 'ASHA Worker'}
              </button>
            </div>
          </div>

          {/* 1. Overall Star Rating */}
          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200 text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
              {isHindi ? 'समग्र टेली-परामर्श अनुभव' : 'Overall Telehealth Experience Rating'}
            </span>

            {/* Stars Row */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  onMouseEnter={() => setHoveredOverall(star)}
                  onMouseLeave={() => setHoveredOverall(null)}
                  className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= activeOverall
                        ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className="text-xs font-bold text-amber-900">{ratingLabel}</p>
          </div>

          {/* 2. Three Rural Quality Dimensions */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-stone-900 block">
              {isHindi ? 'विस्तृत गुणवत्ता मूल्यांकन' : 'Detailed Quality Metrics'}
            </span>

            {/* Dimension A: Doctor Communication & Language */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">
                    {isHindi ? 'डॉक्टर का संवाद व समझाइश' : 'Doctor Communication & Empathy'}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {isHindi ? 'धैर्य से सुना और सरल हिंदी/बोली में समझाया?' : 'Listened patiently in simple local language?'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCommunicationRating(s)}
                    className="p-0.5 cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        s <= communicationRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension B: Audio / Video Clarity (Network Performance) */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">
                    {isHindi ? 'आवाज व वीडियो की स्पष्टता' : 'Audio & Video Connection Clarity'}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {isHindi ? 'आवाज साफ आई? कोई रुकावट या कॉल ड्रॉप?' : 'Clear voice and video without excessive lag?'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNetworkClarityRating(s)}
                    className="p-0.5 cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        s <= networkClarityRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension C: Prescription & Medicine Guidance */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Pill className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">
                    {isHindi ? 'दवाई व खुराक की जानकारी' : 'Medicine & Prescription Clarity'}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {isHindi ? 'दवा लेने का समय व परहेज स्पष्ट था?' : 'Timing, dose, and food instructions clearly explained?'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setMedicineClarityRating(s)}
                    className="p-0.5 cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        s <= medicineClarityRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Rural Quick-Tag Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-900 block">
              {isHindi ? 'त्वरित प्रतिक्रिया टैग (1-क्लिक चुनें)' : 'Quick Feedback Tags (Select All That Apply)'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {RURAL_FEEDBACK_PRESET_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-800 shadow-2xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Written Comments / Note */}
          <div className="space-y-1">
            <label className="font-bold text-stone-800">
              {isHindi ? 'कोई अतिरिक्त टिप्पणी या सुझाव (वैकल्पिक)' : 'Additional Comments or Notes (Optional)'}
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isHindi
                  ? 'जैसे: डॉक्टर साहिबा ने बहुत तसल्ली से समझाया, दवा सब-सेंटर पर मिल गई...'
                  : 'Write any specific experience details, local language understanding, etc...'
              }
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-teal-700 focus:outline-none"
            />
          </div>

          {/* Trust Seal & Submit Button */}
          <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Ayushman Bharat Digital Health Quality Registry</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeFeedbackModal}
                className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold transition-colors cursor-pointer"
              >
                Skip
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isHindi ? 'रेटिंग दर्ज करें' : 'Submit Feedback'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
