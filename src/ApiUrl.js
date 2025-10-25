const BASE_URL = 'https://api-pesagem-chi.vercel.app/'
// const BASE_URL_SERVER_RASP = 'http://192.168.15.9:5000/raspberry-server/'
const BASE_URL_SERVER_RASP = 'http://192.168.0.1:5002/raspberry/'

export const ApiUrl = {
    urlLogin: BASE_URL + 'apicultor/login',
    urlTrocaSenha: BASE_URL + 'apicultor/token_senha',
    urlCaixa: BASE_URL + 'caixa',
    urlPesosCaixa: BASE_URL + 'peso-caixa/pesos',
    urlPesosCaixaRelatorio: BASE_URL + 'peso-caixa',
    urlPesosCaixaAnaliseIA: BASE_URL + 'peso-caixa/analise-ia',

    urlConectarCaixaWifi: 'http://192.168.0.1:5002/raspberry/conectar-wifi',

    urlResetWifi: BASE_URL_SERVER_RASP + 'modo-ap-reboot',
    urlTararBalanca: BASE_URL_SERVER_RASP + 'tarar-balanca',
    urlRebootBalanca: BASE_URL_SERVER_RASP + 'reiniciar'
}