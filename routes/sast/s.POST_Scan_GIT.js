const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
require('dotenv').config();

const UPLOAD_PATH = '/src/data/sast/uploads/';
const OUTPUT_FOLDER = '/src/data/sast/results/';

if (!fs.existsSync(UPLOAD_PATH)) {
    fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
}

function generateScanId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const manageUploadedFiles = () => {
    const files = fs.readdirSync(UPLOAD_PATH).map(file => ({
        name: file,
        time: fs.statSync(path.join(UPLOAD_PATH, file)).mtime.getTime()
    })).sort((a, b) => b.time - a.time);

    if (files.length > 10) {
        const filesToDelete = files.slice(10);
        filesToDelete.forEach(file => {
            fs.rmSync(path.join(UPLOAD_PATH, file.name), { recursive: true, force: true });
        });
    }
};

/**
 * @swagger
 * tags:
 *   name: SAST
 *   description: APIs relacionadas ao SAST
 * 
 * /api/sast/scan-git:
 *   post:
 *     summary: Inicia um scan no SAST a partir de um repositório Git
 *     description: Inicia um scan no SAST fornecendo a URL de um repositório Git para análise.
 *     tags: [SAST]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: repoUrl
 *         required: true
 *         schema:
 *           type: string
 *         description: URL do repositório Git
 *       - in: query
 *         name: branch
 *         required: false
 *         schema:
 *           type: string
 *         description: Nome da branch do repositório
 *       - in: query
 *         name: username
 *         required: false
 *         schema:
 *           type: string
 *         description: Nome de usuário para autenticação
 *       - in: query
 *         name: password
 *         required: false
 *         schema:
 *           type: string
 *         description: Senha para autenticação
 *     responses:
 *       '200':
 *         description: Scan iniciado com sucesso
 *       '400':
 *         description: Parâmetros inválidos
 *       '500':
 *         description: Falha ao iniciar o scan
 *     examples:
 *       curlExample:
 *         summary: Exemplo de chamada usando Curl
 *         value: |
 *           curl -X POST "http://localhost:3000/SAST/scan-git?repoUrl=https://github.com/user/repo{{#if branch}}&branch={{branch}}{{/if}}{{#if username}}&username={{username}}{{/if}}{{#if password}}&password={{password}}{{/if}}"
 */

router.post('/', async (req, res) => {
    const { repoUrl, branch, username, password } = req.query;

    if (!repoUrl) {
        return res.status(400).json({ error: 'URL do repositório é obrigatória' });
    }

    const repoName = path.basename(repoUrl, '.git');
    const clonePath = path.join(UPLOAD_PATH, repoName);
    const git = simpleGit();

    try {
        // Configuração de autenticação
        const options = [];
        if (username && password) {
            options.push(`--config core.askPass=${username}:${password}`);
        }

        // Clonar o repositório
        await git.clone(repoUrl, clonePath, ...options);

        // Mudar para a branch especificada (se fornecida)
        if (branch) {
            await git.cwd(clonePath).checkout(branch);
        }

        const scanId = generateScanId();
        const outputFileName = `${scanId}.json`;
        const outputPath = path.join(OUTPUT_FOLDER, outputFileName);

        const command = `horusec start -D true -p '${clonePath}' -o 'json' -O '${outputPath}'`;

        exec(command, (error, stdout, stderr) => {
            fs.rmSync(clonePath, { recursive: true, force: true });

            if (error) {
                console.error(`Erro ao iniciar o scan: ${error.message}`);
                return res.status(500).json({ error: 'Falha ao iniciar o scan SAST' });
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
            }
            console.log(`Stdout: ${stdout}`);

            res.status(200).json({ message: 'Scan Realizado com sucesso', scanId });
        });
    } catch (error) {
        console.error('Erro ao clonar ou iniciar o scan:', error);
        fs.rmSync(clonePath, { recursive: true, force: true });
        res.status(500).json({ error: 'Falha ao processar o repositório' });
    }
});

module.exports = router;
