import { StyleSheet, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView, Dimensions } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useState } from "react";
import LoadingComponent from "../../../components/LoadingComponent";
import HeaderComponent from "../../../components/HeaderComponent";
import colors from '../../../assets/colors.json';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold_Italic } from "@expo-google-fonts/poppins";
import { SafeAreaView } from "react-native-safe-area-context";
import ApiAxiosWeb from "../../../apiAxiosWeb";
import { navigateGoBack } from "../../../navigationRef";
const { width } = Dimensions.get("window");

const CadastrarApicultor = () => {
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold_Italic
    });
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmarpassword, setConfirmarPassword] = useState("");

    // request para solicitar link de troca de senha
    const handleEnviarEmail = async () => {
        if (password?.length < 4 || password != confirmarpassword) {
            return Alert.alert("ATENÇÃO", "Os campos senha e confirmar senha devem se iguais e conter ao menos 4 caracteres.", [{ text: 'fechar', onPress: null }]);
        }

        if (!nome || !email) {
            return Alert.alert("ATENÇÃO", "Por favor, preencha todos os campos para prosseguir.", [{ text: 'fechar', onPress: null }]);
        }

        try {
            setLoading(true);

            const body = { email, nome, senha: password };

            const response = await ApiAxiosWeb.post('/usuario', body);

            let mensagem = response?.data?.retorno?.mensagem;

            Alert.alert("SUCESSO", mensagem, [{ text: 'fechar', onPress: () => navigateGoBack() }]);
        } catch (error) {
            console.log(error);

            let mensagem = error.response?.data.retorno.mensagem || "Não foi possível conectar ao servidor.";

            Alert.alert("ATENÇÃO", mensagem, [{ text: 'fechar', onPress: null }]);
        } finally {
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
                    <HeaderComponent icone={<MaterialIcons name='close' size={30} color={colors.dark} />} funcao={() => navigateGoBack()} />
                    <ScrollView
                        contentContainerStyle={styles.scrollView}
                        keyboardShouldPersistTaps="handled"
                    >
                        <SafeAreaView style={styles.container}>
                            <View style={styles.content}>
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>Criar Apicultor</Text>
                                        <MaterialIcons name="hive" size={25} color="orange" />
                                    </View>

                                    <Text style={styles.cardDescription}>
                                        Preencha os campos abaixo para cadastrar um novo apicultor no sistema.
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
                                            placeholder="E-mail"
                                            keyboardType="email-address"
                                            style={styles.input}
                                        />
                                        <MaterialIcons name="alternate-email" size={22} style={styles.inputIcon} />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!passwordVisible}
                                            placeholder="Senha"
                                            style={styles.input}
                                        />
                                        <MaterialIcons
                                            onPress={() => setPasswordVisible(prev => !prev)}
                                            name={passwordVisible ? "lock-open" : "lock-outline"}
                                            size={24}
                                            style={styles.inputIcon}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            value={confirmarpassword}
                                            onChangeText={setConfirmarPassword}
                                            secureTextEntry={!passwordVisible}
                                            placeholder="Confirmar Senha"
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
                                        <TouchableOpacity style={styles.primaryButton} onPress={handleEnviarEmail}>
                                            <Text style={styles.buttonText}>Cadastrar</Text>
                                            <MaterialIcons name="chevron-right" size={20} color={colors.white} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </SafeAreaView>
                    </ScrollView>
                </>
            )}
        </KeyboardAvoidingView >
    );
};

export default CadastrarApicultor;
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
    primaryButton: {
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
