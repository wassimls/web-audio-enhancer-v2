import { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en';
import { ar } from './ar';

const LanguageContext = createContext();

const translations = {
    en,
    ar
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        // Load from localStorage or default to Arabic
        const saved = localStorage.getItem('language');
        return saved || 'ar';
    });

    useEffect(() => {
        // Save to localStorage
        localStorage.setItem('language', language);

        // Update document direction
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            value = value?.[k];
        }

        return value || key;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
