import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
    baseURL: '/api',
});

// Prima di ogni richiesta, aggiunge automaticamente il token Firebase
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;