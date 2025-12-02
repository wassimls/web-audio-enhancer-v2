import './Header.css';
import './LanguageToggle.css';
import { useLanguage } from '../locales/LanguageContext';

function Header({ darkMode, onToggleDarkMode }) {
    const { language, toggleLanguage, t } = useLanguage();

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-left">
                    <div className="logo">
                        <i className="fas fa-wave-square"></i>
                        <span className="logo-text">{t('header.title')}</span>
                        <span className="badge badge-primary">{t('header.version')}</span>
                    </div>
                </div>

                <div className="header-center">
                    <h1 className="header-title">{t('header.subtitle')}</h1>
                </div>

                <div className="header-right">
                    <button
                        className="btn btn-icon btn-secondary language-toggle"
                        onClick={toggleLanguage}
                        title={language === 'ar' ? 'English' : 'العربية'}
                    >
                        <span className="lang-text">{language === 'ar' ? 'EN' : 'ع'}</span>
                    </button>
                    <button
                        className="btn btn-icon btn-secondary theme-toggle"
                        onClick={onToggleDarkMode}
                        title={darkMode ? 'Light Mode' : 'Dark Mode'}
                    >
                        <i className={darkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
                    </button>
                    <button className="btn btn-icon btn-secondary">
                        <i className="fas fa-cog"></i>
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
