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
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts, Poppins_400Regular, Poppins_600SemiBold_Italic } from "@expo-google-fonts/poppins";

import HeaderComponent from "../../../components/HeaderComponent";
import LoadingComponent from "../../../components/LoadingComponent";
import colors from "../../../assets/colors.json";
import Api from "../../../api";
import { navigate, navigateGoBack, navigateReset } from "../../../navigationRef";
import ApiUrl from "../../../apiUrl";

const { width } = Dimensions.get("window");

const AlterarApicultor = () => {
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold_Italic
    });

    const [loading, setLoading] = useState(true);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');

    const handleDadosApicultor = async () => {
        try {
            const response = await Api.get(ApiUrl.urlApicultor);

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

            const response = await Api.put(ApiUrl.urlApicultor, body);
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

    const handleConfirmarApagarConta = () => {
        Alert.alert(
            'ATENÇÃO',
            'Tem certeza de que deseja excluir sua conta? Todos os dados das caixas e registros de peso serão permanentemente apagados. Esta ação é irreversível.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', style: 'destructive', onPress: () => handleApagarConta() }
            ]
        );
    };

    const handleApagarConta = async () => {
        try {
            setLoading(true);

            const response = await Api.delete(ApiUrl.urlApicultor);

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
                                            <MaterialIcons name="chevron-right" size={20} color={colors.dark} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <TouchableOpacity
                                            style={[styles.button, { backgroundColor: colors.red }]}
                                            onPress={handleConfirmarApagarConta}
                                        >
                                            <Text style={[styles.buttonText, { color: colors.white }]}>Apagar Minha Conta</Text>
                                            <MaterialIcons name="chevron-right" size={20} color={colors.white} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </SafeAreaView>
                    </ScrollView>
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
        backgroundColor: colors.yellow,
        height: 50,
        width: "100%",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "space-between",
    },
    buttonText: {
        color: colors.dark,
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
    },
});