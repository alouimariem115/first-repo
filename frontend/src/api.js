const API_URL = 'http://localhost:5000/api';
import axios from 'axios';

export const fetchData = async (startDate, endDate) => {
  try {
    const response = await axios.get(`http://localhost:3001/data?start=${startDate}&end=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Erreur de récupération des données :', error);
    return [];
  }
};

export const api = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (username, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    return response.json();
  },

  getSensorData: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/sensor/data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};