import axios from 'axios';

const API_URL = 'https://hwendo-backend.onrender.com/api';
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyt361jCljRmwDNhbfATncABZCYQMWQrn2vTBxU8cK6KwF9ldF6MiGBZyo14VB2vhNt/exec';

export const api = {
  async createDetenteur(data) {
    const response = await axios.post(API_URL + '/detenteurs', data);
    return response.data;
  },
  
  async getDetenteurs() {
    const response = await axios.get(API_URL + '/detenteurs');
    return response.data;
  },
  
  async generateConsentementDoc(detenteur, signature, photos = []) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ detenteur, signature, photos })
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async envoyerRapportEmail(stats, email, images) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'rapport', stats, email, images })
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
