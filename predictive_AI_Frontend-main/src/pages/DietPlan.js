import React, { useMemo, useState } from 'react';

function DietPlan({ userId, lang = 'hi' }) {
  const tx = (hi, en) => (lang === 'hi' ? hi : en);

  const [severity, setSeverity] = useState('');
  const [areaType, setAreaType] = useState('');
  const [locationMode, setLocationMode] = useState('manual');
  const [manualLocation, setManualLocation] = useState('');
  const [pincode, setPincode] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [showPlan, setShowPlan] = useState(false);

  // ===============================
  // FOOD DATABASE
  // ===============================
  const foodDatabase = {
    common: [
      { id: 1, name: tx('🌾 गेहूँ', '🌾 Wheat'), cal: 340, tags: ['grain'] },
      { id: 2, name: tx('🍚 चावल', '🍚 Rice'), cal: 350, tags: ['grain'] },
      { id: 3, name: tx('🫘 दाल', '🫘 Dal'), cal: 340, tags: ['protein'] },
      { id: 4, name: tx('🥛 दूध', '🥛 Milk'), cal: 60, tags: ['protein', 'calcium'] },
      { id: 5, name: tx('🥚 अंडा', '🥚 Egg'), cal: 155, tags: ['protein'] },
      { id: 6, name: tx('🍌 केला', '🍌 Banana'), cal: 89, tags: ['fruit'] },
      { id: 7, name: tx('🥕 गाजर', '🥕 Carrot'), cal: 41, tags: ['veg', 'vitamin-a'] },
      { id: 8, name: tx('🥬 पालक', '🥬 Spinach'), cal: 23, tags: ['veg', 'iron'] },
      { id: 9, name: tx('🍠 शकरकंद', '🍠 Sweet Potato'), cal: 86, tags: ['veg', 'energy'] },
      { id: 10, name: tx('🥜 मूंगफली', '🥜 Peanuts'), cal: 567, tags: ['fat', 'protein'] },
      { id: 11, name: tx('🥔 आलू', '🥔 Potato'), cal: 77, tags: ['veg', 'energy'] },
      { id: 12, name: tx('🧈 घी', '🧈 Ghee'), cal: 900, tags: ['fat'] },
      { id: 13, name: tx('🍯 गुड़', '🍯 Jaggery'), cal: 383, tags: ['iron', 'energy'] },
      { id: 14, name: tx('🫙 दही', '🫙 Curd'), cal: 61, tags: ['protein', 'calcium'] },
      { id: 15, name: tx('🌽 मक्का', '🌽 Maize'), cal: 365, tags: ['grain'] },
      { id: 16, name: tx('🍅 टमाटर', '🍅 Tomato'), cal: 18, tags: ['veg', 'vitamin-c'] },
      { id: 17, name: tx('🫛 चना', '🫛 Chickpea'), cal: 364, tags: ['protein'] },
      { id: 18, name: tx('🌾 रागी', '🌾 Ragi'), cal: 336, tags: ['grain', 'calcium'] },
      { id: 19, name: tx('🍋 नींबू', '🍋 Lemon'), cal: 29, tags: ['fruit', 'vitamin-c'] },
      { id: 20, name: tx('🍊 संतरा', '🍊 Orange'), cal: 47, tags: ['fruit', 'vitamin-c'] },
      { id: 21, name: tx('🍎 सेब', '🍎 Apple'), cal: 52, tags: ['fruit'] },
      { id: 22, name: tx('🥛 पनीर', '🥛 Paneer'), cal: 265, tags: ['protein', 'calcium'] },
      { id: 23, name: tx('🐟 मछली', '🐟 Fish'), cal: 206, tags: ['protein'] },
      { id: 24, name: tx('🍗 चिकन', '🍗 Chicken'), cal: 239, tags: ['protein'] },
      { id: 25, name: tx('🫘 सोयाबीन', '🫘 Soybean'), cal: 446, tags: ['protein'] },
      { id: 26, name: tx('🥜 तिल', '🥜 Sesame'), cal: 573, tags: ['calcium', 'fat'] },
      { id: 27, name: tx('🍈 अमरूद', '🍈 Guava'), cal: 68, tags: ['fruit', 'vitamin-c'] },
      { id: 28, name: tx('🥭 आम', '🥭 Mango'), cal: 60, tags: ['fruit', 'vitamin-a'] },
      { id: 29, name: tx('🌿 मेथी', '🌿 Fenugreek'), cal: 49, tags: ['veg', 'iron'] },
      { id: 30, name: tx('🥬 सरसों साग', '🥬 Mustard Greens'), cal: 27, tags: ['veg'] },
    ],

    // Regional foods
    north: [tx('बाजरा', 'Bajra'), tx('सरसों साग', 'Mustard Greens'), tx('मक्का', 'Maize'), tx('मेथी', 'Fenugreek'), tx('दूध', 'Milk'), tx('घी', 'Ghee'), tx('गुड़', 'Jaggery')],
    west: [tx('ज्वार', 'Jowar'), tx('बाजरा', 'Bajra'), tx('मूंगफली', 'Peanuts'), tx('तिल', 'Sesame'), tx('छाछ', 'Buttermilk'), tx('नारियल', 'Coconut')],
    south: [tx('रागी', 'Ragi'), tx('नारियल', 'Coconut'), tx('इडली', 'Idli'), tx('डोसा', 'Dosa'), tx('सांभर', 'Sambar'), tx('मछली', 'Fish')],
    east: [tx('चावल', 'Rice'), tx('मछली', 'Fish'), tx('सरसों तेल', 'Mustard Oil'), tx('सत्तू', 'Sattu'), tx('लाल साग', 'Red Spinach')],
    central: [tx('सोयाबीन', 'Soybean'), tx('चना', 'Chickpea'), tx('मक्का', 'Maize'), tx('कोदो', 'Kodo Millet'), tx('कुटकी', 'Little Millet')],

    // Area specific
    tribal: [tx('कोदो', 'Kodo Millet'), tx('कुटकी', 'Little Millet'), tx('महुआ', 'Mahua'), tx('जंगली साग', 'Wild Greens'), tx('बाँस करील', 'Bamboo Shoot'), tx('जंगली शहद', 'Wild Honey')],
    rural: [tx('दूध', 'Milk'), tx('घी', 'Ghee'), tx('गुड़', 'Jaggery'), tx('मक्का', 'Maize'), tx('बाजरा', 'Bajra'), tx('सत्तू', 'Sattu'), tx('दही', 'Curd')],
    urban: [tx('ओट्स', 'Oats'), tx('ब्रेड', 'Bread'), tx('पनीर', 'Paneer'), tx('बादाम', 'Almonds'), tx('काजू', 'Cashew'), tx('सेब', 'Apple'), tx('दूध', 'Milk')],

    urbanExtras: [
      { id: 101, name: tx('🥜 बादाम', '🥜 Almonds'), cal: 579, tags: ['fat', 'protein'] },
      { id: 102, name: tx('🌰 काजू', '🌰 Cashew'), cal: 553, tags: ['fat'] },
      { id: 103, name: tx('🥜 अखरोट', '🥜 Walnuts'), cal: 654, tags: ['fat'] },
      { id: 104, name: tx('🫐 किशमिश', '🫐 Raisins'), cal: 299, tags: ['energy'] },
      { id: 105, name: tx('🥣 ओट्स', '🥣 Oats'), cal: 389, tags: ['grain'] },
      { id: 106, name: tx('🍞 ब्रेड', '🍞 Bread'), cal: 265, tags: ['grain'] },
    ]
  };

  // ===============================
  // REGION FROM STATE
  // ===============================
  const getRegionFromState = (state = '') => {
    const s = state.toLowerCase();
    if (['delhi', 'punjab', 'haryana', 'uttar pradesh', 'uttarakhand', 'himachal', 'rajasthan', 'chandigarh'].some(x => s.includes(x))) return 'north';
    if (['maharashtra', 'gujarat', 'goa'].some(x => s.includes(x))) return 'west';
    if (['tamil', 'kerala', 'karnataka', 'andhra', 'telangana'].some(x => s.includes(x))) return 'south';
    if (['west bengal', 'bihar', 'jharkhand', 'odisha', 'assam'].some(x => s.includes(x))) return 'east';
    if (['madhya pradesh', 'chhattisgarh'].some(x => s.includes(x))) return 'central';
    return 'north';
  };

  // ===============================
  // LOCATION FUNCTIONS
  // ===============================
  const searchManualLocation = async () => {
    if (!manualLocation.trim()) return;
    setLoadingLocation(true);
    setLocationError('');

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=in&q=${encodeURIComponent(manualLocation)}&addressdetails=1&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'NutritionApp/1.0' } });
      const data = await res.json();

      if (!data || data.length === 0) {
        setLocationError(tx('स्थान नहीं मिला', 'Location not found'));
        setDetectedLocation(null);
      } else {
        const item = data[0];
        const address = item.address || {};
        setDetectedLocation({
          village: address.village || address.hamlet || '',
          city: address.city || address.town || '',
          district: address.state_district || '',
          state: address.state || '',
          displayName: item.display_name,
        });
      }
    } catch (err) {
      setLocationError(tx('Location search error', 'Location search error'));
    } finally {
      setLoadingLocation(false);
    }
  };

  const searchByPincode = async () => {
    if (!pincode.trim()) return;
    setLoadingLocation(true);
    setLocationError('');

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=in&postalcode=${encodeURIComponent(pincode)}&addressdetails=1&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'NutritionApp/1.0' } });
      const data = await res.json();

      if (!data || data.length === 0) {
        setLocationError(tx('PIN code नहीं मिला', 'Pincode not found'));
        setDetectedLocation(null);
      } else {
        const item = data[0];
        const address = item.address || {};
        setDetectedLocation({
          village: address.village || address.hamlet || '',
          city: address.city || address.town || '',
          district: address.state_district || '',
          state: address.state || '',
          displayName: item.display_name,
        });
      }
    } catch (err) {
      setLocationError(tx('Pincode search error', 'Pincode search error'));
    } finally {
      setLoadingLocation(false);
    }
  };

  const autoDetectLocation = () => {
    setLoadingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError(tx('GPS support नहीं है', 'No GPS support'));
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;
          const res = await fetch(url, { headers: { 'User-Agent': 'NutritionApp/1.0' } });
          const data = await res.json();
          const address = data.address || {};

          setDetectedLocation({
            village: address.village || address.hamlet || '',
            city: address.city || address.town || '',
            district: address.state_district || '',
            state: address.state || '',
            displayName: data.display_name,
          });
        } catch (err) {
          setLocationError(tx('Auto detect failed', 'Auto detect failed'));
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        setLocationError(tx('Location permission denied', 'Location permission denied'));
        setLoadingLocation(false);
      }
    );
  };

  // ===============================
  // FOOD PRIORITIZATION
  // ===============================
  const prioritizedFoods = useMemo(() => {
    let baseFoods = [...foodDatabase.common];

    // Add urban extras if urban
    if (areaType === 'urban') {
      baseFoods = [...baseFoods, ...foodDatabase.urbanExtras];
    }

    // Get area-specific priority foods
    const areaPriority = areaType ? (foodDatabase[areaType] || []) : [];
    
    // Get regional priority based on state
    const region = detectedLocation?.state ? getRegionFromState(detectedLocation.state) : null;
    const regionalPriority = region ? (foodDatabase[region] || []) : [];

    // Combine priorities
    const allPriority = [...areaPriority, ...regionalPriority];

    // Sort: priority foods first
    if (allPriority.length > 0) {
      baseFoods = baseFoods.sort((a, b) => {
        const cleanA = a.name.replace(/[^\p{L}\p{N}\s]/gu, '').trim().toLowerCase();
        const cleanB = b.name.replace(/[^\p{L}\p{N}\s]/gu, '').trim().toLowerCase();
        const aMatch = allPriority.some(x => cleanA.includes(x.toLowerCase()) || x.toLowerCase().includes(cleanA));
        const bMatch = allPriority.some(x => cleanB.includes(x.toLowerCase()) || x.toLowerCase().includes(cleanB));
        return Number(bMatch) - Number(aMatch);
      });
    }

    return baseFoods;
  }, [areaType, detectedLocation]);

  const toggleFood = (id) => {
    if (selectedFoods.includes(id)) {
      setSelectedFoods(selectedFoods.filter(f => f !== id));
    } else {
      setSelectedFoods([...selectedFoods, id]);
    }
  };

  // Get highlighted foods for display
  const getHighlightedFoods = () => {
    const areaPriority = areaType ? (foodDatabase[areaType] || []) : [];
    const region = detectedLocation?.state ? getRegionFromState(detectedLocation.state) : null;
    const regionalPriority = region ? (foodDatabase[region] || []) : [];
    return [...new Set([...areaPriority, ...regionalPriority])];
  };

  // ===============================
  // DIET PLAN GENERATOR
  // ===============================
  const getDietPlan = () => {
    const selected = prioritizedFoods.filter(f => selectedFoods.includes(f.id));
    const grains = selected.filter(f => f.tags?.includes('grain'));
    const proteins = selected.filter(f => f.tags?.includes('protein'));
    const vegs = selected.filter(f => f.tags?.includes('veg'));
    const fruits = selected.filter(f => f.tags?.includes('fruit'));
    const fats = selected.filter(f => f.tags?.includes('fat'));

    const g = (arr, i) => arr.length > i ? arr[i].name : '';

    const locationTitle = detectedLocation
      ? `${detectedLocation.village ? detectedLocation.village + ', ' : ''}${detectedLocation.city ? detectedLocation.city + ', ' : ''}${detectedLocation.state || ''}`
      : tx('भारत', 'India');

    const areaLabel = areaType === 'urban' ? tx('शहरी', 'Urban') : areaType === 'tribal' ? tx('आदिवासी', 'Tribal') : tx('ग्रामीण', 'Rural');

    if (severity === 'SAM') {
      return {
        title: tx('🔴 SAM - गंभीर कुपोषण आहार योजना', '🔴 SAM - Severe Malnutrition Diet Plan'),
        subtitle: `${locationTitle} (${areaLabel})`,
        calories: tx('1500-1800 कैलोरी/दिन', '1500-1800 kcal/day'),
        meals: [
          { time: tx('सुबह 6:00', '6:00 AM'), meal: `${g(proteins, 0) || tx('🥛 दूध', '🥛 Milk')} + ${g(fats, 0) || tx('🧈 घी', '🧈 Ghee')}`, note: tx('ऊर्जा शुरुआत', 'Energy start') },
          { time: tx('सुबह 8:00', '8:00 AM'), meal: `${g(grains, 0) || tx('🌾 दलिया', '🌾 Porridge')} + ${g(fruits, 0) || tx('🍌 केला', '🍌 Banana')}`, note: tx('नाश्ता', 'Breakfast') },
          { time: tx('सुबह 10:00', '10:00 AM'), meal: `${g(fats, 0) || tx('🥜 मूंगफली', '🥜 Peanuts')} + ${tx('गुड़', 'Jaggery')}`, note: tx('स्नैक', 'Snack') },
          { time: tx('दोपहर 12:00', '12:00 PM'), meal: `${g(grains, 0) || tx('🍚 चावल', '🍚 Rice')} + ${g(proteins, 0) || tx('🫘 दाल', '🫘 Dal')} + ${g(vegs, 0) || tx('🥬 साग', '🥬 Greens')} + ${g(fats, 0) || tx('🧈 घी', '🧈 Ghee')}`, note: tx('मुख्य भोजन', 'Main meal') },
          { time: tx('दोपहर 2:00', '2:00 PM'), meal: `${g(proteins, 1) || tx('🫙 दही', '🫙 Curd')} + ${g(fruits, 0) || tx('🍌 केला', '🍌 Banana')}`, note: tx('Protein', 'Protein') },
          { time: tx('शाम 4:00', '4:00 PM'), meal: `${tx('खिचड़ी', 'Khichdi')} + ${g(fats, 0) || tx('🧈 घी', '🧈 Ghee')}`, note: tx('हल्का', 'Light') },
          { time: tx('शाम 6:00', '6:00 PM'), meal: `${tx('रोटी', 'Roti')} + ${g(vegs, 1) || tx('🥕 सब्ज़ी', '🥕 Sabzi')}`, note: tx('रात', 'Dinner') },
          { time: tx('रात 8:00', '8:00 PM'), meal: `${g(proteins, 0) || tx('🥛 दूध', '🥛 Milk')} + ${tx('हल्दी', 'Turmeric')}`, note: tx('सोने से पहले', 'Before sleep') },
        ],
        tips: [
          tx('🚨 दिन में 8 बार खिलाएं', '🚨 Feed 8 times a day'),
          tx('🏥 तुरंत NRC जाएं', '🏥 Visit NRC immediately'),
          tx('💊 Vitamin A + Iron + Zinc दें', '💊 Give supplements'),
          tx('🍯 हर खाने में घी/गुड़ मिलाएं', '🍯 Add ghee/jaggery'),
        ]
      };
    } else if (severity === 'MAM') {
      return {
        title: tx('🟠 MAM - मध्यम कुपोषण आहार योजना', '🟠 MAM - Moderate Malnutrition Diet Plan'),
        subtitle: `${locationTitle} (${areaLabel})`,
        calories: tx('1200-1500 कैलोरी/दिन', '1200-1500 kcal/day'),
        meals: [
          { time: tx('सुबह 7:00', '7:00 AM'), meal: `${g(proteins, 0) || tx('🥛 दूध', '🥛 Milk')} + ${g(grains, 0) || tx('🌾 दलिया', '🌾 Porridge')}`, note: tx('नाश्ता', 'Breakfast') },
          { time: tx('सुबह 10:00', '10:00 AM'), meal: `${g(fruits, 0) || tx('🍌 केला', '🍌 Banana')} + ${g(fats, 0) || tx('🥜 मूंगफली', '🥜 Peanuts')}`, note: tx('स्नैक', 'Snack') },
          { time: tx('दोपहर 12:30', '12:30 PM'), meal: `${g(grains, 0) || tx('🍚 चावल', '🍚 Rice')} + ${g(proteins, 0) || tx('🫘 दाल', '🫘 Dal')} + ${g(vegs, 0) || tx('🥬 साग', '🥬 Greens')}`, note: tx('दोपहर', 'Lunch') },
          { time: tx('दोपहर 3:00', '3:00 PM'), meal: `${g(proteins, 1) || tx('🫙 दही', '🫙 Curd')} + ${tx('गुड़', 'Jaggery')}`, note: tx('Energy', 'Energy') },
          { time: tx('शाम 6:30', '6:30 PM'), meal: `${tx('रोटी', 'Roti')} + ${g(vegs, 1) || tx('🥕 सब्ज़ी', '🥕 Sabzi')} + ${g(proteins, 0) || tx('🫘 दाल', '🫘 Dal')}`, note: tx('रात', 'Dinner') },
          { time: tx('रात 8:30', '8:30 PM'), meal: `${g(proteins, 0) || tx('🥛 दूध', '🥛 Milk')}`, note: tx('सोने से पहले', 'Before sleep') },
        ],
        tips: [
          tx('⚠️ दिन में 6 बार खिलाएं', '⚠️ Feed 6 times a day'),
          tx('🥜 Dry fruits रोज़ दें', '🥜 Give dry fruits daily'),
          tx('👨‍⚕️ हर 2 हफ्ते doctor से मिलें', '👨‍⚕️ Meet doctor every 2 weeks'),
        ]
      };
    } else {
      return {
        title: tx('🟢 Normal - सामान्य पोषण योजना', '🟢 Normal - Balanced Nutrition Plan'),
        subtitle: `${locationTitle} (${areaLabel})`,
        calories: tx('1000-1200 कैलोरी/दिन', '1000-1200 kcal/day'),
        meals: [
          { time: tx('सुबह 7:30', '7:30 AM'), meal: `${g(proteins, 0) || tx('🥛 दूध', '🥛 Milk')} + ${tx('रोटी/परांठा', 'Roti/Paratha')}`, note: tx('नाश्ता', 'Breakfast') },
          { time: tx('सुबह 10:00', '10:00 AM'), meal: `${g(fruits, 0) || tx('🍌 केला', '🍌 Banana')}`, note: tx('स्नैक', 'Snack') },
          { time: tx('दोपहर 12:30', '12:30 PM'), meal: `${g(grains, 0) || tx('🍚 चावल', '🍚 Rice')} + ${g(proteins, 0) || tx('🫘 दाल', '🫘 Dal')} + ${tx('सब्ज़ी', 'Sabzi')}`, note: tx('दोपहर', 'Lunch') },
          { time: tx('शाम 4:00', '4:00 PM'), meal: `${g(proteins, 0) || tx('🥛 दूध', '🥛 Milk')} + ${tx('बिस्कुट', 'Biscuits')}`, note: tx('शाम', 'Evening') },
          { time: tx('रात 7:30', '7:30 PM'), meal: `${tx('रोटी', 'Roti')} + ${tx('सब्ज़ी', 'Sabzi')} + ${g(proteins, 0) || tx('🫘 दाल', '🫘 Dal')}`, note: tx('रात', 'Dinner') },
        ],
        tips: [
          tx('✅ संतुलित भोजन दें', '✅ Give balanced diet'),
          tx('🥗 विविध खाना दें', '🥗 Give variety of food'),
        ]
      };
    }
  };

  const plan = showPlan && severity ? getDietPlan() : null;

  // ===============================
  // RENDER
  // ===============================
  return (
    <div style={{ padding: '15px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#667eea', textAlign: 'center' }}>🍽️ {tx('डाइट प्लान', 'Diet Plan')}</h2>

      {/* ===== STEP 1: LOCATION ===== */}
      <div style={{
        background: 'white', padding: '20px', borderRadius: '12px',
        marginBottom: '20px', border: '2px solid #28a745', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, color: '#28a745' }}>📍 Step 1: {tx('लोकेशन', 'Location')}</h3>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          {[
            { mode: 'manual', icon: '📝', label: tx('Manual', 'Manual') },
            { mode: 'pincode', icon: '📮', label: tx('PIN Code', 'PIN Code') },
            { mode: 'auto', icon: '📍', label: tx('Auto GPS', 'Auto GPS') }
          ].map(item => (
            <button key={item.mode} onClick={() => setLocationMode(item.mode)}
              style={{
                padding: '10px 18px', borderRadius: '8px', cursor: 'pointer',
                border: locationMode === item.mode ? '2px solid #28a745' : '1px solid #ddd',
                background: locationMode === item.mode ? '#d4edda' : 'white',
                fontWeight: locationMode === item.mode ? 'bold' : 'normal', fontSize: '14px'
              }}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Manual */}
        {locationMode === 'manual' && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" value={manualLocation} onChange={(e) => setManualLocation(e.target.value)}
              placeholder={tx('गाँव/शहर/जिला लिखें...', 'Enter village/city/district...')}
              style={{ flex: 1, padding: '12px', border: '2px solid #ddd', borderRadius: '8px', minWidth: '200px', fontSize: '15px' }} />
            <button onClick={searchManualLocation} disabled={loadingLocation}
              style={{ padding: '12px 22px', background: loadingLocation ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              {loadingLocation ? '⏳' : '🔍'}
            </button>
          </div>
        )}

        {/* Pincode */}
        {locationMode === 'pincode' && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)}
              placeholder={tx('PIN code डालें (जैसे 462001)', 'Enter PIN code')}
              style={{ flex: 1, padding: '12px', border: '2px solid #ddd', borderRadius: '8px', minWidth: '150px', fontSize: '15px' }} />
            <button onClick={searchByPincode} disabled={loadingLocation}
              style={{ padding: '12px 22px', background: loadingLocation ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              {loadingLocation ? '⏳' : '🔍'}
            </button>
          </div>
        )}

        {/* Auto GPS */}
        {locationMode === 'auto' && (
          <button onClick={autoDetectLocation} disabled={loadingLocation}
            style={{ width: '100%', padding: '14px', background: loadingLocation ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            {loadingLocation ? '⏳ Detecting...' : tx('📍 Auto Detect करो', '📍 Auto Detect')}
          </button>
        )}

        {locationError && <p style={{ color: '#dc3545', marginTop: '10px' }}>❌ {locationError}</p>}

        {/* Location Result */}
        {detectedLocation && (
          <div style={{ marginTop: '15px', background: '#d4edda', padding: '15px', borderRadius: '10px', border: '2px solid #28a745' }}>
            <p style={{ fontWeight: 'bold', color: '#155724', margin: '0 0 10px 0' }}>✅ {tx('Location मिली:', 'Location found:')}</p>
            {detectedLocation.village && <p style={{ margin: '4px 0', fontSize: '14px' }}>🏡 {tx('गाँव:', 'Village:')} <strong>{detectedLocation.village}</strong></p>}
            {detectedLocation.city && <p style={{ margin: '4px 0', fontSize: '14px' }}>🏙️ {tx('शहर:', 'City:')} <strong>{detectedLocation.city}</strong></p>}
            {detectedLocation.district && <p style={{ margin: '4px 0', fontSize: '14px' }}>📍 {tx('जिला:', 'District:')} <strong>{detectedLocation.district}</strong></p>}
            {detectedLocation.state && <p style={{ margin: '4px 0', fontSize: '14px' }}>🗺️ {tx('राज्य:', 'State:')} <strong>{detectedLocation.state}</strong></p>}
          </div>
        )}
      </div>

      {/* ===== STEP 2: AREA TYPE ===== */}
      <div style={{
        background: 'white', padding: '20px', borderRadius: '12px',
        marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0 }}>🏠 Step 2: {tx('क्षेत्र चुनो', 'Select Area Type')}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          {tx('आपके यहाँ क्या ज़्यादा मिलता है उसके हिसाब से चुनें:', 'Select based on what is commonly available in your area:')}
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Rural */}
          <div onClick={() => { setAreaType('rural'); setSelectedFoods([]); setShowPlan(false); }}
            style={{
              flex: 1, minWidth: '150px', padding: '20px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
              border: areaType === 'rural' ? '3px solid #28a745' : '2px solid #ddd',
              background: areaType === 'rural' ? '#d4edda' : 'white'
            }}>
            <p style={{ fontSize: '36px', margin: '0 0 10px 0' }}>🏡</p>
            <p style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 8px 0' }}>{tx('ग्रामीण (Rural)', 'Rural')}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              {tx('दूध, घी, गुड़, मक्का, बाजरा, सत्तू', 'Milk, Ghee, Jaggery, Maize, Bajra, Sattu')}
            </p>
          </div>

          {/* Urban */}
          <div onClick={() => { setAreaType('urban'); setSelectedFoods([]); setShowPlan(false); }}
            style={{
              flex: 1, minWidth: '150px', padding: '20px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
              border: areaType === 'urban' ? '3px solid #007bff' : '2px solid #ddd',
              background: areaType === 'urban' ? '#e7f3ff' : 'white'
            }}>
            <p style={{ fontSize: '36px', margin: '0 0 10px 0' }}>🏙️</p>
            <p style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 8px 0' }}>{tx('शहरी (Urban)', 'Urban')}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              {tx('ओट्स, ब्रेड, पनीर, बादाम, काजू, सेब', 'Oats, Bread, Paneer, Almonds, Cashew, Apple')}
            </p>
          </div>

          {/* Tribal */}
          <div onClick={() => { setAreaType('tribal'); setSelectedFoods([]); setShowPlan(false); }}
            style={{
              flex: 1, minWidth: '150px', padding: '20px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
              border: areaType === 'tribal' ? '3px solid #6f42c1' : '2px solid #ddd',
              background: areaType === 'tribal' ? '#f3e5f5' : 'white'
            }}>
            <p style={{ fontSize: '36px', margin: '0 0 10px 0' }}>🌿</p>
            <p style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 8px 0' }}>{tx('आदिवासी (Tribal)', 'Tribal')}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              {tx('कोदो, कुटकी, महुआ, जंगली साग, शहद', 'Kodo, Kutki, Mahua, Wild Greens, Honey')}
            </p>
          </div>
        </div>
      </div>

      {/* ===== STEP 3: SEVERITY ===== */}
      {areaType && (
        <div style={{
          background: 'white', padding: '20px', borderRadius: '12px',
          marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>⚕️ Step 3: {tx('बच्चे की स्थिति', 'Child Condition')}</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { sev: 'SAM', icon: '🔴', label: tx('SAM (गंभीर)', 'SAM (Severe)'), color: '#dc3545', bg: '#f8d7da' },
              { sev: 'MAM', icon: '🟠', label: tx('MAM (मध्यम)', 'MAM (Moderate)'), color: '#fd7e14', bg: '#fff3cd' },
              { sev: 'NORMAL', icon: '🟢', label: tx('Normal (सामान्य)', 'Normal'), color: '#28a745', bg: '#d4edda' }
            ].map(item => (
              <button key={item.sev} onClick={() => setSeverity(item.sev)}
                style={{
                  flex: 1, minWidth: '100px', padding: '15px', borderRadius: '10px', cursor: 'pointer',
                  border: severity === item.sev ? `3px solid ${item.color}` : '2px solid #ddd',
                  background: severity === item.sev ? item.bg : 'white',
                  fontWeight: severity === item.sev ? 'bold' : 'normal', fontSize: '15px'
                }}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== STEP 4: FOOD SELECTION ===== */}
      {severity && (
        <div style={{
          background: 'white', padding: '20px', borderRadius: '12px',
          marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>🥗 Step 4: {tx('उपलब्ध भोजन चुनें', 'Select Available Foods')}</h3>

          {/* Highlighted Foods */}
          {getHighlightedFoods().length > 0 && (
            <div style={{
              background: '#fff3cd', padding: '12px', borderRadius: '8px',
              marginBottom: '15px', border: '1px solid #ffc107'
            }}>
              <p style={{ fontWeight: 'bold', color: '#856404', margin: '0 0 8px 0' }}>
                ⭐ {tx('आपके इलाके में ज़्यादा मिलने वाले:', 'Commonly available in your area:')}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {getHighlightedFoods().map((food, i) => (
                  <span key={i} style={{
                    background: '#ffc107', color: '#333', padding: '5px 12px',
                    borderRadius: '15px', fontSize: '13px', fontWeight: 'bold'
                  }}>{food}</span>
                ))}
              </div>
            </div>
          )}

          {/* Food Selection */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {prioritizedFoods.map(food => (
              <button key={food.id} onClick={() => toggleFood(food.id)}
                style={{
                  padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                  border: selectedFoods.includes(food.id) ? '2px solid #28a745' : '2px solid #ddd',
                  background: selectedFoods.includes(food.id) ? '#d4edda' : 'white', fontSize: '14px'
                }}>
                {selectedFoods.includes(food.id) ? '✅' : '⬜'} {food.name} ({food.cal} cal)
              </button>
            ))}
          </div>

          <p style={{ marginTop: '15px', color: '#666' }}>✅ {tx('चुने:', 'Selected:')} <strong>{selectedFoods.length}</strong></p>

          <button onClick={() => setShowPlan(true)}
            style={{
              marginTop: '15px', width: '100%', padding: '15px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', border: 'none', borderRadius: '10px',
              cursor: 'pointer', fontSize: '18px', fontWeight: 'bold'
            }}>
            🍽️ {tx('डाइट प्लान बनाओ', 'Generate Diet Plan')}
          </button>
        </div>
      )}

      {/* ===== DIET PLAN OUTPUT ===== */}
      {plan && (
        <div style={{
          background: 'white', padding: '20px', borderRadius: '12px',
          marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: severity === 'SAM' ? '3px solid #dc3545' : severity === 'MAM' ? '3px solid #fd7e14' : '3px solid #28a745'
        }}>
          <h3 style={{ marginTop: 0, color: severity === 'SAM' ? '#dc3545' : severity === 'MAM' ? '#fd7e14' : '#28a745' }}>
            {plan.title}
          </h3>
          <p style={{ color: '#666' }}>📍 {plan.subtitle}</p>
          <p><strong>🔥 {tx('Calories:', 'Calories:')}</strong> {plan.calories}</p>

          {/* Meals */}
          <div style={{ marginTop: '20px' }}>
            <h4>🕐 {tx('खाने का समय:', 'Meal Schedule:')}</h4>
            {plan.meals.map((m, i) => (
              <div key={i} style={{
                display: 'flex', padding: '12px', borderBottom: '1px solid #eee',
                alignItems: 'center', flexWrap: 'wrap', gap: '10px'
              }}>
                <span style={{
                  background: '#667eea', color: 'white', padding: '6px 14px',
                  borderRadius: '15px', fontSize: '13px', minWidth: '90px', textAlign: 'center'
                }}>{m.time}</span>
                <span style={{ flex: 1, fontSize: '15px' }}>{m.meal}</span>
                <span style={{ fontSize: '12px', color: '#999' }}>({m.note})</span>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div style={{
            marginTop: '20px', background: '#f8f9fa', padding: '15px',
            borderRadius: '8px', borderLeft: '4px solid #667eea'
          }}>
            <h4 style={{ marginTop: 0 }}>💡 {tx('ज़रूरी सुझाव:', 'Important Tips:')}</h4>
            {plan.tips.map((tip, i) => <p key={i} style={{ margin: '8px 0', fontSize: '14px' }}>{tip}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}

export default DietPlan;