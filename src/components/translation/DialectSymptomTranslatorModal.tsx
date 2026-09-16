import { useState } from 'react';
import { RURAL_DIALECT_DICTIONARY, DialectTerm } from '../../data/dialectDictionaryData';
import { speakText, stopSpeech } from '../../utils/speechUtils';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Search,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Stethoscope,
  AlertTriangle,
  Copy,
  Check,
  Filter,
  Layers,
} from 'lucide-react';

interface DialectSymptomTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTermForNotes?: (termText: string) => void;
}

export function DialectSymptomTranslatorModal({
  isOpen,
  onClose,
  onSelectTermForNotes,
}: DialectSymptomTranslatorModalProps) {
  const { language } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<string>('All');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const systems = [
    'All',
    'Cardiology',
    'Neurology',
    'Respiratory',
    'Gastroenterology',
    'Obstetrics',
    'Musculoskeletal',
    'General',
  ];

  const filteredTerms = RURAL_DIALECT_DICTIONARY.filter((term) => {
    if (selectedSystem !== 'All' && term.organSystem !== selectedSystem) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        term.dialectPhrase.toLowerCase().includes(q) ||
        term.standardHindi.toLowerCase().includes(q) ||
        term.clinicalEnglish.toLowerCase().includes(q) ||
        term.bengali.toLowerCase().includes(q) ||
        term.tamil.toLowerCase().includes(q) ||
        term.regionOrDialect.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleSpeak = (term: DialectTerm) => {
    if (playingId === term.id) {
      stopSpeech();
      setPlayingId(null);
      return;
    }

    setPlayingId(term.id);
    const textToSpeak = `${term.dialectPhrase}. अर्थात् ${term.standardHindi}. Clinical: ${term.clinicalEnglish}`;
    speakText(
      textToSpeak,
      'hi',
      () => setPlayingId(term.id),
      () => setPlayingId(null),
      () => setPlayingId(null)
    );
  };

  const handleCopy = (term: DialectTerm) => {
    const text = `Dialect: "${term.dialectPhrase}" | Clinical: ${term.clinicalEnglish} (${term.standardHindi})`;
    navigator.clipboard.writeText(text);
    setCopiedId(term.id);
    setTimeout(() => setCopiedId(null), 2500);

    if (onSelectTermForNotes) {
      onSelectTermForNotes(text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-teal-200">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">ग्रामीण बोली शब्दकोश (Rural Dialect Translator)</h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-teal-300 text-teal-950">
                  Bundeli &bull; Malwi &bull; Bhojpuri &bull; Gramin
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                Bridging patient dialect colloquialisms with medical diagnoses &amp; multi-language terms
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & System Filter Bar */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dialect phrase (e.g. माथो, हिया, छाती, जाड़ा), Hindi, or English symptom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          {/* Organ System Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> System:
            </span>
            {systems.map((sys) => (
              <button
                key={sys}
                onClick={() => setSelectedSystem(sys)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  selectedSystem === sys
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {sys}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-xs font-semibold text-stone-600">No matching dialect phrase found</p>
              <p className="text-[11px]">Try searching &ldquo;माथो&rdquo;, &ldquo;छाती&rdquo;, or &ldquo;सास&rdquo;</p>
            </div>
          ) : (
            filteredTerms.map((term) => {
              const isPlaying = playingId === term.id;
              const isCopied = copiedId === term.id;
              const isRedFlag = term.severityWarning === 'Red_Flag';
              const isUrgent = term.severityWarning === 'Urgent';

              return (
                <div
                  key={term.id}
                  className={`p-4 rounded-2xl border transition-all hover:shadow-sm space-y-2.5 bg-white ${
                    isRedFlag
                      ? 'border-rose-300 bg-rose-50/20'
                      : isUrgent
                      ? 'border-amber-300'
                      : 'border-stone-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-stone-900">
                        &ldquo;{term.dialectPhrase}&rdquo;
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        {term.regionOrDialect}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isRedFlag ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white">
                          <AlertTriangle className="w-3 h-3" /> Red Flag Warning
                        </span>
                      ) : isUrgent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white">
                          Priority Review
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {term.organSystem}
                        </span>
                      )}

                      {/* Audio Pronunciation & Readout */}
                      <button
                        onClick={() => handleSpeak(term)}
                        title="Listen audio explanation"
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isPlaying
                            ? 'bg-teal-700 text-white border-teal-700 animate-pulse'
                            : 'bg-stone-50 hover:bg-stone-100 text-teal-800 border-stone-200'
                        }`}
                      >
                        {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      {/* Copy to Notes */}
                      <button
                        onClick={() => handleCopy(term)}
                        title="Copy to Clinical Notes"
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Clinical Translation Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/80">
                      <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider block">
                        Clinical English Diagnosis:
                      </span>
                      <strong className="text-teal-950 font-bold text-xs">{term.clinicalEnglish}</strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Standard Hindi (मानक हिंदी):
                      </span>
                      <span className="text-stone-800 font-semibold text-xs">{term.standardHindi}</span>
                    </div>
                  </div>

                  {/* Multi-language regional translations */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-600 pt-1">
                    <span>
                      <strong className="text-stone-800 font-semibold">বাংলা:</strong> {term.bengali}
                    </span>
                    <span>&bull;</span>
                    <span>
                      <strong className="text-stone-800 font-semibold">தமிழ்:</strong> {term.tamil}
                    </span>
                  </div>

                  {/* Doctor Clinical Guide */}
                  <p className="text-[11px] text-stone-500 italic bg-stone-50/50 p-2 rounded-lg border border-stone-100 leading-relaxed">
                    💡 <strong>Clinical Guidance:</strong> {term.clinicalExplanation}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 p-4 border-t border-stone-200 flex items-center justify-between text-xs shrink-0">
          <div className="text-stone-500 text-[11px]">
            Showing <strong>{filteredTerms.length}</strong> verified rural medical dialect entries
          </div>
          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer"
          >
            Close Dictionary
          </button>
        </div>
      </div>
    </div>
  );
}
