import { StyleSheet, Text, View } from "react-native";
import colors from '../assets/colors.json';

const NotFound = ({ msg }) => {
    return (
        <View style={styles.areaError}>
            <Text style={styles.error}>{msg}</Text>
        </View>
    )
}
export default NotFound;
const styles = StyleSheet.create({
    // === ERRO ===
    areaError: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        textAlign: 'center',
        color: colors.red,
        fontSize: 14,
        maxWidth: 300,
        fontFamily: 'Poppins_400Regular'
    },
});