import { StyleSheet, View } from "react-native";
import LottieView from 'lottie-react-native';

const LoadingComponent = () => {
    return (
        <View style={styles.container}>
            <LottieView
                source={require('../../assets/loading.json')}
                autoPlay
                loop
                style={{ width: '20%', height: "20%" }}
            />
        </View>
    )
}
export default LoadingComponent;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999
    }
})