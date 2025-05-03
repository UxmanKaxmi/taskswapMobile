// src/api/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://192.168.1.23:3001', // ⬅️ replace with your local IP
  headers: {
    'Content-Type': 'application/json',
  },
});