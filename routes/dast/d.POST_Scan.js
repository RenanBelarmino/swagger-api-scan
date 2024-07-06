const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { concludeDASTScan } = require('../../src/services/concurrentScans'); // Importe a função de conclusão do scan DAST

// Caminho absoluto dentro do container para o volume shared_volume/dast/results/
const resultsPath = '/src/data/dast/results/';

if (!fs.existsSync(resultsPath)) {
    fs.mkdirSync(resultsPath, { recursive: true });
    console.log(`[CONSOLE] - Diretório ${resultsPath} criado.`);
} else {
    console.log(`[CONSOLE] - Diretório ${resultsPath} já existe.`);
}

function generateRandomId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const manageResultFiles = () => {
    console.log("[CONSOLE] - Gerenciando arquivos de resultados...");
    const files = fs.readdirSync(resultsPath).map(file => ({
        name: file,
        time: fs.statSync(path.join(resultsPath, file)).mtime.getTime()
    })).sort((a, b) => b.time - a.time);

    if (files.length > 10) {
        const filesToDelete = files.slice(10);
        filesToDelete.forEach(file => {
            fs.rmSync(path.join(resultsPath, file.name), { recursive: true, force: true });
            console.log(`[CONSOLE] - Arquivo ${file.name} removido.`);
        });
    } else {
        console.log("[CONSOLE] - Nenhum arquivo para remover.");
    }
};

let containerCounter = 1;

function runZapScan(targetUrl, reportType, outputFileName) {
    return new Promise((resolve, reject) => {
        let reportFlag;

        switch (reportType) {
            case 'html':
                reportFlag = `-r results/${outputFileName}`;
                break;
            case 'md':
                reportFlag = `-w results/${outputFileName}`;
                break;
            case 'xml':
                reportFlag = `-x results/${outputFileName}`;
                break;
            case 'json':
                reportFlag = `-J results/${outputFileName}`;
                break;
            default:
                return reject(new Error('Invalid report type specified'));
        }

        const containerName = `dast_${containerCounter}`;
        containerCounter++;

        const command = `docker run --rm -v $(pwd):/zap/wrk/:rw -v ${resultsPath}:/zap/wrk/results/:rw --name ${containerName} --user $(id -u):$(id -g) ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py -t ${targetUrl} ${reportFlag}`;
        console.log(`[CONSOLE] - Executando comando Docker: ${command}`);
        exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
            // if (error) {
            //     console.error(`[CONSOLE] - Erro ao executar o comando Docker: ${error.message}`);
            //     reject(error);
            // }

            if (fs.existsSync(path.join(resultsPath, outputFileName))) {
                console.log(`[CONSOLE] - Arquivo ${outputFileName} gerado com sucesso.`);
                resolve(outputFileName);
            } else {
                console.error(`[CONSOLE] - O arquivo ${outputFileName} não foi encontrado.`);
                reject(new Error('O scan não foi realizado com sucesso.'));
            }
        });
    });
}

// Função para garantir que a URL tenha o prefixo http ou https
function ensureHttpPrefix(url) {
    if (!/^https?:\/\//i.test(url)) {
        const alter_url = `http://${url}`
        console.log(`[CONSOLE] - TARGET SCAN: ${alter_url}`);
        return alter_url;
    }
    console.log(`[CONSOLE] - TARGET SCAN: ${url}`);
    return url;

}

// Rota para iniciar SCAN DAST
/**
 * @swagger
 * /api/dast/scan:
 *   post:
 *     summary: Iniciar SCAN DAST
 *     description: Endpoint para iniciar um SCAN DAST.
 *     tags:
 *       - DAST
 *     security:
 *       - bearerAuth: []
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: targetUrl
 *         schema:
 *           type: string
 *         required: true
 *         description: URL alvo para o scan
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [html, md, xml, json]
 *         required: true
 *         description: Tipo de relatório a ser gerado
 *     responses:
 *       200:
 *         description: Scan Terminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileId:
 *                   type: string
 *                   description: ID do arquivo gerado
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Descrição do erro
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Descrição do erro
 */
// Rota para iniciar SCAN DAST
router.post('/', async (req, res) => {
    let { targetUrl, reportType } = req.query;

    console.log(`[CONSOLE] - Requisição recebida para iniciar SCAN DAST. targetUrl: ${targetUrl}, reportType: ${reportType}`);

    if (!targetUrl) {
        console.error("[CONSOLE] - Parâmetro targetUrl é obrigatório.");
        return res.status(400).json({ error: 'Parâmetro targetUrl é obrigatório' });
    }

    if (!reportType || !['html', 'md', 'xml', 'json'].includes(reportType)) {
        console.error("[CONSOLE] - Parâmetro reportType é obrigatório e deve ser um dos seguintes: html, md, xml, json.");
        return res.status(400).json({ error: 'Parâmetro reportType é obrigatório e deve ser um dos seguintes: html, md, xml, json' });
    }

    targetUrl = ensureHttpPrefix(targetUrl);

    try {
        const scanId = generateRandomId();
        const outputFileName = `${scanId}.${reportType}`;

        console.log(`[CONSOLE] - ID do scan gerado: ${scanId}`);
        console.log(`[CONSOLE] - Caminho para salvar o resultado: ${path.join(resultsPath, outputFileName)}`);

        await runZapScan(targetUrl, reportType, outputFileName);

        // Concluir o scan DAST e resetar o contador de scans concorrentes
        concludeDASTScan(req.user.username);

        manageResultFiles();

        return res.status(200).json({ fileId: scanId });
    } catch (error) {
        // Concluir o scan DAST e resetar o contador de scans concorrentes
        concludeDASTScan(req.user.username);
        console.error(`[CONSOLE] - Erro ao executar o scan: ${error.message}`);
        return res.status(500).json({ error: 'Erro ao executar o scan DAST, Entre em contato com o Fornecedor' });
    }
});

module.exports = router;
