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

  // ✅ t() function se language auto change hogi
  const navButtons = [
    { key: 'home', label: `🏠 ${t('nav_home')}`, color: '#667eea' },
    { key: 'data-entry', label: `📊 ${t('nav_data')}`, color: '#007bff' },
    { key: 'scan', label: `🔍 ${t('nav_scan')}`, color: '#17a2b8' },
    { key: 'dashboard', label: `📈 ${t('nav_dashboard')}`, color: '#28a745' },
    { key: 'health-score', label: `❤️ ${t('nav_score')}`, color: '#e91e63' },
    { key: 'hidden-hunger', label: `🧬 ${t('nav_hidden_hunger')}`, color: '#9c27b0' },
    { key: 'womb-to-world', label: `🤰 ${t('nav_womb_to_world')}`, color: '#e91e63' },
    { key: 'diet-plan', label: `🍽️ ${t('nav_diet')}`, color: '#fd7e14' },
    { key: 'hospital', label: `🏥 ${t('nav_hospital')}`, color: '#dc3545' },
    { key: 'alerts', label: `🚨 ${t('nav_alerts')}`, color: '#6f42c1' },
    { key: 'report', label: `📄 ${t('nav_report')}`, color: '#6610f2' },
  ];

  // ✅ homeCards bhi t() se
  const homeCards = [
    { key: 'data-entry', icon: '📊', title: t('nav_data'), desc: t('home_data_desc'), color: '#007bff' },
    { key: 'scan', icon: '🔍', title: t('nav_scan'), desc: t('home_scan_desc'), color: '#17a2b8' },
    { key: 'hidden-hunger', icon: '🧬', title: t('nav_hidden_hunger'), desc: t('home_hidden_hunger_desc'), color: '#9c27b0' },
    { key: 'womb-to-world', icon: '🤰', title: t('nav_womb_to_world'), desc: t('home_womb_to_world_desc'), color: '#e91e63' },
    { key: 'dashboard', icon: '📈', title: t('nav_dashboard'), desc: t('home_dashboard_desc'), color: '#28a745' },
    { key: 'health-score', icon: '❤️', title: t('nav_score'), desc: t('home_score_desc'), color: '#e91e63' },
    { key: 'diet-plan', icon: '🍽️', title: t('nav_diet'), desc: t('home_diet_desc'), color: '#fd7e14' },
    { key: 'hospital', icon: '🏥', title: t('nav_hospital'), desc: t('home_hospital_desc'), color: '#dc3545' },
  ];

  // ✅ Growth table data t() se
  const growthData = [
    { age: t('year_1'), w: '8-10 kg', h: '70-80 cm', m: '> 12.5 cm' },
    { age: t('year_2'), w: '10-12 kg', h: '80-90 cm', m: '> 12.5 cm' },
    { age: t('year_3'), w: '12-14 kg', h: '90-100 cm', m: '> 13 cm' },
    { age: t('year_4'), w: '14-16 kg', h: '100-110 cm', m: '> 13.5 cm' },
    { age: t('year_5'), w: '16-18 kg', h: '105-115 cm', m: '> 13.5 cm' },
  ];

  return (
    <div className="App">
      {/* HEADER */}
      <header className="app-header">
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 15px'
        }}>
          <div onClick={() => handlePageChange('home')} style={{ cursor: 'pointer' }}>
            <h1 style={{ fontSize: '22px', margin: 0 }}>🏥 {t('app_title')}</h1>
            <p style={{ fontSize: '12px', opacity: 0.9, margin: '4px 0 0 0' }}>{t('app_subtitle')}</p>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.5)',
                color: 'white', padding: '10px 14px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '20px', transition: 'all 0.3s',
                transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)'
              }}
            >
              ☰
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', top: '50px', right: '0',
                background: 'white', borderRadius: '12px', padding: '20px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.25)', zIndex: 1001,
                minWidth: '320px', maxHeight: '80vh', overflowY: 'auto'
              }}>
                {/* Language Section */}
                <h4 style={{
                  color: '#333', marginBottom: '12px',
                  borderBottom: '2px solid #667eea',
                  paddingBottom: '8px', marginTop: 0
                }}>
                  🌐 {t('language')}
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  {Object.entries(TRANSLATIONS).map(([code, langData]) => (
                    <button
                      key={code}
                      onClick={() => changeLang(code)}
                      style={{
                        padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                        border: lang === code ? '2px solid #667eea' : '1px solid #ddd',
                        background: lang === code ? '#667eea' : 'white',
                        color: lang === code ? 'white' : '#333',
                        fontSize: '13px', fontWeight: lang === code ? 'bold' : 'normal'
                      }}
                    >
                      {langData.flag} {langData.name}
                    </button>
                  ))}
                </div>

                {/* Voice Section */}
                <h4 style={{
                  color: '#333', marginBottom: '12px',
                  borderBottom: '2px solid #667eea', paddingBottom: '8px'
                }}>
                  🔊 {t('voice')}
                </h4>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                  <select
                    value={voiceGender}
                    onChange={(e) => setVoiceGender(e.target.value)}
                    style={{
                      padding: '10px', borderRadius: '8px',
                      border: '1px solid #ddd', fontSize: '14px',
                      flex: 1, minWidth: '100px'
                    }}
                  >
                    <option value="female">👩 {t('voice_female')}</option>
                    <option value="male">👨 {t('voice_male')}</option>
                  </select>

                  <button
                    onClick={isSpeaking ? stopSpeaking : speakPage}
                    style={{
                      padding: '10px 16px',
                      background: isSpeaking ? '#dc3545' : '#28a745',
                      color: 'white', border: 'none', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '14px',
                      fontWeight: 'bold', flex: 1, minWidth: '100px'
                    }}
                  >
                    {isSpeaking ? `⏹️ ${t('voice_stop')}` : `🔊 ${t('voice_speak')}`}
                  </button>
                </div>

                {/* User Section */}
                {userId && (
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '10px' }}>
                    <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>
                      👤 User ID: <strong>{userId}</strong>
                    </p>
                    <button
                      onClick={handleLogout}
                      style={{
                        padding: '12px 20px', background: '#dc3545',
                        color: 'white', border: 'none', borderRadius: '8px',
                        cursor: 'pointer', fontSize: '14px',
                        width: '100%', fontWeight: 'bold'
                      }}
                    >
                      🚪 {t('logout')}
                    </button>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{
                    marginTop: '15px', padding: '10px', width: '100%',
                    background: '#f8f9fa', border: '1px solid #ddd',
                    borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
                  }}
                >
                  ✕ {t('close')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100%', height: '100%',
            zIndex: 1000, background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* MAIN */}
      <main
        className="app-main"
        style={{
          opacity: pageLoading ? 0.7 : 1,
          transition: 'opacity 0.3s',
          minHeight: 'calc(100vh - 200px)'
        }}
      >
        {!userId ? (
          <UserRegistration onSuccess={handleUserRegistered} />
        ) : (
          <>
            {/* NAV BUTTONS */}
            <nav className="nav-buttons" style={{
              display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '15px',
              background: '#f8f9fa', borderRadius: '12px',
              marginBottom: '20px', justifyContent: 'center'
            }}>
              {navButtons.map(btn => (
                <button
                  key={btn.key}
                  onClick={() => handlePageChange(btn.key)}
                  style={{
                    padding: '10px 16px',
                    border: currentPage === btn.key ? 'none' : '1px solid #e0e0e0',
                    background: currentPage === btn.key ? btn.color : '#fff',
                    color: currentPage === btn.key ? 'white' : '#333',
                    borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: '13px',
                    boxShadow: currentPage === btn.key
                      ? `0 4px 15px ${btn.color}50`
                      : '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </nav>

            {/* PAGE CONTENT */}
            <div className="page-content">

              {/* HOME PAGE */}
              {currentPage === 'home' && (
                <div className="home-page">
                  <h2 style={{ textAlign: 'center', color: '#333' }}>
                    👋 {t('home_title')}
                  </h2>
                  <p style={{ textAlign: 'center', color: '#666', marginBottom: '25px' }}>
                    {t('home_subtitle')}
                  </p>

                  {/* 3 Unique Modules Banner */}
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    padding: '25px', borderRadius: '16px', color: 'white',
                    marginBottom: '25px', textAlign: 'center',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                  }}>
                    <h3 style={{ fontSize: '22px', marginBottom: '15px', marginTop: 0 }}>
                      ✨ {t('unique_modules')}
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '12px'
                    }}>
                      {[
                        {
                          icon: '🧬',
                          title: t('nav_hidden_hunger'),
                          desc: t('home_hidden_hunger_desc')
                        },
                        {
                          icon: '📊',
                          title: 'ASHA Saathi',
                          desc: 'WHO Z-score + AI'
                        },
                        {
                          icon: '🤰',
                          title: t('nav_womb_to_world'),
                          desc: t('home_womb_to_world_desc')
                        }
                      ].map((item, i) => (
                        <div key={i} style={{
                          background: 'rgba(255,255,255,0.15)',
                          padding: '18px', borderRadius: '12px'
                        }}>
                          <p style={{ fontSize: '28px', margin: '0 0 8px 0' }}>{item.icon}</p>
                          <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
                            {item.title}
                          </p>
                          <p style={{ fontSize: '11px', opacity: 0.9, margin: 0 }}>
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Growth Table */}
                  <div style={{
                    background: '#fff', padding: '20px', borderRadius: '12px',
                    marginBottom: '25px', border: '2px solid #667eea',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)', overflowX: 'auto'
                  }}>
                    <h3 style={{ color: '#667eea', marginTop: 0 }}>
                      📊 {t('growth_title')}
                    </h3>
                    <table style={{
                      width: '100%', borderCollapse: 'collapse', minWidth: '400px'
                    }}>
                      <thead>
                        <tr style={{ background: '#667eea', color: 'white' }}>
                          <th style={{ padding: '12px', textAlign: 'center' }}>{t('growth_age')}</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>{t('growth_normal_weight')}</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>{t('growth_normal_height')}</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>MUAC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {growthData.map((row, i) => (
                          <tr key={i} style={{
                            borderBottom: '1px solid #eee',
                            background: i % 2 === 0 ? '#f8f9fa' : 'white'
                          }}>
                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                              {row.age}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{row.w}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{row.h}</td>
                            <td style={{ padding: '12px', textAlign: 'center', color: '#28a745', fontWeight: 'bold' }}>
                              {row.m}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Home Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '15px'
                  }}>
                    {homeCards.map(card => (
                      <div
                        key={card.key}
                        onClick={() => handlePageChange(card.key)}
                        style={{
                          background: 'white', padding: '20px', borderRadius: '12px',
                          cursor: 'pointer', textAlign: 'center',
                          border: `2px solid ${card.color}`,
                          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s'
                        }}
                      >
                        <p style={{ fontSize: '36px', margin: '0 0 12px 0' }}>{card.icon}</p>
                        <p style={{ fontWeight: 'bold', fontSize: '15px', margin: '0 0 8px 0', color: '#333' }}>
                          {card.title}
                        </p>
                        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                          {card.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentPage === 'data-entry' && <DataEntry userId={userId} lang={lang} />}
              {currentPage === 'scan' && <ScanPage userId={userId} lang={lang} />}
              {currentPage === 'dashboard' && <Dashboard userId={userId} lang={lang} />}
              {currentPage === 'health-score' && <HealthScore userId={userId} lang={lang} />}
              {currentPage === 'hidden-hunger' && <HiddenHunger userId={userId} lang={lang} />}
              {currentPage === 'womb-to-world' && <WombToWorld userId={userId} lang={lang} />}
              {currentPage === 'diet-plan' && <DietPlan userId={userId} lang={lang} />}
              {currentPage === 'hospital' && <HospitalFinder userId={userId} lang={lang} />}
              {currentPage === 'alerts' && <AlertSystem userId={userId} lang={lang} />}
              {currentPage === 'report' && <ReportExport userId={userId} lang={lang} />}
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{
        textAlign: 'center', padding: '25px 15px',
        background: 'linear-gradient(135deg, #333, #555)',
        color: 'white', marginTop: '40px', fontSize: '13px'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>{t('footer_line1')}</p>
        <p style={{ margin: 0, opacity: 0.8 }}>{t('footer_line2')}</p>
        <p style={{ margin: '10px 0 0 0', fontSize: '11px', opacity: 0.6 }}>
          Made with ❤️ for Child Nutrition
        </p>
      </footer>

      {userId && <FloatingChatbot />}
    </div>
  );
}

export default App;