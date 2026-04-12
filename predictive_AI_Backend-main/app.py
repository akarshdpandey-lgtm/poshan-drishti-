from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import json
import math

app = Flask(__name__)
CORS(app)

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
    print("Database ready")

init_db()

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

def calculate_z_score_lms(measured, L, M, S):
    try:
        if L == 0:
            return math.log(measured / M) / S
        else:
            return (pow(measured / M, L) - 1) / (L * S)
    except:
        return 0

def get_nearest_reference(age_months, reference_dict):
    ages = sorted(reference_dict.keys())
    nearest = min(ages, key=lambda x: abs(x - age_months))
    return reference_dict[nearest]

def get_nearest_height_reference(height, reference_dict):
    heights = sorted(reference_dict.keys())
    nearest = min(heights, key=lambda x: abs(x - height))
    return reference_dict[nearest]

def calculate_who_z_scores(height, weight, age_months, gender):
    gender_key = 'boys' if gender.lower() in ['male', 'boys', 'boy'] else 'girls'
    ref = WHO_REFERENCE[gender_key]
    
    wfa_ref = get_nearest_reference(age_months, ref['weight_for_age'])
    z_wfa = calculate_z_score_lms(weight, wfa_ref['L'], wfa_ref['M'], wfa_ref['S'])
    
    hfa_ref = get_nearest_reference(age_months, ref['height_for_age'])
    z_hfa = calculate_z_score_lms(height, hfa_ref['L'], hfa_ref['M'], hfa_ref['S'])
    
    wfh_ref = get_nearest_height_reference(height, ref['weight_for_height'])
    z_wfh = calculate_z_score_lms(weight, wfh_ref['L'], wfh_ref['M'], wfh_ref['S'])
    
    return {
        'wfa': round(z_wfa, 2),
        'hfa': round(z_hfa, 2),
        'wfh': round(z_wfh, 2)
    }

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
    
    muac_severity = 'NORMAL'
    if muac < 11.5:
        muac_severity = 'SAM'
    elif muac < 12.5:
        muac_severity = 'MAM'
    
    z_severity = 'NORMAL'
    if wfh < -3:
        z_severity = 'SAM'
    elif wfh < -2:
        z_severity = 'MAM'
    
    if muac_severity == 'SAM' or z_severity == 'SAM':
        return 'SAM'
    elif muac_severity == 'MAM' or z_severity == 'MAM':
        return 'MAM'
    return 'NORMAL'

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'success': True, 'message': 'Server chal raha hai!'}), 200

@app.route('/api/user/register', methods=['POST'])
def register_user():
    try:
        data = request.json
        name = data.get('name')
        phone = data.get('phone')
        age = data.get('age')
        gender = data.get('gender')
        location = data.get('location')
        
        if not name or not phone:
            return jsonify({'error': 'Name aur phone zaroori hain'}), 400
        
        conn = sqlite3.connect('malnutrition.db')
        c = conn.cursor()
        c.execute('''INSERT INTO users (name, phone, age, gender, location, created_at)
                     VALUES (?, ?, ?, ?, ?, ?)''',
                  (name, phone, age, gender, location, datetime.now()))
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
        height = float(data.get('height'))
        weight = float(data.get('weight'))
        muac = float(data.get('muac'))
        age_months = int(data.get('age_months', 24))
        gender = data.get('gender', 'male')
        entry_type = data.get('entry_type', 'manual')
        edema = data.get('edema', 'no')
        anemia = data.get('anemia', 'unknown')
        notes = data.get('notes', '')
        
        if not all([user_id, height, weight, muac]):
            return jsonify({'error': 'Sab parameters zaroori hain'}), 400
        
        z_scores = calculate_who_z_scores(height, weight, age_months, gender)
        severity = get_overall_severity(z_scores, muac)
        
        if edema == 'yes':
            severity = 'SAM'
        
        height_m = height / 100
        bmi = round(weight / (height_m * height_m), 2)
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
            'SAM': '🚨 तुरंत NRC (Nutrition Rehabilitation Centre) जाएं! बच्चे को गंभीर कुपोषण है।',
            'MAM': '⚠️ पोषण में सुधार करें। ICDS/आंगनवाड़ी से संपर्क करें।',
            'NORMAL': '✅ बच्चा स्वस्थ है। अच्छा पोषण जारी रखें।'
        }
        
        conditions = []
        if z_scores['wfa'] < -2:
            conditions.append('⚖️ Underweight (कम वजन)')
        if z_scores['hfa'] < -2:
            conditions.append('📏 Stunting (बौनापन)')
        if z_scores['wfh'] < -2:
            conditions.append('📉 Wasting (दुबलापन)')
        if edema == 'yes':
            conditions.append('💧 Edema (शोथ/सूजन)')
        
        conn = sqlite3.connect('malnutrition.db')
        c = conn.cursor()
        c.execute('''INSERT INTO assessments 
                     (user_id, date, height, weight, muac, entry_type, severity,
                      z_score_wfa, z_score_hfa, z_score_wfh, bmi, wh_ratio,
                      edema, anemia, notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (user_id, datetime.now(), height, weight, muac, entry_type,
                   severity, z_scores['wfa'], z_scores['hfa'], z_scores['wfh'],
                   bmi, wh_ratio, edema, anemia, notes))
        conn.commit()
        assessment_id = c.lastrowid
        conn.close()
        
        return jsonify({
            'success': True,
            'assessment_id': assessment_id,
            'muac': muac,
            'severity': severity,
            'severity_hindi': severity_hindi.get(severity, ''),
            'advice': advice_map.get(severity, ''),
            'bmi': bmi,
            'wh_ratio': wh_ratio,
            'z_scores': z_scores,
            'interpretations': interpretations,
            'conditions': conditions,
            'edema': edema,
            'anemia': anemia,
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
                            z_score_wfa, z_score_hfa, z_score_wfh, bmi, wh_ratio,
                            edema, anemia
                     FROM assessments WHERE user_id = ? ORDER BY date DESC''', (user_id,))
        assessments = c.fetchall()
        conn.close()
        
        result = []
        for a in assessments:
            result.append({
                'id': a[0], 'date': a[1], 'height': a[2], 'weight': a[3],
                'muac': a[4], 'severity': a[5],
                'z_wfa': a[6] if a[6] else 0,
                'z_hfa': a[7] if a[7] else 0,
                'z_wfh': a[8] if a[8] else 0,
                'bmi': a[9] if a[9] else 0,
                'wh_ratio': a[10] if a[10] else 0,
                'edema': a[11] if a[11] else 'no',
                'anemia': a[12] if a[12] else 'unknown'
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
        
        c.execute('''SELECT * FROM assessments WHERE user_id = ?
                     ORDER BY date DESC LIMIT 1''', (user_id,))
        assessment = c.fetchone()
        conn.close()
        
        return jsonify({
            'user': {
                'id': user[0], 'name': user[1], 'phone': user[2],
                'age': user[3], 'gender': user[4], 'location': user[5]
            },
            'latest_assessment': {
                'severity': assessment[7],
                'muac': assessment[5],
                'height': assessment[3],
                'weight': assessment[4],
                'z_wfa': assessment[8],
                'z_hfa': assessment[9],
                'z_wfh': assessment[10]
            } if assessment else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("SERVER RUNNING on http://localhost:5000")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)