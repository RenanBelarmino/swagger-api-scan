const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');


// Defina o caminho absoluto para os resultados do SAST
const OUTPUT_FOLDER = '/src/data/sast/results/';
const MAX_DISPLAY_SIZE = 1 * 1024 * 1024; // Limite de 1 MB para exibir conteúdo diretamente


/**
 * @swagger
 * tags:
 *   name: SAST
 *   description: APIs para acessar os resultados dos scans do SAST
 * 
 * /api/resultSAST/{id}:
 *   get:
 *     summary: Obtém os resultados de um scan pelo ID
 *     description: Retorna os resultados de um scan do SAST com base no ID gerado.
 *     tags: [SAST]
 *     security:
 *       - bearerAuth: []
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do scan gerado pelo SAST
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Resultados do scan obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *                   description: Resultados do scan
 *       '404':
 *         description: Scan não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *       '500':
 *         description: Erro ao obter os resultados do scan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *     examples:
 *       curlExample:
 *         summary: Exemplo de chamada usando Curl
 *         value: |
 *           curl -X GET "http://localhost:3000/api/resultSAST/{id}"
 */


router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const fileName = `${id}.json`;
    const filePath = path.join(OUTPUT_FOLDER, fileName);
    console.log(`[CONSOLE] - Tentando acessar o arquivo SAST em: ${filePath}`);

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

            if (stats.size > MAX_DISPLAY_SIZE) {
                // Forçar o download se o arquivo for maior que o limite definido
                return res.status(200).json({ error: 'O resultado é muito grande para ser exibido diretamente. Faça o download do arquivo.' });
            }

            // Enviar o conteúdo do arquivo como resposta JSON
            fs.readFile(filePath, 'utf8', (readErr, data) => {
                if (readErr) {
                    console.error(`Erro ao ler o arquivo ${fileName}: ${readErr}`);
                    return res.status(500).json({ error: 'Erro ao ler o resultado' });
                }
                try {
                    const result = JSON.parse(data);
                    res.status(200).json({ result });
                } catch (parseErr) {
                    console.error(`Erro ao parsear o arquivo ${fileName}: ${parseErr}`);
                    res.status(500).json({ error: 'Erro ao processar o resultado' });
                }
            });
        });
    });
});

module.exports = router;
