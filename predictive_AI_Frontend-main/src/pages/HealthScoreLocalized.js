import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useLang } from '../LanguageContext';

function HealthScoreLocalized({ userId }) {
  const { t, lang } = useLang();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`https://poshandrishti-backend.onrender.com/api/assessment/all/${userId}`);
      setAssessments(res.data.assessments || []);
    } catch (err) {
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setAssessments([]);
      setLoading(false);
      return;
    }
    fetchData();
  }, [userId, fetchData]);

  const latest = assessments.length > 0 ? assessments[0] : null;

  if (loading) return <div><h2>{t('score_title')}</h2><p>{t('loading')}</p></div>;

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>{t('score_title')}</h2>
      {latest ? (
        <div>
          <p><strong>{t('score_health')}:</strong> {latest.severity}</p>
          <p><strong>MUAC:</strong> {latest.muac}</p>
          <p><strong>{t('z_wfh')}:</strong> {latest.z_wfh}</p>
          <p><strong>BMI:</strong> {latest.bmi}</p>
        </div>
      ) : (
        <p>{lang === 'hi' ? 'पहले Data Entry करो' : 'Please complete data entry first'}</p>
      )}
      <div>
        <h3>{t('score_guide')}</h3>
        <p>80-100: {t('score_excellent')}</p>
        <p>60-79: {t('score_good')}</p>
        <p>40-59: {t('score_at_risk')}</p>
        <p>0-39: {t('score_critical')}</p>
      </div>
    </div>
  );
}

export default HealthScoreLocalized;
