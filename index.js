require('dotenv').config(); // Carregar variáveis de ambiente do arquivo .env
const express = require('express');
const connectDB = require('./src/config/db'); // Importe a função de conexão ao MongoDB

const server = express();
const port = process.env.PORT || 3000;
const { swaggerUi, specs } = require('./src/docs/swagger');
const { verifyToken } = require('./src/middleware/auth'); // Verifique se o caminho está correto
const { canStartConcurrentScan } = require('./src/services/concurrentScans'); // Importe a função de controle de scans concorrentes
const { hasPermission } = require('./src/services/userPermissions'); // Importe a função de verificação de permissões

const loginRouter = require('./routes/users/login');
const createUser = require('./routes/users/createUser'); // Importe as rotas de usuários
const listUser = require('./routes/users/ListUsers');

const sast_POST_ScanRouter = require('./routes/sast/s.POST_Scan');
const sast_POST_GIT_ScanRouter = require('./routes/sast/s.POST_Scan_GIT');
const resultSASTRouter = require('./routes/sast/s.GET_SCAN_ID');
const dast_POST_ScanRouter = require('./routes/dast/d.POST_Scan');
const dast_GET_ScanRouter = require('./routes/dast/d.GET_SCAN_ID');
const dast_GET_ListScans = require('./routes/dast/d.GET_LIST');

// Conectar ao MongoDB
connectDB();

// Middleware para processar JSON no corpo das requisições
server.use(express.json());

// Middleware para logging de requisições
server.use((req, res, next) => {
    console.log(`[INFO] - ${new Date().toLocaleString()}: ${req.method} ${req.url}`);
    next();
});

// Middleware de logging para capturar e registrar erros
server.use((err, req, res, next) => {
    console.error(`[ERROR] - ${new Date().toLocaleString()}: ${err.stack}`);
    res.status(500).send('Something broke!');
});

// Middleware para Swagger
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware para verificar permissões
const verifyPermissions = (scanType) => async (req, res, next) => {
    const username = req.user.username; // Supondo que req.user contenha o usuário autenticado
    if (await hasPermission(username, scanType)) {
        next();
    } else {
        console.log(`[PERMISSION ERROR] - Usuário ${username} não tem permissão para iniciar o scan ${scanType}`);
        res.status(403).send('Você não tem permissão para realizar esse scan.');
    }
};

// Middleware para verificar e controlar CONCURRENT_SCANS
const concurrentScansMiddleware = (scanType) => async (req, res, next) => {
    const username = req.user.username; // Supondo que req.user contenha o usuário autenticado
    if (await canStartConcurrentScan(username, scanType)) {
        next();
    } else {
        console.log(`[CONCURRENT SCANS ERROR] - Limite de scans concorrentes atingido para o tipo ${scanType}`);
        res.status(403).send('Max concurrent scans limit reached');
    }
};

// Configuração das rotas
server.use('/api', createUser); // Use as novas rotas na aplicação
server.use('/api/list-users', verifyToken, listUser);

// login
server.use('/api/login', loginRouter);

// sast
server.use('/api/sast/scan', verifyToken, verifyPermissions('sast'), concurrentScansMiddleware('sast'), sast_POST_ScanRouter);
server.use('/api/sast/scan-git', verifyToken, verifyPermissions('sast'), concurrentScansMiddleware('sast'), sast_POST_GIT_ScanRouter);
server.use('/api/resultSAST', verifyToken, verifyPermissions('sast'), resultSASTRouter);

// dast
server.use('/api/dast/scan', verifyToken, verifyPermissions('dast'), concurrentScansMiddleware('dast'), dast_POST_ScanRouter);
server.use('/api/resultDAST', verifyToken, verifyPermissions('dast'), dast_GET_ScanRouter);
server.use('/api/ListScans', verifyToken, verifyPermissions('dast'), dast_GET_ListScans);

server.listen(port, () => {
    console.log(`[INFO] - ${new Date().toLocaleString()}: Servidor está funcionando na porta ${port}`);
});
