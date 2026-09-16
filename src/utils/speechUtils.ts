import { LanguageCode } from '../types';

/**
 * Robust Web Speech API Text-to-Speech (TTS) engine for rural healthcare.
 * Provides voice readouts in Hindi, Bengali, Tamil, and Indian English.
 */

export const isSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

export const stopSpeech = (): void => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};

export const speakText = (
  text: string,
  lang: LanguageCode | 'dialect',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): void => {
  if (!isSpeechSupported()) {
    console.warn('SpeechSynthesis is not supported in this browser environment.');
    if (onError) onError('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Map language codes to BCP 47 tags with Indian localization
  switch (lang) {
    case 'hi':
    case 'dialect':
      utterance.lang = 'hi-IN';
      break;
    case 'bn':
      utterance.lang = 'bn-IN';
      break;
    case 'ta':
      utterance.lang = 'ta-IN';
      break;
    case 'en':
    default:
      utterance.lang = 'en-IN';
      break;
  }

  // Tune pitch and rate for clear, calm medical instruction delivery
  utterance.rate = 0.9; // slightly slower for better rural comprehension
  utterance.pitch = 1.0;

  // Try to pick a native voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.startsWith(utterance.lang.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = (e) => {
    console.warn('Speech synthesis playback note:', e);
    if (onEnd) onEnd();
    if (onError) onError(e);
  };

  window.speechSynthesis.speak(utterance);
};
