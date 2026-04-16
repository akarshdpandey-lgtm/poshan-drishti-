import React, { useState } from 'react';
import { useLang } from '../LanguageContext';

function ScanPage({ userId }) {
  const { t, lang } = useLang();
  const [edemaResult, setEdemaResult] = useState(null);
  const [anemiaResult, setAnemiaResult] = useState(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);

  const [edemaQuestions, setEdemaQuestions] = useState({
    feet_swelling: false, hands_swelling: false,
    face_swelling: false, skin_pitting: false
  });

  const handleEdemaChange = (key) => {
    setEdemaQuestions({ ...edemaQuestions, [key]: !edemaQuestions[key] });
  };

  const checkEdema = () => {
    const yesCount = Object.values(edemaQuestions).filter(v => v).length;
    let severity, message;
    if (yesCount >= 3) {
      severity = 'SEVERE';
      message = `🔴 ${t('sev_sam')} - ${t('adv_sam')}`;
    } else if (yesCount >= 1) {
      severity = 'MODERATE';
      message = `🟠 ${t('sev_mam')} - ${t('adv_mam')}`;
    } else {
      severity = 'NORMAL';
      message = `🟢 ${t('sev_normal')}`;
    }
    setEdemaResult({ severity, message, yesCount });
  };

  const [anemiaQuestions, setAnemiaQuestions] = useState({
    pale_eyes: false, pale_nails: false, pale_tongue: false,
    weakness: false, fast_breathing: false
  });

  const handleAnemiaChange = (key) => {
    setAnemiaQuestions({ ...anemiaQuestions, [key]: !anemiaQuestions[key] });
  };

  const checkAnemia = () => {
    const yesCount = Object.values(anemiaQuestions).filter(v => v).length;
    let severity, message;
    if (yesCount >= 4) {
      severity = 'SEVERE';
      message = `🔴 ${t('adv_sam')}`;
    } else if (yesCount >= 2) {
      severity = 'MODERATE';
      message = `🟠 ${t('adv_mam')}`;
    } else {
      severity = 'NORMAL';
      message = `🟢 ${t('adv_normal')}`;
    }
    setAnemiaResult({ severity, message, yesCount });
  };

  const getSeverityColor = (s) => {
    if (s === 'SEVERE') return '#dc3545';
    if (s === 'MODERATE') return '#fd7e14';
    return '#28a745';
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files[0]) setPhotoUploaded(true);
  };

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>🔍 {t('scan_title')}</h2>

      {/* PHOTO UPLOAD */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '2px solid #667eea' }}>
        <h3>📷 {t('scan_photo')}</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>{t('scan_photo_desc')}</p>
        <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload}
          style={{ width: '100%', padding: '15px', border: '2px dashed #667eea', borderRadius: '8px', cursor: 'pointer', background: '#f0f4ff' }} />
        {photoUploaded && (
          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px', marginTop: '15px', border: '1px solid #28a745' }}>
            <p>✅ Photo uploaded!</p>
          </div>
        )}
      </div>

      {/* EDEMA */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '2px solid #17a2b8' }}>
        <h3>💧 {t('scan_edema')}</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>{t('scan_edema_desc')}</p>

        {[
          { key: 'feet_swelling', label: t('edema_q1'), detail: t('edema_q1_detail') },
          { key: 'hands_swelling', label: t('edema_q2'), detail: t('edema_q2_detail') },
          { key: 'face_swelling', label: t('edema_q3'), detail: t('edema_q3_detail') },
          { key: 'skin_pitting', label: t('edema_q4'), detail: t('edema_q4_detail') }
        ].map(q => (
          <div key={q.key} onClick={() => handleEdemaChange(q.key)} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px',
            border: edemaQuestions[q.key] ? '2px solid #dc3545' : '2px solid #ddd',
            background: edemaQuestions[q.key] ? '#f8d7da' : 'white', transition: 'all 0.3s'
          }}>
            <span style={{ fontSize: '20px' }}>{edemaQuestions[q.key] ? '✅' : '⬜'}</span>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '15px' }}>{q.label}</p>
              <p style={{ fontSize: '12px', color: '#666' }}>{q.detail}</p>
            </div>
          </div>
        ))}

        <button onClick={checkEdema} style={{
          marginTop: '15px', padding: '12px 24px', width: '100%',
          background: '#17a2b8', color: 'white', border: 'none',
          borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600'
        }}>🔍 {t('scan_check')}</button>

        {edemaResult && (
          <div style={{
            marginTop: '15px', padding: '15px', borderRadius: '8px',
            background: edemaResult.severity === 'NORMAL' ? '#d4edda' : edemaResult.severity === 'MODERATE' ? '#fff3cd' : '#f8d7da',
            border: `2px solid ${getSeverityColor(edemaResult.severity)}`
          }}>
            <p style={{ fontWeight: 'bold', color: getSeverityColor(edemaResult.severity) }}>{edemaResult.message}</p>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>{edemaResult.yesCount}/4</p>
          </div>
        )}
      </div>

      {/* ANEMIA */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '2px solid #e91e63' }}>
        <h3>🩸 {t('scan_anemia')}</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>{t('scan_anemia_desc')}</p>

        {[
          { key: 'pale_eyes', label: t('anemia_q1'), detail: t('anemia_q1_detail') },
          { key: 'pale_nails', label: t('anemia_q2'), detail: t('anemia_q2_detail') },
          { key: 'pale_tongue', label: t('anemia_q3'), detail: t('anemia_q3_detail') },
          { key: 'weakness', label: t('anemia_q4'), detail: t('anemia_q4_detail') },
          { key: 'fast_breathing', label: t('anemia_q5'), detail: t('anemia_q5_detail') }
        ].map(q => (
          <div key={q.key} onClick={() => handleAnemiaChange(q.key)} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px',
            border: anemiaQuestions[q.key] ? '2px solid #e91e63' : '2px solid #ddd',
            background: anemiaQuestions[q.key] ? '#fce4ec' : 'white', transition: 'all 0.3s'
          }}>
            <span style={{ fontSize: '20px' }}>{anemiaQuestions[q.key] ? '✅' : '⬜'}</span>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '15px' }}>{q.label}</p>
              <p style={{ fontSize: '12px', color: '#666' }}>{q.detail}</p>
            </div>
          </div>
        ))}

        <button onClick={checkAnemia} style={{
          marginTop: '15px', padding: '12px 24px', width: '100%',
          background: '#e91e63', color: 'white', border: 'none',
          borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600'
        }}>🔍 {t('scan_check')}</button>

        {anemiaResult && (
          <div style={{
            marginTop: '15px', padding: '15px', borderRadius: '8px',
            background: anemiaResult.severity === 'NORMAL' ? '#d4edda' : anemiaResult.severity === 'MODERATE' ? '#fff3cd' : '#f8d7da',
            border: `2px solid ${getSeverityColor(anemiaResult.severity)}`
          }}>
            <p style={{ fontWeight: 'bold', color: getSeverityColor(anemiaResult.severity) }}>{anemiaResult.message}</p>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>{anemiaResult.yesCount}/5</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanPage;