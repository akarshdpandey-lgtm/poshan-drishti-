import React, { useState } from 'react';
import axios from 'axios';
import { useLang } from '../LanguageContext';

function UserRegistrationLocalized({ onSuccess }) {
  const { t, lang } = useLang();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'male',
    location: 'Delhi'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('https://poshandrishti-backend.onrender.com/api/user/register', formData);
      onSuccess(response.data.user_id);
      alert(lang === 'hi' ? 'रजिस्ट्रेशन सफल!' : 'Registration successful!');
    } catch (err) {
      setError(err.response?.data?.error || (lang === 'hi' ? 'रजिस्ट्रेशन में त्रुटि' : 'Error registering user'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-form">
      <h2>{lang === 'hi' ? 'यूजर रजिस्ट्रेशन' : 'User Registration'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{lang === 'hi' ? 'नाम' : 'Name'}:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder={lang === 'hi' ? 'अपना नाम दर्ज करो' : 'Enter your name'} />
        </div>

        <div className="form-group">
          <label>{lang === 'hi' ? 'फोन' : 'Phone'}:</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder={lang === 'hi' ? '10 अंकों का फोन नंबर' : '10-digit phone number'} />
        </div>

        <div className="form-group">
          <label>{lang === 'hi' ? 'उम्र (महीनों में)' : 'Age (months)'}:</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} required placeholder={lang === 'hi' ? 'महीनों में उम्र' : 'Age in months'} />
        </div>

        <div className="form-group">
          <label>{t('de_gender')}:</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="male">{t('de_boy')}</option>
            <option value="female">{t('de_girl')}</option>
          </select>
        </div>

        <div className="form-group">
          <label>{lang === 'hi' ? 'लोकेशन' : 'Location'}:</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder={lang === 'hi' ? 'शहर/गाँव का नाम' : 'City / village name'} />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? t('loading') : (lang === 'hi' ? 'रजिस्टर करो' : 'Register')}
        </button>
      </form>
    </div>
  );
}

export default UserRegistrationLocalized;
