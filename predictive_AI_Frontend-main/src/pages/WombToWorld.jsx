import React, { useState } from 'react';

function WombToWorld({ userId, lang }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mother_name: '',
    mother_age: '',
    mother_weight: '',
    mother_height: '',
    mother_bmi: '',
    weeks_pregnant: '',
    trimester: '1',
    anc_visits: '',
    ifa_tablets: '',
    tetanus_vaccine: '',
    hemoglobin: '',
    previous_pregnancies: '0',
    diabetes: 'no',
    thyroid: 'no',
    blood_pressure: 'normal',
    diet_level: '',
    diet_type: 'mixed',
    economic_level: '',
    location: 'urban',
    sanitation: 'good',
    drinking_water: 'safe',
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const tx = (hi, en) => lang === 'hi' ? hi : en;

  // ✅ Diet Level Options
  const dietLevels = [
    {
      value: 'low',
      label: tx('कम (Low)', 'Low'),
      color: '#dc3545',
      icon: '🔴',
      description: tx(
        'सिर्फ एक-दो तरह का खाना — जैसे सिर्फ रोटी-दाल। फल, दूध, अंडा, हरी सब्ज़ियां बहुत कम या बिल्कुल नहीं।',
        'Only 1-2 food types — like only roti-dal. Fruits, milk, eggs, green vegetables very less or none.'
      ),
      examples: tx('रोटी + दाल + नमक (रोज़)', 'Roti + Dal + Salt (daily)'),
    },
    {
      value: 'medium',
      label: tx('मध्यम (Medium)', 'Medium'),
      color: '#fd7e14',
      icon: '🟠',
      description: tx(
        'रोटी, दाल, सब्ज़ी रोज़ मिलती है। लेकिन फल, दूध, अंडा, dry fruits कभी-कभी ही मिलते हैं। पोषण में कुछ कमी है।',
        'Roti, dal, vegetables daily. But fruits, milk, eggs, dry fruits only sometimes.'
      ),
      examples: tx('रोटी + दाल + सब्ज़ी (रोज़), दूध/फल कभी-कभी', 'Roti + Dal + Sabzi daily, Milk/Fruit sometimes'),
    },
    {
      value: 'high',
      label: tx('अच्छा (High)', 'High'),
      color: '#28a745',
      icon: '🟢',
      description: tx(
        'सभी food groups रोज़ मिलते हैं — अनाज, प्रोटीन, सब्ज़ी, फल, दूध/दही, अंडा। गर्भावस्था के लिए अच्छा पोषण।',
        'All food groups daily — grains, protein, vegetables, fruits, milk/curd, egg. Good nutrition for pregnancy.'
      ),
      examples: tx('रोटी + दाल + सब्ज़ी + दूध + फल + अंडा (रोज़)', 'Roti + Dal + Sabzi + Milk + Fruit + Egg (daily)'),
    }
  ];

  // ✅ Economic Level Options
  const economicLevels = [
    {
      value: 'low',
      label: tx('निम्न (Low)', 'Low'),
      color: '#dc3545',
      icon: '🔴',
      description: tx(
        'परिवार की आमदनी बहुत कम है। BPL card है या Government की मदद ज़रूरी है। खाने-दवाई का खर्च उठाना मुश्किल है।',
        'Very low family income. BPL card or Government support needed. Difficult to afford food and medicine.'
      ),
      examples: tx('BPL परिवार, दिहाड़ी मज़दूर, ₹0-5000/महीना', 'BPL family, daily wage, ₹0-5000/month'),
    },
    {
      value: 'medium',
      label: tx('मध्यम (Medium)', 'Medium'),
      color: '#fd7e14',
      icon: '🟠',
      description: tx(
        'गुज़ारा चल जाता है लेकिन बचत कम है। पोषणयुक्त खाना हमेशा afford नहीं होता। ICDS का लाभ लें।',
        'Manages but savings low. Cannot always afford nutritious food. Should avail ICDS benefits.'
      ),
      examples: tx('छोटा व्यापार, सरकारी नौकरी, ₹5000-15000/महीना', 'Small business, govt job, ₹5000-15000/month'),
    },
    {
      value: 'high',
      label: tx('अच्छा (High)', 'High'),
      color: '#28a745',
      icon: '🟢',
      description: tx(
        'परिवार की आमदनी अच्छी है। पोषणयुक्त खाना, Doctor checkup और दवाइयां आसानी से afford हो सकती हैं।',
        'Good family income. Can easily afford nutritious food, doctor checkups and medicines.'
      ),
      examples: tx('अच्छी नौकरी, व्यापार, ₹15000+/महीना', 'Good job, business, ₹15000+/month'),
    }
  ];

  const calculateBMI = (weight, height) => {
    const w = parseFloat(weight || formData.mother_weight);
    const h = parseFloat(height || formData.mother_height);
    if (w && h && h > 0) {
      return (w / Math.pow(h / 100, 2)).toFixed(1);
    }
    return '';
  };

  const handleChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    if (key === 'mother_weight' || key === 'mother_height') {
      const bmi = calculateBMI(
        key === 'mother_weight' ? value : formData.mother_weight,
        key === 'mother_height' ? value : formData.mother_height
      );
      updated.mother_bmi = bmi;
    }
    setFormData(updated);
  };

  const canProceed = () => {
    if (step === 1) return formData.mother_age !== '' && formData.mother_weight !== '' && formData.mother_height !== '';
    if (step === 2) return formData.trimester !== '';
    if (step === 3) return formData.diet_level !== '' && formData.economic_level !== '';
    return true;
  };

  const predictRisk = () => {
    setLoading(true);
    setTimeout(() => {
      const hb = parseFloat(formData.hemoglobin) || 11;
      const bmi = parseFloat(formData.mother_bmi) || 22;
      const age = parseInt(formData.mother_age) || 25;
      const anc = parseInt(formData.anc_visits) || 4;

      let riskScore = 15;
      const riskFactors = [];
      const protectiveFactors = [];

      // Hemoglobin
      if (hb < 7) { riskScore += 30; riskFactors.push(tx('गंभीर एनीमिया (Hb: ' + hb + ' g/dL)', 'Severe Anemia (Hb: ' + hb + ' g/dL)')); }
      else if (hb < 10) { riskScore += 20; riskFactors.push(tx('मध्यम एनीमिया (Hb: ' + hb + ')', 'Moderate Anemia (Hb: ' + hb + ')')); }
      else if (hb < 11) { riskScore += 10; riskFactors.push(tx('हल्की एनीमिया', 'Mild Anemia')); }
      else { protectiveFactors.push(tx('सामान्य Hemoglobin ✅', 'Normal Hemoglobin ✅')); }

      // BMI
      if (bmi < 18.5) { riskScore += 25; riskFactors.push(tx('कम वज़न (BMI: ' + bmi + ')', 'Underweight (BMI: ' + bmi + ')')); }
      else if (bmi > 30) { riskScore += 15; riskFactors.push(tx('मोटापा (BMI: ' + bmi + ')', 'Obesity (BMI: ' + bmi + ')')); }
      else { protectiveFactors.push(tx('सामान्य BMI (' + bmi + ') ✅', 'Normal BMI (' + bmi + ') ✅')); }

      // Age
      if (age < 18) { riskScore += 20; riskFactors.push(tx('किशोर गर्भावस्था (उम्र: ' + age + ')', 'Teenage pregnancy (Age: ' + age + ')')); }
      else if (age > 35) { riskScore += 15; riskFactors.push(tx('35+ उम्र में गर्भावस्था', '35+ age pregnancy')); }
      else { protectiveFactors.push(tx('सामान्य उम्र ✅', 'Normal age ✅')); }

      // ANC
      if (anc < 4) { riskScore += 15; riskFactors.push(tx('कम ANC visits (' + anc + ')', 'Low ANC visits (' + anc + ')')); }
      else { protectiveFactors.push(tx('पर्याप्त ANC visits ✅', 'Adequate ANC visits ✅')); }

      // Diet
      if (formData.diet_level === 'low') { riskScore += 20; riskFactors.push(tx('खराब आहार गुणवत्ता', 'Poor diet quality')); }
      else if (formData.diet_level === 'medium') { riskScore += 8; }
      else if (formData.diet_level === 'high') { protectiveFactors.push(tx('अच्छा आहार ✅', 'Good diet ✅')); }

      // Economic
      if (formData.economic_level === 'low') { riskScore += 15; riskFactors.push(tx('निम्न आर्थिक स्थिति', 'Low economic status')); }
      else if (formData.economic_level === 'medium') { riskScore += 5; }
      else { protectiveFactors.push(tx('अच्छी आर्थिक स्थिति ✅', 'Good economic status ✅')); }

      // Diabetes
      if (formData.diabetes === 'yes') { riskScore += 10; riskFactors.push(tx('मधुमेह', 'Diabetes')); }

      // IFA
      if (formData.ifa_tablets === 'no') { riskScore += 10; riskFactors.push(tx('IFA tablets नहीं ले रही', 'Not taking IFA tablets')); }
      else if (formData.ifa_tablets === 'regular') { protectiveFactors.push(tx('नियमित IFA tablets ✅', 'Regular IFA tablets ✅')); }

      // Location
      if (formData.location === 'tribal') riskScore += 8;
      if (formData.drinking_water === 'unsafe') { riskScore += 8; riskFactors.push(tx('असुरक्षित पीने का पानी', 'Unsafe drinking water')); }

      riskScore = Math.min(riskScore, 100);

      // Child Outcomes
      const childOutcomes = {
        low_birth_weight: { risk: riskScore > 65 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW', prediction: riskScore > 65 ? tx('< 2.0 किग्रा (बहुत कम)', '< 2.0 kg (Very Low)') : riskScore > 40 ? tx('2.0-2.5 किग्रा (कम)', '2.0-2.5 kg (Low)') : tx('2.5-3.5 किग्रा (सामान्य)', '2.5-3.5 kg (Normal)') },
        stunting_risk: { risk: riskScore > 55 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW', prediction: riskScore > 55 ? tx('उच्च बौनापन जोखिम', 'High Stunting Risk') : riskScore > 30 ? tx('मध्यम जोखिम', 'Medium Risk') : tx('कम जोखिम', 'Low Risk') },
        preterm_birth: { risk: riskScore > 60 ? 'HIGH' : riskScore > 35 ? 'MEDIUM' : 'LOW', prediction: riskScore > 60 ? tx('समय से पहले जन्म संभव', 'Preterm birth possible') : tx('सामान्य समय पर जन्म', 'Normal term birth') },
        wasting_risk: { risk: riskScore > 50 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW', prediction: riskScore > 50 ? tx('उच्च दुबलापन जोखिम', 'High Wasting Risk') : riskScore > 30 ? tx('मध्यम जोखिम', 'Medium Risk') : tx('कम जोखिम', 'Low Risk') }
      };

      // Trimester + Location based diets
      const diets = {
        '1': {
          title: tx('पहली तिमाही (0-12 सप्ताह)', 'First Trimester (0-12 weeks)'),
          focus: tx('फोलिक एसिड + आयरन', 'Folic Acid + Iron'),
          calories: '1800-2000 kcal',
          foods: {
            urban: ['पालक (Spinach)', 'ब्रोकली', 'अंडा (Egg)', 'संतरा (Orange)', 'चुकंदर (Beetroot)', 'पनीर (Paneer)', 'फोर्टिफाइड सीरियल'],
            rural: ['पालक', 'मेथी', 'अंडा', 'चुकंदर', 'मटर', 'छोले', 'तिल', 'गुड़'],
            tribal: ['पालक', 'जंगली हरी सब्ज़ियां', 'तिल', 'गुड़', 'स्थानीय दालें']
          },
          avoid: {
            urban: ['Raw fish (कच्ची मछली)', 'Unpasteurized cheese', 'Excess caffeine (चाय/कॉफी)'],
            rural: ['कच्चा पपीता', 'अनानास', 'ज़्यादा चाय'],
            tribal: ['कच्चा पपीता', 'अनानास', 'जड़ी-बूटी दवाएं (बिना Doctor के)']
          }
        },
        '2': {
          title: tx('दूसरी तिमाही (13-26 सप्ताह)', 'Second Trimester (13-26 weeks)'),
          focus: tx('Calcium + Protein + आयरन', 'Calcium + Protein + Iron'),
          calories: '2200-2400 kcal',
          foods: {
            urban: ['दूध (Milk)', 'दही (Curd)', 'पनीर (Paneer)', 'सैल्मन मछली', 'बादाम', 'ओट्स', 'सोयाबीन'],
            rural: ['दूध', 'दही', 'पनीर', 'रागी', 'सोयाबीन', 'मछली', 'अंडा', 'मटर'],
            tribal: ['रागी', 'दूध (अगर मिले)', 'दही', 'स्थानीय मछली', 'कोदो', 'ज्वार']
          },
          avoid: {
            urban: ['Junk food (जंक फूड)', 'Excess salt (ज़्यादा नमक)', 'Raw eggs'],
            rural: ['जंक फूड', 'ज़्यादा नमक', 'कच्चे अंडे'],
            tribal: ['जंक फूड', 'ज़्यादा मसाला', 'बाज़ार का पैकेट खाना']
          }
        },
        '3': {
          title: tx('तीसरी तिमाही (27-40 सप्ताह)', 'Third Trimester (27-40 weeks)'),
          focus: tx('ऊर्जा + DHA + आयरन', 'Energy + DHA + Iron'),
          calories: '2400-2600 kcal',
          foods: {
            urban: ['ड्राई फ्रूट्स', 'केला', 'शहद', 'ऑइलव फिश', 'अखरोट', 'स्वीट पोटैटो', 'एवोकाडो'],
            rural: ['घी', 'मेवे', 'केला', 'शकरकंद', 'नारियल', 'अखरोट', 'गुड़', 'तिल'],
            tribal: ['घी', 'मक्का', 'शकरकंद', 'केला', 'नारियल', 'स्थानीय मेवे', 'गुड़']
          },
          avoid: {
            urban: ['Excess sugar', 'Heavy meals at night', 'Spicy food'],
            rural: ['ज़्यादा चीनी', 'रात में भारी खाना', 'बहुत मसालेदार खाना'],
            tribal: ['ज़्यादा चीनी', 'रात में भारी खाना', 'कठिन पचने वाला खाना']
          }
        }
      };

      setResults({
        risk_level: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW',
        risk_score: riskScore,
        risk_factors: riskFactors,
        protective_factors: protectiveFactors,
        child_outcomes: childOutcomes,
        trimester_diet: diets[formData.trimester] || diets['1'],
        location: formData.location,
        recommendations: [
          { icon: '💊', text: tx('रोज़ 1 IFA tablet (Iron + Folic Acid) लें', 'Take 1 IFA tablet daily') },
          { icon: '🥗', text: tx('प्रोटीन-rich diet: दाल, अंडा, दूध, पनीर रोज़ लें', 'Protein-rich diet: dal, egg, milk, paneer daily') },
          { icon: '☀️', text: tx('रोज़ 20-30 मिनट सुबह की धूप लें', 'Daily 20-30 min morning sunlight') },
          { icon: '💧', text: tx('रोज़ 8-10 गिलास साफ पानी पिएं', 'Drink 8-10 glasses clean water daily') },
          { icon: '🏥', text: tx('नियमित ANC checkup जारी रखें (कम से कम 4)', 'Continue regular ANC checkups (at least 4)') },
          { icon: '😴', text: tx('8 घंटे नींद ज़रूरी है - बाईं करवट सोएं', 'Sleep 8 hours - lie on left side') },
        ],
        schemes: [
          { name: tx('JSY - जननी सुरक्षा योजना', 'JSY - Janani Suraksha Yojana'), desc: tx('संस्थागत प्रसव पर ₹1400 सहायता', '₹1400 for institutional delivery') },
          { name: tx('PMMVY - PM मातृ वंदना योजना', 'PMMVY'), desc: tx('पहले बच्चे के लिए ₹5000 सहायता', '₹5000 for first child') },
          { name: tx('ICDS - एकीकृत बाल विकास', 'ICDS'), desc: tx('मुफ्त पोषण + स्वास्थ्य सेवाएं', 'Free nutrition + healthcare') },
          { name: tx('मुफ्त IFA + Calcium गोलियां', 'Free IFA + Calcium tablets'), desc: tx('आंगनवाड़ी से मुफ्त दवाइयां', 'Free medicines from Anganwadi') },
        ],
        emergency_signs: [
          tx('अचानक बहुत ज़्यादा सूजन (चेहरा, हाथ, पैर)', 'Sudden excessive swelling (face, hands, feet)'),
          tx('तेज़ सिरदर्द + धुंधली नज़र', 'Severe headache + blurred vision'),
          tx('बच्चे की हलचल कम या बंद होना', 'Decreased or absent baby movements'),
          tx('योनि से खून आना', 'Vaginal bleeding'),
          tx('तेज़ बुखार + पेट दर्द', 'High fever + abdominal pain'),
        ]
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
    header: { background: 'linear-gradient(135deg, #e91e63, #9c27b0)', padding: '25px', borderRadius: '16px', color: 'white', textAlign: 'center', marginBottom: '20px' },
    card: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '20px' },
    inputGroup: { marginBottom: '16px' },
    label: { display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#333', fontSize: '14px' },
    input: { width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px', outline: 'none' },
    select: { width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px', background: 'white' },
    helpText: { fontSize: '12px', color: '#666', marginTop: '4px', fontStyle: 'italic' },
    stepBar: { display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' },
    stepDot: (active, completed) => ({ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: completed ? '#28a745' : active ? 'linear-gradient(135deg, #e91e63, #9c27b0)' : '#e0e0e0', color: active || completed ? 'white' : '#999', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }),
    btnPrimary: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e91e63, #9c27b0)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    levelCard: (selected, color) => ({ padding: '14px', borderRadius: '10px', cursor: 'pointer', border: selected ? `3px solid ${color}` : '2px solid #e0e0e0', background: selected ? `${color}12` : 'white', marginBottom: '10px', transition: 'all 0.2s' }),
    outcomeBox: (color) => ({ padding: '14px', borderRadius: '10px', textAlign: 'center', border: `2px solid ${color}`, background: color + '08' }),
    foodTag: { display: 'inline-block', padding: '4px 10px', borderRadius: '15px', background: '#fff5f7', color: '#97266d', fontSize: '12px', margin: '3px', border: '1px solid #fed7e2' },
    avoidTag: { display: 'inline-block', padding: '4px 10px', borderRadius: '15px', background: '#fff5f5', color: '#c53030', fontSize: '12px', margin: '3px', border: '1px solid #fed7d7' },
  };

  return (
    <div style={s.container}>
      {/* HEADER */}
      <div style={s.header}>
        <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>🤰 {tx('Womb to World Predictor', 'वम्ब टू वर्ल्ड प्रिडिक्टर')}</h1>
        <p style={{ fontSize: '14px', opacity: 0.9 }}>{tx('गर्भावस्था से 9 महीने पहले कुपोषण का prediction', 'Predict child malnutrition 9 months before birth')}</p>
      </div>

      {!results ? (
        <div>
          {/* STEP BAR */}
          <div style={s.stepBar}>
            {[1, 2, 3, 4].map(num => (
              <React.Fragment key={num}>
                <div style={s.stepDot(step === num, step > num)} onClick={() => step > num && setStep(num)}>
                  {step > num ? '✓' : num}
                </div>
                {num < 4 && <div style={{ width: '30px', height: '2px', background: step > num ? '#28a745' : '#e0e0e0', alignSelf: 'center' }} />}
              </React.Fragment>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '13px', color: '#666' }}>
            {step === 1 && tx('स्टेप 1: माँ की जानकारी', "Step 1: Mother's Info")}
            {step === 2 && tx('स्टेप 2: गर्भावस्था', 'Step 2: Pregnancy')}
            {step === 3 && tx('स्टेप 3: आहार और आर्थिक', 'Step 3: Diet & Economic')}
            {step === 4 && tx('स्टेप 4: स्थान', 'Step 4: Location')}
          </p>

          {/* STEP 1 */}
          {step === 1 && (
            <div style={s.card}>
              <h3 style={{ color: '#e91e63', borderBottom: '2px solid #e91e63', paddingBottom: '8px', marginBottom: '16px' }}>
                👩 {tx("माँ की जानकारी", "Mother's Information")}
              </h3>

              <div style={s.inputGroup}>
                <label style={s.label}>{tx('माँ का नाम', "Mother's Name")}</label>
                <input style={s.input} type="text" placeholder={tx('नाम लिखें', 'Enter name')}
                  value={formData.mother_name} onChange={e => handleChange('mother_name', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={s.inputGroup}>
                  <label style={s.label}>{tx('उम्र (वर्ष) *', 'Age (years) *')}</label>
                  <input style={s.input} type="number" min="15" max="45" placeholder="e.g. 24"
                    value={formData.mother_age} onChange={e => handleChange('mother_age', e.target.value)} />
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>{tx('वज़न (किग्रा) *', 'Weight (kg) *')}</label>
                  <input style={s.input} type="number" min="30" max="150" step="0.1" placeholder="e.g. 55"
                    value={formData.mother_weight} onChange={e => handleChange('mother_weight', e.target.value)} />
                </div>
              </div>

              <div style={s.inputGroup}>
                <label style={s.label}>{tx('लंबाई (सेमी) *', 'Height (cm) *')}</label>
                <input style={s.input} type="number" min="130" max="200" placeholder="e.g. 155"
                  value={formData.mother_height} onChange={e => handleChange('mother_height', e.target.value)} />
                <p style={s.helpText}>{tx('वज़न और लंबाई डालने पर BMI खुद calculate होगी', 'BMI will auto-calculate from weight and height')}</p>
              </div>

              {/* BMI Auto Display */}
              {formData.mother_bmi && (
                <div style={{ padding: '14px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center', marginBottom: '16px', border: `2px solid ${parseFloat(formData.mother_bmi) < 18.5 ? '#dc3545' : parseFloat(formData.mother_bmi) > 30 ? '#fd7e14' : '#28a745'}` }}>
                  <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px' }}>{tx('BMI (स्वतः गणना)', 'BMI (Auto-calculated)')}</p>
                  <p style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: parseFloat(formData.mother_bmi) < 18.5 ? '#dc3545' : parseFloat(formData.mother_bmi) > 30 ? '#fd7e14' : '#28a745' }}>
                    {formData.mother_bmi}
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '4px 0 0', color: parseFloat(formData.mother_bmi) < 18.5 ? '#dc3545' : parseFloat(formData.mother_bmi) > 30 ? '#fd7e14' : '#28a745' }}>
                    {parseFloat(formData.mother_bmi) < 18.5 ? tx('कम वज़न (Underweight)', 'Underweight') : parseFloat(formData.mother_bmi) > 30 ? tx('मोटापा (Obese)', 'Obese') : tx('सामान्य (Normal)', 'Normal')}
                  </p>
                </div>
              )}

              <div style={s.inputGroup}>
                <label style={s.label}>🩸 {tx('Hemoglobin (g/dL)', 'Hemoglobin (g/dL)')}</label>
                <input style={s.input} type="number" min="5" max="18" step="0.1" placeholder="e.g. 11.5"
                  value={formData.hemoglobin} onChange={e => handleChange('hemoglobin', e.target.value)} />
                <p style={s.helpText}>{tx('गर्भवती महिलाओं के लिए सामान्य: ≥ 11 g/dL', 'Normal for pregnant women: ≥ 11 g/dL')}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={s.inputGroup}>
                  <label style={s.label}>{tx('मधुमेह', 'Diabetes')}</label>
                  <select style={s.select} value={formData.diabetes} onChange={e => handleChange('diabetes', e.target.value)}>
                    <option value="no">{tx('नहीं', 'No')}</option>
                    <option value="yes">{tx('हाँ', 'Yes')}</option>
                  </select>
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>{tx('थायराइड', 'Thyroid')}</label>
                  <select style={s.select} value={formData.thyroid} onChange={e => handleChange('thyroid', e.target.value)}>
                    <option value="no">{tx('नहीं', 'No')}</option>
                    <option value="yes">{tx('हाँ', 'Yes')}</option>
                  </select>
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>{tx('Blood Pressure', 'BP')}</label>
                  <select style={s.select} value={formData.blood_pressure} onChange={e => handleChange('blood_pressure', e.target.value)}>
                    <option value="normal">{tx('सामान्य', 'Normal')}</option>
                    <option value="high">{tx('ज़्यादा', 'High')}</option>
                    <option value="low">{tx('कम', 'Low')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={s.card}>
              <h3 style={{ color: '#e91e63', borderBottom: '2px solid #e91e63', paddingBottom: '8px', marginBottom: '16px' }}>
                🤰 {tx('गर्भावस्था जानकारी', 'Pregnancy Information')}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={s.inputGroup}>
                  <label style={s.label}>{tx('गर्भावस्था सप्ताह', 'Weeks Pregnant')}</label>
                  <input style={s.input} type="number" min="1" max="42" placeholder="e.g. 20"
                    value={formData.weeks_pregnant} onChange={e => handleChange('weeks_pregnant', e.target.value)} />
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>{tx('तिमाही (Trimester)', 'Trimester')}</label>
                  <select style={s.select} value={formData.trimester} onChange={e => handleChange('trimester', e.target.value)}>
                    <option value="1">{tx('1st (0-12 सप्ताह)', '1st (0-12 weeks)')}</option>
                    <option value="2">{tx('2nd (13-26 सप्ताह)', '2nd (13-26 weeks)')}</option>
                    <option value="3">{tx('3rd (27-40 सप्ताह)', '3rd (27-40 weeks)')}</option>
                  </select>
                </div>
              </div>

              <div style={s.inputGroup}>
                <label style={s.label}>🏥 {tx('अब तक की ANC Checkups', 'ANC Visits Done')}</label>
                <input style={s.input} type="number" min="0" max="20" placeholder="e.g. 4"
                  value={formData.anc_visits} onChange={e => handleChange('anc_visits', e.target.value)} />
                <p style={s.helpText}>{tx('कम से कम 4 checkups ज़रूरी हैं', 'Minimum 4 checkups recommended')}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={s.inputGroup}>
                  <label style={s.label}>💊 {tx('IFA Tablets (आयरन की गोलियां)', 'IFA Tablets')}</label>
                  <select style={s.select} value={formData.ifa_tablets} onChange={e => handleChange('ifa_tablets', e.target.value)}>
                    <option value="">{tx('-- चुनें --', '-- Select --')}</option>
                    <option value="regular">{tx('नियमित ले रही हूं', 'Taking Regularly')}</option>
                    <option value="irregular">{tx('कभी-कभी', 'Irregular')}</option>
                    <option value="no">{tx('नहीं ले रही', 'Not Taking')}</option>
                  </select>
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>💉 {tx('टेटनस का टीका', 'Tetanus Vaccine')}</label>
                  <select style={s.select} value={formData.tetanus_vaccine} onChange={e => handleChange('tetanus_vaccine', e.target.value)}>
                    <option value="">{tx('-- चुनें --', '-- Select --')}</option>
                    <option value="yes">{tx('लग चुका', 'Done')}</option>
                    <option value="no">{tx('नहीं लगा', 'Not Done')}</option>
                  </select>
                </div>
              </div>

              <div style={s.inputGroup}>
                <label style={s.label}>{tx('पिछली गर्भावस्थाएं', 'Previous Pregnancies')}</label>
                <select style={s.select} value={formData.previous_pregnancies} onChange={e => handleChange('previous_pregnancies', e.target.value)}>
                  <option value="0">{tx('0 (पहली बार)', '0 (First time)')}</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3+">3+</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3 - Diet & Economic with Low/Medium/High cards */}
          {step === 3 && (
            <div style={s.card}>
              <h3 style={{ color: '#e91e63', borderBottom: '2px solid #e91e63', paddingBottom: '8px', marginBottom: '16px' }}>
                🍽️ {tx('आहार और आर्थिक स्थिति', 'Diet & Economic Status')}
              </h3>

              {/* Diet Level */}
              <div style={s.inputGroup}>
                <label style={s.label}>
                  🍽️ {tx('गर्भावस्था में आहार की गुणवत्ता कैसी है? *', 'How is the diet quality during pregnancy? *')}
                </label>
                <p style={s.helpText}>{tx('रोज़ क्या-क्या खाने को मिलता है उसके हिसाब से चुनें', 'Select based on what you eat daily')}</p>
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
                        <span style={{ marginLeft: 'auto', color: level.color, fontSize: '20px' }}>✓</span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#555', margin: '0 0 4px 32px' }}>{level.description}</p>
                    <p style={{ fontSize: '12px', color: '#888', margin: '0 0 0 32px' }}>{tx('उदाहरण: ', 'Example: ')}{level.examples}</p>
                  </div>
                ))}
              </div>

              <div style={s.inputGroup}>
                <label style={s.label}>{tx('आहार प्रकार', 'Diet Type')}</label>
                <select style={s.select} value={formData.diet_type} onChange={e => handleChange('diet_type', e.target.value)}>
                  <option value="vegetarian">{tx('शाकाहारी (Vegetarian)', 'Vegetarian (शाकाहारी)')}</option>
                  <option value="non-vegetarian">{tx('मांसाहारी (Non-Veg)', 'Non-Vegetarian (मांसाहारी)')}</option>
                  <option value="mixed">{tx('मिश्रित (Mixed)', 'Mixed (मिश्रित)')}</option>
                </select>
              </div>

              {/* Economic Level */}
              <div style={s.inputGroup}>
                <label style={s.label}>
                  💰 {tx('परिवार की आर्थिक स्थिति कैसी है? *', 'What is the family economic status? *')}
                </label>
                <p style={s.helpText}>{tx('सही विकल्प चुनें — इससे सरकारी सहायता के बारे में बताया जाएगा', 'Select correctly — this helps suggest government schemes')}</p>
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
                        <span style={{ marginLeft: 'auto', color: level.color, fontSize: '20px' }}>✓</span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#555', margin: '0 0 4px 32px' }}>{level.description}</p>
                    <p style={{ fontSize: '12px', color: '#888', margin: '0 0 0 32px' }}>{tx('उदाहरण: ', 'Example: ')}{level.examples}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div style={s.card}>
              <h3 style={{ color: '#e91e63', borderBottom: '2px solid #e91e63', paddingBottom: '8px', marginBottom: '16px' }}>
                📍 {tx('स्थान और वातावरण', 'Location & Environment')}
              </h3>

              <div style={s.inputGroup}>
                <label style={s.label}>{tx('क्षेत्र (Area)', 'Area/Locality')}</label>
                <select style={s.select} value={formData.location} onChange={e => handleChange('location', e.target.value)}>
                  <option value="urban">{tx('शहरी (Urban)', 'Urban (शहरी)')}</option>
                  <option value="rural">{tx('ग्रामीण (Rural)', 'Rural (ग्रामीण)')}</option>
                  <option value="tribal">{tx('आदिवासी (Tribal)', 'Tribal (आदिवासी)')}</option>
                </select>
                <p style={s.helpText}>{tx('Diet plan आपके क्षेत्र में उपलब्ध खाद्य पदार्थों के हिसाब से दिया जाएगा', 'Diet plan will be based on foods available in your area')}</p>
              </div>

              <div style={s.inputGroup}>
                <label style={s.label}>🏠 {tx('स्वच्छता (Sanitation)', 'Sanitation')}</label>
                <select style={s.select} value={formData.sanitation} onChange={e => handleChange('sanitation', e.target.value)}>
                  <option value="good">{tx('अच्छा - शौचालय है', 'Good - Toilet available')}</option>
                  <option value="fair">{tx('ठीक - साझा शौचालय', 'Fair - Shared toilet')}</option>
                  <option value="poor">{tx('खराब - खुले में', 'Poor - Open defecation')}</option>
                </select>
              </div>

              <div style={s.inputGroup}>
                <label style={s.label}>💧 {tx('पीने का पानी', 'Drinking Water')}</label>
                <select style={s.select} value={formData.drinking_water} onChange={e => handleChange('drinking_water', e.target.value)}>
                  <option value="safe">{tx('सुरक्षित/फिल्टर्ड', 'Safe/Filtered')}</option>
                  <option value="treated">{tx('पाइप का पानी', 'Treated/Piped')}</option>
                  <option value="unsafe">{tx('असुरक्षित - कुआं/तालाब', 'Unsafe - Well/Pond')}</option>
                </select>
              </div>

              <div style={{ padding: '14px', background: '#fff3cd', borderRadius: '10px', border: '2px solid #ffc107' }}>
                <p style={{ fontWeight: 'bold', color: '#856404', marginBottom: '6px' }}>💡 {tx('Note:', 'Note:')}</p>
                <p style={{ fontSize: '13px', color: '#856404', margin: 0 }}>
                  {tx('आपके क्षेत्र (Urban/Rural/Tribal) के हिसाब से diet recommendations दिए जाएंगे जिसमें वही खाद्य पदार्थ होंगे जो आपके area में आसानी से मिलते हैं।',
                    'Diet recommendations will be tailored to your area (Urban/Rural/Tribal) with foods easily available near you.')}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)}
                style={{ flex: 1, padding: '12px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                ◀ {tx('पीछे', 'Previous')}
              </button>
            )}
            {step < 4 ? (
              <button type="button"
                onClick={() => {
                  if (canProceed()) setStep(step + 1);
                  else alert(tx('कृपया सभी ज़रूरी जानकारी भरें (*)', 'Please fill all required fields (*)'));
                }}
                style={{ ...s.btnPrimary, flex: 1 }}>
                {tx('आगे', 'Next')} ▶
              </button>
            ) : (
              <button type="button" onClick={predictRisk} disabled={loading}
                style={{ ...s.btnPrimary, flex: 1, opacity: loading ? 0.7 : 1 }}>
                {loading ? '⏳ ' + tx('भविष्यवाणी हो रही है...', 'Predicting...') : '🤰 ' + tx('भविष्यवाणी करें', 'Predict')}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ========== RESULTS ========== */
        <div>
          {/* Overall Risk */}
          <div style={{ background: getRiskColor(results.risk_level) + '15', padding: '25px', borderRadius: '16px', textAlign: 'center', border: '3px solid ' + getRiskColor(results.risk_level), marginBottom: '20px' }}>
            <h2 style={{ color: getRiskColor(results.risk_level), fontSize: '18px' }}>{tx('बच्चे में कुपोषण का समग्र जोखिम', 'Overall Risk for Child Malnutrition')}</h2>
            <div style={{ fontSize: '64px', fontWeight: '800', color: getRiskColor(results.risk_level), lineHeight: 1.2 }}>{results.risk_score}%</div>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: getRiskColor(results.risk_level), margin: '8px 0' }}>
              {results.risk_level === 'HIGH' ? tx('🔴 उच्च जोखिम', '🔴 HIGH RISK') : results.risk_level === 'MEDIUM' ? tx('🟠 मध्यम जोखिम', '🟠 MEDIUM RISK') : tx('🟢 कम जोखिम', '🟢 LOW RISK')}
            </p>
          </div>

          {/* Child Outcomes */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
            <h3 style={{ color: '#e91e63', marginBottom: '16px' }}>👶 {tx('बच्चे के संभावित परिणाम', 'Predicted Child Outcomes')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {Object.entries(results.child_outcomes).map(([key, data]) => (
                <div key={key} style={s.outcomeBox(getRiskColor(data.risk))}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                    {key === 'low_birth_weight' && tx('कम जन्म वज़न', 'Low Birth Weight')}
                    {key === 'stunting_risk' && tx('बौनापन जोखिम', 'Stunting Risk')}
                    {key === 'preterm_birth' && tx('समय से पहले जन्म', 'Preterm Birth')}
                    {key === 'wasting_risk' && tx('दुबलाप�� जोखिम', 'Wasting Risk')}
                  </p>
                  <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 6px' }}>{data.prediction}</p>
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '10px', background: getRiskColor(data.risk) + '20', color: getRiskColor(data.risk), fontSize: '11px', fontWeight: 'bold' }}>{data.risk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk + Protective Factors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {results.risk_factors.length > 0 && (
              <div style={{ background: '#f8d7da', padding: '16px', borderRadius: '10px', border: '2px solid #dc3545' }}>
                <h4 style={{ color: '#721c24', marginBottom: '10px' }}>⚠️ {tx('जोखिम कारक', 'Risk Factors')}</h4>
                {results.risk_factors.map((f, i) => <div key={i} style={{ padding: '3px 0', color: '#721c24', fontSize: '13px' }}>• {f}</div>)}
              </div>
            )}
            {results.protective_factors.length > 0 && (
              <div style={{ background: '#d4edda', padding: '16px', borderRadius: '10px', border: '2px solid #28a745' }}>
                <h4 style={{ color: '#155724', marginBottom: '10px' }}>✅ {tx('सुरक्षात्मक कारक', 'Protective Factors')}</h4>
                {results.protective_factors.map((f, i) => <div key={i} style={{ padding: '3px 0', color: '#155724', fontSize: '13px' }}>• {f}</div>)}
              </div>
            )}
          </div>

          {/* Trimester Diet - Location Based */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
            <h3 style={{ color: '#e91e63', marginBottom: '8px' }}>🥗 {results.trimester_diet.title}</h3>
            <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', margin: '0 0 4px' }}><strong>{tx('Focus:', 'Focus:')} </strong>{results.trimester_diet.focus}</p>
              <p style={{ fontSize: '13px', margin: 0 }}><strong>{tx('Calories:', 'Calories:')} </strong>{results.trimester_diet.calories}</p>
            </div>

            <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
              ✅ {tx('आपके क्षेत्र में उपलब्ध खाद्य पदार्थ:', 'Foods available in your area:')}
              <span style={{ marginLeft: '8px', padding: '2px 8px', background: '#e91e63', color: 'white', borderRadius: '10px', fontSize: '11px' }}>
                {formData.location === 'urban' ? tx('शहरी', 'Urban') : formData.location === 'rural' ? tx('ग्रामीण', 'Rural') : tx('आदिवासी', 'Tribal')}
              </span>
            </p>
            <div style={{ marginBottom: '14px' }}>
              {results.trimester_diet.foods[results.location].map((f, i) => <span key={i} style={s.foodTag}>{f}</span>)}
            </div>

            <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>❌ {tx('इनसे बचें:', 'Avoid:')}</p>
            <div>{results.trimester_diet.avoid[results.location].map((f, i) => <span key={i} style={s.avoidTag}>{f}</span>)}</div>
          </div>

          {/* Recommendations */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
            <h3 style={{ color: '#e91e63', marginBottom: '16px' }}>💡 {tx('सुझाव', 'Recommendations')}</h3>
            {results.recommendations.map((rec, i) => (
              <div key={i} style={{ padding: '10px 12px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '6px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{rec.icon}</span>
                <span style={{ fontSize: '13px', lineHeight: 1.5 }}>{rec.text}</span>
              </div>
            ))}
          </div>

          {/* Government Schemes */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
            <h3 style={{ color: '#2196F3', marginBottom: '16px' }}>🏛️ {tx('सरकारी योजनाएं (मुफ्त)', 'Government Schemes (Free)')}</h3>
            {results.schemes.map((sc, i) => (
              <div key={i} style={{ background: '#e7f3ff', padding: '12px', borderRadius: '8px', marginBottom: '8px', borderLeft: '4px solid #2196F3' }}>
                <p style={{ fontWeight: 'bold', margin: 0, fontSize: '14px', color: '#0d47a1' }}>{sc.name}</p>
                <p style={{ fontSize: '12px', color: '#1565c0', margin: '4px 0 0' }}>{sc.desc}</p>
              </div>
            ))}
          </div>

          {/* Emergency Signs */}
          <div style={{ background: '#fff5f5', padding: '16px', borderRadius: '10px', border: '2px solid #dc3545', marginBottom: '20px' }}>
            <h4 style={{ color: '#c53030', marginBottom: '12px' }}>🚨 {tx('Emergency Signs — तुरंत Doctor दिखाएं!', 'Emergency Signs — Consult Doctor Immediately!')}</h4>
            {results.emergency_signs.map((sig, i) => (
              <div key={i} style={{ padding: '6px 10px', background: '#fff', borderRadius: '6px', marginBottom: '4px', fontSize: '13px', color: '#c53030' }}>🔴 {sig}</div>
            ))}
          </div>

          <button onClick={() => { setResults(null); setStep(1); }}
            style={{ ...s.btnPrimary, background: '#6c757d' }}>
            🔄 {tx('नई जांच', 'New Assessment')}
          </button>
        </div>
      )}
    </div>
  );
}

export default WombToWorld;