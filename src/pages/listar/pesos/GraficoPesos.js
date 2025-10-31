import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Svg, { Line, Circle, Path, Rect } from 'react-native-svg';
import LoadingComponent from '../../../components/LoadingComponent';
import HeaderComponent from '../../../components/HeaderComponent';
import colors from '../../../assets/colors.json';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts, Poppins_400Regular, Poppins_400Regular_Italic, Poppins_600SemiBold_Italic } from "@expo-google-fonts/poppins";
import { gerarRelatorioPesagem } from './printRelatorioPesagem';
import DataFilter from './DataFilter';
import NotFound from '../../../components/NotFound';
import ApiAxiosWeb from '../../../apiAxiosWeb';
import { navigate, navigateGoBack } from '../../../navigationRef';

const { width } = Dimensions.get('window');

const GraficoPesosCustom = () => {
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold_Italic,
        Poppins_400Regular_Italic
    });
    const route = useRoute();
    const { caixa } = route.params;
    const screenWidth = width - 20;
    const chartHeight = 250;

    const [openCloseOpcoes, setOpenCloseOpcoes] = useState(false);
    const [registros, setRegistros] = useState(null);
    const [loading, setLoading] = useState(false);
    const [requestReload, setRequestReload] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const dataDate = new Date();
    const mesAtual = String(dataDate.getMonth() + 1).padStart('2', 0);
    const anoAtual = dataDate.getFullYear();
    const [dia, setDia] = useState('01');
    const [mes, setMes] = useState(mesAtual);
    const [ano, setAno] = useState(anoAtual);
    const [show, setShow] = useState(false);
    const ultimoDia = new Date(ano, parseInt(mes), 0).getDate();

    const MenuOpcoesComponent = () => {
        return (
            openCloseOpcoes ? (
                <View style={styles.opcoesContainer}>
                    <TouchableOpacity style={styles.overlay} onPress={() => setOpenCloseOpcoes(false)} />

                    <View style={styles.opcoesBotoesContainer}>
                        <TouchableOpacity style={styles.opcoesLabelWrapper}
                            onPress={() => {
                                setRequestReload(!requestReload);
                                setOpenCloseOpcoes(false);
                            }}
                        >
                            <Text style={styles.opcoesLabel}>Recarregar Dados</Text>
                            <View style={styles.botaoOpcao}>
                                <Ionicons name="reload" size={25} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        {registros &&
                            <TouchableOpacity style={styles.opcoesLabelWrapper}
                                onPress={() => {
                                    navigate(
                                        "AnaliseIA",
                                        {
                                            observacao: caixa?.observacao,
                                            dados: registros.datasets[0].data
                                        }
                                    );
                                    setOpenCloseOpcoes(false);
                                }}
                            >
                                <Text style={styles.opcoesLabel}>Análise Com IA</Text>
                                <View style={styles.botaoOpcao}>
                                    <MaterialCommunityIcons name="robot-outline" size={25} color="#fff" />
                                </View>
                            </TouchableOpacity>
                        }
                        <TouchableOpacity style={styles.opcoesLabelWrapper}
                            onPress={() => {
                                setShow(true);
                                setOpenCloseOpcoes(false);
                            }}
                        >
                            <Text style={styles.opcoesLabel}>Alterar Data</Text>
                            <View style={styles.botaoOpcao}>
                                <MaterialIcons name="calendar-month" size={25} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        {registros &&
                            <TouchableOpacity style={styles.opcoesLabelWrapper} onPress={() => gerarPDF()}>
                                <Text style={styles.opcoesLabel}>Gerar PDF</Text>
                                <View style={styles.botaoOpcao}>
                                    <MaterialIcons name="picture-as-pdf" size={25} color="#fff" />
                                </View>
                            </TouchableOpacity>
                        }
                        <TouchableOpacity style={styles.opcoesLabelWrapper} onPress={() => setOpenCloseOpcoes(false)}>
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
            )
        )
    };

    const SemRegistrosComponent = () => {
        return (
            <>
                <HeaderComponent icone={<MaterialIcons name='close' size={30} color={colors.dark} />} funcao={() => navigateGoBack()} />
                <DataFilter
                    dia={dia}
                    ano={ano}
                    mes={mes}
                    setDia={setDia}
                    setAno={setAno}
                    setMes={setMes}
                    setShow={setShow}
                    show={show}
                />
                <MenuOpcoesComponent />
                <NotFound msg={errorMsg} />
            </>
        )
    }

    const padding = 10;

    useEffect(() => {
        const fetchDados = async () => {
            setLoading(true);
            setErrorMsg('');
            const params = {
                params: {
                    caixa_id: caixa?.id,
                    data_inicial: `${ano}-${mes}-${dia}`,
                    data_final: `${ano}-${mes}-${ultimoDia}`
                }
            };

            try {
                const response = await ApiAxiosWeb.get('/peso-caixa/pesos', params);
                setRegistros(response.data.registros);
            } catch (error) {
                setErrorMsg(error.response.data.retorno.mensagem || error.message);
                setRegistros(null);
                Alert.alert(
                    'ATENÇÃO',
                    error.response.data.retorno.mensagem || error.message, [{ text: 'fechar', onPress: () => null }]
                );
            } finally {
                setLoading(false);
            }
        };
        fetchDados();
    }, [requestReload, mes, ano, dia]);

    if (loading || !fontsLoaded) return <LoadingComponent />;

    if (!registros) {
        return (
            <SemRegistrosComponent />
        )
    };

    const { datasets, limite_peso, labels } = registros;
    const data = datasets[0].data;

    if (data.length === 0) return <SemRegistrosComponent />;

    const maxValor = Math.max(...data, limite_peso);
    const minValor = 0;

    const scaleY = (valor) =>
        padding + ((valor - minValor) / (maxValor - minValor)) * (chartHeight - 2 * padding);
    const yPos = (valor) => chartHeight - scaleY(valor);

    const chartWidth = screenWidth;
    const stepX = data.length > 1 ? (chartWidth - 2 * padding) / (data.length - 1) : 0;
    const xPos = (i) => padding + (data.length > 1 ? stepX * i : chartWidth / 2);

    const pathData =
        data.length > 1
            ? data.map((peso, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(peso)}`).join(' ')
            : `M ${chartWidth / 2} ${yPos(data[0])}`;

    const filledPath =
        data.length > 1
            ? `${pathData} L ${xPos(data.length - 1)} ${chartHeight - padding} L ${xPos(0)} ${chartHeight - padding} Z`
            : `M ${chartWidth / 2 - 2} ${chartHeight - padding} L ${chartWidth / 2 + 2} ${chartHeight - padding} L ${chartWidth / 2} ${yPos(data[0])} Z`;

    const labelIndices =
        labels.length <= 1
            ? [0]
            : [
                0,
                Math.floor((labels.length - 1) / 3),
                Math.floor((labels.length - 1) * 2 / 3),
                labels.length - 1,
            ];

    const pesoAtual = data[data.length - 1];
    const diferenca = pesoAtual - limite_peso;


    const gerarPDF = async () => {
        setLoading(true);
        try {
            await gerarRelatorioPesagem(caixa?.id, `${ano}-${mes}-${dia}`, `${ano}-${mes}-${ultimoDia}`);
        } catch (error) {
            Alert.alert('ATENÇÃO', error.message, [{ onPress: () => null, text: 'fechar' }]);
        } finally {
            setOpenCloseOpcoes(false);
            setLoading(false);
        }
    }


    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <HeaderComponent icone={<MaterialIcons name='close' size={30} color={colors.dark} />} funcao={() => navigateGoBack()} />
            <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
                <SafeAreaView style={styles.container}>
                    <DataFilter
                        dia={dia}
                        ano={ano}
                        mes={mes}
                        setDia={setDia}
                        setAno={setAno}
                        setMes={setMes}
                        setShow={setShow}
                        show={show}
                    />
                    <View style={styles.content}>
                        {errorMsg ?
                            <NotFound msg={errorMsg} />
                            :
                            <>
                                {/* Descrição */}
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>Dados da Caixa</Text>
                                        <MaterialIcons name="hive" size={25} color="orange" />
                                    </View>
                                    <Text style={styles.cardDescription}>
                                        Veja abaixo os pesos registrados no período de {dia}/{mes}/{ano} a {ultimoDia}/{mes}/{ano}.
                                        Cada ponto representa o peso da caixa em um dia.
                                    </Text>
                                </View>
                                {/* Resumo */}
                                <View style={styles.card}>
                                    <View style={styles.headerBox}>
                                        <View style={styles.headerItem}>
                                            <Text style={styles.headerLabel}>Peso atual</Text>
                                            <Text style={styles.headerValue}>{pesoAtual.toFixed(1)} kg</Text>
                                        </View>
                                        <View style={styles.headerItem}>
                                            <Text style={styles.headerLabel}>Limite</Text>
                                            <Text style={styles.headerValue}>{limite_peso.toFixed(1)} kg</Text>
                                        </View>
                                        <View style={styles.headerItem}>
                                            <Text style={styles.headerLabel}>Diferença</Text>
                                            <Text
                                                style={[
                                                    styles.headerValue,
                                                    { color: diferenca > 0 ? '#3cb371' : '#d9534f' },
                                                ]}
                                            >
                                                {diferenca.toFixed(1)} kg
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Gráfico */}
                                <View style={[styles.card, { padding: 5, gap: 5 }]}>
                                    <View style={[styles.chartWrapper, { width: '100%', height: chartHeight }]}>
                                        <Svg width={'100%'} height={chartHeight}>
                                            <Rect x="0" y="0" width={'100%'} height={chartHeight} fill="#fcf2e1ff" />
                                            <Path d={filledPath} fill="#f8d9a0ff" />

                                            <Line
                                                x1={xPos(0)}
                                                y1={yPos(limite_peso)}
                                                x2={xPos(data.length - 1)}
                                                y2={yPos(limite_peso)}
                                                stroke="#3cb371"
                                                strokeWidth="2"
                                            />

                                            {data.length > 1 &&
                                                data.map((peso, i) => {
                                                    if (i === 0) return null;
                                                    return (
                                                        <Line
                                                            key={i}
                                                            x1={xPos(i - 1)}
                                                            y1={yPos(data[i - 1])}
                                                            x2={xPos(i)}
                                                            y2={yPos(peso)}
                                                            stroke="#ffa500"
                                                            strokeWidth="2"
                                                        />
                                                    );
                                                })}

                                            {data.map((peso, i) => (
                                                <Circle
                                                    key={`ponto-${i}`}
                                                    cx={xPos(i)}
                                                    cy={yPos(peso)}
                                                    r="4"
                                                    fill="#ffa500"
                                                    onPressIn={() => {
                                                        Alert.alert(
                                                            `REGISTRO Nº ${i + 1}`,
                                                            `Peso: ${peso.toFixed(2)}kg`,
                                                            [{ text: 'fechar', onPress: null }]
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </Svg>
                                    </View>

                                    <View style={styles.labelsContainer}>
                                        {labelIndices.map(idx => (
                                            <Text key={idx} style={styles.label}>
                                                {labels[idx]}
                                            </Text>
                                        ))}
                                    </View>

                                    <View style={styles.legend}>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.colorBox, { backgroundColor: '#ffa500' }]} />
                                            <Text style={styles.textLegend}>Peso Registrado</Text>
                                        </View>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.colorBox, { backgroundColor: '#3cb371' }]} />
                                            <Text style={styles.textLegend}>Limite {limite_peso.toFixed(1)}kg</Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        }
                    </View>
                </SafeAreaView>
            </ScrollView>
            <MenuOpcoesComponent />
        </KeyboardAvoidingView>
    );
};

export default GraficoPesosCustom;

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

    // === RESUMO ===
    headerBox: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderRadius: 8,
        padding: 5,
        gap: 5,
    },
    headerItem: {
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 10,
        flex: 1,
        borderRadius: 10,
    },
    headerLabel: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Poppins_400Regular_Italic'
    },
    headerValue: {
        fontFamily: 'Poppins_600SemiBold_Italic',
        fontSize: 14,
        color: '#333',
    },

    // === GRÁFICO ===
    chartWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        overflow: 'hidden',
    },
    labelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fcf2e1ff',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    label: {
        fontSize: 9,
        color: '#555',
    },

    // === LEGENDA ===
    legend: {
        flexDirection: 'row',
        gap: 30,
        alignItems: 'center',
        padding: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: '#fcf2e1ff',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    colorBox: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
    },
    textLegend: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular_Italic'
    },

    // === OPÇÕES FLOAT ===
    opcoesContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        zIndex: 1
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        opacity: 0.5,
    },
    opcoesBotoesContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        gap: width < 400 ? 5 : 10,
        position: 'absolute',
        bottom: width < 400 ? 5 : 10,
        right: width < 400 ? 5 : 10,
    },
    opcoesLabelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    opcoesLabel: {
        backgroundColor: '#f2f2f2',
        padding: 5,
        borderRadius: 15,
        paddingHorizontal: 20,
        fontSize: 10,
        fontFamily: 'Poppins_400Regular_Italic',
    },
    botaoOpcao: {
        backgroundColor: '#ffa500',
        height: 50,
        width: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    botaoMenu: {
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