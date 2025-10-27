import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import Api from "../../../api";
import ApiUrl from "../../../apiUrl";

// URL da sua API (ajuste conforme o seu backend)
const API_URL = ApiUrl.urlPesosCaixaRelatorio;

export const gerarRelatorioPesagem = async (caixa_id, data_inicial, data_final) => {
  try {
    const token = await AsyncStorage.getItem("@pesa_box_token");
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await Api.get(API_URL, { params: { caixa_id, data_inicial, data_final } });

    const dados = response.data?.registros || [];
    if (dados.length === 0) throw new Error("Nenhum registro encontrado.");

    // Gera o HTML a partir dos dados recebidos
    const html = gerarHtmlRelatorio(dados, data_inicial, data_final);

    // Cria o arquivo PDF e compartilha
    const { uri } = await Print.printToFileAsync({ html });
    await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });

  } catch (err) {
    console.log("Erro ao gerar relatório:", err.response.data);
    Alert.alert('ATENÇÃO', err.response.data.retorno.mensagem || "Erro ao gerar relatório", [{ text: 'fechar', onPress: null }]);
  }
};

// Função separada apenas para gerar o HTML do relatório
const gerarHtmlRelatorio = (dados, data_inicial, data_final) => {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const observacao = dados[0]?.observacao || "Sem observação";

  const totalRegistros = dados.length;
  const pesoMedio =
    dados.reduce((acc, item) => acc + parseFloat(item.peso_atual), 0) / totalRegistros;

  const linhasTabela = dados
    .map((item, index) => {
      const data = String(item.criado_em).substring(0, 10).split("-").reverse().join("/");
      return `
        <tr style="background-color:${index % 2 !== 0 ? "#f9f9f9" : "transparent"};">
          <td style="padding:6px 10px; text-align:left;">${String(index + 1).padStart(2, 0)}</td>
          <td style="padding:6px 10px; text-align:left;">${data}</td>
          <td style="padding:6px 10px; text-align:right;">${parseFloat(item.peso_atual).toFixed(2)}</td>
        </tr>`;
    })
    .join("");

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          font-family: Helvetica, Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        h1 {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 11px;
          color: #555;
          margin-bottom: 5px;
        }
        .observacao {
          font-size: 11px;
          color: #555;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5px;
          border: 1px solid #f2f2f2;
        }
        th {
          background: #f2f2f2;
          text-align: left;
          font-weight: bold;
          padding: 6px 10px;
        }
        td {
          border-top: 1px solid #f2f2f2;
        }
        .footer {
          text-align: right;
          font-size: 10px;
          color: #666;
          margin-top: 25px;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>RELATÓRIO DE PESAGEM</h1>
          <p class="subtitle">Período: ${formatarData(data_inicial)} a ${formatarData(data_final)} | Emitido em: ${hoje}</p>
          <p class="observacao">${observacao}</p>
        </div>
        <div>
          <img src="https://cdn-icons-png.flaticon.com/512/306/306688.png" style="width:45px;" />
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:20%;">Nº</th>
            <th style="width:40%;">DATA</th>
            <th style="width:40%; text-align:right;">PESO (g)</th>
          </tr>
        </thead>
        <tbody>${linhasTabela}</tbody>
      </table>

      <div class="footer">
        <p>Total de registros: ${totalRegistros} | Peso médio: ${pesoMedio.toFixed(2)}g</p>
        <p>Sistema de Pesagem | Relatório gerado automaticamente</p>
      </div>
    </body>
  </html>
  `;
};

// Helper para formatar data (aaaa-mm-dd → dd/mm/aaaa)
const formatarData = (data) => {
  if (!data) return "";
  return String(data).split("-").reverse().join("/");
};
