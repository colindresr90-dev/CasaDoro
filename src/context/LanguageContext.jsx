import React, { createContext, useState, useContext } from 'react';
import { translations } from '../translations/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'es';
  });

  const setLanguage = (lang) => {
    if (lang === 'es' || lang === 'en') {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
    }
  };

  const t = (key, section) => {
    const activeDict = translations[language] || translations['es'];
    if (section) {
      return activeDict[section]?.[key] || translations['es'][section]?.[key] || key;
    }
    return activeDict[key] || translations['es'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: translations[language] || translations['es'] }}>
      {children}
    </LanguageContext.Provider>
  );
};
