const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const tar = require('tar');
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');
const decompressBzip2 = require('decompress-bzip2');
const unrar = require('node-unrar-js');
require('dotenv').config();

const UPLOAD_PATH = '/src/data/sast/uploads/';
const OUTPUT_FOLDER = '/src/data/sast/results/';

if (!fs.existsSync(UPLOAD_PATH)) {
    fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

const unzipFile = (filePath, extractTo) => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(unzipper.Extract({ path: extractTo }))
            .on('close', resolve)
            .on('error', reject);
    });
};

const untarFile = (filePath, extractTo) => {
    return tar.x({
        file: filePath,
        cwd: extractTo
    });
};

const ungzipFile = (filePath, extractTo) => {
    return decompress(filePath, extractTo, {
        plugins: [decompressTargz()]
    });
};

const unrarFile = async (filePath, extractTo) => {
    throw new Error('Arquivos .rar não são suportados. Por favor, faça o upload de arquivos nos formatos suportados: .zip, .tar, .tar.gz, .tgz, .gz, .bz2.');
};

const unbzip2File = (filePath, extractTo) => {
    return decompress(filePath, extractTo, {
        plugins: [decompressBzip2()]
    });
};

function generateScanId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const manageUploadedFiles = () => {
    try {
        const files = fs.readdirSync(UPLOAD_PATH).map(file => ({
            name: file,
            time: fs.statSync(path.join(UPLOAD_PATH, file)).mtime.getTime()
        })).sort((a, b) => b.time - a.time);

        if (files.length > 10) {
            console.log(`[CONSOLE] - LIMPANDO BASE`);
            const filesToDelete = files.slice(10);
            filesToDelete.forEach(file => {
                fs.rmSync(path.join(UPLOAD_PATH, file.name), { recursive: true, force: true });
            });
        }
    } catch (error) {
        console.error('Erro ao gerenciar arquivos:', error);
    }
};

/**
 * @swagger
 * tags:
 *   name: SAST
 *   description: APIs relacionadas ao SAST
 * 
 * /api/sast/scan:
 *   post:
 *     summary: Inicia um scan no SAST
 *     description: Inicia um scan no SAST fornecendo o arquivo ou pasta para análise.
 *     tags: [SAST]
 *     security:
 *       - bearerAuth: []
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
 *                 description: Arquivo ou pasta a ser analisado
 *     responses:
 *       '200':
 *         description: Scan iniciado com sucesso
 *       '400':
 *         description: Parâmetros inválidos
 *       '500':
 *         description: Falha ao iniciar o scan
 */
router.post('/', upload.single('project'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'Arquivo do projeto é obrigatório' });
    }

    const projectPath = path.join(UPLOAD_PATH, file.filename);
    let extractPath = path.join(UPLOAD_PATH, path.basename(file.filename, path.extname(file.filename)));

    try {
        if (fs.lstatSync(projectPath).isFile()) {
            if (path.extname(file.originalname) === '.zip') {
                await unzipFile(projectPath, extractPath);
                fs.unlinkSync(projectPath);
            } else if (path.extname(file.originalname) === '.tar' || path.extname(file.originalname) === '.tar.gz' || path.extname(file.originalname) === '.tgz') {
                await untarFile(projectPath, extractPath);
                fs.unlinkSync(projectPath);
            } else if (path.extname(file.originalname) === '.gz') {
                await ungzipFile(projectPath, extractPath);
                fs.unlinkSync(projectPath);
            } else if (path.extname(file.originalname) === '.bz2') {
                await unbzip2File(projectPath, extractPath);
                fs.unlinkSync(projectPath);
            } else {
                const supportedFormats = ['.zip', '.tar', '.tar.gz', '.tgz', '.gz', '.bz2'];
                const supportedFormatsStr = supportedFormats.join(', ');
                return res.status(400).json({ 
                    error: `Formato de arquivo não suportado. O SAST suporta os seguintes formatos: ${supportedFormatsStr}` 
                });
            }
        } else if (fs.lstatSync(projectPath).isDirectory()) {
            extractPath = projectPath;
        }

        const scanPath = fs.lstatSync(extractPath).isDirectory() ? extractPath : projectPath;
        const scanId = generateScanId();

        const outputFileName = `${scanId}.json`;
        const outputPath = path.join(OUTPUT_FOLDER, outputFileName);

        const command = `horusec start -D true -p '${scanPath}' -o 'json' -O '${outputPath}'`;
        console.log(`[CONSOLE] - ID do Arquivo '${outputFileName}' `);
    
        exec(command, (error, stdout, stderr) => {
            fs.rmSync(scanPath, { recursive: true, force: true });

            if (error) {
                console.error(`Erro ao iniciar o scan: ${error.message}`);
                
                return res.status(500).json({ error: 'Falha ao iniciar o scan SAST' });
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
            }
            console.log(`Stdout: ${stdout}`);

            manageUploadedFiles();
            console.log(`[CONSOLE] - ID do Arquivo '${outputFileName}' `);

            res.status(200).json({ message: 'Scan Realizado com sucesso', scanId });
        });
    } catch (error) {
        console.error('Erro ao descompactar ou iniciar o scan:', error);
        fs.rmSync(scanPath, { recursive: true, force: true });
        res.status(500).json({ error: 'Falha ao processar o arquivo do projeto' });
    }
});

module.exports = router;
