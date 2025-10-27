import { StyleSheet, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView, Dimensions } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import HeaderComponent from "../../components/HeaderComponent";
import colors from '../../assets/colors.json';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold_Italic } from "@expo-google-fonts/poppins";
import { SafeAreaView } from "react-native-safe-area-context";
import Api from "../../api";
import { navigate, navigateReset } from "../../navigationRef";
import ApiUrl from "../../apiUrl";
const { width } = Dimensions.get("window");

const Login = () => {
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold_Italic
    });
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // requesr login
    const handleLogin = async () => {
        if (!usuario || !password) {
            return Alert.alert("ATENÇÃO", "Todos os campos devem ser preenchidos!");
        }

        setLoading(true);

        try {
            const body = { email: usuario, senha: password };

            const response = await Api.post(ApiUrl.urlLogin, body);

            await AsyncStorage.setItem("@pesa_box_token", response.data.registros.token);
            await AsyncStorage.setItem("@pesa_box_nome", response.data.registros.nome);

            navigateReset("Home");
        } catch (error) {
            console.log(error);

            const mensagem = error.response?.data.retorno.mensagem || "Não foi possível conectar ao servidor.";

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
                    <HeaderComponent />
                    <ScrollView
                        contentContainerStyle={styles.scrollView}
                        keyboardShouldPersistTaps="handled"
                    >
                        <SafeAreaView style={styles.container}>
                            <View style={styles.content}>
                                {/* Card de login */}
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>Login PesaBox</Text>
                                        <MaterialIcons name="hive" size={25} color="orange" />
                                    </View>

                                    <Text style={styles.cardDescription}>
                                        Bem-vindo ao PesaBox Mobile! Faça login com suas credenciais para acessar a área exclusiva e aproveitar todos os recursos da apicultura digital.
                                    </Text>

                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            value={usuario}
                                            onChangeText={setUsuario}
                                            placeholder="E-mail"
                                            style={styles.input}
                                            keyboardType="email-address"
                                        />
                                        <MaterialIcons name="alternate-email" size={22} style={styles.inputIcon} />
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
                                        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                                            <Text style={styles.buttonText}>Entrar</Text>
                                            <MaterialIcons name="chevron-right" size={20} color={colors.dark} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Card de esqueci a senha */}
                                <View style={styles.card}>
                                    <View style={styles.cardFooterNoBorder}>
                                        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigate("SolicitarTrocarSenha")}>
                                            <Text style={[styles.buttonText, { color: colors.white }]}>Esqueceu a senha</Text>
                                            <Ionicons name="key" size={20} color={colors.white} />
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

export default Login;
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
    },
    content: {
        rowGap: width < 400 ? 5 : 10,
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
    cardFooterNoBorder: {
        height: 60,
        paddingHorizontal: 5,
        alignItems: "center",
        justifyContent: "center",
    },

    // === INPUT ===
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

    // === BUTTONS ===
    primaryButton: {
        flexDirection: "row",
        paddingHorizontal: 10,
        backgroundColor: colors.yellow,
        height: 50,
        width: "100%",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "space-between",
    },
    secondaryButton: {
        flexDirection: "row",
        paddingHorizontal: 10,
        backgroundColor: colors.red,
        height: 50,
        width: "100%",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "space-between",
    },
    buttonText: {
        color: colors.dark,
        fontSize: 12,
        fontFamily: 'Poppins_400Regular'
    },
});
