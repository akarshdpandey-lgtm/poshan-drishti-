import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLang } from '../LanguageContext';

function ReportExport({ userId }) {
  const { t, lang } = useLang();
  const [assessments, setAssessments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [assessRes, userRes] = await Promise.all([
        axios.get(`https://poshandrishti-backend.onrender.com/api/assessment/all/${userId}`),
        axios.get(`https://poshandrishti-backend.onrender.com/api/user/${userId}`)
      ]);
      setAssessments(assessRes.data.assessments || []);
      setUserData(userRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setAssessments([]);
      setUserData(null);
      setLoading(false);
      return;
    }
    fetchData();
  }, [userId, fetchData]);

  const getSeverityColor = (s) => {
    if (s === 'SAM') return '#dc3545';
    if (s === 'MAM') return '#fd7e14';
    return '#28a745';
  };

  const getSeverityLabel = (s) => {
    if (s === 'SAM') return `🔴 ${t('res_sam')}`;
    if (s === 'MAM') return `🟠 ${t('res_mam')}`;
    return `🟢 ${t('res_normal')}`;
  };

  const printReport = () => {
    window.print();
  };

  if (loading) return (
    <div>
      <h2>📄 {t('report_title')}</h2>
      <p>⏳ {t('loading')}</p>
    </div>
  );

  const latest = assessments.length > 0 ? assessments[0] : null;

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>

      {/* Print Button */}
      <div className="no-print" style={{ marginBottom: '20px', textAlign: 'right' }}>
        <button onClick={printReport} style={{
          padding: '12px 30px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white', border: 'none', borderRadius: '8px',
          cursor: 'pointer', fontSize: '16px', fontWeight: '600'
        }}>
          🖨️ {t('report_print')}
        </button>
      </div>

      {/* Report Header */}
      <div style={{
        textAlign: 'center', borderBottom: '3px solid #667eea',
        paddingBottom: '20px', marginBottom: '25px'
      }}>
        <h1 style={{ color: '#667eea', fontSize: '24px' }}>🏥 {t('report_title')}</h1>
        <p style={{ color: '#666' }}>{t('report_subtitle')}</p>
        <p style={{ color: '#999', fontSize: '13px' }}>
          {new Date().toLocaleDateString()} | {t('app_title')}
        </p>
      </div>

      {/* Patient Info */}
      {userData && (
        <div style={{
          background: '#f8f9fa', padding: '20px',
          borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd'
        }}>
          <h3>👶 {t('report_patient')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
            {userData.name && <p><strong>Name:</strong> {userData.name}</p>}
            {userData.phone && <p><strong>Phone:</strong> {userData.phone}</p>}
            <p><strong>{t('de_age')}:</strong> {userData.age}</p>
            <p><strong>{t('de_gender')}:</strong> {userData.gender === 'male' ? t('de_boy') : t('de_girl')}</p>
            {userData.location && <p><strong>Location:</strong> {userData.location}</p>}
            <p><strong>User ID:</strong> {userData.id}</p>
          </div>
        </div>
      )}

      {/* Latest Assessment */}
      {latest ? (
        <div style={{
          padding: '20px', borderRadius: '12px', marginBottom: '20px',
          border: `3px solid ${getSeverityColor(latest.severity)}`,
          background: latest.severity === 'SAM' ? '#f8d7da' :
            latest.severity === 'MAM' ? '#fff3cd' : '#d4edda'
        }}>
          <h3>📊 {t('report_latest')}</h3>

          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <div style={{
              display: 'inline-block', padding: '15px 40px',
              borderRadius: '25px', backgroundColor: getSeverityColor(latest.severity),
              color: 'white', fontSize: '22px', fontWeight: 'bold'
            }}>
              {getSeverityLabel(latest.severity)}
            </div>
          </div>

          {/* Measurements */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '15px' }}>
            {[
              { label: t('de_height'), value: `${latest.height} cm`, icon: '📏' },
              { label: t('de_weight'), value: `${latest.weight} kg`, icon: '⚖️' },
              { label: 'MUAC', value: `${latest.muac} cm`, icon: '🔵' }
            ].map((m, i) => (
              <div key={i} style={{ background: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#666' }}>{m.icon} {m.label}</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold' }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Z-Scores */}
          <div style={{ marginTop: '15px' }}>
            <h4>📊 WHO Z-Scores:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
              {[
                { label: t('z_wfa'), val: latest.z_wfa },
                { label: t('z_hfa'), val: latest.z_hfa },
                { label: t('z_wfh'), val: latest.z_wfh }
              ].map((z, i) => (
                <div key={i} style={{ background: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#666' }}>{z.label}</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: (z.val || 0) < -2 ? '#dc3545' : '#28a745' }}>
                    {(z.val || 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* BMI */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#666' }}>BMI</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{latest.bmi}</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#666' }}>W/H Ratio</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{latest.wh_ratio}%</p>
            </div>
          </div>
        </div>
      ) : (
        <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          📭 {t('no_data')}
        </p>
      )}

      {/* History Table */}
      {assessments.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>📋 {t('report_history')}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#667eea', color: 'white' }}>
                  <th style={{ padding: '10px' }}>{t('dash_date')}</th>
                  <th style={{ padding: '10px' }}>{t('de_height')}</th>
                  <th style={{ padding: '10px' }}>{t('de_weight')}</th>
                  <th style={{ padding: '10px' }}>MUAC</th>
                  <th style={{ padding: '10px' }}>{t('z_wfh')}</th>
                  <th style={{ padding: '10px' }}>{t('dash_status')}</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {new Date(a.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{a.height}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{a.weight}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{a.muac}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{(a.z_wfh || 0).toFixed(2)}</td>
                    <td style={{
                      padding: '8px', textAlign: 'center', fontWeight: 'bold',
                      color: getSeverityColor(a.severity)
                    }}>{getSeverityLabel(a.severity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Z-Score Reference */}
      <div style={{
        background: '#f8f9fa', padding: '20px',
        borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #667eea'
      }}>
        <h3>📚 {t('report_reference')}</h3>
        <p style={{ margin: '5px 0' }}>🟢 Z &gt; -1: {t('z_normal')}</p>
        <p style={{ margin: '5px 0' }}>🟠 Z -2 to -3: {t('sev_mam')}</p>
        <p style={{ margin: '5px 0' }}>🔴 Z &lt; -3: {t('sev_sam')}</p>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', borderTop: '2px solid #ddd',
        paddingTop: '15px', color: '#999', fontSize: '12px'
      }}>
        <p>🏥 {t('footer_line1')}</p>
        <p>{t('footer_line2')}</p>
        <p>{new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default ReportExport;