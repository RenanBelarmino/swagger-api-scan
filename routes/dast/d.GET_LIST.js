const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Definindo o caminho absoluto diretamente
const OUTPUT_FOLDER = '/src/data/dast/results/';

/**
 * @swagger
 * tags:
 *   name: DAST
 *   description: APIs para acessar os resultados dos scans do DAST
 * 
 * /api/ListScans:
 *   get:
 *     summary: Lista os resultados disponíveis dos scans
 *     description: Retorna uma lista dos arquivos de resultados disponíveis com base no tipo de relatório.
 *     tags: [DAST]
 *     security:
 *       - bearerAuth: []
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: reportType
 *         required: true
 *         description: Tipo do relatório (html, md, xml, json)
 *         schema:
 *           type: string
 *           enum: [html, md, xml, json]
 *     responses:
 *       '200':
 *         description: Lista de resultados disponíveis obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   fileName:
 *                     type: string
 *                   creationDate:
 *                     type: string
 *                     format: date-time
 *       '400':
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Erro ao obter a lista de resultados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get('/', (req, res) => {
    const { reportType } = req.query;
    const validReportTypes = ['html', 'md', 'xml', 'json'];

    if (!reportType || !validReportTypes.includes(reportType)) {
        return res.status(400).json({ error: 'Tipo de relatório inválido. Tipos válidos são: html, md, xml, json.' });
    }

    fs.readdir(OUTPUT_FOLDER, (err, files) => {
        if (err) {
            console.error(`Erro ao listar arquivos no diretório ${OUTPUT_FOLDER}: ${err}`);
            return res.status(500).json({ error: 'Erro ao listar arquivos' });
        }

        const filteredFiles = files
            .filter(file => file.endsWith(`.${reportType}`))
            .map(file => {
                const filePath = path.join(OUTPUT_FOLDER, file);
                const stats = fs.statSync(filePath);
                return {
                    fileName: file,
                    creationDate: stats.mtime // Usando modification time
                };
            });

        res.status(200).json(filteredFiles);
    });
});

module.exports = router;
