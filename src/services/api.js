import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const api = {
  async createDetenteur(data) {
    const response = await axios.post(`${API_URL}/detenteurs`, data);
    return response.data;
  },
  
  async getDetenteurs() {
    const response = await axios.get(`${API_URL}/detenteurs`);
    return response.data;
  }
};
