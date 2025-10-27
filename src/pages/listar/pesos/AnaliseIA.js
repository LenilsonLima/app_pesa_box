import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HeaderComponent from "../../../components/HeaderComponent";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useFonts, Poppins_400Regular, Poppins_600SemiBold_Italic } from "@expo-google-fonts/poppins";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import colors from '../../../assets/colors.json';
import LoadingComponent from "../../../components/LoadingComponent";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Api from "../../../api";
import { navigateGoBack } from "../../../navigationRef";
import ApiUrl from "../../../apiUrl";

const { width } = Dimensions.get('window');
const AnaliseIA = () => {
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold_Italic,
    });
    const [loading, setLoading] = useState(false);
    const [registrosAnaliseIA, setRegistrosAnaliseIA] = useState([]);
    const routes = useRoute();
    const { dados, observacao } = routes.params;

    useFocusEffect(useCallback(() => {
        requestAnaliseIA();
    }, []));
    const requestAnaliseIA = async () => {
        try {
            setLoading(true);
            const response = await Api.post(ApiUrl.urlPesosCaixaAnaliseIA, dados);
            setRegistrosAnaliseIA(response.data.registros);
        } catch (error) {
            console.log(error.response.data);
            Alert.alert(
                'ATENÇÃO',
                error.response.data.retorno.mensagem || 'Erro ao realizar análise, tente novamente.', [{ text: 'fechar', onPress: () => null }]
            );
        } finally {
            setLoading(false);
        }
    }
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
                    <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
                        <SafeAreaView style={styles.container}>
                            <View style={styles.content}>
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>Análise Com IA</Text>
                                        <MaterialIcons name="hive" size={25} color="orange" />
                                    </View>
                                    <Text style={[styles.cardDescription, { textTransform: 'uppercase', fontFamily: 'Poppins_600SemiBold_Italic' }]}>
                                        {observacao}  {`\n`}
                                        Tendencia: {registrosAnaliseIA?.tendencia}
                                    </Text>
                                    {registrosAnaliseIA.ajustes?.map((item, index) => (
                                        <View key={index} style={[styles.cardDescription, { flexDirection: 'column' }]}>
                                            <Text style={[styles.cardDescriptionText, { textTransform: 'uppercase', fontFamily: 'Poppins_600SemiBold_Italic' }]}>{item?.nivel} {`\n`}</Text>
                                            <Text style={styles.cardDescriptionText}>{item?.texto}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </SafeAreaView>
                    </ScrollView>
                    <TouchableOpacity style={styles.botaoOpcao} onPress={requestAnaliseIA}>
                        <Ionicons name="reload" size={25} color="#fff" />
                    </TouchableOpacity>
                </>
            }
        </KeyboardAvoidingView>
    )
}
export default AnaliseIA;
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
        flex: 1,
    },

    // === CARD ===
    card: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 10,
        overflow: 'hidden',
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
    cardDescriptionText: {
        color: colors.gray,
        fontSize: 12,
        lineHeight: 20,
        fontFamily: 'Poppins_400Regular',
    },
    botaoOpcao: {
        position: 'absolute',
        bottom: width < 400 ? 5 : 10,
        right: width < 400 ? 5 : 10,
        backgroundColor: '#ffa500',
        height: 50,
        width: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
});