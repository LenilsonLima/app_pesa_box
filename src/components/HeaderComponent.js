import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { expo } from "../../app.json";
import favo from '../assets/favo.png';
import colors from '../assets/colors.json';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold_Italic } from "@expo-google-fonts/poppins";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const HeaderComponent = ({ icone, funcao }) => {
    const [nome, setNome] = useState("");
    const [loading, setLoading] = useState(true);

    useFocusEffect(useCallback(() => {
        const carregarNome = async () => {
            setLoading(true);
            const nomeArmazenado = await AsyncStorage.getItem("@pesa_box_nome");
            if (nomeArmazenado) {
                setNome(nomeArmazenado);
            }
            setLoading(false);
        };

        carregarNome();
    }, []));

    return (
        <View style={styles.header}>
            {loading ?
                <View style={{ width: '100%' }}>
                    <ActivityIndicator size="small" color="orange" />
                </View>
                :
                <>
                    <View style={styles.headerLeft}>
                        <View style={styles.logoWrapper}>
                            <Image source={favo} resizeMode="contain" style={{ width: 50, height: 50 }} />
                        </View>
                        <View style={styles.headerTextGroup}>
                            <Text style={styles.headerTitle}>PesaBox</Text>
                            {nome && <Text style={styles.headerSubtitle}>{nome}</Text>}
                            <Text style={styles.headerSubtitle}>Versão: {expo?.version}</Text>
                        </View>
                    </View>
                    {icone &&
                        <TouchableOpacity
                            style={styles.btnIcone}
                            onPress={funcao}
                        >
                            {/* <MaterialIcons name={icone} size={30} /> */}
                            {icone}
                        </TouchableOpacity>
                    }
                </>
            }
        </View>
    );
};

export default HeaderComponent;
const styles = StyleSheet.create({
    // === HEADER ===
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: colors.borderColor,
        minHeight: 95
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    logoWrapper: {
        backgroundColor: colors.blue,
        height: 50,
        width: 50,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTextGroup: {
        // gap: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins_600SemiBold_Italic',
        color: colors.dark,
        lineHeight: 30
    },
    headerSubtitle: {
        fontSize: 12,
        color: colors.gray,
        fontFamily: 'Poppins_400Regular',
    },
    btnIcone: {
    }
});