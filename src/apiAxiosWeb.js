import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigateReset } from './navigationRef';

const ApiAxiosWeb = axios.create({
    baseURL: 'https://api-pesagem-chi.vercel.app',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' } // sem Authorization aqui
});

// Adiciona token em todos os requests
ApiAxiosWeb.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('@pesa_box_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para tratar 401 e 403
ApiAxiosWeb.interceptors.response.use(
    response => response,
    async (error) => {
        if (error.response.data?.retorno.status === 401 || error.response.data?.retorno.status === 403) {
            await AsyncStorage.clear();
            navigateReset("Login");
        }
        return Promise.reject(error);
    }
);

export default ApiAxiosWeb;

