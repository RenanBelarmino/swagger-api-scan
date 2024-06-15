const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const readline = require('readline');
const router = express.Router();
const version = "v1";
const tool = "dast";
const resultsPath = '/src/data/dast/results/'; // Caminho para salvar os resultados

// Funções para interagir com Zaproxy
const zapApiKey = process.env.ZAP_API_KEY;
const zapBaseUrl = process.env.ZAPROXY_URL;

// Certificar-se de que o diretório de resultados existe
if (!fs.existsSync(resultsPath)) {
    fs.mkdirSync(resultsPath, { recursive: true });
}

// Função para gerar um ID aleatório
function generateRandomId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Função para gerenciar arquivos na pasta de resultados
const manageResultFiles = () => {
    const files = fs.readdirSync(resultsPath).map(file => ({
        name: file,
        time: fs.statSync(path.join(resultsPath, file)).mtime.getTime()
    })).sort((a, b) => b.time - a.time);

    if (files.length > 10) {
        const filesToDelete = files.slice(10);
        filesToDelete.forEach(file => {
            fs.rmSync(path.join(resultsPath, file.name), { recursive: true, force: true });
        });
    }
};

// Função para salvar o resultado do scan
const saveScanResult = (scanId, resultData) => {
    const outputFileName = `${scanId}.json`;
    const outputPath = path.join(resultsPath, outputFileName);

    fs.writeFileSync(outputPath, JSON.stringify(resultData, null, 2));
    manageResultFiles();

    return scanId; // Retorna apenas o ID do resultado
};

// Funções relacionadas ao ZAP
async function removeScanAscan() {
    console.log("[CONSOLE] - Removendo Scan...");
    const url = `${zapBaseUrl}/JSON/ascan/action/removeAllScans/?apikey=${zapApiKey}`;

    try {
        const response = await axios.get(url, { headers: {}, data: {}, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        console.log("[CONSOLE] - Scan Removido");
    } catch (error) {
        console.error("[CONSOLE] - Erro ao remover scan", error.message);
    }
}

async function removeScanSpider() {
    console.log("[CONSOLE] - Removendo Scan...");
    const url = `${zapBaseUrl}/JSON/spider/action/removeAllScans/?apikey=${zapApiKey}`;

    try {
        const response = await axios.get(url, { headers: {}, data: {}, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        console.log("[CONSOLE] - Scan Removido");
    } catch (error) {
        console.error("[CONSOLE] - Erro ao remover scan", error.message);
    }
}

async function newSession() {
    console.log("[CONSOLE] - Limpando Sessão...");
    const url = `${zapBaseUrl}/JSON/core/action/newSession/?apikey=${zapApiKey}&name=&overwrite=`;

    try {
        const response = await axios.get(url, { headers: {}, data: {}, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        console.log("[CONSOLE] - Sessão Limpada");
    } catch (error) {
        console.error("[CONSOLE] - Erro ao limpar sessão", error.message);
    }
}

async function runSpider(url_scan_zap) {
    console.log("[CONSOLE] - Start no scan da aplicação... URL ", url_scan_zap);
    const url = `${zapBaseUrl}/JSON/spider/action/scan/?apikey=${zapApiKey}&url=${encodeURIComponent(url_scan_zap)}%2F&maxChildren=&recurse=&contextName=&subtreeOnly=`;

    try {
        const response = await axios.get(url, { headers: {}, data: {}, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        const scan_id = response.data.scan;
        console.log("[CONSOLE] - Scan Iniciado");
        return scan_id;
    } catch (error) {
        console.error("[CONSOLE] - Erro ao iniciar o Scan", error.message);
        return null;
    }
}

async function getStatusSpider(scan_id) {
    const url = `${zapBaseUrl}/JSON/spider/view/status/?apikey=${zapApiKey}&scanId=${scan_id}`;
    const httpsAgent = new (require('https')).Agent({ rejectUnauthorized: false });

    let status_scan = "0";
    while (status_scan !== "100") {
        try {
            const response = await axios.get(url, { headers: {}, data: {}, httpsAgent });
            status_scan = response.data.status;
            console.log("[CONSOLE] - SPIDER Scan Rodando", `${status_scan}%`);
            await new Promise(resolve => setTimeout(resolve, 20000));
        } catch (error) {
            console.error("[CONSOLE] - Erro ao obter status do Scan", error.message);
            return;
        }
    }
    console.log("[CONSOLE] - SPIDER Scan Terminado", `${status_scan}%`);
}

async function runAscan(url_scan_zap) {
    console.log("[CONSOLE] - Start no scan da aplicação... URL ", url_scan_zap);
    const regra = "scan";
    const url = `${zapBaseUrl}/JSON/ascan/action/scan/?apikey=${zapApiKey}&url=${encodeURIComponent(url_scan_zap)}%2F&recurse=&inScopeOnly=&method=&postData=&contextId=`;

    try {
        const response = await axios.get(url, { headers: {}, data: {}, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        const scan_id = response.data.scan;
        console.log("[CONSOLE] - Scan Iniciado");
        console.log(`ID ::: ${scan_id}`)
        return scan_id;
    } catch (error) {
        console.error("[CONSOLE] - Erro ao iniciar o Scan", error.message);
        return null;
    }
}

async function getStatusAscan(scan_id) {
    const url = `${zapBaseUrl}/JSON/ascan/view/status/?apikey=${zapApiKey}&scanId=${scan_id}`;
    const httpsAgent = new (require('https')).Agent({ rejectUnauthorized: false });

    let status_scan = "0";
    while (status_scan !== "100") {
        try {
            const response = await axios.get(url, { headers: {}, data: {}, httpsAgent });
            status_scan = response.data.status;
            console.log("[CONSOLE] - ASCAN Scan Rodando", `${status_scan}%`);
            
            await new Promise(resolve => setTimeout(resolve, 60000));
        } catch (error) {
            console.error("[CONSOLE] - Erro ao obter status do Scan", error.message);
            return;
        }
    }
    

console.log("[CONSOLE] - ASCAN Scan Terminado", `${status_scan}%`);
}

// Função para obter o relatório JSON do ZAP
async function getJsonReport() {
    const urlZap = `${zapBaseUrl}/OTHER/core/other/jsonreport/?apikey=${zapApiKey}`;

    try {
        const response = await axios.get(urlZap, { httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });

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

// Rota para iniciar SCAN DAST
/**
 * @swagger
 * /dast/v1/:
 *   post:
 *     summary: Iniciar SCAN DAST
 *     description: Endpoint para iniciar um SCAN DAST.
 *     tags:
 *       - DAST
 *     parameters:
 *       - in: query
 *         name: targetUrl
 *         schema:
 *           type: string
 *         required: true
 *         description: URL alvo para o scan
 *     responses:
 *       200:
 *         description: Scan Terminado
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post(`/${tool}/${version}`, async (req, res) => {
    const { targetUrl } = req.query;

    if (!targetUrl) {
        return res.status(400).json({ error: 'Parâmetro targetUrl é obrigatório' });
    }

    const scanId = generateRandomId();

    try {
        await removeScanAscan();

        const spiderScanId = await runSpider(targetUrl);
        if (spiderScanId) {
            await getStatusSpider(spiderScanId);

            const ascanId = await runAscan(targetUrl);
            if (ascanId) {
                await getStatusAscan(spiderScanId);


                // Obter o relatório JSON
                const report = await getJsonReport();

                // Salvar o resultado do scan
                const resultData = {
                    spiderScanId,
                    ascanId,
                    targetUrl,
                    scanId,
                    timestamp: new Date().toISOString(),
                    report
                };

                const scanResultId = saveScanResult(scanId, resultData);

                return res.status(200).json({ message: `Scan Terminado ID ::: ${scanResultId}` });
            } else {
                return res.status(500).json({ error: 'Erro ao iniciar o ASCAN' });
            }
        } else {
            return res.status(500).json({ error: 'Erro ao iniciar o SPIDER Scan' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;

