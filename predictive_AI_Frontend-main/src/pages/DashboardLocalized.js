import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useLang } from '../LanguageContext';

function DashboardLocalized({ userId }) {
  const { t, lang } = useLang();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/assessment/all/${userId}`);
      if (res.data.assessments && res.data.assessments.length > 0) {
        setAssessments(res.data.assessments);
        setError(null);
      } else {
        setAssessments([]);
        setError(t('no_data'));
      }
    } catch (err) {
      setAssessments([]);
      setError(lang === 'hi' ? 'डेटा लोड नहीं हो पाया' : 'Data fetch failed');
    } finally {
      setLoading(false);
    }
  }, [userId, t, lang]);

  useEffect(() => { fetchAssessments(); }, [fetchAssessments]);

  const getSeverityLabel = (s) => {
    if (s === 'SAM') return `SAM - ${t('sev_sam')}`;
    if (s === 'MAM') return `MAM - ${t('sev_mam')}`;
    return `NORMAL - ${t('sev_normal')}`;
  };

  if (loading) return <div className="dashboard"><h2>{t('dash_title')}</h2><p>{t('loading')}</p></div>;

  const latest = assessments.length > 0 ? assessments[0] : null;

  return (
    <div className="dashboard">
      <h2>{t('dash_title')}</h2>
      {error && <p>{error}</p>}
      {latest && (
        <div>
          <p><strong>{t('dash_current')}:</strong> {getSeverityLabel(latest.severity)}</p>
          <p><strong>{t('z_wfa')}:</strong> {(latest.z_wfa || 0).toFixed(2)}</p>
          <p><strong>{t('z_hfa')}:</strong> {(latest.z_hfa || 0).toFixed(2)}</p>
          <p><strong>{t('z_wfh')}:</strong> {(latest.z_wfh || 0).toFixed(2)}</p>
          <p><strong>{t('de_height')}:</strong> {latest.height} cm</p>
          <p><strong>{t('de_weight')}:</strong> {latest.weight} kg</p>
          <p><strong>MUAC:</strong> {latest.muac} cm</p>
        </div>
      )}

      {assessments.length > 0 && (
        <div>
          <h3>{t('dash_history')}</h3>
          {assessments.map((a, i) => (
            <div key={i}>
              {new Date(a.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US')} - {getSeverityLabel(a.severity)}
            </div>
          ))}
        </div>
      )}

      <button onClick={fetchAssessments}>{t('refresh')}</button>
    </div>
  );
}

export default DashboardLocalized;
