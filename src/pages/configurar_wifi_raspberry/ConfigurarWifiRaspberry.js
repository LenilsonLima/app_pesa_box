import { StyleSheet, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView, Dimensions } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
import HeaderComponent from "../../components/HeaderComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingComponent from "../../components/LoadingComponent";
import colors from '../../assets/colors.json';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold_Italic } from "@expo-google-fonts/poppins";
import { SafeAreaView } from "react-native-safe-area-context";
import ApiAxiosWeb from "../../apiAxiosWeb";
import { navigate, navigateGoBack } from "../../navigationRef";
const { width } = Dimensions.get("window");

const ConfigurarWifiRaspberry = () => {
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold_Italic
    });
    const [loading, setLoading] = useState(true);
    const [observacao, setObservacao] = useState('');
    const [limitePeso, setLimitePeso] = useState('');
    const [ssid, setSsid] = useState('');
    const [caixaID, setCaixaID] = useState(0);
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const route = useRoute();
    const { caixa } = route.params;

    // carregar dados da caixa se for alteração
    useFocusEffect(useCallback(() => {
        handleDadosCaixa();
    }, []));

    const handleDadosCaixa = () => {
        setLoading(true);
        try {

            // se a caixa for passada como parametro
            if (caixa) {
                setObservacao(caixa?.observacao);
                setLimitePeso(caixa?.limite_peso);
                setCaixaID(caixa?.id);
            }

        } finally {
            setLoading(false);
        }
    };

    // fazer a requisição pra api e enviar os dados de rede
    const handleGravarCaixa = async () => {
        if (!ssid || !password || !observacao) {
            return Alert.alert('ATENÇÃO', 'Todos os campos devem ser preenchidos!');
        }
        setLoading(true);

        try {
            const body = { ssid, password };

            const response = await ApiAxiosWeb.post('http://192.168.0.1:5002/raspberry/conectar-wifi', body);

            // pega o serial retornado
            const serial = response.data?.registros?.[0]?.serial;
            if (!serial) {
                throw new Error('Serial da balança não retornado.');
            }

            // Pega as caixas locais converte para json
            const stored = await AsyncStorage.getItem('@pesa_box_caixas_pendentes');
            const caixas_local = stored ? JSON.parse(stored) : [];

            // Monta o objeto novo/atualizado
            const novaCaixa = {
                identificador_balanca: serial,
                observacao: observacao,
                caixa_id: caixaID,
                limite_peso: limitePeso
            };

            // Verifica se já existe e substitui, senão adiciona
            const indexExistente = caixas_local.findIndex(
                (c) => c.identificador_balanca === serial
            );
            if (indexExistente !== -1) {
                caixas_local[indexExistente] = { ...caixas_local[indexExistente], ...novaCaixa };
            } else {
                caixas_local.push(novaCaixa);
            }

            // grava as caixas no local
            await AsyncStorage.setItem('@pesa_box_caixas_pendentes', JSON.stringify(caixas_local));

            // Limpa campos
            setSsid('');
            setPassword('');
            setObservacao('');
            setLimitePeso('');

            Alert.alert('SUCESSO', response?.data.retorno.mensagem, [{ text: 'voltar ao inicio', onPress: () => navigate('Home') }]);
        } catch (error) {
            console.log(error?.response?.data || error.message);

            const mensagem = error.response?.data.retorno.mensagem || 'Conecte-se à rede interna da balança (Balanca-AP) para salvar as configurações de Wi-Fi.';

            Alert.alert('ATENÇÃO', mensagem, [{ text: 'fechar', onPress: null }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {loading || !fontsLoaded ?
                <LoadingComponent />
                :
                <>
                    <HeaderComponent icone={<MaterialIcons name='close' size={30} color={colors.dark} />} funcao={() => navigateGoBack()} />
                    <ScrollView
                        contentContainerStyle={styles.scrollView}
                        keyboardShouldPersistTaps="handled"
                    >
                        <SafeAreaView style={styles.container}>
                            <View style={styles.content}>
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>Configuração de Rede</Text>
                                        <MaterialIcons name="hive" size={25} color="orange" />
                                    </View>

                                    <Text style={styles.cardDescription}>
                                        Configure a conexão Wi-Fi da sua caixa para permitir a transmissão automática dos dados coletados pelos sensores, facilitando o controle remoto da sua produção apícola.
                                    </Text>

                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            value={observacao}
                                            onChangeText={setObservacao}
                                            placeholder="Observação da Caixa"
                                            style={styles.input}
                                        />
                                        <MaterialIcons name="event-note" size={22} style={styles.inputIcon} />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            value={limitePeso}
                                            onChangeText={setLimitePeso}
                                            placeholder="Limite de Peso"
                                            style={styles.input}
                                        />
                                        <MaterialCommunityIcons name="scale-unbalanced" size={22} style={styles.inputIcon} />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            value={ssid}
                                            onChangeText={setSsid}
                                            placeholder="SSID da Rede"
                                            style={styles.input}
                                        />
                                        <MaterialIcons name="broadcast-on-home" size={22} style={styles.inputIcon} />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!passwordVisible}
                                            placeholder="Password"
                                            style={styles.input}
                                        />
                                        <MaterialIcons
                                            onPress={() => setPasswordVisible(prev => !prev)}
                                            name={passwordVisible ? "lock-open" : "lock-outline"}
                                            size={24}
                                            style={styles.inputIcon}
                                        />
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <TouchableOpacity style={styles.button} onPress={handleGravarCaixa}>
                                            <Text style={styles.buttonText}>Salvar Configuração da Caixa</Text>
                                            <MaterialIcons name="chevron-right" size={20} color={colors.white} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </SafeAreaView>
                    </ScrollView>
                </>
            }
        </KeyboardAvoidingView>
    );
};

export default ConfigurarWifiRaspberry;
const styles = StyleSheet.create({
    // === ROOT ===
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
        paddingHorizontal: width < 400 ? 5 : 10,
    },
    container: {
        flex: 1,
        backgroundColor: colors.fundo,
        paddingVertical: width < 400 ? 5 : 10,
        justifyContent: "space-between",
        gap: 20,
    },
    content: {
        rowGap: 10,
    },

    // === CARD ===
    card: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 10,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        gap: 7,
    },
    cardTitle: {
        color: colors.dark,
        fontSize: 15,
        textTransform: "uppercase",
        fontFamily: 'Poppins_600SemiBold_Italic'
    },
    cardDescription: {
        padding: 20,
        borderTopWidth: 1,
        borderColor: colors.borderColor,
        color: colors.gray,
        fontSize: 12,
        lineHeight: 20,
        fontFamily: 'Poppins_400Regular'
    },
    cardFooter: {
        borderTopWidth: 1,
        borderColor: colors.borderColor,
        height: 60,
        paddingHorizontal: 5,
        alignItems: "center",
        justifyContent: "center",
    },

    // === INPUTS ===
    inputGroup: {
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: colors.borderColor,
    },
    input: {
        flex: 1,
        height: 60,
        paddingHorizontal: 10,
        color: colors.gray,
        fontSize: 12,
        fontFamily: 'Poppins_400Regular'
    },
    inputIcon: {
        paddingRight: 10,
        color: colors.dark,
    },

    // === BUTTON ===
    button: {
        flexDirection: "row",
        paddingHorizontal: 10,
        backgroundColor: colors.orange,
        height: 50,
        width: "100%",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "space-between",
    },
    buttonText: {
        color: colors.white,
        fontSize: 12,
        fontFamily: 'Poppins_400Regular'
    },
});
