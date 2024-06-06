const express = require('express');
const multer = require('multer');
const axios = require('axios');
const router = express.Router();
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

// Configuração do Multer para upload de arquivos
const upload = multer({ dest: 'src/data/mobile/uploads/' });

// Variáveis de ambiente
const mobSfUrl = process.env.MOBSF_URL || 'http://localhost:8081/api/v1/upload';

/**
 * @swagger
 * /upload-apk:
 *   post:
 *     summary: Upload APK para MobSF
 *     description: Endpoint para realizar o upload de um arquivo APK para o MobSF.
 *     tags:
 *       - MOBILE
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: Valor da chave da API MobSF
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 app_hash:
 *                   type: string
 *       500:
 *         description: Erro interno do servidor
 */


/**
 * Função para adicionar o prefixo "Bearer" ao token da chave da API
 * @param {string} token Token da chave da API
 * @returns {string} Token com o prefixo "Bearer"
 */
function addBearer(token) {
    return `Bearer ${token}`;
  }

/**
 * Rota para realizar o upload de um arquivo APK para o MobSF
 */
router.post('/upload-apk', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        const response = await axios.post(mobSfUrl, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': req.header('Authorization'), // Obtém o token do cabeçalho da requisição
            },
        });

        const appHash = response.data.hash;
        console.log(`Upload do Aplicativo - ID do Aplicativo: ${appHash}`);

        // Salvar o app_hash em um arquivo JSON
        const result = { app_hash: appHash };
        fs.writeFileSync('src/data/mobile/uploads/app_hash.json', JSON.stringify(result, null, 2));

        // Deletar o arquivo temporário
        fs.unlinkSync(filePath);

        res.status(200).json({ message: 'Upload realizado com sucesso', app_hash: appHash });
    } catch (error) {
        console.error('Erro ao fazer upload do APK:', error.message);
        res.status(500).json({ error: 'Erro ao fazer upload do APK' });
    }
});

module.exports = router;
