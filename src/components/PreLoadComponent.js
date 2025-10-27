import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const PreLoadComponent = () => {
    const navigation = useNavigation();
    useFocusEffect(useCallback(() => {
        const checkLogin = async () => {
            let token = await AsyncStorage.getItem('@pesa_box_token');
            if (token) {
                // caso tenha token
                navigation.reset({
                    index: 1,
                    routes: [{ name: 'Home' }]
                })
            } else {
                // caso não tenha token
                navigation.reset({
                    index: 1,
                    routes: [{ name: 'Login' }]
                })
            }
        }
        checkLogin();
    }, []));
    return (
        <SafeAreaView style={styles.container}>
            <LottieView
                source={require('../../assets/loading.json')}
                autoPlay
                loop
                style={{ width: '20%', height: "20%" }}
            />
        </SafeAreaView>
    )
}
export default PreLoadComponent;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})