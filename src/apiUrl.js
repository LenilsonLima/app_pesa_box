// const BASE_URL_SERVER_RASP = 'http://192.168.15.9:5000/raspberry-server/'
const BASE_URL_SERVER_RASP = 'http://192.168.0.1:5002/raspberry/'

const ApiUrl = {
    urlApicultor: 'apicultor',
    urlLogin: 'apicultor/login',
    urlTrocaSenha: 'apicultor/token_senha',
    urlCaixa: 'caixa',
    urlPesosCaixa: 'peso-caixa/pesos',
    urlPesosCaixaRelatorio: 'peso-caixa',
    urlPesosCaixaAnaliseIA: 'peso-caixa/analise-ia',

    urlConectarCaixaWifi: 'http://192.168.0.1:5002/raspberry/conectar-wifi',

    urlResetWifi: BASE_URL_SERVER_RASP + 'modo-ap-reboot',
    urlTararBalanca: BASE_URL_SERVER_RASP + 'tarar-balanca',
    urlRebootBalanca: BASE_URL_SERVER_RASP + 'reiniciar'
}
export default ApiUrl;