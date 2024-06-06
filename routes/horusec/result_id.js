/**
 * @swagger
 * tags:
 *   name: Horusec
 *   description: APIs para acessar os resultados dos scans do Horusec
 * 
 * /result/{id}:
 *   get:
 *     summary: Obtém os resultados de um scan pelo ID
 *     description: Retorna os resultados de um scan do Horusec com base no ID gerado.
 *     tags: [Horusec]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do scan gerado pelo Horusec
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Resultados do scan obtidos com sucesso
 *       '404':
 *         description: Scan não encontrado
 *       '500':
 *         description: Erro ao obter os resultados do scan
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const OUTPUT_FOLDER = '/src/data/sast/results/';

router.get('/result/:id', (req, res) => {
    const id = req.params.id;
    const fileName = `${id}.json`;
    const filePath = path.join(OUTPUT_FOLDER, fileName);

    // Verificar se o arquivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`Erro ao acessar o arquivo ${fileName}: ${err}`);
            return res.status(404).json({ error: 'Resultado não encontrado' });
        }

        // Ler o conteúdo do arquivo e enviar como resposta
        fs.readFile(filePath, 'utf8', (readErr, data) => {
            if (readErr) {
                console.error(`Erro ao ler o arquivo ${fileName}: ${readErr}`);
                return res.status(500).json({ error: 'Erro ao ler o resultado' });
            }
            const result = JSON.parse(data);
            res.status(200).json(result);
        });
    });
});

module.exports = router;
