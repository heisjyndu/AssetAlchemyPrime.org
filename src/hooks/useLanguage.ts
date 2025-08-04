import { useState, useEffect } from 'react';
import { Language } from '../data/mockData';
import { supportedLanguages } from '../data/mockData';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(supportedLanguages[0]);

  useEffect(() => {
    const stored = localStorage.getItem('language');
    if (stored) {
      const lang = supportedLanguages.find(l => l.code === stored);
      if (lang) setCurrentLanguage(lang);
    }
  }, []);

  const changeLanguage = (languageCode: string) => {
    const language = supportedLanguages.find(l => l.code === languageCode);
    if (language) {
      setCurrentLanguage(language);
      localStorage.setItem('language', languageCode);
      document.documentElement.dir = language.isRTL ? 'rtl' : 'ltr';
    }
  };

  return { currentLanguage, changeLanguage, supportedLanguages };
};