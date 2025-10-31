import axios from 'axios';

const ApiAxiosServidorRaspberry = axios.create({
    baseURL: 'http://192.168.15.9:5000/raspberry-server',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' } // sem Authorization aqui
});

export default ApiAxiosServidorRaspberry;

