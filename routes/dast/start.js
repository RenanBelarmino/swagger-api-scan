const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const router = express.Router();
const version = "v1";
const tool = "dast";
const resultsPath = './src/data/';

// Funções para interagir com Zaproxy
const zapApiKey = 'kzservices';
const zapBaseUrl = 'http://localhost:8080';

async function removeScanAscan() {
    console.log("[Zaproxy] - Removendo Scan...");
    const url = `${zapBaseUrl}/JSON/ascan/action/removeAllScans/?apikey=${zapApiKey}`;

    try {
        const response = await axios.get(url, { headers: {}, data: {}, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        console.log("[Zaproxy] - Scan Removido");
    } catch (error) {
        console.error("[Zaproxy] - Erro ao remover scan", error.message);
    }
}

async function removeScanSpider() {
    console.log("[Zaproxy] - Removendo Scan...");
    const url = `${zapBaseUrl}/JSON/spider/action/removeAllScans/?apikey=${zapApiKey}`;

    try {
        const response = await axios.get(url, { headers: {}, data: {}, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        console.log("[Zaproxy] - Scan Removido");
    } catch (error) {
        console.error("[Zaproxy] - Erro ao remover scan", error.message);
    }
}

async function newSession() {
    console.log("[Zaproxy] - Limpando Sessão...");
    const url = `${zapBaseUrl}/JSON/core/action/newSession/?apikey=${zapApiKey}&name=&overwrite=`;

    try {
        const response = await axios.get(url, { headers: {}, data: {}, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        console.log("[Zaproxy] - Sessão Limpada");
    } catch (error) {
        console.error("[Zaproxy] - Erro ao limpar sessão", error.message);
    }
}

async function runSpider(url_scan_zap) {
    console.log("[Zaproxy] - Start no scan da aplicação... URL ", url_scan_zap);
    const url = `${zapBaseUrl}/JSON/spider/action/scan/?apikey=${zapApiKey}&url=${encodeURIComponent(url_scan_zap)}%2F&maxChildren=&recurse=&contextName=&subtreeOnly=`;

    try {
        const response = await axios.get(url, { headers: {}, data: {}, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        const scan_id = response.data.scan;
        console.log("[Zaproxy] - Scan Iniciado");
        return scan_id;
    } catch (error) {
        console.error("[Zaproxy] - Erro ao iniciar o Scan", error.message);
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
            console.log("[Zaproxy] - SPIDER Scan Rodando", `${status_scan}%`);
            await new Promise(resolve => setTimeout(resolve, 60000));
        } catch (error) {
            console.error("[Zaproxy] - Erro ao obter status do Scan", error.message);
            return;
        }
    }
    console.log("[Zaproxy] - SPIDER Scan Terminado", `${status_scan}%`);
}

async function runAscan(url_scan_zap) {
    console.log("[Zaproxy] - Start no scan da aplicação... URL ", url_scan_zap);
    const regra = "scan";
    const url = `${zapBaseUrl}/JSON/ascan/action/scan/?apikey=${zapApiKey}&url=${encodeURIComponent(url_scan_zap)}%2F&recurse=&inScopeOnly=&method=&postData=&contextId=`;

    try {
        const response = await axios.get(url, { headers: {}, data: {}, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        const scan_id = response.data.scan;
        console.log("[Zaproxy] - Scan Iniciado");
        return scan_id;
    } catch (error) {
        console.error("[Zaproxy] - Erro ao iniciar o Scan", error.message);
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
            console.log("[Zaproxy] - ASCAN Scan Rodando", `${status_scan}%`);
            await new Promise(resolve => setTimeout(resolve, 30000));
        } catch (error) {
            console.error("[Zaproxy] - Erro ao obter status do Scan", error.message);
            return;
        }
    }
    console.log("[Zaproxy] - ASCAN Scan Terminado", `${status_scan}%`);
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetUrl:
 *                 type: string
 *                 description: URL alvo para o scan
 *     responses:
 *       200:
 *         description: Scan iniciado com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post(`/${tool}/${version}`, async (req, res) => {
    const { targetUrl } = req.body;

    if (!targetUrl) {
        return res.status(400).json({ error: 'Parâmetro targetUrl é obrigatório' });
    }

    try {
        await newSession();
        await removeScanSpider();
        await removeScanAscan();

        const spiderScanId = await runSpider(targetUrl);
        if (spiderScanId) {
            await getStatusSpider(spiderScanId);

            const ascanId = await runAscan(targetUrl);
            if (ascanId) {
                await getStatusAscan(ascanId);

                    return res.status(200).json({ message: 'Scan iniciado com sucesso', output: stdout });
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
