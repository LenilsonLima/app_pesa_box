import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
    Dimensions
} from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts, Poppins_400Regular, Poppins_600SemiBold_Italic } from "@expo-google-fonts/poppins";

import HeaderComponent from "../../../components/HeaderComponent";
import LoadingComponent from "../../../components/LoadingComponent";
import colors from "../../../assets/colors.json";
import ApiAxiosWeb from "../../../apiAxiosWeb";
import { navigate, navigateGoBack, navigateReset } from "../../../navigationRef";

const { width } = Dimensions.get("window");

const AlterarApicultor = () => {
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold_Italic
    });

    const [loading, setLoading] = useState(true);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [openCloseOpcoes, setOpenCloseOpcoes] = useState(false);

    const handleDadosApicultor = async () => {
        try {
            setLoading(true);
            const response = await ApiAxiosWeb.get('/usuario');

            setNome(response.data.registros[0]?.nome || '');
            setEmail(response.data.registros[0]?.email || '');
            setLoading(false);
        } catch (error) {
            console.log(error.response?.data?.retorno);
            Alert.alert(
                'ATENÇÃO',
                error.response?.data?.retorno?.mensagem || 'Erro ao carregar dados do apicultor.',
                [{ text: 'Fechar', onPress: () => navigateGoBack() }]
            );
        }
    };

    useFocusEffect(useCallback(() => {
        handleDadosApicultor();
    }, []));

    const handleAlterarApicultor = async () => {
        if (!email || !nome) {
            return Alert.alert('ATENÇÃO', 'Todos os campos devem ser preenchidos!');
        }

        try {
            setLoading(true);
            const body = { nome, email };

            const response = await ApiAxiosWeb.put('/usuario', body);
            await AsyncStorage.setItem('@pesa_box_nome', nome);

            Alert.alert('SUCESSO', response?.data?.retorno?.mensagem, [
                { text: 'Voltar ao início', onPress: () => navigateGoBack() }
            ]);
        } catch (error) {
            console.log(error?.response?.data || error.message);
            const mensagem = error.response?.data?.retorno?.mensagem || 'Erro ao realizar alteração, tente novamente.';
            Alert.alert('ATENÇÃO', mensagem);
            setLoading(false);
        }
    };

    const handleConfirmarDesativarConta = () => {
        Alert.alert(
            'ATENÇÃO',
            'Ao confirmar, você concorda em desativar este usuário e bloquear todas as suas permissões de acesso na plataforma.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', style: 'destructive', onPress: () => handleDesativarConta() }
            ]
        );
    };

    const handleDesativarConta = async () => {
        try {
            setLoading(true);

            const response = await ApiAxiosWeb.put('/usuario/block', {});

            AsyncStorage.clear();
            Alert.alert('SUCESSO', response?.data?.retorno?.mensagem, [
                { text: 'Fechar', onPress: () => navigateReset('Login') }
            ]);
        } catch (error) {
            console.log(error?.response?.data || error.message);
            const mensagem = error.response?.data?.retorno?.mensagem || 'Erro ao apagar conta, tente novamente.';
            Alert.alert('ATENÇÃO', mensagem);
            setLoading(false);
        }
    };

    const handleCloseOpcoes = () => {
        setOpenCloseOpcoes(false);
    }
    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {loading || !fontsLoaded ? (
                <LoadingComponent />
            ) : (
                <>
                    <HeaderComponent
                        icone={<MaterialIcons name='close' size={30} color={colors.dark} />}
                        funcao={() => navigate('Home')}
                    />

                    <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
                        <SafeAreaView style={styles.container}>
                            <View style={styles.content}>
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>ATUALIZAR APICULTOR</Text>
                                        <MaterialIcons name="hive" size={25} color="orange" />
                                    </View>

                                    <Text style={styles.cardDescription}>
                                        Atualize as informações do apicultor para manter os dados sempre corretos e garantir o bom funcionamento do sistema de monitoramento das colmeias.
                                    </Text>

                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            value={nome}
                                            onChangeText={setNome}
                                            placeholder="Nome"
                                            style={styles.input}
                                        />
                                        <Feather name="user" size={22} style={styles.inputIcon} />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            placeholder="Email"
                                            style={styles.input}
                                        />
                                        <MaterialIcons name="alternate-email" size={22} style={styles.inputIcon} />
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <TouchableOpacity style={styles.button} onPress={handleAlterarApicultor}>
                                            <Text style={styles.buttonText}>Salvar Alterações</Text>
                                            <MaterialIcons name="chevron-right" size={20} color={colors.white} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </SafeAreaView>
                    </ScrollView>
                    
                    {/* OPÇÕES */}
                    {openCloseOpcoes ? (
                        <View style={styles.opcoesContainer}>
                            <TouchableOpacity style={styles.overlay} onPress={handleCloseOpcoes} />
                            <View style={styles.opcoesBotoesContainer}>
                                <TouchableOpacity style={styles.opcoesLabelWrapper}
                                    onPress={() => {
                                        handleDadosApicultor();
                                        handleCloseOpcoes();
                                    }}
                                >
                                    <Text style={styles.opcoesLabel}>Recarregar Dados</Text>
                                    <View style={styles.botaoOpcao}>
                                        <Ionicons name="reload" size={25} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.opcoesLabelWrapper}
                                    onPress={() => {
                                        handleConfirmarDesativarConta();
                                        setOpenCloseOpcoes(false);
                                    }}
                                >
                                    <Text style={styles.opcoesLabel}>Desativar Conta</Text>
                                    <View style={styles.botaoOpcao}>
                                        <MaterialIcons name="block" size={25} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.opcoesLabelWrapper} onPress={() => handleCloseOpcoes()}>
                                    <Text style={styles.opcoesLabel}>Fechar</Text>
                                    <View style={styles.botaoOpcao}>
                                        <MaterialIcons name="close" size={25} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.botaoMenu} onPress={() => setOpenCloseOpcoes(true)}>
                            <MaterialIcons name="menu" size={25} color="#fff" />
                        </TouchableOpacity>
                    )}
                </>
            )}
        </KeyboardAvoidingView>
    );
};

export default AlterarApicultor;

const styles = StyleSheet.create({
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
        fontFamily: 'Poppins_600SemiBold_Italic',
    },
    cardDescription: {
        padding: 20,
        borderTopWidth: 1,
        borderColor: colors.borderColor,
        color: colors.gray,
        fontSize: 12,
        lineHeight: 20,
        fontFamily: 'Poppins_400Regular',
    },
    cardFooter: {
        borderTopWidth: 1,
        borderColor: colors.borderColor,
        height: 60,
        paddingHorizontal: 5,
        alignItems: "center",
        justifyContent: "center",
    },
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
        fontFamily: 'Poppins_400Regular',
    },
    inputIcon: {
        paddingRight: 10,
        color: colors.dark,
    },
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
        fontFamily: 'Poppins_400Regular',
    },

    // OPÇÕES FLOAT
    opcoesContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%'
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        opacity: 0.5
    },
    opcoesBotoesContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        gap: width < 400 ? 5 : 10,
        position: 'absolute',
        bottom: width < 400 ? 5 : 10,
        right: width < 400 ? 5 : 10
    },
    opcoesLabelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    opcoesLabel: {
        backgroundColor: '#f2f2f2',
        padding: 5,
        borderRadius: 15,
        paddingHorizontal: 20,
        fontSize: 10,
        fontFamily: 'Poppins_400Regular_Italic'
    },
    botaoOpcao: {
        backgroundColor: colors.orange,
        height: 50,
        width: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
    botaoMenu: {
        position: 'absolute',
        bottom: width < 400 ? 5 : 10,
        right: width < 400 ? 5 : 10,
        backgroundColor: colors.orange,
        height: 50,
        width: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
});