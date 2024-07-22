require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');

const server = express();
const port = process.env.PORT || 3000;
const { swaggerUi, specs } = require('./src/docs/swagger');
const { verifyToken } = require('./src/middleware/auth');
const { canStartConcurrentScan } = require('./src/services/concurrentScans');
const { hasPermission, isAdmin } = require('./src/services/userPermissions');

const loginRouter = require('./routes/users/login');
const createUser = require('./routes/users/createUser');
const listUser = require('./routes/users/ListUsers');

const sast_POST_ScanRouter = require('./routes/sast/s.POST_Scan');
const sast_POST_GIT_ScanRouter = require('./routes/sast/s.POST_Scan_GIT');
const resultSASTRouter = require('./routes/sast/s.GET_SCAN_ID');
const dast_POST_ScanRouter = require('./routes/dast/d.POST_Scan');
const dast_GET_ScanRouter = require('./routes/dast/d.GET_SCAN_ID');
const dast_GET_ListScans = require('./routes/dast/d.GET_LIST');

// Conectar ao MongoDB
connectDB();

// Middleware para processar JSON
server.use(express.json());

// Middleware para logging de requisições
server.use((req, res, next) => {
    console.log(`[INFO] - ${new Date().toLocaleString()}: ${req.method} ${req.url}`);
    next();
});

// Middleware de logging de erros
server.use((err, req, res, next) => {
    console.error(`[ERROR] - ${new Date().toLocaleString()}: ${err.stack}`);
    res.status(500).send('Something broke!');
});

// Middleware para Swagger
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware para verificar permissões
const verifyPermissions = (scanType) => async (req, res, next) => {
    const { login, id } = req.user;
    if (await hasPermission(login, scanType)) {
        next();
    } else {
        console.log(`[PERMISSION ERROR] - Usuário ${login} (ID: ${id}) não tem permissão para iniciar o scan ${scanType}`);
        res.status(403).send('Você não tem permissão para realizar esse scan.');
    }
};

// Middleware para controlar scans concorrentes
const concurrentScansMiddleware = (scanType) => async (req, res, next) => {
    const { login, id } = req.user;
    if (await canStartConcurrentScan(login, scanType)) {
        next();
    } else {
        console.log(`[CONCURRENT SCANS ERROR] - Usuário ${login} (ID: ${id}) atingiu o limite de scans concorrentes para o tipo ${scanType}`);
        res.status(403).send('Max concurrent scans limit reached');
    }
};

// Middleware para verificar permissão administrativa
const verifyAdmin = async (req, res, next) => {
    const { login, id } = req.user;
    if (await isAdmin(login)) {
        next();
    } else {
        console.log(`[ADMIN ERROR] - Usuário ${login} (ID: ${id}) não tem permissão administrativa`);
        res.status(403).send('Acesso negado. Permissão administrativa necessária.');
    }
};

// Configuração das rotas
server.use('/api', createUser);
server.use('/api/list-users', verifyToken, verifyAdmin, listUser);

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
    console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║ [INFO] - ${new Date().toLocaleString()}              ║
  ║                                                      ║
  ║   🚀 Servidor está funcionando na porta ${port}     ║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
    `);
});
