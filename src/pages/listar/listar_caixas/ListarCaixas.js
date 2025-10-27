import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Alert, Image, TextInput } from "react-native";
import { MaterialIcons, Ionicons, Octicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeaderComponent from "../../../components/HeaderComponent";
import { useCallback, useState } from "react";
import LoadingComponent from "../../../components/LoadingComponent";
import colors from '../../../assets/colors.json';
import { useFonts, Poppins_400Regular, Poppins_400Regular_Italic, Poppins_600SemiBold_Italic } from "@expo-google-fonts/poppins";
import colmeia from "../../../assets/colmeia.png";
import { SafeAreaView } from "react-native-safe-area-context";
import { handleConfiguracoesRede, handleDeletarCaixaConfirmar, handleReiniciarBalanca, handleResetarRede, handleTararBalanca } from "./FuncoesCaixas";
import NotFound from "../../../components/NotFound";
import Api from "../../../api";
import { navigate, navigateGoBack } from "../../../navigationRef";
import ApiUrl from "../../../apiUrl";

const { width } = Dimensions.get("window");

const ListarCaixas = () => {
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_400Regular_Italic,
        Poppins_600SemiBold_Italic
    });
    const [caixas, setCaixas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesquisar, setPesquisar] = useState('');
    const [openCloseOpcoes, setOpenCloseOpcoes] = useState(false);
    const [openCloseDadosAndOpcoes, setOpenCloseDadosAndOpcoes] = useState(false);
    const [caixaClicada, setCaixaClicada] = useState({});
    const [filtroOpenClose, setFiltroOpenClose] = useState(false);

    // buscar caixas
    useFocusEffect(useCallback(() => {
        requestCaixas();
    }, []));

    // request de caixas do servidor
    const requestCaixas = async () => {
        setLoading(true);

        const params = {
            params: {
                obs_identificador: ""
            },
            timeout: 5000 // 5 segundos
        };

        try {
            const response = await Api.get(`${ApiUrl.urlCaixa}/filtro`, params);
            const pesa_box_caixas_sincronizadas = response.data.registros || [];
            await AsyncStorage.setItem('@pesa_box_caixas_sincronizadas', JSON.stringify(pesa_box_caixas_sincronizadas));
            setCaixas(pesa_box_caixas_sincronizadas);
        } catch (error) {
            console.log(error.response?.data);
            let mensagem = error.response?.data.retorno.mensagem || 'Sem conexão de rede, caixas consultadas do arquivo local.';
            Alert.alert('ATENÇÃO', mensagem, [{ text: 'fechar', onPress: null }]);
            const pesa_box_caixas_sincronizadas = await AsyncStorage.getItem('@pesa_box_caixas_sincronizadas') || [];
            setCaixas(JSON.parse(pesa_box_caixas_sincronizadas))
        } finally {
            setLoading(false);
        }
    };

    // função para redirecionar
    const handleAcaoCaixa = async (caixa) => {
        setOpenCloseDadosAndOpcoes(true);
        setCaixaClicada(caixa);
    }

    const handleCloseOpcoes = () => {
        setOpenCloseOpcoes(false);
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
                    {caixas.length > 0 ?
                        <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
                            <SafeAreaView style={styles.container}>
                                <View style={styles.content}>
                                    {/* Cartão e listagem de caixas */}
                                    {!filtroOpenClose &&
                                        <View style={styles.card}>
                                            <View style={styles.cardHeader}>
                                                <Text style={styles.cardTitle}>Listagem de Caixas</Text>
                                                <MaterialIcons name="hive" size={25} color="orange" />
                                            </View>
                                            <Text style={styles.cardDescription}>
                                                Veja abaixo as caixas sincronizadas com o servidor. Clique em uma caixa para reconfigurar, trocar componentes ou editar a rede. Para adicionar uma nova caixa, toque no botão abaixo.
                                            </Text>
                                        </View>
                                    }

                                    {caixas?.filter((item) => {
                                        if (!pesquisar) return true;
                                        return String(item.observacao).toLowerCase().includes(pesquisar.toLowerCase());
                                    })?.length > 0 ?
                                        <View style={styles.card}>
                                            {caixas?.filter((item) => {
                                                if (!pesquisar) return true;
                                                return String(item.observacao).toLowerCase().includes(pesquisar.toLowerCase());
                                            })?.map((item, index) => (
                                                <TouchableOpacity
                                                    onPress={() => handleAcaoCaixa(item)}
                                                    key={index}
                                                    style={[styles.caixaGroup, { borderTopWidth: index === 0 ? 0 : 1 }]}
                                                >
                                                    <View style={styles.caixaContent}>
                                                        <View style={styles.caixaIconWrapper}>
                                                            <Image source={colmeia} style={styles.caixaImage} />
                                                        </View>
                                                        <View style={styles.caixaBody}>
                                                            <Text style={styles.caixaTitle}>{item.observacao}</Text>
                                                            <Text
                                                                style={[styles.caixaStatus, {
                                                                    color: parseFloat(item?.peso_atual) >= parseFloat(item?.limite_peso) ? colors.green : colors.red
                                                                }]}
                                                            >
                                                                {parseFloat(item?.peso_atual) >= parseFloat(item?.limite_peso) ? 'Pronto para coleta' : 'Peso insuficiente para coleta'}
                                                            </Text>
                                                            <Text style={styles.caixaIdentificacao}>{item.identificador_balanca}</Text>
                                                        </View>
                                                    </View>
                                                    <MaterialIcons name="chevron-right" size={30} style={styles.caixaIcon} />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        :
                                        <NotFound msg="Nenhuma caixa foi localizada, altere o filtro ou adicione uma nova caixa e tente novamente." />
                                    }
                                </View>
                            </SafeAreaView>
                        </ScrollView>
                        :
                        <NotFound msg="Nenhuma caixa foi localizada, altere o filtro ou adicione uma nova caixa e tente novamente." />
                    }

                    {/* OPÇÕES */}
                    {openCloseOpcoes ? (
                        <View style={styles.opcoesContainer}>
                            <TouchableOpacity style={styles.overlay} onPress={handleCloseOpcoes} />
                            {filtroOpenClose &&
                                <View style={styles.filtroWrapper}>
                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            value={pesquisar}
                                            onChangeText={setPesquisar}
                                            placeholder="Observação ou identenficador"
                                            style={styles.input}
                                        />
                                        <MaterialIcons
                                            onPress={pesquisar?.length > 0 ? () => setPesquisar('') : null}
                                            name={pesquisar?.length > 0 ? "close" : "search"}
                                            size={22}
                                            style={styles.inputIcon}
                                        />
                                    </View>
                                </View>
                            }
                            <View style={styles.opcoesBotoesContainer}>
                                <TouchableOpacity style={styles.opcoesLabelWrapper}
                                    onPress={() => {
                                        requestCaixas();
                                        handleCloseOpcoes();
                                    }}
                                >
                                    <Text style={styles.opcoesLabel}>Recarregar Lista</Text>
                                    <View style={styles.botaoOpcao}>
                                        <Ionicons name="reload" size={25} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.opcoesLabelWrapper}
                                    onPress={filtroOpenClose ?
                                        () => {
                                            setFiltroOpenClose(false);
                                            setPesquisar("");
                                        }
                                        :
                                        () => setFiltroOpenClose(true)
                                    }
                                >
                                    <Text style={styles.opcoesLabel}>{filtroOpenClose ? "Remover Filtro" : "Filtrar Caixas"}</Text>
                                    <View style={styles.botaoOpcao}>
                                        <Octicons name={filtroOpenClose ? "filter-remove" : "filter"} size={22} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.opcoesLabelWrapper}
                                    onPress={() => {
                                        handleCloseOpcoes();
                                        navigate("ConfigurarWifiRaspberry", { caixa: {} });
                                    }}
                                >
                                    <Text style={styles.opcoesLabel}>Nova Caixa</Text>
                                    <View style={styles.botaoOpcao}>
                                        <MaterialIcons name="add" size={25} color="#fff" />
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

                    {/* DADOS E OPÇÕES DA CAIXA */}
                    {openCloseDadosAndOpcoes && (
                        <View style={styles.opcoesContainer}>
                            <TouchableOpacity style={styles.overlay} onPress={() => setOpenCloseDadosAndOpcoes(false)} />
                            <View style={styles.opcoesBotoesContainer}>
                                <TouchableOpacity style={styles.opcoesLabelWrapper}
                                    onPress={() => {
                                        setOpenCloseDadosAndOpcoes(false);
                                        navigate("GraficoPesos", { caixa: caixaClicada });
                                    }}
                                >
                                    <Text style={styles.opcoesLabel}>Gráfico de Pesos</Text>
                                    <View style={styles.botaoOpcao}>
                                        <Ionicons name="bar-chart-outline" size={20} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.opcoesLabelWrapper}
                                    onPress={() => {
                                        setOpenCloseDadosAndOpcoes(false);
                                        handleTararBalanca(caixaClicada, setLoading);
                                    }}
                                >
                                    <Text style={styles.opcoesLabel}>Tarar Balança</Text>
                                    <View style={styles.botaoOpcao}>
                                        <MaterialCommunityIcons name="scale-unbalanced" size={25} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.opcoesLabelWrapper}
                                    onPress={() => {
                                        setOpenCloseDadosAndOpcoes(false);
                                        handleResetarRede(caixaClicada, setLoading);
                                    }}
                                >
                                    <Text style={styles.opcoesLabel}>Resertar Rede</Text>
                                    <View style={styles.botaoOpcao}>
                                        <MaterialIcons name="settings-remote" size={25} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.opcoesLabelWrapper}
                                    onPress={() => {
                                        setOpenCloseDadosAndOpcoes(false);
                                        handleConfiguracoesRede(caixaClicada, navigate);
                                    }}
                                >
                                    <Text style={styles.opcoesLabel}>Reconfigurar</Text>
                                    <View style={styles.botaoOpcao}>
                                        <MaterialIcons name="settings" size={25} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.opcoesLabelWrapper}
                                    onPress={() => {
                                        setOpenCloseDadosAndOpcoes(false);
                                        handleReiniciarBalanca(caixaClicada, setLoading);
                                    }}
                                >
                                    <Text style={styles.opcoesLabel}>Reiniciar</Text>
                                    <View style={styles.botaoOpcao}>
                                        <MaterialIcons name="power-settings-new" size={25} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.opcoesLabelWrapper}
                                    onPress={() => {
                                        setOpenCloseDadosAndOpcoes(false);
                                        handleDeletarCaixaConfirmar(caixaClicada, setLoading, requestCaixas);
                                    }}
                                >
                                    <Text style={styles.opcoesLabel}>Deletar</Text>
                                    <View style={styles.botaoOpcao}>
                                        <MaterialIcons name="delete" size={25} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.opcoesLabelWrapper} onPress={() => setOpenCloseDadosAndOpcoes(false)}>
                                    <Text style={styles.opcoesLabel}>Fechar</Text>
                                    <View style={styles.botaoOpcao}>
                                        <MaterialIcons name="close" size={25} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </>
            }
        </KeyboardAvoidingView>
    );
};

export default ListarCaixas;

export const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1
    },
    scrollView: {
        flexGrow: 1,
        paddingHorizontal: width < 400 ? 5 : 10
    },
    container: {
        flex: 1,
        backgroundColor: colors.fundo,
        paddingVertical: width < 400 ? 5 : 10,
        justifyContent: "space-between"
    },
    content: {
        rowGap: width < 400 ? 5 : 10,
        flex: 1
    },

    // CARD
    card: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 10
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        gap: 7
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

    // CAIXAS
    caixaGroup: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderColor: colors.borderColor,
        justifyContent: "space-between"
    },
    caixaContent: {
        flexDirection: "row",
        alignItems: "center",
        maxWidth: "90%",
        gap: 10
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
    caixaImage: {
        width: 40,
        height: 40
    },
    caixaBody: {
        flexShrink: 1
    },
    caixaTitle: {
        fontSize: width < 400 ? 15 : 20,
        fontFamily: 'Poppins_600SemiBold_Italic',
        color: colors.dark
    },
    caixaStatus: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular'
    },
    caixaIdentificacao: {
        fontSize: 12,
        color: colors.gray,
        fontFamily: 'Poppins_400Regular'
    },
    caixaIcon: {
        fontSize: 25,
        color: colors.dark
    },

    // INPUTS
    inputGroup: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 5
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        color: colors.gray,
        fontFamily: 'Poppins_400Regular',
        fontSize: 12
    },
    inputIcon: {
        paddingRight: 10,
        color: colors.dark
    },
    filtroWrapper: {
        padding: width < 400 ? 5 : 10,
        zIndex: 1
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