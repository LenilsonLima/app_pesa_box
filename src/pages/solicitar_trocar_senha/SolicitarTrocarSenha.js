import { StyleSheet, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import HeaderComponent from "../../components/HeaderComponent";
import colors from '../../assets/colors.json';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold_Italic } from "@expo-google-fonts/poppins";
import { SafeAreaView } from "react-native-safe-area-context";
import Api from "../../api";
import { navigateGoBack } from "../../navigationRef";
import ApiUrl from "../../apiUrl";
const { width } = Dimensions.get("window");

const SolicitarTrocarSenha = () => {
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold_Italic
    });
    const [usuario, setUsuario] = useState("");
    const [loading, setLoading] = useState(false);

    // request para solicitar link de troca de senha
    const handleEnviarEmail = async () => {
        if (!usuario) {
            return Alert.alert("ATENÇÃO", "Por favor, preencha seu e-mail para prosseguir.");
        }

        try {
            setLoading(true);

            const body = { email: usuario };

            const response = await Api.post(ApiUrl.urlTrocaSenha, body);

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
                                        <Text style={styles.cardTitle}>Redefinir Senha</Text>
                                        <MaterialIcons name="hive" size={25} color="orange" />
                                    </View>

                                    <Text style={styles.cardDescription}>
                                        Informe o e-mail que você utiliza para acessar o sistema. Enviaremos um link com instruções para que você possa redefinir sua senha com segurança.
                                    </Text>

                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            value={usuario}
                                            onChangeText={setUsuario}
                                            placeholder="E-mail"
                                            keyboardType="email-address"
                                            style={styles.input}
                                        />
                                        <MaterialIcons name="alternate-email" size={22} style={styles.inputIcon} />
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <TouchableOpacity style={styles.primaryButton} onPress={handleEnviarEmail}>
                                            <Text style={styles.buttonText}>Solicitar</Text>
                                            <MaterialIcons name="chevron-right" size={20} color={colors.dark} />
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

export default SolicitarTrocarSenha;
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
        fontFamily: 'Poppins_400Regular'
    },
});
