const express = require('express');
const axios = require('axios');
const https = require('https');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const router = express.Router();
const app = express();
const version = "v1";
const tool = "dast";

// Funções para interagir com Zaproxy
const zapApiKey = process.env.ZAP_API_KEY;
const zapBaseUrl = process.env.ZAPROXY_URL;

console.log(`ZAP Base URL: ${zapBaseUrl}`);
console.log(`ZAP API Key: ${zapApiKey}`);

// Função para gerar o relatório
async function getJsonReport() {
  const urlZap = `${zapBaseUrl}/OTHER/core/other/jsonreport/?apikey=${zapApiKey}`;

  try {
    const response = await axios.get(urlZap, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });

    if (response.status === 200) {
      console.log("[CONSOLE] - GET Gerando Report do scan em formato JSON...");
      return response.data;
    } else {
      console.log("[CONSOLE] - Erro ao Baixar Arquivo");
      console.log(response.status);
      throw new Error('Erro ao Baixar Arquivo');
    }
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Rota para gerar o relatório
/**
 * @swagger
 * /dast/v1/report:
 *   get:
 *     summary: Gera um relatório do scan
 *     description: Endpoint para gerar e baixar um relatório do scan em formato JSON.
 *     tags:
 *       - DAST
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example: { "report": "Report Content" }
 *       500:
 *         description: Erro interno do servidor
 */
router.get(`/${tool}/${version}/report`, async (req, res) => {
  try {
    const report = await getJsonReport();
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;