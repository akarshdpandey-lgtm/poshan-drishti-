import React, { useState } from 'react';

function HiddenHunger({ userId, lang }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    child_name: '',
    child_age_months: '',
    child_gender: 'male',
    location: 'urban',
    diet_type: 'mixed',
    diet_level: '',
    fruit_per_week: '',
    green_vegetables: '',
    milk_products: '',
    egg_per_week: '',
    water_glasses: '',
    sunlight_hours: '',
    economic_level: '',
    symptoms: {
      skin_pallor: false, brittle_nails: false, hair_loss: false,
      fatigue_weakness: false, night_blindness: false, dry_eyes: false,
      bleeding_gums: false, joint_pain: false, muscle_cramps: false,
      bone_pain: false, slow_healing: false, frequent_infections: false,
      mouth_ulcers: false, tongue_inflammation: false, numbness_tingling: false,
      pale_conjunctiva: false, brittle_bones: false, loss_of_appetite: false,
    }
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const tx = (hi, en) => lang === 'hi' ? hi : en;

  const dietLevels = [
    {
      value: 'low',
      label: tx('कम (Low)', 'Low'),
      color: '#dc3545',
      icon: '🔴',
      description: tx(
        'सिर्फ एक-दो तरह का खाना — जैसे सिर्फ रोटी-दाल या चावल। फल, सब्ज़ी, दूध, अंडा बहुत कम या बिल्कुल नहीं।',
        'Only 1-2 types of food — like only roti-dal or rice. Fruits, vegetables, milk, eggs very less or none.'
      ),
      examples: tx('रोटी + दाल + नमक', 'Roti + Dal + Salt'),
    },
    {
      value: 'medium',
      label: tx('मध्यम (Medium)', 'Medium'),
      color: '#fd7e14',
      icon: '🟠',
      description: tx(
        'रोटी, दाल, सब्ज़ी रोज़ मिलती है। लेकिन फल, दूध, अंडा, dry fruits कभी-कभी ही मिलते हैं।',
        'Roti, dal, vegetables daily. But fruits, milk, eggs, dry fruits only sometimes.'
      ),
      examples: tx('रोटी + दाल + सब्ज़ी (रोज़), दूध कभी-कभी', 'Roti + Dal + Sabzi (daily), Milk sometimes'),
    },
    {
      value: 'high',
      label: tx('अच्छा (High)', 'High'),
      color: '#28a745',
      icon: '🟢',
      description: tx(
        'सभी food groups रोज़ मिलते हैं — अनाज, दाल/प्रोटीन, सब्ज़ी, फल, दूध/दही, अंडा/मांस और कभी-कभी dry fruits।',
        'All food groups daily — grains, dal/protein, vegetables, fruits, milk/curd, egg/meat and sometimes dry fruits.'
      ),
      examples: tx('रोटी + दाल + सब्ज़ी + दूध + फल + अंडा (रोज़)', 'Roti + Dal + Sabzi + Milk + Fruit + Egg (daily)'),
    }
  ];

  const economicLevels = [
    {
      value: 'low',
      label: tx('निम्न (Low)', 'Low'),
      color: '#dc3545',
      icon: '🔴',
      description: tx(
        'परिवार की आमदनी बहुत कम है। BPL card है या Government की मदद ज़रूरी है। रोज़ के खाने की भी दिक्कत होती है।',
        'Family income is very low. BPL card or Government support needed. Daily food is also difficult.'
      ),
      examples: tx('BPL परिवार, मज़दूरी से गुज़ारा, ₹0-5000/महीना', 'BPL family, daily wage, ₹0-5000/month'),
    },
    {
      value: 'medium',
      label: tx('मध्यम (Medium)', 'Medium'),
      color: '#fd7e14',
      icon: '🟠',
      description: tx(
        'परिवार का गुज़ारा चल जाता है लेकिन बचत कम है। अच्छा खाना हमेशा afford नहीं होता। कभी-कभी दिक्कत होती है।',
        'Family manages but savings are low. Cannot always afford good food. Occasional difficulties.'
      ),
      examples: tx('छोटा व्यापार, सरकारी नौकरी, ₹5000-15000/महीना', 'Small business, govt job, ₹5000-15000/month'),
    },
    {
      value: 'high',
      label: tx('अच्छा (High)', 'High'),
      color: '#28a745',
      icon: '🟢',
      description: tx(
        'परिवार की आमदनी अच्छी है। अच्छा और पोषण युक्त खाना afford कर सकते हैं। Medical care भी ले सकते हैं।',
        'Family income is good. Can afford nutritious food. Can also take medical care.'
      ),
      examples: tx('अच्छी नौकरी, व्यापार, ₹15000+/महीना', 'Good job, business, ₹15000+/month'),
    }
  ];

  const symptomsList = [
    { key: 'skin_pallor', icon: '🫠', hi: 'पीली/सुस्त त्वचा', en: 'Pale/Dull Skin', nutrient: 'Iron' },
    { key: 'brittle_nails', icon: '💅', hi: 'कमज़ोर नाखून', en: 'Brittle Nails', nutrient: 'Iron' },
    { key: 'hair_loss', icon: '💇', hi: 'बाल झड़ना', en: 'Hair Loss', nutrient: 'Zinc/Iron' },
    { key: 'fatigue_weakness', icon: '😴', hi: 'थकान/कमज़ोरी', en: 'Fatigue/Weakness', nutrient: 'Iron/B12' },
    { key: 'night_blindness', icon: '🌙', hi: 'रात में दिखना कम', en: 'Night Blindness', nutrient: 'Vit A' },
    { key: 'dry_eyes', icon: '👁️', hi: 'आंखों की सूखापन', en: 'Dry Eyes', nutrient: 'Vit A' },
    { key: 'bleeding_gums', icon: '🩸', hi: 'मसूड़ों से खून', en: 'Bleeding Gums', nutrient: 'Vit C' },
    { key: 'joint_pain', icon: '🦴', hi: 'जोड़ों में दर्द', en: 'Joint Pain', nutrient: 'Vit C' },
    { key: 'muscle_cramps', icon: '💪', hi: 'मांसपेशियों में ऐंठन', en: 'Muscle Cramps', nutrient: 'Calcium/Vit D' },
    { key: 'bone_pain', icon: '🦴', hi: 'हड्डी दर्द', en: 'Bone Pain', nutrient: 'Calcium/Vit D' },
    { key: 'slow_healing', icon: '🩹', hi: 'घाव देर से भरना', en: 'Slow Wound Healing', nutrient: 'Vit C/Zinc' },
    { key: 'frequent_infections', icon: '🤒', hi: 'बार-बार बीमारी', en: 'Frequent Infections', nutrient: 'Vit A/Zinc' },
    { key: 'mouth_ulcers', icon: '👄', hi: 'मुंह के छाले', en: 'Mouth Ulcers', nutrient: 'B12/Iron' },
    { key: 'tongue_inflammation', icon: '👅', hi: 'जीभ में सूजन', en: 'Tongue Inflammation', nutrient: 'Vit B12' },
    { key: 'numbness_tingling', icon: '🖐️', hi: 'हाथ-पैर सुन्नपन', en: 'Numbness/Tingling', nutrient: 'Vit B12' },
    { key: 'pale_conjunctiva', icon: '👁️', hi: 'आंखों का पीलापन', en: 'Pale Conjunctiva', nutrient: 'Iron' },
    { key: 'brittle_bones', icon: '🦴', hi: 'हड्डियां कमज़ोर', en: 'Brittle Bones', nutrient: 'Calcium/Vit D' },
    { key: 'loss_of_appetite', icon: '🍽️', hi: 'भूख न लगना', en: 'Loss of Appetite', nutrient: 'Zinc' },
  ];

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSymptomToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      symptoms: { ...prev.symptoms, [key]: !prev.symptoms[key] }
    }));
  };

  const canProceed = () => {
    if (step === 1) return formData.child_age_months !== '';
    if (step === 2) return formData.diet_level !== '' && formData.economic_level !== '';
    return true;
  };

  const analyzeHiddenHunger = () => {
    setLoading(true);
    setTimeout(() => {
      let riskScore = 20;
      const deficiencies = [];
      const checked = Object.values(formData.symptoms).filter(Boolean).length;

      if (formData.diet_level === 'low') riskScore += 20;
      else if (formData.diet_level === 'medium') riskScore += 10;

      if (formData.economic_level === 'low') riskScore += 15;
      else if (formData.economic_level === 'medium') riskScore += 5;

      if (formData.symptoms.skin_pallor || formData.symptoms.pale_conjunctiva ||
        formData.symptoms.brittle_nails || formData.symptoms.fatigue_weakness) {
        riskScore += 25;
        deficiencies.push({
          nutrient: tx('Iron (आयरन)', 'Iron'),
          level: 'HIGH',
          foods: {
            urban: ['पालक (Spinach)', 'चुकंदर (Beetroot)', 'अनार (Pomegranate)', 'अंडा (Egg)', 'पनीर (Paneer)'],
            rural: ['पालक', 'चुकंदर', 'गुड़', 'मूंग दाल', 'रागी'],
            tribal: ['पालक', 'चुकंदर', 'तिल', 'गुड़', 'जंगली साग']
          },
          tip: tx('Vitamin C के साथ खाएं - absorption 3 गुना बढ़ता है', 'Eat with Vitamin C - absorption increases 3x')
        });
      }

      if (formData.symptoms.night_blindness || formData.symptoms.dry_eyes ||
        formData.symptoms.frequent_infections) {
        riskScore += 20;
        deficiencies.push({
          nutrient: tx('Vitamin A (विटामिन ए)', 'Vitamin A'),
          level: 'HIGH',
          foods: {
            urban: ['गाजर (Carrot)', 'शकरकंद (Sweet Potato)', 'पपीता (Papaya)', 'मैंगो (Mango)', 'ब्रोकली'],
            rural: ['गाजर', 'लाल शकरकंद', 'केला', 'पपीता', 'कद्दू'],
            tribal: ['गाजर', 'पीली सब्ज़ियां', 'जंगली फल', 'केला']
          },
          tip: tx('दूध/तेल के साथ खाएं - Vitamin A fat-soluble है', 'Eat with milk/oil - fat-soluble vitamin')
        });
      }

      if (formData.symptoms.bone_pain || formData.symptoms.muscle_cramps ||
        formData.symptoms.brittle_bones) {
        riskScore += 25;
        deficiencies.push({
          nutrient: tx('Calcium + Vitamin D', 'Calcium + Vitamin D'),
          level: 'HIGH',
          foods: {
            urban: ['दूध (Milk)', 'दही (Curd)', 'पनीर (Paneer)', 'रागी (Ragi)', 'बादाम (Almond)'],
            rural: ['रागी', 'काले चने', 'तिल', 'गुड़', 'अंडा', 'दूध'],
            tribal: ['रागी', 'तिल', 'दूध (अगर मिले)', 'स्थानीय हरी सब्ज़ियां']
          },
          tip: tx('रोज़ 20 मिनट सुबह की धूप ज़रूरी है', 'Daily 20 min morning sunlight is essential')
        });
      }

      if (formData.symptoms.bleeding_gums || formData.symptoms.slow_healing) {
        riskScore += 15;
        deficiencies.push({
          nutrient: tx('Vitamin C (विटामिन सी)', 'Vitamin C'),
          level: 'MEDIUM',
          foods: {
            urban: ['आंवला (Amla)', 'नींबू (Lemon)', 'संतरा (Orange)', 'अमरूद (Guava)', 'कीवी'],
            rural: ['आंवला', 'नींबू', 'आम', 'टमाटर', 'अमरूद'],
            tribal: ['आंवला', 'नींबू', 'जंगली बेर', 'शहद']
          },
          tip: tx('रोज़ 1 आंवला = पूरे दिन का Vitamin C', 'Daily 1 Amla = Full day Vitamin C')
        });
      }

      if (formData.symptoms.mouth_ulcers || formData.symptoms.tongue_inflammation ||
        formData.symptoms.numbness_tingling) {
        riskScore += 15;
        deficiencies.push({
          nutrient: tx('Vitamin B12 / Folate', 'Vitamin B12 / Folate'),
          level: 'MEDIUM',
          foods: {
            urban: ['अंडा (Egg)', 'दूध (Milk)', 'पनीर (Paneer)', 'फोर्टिफाइड सीरियल'],
            rural: ['अंडा', 'दूध', 'मेथी', 'पालक', 'मटर'],
            tribal: ['अंडा (अगर मिले)', 'दूध', 'हरी पत्तेदार सब्ज़ियां']
          },
          tip: tx('शाकाहारी लोगों में B12 की कमी सबसे common है', 'B12 deficiency most common in vegetarians')
        });
      }

      if (formData.symptoms.hair_loss || formData.symptoms.loss_of_appetite ||
        formData.symptoms.frequent_infections) {
        riskScore += 10;
        deficiencies.push({
          nutrient: tx('Zinc (जिंक)', 'Zinc'),
          level: 'MEDIUM',
          foods: {
            urban: ['कद्दू के बीज', 'मूंगफली', 'छोले', 'काजू (Cashew)', 'बादाम'],
            rural: ['कद्दू के बीज', 'मूंगफली', 'चना', 'मसूर दाल'],
            tribal: ['कद्दू के बीज', 'मूंगफली', 'स्थानीय मेवे']
          },
          tip: tx('Zinc immunity और growth दोनों के लिए ज़रूरी है', 'Zinc essential for immunity and growth')
        });
      }

      riskScore = Math.min(riskScore, 100);

      setResults({
        overall_risk: riskScore,
        risk_level: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW',
        deficiencies,
        symptoms_detected: checked,
        total_symptoms: symptomsList.length,
        diet_level: formData.diet_level,
        economic_level: formData.economic_level,
        location: formData.location,
      });
      setLoading(false);
    }, 1200);
  };

  const getRiskColor = (level) => {
    if (level === 'HIGH') return '#dc3545';
    if (level === 'MEDIUM') return '#fd7e14';
    return '#28a745';
  };

  const s = {
    container: { maxWidth: '900px', margin: '0 auto', padding: '20px' },
    header: { background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '25px', borderRadius: '16px', color: 'white', textAlign: 'center', marginBottom: '20px' },
    card: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '20px' },
    inputGroup: { marginBottom: '16px' },
    label: { display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#333', fontSize: '14px' },
    input: { width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px', outline: 'none' },
    select: { width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px', background: 'white' },
    helpText: { fontSize: '12px', color: '#666', marginTop: '4px', fontStyle: 'italic' },
    stepBar: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' },
    stepDot: (active, completed) => ({ width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: completed ? '#28a745' : active ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e0e0e0', color: active || completed ? 'white' : '#999', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }),
    btnPrimary: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    levelCard: (selected, color) => ({ padding: '14px', borderRadius: '10px', cursor: 'pointer', border: selected ? `3px solid ${color}` : '2px solid #e0e0e0', background: selected ? `${color}12` : 'white', marginBottom: '10px', transition: 'all 0.2s' }),
    symptomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' },
    symptomItem: (checked) => ({ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', border: checked ? '2px solid #667eea' : '1px solid #e0e0e0', background: checked ? '#ebf4ff' : '#fff', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }),
    foodTag: { display: 'inline-block', padding: '4px 10px', borderRadius: '15px', background: '#f0fff4', color: '#276749', fontSize: '12px', margin: '3px', border: '1px solid #c6f6d5' },
    defCard: (color) => ({ background: 'white', padding: '16px', borderRadius: '10px', borderLeft: `4px solid ${color}`, marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }),
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>
          🔬 {tx('Hidden Hunger Predictor', 'हिडन हंगर प्रिडिक्टर')}
        </h1>
        <p style={{ fontSize: '14px', opacity: 0.9 }}>
          {tx('बिना blood test के micronutrient deficiency का पता लगाएं', 'Detect micronutrient deficiency without blood test')}
        </p>
      </div>

      {!results ? (
        <div>
          <div style={s.stepBar}>
            {[1, 2, 3].map(num => (
              <React.Fragment key={num}>
                <div style={s.stepDot(step === num, step > num)} onClick={() => step > num && setStep(num)}>
                  {step > num ? '✓' : num}
                </div>
                {num < 3 && <div style={{ width: '40px', height: '2px', background: step > num ? '#28a745' : '#e0e0e0', alignSelf: 'center' }} />}
              </React.Fragment>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '13px', color: '#666' }}>
            {step === 1 && tx('स्टेप 1: बुनियादी जानकारी', 'Step 1: Basic Information')}
            {step === 2 && tx('स्टेप 2: आहार और आर्थिक स्थिति', 'Step 2: Diet & Economic Status')}
            {step === 3 && tx('स्टेप 3: लक्षण जांच', 'Step 3: Symptoms Check')}
          </p>

          {step === 1 && (
            <div style={s.card}>
              <h3 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '8px', marginBottom: '16px' }}>
                👤 {tx('बुनियादी जानकारी', 'Basic Information')}
              </h3>
              <div style={s.inputGroup}>
                <label style={s.label}>{tx('बच्चे का नाम', "Child's Name")}</label>
                <input style={s.input} type="text"
                  placeholder={tx('नाम लिखें', 'Enter name')}
                  value={formData.child_name}
                  onChange={e => handleChange('child_name', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={s.inputGroup}>
                  <label style={s.label}>{tx('उम्र (महीनों में) *', 'Age (months) *')}</label>
                  <input style={s.input} type="number" min="6" max="60"
                    placeholder={tx('जैसे 24', 'e.g. 24')}
                    value={formData.child_age_months}
                    onChange={e => handleChange('child_age_months', e.target.value)} />
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>{tx('लिंग', 'Gender')}</label>
                  <select style={s.select} value={formData.child_gender}
                    onChange={e => handleChange('child_gender', e.target.value)}>
                    <option value="male">{tx('लड़का (Male)', 'Male (लड़का)')}</option>
                    <option value="female">{tx('लड़की (Female)', 'Female (लड़की)')}</option>
                  </select>
                </div>
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>{tx('क्षेत्र (Location)', 'Location/Area')}</label>
                <select style={s.select} value={formData.location}
                  onChange={e => handleChange('location', e.target.value)}>
                  <option value="urban">{tx('शहरी (Urban)', 'Urban (शहरी)')}</option>
                  <option value="rural">{tx('ग्रामीण (Rural)', 'Rural (ग्रामीण)')}</option>
                  <option value="tribal">{tx('आदिवासी (Tribal)', 'Tribal (आदिवासी)')}</option>
                </select>
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>{tx('आहार प्रकार', 'Diet Type')}</label>
                <select style={s.select} value={formData.diet_type}
                  onChange={e => handleChange('diet_type', e.target.value)}>
                  <option value="vegetarian">{tx('शाकाहारी (Vegetarian)', 'Vegetarian (शाकाहारी)')}</option>
                  <option value="non-vegetarian">{tx('मांसाहारी (Non-Veg)', 'Non-Vegetarian (मांसाहारी)')}</option>
                  <option value="mixed">{tx('मिश्रित (Mixed)', 'Mixed (मिश्रित)')}</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={s.card}>
              <h3 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '8px', marginBottom: '16px' }}>
                🍽️ {tx('आहार और आर्थिक स्थिति', 'Diet & Economic Status')}
              </h3>
              <div style={s.inputGroup}>
                <label style={s.label}>
                  🍽️ {tx('आहार की गुणवत्ता कैसी है? *', 'What is the diet quality? *')}
                </label>
                <p style={s.helpText}>
                  {tx('बच्चे को रोज़ क्या-क्या खाने को मिलता है उसके हिसाब से चुनें', 'Select based on what the child eats daily')}
                </p>
                {dietLevels.map(level => (
                  <div key={level.value}
                    style={s.levelCard(formData.diet_level === level.value, level.color)}
                    onClick={() => handleChange('diet_level', level.value)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '22px' }}>{level.icon}</span>
                      <span style={{ fontWeight: 'bold', fontSize: '15px', color: formData.diet_level === level.value ? level.color : '#333' }}>
                        {level.label}
                      </span>
                      {formData.diet_level === level.value && (
                        <span style={{ marginLeft: 'auto', color: level.color, fontSize: '18px' }}>✓</span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#555', margin: '0 0 4px 32px' }}>{level.description}</p>
                    <p style={{ fontSize: '12px', color: '#888', margin: '0 0 0 32px' }}>
                      {tx('उदाहरण: ', 'Example: ')}{level.examples}
                    </p>
                  </div>
                ))}
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>
                  💰 {tx('परिवार की आर्थिक स्थिति कैसी है? *', 'What is the economic status? *')}
                </label>
                <p style={s.helpText}>
                  {tx('परिवार की आमदनी और खर्च के हिसाब से चुनें', 'Select based on family income and expenses')}
                </p>
                {economicLevels.map(level => (
                  <div key={level.value}
                    style={s.levelCard(formData.economic_level === level.value, level.color)}
                    onClick={() => handleChange('economic_level', level.value)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '22px' }}>{level.icon}</span>
                      <span style={{ fontWeight: 'bold', fontSize: '15px', color: formData.economic_level === level.value ? level.color : '#333' }}>
                        {level.label}
                      </span>
                      {formData.economic_level === level.value && (
                        <span style={{ marginLeft: 'auto', color: level.color, fontSize: '18px' }}>✓</span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#555', margin: '0 0 4px 32px' }}>{level.description}</p>
                    <p style={{ fontSize: '12px', color: '#888', margin: '0 0 0 32px' }}>
                      {tx('उदाहरण: ', 'Example: ')}{level.examples}
                    </p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '2px dashed #e0e0e0', paddingTop: '16px', marginTop: '8px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '12px', color: '#555' }}>
                  {tx('कुछ और जानकारी (Optional)', 'Some more info (Optional)')}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={s.inputGroup}>
                    <label style={s.label}>🍎 {tx('हफ्ते में फल?', 'Fruits per week?')}</label>
                    <select style={s.select} value={formData.fruit_per_week}
                      onChange={e => handleChange('fruit_per_week', e.target.value)}>
                      <option value="">{tx('-- चुनें --', '-- Select --')}</option>
                      <option value="never">{tx('कभी नहीं', 'Never')}</option>
                      <option value="sometimes">{tx('कभी-कभी (1-2)', 'Sometimes (1-2)')}</option>
                      <option value="often">{tx('अक्सर (3-4)', 'Often (3-4)')}</option>
                      <option value="daily">{tx('रोज़', 'Daily')}</option>
                    </select>
                  </div>
                  <div style={s.inputGroup}>
                    <label style={s.label}>🥛 {tx('रोज़ दूध/दही?', 'Milk/Curd daily?')}</label>
                    <select style={s.select} value={formData.milk_products}
                      onChange={e => handleChange('milk_products', e.target.value)}>
                      <option value="">{tx('-- चुनें --', '-- Select --')}</option>
                      <option value="yes">{tx('हाँ (Yes)', 'Yes (हाँ)')}</option>
                      <option value="no">{tx('नहीं (No)', 'No (नहीं)')}</option>
                    </select>
                  </div>
                  <div style={s.inputGroup}>
                    <label style={s.label}>☀️ {tx('रोज़ धूप (घंटे)?', 'Daily sunlight (hours)?')}</label>
                    <input style={s.input} type="number" min="0" max="8"
                      placeholder={tx('जैसे 2', 'e.g. 2')}
                      value={formData.sunlight_hours}
                      onChange={e => handleChange('sunlight_hours', e.target.value)} />
                  </div>
                  <div style={s.inputGroup}>
                    <label style={s.label}>💧 {tx('रोज़ पानी (गिलास)?', 'Daily water (glasses)?')}</label>
                    <input style={s.input} type="number" min="0" max="15"
                      placeholder={tx('जैसे 6', 'e.g. 6')}
                      value={formData.water_glasses}
                      onChange={e => handleChange('water_glasses', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={s.card}>
              <h3 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '8px', marginBottom: '12px' }}>
                🩺 {tx('लक्षण जांच', 'Symptoms Check')}
              </h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', background: '#f0f4ff', padding: '10px', borderRadius: '8px' }}>
                {tx('👉 जो भी लक्षण बच्चे में दिखें, उन पर click करें। कोई नहीं है तो खाली छोड़ दें।',
                  '👉 Click on symptoms present in the child. Leave empty if none.')}
              </p>
              <div style={s.symptomGrid}>
                {symptomsList.map(symptom => (
                  <div key={symptom.key}
                    onClick={() => handleSymptomToggle(symptom.key)}
                    style={s.symptomItem(formData.symptoms[symptom.key])}>
                    <span style={{ fontSize: '22px', flexShrink: 0 }}>{symptom.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: formData.symptoms[symptom.key] ? '#667eea' : '#333' }}>
                        {lang === 'hi' ? symptom.hi : symptom.en}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{symptom.nutrient}</div>
                    </div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '4px', border: formData.symptoms[symptom.key] ? 'none' : '2px solid #ccc', background: formData.symptoms[symptom.key] ? '#667eea' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {formData.symptoms[symptom.key] && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '16px', padding: '12px', background: '#f0f4ff', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                  {Object.values(formData.symptoms).filter(Boolean).length}
                </span>
                <span style={{ fontSize: '13px', color: '#666' }}>
                  {' '}/{' '}{symptomsList.length}{' '}
                  {tx('लक्षण चयनित', 'symptoms selected')}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)}
                style={{ flex: 1, padding: '12px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                ◀ {tx('पीछे', 'Previous')}
              </button>
            )}
            {step < 3 ? (
              <button type="button"
                onClick={() => {
                  if (canProceed()) setStep(step + 1);
                  else alert(tx('कृपया ज़रूरी जानकारी भरें', 'Please fill required fields'));
                }}
                style={{ ...s.btnPrimary, flex: 1 }}>
                {tx('आगे', 'Next')} ▶
              </button>
            ) : (
              <button type="button" onClick={analyzeHiddenHunger} disabled={loading}
                style={{ ...s.btnPrimary, flex: 1, opacity: loading ? 0.7 : 1 }}>
                {loading ? '⏳ ' + tx('विश्लेषण हो रहा है...', 'Analyzing...') : '🔬 ' + tx('विश्लेषण करें', 'Analyze')}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ background: getRiskColor(results.risk_level) + '15', padding: '25px', borderRadius: '16px', textAlign: 'center', border: '3px solid ' + getRiskColor(results.risk_level), marginBottom: '20px' }}>
            <h2 style={{ color: getRiskColor(results.risk_level), fontSize: '20px' }}>
              {tx('समग्र माइक्रोन्यूट्रिएंट जोखिम', 'Overall Micronutrient Risk')}
            </h2>
            <div style={{ fontSize: '64px', fontWeight: '800', color: getRiskColor(results.risk_level), lineHeight: 1.2 }}>
              {results.overall_risk}%
            </div>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: getRiskColor(results.risk_level), margin: '8px 0' }}>
              {results.risk_level === 'HIGH' ? tx('🔴 उच्च जोखिम', '🔴 HIGH RISK') :
                results.risk_level === 'MEDIUM' ? tx('🟠 मध्यम जोखिम', '🟠 MEDIUM RISK') :
                  tx('🟢 कम जोखिम', '🟢 LOW RISK')}
            </p>
            <p style={{ fontSize: '13px', color: '#666' }}>
              {results.symptoms_detected}/{results.total_symptoms} {tx('लक्षण पाए गए', 'symptoms detected')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: tx('आहार स्तर', 'Diet Level'), value: results.diet_level, icon: '🍽️' },
              { label: tx('आर्थिक स्तर', 'Economic Level'), value: results.economic_level, icon: '💰' }
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '28px' }}>{item.icon}</div>
                <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>{item.label}</p>
                <p style={{ fontWeight: 'bold', color: getRiskColor(item.value === 'low' ? 'HIGH' : item.value === 'medium' ? 'MEDIUM' : 'LOW'), textTransform: 'uppercase', margin: 0 }}>
                  {item.value === 'low' ? tx('कम', 'Low') : item.value === 'medium' ? tx('मध्यम', 'Medium') : tx('अच्छा', 'High')}
                </p>
              </div>
            ))}
          </div>

          {results.deficiencies.length > 0 && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
              <h3 style={{ color: '#667eea', marginBottom: '16px' }}>
                📋 {tx('पाई गई कमियां', 'Detected Deficiencies')}
              </h3>
              {results.deficiencies.map((d, i) => (
                <div key={i} style={s.defCard(getRiskColor(d.level))}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{d.nutrient}</h4>
                    <span style={{ padding: '3px 10px', borderRadius: '15px', background: getRiskColor(d.level) + '20', color: getRiskColor(d.level), fontSize: '12px', fontWeight: 'bold' }}>
                      {d.level === 'HIGH' ? tx('उच्च जोखिम', 'HIGH') : tx('मध्यम जोखिम', 'MEDIUM')}
                    </span>
                  </div>
                  <p style={{ fontWeight: 'bold', margin: '10px 0 6px', fontSize: '13px' }}>
                    🥗 {tx('आपके क्षेत्र में उपलब्ध खाद्य पदार्थ:', 'Foods available in your area:')}
                  </p>
                  <div style={{ marginBottom: '10px' }}>
                    {d.foods[results.location].map((f, j) => (
                      <span key={j} style={s.foodTag}>{f}</span>
                    ))}
                  </div>
                  <div style={{ background: '#fffff0', padding: '10px', borderRadius: '6px', fontSize: '13px', color: '#856404', border: '1px solid #fefcbf' }}>
                    💡 {d.tip}
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.deficiencies.length === 0 && (
            <div style={{ background: '#d4edda', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '32px' }}>✅</p>
              <h3 style={{ color: '#155724' }}>{tx('कोई कमी नहीं पाई गई', 'No deficiencies detected')}</h3>
              <p style={{ color: '#155724', fontSize: '14px' }}>{tx('अच्छा आहार जारी रखें', 'Keep up the good diet')}</p>
            </div>
          )}

          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
            <h3 style={{ color: '#667eea', marginBottom: '16px' }}>💡 {tx('कार्ययोजना', 'Action Plan')}</h3>
            {[
              { icon: '🏥', text: tx('ICDS/Anganwadi से मुफ्त IFA syrup और Vitamin A drops लें', 'Get free IFA syrup and Vitamin A drops from ICDS/Anganwadi') },
              { icon: '☀️', text: tx('रोज़ सुबह 20-30 मिनट धूप में रहें', 'Stay in morning sunlight 20-30 min daily') },
              { icon: '🥗', text: tx('हर food group से कुछ न कुछ रोज़ खाएं', 'Eat from every food group daily') },
              { icon: '💊', text: tx('Doctor से परामर्श लेकर supplement शुरू करें', 'Start supplements after consulting doctor') },
            ].map((rec, i) => (
              <div key={i} style={{ padding: '10px 12px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{rec.icon}</span>
                <span style={{ fontSize: '13px', lineHeight: 1.5 }}>{rec.text}</span>
              </div>
            ))}
          </div>

          <button onClick={() => { setResults(null); setStep(1); }}
            style={{ ...s.btnPrimary, background: '#6c757d' }}>
            🔄 {tx('नई जांच करें', 'New Assessment')}
          </button>
        </div>
      )}
    </div>
  );
}

export default HiddenHunger;