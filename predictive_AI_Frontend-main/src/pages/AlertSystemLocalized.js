import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLang } from '../LanguageContext';

function AlertSystemLocalized({ userId }) {
  const { t, lang } = useLang();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/assessment/all/${userId}`);
        setAssessments(res.data.assessments || []);
      } catch (err) {
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
    else setLoading(false);
  }, [userId]);

  const latest = assessments[0];
  const alertText = latest?.severity === 'SAM'
    ? (lang === 'hi' ? 'गंभीर अलर्ट: तुरंत अस्पताल जाएं' : 'Critical alert: go to hospital immediately')
    : latest?.severity === 'MAM'
      ? (lang === 'hi' ? 'चेतावनी: पोषण सुधारें और डॉक्टर से मिलें' : 'Warning: improve nutrition and visit a doctor')
      : (lang === 'hi' ? 'कोई सक्रिय अलर्ट नहीं' : 'No active alert');

  if (loading) return <div><h2>{t('alert_title')}</h2><p>{t('loading')}</p></div>;

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>{t('alert_title')}</h2>
      <p><strong>{t('alert_current')}:</strong> {alertText}</p>
      <div style={{ marginTop: '20px' }}>
        <h3>{t('alert_rules')}</h3>
        <p>{lang === 'hi' ? 'SAM होने पर 108 या नजदीकी अस्पताल से तुरंत संपर्क करें।' : 'For SAM, call 108 or contact the nearest hospital immediately.'}</p>
        <p>{lang === 'hi' ? 'MAM होने पर आंगनवाड़ी और ICDS से सहायता लें।' : 'For MAM, seek support from Anganwadi and ICDS.'}</p>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => window.open('tel:108', '_self')}>108</button>
        <button onClick={() => window.open('tel:112', '_self')}>112</button>
        <button onClick={() => window.open('tel:102', '_self')}>102</button>
      </div>
    </div>
  );
}

export default AlertSystemLocalized;
