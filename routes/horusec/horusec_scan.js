const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
require('dotenv').config();

const UPLOAD_PATH = '/src/data/sast/uploads/'; // Caminho para os arquivos de upload dentro do contêiner
const OUTPUT_FOLDER = '/src/data/sast/results/'; // Pasta para os resultados do scan dentro do contêiner

// Certificar-se de que os diretórios de upload e resultados existem
if (!fs.existsSync(UPLOAD_PATH)) {
    fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
}

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Função para descompactar arquivos
const unzipFile = (filePath, extractTo) => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(unzipper.Extract({ path: extractTo }))
            .on('close', resolve)
            .on('error', reject);
    });
};

// Iniciar um scan no Horusec
/**
 * @swagger
 * tags:
 *   name: Horusec
 *   description: APIs relacionadas ao Horusec
 * 
 * /horusec/scan:
 *   post:
 *     summary: Inicia um scan no Horusec
 *     description: Inicia um scan no Horusec fornecendo o arquivo para análise.
 *     tags: [Horusec]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               project:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Scan iniciado com sucesso
 *       '400':
 *         description: Parâmetros inválidos
 *       '500':
 *         description: Falha ao iniciar o scan
 */
router.post('/horusec/scan', upload.single('project'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'Arquivo do projeto é obrigatório' });
    }

    const projectPath = path.join(UPLOAD_PATH, file.filename);
    const extractPath = path.join(UPLOAD_PATH, path.basename(file.filename, path.extname(file.filename)));

    try {
        if (path.extname(file.originalname) === '.zip') {
            await unzipFile(projectPath, extractPath);
            fs.unlinkSync(projectPath); // Remove o arquivo zip após descompactação
        }

        const scanPath = path.extname(file.originalname) === '.zip' ? extractPath : projectPath;
        const scanId = generateScanId();

        const outputFileName = `${scanId}.json`;
        const outputPath = path.join(OUTPUT_FOLDER, outputFileName);

        const command = `horusec start -D true -p '${scanPath}' -o 'json' -O '${outputPath}'`;

        exec(command, (error, stdout, stderr) => {
            // Remove os arquivos após o scan
            fs.rmSync(scanPath, { recursive: true, force: true });

            if (error) {
                console.error(`Erro ao iniciar o scan: ${error.message}`);
                return res.status(500).json({ error: 'Falha ao iniciar o scan no Horusec' });
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
            }
            console.log(`Stdout: ${stdout}`);

            res.status(200).json({ message: 'Scan iniciado com sucesso', scanId });
        });
    } catch (error) {
        console.error('Erro ao descompactar ou iniciar o scan:', error);
        fs.rmSync(scanPath, { recursive: true, force: true });
        res.status(500).json({ error: 'Falha ao processar o arquivo do projeto' });
    }
});

// Função para gerar um ID único para o scan
function generateScanId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

module.exports = router;
