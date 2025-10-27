import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Alert, Image } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeaderComponent from "../../components/HeaderComponent";
import { useCallback, useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from '../../assets/colors.json';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_600SemiBold_Italic } from "@expo-google-fonts/poppins";
import colmeia from "../../assets/colmeia.png";
import { SafeAreaView } from "react-native-safe-area-context";
import NotFound from "../../components/NotFound";
import Api from "../../api";
import { navigate, navigateReset } from "../../navigationRef";
import ApiUrl from "../../apiUrl";
const { width } = Dimensions.get("window");

const Home = () => {
    const [caixas, setCaixas] = useState([]);
    const [loading, setLoading] = useState(false);

    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_600SemiBold_Italic,
    });

    useFocusEffect(useCallback(() => {
        const handleObterCaixasLocal = async () => {
            try {
                setLoading(true);
                const caixas_local = await AsyncStorage.getItem('@pesa_box_caixas_pendentes');
                setCaixas(JSON.parse(caixas_local) || []);
            } catch (error) {
                console.log(error);
                Alert.alert('ATENÇÃO', 'Falha ao buscar caixas pendentes, tente novamente.');
            } finally {
                setLoading(false);
            }
        }
        handleObterCaixasLocal();
    }, []));

    const logout = async () => {
        Alert.alert(
            'ATENÇÃO',
            'Deseja realmente deslogar e sair do aplicativo.',
            [
                { text: 'Fechar', onPress: null },
                {
                    text: 'Deslogar', onPress: async () => {
                        await AsyncStorage.removeItem('@pesa_box_token');
                        await AsyncStorage.removeItem('@pesa_box_nome');
                        navigateReset("Login");
                    }
                }
            ]
        );

    };

    const handleClickCaixa = async (caixa) => {
        const nomeArmazenado = await AsyncStorage.getItem("@pesa_box_nome");
        Alert.alert(
            'ATENÇÃO',
            `Deseja enviar a caixa "${caixa?.observacao}" para o servidor e vinculá-la ao apicultor "${nomeArmazenado}"?`,
            [
                { text: 'Cancelar', onPress: null },
                { text: 'excluir', onPress: () => handleExcluirCaixaLocal(caixa) },
                { text: 'Enviar', onPress: () => handleSubmitCaixa(caixa) },
            ]
        );
    }

    const handleExcluirCaixaLocal = async (caixa) => {
        Alert.alert(
            'ATENÇÃO',
            `Você tem certeza que deseja remover a caixa "${caixa.observacao}" do arquivo local? Esta caixa ainda não foi sincronizada com o servidor e essa ação não poderá ser desfeita.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    style: 'destructive',
                    onPress: async () => {
                        let caixas_local = JSON.parse(await AsyncStorage.getItem('@pesa_box_caixas_pendentes')) || [];
                        caixas_local = caixas_local.filter(item => item?.identificador_balanca !== caixa?.identificador_balanca);
                        await AsyncStorage.setItem('@pesa_box_caixas_pendentes', JSON.stringify(caixas_local));
                        setCaixas(caixas_local);

                        Alert.alert(
                            'SUCESSO',
                            `A caixa "${caixa.observacao}" foi removida do arquivo local com sucesso.`
                        );
                    }
                },
            ]
        );
    };

    const handleSubmitCaixa = async (caixa) => {
        try {
            setLoading(true);
            const response = caixa?.caixa_id > 0 ?
                await Api.put(ApiUrl.urlCaixa, caixa)
                :
                await Api.post(ApiUrl.urlCaixa, caixa);

            let caixas_local = JSON.parse(await AsyncStorage.getItem('@pesa_box_caixas_pendentes')) || [];
            caixas_local = caixas_local.filter(item => item?.identificador_balanca !== caixa?.identificador_balanca);
            await AsyncStorage.setItem('@pesa_box_caixas_pendentes', JSON.stringify(caixas_local));
            setCaixas(caixas_local);

            Alert.alert('SUCESSO', response.data.retorno?.mensagem || 'Caixa enviada com sucesso!');
        } catch (error) {
            console.log(error.response?.data?.retorno);
            Alert.alert(
                'ATENÇÃO',
                error.response?.data?.retorno?.mensagem || 'Falha ao enviar a caixa.',
                [
                    { text: "ok", onPress: null }
                ]
            );
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
                    <HeaderComponent icone={<Feather name="user" size={25} color={colors.dark} />} funcao={() => navigate('AlterarApicultor')} />
                    <ScrollView
                        contentContainerStyle={styles.scrollView}
                        keyboardShouldPersistTaps="handled"
                    >
                        <SafeAreaView style={styles.container}>
                            <View style={styles.content}>
                                {/* Cartão de boas-vindas */}
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>Bem-vindo ao PesaBox</Text>
                                        <MaterialIcons name="hive" size={25} color="orange" />
                                    </View>

                                    <Text style={styles.cardText}>
                                        Gerencie e acompanhe suas caixas com praticidade. Suas informações estarão sempre organizadas e acessíveis.
                                    </Text>

                                    <View style={styles.cardFooter}>
                                        <TouchableOpacity
                                            style={styles.buttonPrimary}
                                            onPress={() => navigate("ListarCaixas")}
                                        >
                                            <Text style={styles.buttonText}>Configurações de Caixas</Text>
                                            <Ionicons name="settings-outline" size={22} color={colors.dark} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <TouchableOpacity style={styles.buttonSecondary} onPress={logout}>
                                            <Text style={[styles.buttonText, { color: colors.white }]}>Sair</Text>
                                            <AntDesign name="logout" size={20} color={colors.white} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Cartão e listagem de caixas */}
                                {caixas.length > 0 ?
                                    (<>
                                        <View style={styles.card}>
                                            <View style={styles.cardHeader}>
                                                <Text style={styles.cardTitle}>Caixas Pendentes</Text>
                                                <MaterialIcons name="hive" size={25} color="orange" />
                                            </View>
                                            <Text style={styles.cardDescription}>
                                                Estas caixas já estão conectadas à rede Wi-Fi, mas ainda não foram sincronizadas com o servidor.
                                                Faça a sincronização para vinculá-las ao apicultor.
                                            </Text>
                                        </View>
                                        <View style={styles.card}>
                                            {caixas?.map((item, index) => (
                                                <TouchableOpacity
                                                    onPress={() => handleClickCaixa(item)}
                                                    key={index}
                                                    style={[
                                                        styles.caixaGroup,
                                                        { borderTopWidth: index === 0 ? 0 : 1 },
                                                    ]}
                                                >
                                                    <View style={styles.caixaContent}>
                                                        <View style={styles.caixaIconWrapper}>
                                                            <Image source={colmeia} style={{ width: 40, height: 40 }} />
                                                        </View>
                                                        <View style={styles.caixaBody}>
                                                            <Text style={styles.caixaTitle}>{item.observacao}</Text>
                                                            <Text style={styles.caixaStatus}>Não Sincronizada</Text>
                                                            <Text style={styles.caixaIdentificacao}>{item.identificador_balanca}</Text>
                                                        </View>
                                                    </View>
                                                    <MaterialIcons
                                                        name="chevron-right"
                                                        size={30}
                                                        style={styles.caixaIcon}
                                                    />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </>)
                                    :
                                    <NotFound msg="Não foram encontradas caixas pendentes de sincronização." />
                                }
                            </View>
                        </SafeAreaView>
                    </ScrollView>
                </>
            }
        </KeyboardAvoidingView>
    );
};

export default Home;

export const styles = StyleSheet.create({
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
        flex: 1
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
        fontFamily: 'Poppins_600SemiBold_Italic',
        color: colors.dark
    },
    cardText: {
        padding: 20,
        borderTopWidth: 1,
        borderColor: colors.borderColor,
        color: colors.gray,
        fontSize: 12,
        lineHeight: 20,
        fontFamily: 'Poppins_400Regular'
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

    // === BUTTONS ===
    buttonPrimary: {
        flexDirection: "row",
        paddingHorizontal: 10,
        backgroundColor: colors.yellow,
        height: 50,
        width: "100%",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "space-between",
    },
    buttonSecondary: {
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

    // === LISTAGEM DE CAIXAS ===
    caixaGroup: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderColor: colors.borderColor,
        justifyContent: "space-between",
    },
    caixaContent: {
        flexDirection: "row",
        alignItems: "center",
        maxWidth: "90%",
        gap: 10,
    },
    caixaIconWrapper: {
        backgroundColor: colors.fundo,
        height: width < 400 ? 50 : 60,
        width: width < 400 ? 50 : 60,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        overflow: 'hidden'
    },
    caixaBody: {
        flexShrink: 1,
        // gap: 5,
    },
    caixaTitle: {
        fontSize: width < 400 ? 15 : 20,
        fontFamily: 'Poppins_600SemiBold_Italic',
    },
    caixaStatus: {
        fontSize: 12,
        color: colors.red,
        fontFamily: 'Poppins_400Regular'
    },
    caixaIdentificacao: {
        fontSize: 12,
        color: colors.gray,
        fontFamily: 'Poppins_400Regular'
    },
    caixaIcon: {
        fontSize: 25,
        color: colors.dark,
    },
});
