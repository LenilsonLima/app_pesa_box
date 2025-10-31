import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, StyleSheet } from 'react-native';
import { Platform } from 'react-native';
import PreLoadComponent from '../components/PreLoadComponent';
import Home from '../pages/home/Home';
import Login from '../pages/login/Login';
import ConfigurarWifiRaspberry from '../pages/configurar_wifi_raspberry/ConfigurarWifiRaspberry';
import SolicitarTrocarSenha from '../pages/solicitar_trocar_senha/SolicitarTrocarSenha';
import ListarCaixas from '../pages/listar/listar_caixas/ListarCaixas';
import colors from '../assets/colors.json';
import { SafeAreaView } from 'react-native-safe-area-context';
import GraficoPesos from '../pages/listar/pesos/GraficoPesos';
import AnaliseIA from '../pages/listar/pesos/AnaliseIA';
import AlterarApicultor from '../pages/alterar/apicultor/AlterarApicultor';
import { navigationRef } from '../navigationRef';
import CadastrarApicultor from '../pages/cadastro/apicultor/CadastrarApicultor';

const RootStack = createNativeStackNavigator();

const Rotas = () => {
    return (
        <SafeAreaView style={styles.container}>
            <NavigationContainer ref={navigationRef}>
                <RootStack.Navigator screenOptions={{ headerShown: false, presentation: 'modal', animation: 'fade' }}>
                    <RootStack.Screen name="PreLoadComponent" component={PreLoadComponent} />
                    <RootStack.Screen name="Home" component={Home} />
                    <RootStack.Screen name="Login" component={Login} />
                    <RootStack.Screen name="ConfigurarWifiRaspberry" component={ConfigurarWifiRaspberry} />
                    <RootStack.Screen name="SolicitarTrocarSenha" component={SolicitarTrocarSenha} />
                    <RootStack.Screen name="CadastrarApicultor" component={CadastrarApicultor} />
                    <RootStack.Screen name="ListarCaixas" component={ListarCaixas} />
                    <RootStack.Screen name="GraficoPesos" component={GraficoPesos} />
                    <RootStack.Screen name="AnaliseIA" component={AnaliseIA} />
                    <RootStack.Screen name="AlterarApicultor" component={AlterarApicultor} />
                </RootStack.Navigator>
            </NavigationContainer>
            <StatusBar backgroundColor={colors.fundo} barStyle={'dark-content'} />
        </SafeAreaView>
    )
}
export default Rotas;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.fundo,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    }
});