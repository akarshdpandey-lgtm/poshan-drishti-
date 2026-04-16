import React, { useState } from 'react';
import { useLang } from '../LanguageContext';

function HospitalFinderLocalized() {
  const { t, lang } = useLang();
  const [manualLocation, setManualLocation] = useState('');

  const openSearch = (query) => {
    const q = manualLocation.trim() || query;
    if (!q) return;
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}`, '_blank');
  };

  return (
    <div style={{ padding: '10px' }}>
      <h2 style={{ color: '#667eea', marginBottom: '20px' }}>{t('hosp_title')}</h2>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '2px solid #667eea' }}>
        <h3>{lang === 'hi' ? 'लोकेशन से खोजें' : 'Search by location'}</h3>
        <input
          type="text"
          value={manualLocation}
          onChange={(e) => setManualLocation(e.target.value)}
          placeholder={lang === 'hi' ? 'City/Area/Village लिखें...' : 'Enter city/area/village...'}
          style={{ width: '100%', padding: '12px', marginBottom: '12px' }}
        />
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => openSearch(`${manualLocation} hospital`)}>{lang === 'hi' ? 'अस्पताल खोजो' : 'Search hospitals'}</button>
          <button onClick={() => openSearch(`${manualLocation} anganwadi centre`)}>{lang === 'hi' ? 'आंगनवाड़ी खोजो' : 'Search Anganwadi'}</button>
          <button onClick={() => openSearch(`${manualLocation} PHC primary health centre`)}>{lang === 'hi' ? 'PHC खोजो' : 'Search PHC'}</button>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
        <h3>{t('hosp_emergency')}</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => window.open('tel:108', '_self')}>108</button>
          <button onClick={() => window.open('tel:112', '_self')}>112</button>
          <button onClick={() => window.open('tel:102', '_self')}>102</button>
        </div>
      </div>
    </div>
  );
}

export default HospitalFinderLocalized;
