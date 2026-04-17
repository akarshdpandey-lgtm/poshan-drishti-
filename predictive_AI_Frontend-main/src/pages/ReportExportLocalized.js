import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLang } from '../LanguageContext';

function ReportExportLocalized({ userId }) {
  const { t, lang } = useLang();
  const [assessments, setAssessments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [assessRes, userRes] = await Promise.all([
          axios.get(`https://poshandrishti-backend.onrender.com/api/assessment/all/${userId}`),
          axios.get(`https://poshandrishti-backend.onrender.com/api/user/${userId}`)
        ]);
        setAssessments(assessRes.data.assessments || []);
        setUserData(userRes.data);
      } catch (err) {
        setAssessments([]);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
    else setLoading(false);
  }, [userId]);

  if (loading) return <div><h2>{t('report_title')}</h2><p>{t('loading')}</p></div>;
  const latest = assessments[0];

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '20px', textAlign: 'right' }}>
        <button onClick={() => window.print()}>{t('report_print')}</button>
      </div>
      <h2>{t('report_title')}</h2>
      <p>{t('report_subtitle')}</p>

      {userData && (
        <div>
          <h3>{t('report_patient')}</h3>
          <p>{userData.name}</p>
          <p>{userData.phone}</p>
          <p>{userData.location}</p>
        </div>
      )}

      {latest && (
        <div>
          <h3>{t('report_latest')}</h3>
          <p>{lang === 'hi' ? 'स्थिति' : 'Status'}: {latest.severity}</p>
          <p>{t('de_height')}: {latest.height} cm</p>
          <p>{t('de_weight')}: {latest.weight} kg</p>
          <p>MUAC: {latest.muac} cm</p>
        </div>
      )}

      {assessments.length > 0 && (
        <div>
          <h3>{t('report_history')}</h3>
          {assessments.map((a, i) => (
            <div key={i}>{new Date(a.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US')} - {a.severity}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportExportLocalized;
