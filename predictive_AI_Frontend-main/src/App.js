import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { useLang } from './LanguageContext';
import TRANSLATIONS from './translations';
import UserRegistration from './pages/UserRegistration';
import DataEntry from './pages/DataEntry';
import Dashboard from './pages/Dashboard';
import DietPlan from './pages/DietPlan';
import HospitalFinder from './pages/HospitalFinder';
import AlertSystem from './pages/AlertSystem';
import ScanPage from './pages/ScanPage';
import ReportExport from './pages/ReportExport';
import HealthScore from './pages/HealthScore';
import FloatingChatbot from './pages/FloatingChatbot';
import HiddenHunger from './pages/HiddenHunger';
import WombToWorld from './pages/WombToWorld';

const API_URL = process.env.REACT_APP_API_URL || 'https://poshan-drishti-8asu.onrender.com';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [currentPage, setCurrentPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const { lang, changeLang, t, speak, stopSpeaking, isSpeaking, voiceGender, setVoiceGender } = useLang();

  const handleUserRegistered = useCallback((id) => {
    setUserId(id);
    localStorage.setItem('userId', id);
    setCurrentPage('home');
  }, []);

  const handleLogout = useCallback(() => {
    setUserId(null);
    localStorage.removeItem('userId');
    setCurrentPage('home');
  }, []);

  const handlePageChange = useCallback((page) => {
    setPageLoading(true);
    setCurrentPage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setPageLoading(false), 300);
  }, []);

  const speakPage = useCallback(() => {
    const pageText = document.querySelector('.app-main')?.innerText || '';
    speak(pageText.substring(0, 500));
  }, [speak]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const navButtons = [
    { key: 'home', label: t('nav_home'), icon: '🏠' },
    { key: 'data-entry', label: t('nav_data'), icon: '📊' },
    { key: 'scan', label: t('nav_scan'), icon: '🔍' },
    { key: 'dashboard', label: t('nav_dashboard'), icon: '📈' },
    { key: 'health-score', label: t('nav_score'), icon: '❤️' },
    { key: 'hidden-hunger', label: t('nav_hidden_hunger'), icon: '🧬' },
    { key: 'womb-to-world', label: t('nav_womb_to_world'), icon: '🤰' },
    { key: 'diet-plan', label: t('nav_diet'), icon: '🍽️' },
    { key: 'hospital', label: t('nav_hospital'), icon: '🏥' },
    { key: 'alerts', label: t('nav_alerts'), icon: '🚨' },
    { key: 'report', label: t('nav_report'), icon: '📄' },
  ];

  const homeCards = [
    { key: 'data-entry', icon: '📊', title: t('nav_data'), desc: t('home_data_desc') },
    { key: 'scan', icon: '🔍', title: t('nav_scan'), desc: t('home_scan_desc') },
    { key: 'hidden-hunger', icon: '🧬', title: t('nav_hidden_hunger'), desc: t('home_hidden_hunger_desc') },
    { key: 'womb-to-world', icon: '🤰', title: t('nav_womb_to_world'), desc: t('home_womb_to_world_desc') },
    { key: 'dashboard', icon: '📈', title: t('nav_dashboard'), desc: t('home_dashboard_desc') },
    { key: 'health-score', icon: '❤️', title: t('nav_score'), desc: t('home_score_desc') },
    { key: 'diet-plan', icon: '🍽️', title: t('nav_diet'), desc: t('home_diet_desc') },
    { key: 'hospital', icon: '🏥', title: t('nav_hospital'), desc: t('home_hospital_desc') },
  ];

  const growthData = [
    { age: t('year_1'), w: '8-10 kg', h: '70-80 cm', m: '> 12.5 cm' },
    { age: t('year_2'), w: '10-12 kg', h: '80-90 cm', m: '> 12.5 cm' },
    { age: t('year_3'), w: '12-14 kg', h: '90-100 cm', m: '> 13 cm' },
    { age: t('year_4'), w: '14-16 kg', h: '100-110 cm', m: '> 13.5 cm' },
    { age: t('year_5'), w: '16-18 kg', h: '105-115 cm', m: '> 13.5 cm' },
  ];

  return (
    <div className="App">
      <header className="app-header-container">
        <div className="app-header-inner">
          <div className="app-logo" onClick={() => handlePageChange('home')}>
            <span className="app-logo-icon">🏥</span>
            <div>
              <h1 className="app-title">{t('app_title')}</h1>
              <p className="app-subtitle">{t('app_subtitle')}</p>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
              ☰
            </button>

            {menuOpen && (
              <div className="menu-drawer">
                <h4 className="drawer-section-title">🌐 {t('language')}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {Object.entries(TRANSLATIONS).map(([code, langData]) => (
                    <button
                      key={code}
                      onClick={() => changeLang(code)}
                      className={`lang-btn ${lang === code ? 'active' : ''}`}
                    >
                      <span style={{ marginRight: '6px' }}>{langData.flag}</span> {langData.name}
                    </button>
                  ))}
                </div>

                <h4 className="drawer-section-title">🔊 {t('voice')}</h4>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <select
                    value={voiceGender}
                    onChange={(e) => setVoiceGender(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="female">👩 {t('voice_female')}</option>
                    <option value="male">👨 {t('voice_male')}</option>
                  </select>

                  <button
                    onClick={isSpeaking ? stopSpeaking : speakPage}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                      background: isSpeaking ? 'var(--danger)' : 'var(--success)', color: 'white',
                      fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    {isSpeaking ? `⏹️ ${t('voice_stop')}` : `🔊 ${t('voice_speak')}`}
                  </button>
                </div>

                {userId && (
                  <>
                    <h4 className="drawer-section-title">👤 Account</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      ID: <strong>{userId}</strong>
                    </p>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                        background: 'var(--danger)', color: 'white', fontWeight: 'bold', cursor: 'pointer'
                      }}
                    >
                      🚪 {t('logout')}
                    </button>
                  </>
                )}

                <button className="close-btn" onClick={() => setMenuOpen(false)}>
                  ✕ {t('close')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: 1000, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)'
          }}
        />
      )}

      <main className="app-main" style={{ opacity: pageLoading ? 0.6 : 1, transition: 'opacity 0.3s' }}>
        {!userId ? (
          <UserRegistration onSuccess={handleUserRegistered} apiUrl={API_URL} />
        ) : (
          <>
            <nav className="nav-buttons-container">
              {navButtons.map(btn => (
                <button
                  key={btn.key}
                  onClick={() => handlePageChange(btn.key)}
                  className={`nav-pill ${currentPage === btn.key ? 'active' : ''}`}
                >
                  <span>{btn.icon}</span> {btn.label}
                </button>
              ))}
            </nav>

            <div className="page-content">
              {currentPage === 'home' && (
                <div className="home-view">
                  <div className="home-hero">
                    <h2>👋 {t('home_title')}</h2>
                    <p>{t('home_subtitle')}</p>
                  </div>

                  <div className="bento-banner">
                    <h3>✨ {t('unique_modules')}</h3>
                    <div className="bento-grid-3">
                      <div className="bento-card-glass">
                        <span className="icon">🧬</span>
                        <h4>{t('nav_hidden_hunger')}</h4>
                        <p>{t('home_hidden_hunger_desc')}</p>
                      </div>
                      <div className="bento-card-glass">
                        <span className="icon">📊</span>
                        <h4>ASHA Saathi</h4>
                        <p>WHO Z-score + AI Analysis</p>
                      </div>
                      <div className="bento-card-glass">
                        <span className="icon">🤰</span>
                        <h4>{t('nav_womb_to_world')}</h4>
                        <p>{t('home_womb_to_world_desc')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="table-container">
                    <h3>📊 {t('growth_title')}</h3>
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>{t('growth_age')}</th>
                          <th>{t('growth_normal_weight')}</th>
                          <th>{t('growth_normal_height')}</th>
                          <th>MUAC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {growthData.map((row, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{row.age}</td>
                            <td>{row.w}</td>
                            <td>{row.h}</td>
                            <td className="highlight">{row.m}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="features-grid">
                    {homeCards.map(card => (
                      <div
                        key={card.key}
                        onClick={() => handlePageChange(card.key)}
                        className="feature-card"
                      >
                        <span className="icon">{card.icon}</span>
                        <h4>{card.title}</h4>
                        <p>{card.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentPage === 'data-entry' && <div className="premium-form-container"><DataEntry userId={userId} lang={lang} apiUrl={API_URL} /></div>}
              {currentPage === 'scan' && <div className="premium-form-container"><ScanPage userId={userId} lang={lang} apiUrl={API_URL} /></div>}
              {currentPage === 'dashboard' && <div className="premium-form-container"><Dashboard userId={userId} lang={lang} apiUrl={API_URL} /></div>}
              {currentPage === 'health-score' && <div className="premium-form-container"><HealthScore userId={userId} lang={lang} apiUrl={API_URL} /></div>}
              {currentPage === 'hidden-hunger' && <div className="premium-form-container"><HiddenHunger userId={userId} lang={lang} apiUrl={API_URL} /></div>}
              {currentPage === 'womb-to-world' && <div className="premium-form-container"><WombToWorld userId={userId} lang={lang} apiUrl={API_URL} /></div>}
              {currentPage === 'diet-plan' && <div className="premium-form-container"><DietPlan userId={userId} lang={lang} apiUrl={API_URL} /></div>}
              {currentPage === 'hospital' && <div className="premium-form-container"><HospitalFinder userId={userId} lang={lang} apiUrl={API_URL} /></div>}
              {currentPage === 'alerts' && <div className="premium-form-container"><AlertSystem userId={userId} lang={lang} apiUrl={API_URL} /></div>}
              {currentPage === 'report' && <div className="premium-form-container"><ReportExport userId={userId} lang={lang} apiUrl={API_URL} /></div>}
            </div>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>{t('footer_line1')}</p>
        <p>{t('footer_line2')}</p>
        <p className="made-with">Made with ❤️ for Child Nutrition</p>
      </footer>

      {userId && <FloatingChatbot apiUrl={API_URL} />}
    </div>
  );
}

export default App;
