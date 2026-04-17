import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useLang } from '../LanguageContext';

function HealthScore({ userId }) {
  const { t, lang } = useLang();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`https://poshandrishti-backend.onrender.com/api/assessment/all/${userId}`);
      setAssessments(res.data.assessments || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => {
    if (!userId) { setAssessments([]); setLoading(false); return; }
    fetchData();
  }, [userId, fetchData]);

  const latest = assessments.length > 0 ? assessments[0] : null;

  const calculateHealthScore = () => {
    if (!latest) return { score: 0, grade: 'N/A', color: '#999' };
    let score = 0;
    if (latest.muac > 13.5) score += 30;
    else if (latest.muac > 12.5) score += 20;
    else if (latest.muac > 11.5) score += 10;

    const zWfh = latest.z_wfh || 0;
    if (zWfh > -1) score += 30;
    else if (zWfh > -2) score += 20;
    else if (zWfh > -3) score += 10;

    const bmi = latest.bmi || 0;
    if (bmi >= 14 && bmi <= 20) score += 20;
    else if (bmi >= 12) score += 10;

    if (latest.edema !== 'yes') score += 10;
    if (latest.anemia !== 'severe') score += 10;

    let grade, color;
    if (score >= 80) { grade = `🟢 ${t('score_excellent')}`; color = '#28a745'; }
    else if (score >= 60) { grade = `🟡 ${t('score_good')}`; color = '#ffc107'; }
    else if (score >= 40) { grade = `🟠 ${t('score_at_risk')}`; color = '#fd7e14'; }
    else { grade = `🔴 ${t('score_critical')}`; color = '#dc3545'; }

    return { score, grade, color };
  };

  const healthScore = calculateHealthScore();

  const nearbyCases = [
    { area: 'Village A - 2 km', samCount: 3, mamCount: 8, normalCount: 45, risk: 'HIGH' },
    { area: 'Village B - 5 km', samCount: 1, mamCount: 5, normalCount: 60, risk: 'MEDIUM' },
    { area: 'Village C - 8 km', samCount: 0, mamCount: 3, normalCount: 55, risk: 'LOW' },
    { area: 'City D - 12 km', samCount: 2, mamCount: 12, normalCount: 120, risk: 'MEDIUM' },
  ];

  if (loading) return <div><h2>❤️ {t('score_title')}</h2><p>⏳ {t('loading')}</p></div>;

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>❤️ {t('score_title')}</h2>

      {latest ? (
        <div style={{
          textAlign: 'center', padding: '30px',
          background: `linear-gradient(135deg, ${healthScore.color}15, ${healthScore.color}30)`,
          borderRadius: '16px', marginBottom: '25px', border: `3px solid ${healthScore.color}`
        }}>
          <h3>📊 {t('score_health')}</h3>
          <div style={{
            width: '150px', height: '150px', borderRadius: '50%',
            background: `conic-gradient(${healthScore.color} ${healthScore.score * 3.6}deg, #e0e0e0 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '20px auto', boxShadow: `0 8px 25px ${healthScore.color}40`
          }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
            }}>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: healthScore.color }}>{healthScore.score}</p>
              <p style={{ fontSize: '12px', color: '#666' }}>/ 100</p>
            </div>
          </div>
          <p style={{ fontSize: '22px', fontWeight: 'bold', color: healthScore.color }}>{healthScore.grade}</p>
        </div>
      ) : (
        <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>📭 {t('no_data')}</p>
      )}

      {/* Nearby */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '2px solid #667eea' }}>
        <h3>🗺️ {t('score_nearby')}</h3>
        <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px' }}>⚠️ {t('score_nearby_note')}</p>

        {nearbyCases.map((area, i) => (
          <div key={i} style={{
            background: 'white', padding: '15px', borderRadius: '10px', marginBottom: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
            borderLeft: `4px solid ${area.risk === 'HIGH' ? '#dc3545' : area.risk === 'MEDIUM' ? '#fd7e14' : '#28a745'}`
          }}>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '15px' }}>📍 {area.area}</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px', fontSize: '13px' }}>
                <span style={{ color: '#dc3545' }}>🔴 SAM: {area.samCount}</span>
                <span style={{ color: '#fd7e14' }}>🟠 MAM: {area.mamCount}</span>
                <span style={{ color: '#28a745' }}>🟢 Normal: {area.normalCount}</span>
              </div>
            </div>
            <span style={{
              padding: '5px 15px', borderRadius: '15px', fontSize: '13px', fontWeight: 'bold',
              background: area.risk === 'HIGH' ? '#f8d7da' : area.risk === 'MEDIUM' ? '#fff3cd' : '#d4edda',
              color: area.risk === 'HIGH' ? '#dc3545' : area.risk === 'MEDIUM' ? '#856404' : '#155724'
            }}>
              {area.risk}
            </span>
          </div>
        ))}
      </div>

      {/* Guide */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #667eea' }}>
        <h3>📚 {t('score_guide')}</h3>
        <p style={{ margin: '5px 0' }}>🟢 <strong>80-100:</strong> {t('score_excellent')}</p>
        <p style={{ margin: '5px 0' }}>🟡 <strong>60-79:</strong> {t('score_good')}</p>
        <p style={{ margin: '5px 0' }}>🟠 <strong>40-59:</strong> {t('score_at_risk')}</p>
        <p style={{ margin: '5px 0' }}>🔴 <strong>0-39:</strong> {t('score_critical')}</p>
      </div>
    </div>
  );
}

export default HealthScore;