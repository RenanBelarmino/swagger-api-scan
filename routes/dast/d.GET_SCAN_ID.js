const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Definindo o caminho absoluto diretamente
const OUTPUT_FOLDER = '/src/data/dast/results/';
const MAX_DISPLAY_SIZE = 1 * 1024 * 1024; // Limite de 1 MB para exibir conteúdo diretamente

/**
 * @swagger
 * tags:
 *   name: DAST
 *   description: APIs para acessar os resultados dos scans do DAST
 * 
 * /api/resultDAST/{id}:
 *   get:
 *     summary: Obtém os resultados de um scan pelo ID
 *     description: Retorna os resultados de um scan do DAST com base no ID gerado.
 *     tags: [DAST]
 *     security:
 *       - bearerAuth: []
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do scan gerado pelo DAST
 *         schema:
 *           type: string
 *       - in: query
 *         name: reportType
 *         required: true
 *         description: Tipo do relatório (html, md, xml, json)
 *         schema:
 *           type: string
 *           enum: [html, md, xml, json]
 *     responses:
 *       '200':
 *         description: Resultados do scan obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               format: binary
 *           text/html:
 *             schema:
 *               type: string
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       '404':
 *         description: Scan não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Erro ao obter os resultados do scan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get('/:id', (req, res) => {
    const id = req.params.id;
    const { reportType } = req.query;
    const validReportTypes = ['html', 'md', 'xml', 'json'];

    if (!reportType || !validReportTypes.includes(reportType)) {
        return res.status(400).json({ error: 'Tipo de relatório inválido. Tipos válidos são: html, md, xml, json.' });
    }

    const fileName = `${id}.${reportType}`;
    const filePath = path.join(OUTPUT_FOLDER, fileName);
    console.log(`[CONSOLE] - Tentando acessar o arquivo DAST em: ${filePath}`);

    // Verificar se o arquivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`Erro ao acessar o arquivo ${fileName}: ${err}`);
            return res.status(404).json({ error: 'Resultado não encontrado' });
        }

        // Verificar o tamanho do arquivo
        fs.stat(filePath, (statErr, stats) => {
            if (statErr) {
                console.error(`Erro ao obter estatísticas do arquivo ${fileName}: ${statErr}`);
                return res.status(500).json({ error: 'Erro ao obter estatísticas do arquivo' });
            }

            if (stats.size > MAX_DISPLAY_SIZE || reportType !== 'json') {
                // Forçar o download se o arquivo for maior que o limite definido ou se não for JSON
                const readStream = fs.createReadStream(filePath);
                res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
                
                switch (reportType) {
                    case 'html':
                        res.setHeader('Content-Type', 'text/html');
                        break;
                    case 'md':
                        res.setHeader('Content-Type', 'text/markdown');
                        break;
                    case 'xml':
                        res.setHeader('Content-Type', 'application/xml');
                        break;
                    case 'json':
                        res.setHeader('Content-Type', 'application/json');
                        break;
                }

                readStream.pipe(res);
            } else {
                // Enviar o conteúdo do arquivo como resposta JSON
                fs.readFile(filePath, 'utf8', (readErr, data) => {
                    if (readErr) {
                        console.error(`Erro ao ler o arquivo ${fileName}: ${readErr}`);
                        return res.status(500).json({ error: 'Erro ao ler o resultado' });
                    }
                    try {
                        const result = JSON.parse(data);
                        res.status(200).json(result);
                    } catch (parseErr) {
                        console.error(`Erro ao parsear o arquivo ${fileName}: ${parseErr}`);
                        res.status(500).json({ error: 'Erro ao processar o resultado' });
                    }
                });
            }
        });
    });
});

module.exports = router;
