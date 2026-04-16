import React, { useState, useRef, useEffect } from 'react';

function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: '🏥 नमस्ते! मैं AI Health Assistant हूँ। कुपोषण से जुड़ा कोई भी सवाल पूछें!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mock AI Response (No API needed - works offline!)
  const getMockResponse = (userMessage) => {
    const lower = userMessage.toLowerCase();
    
    const responses = {
      'muac': `📏 **MUAC (Mid-Upper Arm Circumference):**

🟢 > 12.5 cm = Normal (सामान्य)
🟠 11.5-12.5 cm = MAM (मध्यम कुपोषण)
🔴 < 11.5 cm = SAM (गंभीर कुपोषण)

**कैसे मापें:**
1. बायाँ बाजू 90° पर मोड़ें
2. कंधे-कोहनी का मध्य बिंदु खोजें
3. Measuring tape बिना कसे लपेटें
4. Reading note करें`,

      'sam': `🔴 **SAM (Severe Acute Malnutrition):**

**Criteria:**
• MUAC < 11.5 cm
• Weight-for-Height Z-score < -3
• Bilateral pitting edema

🚨 **Immediate Action:**
• तुरंत NRC (Nutrition Rehabilitation Centre) ले जाएं
• RUTF (Ready-to-Use Therapeutic Food) दें
• Vitamin A + Zinc supplement
• Medical supervision जरूरी

⚠️ यह medical emergency है!`,

      'mam': `🟠 **MAM (Moderate Acute Malnutrition):**

**Criteria:**
• MUAC 11.5-12.5 cm
• Weight-for-Height Z-score -2 to -3
• No edema

📋 **Action Plan:**
• आंगनवाड़ी/ICDS से संपर्क करें
• Supplementary feeding program में शामिल करें
• Protein-rich diet: दाल, अंडा, पनीर
• Weekly MUAC monitoring
• 2-4 weeks में improvement होना चाहिए`,

      'z score': `📊 **Z-Score = WHO Standard Comparison:**

**3 Types:**

⚖️ **WFA (Weight-for-Age):**
Underweight detect करता है

📏 **HFA (Height-for-Age):**
Stunting (बौनापन) detect करता है

📉 **WFH (Weight-for-Height):**
Wasting (दुबलापन) detect करता है

**Grading:**
🟢 > -1 SD = Normal
🟡 -1 to -2 SD = Mild
🟠 -2 to -3 SD = MAM
🔴 < -3 SD = SAM`,

      'edema': `💧 **Edema (शरीर में सूजन):**

**Test Method:**
पिंडली पर 3 seconds दबाएं
अगर गड्ढा बना रहे = Pitting Edema

**Grading:**
+ (Grade 1) = दोनों पैरों में
++ (Grade 2) = पैर + हाथ
+++ (Grade 3) = पूरे शरीर + चेहरा

⚠️ **Important:**
Bilateral pitting edema = SAM
(MUAC चाहे कुछ भी हो)

🚨 तुरंत hospital ले जाएं!`,

      'anemia': `🩸 **Anemia (खून की कमी):**

**Hemoglobin Levels:**
• Hb > 11 g/dl = Normal
• Hb 10-11 = Mild Anemia
• Hb 7-10 = Moderate Anemia
• Hb < 7 = Severe Anemia

**लक्षण:**
• आँखों का अंदरूनी भाग सफेद
• नाखून पीले/सफेद
• जीभ का रंग फीका
• थकान/कमजोरी
• तेज साँस चलना

💊 **Treatment:**
• Iron + Folic Acid (IFA) tablets/syrup
• पालक, गुड़, अंडा, चुकंदर खिलाएं
• Vitamin C rich foods (नींबू, आंवला)`,

      'diet': `🍽️ **कुपोषित बच्चों का आहार:**

**SAM (दिन में 8 बार):**
• सुबह: दूध दलिया + गुड़
• नाश्ता: खिचड़ी + घी
• दोपहर: दाल-चावल + सब्जी
• शाम: RUTF/मूंगफली चिक्की
• रात: दूध + केला

**MAM (दिन में 6 बार):**
• दाल-चावल + घी (2 बार)
• अंडा/पनीर (रोज)
• हरी सब्जी
• फल + dry fruits
• दूध (सुबह-शाम)

**High-calorie foods:**
घी, तेल, गुड़, मूंगफली`,

      'emergency': `🚨 **Emergency Helpline Numbers:**

🚑 **Ambulance:** 102
📞 **Child Helpline:** 1098
🏥 **Health Helpline:** 104
📱 **ICDS:** 1800-345-6789
🆘 **National Emergency:** 112
👮 **Police:** 100
🔥 **Fire:** 101

**कब call करें:**
• Bilateral edema दिखे
• बच्चा बहुत weak हो
• खाना-पीना बंद कर दे
• Convulsions (दौरे) आएं`,

      'nrc': `🏥 **NRC (Nutrition Rehabilitation Centre):**

**Purpose:**
SAM बच्चों का intensive treatment

**सुविधाएं:**
• 14 दिन तक भर्ती
• RUTF (Therapeutic Food)
• Medical treatment
• Growth monitoring
• Mother को nutrition education

**कहाँ मिलेगा:**
• जिला अस्पताल
• CHC (Community Health Centre)
• कुछ PHC में भी

**Free treatment:** ✅
सब कुछ मुफ्त है!`,

      'rutf': `🍫 **RUTF (Ready-to-Use Therapeutic Food):**

**क्या है:**
• मूंगफली paste based
• दूध powder + vitamins
• 500 kcal per packet
• Cooking नहीं चाहिए

**कब दें:**
SAM बच्चों को (MUAC < 11.5 cm)

**कितना दें:**
• 6-24 months: 2-3 sachets/day
• 24-59 months: 3-4 sachets/day

**कहाँ से मिलेगा:**
• NRC
• आंगनवाड़ी (selected)
• Health centres

✅ Completely FREE`,

      'stunting': `📏 **Stunting (बौनापन):**

**Definition:**
Height-for-Age Z-score < -2
लंबे समय का (chronic) malnutrition

**कारण:**
• गर्भावस्था में माँ का कुपोषण
• जन्म के पहले 1000 दिनों में poor nutrition
• बार-बार infections
• Poor sanitation

**Prevention:**
• First 1000 days पर focus करें
• 6 month तक exclusive breastfeeding
• Complementary feeding (6 months बाद)
• Vitamin + mineral supplements
• स्वच्छता बनाए रखें

⚠️ Stunting permanent है - reversal नहीं होता!`,

      'wasting': `📉 **Wasting (दुबलापन):**

**Definition:**
Weight-for-Height Z-score < -2
Acute (हाल का) malnutrition

**Types:**
• Moderate Wasting: -2 to -3 SD
• Severe Wasting: < -3 SD

**Causes:**
• Recent illness (दस्त, बुखार)
• Inadequate food intake
• Infections

**Treatment:**
• High calorie diet
• दिन में 6-8 बार खिलाएं
• Treat infections
• RUTF (अगर severe हो)

✅ Reversible है - सही treatment से ठीक हो सकता है`,

      'breastfeeding': `🤱 **Breastfeeding Guidelines:**

**जन्म के 1 घंटे में:**
शुरू करें (colostrum जरूरी है)

**0-6 months:**
Exclusive breastfeeding
ऊपर का पानी भी ❌

**6-24 months:**
Breastfeeding + Complementary foods

**Benefits:**
• Perfect nutrition
• Immunity boost
• बीमारियों से बचाव
• माँ-बच्चे का bonding
• Free और safe

**Positioning:**
बच्चे का मुंह पूरा breast पर हो`,

      'icds': `🏫 **ICDS (Integrated Child Development Services):**

**सेवाएं:**
• Supplementary Nutrition
• Growth Monitoring (हर महीने weight)
• Health Check-up
• Immunization
• Nutrition Education
• Pre-school Education

**Target Group:**
0-6 साल के बच्चे + pregnant/lactating women

**कहाँ मिलेगा:**
Nearest Anganwadi Centre

**सब कुछ FREE:** ✅

**Contact:**
Helpline: 1800-345-6789`,

      'schemes': `🏛️ **Government Schemes:**

**1. Poshan Abhiyaan:**
Malnutrition reduction mission

**2. JSY (Janani Suraksha Yojana):**
Institutional delivery के लिए cash

**3. PMSMA:**
Free ANC checkup हर महीने

**4. MAA (Mothers Absolute Affection):**
Breastfeeding promotion

**5. ICDS:**
0-6 years nutrition

**6. Mid-Day Meal:**
School children को खाना

**7. IFA Supplementation:**
Free Iron tablets

सब कुछ ABSOLUTELY FREE! 🎁`
    };

    // Check for keyword match
    for (const [key, response] of Object.entries(responses)) {
      if (lower.includes(key)) {
        return response;
      }
    }

    // Default responses
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('नमस्ते') || lower.includes('hey')) {
      return `🙏 नमस्ते! मैं आपकी मदद के लिए हूँ।

**मुझसे पूछें:**
• MUAC क्या है?
• SAM/MAM में क्या अंतर है?
• Z-Score कैसे calculate करें?
• Edema/Anemia कैसे check करें?
• Diet plan क्या हो?
• Emergency numbers
• NRC/ICDS/RUTF के बारे में

कोई भी सवाल पूछ सकते हैं! 😊`;
    }

    if (lower.includes('thank') || lower.includes('धन्यवाद') || lower.includes('thanks')) {
      return '🙏 आपका स्वागत है! कोई और सवाल हो तो बेझिझक पूछें। बच्चों का स्वास्थ्य हमारी प्राथमिकता है! 💪';
    }

    if (lower.includes('help') || lower.includes('मदद')) {
      return `💡 **मैं इन topics पर help कर सकता हूँ:**

📏 MUAC measurement
🔴 SAM/MAM classification
📊 Z-Score calculation
💧 Edema detection
🩸 Anemia signs
🍽️ Diet plans
🏥 NRC/RUTF
🚨 Emergency protocols
🏛️ Government schemes
🤱 Breastfeeding
📉 Stunting/Wasting
🏫 ICDS services

कोई भी topic type करें! 🎯`;
    }

    // If no match found
    return `🤔 यह समझ नहीं आया। कृपया पूछें:

**Popular Topics:**
• MUAC
• SAM/MAM
• Z-Score
• Edema
• Anemia
• Diet
• Emergency
• NRC/RUTF
• Schemes
• Breastfeeding

या "help" type करें पूरी list के लिए! 📚`;
  };

  const send = async () => {
    if (!input.trim()) return;
    
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    // Simulate realistic AI delay
    setTimeout(() => {
      const botResponse = getMockResponse(currentInput);
      const botMsg = { from: 'bot', text: botResponse };
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);

      // Text-to-Speech (Hindi support)
      if ('speechSynthesis' in window) {
        const cleanText = botResponse.replace(/[📊🔴🟠🟢🟡⚠️💧🩸📏📐📋💡🏥💊🍽️🥜📍✅❌🤱🚨🚑📞📱🆘🤔🙏💪🔵⚖️🍫📉*_#]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }
    }, 1000);
  };

  const quickQs = ['MUAC', 'SAM', 'MAM', 'Z-Score', 'Edema', 'Anemia', 'Diet', 'Emergency'];

  return (
    <>
      {/* Floating Button */}
      <div onClick={() => { setIsOpen(!isOpen); setUnread(0); }} style={{
        position: 'fixed', bottom: '25px', right: '25px', width: '65px', height: '65px',
        borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 6px 20px rgba(102,126,234,0.5)',
        zIndex: 9999, transition: 'all 0.3s',
        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
      }}>
        <span style={{ fontSize: '28px', color: 'white' }}>{isOpen ? '✕' : '🤖'}</span>
        {unread > 0 && !isOpen && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            background: '#dc3545', color: 'white', borderRadius: '50%',
            width: '22px', height: '22px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '12px'
          }}>{unread}</span>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '100px', right: '25px',
          width: '380px', maxWidth: '90vw', height: '520px', maxHeight: '75vh',
          background: 'white', borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.25)', zIndex: 9998,
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', padding: '16px', display: 'flex',
            alignItems: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '26px' }}>🤖</span>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '17px', margin: 0 }}>AI Health Assistant</p>
              <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>कुपोषण Expert • Always Available</p>
            </div>
          </div>

          {/* Quick Questions */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '6px',
            padding: '10px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0'
          }}>
            {quickQs.map((q, i) => (
              <button key={i} onClick={() => setInput(q)} style={{
                padding: '5px 11px', borderRadius: '14px', cursor: 'pointer',
                border: '1px solid #667eea', background: 'white',
                color: '#667eea', fontSize: '11px', fontWeight: '500'
              }}>{q}</button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', background: '#fafafa' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{
                  maxWidth: '82%', padding: '11px 15px', borderRadius: '16px',
                  background: msg.from === 'user' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
                  color: msg.from === 'user' ? 'white' : '#333',
                  fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-line',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ 
                  display: 'inline-block',
                  width: '40px', height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>AI thinking...</p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{
            display: 'flex', gap: '10px', padding: '12px',
            borderTop: '1px solid #e0e0e0', background: 'white'
          }}>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && send()}
              placeholder="सवाल लिखें..."
              disabled={loading}
              style={{
                flex: 1, padding: '11px 14px', border: '2px solid #667eea',
                borderRadius: '12px', fontSize: '14px', outline: 'none'
              }} />
            <button onClick={send} disabled={loading} style={{
              padding: '11px 18px', 
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)', 
              color: 'white', border: 'none', borderRadius: '12px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px', fontWeight: 'bold', minWidth: '50px'
            }}>📩</button>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default FloatingChatbot;