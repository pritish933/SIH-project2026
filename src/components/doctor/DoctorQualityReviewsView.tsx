import { useState } from 'react';
import { DoctorQualityMetrics, ConsultationFeedback, User } from '../../types';
import {
  Star,
  Award,
  MessageSquare,
  Radio,
  Pill,
  CheckCircle2,
  Filter,
  UserCheck,
  Building,
  Calendar,
  Sparkles,
  ShieldCheck,
  ThumbsUp,
} from 'lucide-react';

interface DoctorQualityReviewsViewProps {
  qualityMetrics: DoctorQualityMetrics;
  currentUser: User;
}

export function DoctorQualityReviewsView({
  qualityMetrics,
  currentUser,
}: DoctorQualityReviewsViewProps) {
  const [filterType, setFilterType] = useState<'All' | 'Patient' | 'ASHA_Worker'>('All');

  const filteredReviews = qualityMetrics.recentReviews.filter((r) => {
    if (filterType === 'All') return true;
    return r.beneficiaryType === filterType;
  });

  const patientReviewsCount = qualityMetrics.recentReviews.filter(
    (r) => r.beneficiaryType === 'Patient'
  ).length;

  const ashaReviewsCount = qualityMetrics.recentReviews.filter(
    (r) => r.beneficiaryType === 'ASHA_Worker'
  ).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Hero Quality Score & National Telehealth Standard Card */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-stone-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Overall Star Badge */}
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-3xl bg-amber-500/20 border-2 border-amber-400/40 flex flex-col items-center justify-center text-center p-2 shrink-0 shadow-inner">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
                {qualityMetrics.averageRating}
              </span>
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3 text-stone-950" />
                  National Tele-OPD Quality Index
                </span>
                <span className="text-xs text-teal-300 font-medium">ABDM Tier-1 Rating</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Teleconsultation Service Score: {currentUser.name}
              </h2>
              <p className="text-xs text-stone-300">
                Aggregated from <strong className="text-white font-mono">{qualityMetrics.totalReviews}</strong> verified consultations across rural Sub-Centres &amp; PHCs.
              </p>
            </div>
          </div>

          {/* Right: Dimensional Progress Bars */}
          <div className="bg-stone-950/60 p-4 sm:p-5 rounded-2xl border border-stone-800 w-full lg:max-w-md space-y-3 text-xs">
            {/* Metric 1: Communication */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-stone-300 font-medium">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                  <span>Communication &amp; Hindi Dialect Empathy</span>
                </span>
                <span className="font-bold text-teal-400 font-mono">
                  {qualityMetrics.communicationPercentage}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${qualityMetrics.communicationPercentage}%` }}
                />
              </div>
            </div>

            {/* Metric 2: Network Clarity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-stone-300 font-medium">
                  <Radio className="w-3.5 h-3.5 text-blue-400" />
                  <span>Audio &amp; Video Clarity (2G Adaptive)</span>
                </span>
                <span className="font-bold text-blue-400 font-mono">
                  {qualityMetrics.networkClarityPercentage}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${qualityMetrics.networkClarityPercentage}%` }}
                />
              </div>
            </div>

            {/* Metric 3: Medicine Clarity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-stone-300 font-medium">
                  <Pill className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Prescription &amp; Dosage Comprehension</span>
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  {qualityMetrics.medicineClarityPercentage}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${qualityMetrics.medicineClarityPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Feedback Tags Row */}
        <div className="mt-5 pt-4 border-t border-stone-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-400 font-medium mr-1">Beneficiary Praise:</span>
          {qualityMetrics.topTags.map(({ tag, count }) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-xl bg-white/10 text-stone-200 border border-white/15 text-[11px] font-medium flex items-center gap-1"
            >
              <span>{tag}</span>
              <span className="font-bold text-amber-300 font-mono">({count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* 2. Reviews Header & Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
        <div>
          <h3 className="text-base font-bold text-stone-900">
            Rural Patient &amp; ASHA Worker Feedback Log
          </h3>
          <p className="text-xs text-stone-500">
            Real-time quality assessments submitted after live telehealth sessions
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs bg-stone-100 p-1 rounded-2xl border border-stone-200 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setFilterType('All')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterType === 'All'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Reviews ({qualityMetrics.recentReviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('Patient')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterType === 'Patient'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Patients ({patientReviewsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('ASHA_Worker')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterType === 'ASHA_Worker'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            ASHA Workers ({ashaReviewsCount})
          </button>
        </div>
      </div>

      {/* 3. Feedbacks List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((review) => {
          const isPatient = review.beneficiaryType === 'Patient';

          return (
            <div
              key={review.id}
              className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3.5 hover:border-stone-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Review Header: User & Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isPatient
                          ? 'bg-teal-100 text-teal-900 border border-teal-200'
                          : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                      }`}
                    >
                      {isPatient ? '👤' : '👩‍⚕️'}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-stone-900 text-sm">
                          {review.patientName}
                        </h4>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            isPatient
                              ? 'bg-teal-50 text-teal-800 border border-teal-200'
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          }`}
                        >
                          {isPatient ? 'Beneficiary' : 'ASHA Assisted'}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1">
                        <Building className="w-3 h-3 text-stone-400" />
                        <span className="truncate max-w-[200px]">{review.subCentre}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stars badge */}
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200 shrink-0">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-xs text-amber-900 font-mono">
                      {review.overallRating}.0
                    </span>
                  </div>
                </div>

                {/* Dimensional Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                    🗣️ Comm: <strong>{review.communicationRating}/5</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                    📶 Network: <strong>{review.networkClarityRating}/5</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                    💊 Rx Clarity: <strong>{review.medicineClarityRating}/5</strong>
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {review.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-100 text-[10px] font-semibold"
                    >
                      ✓ {t}
                    </span>
                  ))}
                </div>

                {/* Comment Text */}
                {review.comment && (
                  <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-2xl border border-stone-200/80 italic leading-relaxed">
                    "{review.comment}"
                  </p>
                )}
              </div>

              {/* Card Footer: Date & Token ID */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1 font-mono">
                  Session: {review.consultationId}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  {review.date}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReviews.length === 0 && (
        <div className="p-12 text-center text-stone-500 bg-white rounded-3xl border border-stone-200 space-y-2">
          <MessageSquare className="w-10 h-10 text-stone-400 mx-auto" />
          <p className="font-semibold text-sm">No feedback reviews in this category yet.</p>
        </div>
      )}
    </div>
  );
}
