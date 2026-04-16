from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import json
import math
import random
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pickle
import os

app = Flask(__name__)
CORS(app)

# ========== DATABASE SETUP ==========
def init_db():
    conn = sqlite3.connect('malnutrition.db')
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        age INTEGER,
        gender TEXT,
        location TEXT,
        created_at TIMESTAMP
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TIMESTAMP,
        height REAL,
        weight REAL,
        muac REAL,
        entry_type TEXT,
        severity TEXT,
        z_score_wfa REAL,
        z_score_hfa REAL,
        z_score_wfh REAL,
        bmi REAL,
        wh_ratio REAL,
        edema TEXT,
        anemia TEXT,
        notes TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )''')
    
    conn.commit()
    conn.close()
    print("✅ Database ready")

init_db()

# ========== WHO REFERENCE DATA ==========
WHO_REFERENCE = {
    'boys': {
        'weight_for_age': {
            0: {'L': 0.3487, 'M': 3.3464, 'S': 0.14602},
            6: {'L': 0.2531, 'M': 7.934, 'S': 0.13395},
            12: {'L': 0.2303, 'M': 9.6479, 'S': 0.13170},
            18: {'L': 0.2100, 'M': 10.9, 'S': 0.13000},
            24: {'L': 0.1960, 'M': 12.1515, 'S': 0.12602},
            36: {'L': 0.1300, 'M': 14.3, 'S': 0.12700},
            48: {'L': 0.0700, 'M': 16.3, 'S': 0.13200},
            60: {'L': 0.0100, 'M': 18.3, 'S': 0.14000}
        },
        'height_for_age': {
            0: {'L': 1, 'M': 49.8842, 'S': 0.03795},
            6: {'L': 1, 'M': 67.6236, 'S': 0.03328},
            12: {'L': 1, 'M': 75.7488, 'S': 0.03190},
            18: {'L': 1, 'M': 82.3, 'S': 0.03100},
            24: {'L': 1, 'M': 87.8, 'S': 0.03900},
            36: {'L': 1, 'M': 96.1, 'S': 0.03800},
            48: {'L': 1, 'M': 103.3, 'S': 0.03800},
            60: {'L': 1, 'M': 110.0, 'S': 0.03700}
        },
        'weight_for_height': {
            45: {'L': 0.3487, 'M': 2.441, 'S': 0.09182},
            50: {'L': 0.3487, 'M': 3.346, 'S': 0.09153},
            55: {'L': 0.3487, 'M': 4.418, 'S': 0.09124},
            60: {'L': 0.2531, 'M': 5.683, 'S': 0.09014},
            65: {'L': 0.2531, 'M': 7.041, 'S': 0.08968},
            70: {'L': 0.2531, 'M': 8.285, 'S': 0.08924},
            75: {'L': 0.2531, 'M': 9.392, 'S': 0.08906},
            80: {'L': 0.2303, 'M': 10.355, 'S': 0.08952},
            85: {'L': 0.2303, 'M': 11.226, 'S': 0.09072},
            90: {'L': 0.2303, 'M': 12.098, 'S': 0.09223},
            95: {'L': 0.1960, 'M': 13.044, 'S': 0.09458},
            100: {'L': 0.1960, 'M': 14.117, 'S': 0.09740},
            105: {'L': 0.1300, 'M': 15.328, 'S': 0.10068},
            110: {'L': 0.0700, 'M': 16.698, 'S': 0.10408}
        }
    },
    'girls': {
        'weight_for_age': {
            0: {'L': 0.3809, 'M': 3.2322, 'S': 0.14171},
            6: {'L': 0.3370, 'M': 7.297, 'S': 0.13580},
            12: {'L': 0.3172, 'M': 8.9499, 'S': 0.13507},
            18: {'L': 0.3000, 'M': 10.2, 'S': 0.13400},
            24: {'L': 0.2843, 'M': 11.5, 'S': 0.13222},
            36: {'L': 0.2200, 'M': 13.9, 'S': 0.13000},
            48: {'L': 0.1500, 'M': 16.1, 'S': 0.13300},
            60: {'L': 0.0800, 'M': 18.2, 'S': 0.14100}
        },
        'height_for_age': {
            0: {'L': 1, 'M': 49.1477, 'S': 0.03790},
            6: {'L': 1, 'M': 65.7311, 'S': 0.03520},
            12: {'L': 1, 'M': 74.0, 'S': 0.03410},
            18: {'L': 1, 'M': 80.7, 'S': 0.03300},
            24: {'L': 1, 'M': 86.4, 'S': 0.03900},
            36: {'L': 1, 'M': 95.1, 'S': 0.03900},
            48: {'L': 1, 'M': 102.7, 'S': 0.03800},
            60: {'L': 1, 'M': 109.4, 'S': 0.03700}
        },
        'weight_for_height': {
            45: {'L': 0.3809, 'M': 2.396, 'S': 0.09029},
            50: {'L': 0.3809, 'M': 3.232, 'S': 0.09008},
            55: {'L': 0.3809, 'M': 4.224, 'S': 0.08988},
            60: {'L': 0.3370, 'M': 5.407, 'S': 0.08892},
            65: {'L': 0.3370, 'M': 6.752, 'S': 0.08836},
            70: {'L': 0.3370, 'M': 8.018, 'S': 0.08778},
            75: {'L': 0.3370, 'M': 9.147, 'S': 0.08728},
            80: {'L': 0.3172, 'M': 10.154, 'S': 0.08758},
            85: {'L': 0.3172, 'M': 11.071, 'S': 0.08876},
            90: {'L': 0.3172, 'M': 11.985, 'S': 0.09046},
            95: {'L': 0.2843, 'M': 12.977, 'S': 0.09282},
            100: {'L': 0.2843, 'M': 14.112, 'S': 0.09577},
            105: {'L': 0.2200, 'M': 15.416, 'S': 0.09912},
            110: {'L': 0.1500, 'M': 16.896, 'S': 0.10264}
        }
    }
}

# ========== ML MODEL ==========
def train_ml_model():
    print("🤖 Training ML Model...")
    np.random.seed(42)
    n_samples = 500
    X, y = [], []
    
    for _ in range(n_samples):
        age = random.randint(6, 60)
        gender = random.choice([0, 1])
        
        if random.random() < 0.6:
            weight, height, muac = random.uniform(7, 18), random.uniform(65, 110), random.uniform(12.5, 15)
            diet_score, economic_score, edema = random.uniform(6, 10), random.uniform(5, 10), 0
            label = 'NORMAL'
        elif random.random() < 0.65:
            weight, height, muac = random.uniform(5, 9), random.uniform(60, 90), random.uniform(11.5, 12.5)
            diet_score, economic_score, edema = random.uniform(3, 6), random.uniform(2, 6), 0
            label = 'MAM'
        else:
            weight, height, muac = random.uniform(3, 7), random.uniform(50, 80), random.uniform(9, 11.5)
            diet_score, economic_score, edema = random.uniform(1, 4), random.uniform(1, 4), random.choice([0, 1])
            label = 'SAM'
        
        X.append([age, weight, height, muac, gender, diet_score, economic_score, edema])
        y.append(label)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    model.fit(np.array(X), y)
    
    with open('ml_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    print("✅ ML Model trained!")
    return model

if os.path.exists('ml_model.pkl'):
    with open('ml_model.pkl', 'rb') as f:
        ml_model = pickle.load(f)
    print("✅ ML Model loaded")
else:
    ml_model = train_ml_model()

# ========== HELPER FUNCTIONS ==========
def calculate_z_score_lms(measured, L, M, S):
    try:
        return math.log(measured / M) / S if L == 0 else (pow(measured / M, L) - 1) / (L * S)
    except:
        return 0

def get_nearest_reference(age_months, reference_dict):
    ages = sorted(reference_dict.keys())
    return reference_dict[min(ages, key=lambda x: abs(x - age_months))]

def get_nearest_height_reference(height, reference_dict):
    heights = sorted(reference_dict.keys())
    return reference_dict[min(heights, key=lambda x: abs(x - height))]

def calculate_who_z_scores(height, weight, age_months, gender):
    gender_key = 'boys' if gender.lower() in ['male', 'boys', 'boy'] else 'girls'
    ref = WHO_REFERENCE[gender_key]
    
    wfa_ref = get_nearest_reference(age_months, ref['weight_for_age'])
    z_wfa = calculate_z_score_lms(weight, wfa_ref['L'], wfa_ref['M'], wfa_ref['S'])
    
    hfa_ref = get_nearest_reference(age_months, ref['height_for_age'])
    z_hfa = calculate_z_score_lms(height, hfa_ref['L'], hfa_ref['M'], hfa_ref['S'])
    
    wfh_ref = get_nearest_height_reference(height, ref['weight_for_height'])
    z_wfh = calculate_z_score_lms(weight, wfh_ref['L'], wfh_ref['M'], wfh_ref['S'])
    
    return {'wfa': round(z_wfa, 2), 'hfa': round(z_hfa, 2), 'wfh': round(z_wfh, 2)}

def interpret_z_score(z_score, indicator_name):
    if z_score > -1:
        return f'✅ {indicator_name}: सामान्य (Normal)'
    elif -2 <= z_score <= -1:
        return f'🟡 {indicator_name}: हल्का कुपोषण (Mild)'
    elif -3 <= z_score < -2:
        return f'🟠 {indicator_name}: मध्यम कुपोषण (Moderate/MAM)'
    else:
        return f'🔴 {indicator_name}: गंभीर कुपोषण (Severe/SAM)'

def get_overall_severity(z_scores, muac):
    wfh = z_scores['wfh']
    muac_severity = 'SAM' if muac < 11.5 else 'MAM' if muac < 12.5 else 'NORMAL'
    z_severity = 'SAM' if wfh < -3 else 'MAM' if wfh < -2 else 'NORMAL'
    
    if muac_severity == 'SAM' or z_severity == 'SAM':
        return 'SAM'
    elif muac_severity == 'MAM' or z_severity == 'MAM':
        return 'MAM'
    return 'NORMAL'

# ========== API ROUTES ==========
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'success': True, 'message': 'Server chal raha hai!'}), 200

@app.route('/api/user/register', methods=['POST'])
def register_user():
    try:
        data = request.json
        name, phone = data.get('name'), data.get('phone')
        age, gender, location = data.get('age'), data.get('gender'), data.get('location')
        
        if not name or not phone:
            return jsonify({'error': 'Name aur phone zaroori hain'}), 400
        
        conn = sqlite3.connect('malnutrition.db')
        c = conn.cursor()
        c.execute('''INSERT INTO users (name, phone, age, gender, location, created_at)
                     VALUES (?, ?, ?, ?, ?, ?)''', (name, phone, age, gender, location, datetime.now()))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        
        return jsonify({'success': True, 'user_id': user_id, 'message': f'User {name} registered!'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Phone number pehle se hai'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        conn = sqlite3.connect('malnutrition.db')
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = c.fetchone()
        conn.close()
        if not user:
            return jsonify({'error': 'User nahi mila'}), 404
        return jsonify({
            'id': user[0], 'name': user[1], 'phone': user[2],
            'age': user[3], 'gender': user[4], 'location': user[5]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assessment/create', methods=['POST'])
def create_assessment():
    try:
        data = request.json
        user_id = data.get('user_id')
        height, weight, muac = float(data.get('height')), float(data.get('weight')), float(data.get('muac'))
        age_months, gender = int(data.get('age_months', 24)), data.get('gender', 'male')
        entry_type, edema, anemia, notes = data.get('entry_type', 'manual'), data.get('edema', 'no'), data.get('anemia', 'unknown'), data.get('notes', '')
        
        if not all([user_id, height, weight, muac]):
            return jsonify({'error': 'Sab parameters zaroori hain'}), 400
        
        z_scores = calculate_who_z_scores(height, weight, age_months, gender)
        severity = get_overall_severity(z_scores, muac)
        
        if edema == 'yes':
            severity = 'SAM'
        
        bmi = round(weight / ((height / 100) ** 2), 2)
        wh_ratio = round((weight / height) * 100, 2)
        
        interpretations = {
            'wfa': interpret_z_score(z_scores['wfa'], 'Weight-for-Age'),
            'hfa': interpret_z_score(z_scores['hfa'], 'Height-for-Age'),
            'wfh': interpret_z_score(z_scores['wfh'], 'Weight-for-Height')
        }
        
        severity_hindi = {
            'SAM': 'गंभीर तीव्र कुपोषण (Severe Acute Malnutrition)',
            'MAM': 'मध्यम तीव्र कुपोषण (Moderate Acute Malnutrition)',
            'NORMAL': 'सामान्य (Normal)'
        }
        
        advice_map = {
            'SAM': '🚨 तुरंत NRC (Nutrition Rehabilitation Centre) जाएं!',
            'MAM': '⚠️ पोषण में सुधार करें। ICDS/आंगनवाड़ी से संपर्क करें।',
            'NORMAL': '✅ बच्चा स्वस्थ है। अच्छा पोषण जारी रखें।'
        }
        
        conditions = []
        if z_scores['wfa'] < -2:
            conditions.append('⚖️ Underweight')
        if z_scores['hfa'] < -2:
            conditions.append('📏 Stunting')
        if z_scores['wfh'] < -2:
            conditions.append('📉 Wasting')
        if edema == 'yes':
            conditions.append('💧 Edema')
        
        conn = sqlite3.connect('malnutrition.db')
        c = conn.cursor()
        c.execute('''INSERT INTO assessments 
                     (user_id, date, height, weight, muac, entry_type, severity,
                      z_score_wfa, z_score_hfa, z_score_wfh, bmi, wh_ratio, edema, anemia, notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (user_id, datetime.now(), height, weight, muac, entry_type,
                   severity, z_scores['wfa'], z_scores['hfa'], z_scores['wfh'],
                   bmi, wh_ratio, edema, anemia, notes))
        conn.commit()
        assessment_id = c.lastrowid
        conn.close()
        
        return jsonify({
            'success': True, 'assessment_id': assessment_id, 'muac': muac,
            'severity': severity, 'severity_hindi': severity_hindi.get(severity, ''),
            'advice': advice_map.get(severity, ''), 'bmi': bmi, 'wh_ratio': wh_ratio,
            'z_scores': z_scores, 'interpretations': interpretations,
            'conditions': conditions, 'edema': edema, 'anemia': anemia,
            'message': 'Assessment created!'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assessment/all/<int:user_id>', methods=['GET'])
def get_all_assessments(user_id):
    try:
        conn = sqlite3.connect('malnutrition.db')
        c = conn.cursor()
        c.execute('''SELECT id, date, height, weight, muac, severity,
                            z_score_wfa, z_score_hfa, z_score_wfh, bmi, wh_ratio, edema, anemia
                     FROM assessments WHERE user_id = ? ORDER BY date DESC''', (user_id,))
        assessments = c.fetchall()
        conn.close()
        
        result = []
        for a in assessments:
            result.append({
                'id': a[0], 'date': a[1], 'height': a[2], 'weight': a[3],
                'muac': a[4], 'severity': a[5], 'z_wfa': a[6] or 0,
                'z_hfa': a[7] or 0, 'z_wfh': a[8] or 0, 'bmi': a[9] or 0,
                'wh_ratio': a[10] or 0, 'edema': a[11] or 'no', 'anemia': a[12] or 'unknown'
            })
        
        return jsonify({'success': True, 'assessments': result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/<int:user_id>', methods=['GET'])
def get_dashboard(user_id):
    try:
        conn = sqlite3.connect('malnutrition.db')
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = c.fetchone()
        if not user:
            return jsonify({'error': 'User nahi mila'}), 404
        
        c.execute('SELECT * FROM assessments WHERE user_id = ? ORDER BY date DESC LIMIT 1', (user_id,))
        assessment = c.fetchone()
        conn.close()
        
        return jsonify({
            'user': {
                'id': user[0], 'name': user[1], 'phone': user[2],
                'age': user[3], 'gender': user[4], 'location': user[5]
            },
            'latest_assessment': {
                'severity': assessment[7], 'muac': assessment[5],
                'height': assessment[3], 'weight': assessment[4],
                'z_wfa': assessment[8], 'z_hfa': assessment[9], 'z_wfh': assessment[10]
            } if assessment else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict_malnutrition():
    try:
        data = request.json
        age_months, weight, height, muac = float(data.get('age_months', 24)), float(data.get('weight')), float(data.get('height')), float(data.get('muac'))
        gender = 1 if data.get('gender', 'male').lower() in ['male', 'boy'] else 0
        diet_score, economic_score = float(data.get('diet_score', 5)), float(data.get('economic_score', 5))
        edema = 1 if data.get('edema', 'no') == 'yes' else 0
        
        features = np.array([[age_months, weight, height, muac, gender, diet_score, economic_score, edema]])
        prediction = ml_model.predict(features)[0]
        probabilities = ml_model.predict_proba(features)[0]
        confidence = max(probabilities) * 100
        
        classes = ml_model.classes_
        prob_dict = {classes[i]: round(probabilities[i] * 100, 1) for i in range(len(classes))}
        
        risk_factors = []
        if muac < 12.5:
            risk_factors.append(f'Low MUAC ({muac} cm)')
        if diet_score < 5:
            risk_factors.append(f'Poor diet quality (score: {diet_score}/10)')
        if economic_score < 4:
            risk_factors.append(f'Low economic status (score: {economic_score}/10)')
        if edema == 1:
            risk_factors.append('Presence of edema')
        
        advice_map = {
            'SAM': '🔴 तुरंत NRC में भर्ती करें।',
            'MAM': '🟠 Supplementary feeding program में शामिल करें।',
            'NORMAL': '🟢 वर्तमान आहार जारी रखें।'
        }
        
        return jsonify({
            'success': True, 'prediction': prediction, 'confidence': round(confidence, 1),
            'probabilities': prob_dict, 'risk_factors': risk_factors,
            'advice': advice_map.get(prediction, ''), 'model_type': 'RandomForest'
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/vision-analysis', methods=['POST'])
def vision_analysis():
    try:
        responses = [
            "🤖 AI Vision: बच्चा सामान्य दिख रहा है। ✅ Overall: NORMAL",
            "🤖 AI Vision: हल्का पतलापन दिख रहा है। 🟠 Overall: MAM Risk",
            "🤖 AI Vision: muscle wasting स्पष्ट है। 🔴 Overall: SAM Risk"
        ]
        return jsonify({'success': True, 'analysis': random.choice(responses), 'mode': 'demo'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        user_message = request.json.get('message', '').lower()
        responses = {
            'muac': '📏 MUAC: 🟢 >12.5cm Normal 🟠 11.5-12.5cm MAM 🔴 <11.5cm SAM',
            'sam': '🔴 SAM: तुरंत NRC भर्ती करें!',
            'diet': '🍽️ SAM: दिन में 8 बार खिलाएं',
            'emergency': '🚨 102 Ambulance, 1098 Child Helpline'
        }
        for key, response in responses.items():
            if key in user_message:
                return jsonify({'success': True, 'response': response}), 200
        return jsonify({'success': True, 'response': '🤔 पूछें: MUAC, SAM, Diet, Emergency'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/hidden-hunger', methods=['POST'])
def hidden_hunger():
    try:
        data = request.json
        meat_freq, veg_freq = int(data.get('meat_frequency', 2)), int(data.get('veg_frequency', 5))
        diet_variety, sunlight = int(data.get('diet_variety', 5)), int(data.get('sunlight_exposure', 3))
        
        iron_risk = max(0, min(100, 100 - (meat_freq * 10 + veg_freq * 5 + diet_variety * 5)))
        vitamin_d_risk = max(0, min(100, 100 - (sunlight * 20 + diet_variety * 3)))
        zinc_risk = max(0, min(100, 100 - (meat_freq * 12 + diet_variety * 6)))
        b12_risk = max(0, min(100, 100 - (meat_freq * 15 + diet_variety * 4)))
        
        def get_level(risk):
            return 'HIGH' if risk > 70 else 'MEDIUM' if risk > 40 else 'LOW'
        
        results = {
            'iron': {'risk_percentage': round(iron_risk, 1), 'level': get_level(iron_risk), 'foods': ['पालक', 'गुड़', 'अंडा']},
            'vitamin_d': {'risk_percentage': round(vitamin_d_risk, 1), 'level': get_level(vitamin_d_risk), 'foods': ['धूप', 'अंडा', 'मछली']},
            'zinc': {'risk_percentage': round(zinc_risk, 1), 'level': get_level(zinc_risk), 'foods': ['मीट', 'दाल', 'काजू']},
            'vitamin_b12': {'risk_percentage': round(b12_risk, 1), 'level': get_level(b12_risk), 'foods': ['अंडा', 'मछली', 'दूध']}
        }
        
        overall_risk = (iron_risk + vitamin_d_risk + zinc_risk + b12_risk) / 4
        
        return jsonify({
            'success': True, 'results': results, 'overall_risk': round(overall_risk, 1),
            'message': 'बिना blood test के micronutrient assessment'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/womb-to-world', methods=['POST'])
def womb_to_world():
    try:
        data = request.json
        mother_age, mother_bmi, hemoglobin = int(data.get('mother_age', 25)), float(data.get('mother_bmi', 22)), float(data.get('hemoglobin', 11))
        previous_malnourished = data.get('previous_malnourished', 'no') == 'yes'
        diet_score, anc_visits = int(data.get('diet_score', 5)), int(data.get('anc_visits', 4))
        economic_score, trimester = int(data.get('economic_score', 5)), int(data.get('trimester', 2))
        
        risk_score = 0
        if mother_bmi < 18.5:
            risk_score += 25
        if hemoglobin < 11:
            risk_score += 20
        if mother_age < 20 or mother_age > 35:
            risk_score += 10
        if previous_malnourished:
            risk_score += 20
        risk_score += (10 - diet_score) * 2
        if anc_visits < 4:
            risk_score += 15
        risk_score += (10 - economic_score) * 1.5
        risk_score = min(100, risk_score)
        
        risk_level = 'HIGH' if risk_score > 70 else 'MEDIUM' if risk_score > 40 else 'LOW'
        color = '🔴' if risk_level == 'HIGH' else '🟠' if risk_level == 'MEDIUM' else '🟢'
        
        risk_factors = []
        if mother_bmi < 18.5:
            risk_factors.append('माँ का कम वजन')
        if hemoglobin < 11:
            risk_factors.append(f'Anemia (Hb: {hemoglobin})')
        if previous_malnourished:
            risk_factors.append('पिछले बच्चे में कुपोषण')
        
        protective = []
        if mother_bmi >= 18.5 and mother_bmi <= 25:
            protective.append('सामान्य BMI')
        if hemoglobin >= 11:
            protective.append('Normal Hemoglobin')
        
        timeline = {
            'now': 'Iron + Folic Acid शुरू करें',
            'next_month': 'Protein-rich diet बढ़ाएं',
            'before_delivery': 'नियमित ANC checkup',
            'after_delivery': 'Exclusive breastfeeding 6 months'
        }
        
        schemes = ['🏥 JSY', '👶 PMSMA', '🍎 ICDS', '💊 Free IFA']
        
        return jsonify({
            'success': True, 'risk_level': risk_level, 'risk_score': round(risk_score, 1),
            'risk_factors': risk_factors, 'protective_factors': protective,
            'intervention_timeline': timeline, 'months_to_delivery': (3 - trimester) * 3,
            'recommended_schemes': schemes, 'message': f'{color} बच्चे में कुपोषण का {risk_level} risk'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 POSHANDRISHTI BACKEND SERVER")
    print("="*60)
    print("📡 Running on http://localhost:5000")
    print("\n✅ Endpoints:")
    print("   • POST /api/user/register")
    print("   • POST /api/assessment/create")
    print("   • POST /api/predict (ML Model)")
    print("   • POST /api/vision-analysis")
    print("   • POST /api/chatbot")
    print("   • POST /api/hidden-hunger")
    print("   • POST /api/womb-to-world")
    print("="*60 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)