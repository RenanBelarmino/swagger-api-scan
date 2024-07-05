const express = require('express');
const server = express();
const port = process.env.PORT || 3000;
const { swaggerUi, specs } = require('../src/docs/swagger');
const { verifyToken } = require('../src/middleware/auth'); // Verifique se o caminho está correto
const { canStartConcurrentScan } = require('../src/services/concurrentScans'); // Importe a função de controle de scans concorrentes
const { userPermissions } = require('../src/services/userPermissions'); // Importe a função de controle de scans concorrentes


const loginRouter = require('./login');
const sast_POST_ScanRouter = require('./sast/s.POST_Scan');
const sast_POST_GIT_ScanRouter = require('./sast/s.POST_Scan_GIT');
const resultSASTRouter = require('./sast/s.GET_SCAN_ID');
const dast_POST_ScanRouter = require('./dast/d.POST_Scan');
const dast_GET_ScanRouter = require('./dast/d.GET_SCAN_ID');
const dast_GET_ListScans = require('./dast/d.GET_LIST');

// Middleware para processar JSON no corpo das requisições
server.use(express.json());

server.use((req, res, next) => {
    console.log(`[INFO] - ${new Date().toLocaleString()}: ${req.method} ${req.url}`);
    next();
});

// Middleware de logging para capturar e registrar erros
server.use((err, req, res, next) => {
    console.error(`[ERROR] - ${new Date().toLocaleString()}: ${err.stack}`);
    res.status(500).send('Something broke!');
});

// Middleware de logging para capturar e registrar todas as requisições feitas à Swagger
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware para verificar e controlar CONCURRENT_SCANS
const concurrentScansMiddleware = (req, res, next) => {
    const username = req.user.username; // Supondo que `req.user` contenha o usuário autenticado
    if (canStartConcurrentScan(username)) {
        next();
    } else {
        console.log('Max concurrent scans limit reached')
        res.status(403).send('Max concurrent scans limit reached');
    }
};


//////////////////////////////////////////////////////////////////////////////
// Configuração das rotas
//login
server.use('/api/login', loginRouter);

//sast
server.use('/api/sast/scan', verifyToken, concurrentScansMiddleware, sast_POST_ScanRouter);
server.use('/api/sast/scan-git', verifyToken, concurrentScansMiddleware, sast_POST_GIT_ScanRouter);
server.use('/api/resultSAST', verifyToken, resultSASTRouter);

//dast
server.use('/api/dast/scan', verifyToken, concurrentScansMiddleware, dast_POST_ScanRouter);
server.use('/api/resultDAST', verifyToken, dast_GET_ScanRouter);
server.use('/api/ListScans', verifyToken, dast_GET_ListScans);


server.listen(port, () => {
    console.log(`[INFO] - ${new Date().toLocaleString()}: Servidor está funcionando na porta ${port}`);
});