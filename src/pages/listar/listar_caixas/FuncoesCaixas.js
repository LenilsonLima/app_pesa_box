import { Alert } from "react-native";
import Api from "../../../api";
import ApiUrl from "../../../apiUrl";

// Função genérica de alerta de confirmação
const showConfirmAlert = (titulo, mensagem, onConfirm) => {
    Alert.alert(titulo, mensagem, [
        { text: "Confirmar", onPress: onConfirm },
        { text: "Fechar", onPress: () => null }
    ]);
};

// Função genérica para executar requests Axios
const handleRequestAction = async (url, identificador, setLoading, mensagemSucesso, delay = 0) => {
    try {
        setLoading(true);
        const response = await Api.get(url, {
            params: { identificador_balanca: identificador },
            timeout: 5000
        });

        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        Alert.alert(
            "SUCESSO",
            response.data.retorno?.mensagem || mensagemSucesso,
            [{ text: "Fechar", onPress: () => null }]
        );
    } catch (error) {
        console.log("Erro na requisição:", error);

        const msg = error.response?.data.retorno?.mensagem ||
            "Não foi possível se conectar ao servidor. Verifique se ele está online e na mesma rede.";

        Alert.alert("ATENÇÃO", msg, [{ text: "Fechar", onPress: () => null }]);
    } finally {
        setLoading(false);
    }
};

// Configuração de rede
export const handleConfiguracoesRede = (caixa, navigate) => {
    showConfirmAlert(
        "ATENÇÃO",
        `Deseja reconfigurar a rede da caixa "${caixa?.observacao}"?`,
        () => navigate("ConfigurarWifiRaspberry", { caixa })
    );
};

// Resetar rede
export const handleResetarRede = (caixa, setLoading) => {
    showConfirmAlert(
        "ATENÇÃO",
        `Resetar a rede da caixa "${caixa?.observacao}" vai restaurar todas as configurações de rede para o padrão. Deseja continuar?`,
        () => handleRequestAction(ApiUrl.urlResetWifi, caixa?.identificador_balanca, setLoading, "Rede resetada com sucesso!")
    );
};

// Tarar balança
export const handleTararBalanca = (caixa, setLoading) => {
    showConfirmAlert(
        "ATENÇÃO",
        `Tarar a balança da caixa "${caixa?.observacao}" vai ajustar o peso para zero. Deseja continuar?`,
        () => handleRequestAction(ApiUrl.urlTararBalanca, caixa?.identificador_balanca, setLoading, "Balança tarada com sucesso!", 5000)
    );
};

// Reiniciar balança
export const handleReiniciarBalanca = (caixa, setLoading) => {
    showConfirmAlert(
        "ATENÇÃO",
        `Reiniciar a caixa "${caixa?.observacao}" fará com que o equipamento reinicie. Deseja continuar?`,
        () => handleRequestAction(ApiUrl.urlRebootBalanca, caixa?.identificador_balanca, setLoading, "Caixa reiniciada com sucesso!")
    );
};

// deletar caixa  
export const handleDeletarCaixaConfirmar = (caixa, setLoading, requestCaixas) => {
    showConfirmAlert(
        "ATENÇÃO",
        `Tem certeza que deseja excluir a caixa "${caixa?.observacao}"? Essa ação também removerá todos os pesos vinculados e não poderá ser desfeita.`,
        () => handleDeletarCaixa(ApiUrl.urlCaixa, caixa?.id, setLoading, "Caixa excluída com sucesso!", requestCaixas)
    );
};

// Função genérica para executar requests Axios
const handleDeletarCaixa = async (url, caixa_id, setLoading, mensagemSucesso, requestCaixas, delay = 0) => {
    try {
        setLoading(true);

        const response = await Api.delete(url, {
            params: { caixa_id },
            timeout: 5000,
        });

        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        Alert.alert(
            "SUCESSO",
            response.data?.retorno?.mensagem || mensagemSucesso || "Caixa excluída com sucesso!",
            [{ text: "Fechar", onPress: () => requestCaixas() }]
        );
    } catch (error) {
        console.log("Erro ao excluir caixa:", error);

        const msg = error.response?.data?.retorno?.mensagem || "Não foi possível excluir a caixa. Tente novamente.";

        Alert.alert("ATENÇÃO", msg, [
            { text: "Fechar", onPress: () => setLoading(false) }
        ]);
    }
};