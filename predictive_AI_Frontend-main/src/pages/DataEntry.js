import React, { useState } from 'react';
import { useLang } from '../LanguageContext';

function DataEntry({ userId }) {
  const { t, lang } = useLang();

  const [step, setStep] = useState(1);
  const [basicData, setBasicData] = useState({
    height: '', weight: '', age_months: '', gender: 'male'
  });
  const [manualMuac, setManualMuac] = useState('');
  const [hardwareMuac, setHardwareMuac] = useState('');
  const [muacMethod, setMuacMethod] = useState('both');
  const [edema, setEdema] = useState('no');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBasicChange = (e) => {
    setBasicData({ ...basicData, [e.target.name]: e.target.value });
  };

  const goToStep2 = (e) => { e.preventDefault(); setStep(2); };

  const getMuacAccuracy = () => {
    if (!manualMuac || !hardwareMuac) return null;
    const m = parseFloat(manualMuac), h = parseFloat(hardwareMuac);
    const diff = Math.abs(m - h), avg = (m + h) / 2;
    const pErr = ((diff / avg) * 100).toFixed(1);
    return {
      manual: m, hardware: h, difference: diff.toFixed(1),
      average: avg.toFixed(1), percentError: pErr,
      reliability: diff < 0.5 ? 'HIGH' : diff < 1.0 ? 'MEDIUM' : 'LOW',
      recommendedValue: avg.toFixed(1)
    };
  };

  const getFinalMuac = () => {
    if (muacMethod === 'both' && manualMuac && hardwareMuac)
      return ((parseFloat(manualMuac) + parseFloat(hardwareMuac)) / 2).toFixed(1);
    if (manualMuac) return manualMuac;
    if (hardwareMuac) return hardwareMuac;
    return '0';
  };

  const calculateAssessment = () => {
    const height = parseFloat(basicData.height);
    const weight = parseFloat(basicData.weight);
    const ageMonths = parseInt(basicData.age_months);
    const muac = parseFloat(getFinalMuac());
    const gender = basicData.gender;

    const heightM = height / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    const expectedWeight = (height - 100) * 0.9;
    const whRatio = ((weight / expectedWeight) * 100).toFixed(1);

    const medianWFA = gender === 'male' ? 2.5 + (ageMonths * 0.2) : 2.4 + (ageMonths * 0.19);
    const wfaZ = ((weight - medianWFA) / (medianWFA * 0.15)).toFixed(2);

    const medianHFA = gender === 'male' ? 50 + (ageMonths * 2) : 49 + (ageMonths * 1.95);
    const hfaZ = ((height - medianHFA) / (medianHFA * 0.05)).toFixed(2);

    const expectedWFH = gender === 'male' ? (height * 0.12) - 1.5 : (height * 0.11) - 1.3;
    const wfhZ = ((weight - expectedWFH) / (expectedWFH * 0.12)).toFixed(2);

    let severity = 'NORMAL';
    let severity_text = t('sev_normal');
    let advice = t('adv_normal');
    const conditions = [];

    if (muac < 11.5 || edema === 'yes') {
      severity = 'SAM';
      severity_text = t('sev_sam');
      advice = t('adv_sam');
      conditions.push(`🔴 MUAC < 11.5 cm - ${t('sev_sam')}`);
    } else if (muac < 12.5) {
      severity = 'MAM';
      severity_text = t('sev_mam');
      advice = t('adv_mam');
      conditions.push(`🟠 MUAC 11.5-12.5 cm - ${t('sev_mam')}`);
    }

    if (parseFloat(wfhZ) < -3) {
      if (severity !== 'SAM') { severity = 'SAM'; severity_text = t('sev_sam'); }
      conditions.push(`🔴 ${t('z_wfh')} Z < -3 (${t('z_wasting')})`);
    } else if (parseFloat(wfhZ) < -2) {
      if (severity === 'NORMAL') { severity = 'MAM'; severity_text = t('sev_mam'); }
      conditions.push(`🟠 ${t('z_wfh')} Z < -2 (${t('z_wasting')})`);
    }

    if (parseFloat(hfaZ) < -3) {
      conditions.push(`🔴 ${t('z_hfa')} Z < -3 (${t('z_stunting')})`);
    } else if (parseFloat(hfaZ) < -2) {
      conditions.push(`🟠 ${t('z_hfa')} Z < -2 (${t('z_stunting')})`);
    }

    if (parseFloat(wfaZ) < -3) {
      conditions.push(`🔴 ${t('z_wfa')} Z < -3 (${t('z_underweight')})`);
    } else if (parseFloat(wfaZ) < -2) {
      conditions.push(`🟠 ${t('z_wfa')} Z < -2 (${t('z_underweight')})`);
    }

    if (edema === 'yes') {
      conditions.push(`💧 ${t('de_edema_yes')}`);
    }

    return {
      bmi, wh_ratio: whRatio,
      z_scores: { wfa: parseFloat(wfaZ), hfa: parseFloat(hfaZ), wfh: parseFloat(wfhZ) },
      severity, severity_text, advice, conditions
    };
  };

  const submitAssessment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const assessment = calculateAssessment();
      const accuracy = getMuacAccuracy();
      const resultData = { ...assessment, accuracy, timestamp: new Date().toISOString(), user_id: userId };

      const existingData = JSON.parse(localStorage.getItem('assessments') || '[]');
      existingData.push({
        ...resultData, height: basicData.height, weight: basicData.weight,
        age_months: basicData.age_months, gender: basicData.gender,
        muac: getFinalMuac(), edema, notes
      });
      localStorage.setItem('assessments', JSON.stringify(existingData));

      try {
        const response = await fetch('http://localhost:5000/api/assessment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId, height: parseFloat(basicData.height),
            weight: parseFloat(basicData.weight), muac: parseFloat(getFinalMuac()),
            age_months: parseInt(basicData.age_months), gender: basicData.gender,
            entry_type: muacMethod, edema, notes
          })
        });
        if (response.ok) {
          const serverResult = await response.json();
          setResult({ ...serverResult, accuracy });
        } else {
          setResult(resultData);
        }
      } catch (backendError) {
        setResult(resultData);
      }
      setStep(3);
    } catch (err) {
      setError(t('loading'));
    } finally {
      setLoading(false);
    }
  };

  const getSevColor = (s) => s === 'SAM' ? '#dc3545' : s === 'MAM' ? '#fd7e14' : '#28a745';
  const getSevBg = (s) => s === 'SAM' ? '#f8d7da' : s === 'MAM' ? '#fff3cd' : '#d4edda';

  const resetForm = () => {
    setStep(1);
    setBasicData({ height: '', weight: '', age_months: '', gender: 'male' });
    setManualMuac(''); setHardwareMuac(''); setNotes('');
    setResult(null); setError(null); setEdema('no');
  };

  return (
    <div className="data-entry" style={{ padding: '15px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#667eea', textAlign: 'center' }}>📊 {t('de_title')}</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={goToStep2}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea20, #764ba220)',
            padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '2px solid #667eea'
          }}>
            <h3 style={{ color: '#667eea', marginBottom: '15px' }}>📋 {t('de_step1_title')}</h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                📏 {t('de_height')}:
              </label>
              <input type="number" name="height" step="0.1" value={basicData.height}
                onChange={handleBasicChange} required placeholder={t('de_height_placeholder')}
                style={{ width: '100%', fontSize: '18px', padding: '14px', borderRadius: '8px', border: '2px solid #ddd', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                ⚖️ {t('de_weight')}:
              </label>
              <input type="number" name="weight" step="0.1" value={basicData.weight}
                onChange={handleBasicChange} required placeholder={t('de_weight_placeholder')}
                style={{ width: '100%', fontSize: '18px', padding: '14px', borderRadius: '8px', border: '2px solid #ddd', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                🎂 {t('de_age')}:
              </label>
              <input type="number" name="age_months" value={basicData.age_months}
                onChange={handleBasicChange} required placeholder={t('de_age_placeholder')}
                style={{ width: '100%', fontSize: '18px', padding: '14px', borderRadius: '8px', border: '2px solid #ddd', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                👶 {t('de_gender')}:
              </label>
              <select name="gender" value={basicData.gender} onChange={handleBasicChange}
                style={{ width: '100%', fontSize: '18px', padding: '14px', borderRadius: '8px', border: '2px solid #ddd', boxSizing: 'border-box' }}>
                <option value="male">👦 {t('de_boy')}</option>
                <option value="female">👧 {t('de_girl')}</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                💧 {t('de_edema')}:
              </label>
              <select value={edema} onChange={(e) => setEdema(e.target.value)}
                style={{ width: '100%', fontSize: '18px', padding: '14px', borderRadius: '8px', border: '2px solid #ddd', boxSizing: 'border-box' }}>
                <option value="no">❌ {t('de_edema_no')}</option>
                <option value="yes">✅ {t('de_edema_yes')}</option>
              </select>
            </div>
          </div>

          <button type="submit" style={{
            width: '100%', fontSize: '18px', padding: '15px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
          }}>
            {t('de_next_muac')}
          </button>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <form onSubmit={submitAssessment}>
          <div style={{
            background: '#e7f3ff', padding: '15px', borderRadius: '12px',
            marginBottom: '20px', border: '2px solid #007bff'
          }}>
            <p style={{ fontSize: '16px', margin: 0 }}>
              <strong>📏</strong> {basicData.height} cm |
              <strong> ⚖️</strong> {basicData.weight} kg |
              <strong> 🎂</strong> {basicData.age_months} {t('de_age')} |
              <strong> 💧</strong> {edema === 'yes' ? t('de_edema_yes') : t('de_edema_no')}
            </p>
            <button type="button" onClick={() => setStep(1)} style={{
              marginTop: '10px', padding: '8px 18px', cursor: 'pointer',
              borderRadius: '6px', border: '1px solid #007bff',
              background: 'white', color: '#007bff', fontSize: '14px'
            }}>← {t('back')}</button>
          </div>

          <div style={{
            background: '#f0f0ff', padding: '20px', borderRadius: '16px',
            marginBottom: '25px', border: '3px solid #667eea'
          }}>
            <h3 style={{ color: '#667eea', fontSize: '20px', textAlign: 'center', marginBottom: '20px' }}>
              📏 {t('de_muac_method')}
            </h3>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div onClick={() => setMuacMethod('both')} style={{
                flex: '1', minWidth: '140px', padding: '20px', borderRadius: '16px',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s',
                border: muacMethod === 'both' ? '4px solid #667eea' : '3px solid #ccc',
                background: muacMethod === 'both' ? '#667eea' : 'white',
                color: muacMethod === 'both' ? 'white' : '#333',
                transform: muacMethod === 'both' ? 'scale(1.05)' : 'scale(1)'
              }}>
                <p style={{ fontSize: '36px', marginBottom: '8px' }}>📏🔧</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{t('de_both')}</p>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>{t('de_both_desc')}</p>
              </div>

              <div onClick={() => setMuacMethod('manual')} style={{
                flex: '1', minWidth: '140px', padding: '20px', borderRadius: '16px',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s',
                border: muacMethod === 'manual' ? '4px solid #ffc107' : '3px solid #ccc',
                background: muacMethod === 'manual' ? '#ffc107' : 'white', color: '#333',
                transform: muacMethod === 'manual' ? 'scale(1.05)' : 'scale(1)'
              }}>
                <p style={{ fontSize: '36px', marginBottom: '8px' }}>📏</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{t('de_manual')}</p>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>{t('de_manual_desc')}</p>
              </div>

              <div onClick={() => setMuacMethod('hardware')} style={{
                flex: '1', minWidth: '140px', padding: '20px', borderRadius: '16px',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s',
                border: muacMethod === 'hardware' ? '4px solid #28a745' : '3px solid #ccc',
                background: muacMethod === 'hardware' ? '#28a745' : 'white',
                color: muacMethod === 'hardware' ? 'white' : '#333',
                transform: muacMethod === 'hardware' ? 'scale(1.05)' : 'scale(1)'
              }}>
                <p style={{ fontSize: '36px', marginBottom: '8px' }}>🔧</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{t('de_hardware')}</p>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>{t('de_hardware_desc')}</p>
              </div>
            </div>
          </div>

          {(muacMethod === 'both' || muacMethod === 'manual') && (
            <div style={{
              background: 'linear-gradient(135deg, #fff8e1, #fff3cd)',
              padding: '25px', borderRadius: '16px', marginBottom: '20px', border: '3px solid #ffc107'
            }}>
              <span style={{
                background: '#ffc107', color: '#333', padding: '8px 16px',
                borderRadius: '20px', fontSize: '18px', fontWeight: 'bold'
              }}>📏 {t('de_manual_label')}</span>

              <input type="number" step="0.1" value={manualMuac}
                onChange={(e) => setManualMuac(e.target.value)}
                required={muacMethod !== 'hardware'} placeholder={t('de_manual_placeholder')}
                style={{
                  width: '100%', padding: '18px', fontSize: '22px', marginTop: '15px',
                  border: '3px solid #ffc107', borderRadius: '12px',
                  background: 'white', fontWeight: 'bold', textAlign: 'center', boxSizing: 'border-box'
                }} />

              <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', marginTop: '15px', border: '1px solid #ffc107' }}>
                <p style={{ fontWeight: 'bold', color: '#856404', marginBottom: '8px' }}>📋 {t('de_manual_instructions')}</p>
                <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>{t('de_manual_step1')}</p>
                <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>{t('de_manual_step2')}</p>
                <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>{t('de_manual_step3')}</p>
                <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>{t('de_manual_step4')}</p>
              </div>
            </div>
          )}

          {(muacMethod === 'both' || muacMethod === 'hardware') && (
            <div style={{
              background: 'linear-gradient(135deg, #e8f5e9, #d4edda)',
              padding: '25px', borderRadius: '16px', marginBottom: '20px', border: '3px solid #28a745'
            }}>
              <span style={{
                background: '#28a745', color: 'white', padding: '8px 16px',
                borderRadius: '20px', fontSize: '18px', fontWeight: 'bold'
              }}>🔧 {t('de_hardware_label')}</span>

              <input type="number" step="0.1" value={hardwareMuac}
                onChange={(e) => setHardwareMuac(e.target.value)}
                required={muacMethod !== 'manual'} placeholder={t('de_hardware_placeholder')}
                style={{
                  width: '100%', padding: '18px', fontSize: '22px', marginTop: '15px',
                  border: '3px solid #28a745', borderRadius: '12px',
                  background: 'white', fontWeight: 'bold', textAlign: 'center', boxSizing: 'border-box'
                }} />
            </div>
          )}

          {muacMethod === 'both' && manualMuac && hardwareMuac && (() => {
            const acc = getMuacAccuracy();
            if (!acc) return null;
            return (
              <div style={{
                background: 'linear-gradient(135deg, #f3e5f5, #e8eaf6)',
                padding: '25px', borderRadius: '16px', marginBottom: '20px', border: '3px solid #667eea'
              }}>
                <h4 style={{ color: '#667eea', fontSize: '18px', textAlign: 'center', marginBottom: '15px' }}>
                  🔍 {t('de_accuracy_title')}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '15px' }}>
                  <div style={{ background: '#ffc107', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', fontWeight: 'bold' }}>📏 {t('de_manual_label')}</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{acc.manual} cm</p>
                  </div>
                  <div style={{ background: '#28a745', padding: '15px', borderRadius: '12px', textAlign: 'center', color: 'white' }}>
                    <p style={{ fontSize: '13px', fontWeight: 'bold' }}>🔧 {t('de_hardware_label')}</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{acc.hardware} cm</p>
                  </div>
                  <div style={{ background: '#667eea', padding: '15px', borderRadius: '12px', textAlign: 'center', color: 'white' }}>
                    <p style={{ fontSize: '13px', fontWeight: 'bold' }}>📊 {t('de_average_label')}</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{acc.average} cm</p>
                  </div>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#666' }}>📐 {t('de_difference')}</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{acc.difference} cm</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#666' }}>📊 {t('de_error_percent')}</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{acc.percentError}%</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#666' }}>✅ {t('de_reliability')}</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: acc.reliability === 'HIGH' ? '#28a745' : acc.reliability === 'MEDIUM' ? '#fd7e14' : '#dc3545' }}>
                      {acc.reliability === 'HIGH' ? `🟢 ${t('de_reliability_high')}` : acc.reliability === 'MEDIUM' ? `🟡 ${t('de_reliability_medium')}` : `🔴 ${t('de_reliability_low')}`}
                    </p>
                  </div>
                </div>
                {acc.reliability === 'LOW' && (
                  <p style={{ color: '#dc3545', fontWeight: 'bold', marginTop: '12px', textAlign: 'center', fontSize: '16px', background: '#f8d7da', padding: '10px', borderRadius: '8px' }}>
                    ⚠️ {t('de_remeasure_warning')}
                  </p>
                )}
              </div>
            );
          })()}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
              📝 {t('de_notes')}:
            </label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder={t('de_notes_placeholder')} rows="2"
              style={{ width: '100%', fontSize: '16px', padding: '12px', borderRadius: '8px', border: '2px solid #ddd', boxSizing: 'border-box' }} />
          </div>

          {error && (
            <p style={{ color: '#dc3545', background: '#f8d7da', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              ❌ {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', fontSize: '18px', padding: '15px',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #28a745, #20c997)',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold'
          }}>
            {loading ? `⏳ ${t('de_processing')}` : `✅ ${t('de_submit')}`}
          </button>
        </form>
      )}

      {/* STEP 3 */}
      {step === 3 && result && (
        <div style={{
          background: getSevBg(result.severity), padding: '25px',
          borderRadius: '16px', textAlign: 'center',
          border: `4px solid ${getSevColor(result.severity)}`
        }}>
          <h3>✅ {t('res_title')}</h3>

          <div style={{
            display: 'inline-block', padding: '15px 40px', borderRadius: '30px',
            backgroundColor: getSevColor(result.severity), color: 'white',
            fontSize: '24px', fontWeight: 'bold', margin: '15px 0'
          }}>
            {result.severity === 'SAM' && `🔴 ${t('res_sam')}`}
            {result.severity === 'MAM' && `🟠 ${t('res_mam')}`}
            {result.severity === 'NORMAL' && `🟢 ${t('res_normal')}`}
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', margin: '15px 0', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <p><strong>📏 {t('de_height')}:</strong> {basicData.height} cm</p>
              <p><strong>⚖️ {t('de_weight')}:</strong> {basicData.weight} kg</p>
              <p><strong>🔵 MUAC:</strong> {getFinalMuac()} cm</p>
              <p><strong>📊 BMI:</strong> {result.bmi}</p>
              <p><strong>💧 {t('de_edema')}:</strong> {edema === 'yes' ? t('de_edema_yes') : t('de_edema_no')}</p>
            </div>
          </div>

          {result.z_scores && (
            <div style={{ background: 'white', padding: '15px', borderRadius: '12px', margin: '15px 0' }}>
              <h4>📊 WHO Z-Scores</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' }}>
                {[
                  { label: t('z_wfa'), val: result.z_scores.wfa },
                  { label: t('z_hfa'), val: result.z_scores.hfa },
                  { label: t('z_wfh'), val: result.z_scores.wfh }
                ].map((z, i) => (
                  <div key={i} style={{
                    background: z.val < -2 ? '#f8d7da' : '#d4edda',
                    padding: '12px', borderRadius: '10px', textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '11px', color: '#666' }}>{z.label}</p>
                    <p style={{ fontSize: '22px', fontWeight: 'bold', color: z.val < -2 ? '#dc3545' : '#28a745' }}>
                      {z.val?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.conditions && result.conditions.length > 0 && (
            <div style={{
              background: '#f8d7da', padding: '15px', borderRadius: '12px',
              margin: '15px 0', textAlign: 'left', border: '2px solid #dc3545'
            }}>
              <h4 style={{ color: '#dc3545' }}>⚠️ {t('res_conditions')}</h4>
              {result.conditions.map((c, i) => (
                <p key={i} style={{ margin: '5px 0', fontSize: '15px' }}>{c}</p>
              ))}
            </div>
          )}

          <div style={{
            background: 'white', padding: '15px', borderRadius: '12px',
            margin: '15px 0', textAlign: 'left',
            borderLeft: `5px solid ${getSevColor(result.severity)}`
          }}>
            <p><strong>📋 {t('res_status')}:</strong> {result.severity_text}</p>
            <p><strong>💡 {t('res_advice')}:</strong> {result.advice}</p>
          </div>

          <button onClick={resetForm} style={{
            width: '100%', fontSize: '18px', padding: '15px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 'bold'
          }}>
            🔄 {t('res_new')}
          </button>
        </div>
      )}
    </div>
  );
}

export default DataEntry;