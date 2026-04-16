import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import TRANSLATIONS from './translations';

export const LanguageContext = createContext();

const removeEmojis = (text) => {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
    .replace(/[\u{200D}]/gu, '')
    .replace(/[\u{20E3}]/gu, '')
    .replace(/[\u{E0020}-\u{E007F}]/gu, '')
    .replace(/[☰✕✅❌⚖️📏🎂👶💧🩸📊🔍📈❤️🍽️🏥🚨📄🏠📋🔊⏹️🌐👩👨🚪👋📐🔵🟢🟡🟠🔴⚠️💡🔄]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('hi');
  const [voiceGender, setVoiceGender] = useState('female');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const langToSpeechCode = {
    hi: 'hi-IN', en: 'en-US', bn: 'bn-IN', te: 'te-IN',
    ta: 'ta-IN', mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN',
    ml: 'ml-IN', pa: 'pa-IN', ur: 'ur-IN', od: 'or-IN', as: 'as-IN',
  };

  const getBestVoice = useCallback((langCode, gender) => {
    const voices = window.speechSynthesis.getVoices();
    const speechCode = langToSpeechCode[langCode] || 'hi-IN';
    const langPrefix = speechCode.split('-')[0];

    let matchingVoices = voices.filter(v => v.lang.startsWith(langPrefix));
    if (matchingVoices.length === 0) {
      matchingVoices = voices.filter(v => v.lang.includes(langPrefix));
    }
    if (matchingVoices.length === 0) return null;

    if (gender === 'female') {
      const femaleVoice = matchingVoices.find(v =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes('mahila') ||
        v.name.toLowerCase().includes('lekha') ||
        v.name.toLowerCase().includes('aditi')
      );
      return femaleVoice || matchingVoices[0];
    } else {
      const maleVoice = matchingVoices.find(v =>
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('man') ||
        v.name.toLowerCase().includes('purush') ||
        v.name.toLowerCase().includes('ravi')
      );
      return maleVoice || matchingVoices[1] || matchingVoices[0];
    }
  }, []);

  const changeLang = (langCode) => {
    setLanguage(langCode);
  };

  const speak = useCallback((text) => {
    if (!text || text.trim() === '') return;
    window.speechSynthesis.cancel();
    const cleanText = removeEmojis(text);
    if (!cleanText || cleanText.trim() === '') return;

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current = utterance;
      const speechCode = langToSpeechCode[language] || 'hi-IN';
      utterance.lang = speechCode;
      utterance.rate = 0.5;
      utterance.pitch = voiceGender === 'female' ? 1.1 : 0.8;
      utterance.volume = 1.0;

      const bestVoice = getBestVoice(language, voiceGender);
      if (bestVoice) utterance.voice = bestVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }, 100);
  }, [language, voiceGender, getBestVoice]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const t = useCallback((key) => {
    if (TRANSLATIONS[language] && TRANSLATIONS[language][key]) {
      return TRANSLATIONS[language][key];
    }
    if (TRANSLATIONS['hi'] && TRANSLATIONS['hi'][key]) {
      return TRANSLATIONS['hi'][key];
    }
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
      return TRANSLATIONS['en'][key];
    }
    return key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{
      lang: language,
      changeLang,
      t,
      speak,
      stopSpeaking,
      isSpeaking,
      voiceGender,
      setVoiceGender
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within LanguageProvider');
  return context;
};